import { Context } from 'telegraf';

const start = () => async (ctx: Context) => {
  await ctx.reply('سلام! به ربات تلگرام من خوش آمدید. 🚀');
};

export { start };
