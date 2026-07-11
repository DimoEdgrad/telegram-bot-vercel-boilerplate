import { Telegraf } from 'telegraf';

// ۱. وارد کردن تمام دستورات جدید
import { about, start, help, links, creator } from './commands'; 
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

// ۲. متصل کردن دستورات به ربات
bot.command('start', start()); 
bot.command('help', help());
bot.command('about', about());
bot.command('links', links());
bot.command('creator', creator());

bot.on('message', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
