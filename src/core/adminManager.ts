// صاحب اصلی و تغییرناپذیر ربات (آیدی دقیق شما)
export const SUPER_ADMIN_ID = 186294875;

export type AdminRole = 'Full' | 'Support';

interface Admin {
  id: number;
  role: AdminRole;
  name: string;
}

// لیست ادمین‌های فرعی در حافظه موقت
let tempAdmins: Admin[] = [];

// تابع بررسی دسترسی با تبدیل قطعی به عدد
export const checkPermission = (userId: any): boolean => {
  const numericId = Number(userId);
  if (numericId === SUPER_ADMIN_ID) return true;
  return tempAdmins.some(admin => admin.id === numericId);
};

// تابع اضافه کردن ادمین جدید
export const addAdmin = (id: number, role: AdminRole, name: string): boolean => {
  const numericId = Number(id);
  if (tempAdmins.some(a => a.id === numericId) || numericId === SUPER_ADMIN_ID) return false;
  tempAdmins.push({ id: numericId, role, name });
  return true;
};

// تابع حذف ادمین
export const removeAdmin = (id: number): boolean => {
  const numericId = Number(id);
  const index = tempAdmins.findIndex(a => a.id === numericId);
  if (index === -1) return false;
  tempAdmins.splice(index, 1);
  return true;
};

// تابع دیدن لیست ادمین‌ها
export const getAdminsList = (): string => {
  if (tempAdmins.length === 0) return "هیچ ادمین فرعی تعریف نشده است.";
  return tempAdmins.map(a => `👤 ${a.name} (${a.id}) - سطح: ${a.role}`).join('\n');
};
