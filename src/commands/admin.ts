import { Context, Markup } from 'telegraf';
import { SUPER_ADMIN_ID } from '../core/adminManager';

export const adminMenu = () => async (ctx: Context) => {
  const userId = ctx.from?.id;
  const adminText = '🛠️ به پنل مدیریت ربات خوش آمدید. لطفا یک ابزار را انتخاب کنید:';

  // دکمه‌های عمومی برای همه ادمین‌ها (اصلی و فرعی)
  const buttons = [
    [
      Markup.button.callback('📊 آمار ربات', 'btn_stats'),
      Markup.button.callback('📢 ارسال همگانی', 'btn_send_all')
    ]
  ];

  // دکمه‌های اختصاصی صاحب ربات (Super Admin) برای مدیریت ادمین‌های دیگر
  if (userId === SUPER_ADMIN_ID) {
    buttons.push([
      Markup.button.callback('👥 لیست ادمین‌ها', 'btn_list_admins')
    ]);
  }

  await ctx.reply(adminText, Markup.inlineKeyboard(buttons));
};
