import { Context } from 'telegraf';
import { SUPER_ADMIN_ID, getAdminsList } from '../core/adminManager';

export const adminMenu = () => async (ctx: Context) => {
  const userId = ctx.from?.id;

  let adminText = `🛠️ *منوی مدیریت ربات:*\n\n` +
    `🔹 /stats - مشاهده آمار\n` +
    `🔹 /sendtoall - ارسال پیام همگانی\n\n`;

  // دکمه‌های مخصوص صاحب اصلی ربات (Super Admin)
  if (userId === SUPER_ADMIN_ID) {
    adminText += `👑 *بخش صاحب ربات (قفل شده):*\n` +
      `🔹 دستور اضافه کردن ادمین:\n \`/addadmin [آیدی] [سطح Full یا Support] [نام]\`\n` +
      `🔹 دستور حذف ادمین:\n \`/deladmin [آیدی]\`\n` +
      `🔹 /admins - لیست ادمین‌های فرعی`;
  }

  await ctx.replyWithMarkdownV2(adminText);
};
