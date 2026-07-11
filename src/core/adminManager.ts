import { kv } from '@vercel/kv';

// صاحب اصلی و تغییرناپذیر ربات (آیدی شما)
export const SUPER_ADMIN_ID = 186294875;

export type AdminRole = 'Full' | 'Support';

interface Admin {
  id: number;
  role: AdminRole;
  name: string;
}

// تابع بررسی دسترسی (از دیتابیس می‌خواند)
export const checkPermission = async (userId: any): Promise<boolean> => {
  const numericId = Number(userId);
  if (numericId === SUPER_ADMIN_ID) return true;
  
  try {
    const admin = await kv.hget<Admin>('bot_admins', String(numericId));
    return !!admin;
  } catch (e) {
    console.error("Error checking permission:", e);
    return false;
  }
};

// تابع اضافه کردن ادمین جدید و ذخیره در دیتابیس
export const addAdmin = async (id: number, role: AdminRole, name: string): Promise<boolean> => {
  const numericId = Number(id);
  if (numericId === SUPER_ADMIN_ID) return false;

  try {
    const exists = await kv.hexists('bot_admins', String(numericId));
    if (exists) return false;

    await kv.hset('bot_admins', {
      [String(numericId)]: { id: numericId, role, name }
    });
    return true;
  } catch (e) {
    console.error("Error adding admin:", e);
    return false;
  }
};

// تابع حذف ادمین از دیتابیس
export const removeAdmin = async (id: number): Promise<boolean> => {
  const numericId = Number(id);
  try {
    const deletedCount = await kv.hdel('bot_admins', String(numericId));
    return deletedCount > 0;
  } catch (e) {
    console.error("Error removing admin:", e);
    return false;
  }
};

// تابع دیدن لیست ادمین‌ها از دیتابیس
export const getAdminsList = async (): Promise<string> => {
  try {
    const allAdmins = await kv.hgetall<Record<string, Admin>>('bot_admins');
    if (!allAdmins || Object.keys(allAdmins).length === 0) {
      return "هیچ ادمین فرعی تعریف نشده است.";
    }
    return Object.values(allAdmins)
      .map(a => `👤 ${a.name} (${a.id}) - سطح: ${a.role}`)
      .join('\n');
  } catch (e) {
    console.error("Error getting admins list:", e);
    return "خطا در دریافت لیست ادمین‌ها.";
  }
};

// ==================== بخش سیستم آمار کاربران ====================

// تابع ثبت کاربر جدید به همراه تاریخ عضویت (ماهانه)
export const registerUser = async (userId: number): Promise<void> => {
  try {
    const isNew = await kv.sadd('all_users', String(userId));
    if (isNew > 0) {
      // فرمت تاریخ ماهانه: YYYY-MM
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      await kv.sadd(`stats_month:${yearMonth}`, String(userId));
    }
  } catch (e) {
    console.error("Error registering user:", e);
  }
};

// تابع گرفتن آمار کلی ربات
export const getTotalUsersCount = async (): Promise<number> => {
  try {
    return await kv.scard('all_users');
  } catch (e) {
    return 0;
  }
};

// تابع گرفتن لیست گزارش آمار ماهانه
export const getMonthlyStatsReport = async (): Promise<string> => {
  try {
    const now = new Date();
    let report = `📊 *گزارش آمار ماهانه ربات:*\n\n`;
    
    // دریافت آمار ۶ ماه اخیر به صورت داینامیک
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = await kv.scard(`stats_month:${yearMonth}`);
      
      if (count > 0 || i === 0) {
        report += `📅 ماه ${yearMonth}: تعداد ${count} کاربر جدید\n`;
      }
    }
    return report;
  } catch (e) {
    return "❌ خطا در محاسبه آمار ماهانه.";
  }
};
