import { Context, Markup } from 'telegraf';

export const help = () => async (ctx: Context) => {
  const helpText = '📜 لطفا یکی از بخش‌های راهنما را از منوی زیر انتخاب کنید:';
  
  await ctx.reply(
    helpText,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🚀 شروع مجدد', 'btn_start'),
        Markup.button.callback('ℹ️ درباره پروژه', 'btn_about')
      ],
      [
        Markup.button.callback('🌐 لینک‌های مفید', 'btn_links'),
        Markup.button.callback('👤 ارتباط با سازنده', 'btn_creator')
      ]
    ])
  );
};
