import { Context, Markup } from 'telegraf';
import { checkPermission, registerUser } from '../core/adminManager';

export const start = () => async (ctx: Context) => {
  const firstName = ctx.from?.first_name || 'کاربر گرامی';
  const userId = ctx.from?.id || 0;

  // ثبت خودکار آیدی کاربر در دیتابیس برای آمار
  await registerUser(userId);

  const welcomeText = `سلام ${firstName} عزیز! 🚀\nبه ربات پیشرفته من خوش آمدید.`;
  
  const buttons = [
    [Markup.button.callback('📜 راهنمای ربات', 'btn_help')]
  ];

  // بررسی دسترسی ادمین به صورت Async از دیتابیس
  const isAdmin = await checkPermission(userId);
  if (isAdmin) {
    buttons.push([Markup.button.callback('🛠️ لیست کامل دستورات ادمین', 'btn_admin_menu')]);
  }

  await ctx.reply(welcomeText, Markup.inlineKeyboard(buttons));
};
