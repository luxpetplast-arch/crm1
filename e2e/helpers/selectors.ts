// Common selectors used across tests

export const selectors = {
  // Auth
  login: {
    email: 'input[type="email"]',
    password: 'input[type="password"]',
    submit: 'button[type="submit"]',
  },
  
  // Navigation
  nav: {
    dashboard: 'a[href="/dashboard"], text=Dashboard',
    products: 'a[href="/products"], text=Mahsulotlar',
    sales: 'a[href="/sales"], text=Sotuvlar',
    customers: 'a[href="/customers"], text=Mijozlar',
    orders: 'a[href="/orders"], text=Buyurtmalar',
    cashbox: 'a[href="/cashbox"], text=Kassa',
    analytics: 'a[href="/analytics"], text=Tahlil',
  },
  
  // Common buttons
  buttons: {
    add: 'button:has-text("Qo\'shish"), button:has-text("Add"), button:has-text("+")',
    save: 'button:has-text("Saqlash"), button:has-text("Save"), button[type="submit"]',
    cancel: 'button:has-text("Bekor qilish"), button:has-text("Cancel")',
    edit: 'button:has-text("Tahrirlash"), button:has-text("Edit")',
    delete: 'button:has-text("O\'chirish"), button:has-text("Delete")',
    view: 'button:has-text("Ko\'rish"), button:has-text("View")',
    export: 'button:has-text("Export"), button:has-text("Yuklab olish")',
  },
  
  // Common inputs
  inputs: {
    search: 'input[placeholder*="Qidirish"], input[placeholder*="Search"]',
    date: 'input[type="date"]',
    number: 'input[type="number"]',
    text: 'input[type="text"]',
  },
  
  // Common elements
  common: {
    table: 'table',
    tableRow: 'table tbody tr',
    modal: '[role="dialog"], .modal',
    loading: '[class*="loading"], [class*="spinner"], text=/yuklanmoqda|loading/i',
    error: 'text=/xato|error|muammo/i',
    success: 'text=/muvaffaqiyatli|success/i',
  },
};
