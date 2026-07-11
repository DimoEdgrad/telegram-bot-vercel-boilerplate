import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { about, start, help, links, creator, adminMenu } from './commands'; 
import { greeting } from './text';
import { development, production } from './core';

import { checkPermission, SUPER_ADMIN_ID, addAdmin, removeAdmin, getAdminsList, AdminRole } from './core/adminManager';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const bot = new Telegraf(BOT_TOKEN);

// ==================== دستورات متنی عمومی ====================
bot.command('start', start()); 
bot.command('help', help());
bot.command('links', links());
bot.command('creator', creator());

// ==================== بخش مدیریت ادمین‌ها ====================

bot.command('admin', async (ctx) => {
  if (checkPermission(ctx.from.id)) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
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

  const success = addAdmin(targetId, role, name);
  if (success) {
    await ctx.reply(`✅ کاربر ${name} با موفقیت به عنوان ادمین (${role}) اضافه شد.`);
  } else {
    await ctx.reply('❌ این کاربر از قبل ادمین است یا آیدی اشتباه است.');
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

  const success = addAdmin(targetId, role, targetName);
  if (success) {
    await ctx.reply(`✅ کاربر ${targetName} با آیدی عددی (${targetId}) با موفقیت به عنوان ادمین (${role}) اضافه شد.`);
  } else {
    await ctx.reply('❌ این کاربر از قبل ادمین است یا مشکلی پیش آمده است.');
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

  const success = removeAdmin(targetId);
  if (success) {
    await ctx.reply('✅ ادمین مورد نظر با موفقیت حذف شد.');
  } else {
    await ctx.reply('❌ ادمینی با این آیدی پیدا نشد.');
  }
});

bot.command('admins', async (ctx) => {
  if (Number(ctx.from.id) !== SUPER_ADMIN_ID) {
    return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  }
  await ctx.reply(getAdminsList());
});

// ==================== مدیریت اکشن دکمه‌های شیشه‌ای ====================

bot.action('btn_admin_menu', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from?.id || 0;
  if (checkPermission(userId)) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
  }
});

bot.action('btn_help', async (ctx) => {
  await ctx.answerCbQuery();
  await help()(ctx);
});

bot.action('btn_start', async (ctx) => {
  await ctx.answerCbQuery();
  await start()(ctx);
});

bot.action('btn_links', async (ctx) => {
  await ctx.answerCbQuery();
  await links()(ctx);
});

bot.action('btn_about', async (ctx) => {
  await ctx.answerCbQuery();
  await about()(ctx);
});

bot.action('btn_creator', async (ctx) => {
  await ctx.answerCbQuery();
  await creator()(ctx);
});

bot.action('btn_stats', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📈 آمار ربات: تعداد کاربران فعلاً در نسخه حافظه موقت در دسترس نیست.');
});

bot.action('btn_send_all', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📢 برای ارسال پیام همگانی، لطفاً طبق مستندات از دستور متنی آن استفاده کنید.');
});

bot.action('btn_list_admins', async (ctx) => {
  await ctx.answerCbQuery();
  if (Number(ctx.from?.id) === SUPER_ADMIN_ID) {
    await ctx.reply(getAdminsList());
  } else {
    await ctx.reply('❌ این بخش فقط مخصوص صاحب اصلی ربات است.');
  }
});

// ==================== مدیریت پیام‌های عادی ====================
bot.on('message', greeting());

// ==================== پیکربندی و اجرای سرورلس ====================

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

ENVIRONMENT !== 'production' && development(bot);
