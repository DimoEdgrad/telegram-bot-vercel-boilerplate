import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { about, start, help, links, creator, adminMenu } from './commands'; 
import { greeting } from './text';
import { development } from './core';
import { checkPermission, SUPER_ADMIN_ID, addAdmin, AdminRole, getTotalUsersCount } from './core/adminManager';

const BOT_TOKEN = '252430934:AAFM9aXSCop4DZd8fMjcX85rNLFAlEAJp6c';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN, { telegram: { webhookReply: false } });

let filteredWords: string[] = []; 
let groupLocks: { [chatId: number]: { links: boolean; usernames: boolean } } = {};
let userWarns: { [chatId: number]: { [userId: number]: number } } = {};

async function hasModerationPermission(userId: number): Promise<boolean> {
  if (Number(userId) === SUPER_ADMIN_ID) return true;
  try { return await checkPermission(userId); } catch { return false; }
}

bot.command('start', start()); 
bot.command('help', help());

bot.command('warn', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return ctx.reply('❌ دسترسی ندارید.');
  const replyTo = ctx.message.reply_to_message;
  if (!replyTo || !('from' in replyTo) || !replyTo.from) return ctx.reply('❌ روی پیام کاربر ریپلای کنید.');

  const chatId = ctx.chat.id;
  const targetId = replyTo.from.id;
  const targetName = replyTo.from.first_name;

  if (!userWarns[chatId]) userWarns[chatId] = {};
  userWarns[chatId][targetId] = (userWarns[chatId][targetId] || 0) + 1;

  if (userWarns[chatId][targetId] >= 3) {
    userWarns[chatId][targetId] = 0;
    try {
      await ctx.restrictChatMember(targetId, { permissions: { can_send_messages: false } });
      await ctx.reply(`🚫 کاربر ${targetName} به دلیل ۳ اخطار، Mute شد.`);
    } catch { await ctx.reply(`❌ خطا در محدودسازی.`); }
  } else {
    await ctx.reply(`⚠️ کاربر ${targetName} اخطار گرفت (${userWarns[chatId][targetId]}/3).`);
  }
});

bot.command('ban', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return;
  const replyTo = ctx.message.reply_to_message;
  if (replyTo && 'from' in replyTo && replyTo.from) {
    try { await ctx.banChatMember(replyTo.from.id); ctx.reply(`👤 ${replyTo.from.first_name} بن شد.`); } catch {}
  }
});

bot.command('mute', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return;
  const replyTo = ctx.message.reply_to_message;
  if (replyTo && 'from' in replyTo && replyTo.from) {
    try { await ctx.restrictChatMember(replyTo.from.id, { permissions: { can_send_messages: false } }); ctx.reply(`🔇 ${replyTo.from.first_name} سکوت شد.`); } catch {}
  }
});

bot.command('unban', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return;
  const replyTo = ctx.message.reply_to_message;
  if (replyTo && 'from' in replyTo && replyTo.from) {
    try { 
      await ctx.unbanChatMember(replyTo.from.id);
      await ctx.restrictChatMember(replyTo.from.id, { permissions: { can_send_messages: true } });
      ctx.reply(`✅ ${replyTo.from.first_name} آزاد شد.`); 
    } catch {}
  }
});

bot.command('lock', async (ctx) => {
  if (!(await hasModerationPermission(ctx.from.id))) return;
  const type = ctx.message.text.split(' ')[1];
  if (!groupLocks[ctx.chat.id]) groupLocks[ctx.chat.id] = { links: false, usernames: false };
  if (type === 'link') { groupLocks[ctx.chat.id].links = true; ctx.reply('🔒 قفل لینک فعال شد.'); }
  else if (type === 'id') { groupLocks[ctx.chat.id].usernames = true; ctx.reply('🔒 قفل آیدی فعال شد.'); }
});

bot.on('message', async (ctx, next) => {
  const msg = ctx.message as any;
  const chatId = ctx.chat.id;
  const isAdmin = await hasModerationPermission(ctx.from.id);

  if (ctx.chat.type !== 'private' && !isAdmin && msg.text) {
    const locks = groupLocks[chatId];
    if (locks) {
      if ((locks.links && /https?:\/\/[^\s]+/i.test(msg.text)) || 
          (locks.usernames && /@[a-zA-Z0-9_]+/i.test(msg.text))) {
        try { await ctx.deleteMessage(); return; } catch {}
      }
    }
  }
  return greeting()(ctx);
});

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST' || !req.body) return res.status(200).send('Bot is running...');
  try { await bot.handleUpdate(req.body); } catch {}
  res.status(200).send('OK');
};

ENVIRONMENT !== 'production' && development(bot);
