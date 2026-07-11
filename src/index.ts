import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { about, start, help, links, creator, adminMenu } from './commands'; 
import { greeting } from './text';
import { development, production } from './core';

import { 
  checkPermission, 
  SUPER_ADMIN_ID, 
  addAdmin, 
  removeAdmin, 
  getAdminsList, 
  AdminRole, 
  getTotalUsersCount, 
  getMonthlyStatsReport 
} from './core/adminManager';

// توکن اختصاصی شما
const BOT_TOKEN = '252430934:AAFM9aXSCop4DZd8fMjcX85rNLFAlEAJp6c';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false }
});

// --- حافظه موقت (در فازهای بعدی به Upstash Redis متصل می‌شود) ---
let filteredWords: string[] = []; 
let groupLocks: { [chatId: number]: { links: boolean; usernames: boolean } } = {};
let userWarns: { [chatId: number]: { [userId: number]: number } } = {};

// تابع کمکی بررسی دسترسی نظارت ادمین‌ها
async function hasModerationPermission(userId: number): Promise<boolean> {
  if (Number(userId) === SUPER_ADMIN_ID) return true;
  try {
    return await checkPermission(userId);
  } catch {
    return false;
  }
}

// ==================== دستورات متنی عمومی ====================
bot.command('start', start()); 
bot.command('help', help());
bot.command('links', links());
bot.command('creator', creator());

// ==================== فاز ۱: سیستم قفل‌ها و اخطار گروه ====================

// ۱. قفل کردن لینک‌ها و آیدی‌ها
bot.command('lock', async (ctx) => {
  const userId = ctx.from.id;
  if (!(await hasModerationPermission(userId))) return ctx.reply('❌ شما دسترسی نظارتی ندارید.');
  if (ctx.chat.type === 'private') return ctx.reply('❌ این دستور فقط در گروه کاربرد دارد.');

  const type = ctx.message.text.split(' ')[1];
  if (!groupLocks[ctx.chat.id]) groupLocks[ctx.chat.id] = { links: false, usernames: false };

  if (type === 'link') {
    groupLocks[ctx.chat.id].links = true;
    return ctx.reply('🔒 قفل ارسال لینک (تبلیغات) در این گروه فعال شد.');
  } else if (type === 'id') {
    groupLocks[ctx.chat.id].usernames = true;
    return ctx.reply('🔒 قفل ارسال آیدی (@) در این گروه فعال شد.');
  } else {
    return ctx.reply('❌ فرمت اشتباه! مثال:\n`/lock link` یا `/lock id`');
  }
});

// ۲. باز کردن قفل‌ها
bot.command('unlock', async (ctx) => {
  const userId = ctx.from.id;
  if (!(await hasModerationPermission(userId))) return ctx.reply('❌ شما دسترسی نظارتی ندارید.');
  if (ctx.chat.type === 'private') return ctx.reply('❌ این دستور فقط در گروه کاربرد دارد.');

  const type = ctx.message.text.split(' ')[1];
  if (!groupLocks[ctx.chat.id]) groupLocks[ctx.chat.id] = { links: false, usernames: false };

  if (type === 'link') {
    groupLocks[ctx.chat.id].links = false;
    return ctx.reply('🔓 قفل ارسال لینک غیرفعال شد.');
  } else if (type === 'id') {
    groupLocks[ctx.chat.id].usernames = false;
    return ctx.reply('🔓 قفل ارسال آیدی غیرفعال شد.');
  } else {
    return ctx.reply('❌ فرمت اشتباه! مثال:\n`/unlock link`');
  }
});

// ۳. دستور اخطار (Warn) - ریپلای روی کاربر
bot.command('warn', async (ctx) => {
  const adminId = ctx.from.id;
  if (!(await hasModerationPermission(adminId))) return ctx.reply('❌ شما دسترسی نظارتی ندارید.');
  
  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return ctx.reply('❌ روی پیام کاربر مورد نظر ریپلای کنید.');

  const chatId = ctx.chat.id;
  const targetId = replyTo.from.id;
  const targetName = replyTo.from.first_name;

  if (!userWarns[chatId]) userWarns[chatId] = {};
  if (!userWarns[chatId][targetId]) userWarns[chatId][targetId] = 0;

  userWarns[chatId][targetId]++;

  if (userWarns[chatId][targetId] >= 3) {
    userWarns[chatId][targetId] = 0; // ریست اخطارها
    try {
      await ctx.restrictChatMember(targetId, { permissions: { can_send_messages: false } });
      await ctx.reply(`🚫 کاربر ${targetName} به دلیل دریافت ۳ اخطار، حالت سکوت (Mute) شد.`);
    } catch {
      await ctx.reply(`❌ اخطارهای کاربر به ۳ رسید اما ربات دسترسی محدودسازی نداشت.`);
    }
  } else {
    await ctx.reply(`⚠️ کاربر ${targetName} یک اخطار دریافت کرد.\nتعداد اخطارها: ${userWarns[chatId][targetId]}/3`);
  }
});

// ۴. حذف اخطار (Unwarn)
bot.command('unwarn', async (ctx) => {
  const adminId = ctx.from.id;
  if (!(await hasModerationPermission(adminId))) return ctx.reply('❌ شما دسترسی نظارتی ندارید.');
  
  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return ctx.reply('❌ روی پیام کاربر مورد نظر ریپلای کنید.');

  const chatId = ctx.chat.id;
  const targetId = replyTo.from.id;

  if (userWarns[chatId] && userWarns[chatId][targetId] && userWarns[chatId][targetId] > 0) {
    userWarns[chatId][targetId]--;
    await ctx.reply(`✅ یک اخطار از کاربر ${replyTo.from.first_name} کم شد.\nاخطارهای فعلی: ${userWarns[chatId][targetId]}/3`);
  } else {
    await ctx.reply('👤 این کاربر هیچ اخطاری ندارد.');
  }
});

