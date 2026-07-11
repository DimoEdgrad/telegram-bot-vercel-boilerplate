import { Context, Markup } from 'telegraf';
import { SUPER_ADMIN_ID } from '../core/adminManager';

export const adminMenu = () => async (ctx: Context) => {
  const userId = Number(ctx.from?.id);
  
  let adminText = 
    `🛠️ به پنل مدیریت ربات خوش آمدید\n\n` +
    `📢 دستورات عمومی مدیریت:\n` +
    `• مشاهده آمار ربات: روی دکمه زیر کلیک کنید.\n` +
    `• ارسال پیام همگانی: از دستور /sendtoall استفاده کنید.\n\n`;

  if (userId === SUPER_ADMIN_ID) {
    adminText += 
      `👑 بخش صاحب اصلی ربات (مدیریت دسترسی‌ها):\n\n` +
      `🔹 روش اول: افزودن با آیدی عددی\n` +
      `/addadmin [آیدی] [سطح] [نام]\n\n` +
      `🔹 روش دوم: افزودن هوشمند (بدون نیاز به آیدی)\n` +
      `پیام کاربر را فوروارد کنید، روش ریپلای کنید و بفرستید:\n` +
      `/replyadmin [سطح]\n\n` +
      `❌ حذف ادمین فرعی:\n` +
      `/deladmin [آیدی عددی]\n\n` +
      `📋 برای دیدن لیست ادمین‌ها روی دکمه زیر کلیک کنید.`;
  }

  const buttons = [
    [
      Markup.button.callback('📊 آمار کلی کاربران', 'btn_stats'),
      Markup.button.callback('📅 آمار تفکیک‌شده ماهانه', 'btn_monthly_stats')
    ]
  ];

  if (userId === SUPER_ADMIN_ID) {
    buttons.push([
      Markup.button.callback('👥 لیست ادمین‌های فرعی', 'btn_list_admins')
    ]);
  }

  await ctx.reply(adminText, Markup.inlineKeyboard(buttons));
};
