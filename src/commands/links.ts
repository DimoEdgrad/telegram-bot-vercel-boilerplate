import { Context, Markup } from 'telegraf';

export const links = () => async (ctx: Context) => {
  await ctx.reply(
    '🌐 بخش مورد نظر خود را انتخاب کنید:',
    Markup.inlineKeyboard([
      [
        Markup.button.url('گیت‌هاب پروژه', 'https://github.com/DimoEdgrad/telegram-bot-vercel-boilerplate'),
        Markup.button.url('کانال تلگرام', 'https://t.me/YourChannel')
      ],
      [
        Markup.button.callback('ℹ️ درباره پروژه', 'btn_about'),
        Markup.button.callback('👤 ارتباط با سازنده', 'btn_creator')
      ]
    ])
  );
};