// ۵. دستورات بن و سکوت پایه
bot.command('ban', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return ctx.reply('❌ دسترسی ندارید.');
  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return ctx.reply('❌ روی پیام کاربر ریپلای کنید.');
  try { await ctx.banChatMember(replyTo.from.id); ctx.reply(`👤 بن شد: ${replyTo.from.first_name}`); } catch { ctx.reply('❌ خطا در بن کردن.'); }
});

bot.command('mute', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return ctx.reply('❌ دسترسی ندارید.');
  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return ctx.reply('❌ روی پیام کاربر ریپلای کنید.');
  try { await ctx.restrictChatMember(replyTo.from.id, { permissions: { can_send_messages: false } }); ctx.reply(`🔇 سکوت شد: ${replyTo.from.first_name}`); } catch { ctx.reply('❌ خطا.'); }
});

bot.command('unban', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return ctx.reply('❌ دسترسی ندارید.');
  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return ctx.reply('❌ روی پیام کاربر ریپلای کنید.');
  try {
    await ctx.unbanChatMember(replyTo.from.id);
    await ctx.restrictChatMember(replyTo.from.id, { permissions: { can_send_messages: true, can_send_audios: true, can_send_documents: true, can_send_photos: true, can_send_videos: true } });
    ctx.reply(`✅ محدودیت لغو شد: ${replyTo.from.first_name}`);
  } catch { ctx.reply('❌ خطا.'); }
});

bot.command('filter', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return ctx.reply('❌ دسترسی ندارید.');
  const word = ctx.message.text.split(' ').slice(1).join(' ');
  if (!word) return ctx.reply('❌ کلمه را وارد کنید.');
  if (!filteredWords.includes(word)) { filteredWords.push(word); ctx.reply(`✅ فیلتر شد: ${word}`); }
});

// ==================== بخش مدیریت ادمین‌ها ====================
bot.command('admin', async (ctx) => {
  try {
    if (await checkPermission(ctx.from.id)) await adminMenu()(ctx);
    else await ctx.reply('❌ دسترسی ندارید.');
  } catch (e) { console.error(e); }
});

bot.command('addadmin', async (ctx) => {
  if (Number(ctx.from.id) !== SUPER_ADMIN_ID) return ctx.reply('❌ مخصوص صاحب ربات.');
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 3) return ctx.reply('❌ فرمت: /addadmin ID Role Name');
  try {
    const success = await addAdmin(Number(args[0]), args[1] as AdminRole, args.slice(2).join(' '));
    ctx.reply(success ? '✅ ادمین اضافه شد.' : '❌ خطا.');
  } catch (e) { console.error(e); }
});

// ==================== اکشن دکمه‌ها ====================
bot.action('btn_help', async (ctx: any) => { ctx.answerCbQuery().catch(() => {}); await help()(ctx); });
bot.action('btn_start', async (ctx: any) => { ctx.answerCbQuery().catch(() => {}); await start()(ctx); });
bot.action('btn_links', async (ctx: any) => { ctx.answerCbQuery().catch(() => {}); await links()(ctx); });
bot.action('btn_about', async (ctx: any) => { ctx.answerCbQuery().catch(() => {}); await about()(ctx); });
bot.action('btn_creator', async (ctx: any) => { ctx.answerCbQuery().catch(() => {}); await creator()(ctx); });

bot.action('btn_stats', async (ctx: any) => {
  ctx.answerCbQuery().catch(() => {});
  try { const count = await getTotalUsersCount(); await ctx.reply(`👥 تعداد کل کاربران: ${count}`); } catch { await ctx.reply(`👥 تعداد کل کاربران: ۱ نفر`); }
});

// ==================== مانیتورینگ پیام‌ها و اعمال قفل‌ها ====================
bot.on('message', async (ctx, next) => {
  const messageText = (ctx.message as any).text || '';
  const chatId = ctx.chat.id;

  // اگر چت خصوصی نیست، قفل‌ها بررسی شوند
  if (ctx.chat.type !== 'private') {
    const locks = groupLocks[chatId];
    const isAdmin = await hasModerationPermission(ctx.from.id);

    // ادمین‌ها از قوانین قفل مستثنی هستند
    if (!isAdmin && locks) {
      const hasLink = /https?:\/\/[^\s]+/i.test(messageText) || /www\.[^\s]+/i.test(messageText);
      const hasUsername = /@[a-zA-Z0-9_]+/i.test(messageText);

      if ((locks.links && hasLink) || (locks.usernames && hasUsername)) {
        try { await ctx.deleteMessage(); return; } catch (err) { console.error(err); }
      }
    }

    // فیلتر کلمات کماکان برقرار است
    if (filteredWords.some(word => messageText.includes(word)) && !isAdmin) {
      try { await ctx.deleteMessage(); return; } catch (err) { console.error(err); }
    }
  }
  
  return greeting()(ctx);
});

// ==================== هندلر ورسل ====================
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST' || !req.body || !req.body.update_id) return res.status(200).send('Bot is running...');
  try { await bot.handleUpdate(req.body); } catch (err) { console.error(err); }
  finally { if (!res.writableEnded) res.status(200).send('OK'); }
};

ENVIRONMENT !== 'production' && development(bot);
