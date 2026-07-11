import { Telegraf } from 'telegraf';
import { about, start, help, links, creator, adminMenu } from './commands'; 
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

// وارد کردن سیستم مدیریت ادمین
import { checkPermission, SUPER_ADMIN_ID, addAdmin, removeAdmin, getAdminsList, AdminRole } from './core/adminManager';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const bot = new Telegraf(BOT_TOKEN);

// دستورات عمومی
bot.command('start', start()); 
bot.command('help', help());
bot.command('links', links());
bot.command('creator', creator());

// منوی ادمین (همه ادمین‌ها دسترسی دارند)
bot.command('admin', async (ctx) => {
  if (checkPermission(ctx.from.id)) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
  }
});

// دکمه شیشه‌ای منوی ادمین در صفحه استارت
bot.action('btn_admin_menu', async (ctx) => {
  await ctx.answerCbQuery();
  if (checkPermission(ctx.from?.id)) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
  }
});

// =============== دستورات اختصاصی صاحب ربات (Super Admin) ===============

// ۱. اضافه کردن ادمین جدید
bot.command('addadmin', async (ctx) => {
  if (ctx.from.id !== SUPER_ADMIN_ID) return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  
  // فرمت دستور: /addadmin 123456 Full Ali
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 3) return ctx.reply('❌ فرمت اشتباه است. مثال:\n`/addadmin 123456 Full Ali`');

  const targetId = Number(args[0]);
  const role = args[1] as AdminRole;
  const name = args.slice(2).join(' ');

  if (isNaN(targetId) || (role !== 'Full' && role !== 'Support')) {
    return ctx.reply('❌ اطلاعات وارد شده معتبر نیست. سطح دسترسی باید Full یا Support باشد.');
  }

  const success = addAdmin(targetId, role, name);
  if (success) {
    ctx.reply(`✅ کاربر ${name} با موفقیت به عنوان ادمین (${role}) اضافه شد.`);
  } else {
    ctx.reply('❌ این کاربر از قبل ادمین است یا آیدی اشتباه است.');
  }
});

// ۲. حذف ادمین
bot.command('deladmin', async (ctx) => {
  if (ctx.from.id !== SUPER_ADMIN_ID) return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  
  const args = ctx.message.text.split(' ').slice(1);
  const targetId = Number(args[0]);

  if (isNaN(targetId)) return ctx.reply('❌ لطفاً یک آیدی عددی معتبر وارد کنید.');

  const success = removeAdmin(targetId);
  if (success) {
    ctx.reply('✅ ادمین مورد نظر با موفقیت حذف شد.');
  } else {
    ctx.reply('❌ ادمینی با این آیدی پیدا نشد.');
  }
});

// ۳. مشاهده لیست ادمین‌ها
bot.command('admins', async (ctx) => {
  if (ctx.from.id !== SUPER_ADMIN_ID) return ctx.reply('❌ این دستور فقط مخصوص صاحب اصلی ربات است.');
  ctx.reply(getAdminsList());
});

// سایر اکشن‌های دکمه‌ها...
bot.action('btn_help', async (ctx) => { await ctx.answerCbQuery(); await help()(ctx); });
bot.action('btn_start', async (ctx) => { await ctx.answerCbQuery(); await start()(ctx); });
bot.action('btn_links', async (ctx) => { await ctx.answerCbQuery(); await links()(ctx); });

// ران کردن ربات
export const startVercel = async (req: VercelRequest, res: VercelResponse) => { await production(req, res, bot); };
ENVIRONMENT !== 'production' && development(bot);
