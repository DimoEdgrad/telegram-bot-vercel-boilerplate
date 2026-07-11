import { Context, Markup } from 'telegraf';

export const links = () => async (ctx: Context) => {
  await ctx.reply(
    '🌐 لینک‌های مورد نظر خود را از منوی زیر انتخاب کنید:',
    Markup.inlineKeyboard([
      [Markup.button.url('گیت‌هاب پروژه', 'https://github.com/DimoEdgrad/telegram-bot-vercel-boilerplate')],
      [Markup.button.url('کانال تلگرام', 'https://t.me/YourChannel')] // آیدی کانال خودت را بذار
    ])
  );
};
