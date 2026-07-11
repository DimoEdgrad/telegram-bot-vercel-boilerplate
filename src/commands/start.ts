import { Context, Markup } from 'telegraf';
import { checkPermission } from '../core/adminManager'; // 👈 وارد کردن تابع جدید

export const start = () => async (ctx: Context) => {
  const firstName = ctx.from?.first_name || 'کاربر گرامی';
  const userId = ctx.from?.id || 0;

  const welcomeText = `سلام ${firstName} عزیز! 🚀\nبه ربات پیشرفته من خوش آمدید.`;
  const buttons = [[Markup.button.callback('📜 راهنمای ربات', 'btn_help')]];

  // 👈 حالا هر کسی که ادمین فرعی یا اصلی باشد این دکمه را می‌بیند
  if (checkPermission(userId)) {
    buttons.push([Markup.button.callback('🛠️ لیست کامل دستورات ادمین', 'btn_admin_menu')]);
  }

  await ctx.reply(welcomeText, Markup.inlineKeyboard(buttons));
};
