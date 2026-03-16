import React, { createContext, useContext, useState } from 'react';

export type Language = 'uz' | 'uz-cyrl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Navigation
    'nav.home': 'Bosh Sahifa',
    'nav.sales': 'Sotuvlar',
    'nav.orders': 'Buyurtmalar',
    'nav.products': 'Mahsulotlar',
    'nav.customers': 'Mijozlar',
    'nav.cash': 'Kassa',
    'nav.chat': 'Mijoz Chat',
    'nav.finance': 'Moliya',
    'nav.reports': 'Hisobotlar',
    'nav.settings': 'Sozlamalar',
    'nav.more': 'Boshqa',
    'nav.statistics': 'Statistika',
    'nav.analytics': 'AI Tahlil',
    'nav.aiManager': 'AI Manager',
    'nav.superManager': 'Super AI Manager',
    'nav.aiInventory': 'AI Ombor',
    'nav.bots': 'Bot Boshqaruvi',
    'nav.logistics': 'Logistika',
    'nav.drivers': 'Haydovchilar',
    'nav.production': 'Ishlab Chiqarish',
    'nav.rawMaterials': 'Xom Ashyo',
    'nav.suppliers': 'Yetkazuvchilar',
    'nav.qualityControl': 'Sifat Nazorati',
    'nav.tasks': 'Vazifalar',
    'nav.cashierShift': 'Kassir Smenasi',
    'nav.notifications': 'Bildirishnomalar',
    'nav.users': 'Foydalanuvchilar',
    'nav.auditLog': 'Audit Log',
    'nav.forecast': 'Prognoz',
    
    // Common
    'common.search': 'Qidirish...',
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.delete': 'O\'chirish',
    'common.edit': 'Tahrirlash',
    'common.add': 'Qo\'shish',
    'common.back': 'Orqaga',
    'common.loading': 'Yuklanmoqda...',
    'common.error': 'Xatolik',
    'common.success': 'Muvaffaqiyatli',
    'common.confirm': 'Tasdiqlash',
    'common.retry': 'Qayta urinish',
    'common.fillRequired': 'Iltimos, barcha majburiy maydonlarni to\'ldiring!',
    'common.addError': 'Qo\'shishda xatolik',
    'common.deleteError': 'O\'chirishda xatolik',
    
    // Sales
    'sales.title': 'Sotuvlar',
    'sales.new': 'Yangi Sotuv',
    'sales.history': 'Tarix',
    'sales.customer': 'Mijoz',
    'sales.product': 'Mahsulot',
    'sales.quantity': 'Miqdor',
    'sales.price': 'Narx',
    'sales.total': 'Jami',
    'sales.paid': 'To\'langan',
    'sales.debt': 'Qarz',
    'sales.payment': 'To\'lov',
    'sales.cart': 'Savat',
    'sales.setPrice': 'Narx belgilash',
    'sales.bags': 'qop',
    'sales.pieces': 'dona',
    
    // Products
    'products.title': 'Mahsulotlar',
    'products.add': 'Mahsulot qo\'shish',
    'products.name': 'Nomi',
    'products.stock': 'Ombor',
    'products.minStock': 'Minimal zaxira',
    'products.optimalStock': 'Optimal zaxira',
    'products.price': 'Narx',
    'products.status': 'Holat',
    'products.low': 'Kam',
    'products.good': 'Yaxshi',
    'products.subtitle': 'Ombor boshqaruvi va monitoring',
    'products.totalProducts': 'Jami',
    'products.productTypes': 'Mahsulot turi',
    'products.bags': 'Qoplar',
    'products.totalBags': 'Jami qop',
    'products.value': 'Qiymat',
    'products.totalValue': 'Jami qiymat',
    'products.lowStock': 'Kam zaxira',
    'products.outOfStock': 'Qolmagan',
    'products.optimal': 'Optimal',
    'products.new': 'Yangi Mahsulot',
    'products.step': 'Bosqich',
    'products.basicInfo': 'Asosiy Ma\'lumotlar',
    'products.additionalSettings': 'Qoʻshimcha Sozlamalar',
    'products.productName': 'Mahsulot Nomi',
    'products.bagType': 'Qop Turi',
    'products.bagPrice': 'Qop Narxi',
    'products.minimalStock': 'Minimal Zaxira',
    'products.optimalStockShort': 'Optimal Zaxira',
    'products.maxCapacity': 'Maksimal Sig\'im',
    'products.productionCost': 'Ishlab Chiqarish Xarajati',
    'products.next': 'Keyingi',
    'products.back': 'Orqaga',
    'products.create': 'Mahsulot Yaratish',
    'products.view': 'Ko\'rish',
    'products.delete': 'O\'chirish',
    
    // Customers
    'customers.title': 'Mijozlar',
    'customers.add': 'Mijoz qo\'shish',
    'customers.name': 'Ismi',
    'customers.phone': 'Telefon',
    'customers.balance': 'Balans',
    'customers.debt': 'Qarz',
    'customers.discount': 'Chegirma',
    
    // Settings
    'settings.title': 'Sozlamalar',
    'settings.language': 'Til',
    'settings.uz': 'O\'zbekcha (Lotin)',
    'settings.uzCyrl': 'Ўзбекча (Кирилл)',
    'settings.theme': 'Mavzu',
    'settings.notifications': 'Bildirishnomalar',
    'settings.currency': 'Valyuta',
    
    // Product Detail
    'product.totalBags': 'Jami Qoplar',
    'product.itemsPerBag': 'Bir Qopdagi Mahsulot',
    'product.totalItems': 'Jami Mahsulot Soni',
    'product.status': 'Holat',
    'product.info': 'Mahsulot Ma\'lumotlari',
    'product.minStock': 'Minimal Zaxira',
    'product.optimalStock': 'Optimal Zaxira',
    'product.bagPrice': 'Qop Narxi',
    'product.totalSold': 'Jami Sotildi',
    'product.totalRevenue': 'Jami Daromad',
    'product.totalProfit': 'Jami Foyda',
    'product.history': 'Harakat Tarixi',
    'product.addBags': 'Qop Qo\'shish',
    'product.removeBags': 'Qop Kamaytirish',
    'product.settings': 'Sozlamalar',
    'product.setPrice': 'Narx belgilash',
  },
  'uz-cyrl': {
    // Navigation
    'nav.home': 'Бош Саҳифа',
    'nav.sales': 'Сотувлар',
    'nav.orders': 'Буюртмалар',
    'nav.products': 'Маҳсулотлар',
    'nav.customers': 'Мижозлар',
    'nav.cash': 'Касса',
    'nav.chat': 'Мижоз Чат',
    'nav.finance': 'Молия',
    'nav.reports': 'Ҳисоботлар',
    'nav.settings': 'Созламалар',
    'nav.more': 'Бошқа',
    'nav.statistics': 'Статистика',
    'nav.analytics': 'AI Таҳлил',
    'nav.aiManager': 'AI Manager',
    'nav.superManager': 'Super AI Manager',
    'nav.aiInventory': 'AI Омбор',
    'nav.bots': 'Бот Бошқаруви',
    'nav.logistics': 'Логистика',
    'nav.drivers': 'Ҳайдовчилар',
    'nav.production': 'Ишлаб Чиқариш',
    'nav.rawMaterials': 'Хом Ашё',
    'nav.suppliers': 'Етказувчилар',
    'nav.qualityControl': 'Сифат Назорати',
    'nav.tasks': 'Вазифалар',
    'nav.cashierShift': 'Кассир Сменаси',
    'nav.notifications': 'Билдиришномалар',
    'nav.users': 'Фойдаланувчилар',
    'nav.auditLog': 'Audit Log',
    'nav.forecast': 'Прогноз',
    
    // Common
    'common.search': 'Қидириш...',
    'common.save': 'Сақлаш',
    'common.cancel': 'Бекор қилиш',
    'common.delete': 'Ўчириш',
    'common.edit': 'Таҳрирлаш',
    'common.add': 'Қўшиш',
    'common.back': 'Орқага',
    'common.loading': 'Юкланмоқда...',
    'common.error': 'Хатолик',
    'common.success': 'Муваффақиятли',
    'common.confirm': 'Тасдиқлаш',
    'common.close': 'Ёпиш',
    'common.retry': 'Қайта уриниш',
    'common.fillRequired': 'Илтимос, барча мажбурий майдонларни тўлдиринг!',
    'common.addError': 'Қўшишда хатолик',
    'common.deleteError': 'Ўчиришда хатолик',
    
    // Sales
    'sales.title': 'Сотувлар',
    'sales.new': 'Янги Сотув',
    'sales.history': 'Тарих',
    'sales.customer': 'Мижоз',
    'sales.product': 'Маҳсулот',
    'sales.quantity': 'Миқдор',
    'sales.price': 'Нарх',
    'sales.total': 'Жами',
    'sales.paid': 'Тўланган',
    'sales.debt': 'Қарз',
    'sales.payment': 'Тўлов',
    'sales.cart': 'Сават',
    'sales.setPrice': 'Нарх белгилаш',
    'sales.bags': 'қоп',
    'sales.pieces': 'дона',
    
    // Products
    'products.title': 'Маҳсулотлар',
    'products.add': 'Маҳсулот қўшиш',
    'products.name': 'Номи',
    'products.stock': 'Омбор',
    'products.minStock': 'Минимал захира',
    'products.optimalStock': 'Оптимал захира',
    'products.price': 'Нарх',
    'products.status': 'Ҳолат',
    'products.low': 'Кам',
    'products.good': 'Яхши',
    'products.critical': 'Критик',
    'products.subtitle': 'Омбор бошқаруви ва мониторинг',
    'products.totalProducts': 'Жами',
    'products.productTypes': 'Маҳсулот тури',
    'products.bags': 'Қоплар',
    'products.totalBags': 'Жами қоп',
    'products.value': 'Қиймат',
    'products.totalValue': 'Жами қиймат',
    'products.lowStock': 'Кам захира',
    'products.outOfStock': 'Қолмаган',
    'products.optimal': 'Оптимал',
    'products.new': 'Янги Маҳсулот',
    'products.step': 'Босқич',
    'products.basicInfo': 'Асосий Маълумотлар',
    'products.additionalSettings': 'Қўшимча Созламалар',
    'products.productName': 'Маҳсулот Номи',
    'products.bagType': 'Қоп Тури',
    'products.bagPrice': 'Қоп Нархи',
    'products.minimalStock': 'Минимал Захира',
    'products.optimalStockShort': 'Оптимал Захира',
    'products.maxCapacity': 'Максимал Сиғим',
    'products.productionCost': 'Ишлаб Чиқариш Харажатлари',
    'products.next': 'Кейинги',
    'products.back': 'Орқага',
    'products.create': 'Маҳсулот Яратиш',
    'products.view': 'Кўриш',
    'products.delete': 'Ўчириш',
    
    // Customers
    'customers.title': 'Мижозлар',
    'customers.add': 'Мижоз қўшиш',
    'customers.name': 'Исми',
    'customers.phone': 'Телефон',
    'customers.balance': 'Баланс',
    'customers.debt': 'Қарз',
    'customers.discount': 'Чегирма',
    
    // Settings
    'settings.title': 'Созламалар',
    'settings.language': 'Тил',
    'settings.uz': 'Ўзбекча (Лотин)',
    'settings.uzCyrl': 'Ўзбекча (Кирилл)',
    'settings.theme': 'Мавзу',
    'settings.notifications': 'Билдиришномалар',
    'settings.currency': 'Валюта',
    
    // Product Detail
    'product.totalBags': 'Жами Қоплар',
    'product.itemsPerBag': 'Бир Қопдаги Маҳсулот',
    'product.totalItems': 'Жами Маҳсулот Сони',
    'product.status': 'Ҳолат',
    'product.info': 'Маҳсулот Маълумотлари',
    'product.minStock': 'Минимал Захира',
    'product.optimalStock': 'Оптимал Захира',
    'product.bagPrice': 'Қоп Нархи',
    'product.totalSold': 'Жами Сотилди',
    'product.totalRevenue': 'Жами Даромад',
    'product.totalProfit': 'Жами Фойда',
    'product.history': 'Ҳаракат Тарихи',
    'product.addBags': 'Қоп Қўшиш',
    'product.removeBags': 'Қоп Камайтириш',
    'product.settings': 'Созламалар',
    'product.setPrice': 'Нарх белгилаш',
  }
};
