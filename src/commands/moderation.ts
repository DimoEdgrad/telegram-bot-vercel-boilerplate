import { Context } from 'telegraf';
import { checkPermission, SUPER_ADMIN_ID } from '../core/adminManager';

async function hasModerationPermission(userId: number): Promise<boolean> {
  if (Number(userId) === SUPER_ADMIN_ID) return true;
  try { return await checkPermission(userId); } catch { return false; }
}

export const handleBan = async (ctx: Context) => {
  if (!(await hasModerationPermission(ctx.from?.id || 0))) return;
  const replyTo = (ctx.message as any)?.reply_to_message;
  if (replyTo && 'from' in replyTo && replyTo.from) {
    try { await ctx.banChatMember(replyTo.from.id); ctx.reply(`👤 ${replyTo.from.first_name} بن شد.`); } catch {}
  }
};

export const handleMute = async (ctx: Context) => {
  if (!(await hasModerationPermission(ctx.from?.id || 0))) return;
  const replyTo = (ctx.message as any)?.reply_to_message;
  if (replyTo && 'from' in replyTo && replyTo.from) {
    try { await ctx.restrictChatMember(replyTo.from.id, { permissions: { can_send_messages: false } }); ctx.reply(`🔇 ${replyTo.from.first_name} سکوت شد.`); } catch {}
  }
};

export const handleWarn = async (ctx: Context, warns: any) => {
  if (!(await hasModerationPermission(ctx.from?.id || 0))) return ctx.reply('❌ دسترسی ندارید.');
  const replyTo = (ctx.message as any)?.reply_to_message;
  if (!replyTo || !('from' in replyTo) || !replyTo.from) return ctx.reply('❌ روی پیام کاربر ریپلای کنید.');

  const chatId = ctx.chat?.id || 0;
  const targetId = replyTo.from.id;
  if (!warns[chatId]) warns[chatId] = {};
  warns[chatId][targetId] = (warns[chatId][targetId] || 0) + 1;

  if (warns[chatId][targetId] >= 3) {
    warns[chatId][targetId] = 0;
    try { await ctx.restrictChatMember(targetId, { permissions: { can_send_messages: false } }); ctx.reply(`🚫 ${replyTo.from.first_name} ۳ اخطاره شد و سکوت شد.`); } catch {}
  } else {
    ctx.reply(`⚠️ ${replyTo.from.first_name} اخطار گرفت (${warns[chatId][targetId]}/3).`);
  }
};
