import { Context } from 'telegraf';

export const help = () => async (ctx: Context) => {
  const helpText = 
    `📜 راهنمای دستورات ربات:\n\n` +
    `🔹 /start - شروع مجدد ربات\n` +
    `🔹 /help - نمایش همین راهنما\n` +
    `🔹 /about - درباره این پروژه\n` +
    `🔹 /links - لینک‌های مفید و شبکه‌های اجتماعی\n` +
    `🔹 /creator - ارتباط با سازنده ربات`;
  
  await ctx.reply(helpText);
};
