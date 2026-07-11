import { Telegraf } from 'telegraf';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

// اجرای تابع گریپینگ روی پیام‌های متنی ورودی
bot.on('text', greeting());

// پردازش کلیک روی دکمه شیشه‌ای لیست دستورات
bot.action('show_commands', async (ctx) => {
  try {
    await ctx.answerCbQuery(); // حذف حالت لودینگ دکمه
    await ctx.reply(
      '📜 لیست دستورات فعال ربات:\n\n' +
      '🔹 /start - شروع مجدد ربات\n' +
      '🔹 /help - راهنمای استفاده از ربات\n' +
      '🔹 /about - درباره ما'
    );
  } catch (error) {
    console.error('Error handling callback query:', error);
  }
});

// هسته مدیریت سرورلس برای Vercel
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  if (ENVIRONMENT === 'production') {
    await production(req, res, bot);
  } else {
    await development(bot);
  }
};

// اجرای محلی (Local) در صورت نیاز
if (ENVIRONMENT !== 'production') {
  development(bot);
}
