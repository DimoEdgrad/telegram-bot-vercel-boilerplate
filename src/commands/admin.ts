import { Context } from 'telegraf';

export const adminMenu = () => async (ctx: Context) => {
  const adminText = 
    `🛠️ *لیست دستورات مدیریت ربات:*\n\n` +
    `🔹 /stats - مشاهده آمار ربات\n` +
    `🔹 /sendtoall - ارسال پیام همگانی\n` +
    `🔹 /ban - مسدود کردن کاربر\n` +
    `🔹 /unban - رفع مسدودیت کاربر`;

  await ctx.reply(adminText);
};
