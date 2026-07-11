// صاحب اصلی و تغییرناپذیر ربات (آیدی شما)
export const SUPER_ADMIN_ID = 186294875;

export type AdminRole = 'Full' | 'Support';

interface Admin {
  id: number;
  role: AdminRole;
  name: string;
}

// لیست ادمین‌های فرعی در حافظه موقت
let tempAdmins: Admin[] = [];

// تابع بررسی دسترسی (اصلاح شده)
export const checkPermission = (userId: number): boolean => {
  if (userId === SUPER_ADMIN_ID) return true;
  return tempAdmins.some(admin => admin.id === userId);
};

// تابع اضافه کردن ادمین جدید
export const addAdmin = (id: number, role: AdminRole, name: string): boolean => {
  if (tempAdmins.some(a => a.id === id) || id === SUPER_ADMIN_ID) return false;
  tempAdmins.push({ id, role, name });
  return true;
};

// تابع حذف ادمین
export const removeAdmin = (id: number): boolean => {
  const index = tempAdmins.findIndex(a => a.id === id);
  if (index === -1) return false;
  tempAdmins.splice(index, 1);
  return true;
};

// تابع دیدن لیست ادمین‌ها
export const getAdminsList = (): string => {
  if (tempAdmins.length === 0) return "هیچ ادمین فرعی تعریف نشده است.";
  return tempAdmins.map(a => `👤 ${a.name} (${a.id}) - سطح: ${a.role}`).join('\n');
};
