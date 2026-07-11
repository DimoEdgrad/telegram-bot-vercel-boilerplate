import { Context, Markup } from 'telegraf';
import { SUPER_ADMIN_ID } from '../core/adminManager';

export const adminMenu = () => async (ctx: Context) => {
  const userId = ctx.from?.id;
  
  // راهنمای متنی کامل برای نحوه استفاده از دستورات مدیریت
  let adminText = 
    `🛠️ *به پنل مدیریت ربات خوش آمدید*\n\n` +
    `📢 *دستورات عمومی مدیریت:*\n` +
    `• مشاهده آمار ربات: روی دکمه زیر کلیک کنید.\n` +
    `• ارسال پیام همگانی: از دستور \`/sendtoall\` استفاده کنید.\n\n`;

  // اگر کاربر صاحب اصلی ربات بود، راهنمای مدیریت ادمین‌ها را هم به متن اضافه کن
  if (userId === SUPER_ADMIN_ID) {
    adminText += 
      `👑 *بخش صاحب اصلی ربات:*\n` +
      `👤 *افزودن ادمین جدید:*\n` +
      `باید دستور را دقیقاً به این فرمت بفرستی:\n` +
      `\` /addadmin [آیدی عددی] [سطح] [نام] \`\n` +
      `👉 *مثال:* \`/addadmin 987654321 Support Ali\`\n` +
      `*(سطح دسترسی می‌تواند Full یا Support باشد)*\n\n` +
      `❌ *حذف ادمین:*\n` +
      `\` /deladmin [آیدی عددی] \`\n` +
      `👉 *مثال:* \`/deladmin 987654321\`\n\n` +
      `📋 برای دیدن لیست ادمین‌ها می‌توانید روی دکمه شیشه‌ای زیر کلیک کنید.`;
  }

  // چیدمان دکمه‌های شیشه‌ای پنل ادمین
  const buttons = [
    [
      Markup.button.callback('📊 آمار ربات', 'btn_stats'),
      Markup.button.callback('📢 ارسال همگانی', 'btn_send_all')
    ]
  ];

  // اگر صاحب اصلی بود، دکمه شیشه‌ای دیدن لیست ادمین‌ها را هم اضافه کن
  if (userId === SUPER_ADMIN_ID) {
    buttons.push([
      Markup.button.callback('👥 لیست ادمین‌های فرعی', 'btn_list_admins')
    ]);
  }

  await ctx.replyWithMarkdownV2(adminText, Markup.inlineKeyboard(buttons));
};
