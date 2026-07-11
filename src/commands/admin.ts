import { Context, Markup } from 'telegraf';
import { SUPER_ADMIN_ID } from '../core/adminManager';

export const adminMenu = () => async (ctx: Context) => {
  const userId = ctx.from?.id;
  
  let adminText = 
    `🛠️ به پنل مدیریت ربات خوش آمدید\n\n` +
    `📢 دستورات عمومی مدیریت:\n` +
    `• مشاهده آمار ربات: روی دکمه زیر کلیک کنید.\n` +
    `• ارسال پیام همگانی: از دستور /sendtoall استفاده کنید.\n\n`;

  if (userId === SUPER_ADMIN_ID) {
    adminText += 
      `👑 بخش صاحب اصلی ربات:\n` +
      `👤 افزودن ادمین جدید:\n` +
      `فرمت دستور:\n` +
      `/addadmin [آیدی عددی] [سطح] [نام]\n` +
      `👉 مثال: /addadmin 987654321 Support Ali\n\n` +
      `❌ حذف ادمین:\n` +
      `/deladmin [آیدی عددی]\n` +
      `👉 مثال: /deladmin 987654321\n\n` +
      `📋 برای دیدن لیست ادمین‌ها روی دکمه شیشه‌ای زیر کلیک کنید.`;
  }

  const buttons = [
    [
      Markup.button.callback('📊 آمار ربات', 'btn_stats'),
      Markup.button.callback('📢 ارسال همگانی', 'btn_send_all')
    ]
  ];

  if (userId === SUPER_ADMIN_ID) {
    buttons.push([
      Markup.button.callback('👥 لیست ادمین‌های فرعی', 'btn_list_admins')
    ]);
  }

  await ctx.reply(adminText, Markup.inlineKeyboard(buttons));
};
