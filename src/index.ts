import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { about, start, help, links, creator, adminMenu } from './commands'; 
import { greeting } from './text';
import { development, production } from './core';

// وارد کردن سیستم مدیریت ادمین و متغیرها
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

// باز کردن منوی ادمین با دستور متنی (مشترک برای همه ادمین‌ها)
bot.command('admin', async (ctx) => {
  if (checkPermission(ctx.from.id)) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
  }
});

// اضافه کردن ادمین جدید (فقط صاحب اصلی ربات)
bot.command('addadmin', async (ctx) => {
  if (ctx.from.id !== SUPER_ADMIN_ID) {
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

// حذف ادمین (فقط صاحب اصلی ربات)
bot.command('deladmin', async (ctx) => {
  if (ctx.from.id !== SUPER_ADMIN_ID) {
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

// مشاهده لیست ادمین‌ها با دستور متنی (فقط صاحب اصلی ربات)
bot.command('admins', async (ctx) => {
  if (ctx.from.id !== SUPER_ADMIN_ID) {
    return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  }
  await ctx.reply(getAdminsList());
});

// ==================== مدیریت اکشن دکمه‌های شیشه‌ای ====================

// کلیک روی دکمه ورود به پنل ادمین از صفحه استارت
bot.action('btn_admin_menu', async (ctx) => {
  await ctx.answerCbQuery();
  if (checkPermission(ctx.from?.id || 0)) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
  }
});

// کلیک روی دکمه راهنما از صفحه استارت
bot.action('btn_help', async (ctx) => {
  await ctx.answerCbQuery();
  await help()(ctx);
});

// کلیک روی دکمه شروع مجدد از صفحه راهنما
bot.action('btn_start', async (ctx) => {
  await ctx.answerCbQuery();
  await start()(ctx);
});

// کلیک روی دکمه لینک‌ها از صفحه راهنما
bot.action('btn_links', async (ctx) => {
  await ctx.answerCbQuery();
  await links()(ctx);
});

// کلیک روی دکمه درباره ما از صفحه لینک‌ها
bot.action('btn_about', async (ctx) => {
  await ctx.answerCbQuery();
  await about()(ctx);
});

// کلیک روی دکمه ارتباط با سازنده از صفحه لینک‌ها
bot.action('btn_creator', async (ctx) => {
  await ctx.answerCbQuery();
  await creator()(ctx);
});

// کلیک روی دکمه آمار ربات در پنل مدیریت
bot.action('btn_stats', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📈 آمار ربات: تعداد کاربران فعلاً در نسخه حافظه موقت در دسترس نیست.');
});

// کلیک روی دکمه ارسال همگانی در پنل مدیریت
bot.action('btn_send_all', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📢 برای ارسال پیام همگانی، لطفاً طبق مستندات از دستور متنی آن استفاده کنید.');
});

// کلیک روی دکمه لیست ادمین‌ها در پنل مدیریت
bot.action('btn_list_admins', async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.from?.id === SUPER_ADMIN_ID) {
    await ctx.reply(getAdminsList());
  } else {
    await ctx.reply('❌ این بخش فقط مخصوص صاحب اصلی ربات است.');
  }
});

// ==================== مدیریت پیام‌های عادی ====================
bot.on('message', greeting());

// ==================== پیکربندی و اجرای سرورلس ====================

// حالت پروداکشن برای Vercel
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// حالت لوکال برای توسعه (Development)
ENVIRONMENT !== 'production' && development(bot);
