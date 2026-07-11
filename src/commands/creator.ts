import { Context, Markup } from 'telegraf';

export const creator = () => async (ctx: Context) => {
  await ctx.reply(
    '👤 برای ارتباط مستقیم با سازنده و پشتیبانی ربات، از دکمه زیر استفاده کنید:',
    Markup.inlineKeyboard([
      [Markup.button.url('ارتباط با من', 'https://t.me/dimoedgard')] // آیدی خودت را بدون @ بذار
    ])
  );
};
