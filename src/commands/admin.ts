import { Context, Markup } from 'telegraf';
import { SUPER_ADMIN_ID } from '../core/adminManager';

export const adminMenu = () => async (ctx: Context) => {
  const userId = ctx.from?.id;
  
  let adminText = 
    `🛠️ *به پنل مدیریت ربات خوش آمدید*\n\n` +
    `📢 *دستورات عمومی مدیریت:*\n` +
    `• مشاهده آمار ربات: روی دکمه زیر کلیک کنید.\n` +
    `• ارسال پیام همگانی: از دستور \`/sendtoall\` استفاده کنید.\n\n`;

  // نمایش راهنمای کامل روش‌های افزودن ادمین فقط به صاحب اصلی ربات
  if (userId === SUPER_ADMIN_ID) {
    adminText += 
      `👑 *بخش صاحب اصلی ربات (مدیریت دسترسی‌ها):*\n\n` +
      ` روش اول: افزودن با آیدی عددی\n` +
      `دستور را به همراه آیدی، سطح (Full یا Support) و نام بفرستید:\n` +
      `\` /addadmin [آیدی] [سطح] [نام] \`\n` +
      `👉 *مثال:* \`/addadmin 186294875 Full Ali\`\n\n` +
      ` روش دوم: افزودن هوشمند (بدون نیاز به آیدی)\n` +
      `۱. پیام کاربر مورد نظر را به ربات *فوروارد* کنید.\n` +
      `۲. روی پیام فوروارد شده *ریپلای* کنید و دستور زیر را بفرستید:\n` +
      `\` /replyadmin [سطح] \`\n` +
      `👉 *مثال:* \`/replyadmin Support\`\n` +
      `*(ربات خودکار آیدی عددی و نام کاربر را از پیام استخراج می‌کند)*\n\n` +
      `❌ *حذف ادمین فرعی:*\n` +
      `\` /deladmin [آیدی عددی] \`\n` +
      `👉 *مثال:* \`/deladmin 987654321\`\n\n` +
      `📋 برای دیدن لیست ادمین‌های فعلی روی دکمه زیر کلیک کنید.`;
  }

  // دکمه‌های شیشه‌ای پنل ادمین
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

  await ctx.replyWithMarkdownV2(adminText, Markup.inlineKeyboard(buttons));
};
