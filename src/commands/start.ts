import { Context } from 'telegraf';

export const start = () => async (ctx: Context) => {
  const firstName = ctx.from?.first_name || 'کاربر گرامی';
  await ctx.reply(
    `سلام ${firstName} عزیز! 🚀\nبه ربات پیشرفته من خوش آمدید.\n\nبرای دیدن لیست کارهای من، دستور /help را ارسال کنید.`
  );
};
