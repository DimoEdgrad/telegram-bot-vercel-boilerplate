import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { start, help, adminMenu } from './commands'; 
import { greeting } from './text';
import { development } from './core';
import { checkPermission, SUPER_ADMIN_ID, addAdmin, AdminRole } from './core/adminManager';
import { handleBan, handleMute, handleWarn } from './commands/moderation';

const BOT_TOKEN = '252430934:AAFM9aXSCop4DZd8fMjcX85rNLFAlEAJp6c';
const bot = new Telegraf(BOT_TOKEN, { telegram: { webhookReply: false } });

let userWarns: { [chatId: number]: { [userId: number]: number } } = {};
let groupLocks: { [chatId: number]: { links: boolean } } = {};

bot.command('start', start());
bot.command('help', help());
bot.command('ban', handleBan);
bot.command('mute', handleMute);
bot.command('warn', (ctx) => handleWarn(ctx, userWarns));

bot.command('locklink', async (ctx) => {
  if (!(await checkPermission(ctx.from.id))) return;
  groupLocks[ctx.chat.id] = { links: true };
  ctx.reply('🔒 قفل لینک فعال شد.');
});

bot.on('message', async (ctx, next) => {
  const msg = ctx.message as any;
  const chatId = ctx.chat.id;
  if (ctx.chat.type !== 'private' && msg.text && groupLocks[chatId]?.links) {
    if (/https?:\/\/[^\s]+/i.test(msg.text)) {
      try { await ctx.deleteMessage(); return; } catch {}
    }
  }
  return greeting()(ctx);
});

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST' || !req.body) return res.status(200).send('Bot is running...');
  try { await bot.handleUpdate(req.body); } catch {}
  res.status(200).send('OK');
};

process.env.NODE_ENV !== 'production' && development(bot);
