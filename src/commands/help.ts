import { Context, Markup } from 'telegraf';

export const help = () => async (ctx: Context) => {
  const helpText = '📜 لطفا یکی از بخش‌های راهنما را از منوی زیر انتخاب کنید:';
  
  await ctx.reply(
    helpText,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🚀 شروع مجدد', 'btn_start'),
        Markup.button.callback('🌐 لینک‌ها و اطلاعات', 'btn_links') // تغییر نام برای شمول بیشتر
      ]
    ])
  );
};
