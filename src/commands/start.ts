import { Context, Markup } from 'telegraf';
import { checkPermission } from '../core/adminManager';

export const start = () => async (ctx: Context) => {
  const firstName = ctx.from?.first_name || 'کاربر گرامی';
  const userId = ctx.from?.id || 0;

  const welcomeText = `سلام ${firstName} عزیز! 🚀\nبه ربات پیشرفته من خوش آمدید.`;
  
  // دکمه‌های شیشه‌ای منوی استارت
  const buttons = [
    [Markup.button.callback('📜 راهنمای ربات', 'btn_help')]
  ];

  // نمایش دکمه در صورت داشتن دسترسی مدیریت
  if (checkPermission(userId)) {
    buttons.push([Markup.button.callback('🛠️ لیست کامل دستورات ادمین', 'btn_admin_menu')]);
  }

  await ctx.reply(welcomeText, Markup.inlineKeyboard(buttons));
};
