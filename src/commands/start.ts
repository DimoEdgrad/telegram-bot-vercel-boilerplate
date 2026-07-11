import { Context, Markup } from 'telegraf';

// 🛑 آیدی عددی تلگرام خودت را جایگزین 123456789 کن
const ADMIN_ID = 186294875; 

export const start = () => async (ctx: Context) => {
  const firstName = ctx.from?.first_name || 'کاربر گرامی';
  const userId = ctx.from?.id;

  const welcomeText = `سلام ${firstName} عزیز! 🚀\nبه ربات پیشرفته من خوش آمدید.\n\nبرای دیدن لیست کارهای من، دستور /help را ارسال کنید.`;

  // چیدمان دکمه‌ها
  const buttons = [
    [Markup.button.callback('📜 راهنمای ربات', 'btn_help')]
  ];

  // اگر کاربر ادمین بود، دکمه ادمین را به منو اضافه کن
  if (userId === ADMIN_ID) {
    buttons.push([Markup.button.callback('🛠️ لیست کامل دستورات ادمین', 'btn_admin_menu')]);
  }

  await ctx.reply(welcomeText, Markup.inlineKeyboard(buttons));
};
