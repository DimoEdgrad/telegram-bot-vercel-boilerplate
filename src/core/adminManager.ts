// صاحب اصلی و تغییرناپذیر ربات (فقط شما)
export const SUPER_ADMIN_ID = 186294875;

// تعریف سطوح دسترسی
export type AdminRole = 'Full' | 'Support';

interface Admin {
  id: number;
  role: AdminRole;
  name: string;
}

// لیست ادمین‌های فرعی در حافظه موقت (با ریست شدن سرورلس پاک می‌شود)
// اگر می‌خواهید دائمی باشد بعدا باید به دیتابیس وصل شود، فعلا برای تست دستی اینجا آرایه داریم:
let tempAdmins: Admin[] = [
  // { id: 987654321, role: 'Support', name: 'علی' }
];

// تابع بررسی دسترسی
export const checkPermission = (userId: number, requiredRole?: AdminRole): boolean => {
  if (userId === SUPER_ADMIN_ID) return true; // صاحب اصلی به همه چیز دسترسی دارد
  
  const admin = tempAdmins.find(a => a.id === userId);
  if (!admin) return false;

  if (!requiredRole) return true; // فقط ادمین بودن کافی است
  if (admin.role === 'Full') return true; // سطح Full به همه چیز دسترسی دارد
  return admin.role === requiredRole; // بررسی سطح دسترسی دقیق
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
