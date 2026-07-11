import { Context, Markup } from 'telegraf';

export const links = () => async (ctx: Context) => {
  await ctx.reply(
    '🌐 لینک‌های مورد نظر خود را از منوی زیر انتخاب کنید:',
    Markup.inlineKeyboard([
      [Markup.button.url('ارتباط با سازنده ربات', 'https://t.me/dimoedgard')],
      [Markup.button.url('کانال تلگرام', 'https://t.me/TheGhostButterfly')] // آیدی کانال خودت را بذار
    ])
  );
};
