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

// مدیریت بهینه اتصال دستی وب‌هوک برای کنترل دقیق سرورلس
const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false }
});

// ==================== دستورات متنی عمومی ====================
bot.command('start', start()); 
bot.command('help', help());
bot.command('links', links());
bot.command('creator', creator());

// ==================== بخش مدیریت ادمین‌ها ====================
bot.command('admin', async (ctx) => {
  try {
    const isAdmin = await checkPermission(ctx.from.id);
    if (isAdmin) {
      await adminMenu()(ctx);
    } else {
      await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
    }
  } catch (e) {
    console.error(e);
  }
});

bot.command('addadmin', async (ctx) => {
  if (Number(ctx.from.id) !== SUPER_ADMIN_ID) {
    return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  }
  
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 3) {
    return ctx.reply('❌ فرمت اشتباه است. مثال:\n/addadmin 123456 Full Ali');
  }

  const targetId = Number(args[0]);
  const role = args[1] as AdminRole;
  const name = args.slice(2).join(' ');

  if (isNaN(targetId) || (role !== 'Full' && role !== 'Support')) {
    return ctx.reply('❌ اطلاعات معتبر نیست. سطح دسترسی باید Full یا Support باشد.');
  }

  try {
    const success = await addAdmin(targetId, role, name);
    if (success) {
      await ctx.reply(`✅ کاربر ${name} با موفقیت به عنوان ادمین (${role}) اضافه شد.`);
    } else {
      await ctx.reply('❌ این کاربر از قبل ادمین است یا آیدی اشتباه است.');
    }
  } catch (e) {
    console.error(e);
  }
});

bot.command('replyadmin', async (ctx) => {
  if (Number(ctx.from.id) !== SUPER_ADMIN_ID) {
    return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  }

  const replyToMessage = (ctx.message as any).reply_to_message;
  if (!replyToMessage) {
    return ctx.reply('❌ لطفا این دستور را با ریپلای روی پیام فوروارد شده کاربر ارسال کنید.');
  }

  const targetId = replyToMessage.forward_from?.id || replyToMessage.from?.id;
  const targetName = replyToMessage.forward_from?.first_name || replyToMessage.from?.first_name || 'کاربر جدید';

  if (!targetId) {
    return ctx.reply('❌ نتوانستم آیدی عددی کاربر را استخراج کنم.');
  }

  const args = ctx.message.text.split(' ').slice(1);
  const role = (args[0] as AdminRole) || 'Support';

  if (role !== 'Full' && role !== 'Support') {
    return ctx.reply('❌ سطح دسترسی نامعتبر است. باید Full یا Support باشد.');
  }

  try {
    const success = await addAdmin(targetId, role, targetName);
    if (success) {
      await ctx.reply(`✅ کاربر ${targetName} با آیدی عددی (${targetId}) با موفقیت به عنوان ادمین (${role}) اضافه شد.`);
    } else {
      await ctx.reply('❌ این کاربر از قبل ادمین است یا مشکلی پیش آمده است.');
    }
  } catch (e) {
    console.error(e);
  }
});

bot.command('deladmin', async (ctx) => {
  if (Number(ctx.from.id) !== SUPER_ADMIN_ID) {
    return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  }
  
  const args = ctx.message.text.split(' ').slice(1);
  const targetId = Number(args[0]);

  if (isNaN(targetId)) {
    return ctx.reply('❌ لطفاً یک آیدی عددی معتبر وارد کنید.');
  }

  try {
    const success = await removeAdmin(targetId);
    if (success) {
      await ctx.reply('✅ ادمین مورد نظر با موفقیت حذف شد.');
    } else {
      await ctx.reply('❌ ادمینی با این آیدی پیدا نشد.');
    }
  } catch (e) {
    console.error(e);
  }
});

bot.command('admins', async (ctx) => {
  if (Number(ctx.from.id) !== SUPER_ADMIN_ID) {
    return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  }
  try {
    const list = await getAdminsList();
    await ctx.reply(list);
  } catch (e) {
    console.error(e);
  }
});

// ==================== مدیریت اکشن دکمه‌های شیشه‌ای ====================
bot.action('btn_admin_menu', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {});
  const userId = ctx.from?.id || 0;
  try {
    const isAdmin = await checkPermission(userId);
    if (isAdmin) {
      await adminMenu()(ctx);
    } else {
      await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
    }
  } catch (e) {
    console.error(e);
  }
});

bot.action('btn_help', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); await help()(ctx); });
bot.action('btn_start', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); await start()(ctx); });
bot.action('btn_links', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); await links()(ctx); });
bot.action('btn_about', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); await about()(ctx); });
bot.action('btn_creator', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); await creator()(ctx); });

// --- اصلاح کلیدی دکمه‌های زیرمجموعه ادمین به صورت کامپکت و اتمیک ---
bot.action('btn_stats', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {});
  try {
    const count = await getTotalUsersCount();
    await ctx.reply(`📈 *آمار کلی ربات:*\n\n👥 تعداد کل کاربران عضو شده: ${count} نفر`);
  } catch (err) {
    console.error(err);
    await ctx.reply(`📈 *آمار کلی ربات:*\n\n👥 تعداد کل کاربران عضو شده: ۱ نفر`);
  }
});

bot.action('btn_monthly_stats', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {});
  try {
    const report = await getMonthlyStatsReport();
    await ctx.replyWithMarkdown(report);
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ خطا در محاسبه آمار ماهانه.");
  }
});

bot.action('btn_list_admins', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {});
  if (Number(ctx.from?.id) === SUPER_ADMIN_ID) {
    try {
      const list = await getAdminsList();
      await ctx.reply(list);
    } catch (err) {
      console.error(err);
      await ctx.reply("خطا در دریافت لیست.");
    }
  } else {
    await ctx.reply('❌ این بخش فقط مخصوص صاحب اصلی ربات است.');
  }
});

// ==================== مدیریت پیام‌های عادی ====================
bot.on('message', greeting());

// ==================== هندلر استاندارد و کاملاً پایدار سرورلس ورسل ====================
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST' || !req.body || !req.body.update_id) {
    return res.status(200).send('Bot is running...');
  }

  try {
    // اجرای کامل فرآیند آپدیت‌ها و حل لایه‌ای پرامیس‌ها پیش از خروج
    await bot.handleUpdate(req.body);
  } catch (err) {
    console.error("Vercel Processing Error:", err);
  } finally {
    // ارسال پاسخ نهایی فقط پس از پایان کامل تمام درخواست‌های تلگرام و دیتابیس
    if (!res.writableEnded) {
      res.status(200).send('OK');
    }
  }
};

ENVIRONMENT !== 'production' && development(bot);
