import { Telegraf } from 'telegraf';

// وارد کردن دستورات
import { about, start, help, links, creator } from './commands'; 
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

// ۱. متصل کردن دستورات متنی (وقتی کاربر دستور را تایپ می‌کند)
bot.command('start', start()); 
bot.command('help', help());
bot.command('about', about());
bot.command('links', links());
bot.command('creator', creator());

// ۲. مدیریت کلیک روی دکمه‌های شیشه‌ای منوی Help
bot.action('btn_start', async (ctx) => {
  await ctx.answerCbQuery(); // حذف حالت لودینگ دکمه در تلگرام
  await start()(ctx);       // اجرای تابع start
});

bot.action('btn_about', async (ctx) => {
  await ctx.answerCbQuery();
  await about()(ctx);       // اجرای تابع about
});

bot.action('btn_links', async (ctx) => {
  await ctx.answerCbQuery();
  await links()(ctx);       // اجرای تابع links
});

bot.action('btn_creator', async (ctx) => {
  await ctx.answerCbQuery();
  await creator()(ctx);     // اجرای تابع creator
});


bot.on('message', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
