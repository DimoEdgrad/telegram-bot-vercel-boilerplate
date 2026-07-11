import { Telegraf } from 'telegraf';

// ۱. وارد کردن adminMenu و بقیه دستورات
import { about, start, help, links, creator, adminMenu } from './commands'; 
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

// متصل کردن دستورات متنی
bot.command('start', start()); 
bot.command('help', help());
bot.command('about', about());
bot.command('links', links());
bot.command('creator', creator());
bot.command('admin', adminMenu()); // امکان دسترسی با تایپ /admin برای ادمین

// ۲. مدیریت کلیک روی دکمه‌های شیشه‌ای جدید
bot.action('btn_help', async (ctx) => {
  await ctx.answerCbQuery();
  await help()(ctx);
});

bot.action('btn_admin_menu', async (ctx) => {
  await ctx.answerCbQuery();
  // جهت امنیت بیشتر، اینجا هم چک میکنیم که حتما ادمین کلیک کرده باشد
  const ADMIN_ID = 186294875; // 🛑 آیدی خودت را اینجا هم بذار
  if (ctx.from?.id === ADMIN_ID) {
    await adminMenu()(ctx);
  } else {
    await ctx.reply('شما دسترسی به این بخش را ندارید.');
  }
});

// بقیه دکمه‌های قبلی
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

bot.on('message', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
