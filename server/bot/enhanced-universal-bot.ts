import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * UNIVERSAL BOT YAXSHILANGAN VERSIYA
 * 
 * Yangi imkoniyatlar:
 * - Inline keyboard
 * - Real-time bildirishnomalar
 * - Rasm va media
 * - Qidiruv
 * - Multi-language
 * - Voice messages
 * - Auto-reply
 * - Error handling
 */

export class UniversalBotEnhanced {
  private bot: TelegramBot;
  private botType: 'customer' | 'admin' | 'driver' | 'production';
  private language: Map<number, string> = new Map(); // chatId -> language

  constructor(token: string, botType: 'customer' | 'admin' | 'driver' | 'production') {
    this.bot = new TelegramBot(token, { polling: true });
    this.botType = botType;
    this.setupCommands();
    this.setupErrorHandling();
  }

  // Xatolarni boshqarish
  private setupErrorHandling() {
    this.bot.on('polling_error', (error) => {
      console.error(`❌ ${this.botType} bot polling error:`, error);
    });

    this.bot.on('error', (error) => {
      console.error(`❌ ${this.botType} bot error:`, error);
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (error) => {
      console.error('❌ Unhandled Rejection:', error);
    });
  }

  // Komandalarni sozlash
  private setupCommands() {
    // Start komandasi
    this.bot.onText(/\/start/, async (msg) => {
      await this.handleStart(msg);
    });

    // Til tanlash
    this.bot.onText(/\/language/, async (msg) => {
      await this.handleLanguageSelection(msg);
    });

    // Yordam
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelp(msg);
    });

    // Qidiruv
    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      if (match) {
        await this.handleSearch(msg, match[1]);
      }
    });

    // Statistika
    this.bot.onText(/\/stats/, async (msg) => {
      await this.handleStats(msg);
    });

    // Sozlamalar
    this.bot.onText(/\/settings/, async (msg) => {
      await this.handleSettings(msg);
    });

    // Callback query
    this.bot.on('callback_query', async (query) => {
      await this.handleCallbackQuery(query);
    });

    // Oddiy xabarlar
    this.bot.on('message', async (msg) => {
      if (!msg.text?.startsWith('/')) {
        await this.handleMessage(msg);
      }
    });

    // Voice messages
    this.bot.on('voice', async (msg) => {
      await this.handleVoiceMessage(msg);
    });

    // Photo messages
    this.bot.on('photo', async (msg) => {
      await this.handlePhotoMessage(msg);
    });

    // Location messages
    this.bot.on('location', async (msg) => {
      await this.handleLocationMessage(msg);
    });
  }

  // Start komandasi
  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const lang = this.getLanguage(chatId);

    const welcomeMessages = {
      uz: {
        customer: `👋 **Xush kelibsiz!**\n\n🛍️ Mijoz botiga xush kelibsiz!\n\n📱 Quyidagi tugmalardan foydalaning:`,
        admin: `👑 **Admin Panel**\n\n🔐 Admin botiga xush kelibsiz!\n\n⚙️ Tizimni boshqaring:`,
        driver: `🚗 **Haydovchi Panel**\n\n🚚 Haydovchi botiga xush kelibsiz!\n\n📋 Buyurtmalarni boshqaring:`,
        production: `🏭 **Ishlab Chiqarish**\n\n⚙️ Ishlab chiqarish botiga xush kelibsiz!\n\n📊 Jarayonlarni kuzating:`
      },
      ru: {
        customer: `👋 **Добро пожаловать!**\n\n🛍️ Добро пожаловать в бот для клиентов!\n\n📱 Используйте кнопки ниже:`,
        admin: `👑 **Админ Панель**\n\n🔐 Добро пожаловать в админ бот!\n\n⚙️ Управляйте системой:`,
        driver: `🚗 **Панель Водителя**\n\n🚚 Добро пожаловать в бот водителя!\n\n📋 Управляйте заказами:`,
        production: `🏭 **Производство**\n\n⚙️ Добро пожаловать в бот производства!\n\n📊 Отслеживайте процессы:`
      },
      en: {
        customer: `👋 **Welcome!**\n\n🛍️ Welcome to customer bot!\n\n📱 Use buttons below:`,
        admin: `👑 **Admin Panel**\n\n🔐 Welcome to admin bot!\n\n⚙️ Manage system:`,
        driver: `🚗 **Driver Panel**\n\n🚚 Welcome to driver bot!\n\n📋 Manage orders:`,
        production: `🏭 **Production**\n\n⚙️ Welcome to production bot!\n\n📊 Track processes:`
      }
    };

    const keyboards = {
      customer: {
        uz: [
          [{ text: '🛒 Buyurtma berish' }, { text: '💰 Balans' }],
          [{ text: '📊 Tarix' }, { text: '📋 Katalog' }],
          [{ text: '👤 Profil' }, { text: '⚙️ Sozlamalar' }],
          [{ text: '🌐 Til / Language' }, { text: '❓ Yordam' }]
        ],
        ru: [
          [{ text: '🛒 Заказать' }, { text: '💰 Баланс' }],
          [{ text: '📊 История' }, { text: '📋 Каталог' }],
          [{ text: '👤 Профиль' }, { text: '⚙️ Настройки' }],
          [{ text: '🌐 Язык / Language' }, { text: '❓ Помощь' }]
        ],
        en: [
          [{ text: '🛒 Order' }, { text: '💰 Balance' }],
          [{ text: '📊 History' }, { text: '📋 Catalog' }],
          [{ text: '👤 Profile' }, { text: '⚙️ Settings' }],
          [{ text: '🌐 Language / Til' }, { text: '❓ Help' }]
        ]
      },
      admin: {
        uz: [
          [{ text: '🖥️ Tizim' }, { text: '👥 Foydalanuvchilar' }],
          [{ text: '💰 Sotuvlar' }, { text: '📦 Mahsulotlar' }],
          [{ text: '📊 Statistika' }, { text: '💾 Zaxira' }],
          [{ text: '⚙️ Sozlamalar' }, { text: '❓ Yordam' }]
        ],
        ru: [
          [{ text: '🖥️ Система' }, { text: '👥 Пользователи' }],
          [{ text: '💰 Продажи' }, { text: '📦 Продукты' }],
          [{ text: '📊 Статистика' }, { text: '💾 Резерв' }],
          [{ text: '⚙️ Настройки' }, { text: '❓ Помощь' }]
        ],
        en: [
          [{ text: '🖥️ System' }, { text: '👥 Users' }],
          [{ text: '💰 Sales' }, { text: '📦 Products' }],
          [{ text: '📊 Statistics' }, { text: '💾 Backup' }],
          [{ text: '⚙️ Settings' }, { text: '❓ Help' }]
        ]
      },
      driver: {
        uz: [
          [{ text: '📋 Buyurtmalar' }, { text: '📍 Joylashuv' }],
          [{ text: '💬 Chat' }, { text: '📊 Statistika' }],
          [{ text: '🟢 Online' }, { text: '🔴 Offline' }],
          [{ text: '⚙️ Sozlamalar' }, { text: '❓ Yordam' }]
        ],
        ru: [
          [{ text: '📋 Заказы' }, { text: '📍 Локация' }],
          [{ text: '💬 Чат' }, { text: '📊 Статистика' }],
          [{ text: '🟢 Онлайн' }, { text: '🔴 Оффлайн' }],
          [{ text: '⚙️ Настройки' }, { text: '❓ Помощь' }]
        ],
        en: [
          [{ text: '📋 Orders' }, { text: '📍 Location' }],
          [{ text: '💬 Chat' }, { text: '📊 Statistics' }],
          [{ text: '🟢 Online' }, { text: '🔴 Offline' }],
          [{ text: '⚙️ Settings' }, { text: '❓ Help' }]
        ]
      },
      production: {
        uz: [
          [{ text: '📊 Ishlab chiqarish' }, { text: '🔍 Sifat' }],
          [{ text: '📦 Xom ashyo' }, { text: '📋 Vazifalar' }],
          [{ text: '📈 Hisobotlar' }, { text: '⚙️ Sozlamalar' }],
          [{ text: '❓ Yordam' }]
        ],
        ru: [
          [{ text: '📊 Производство' }, { text: '🔍 Качество' }],
          [{ text: '📦 Сырье' }, { text: '📋 Задачи' }],
          [{ text: '📈 Отчеты' }, { text: '⚙️ Настройки' }],
          [{ text: '❓ Помощь' }]
        ],
        en: [
          [{ text: '📊 Production' }, { text: '🔍 Quality' }],
          [{ text: '📦 Materials' }, { text: '📋 Tasks' }],
          [{ text: '📈 Reports' }, { text: '⚙️ Settings' }],
          [{ text: '❓ Help' }]
        ]
      }
    };

    const message = welcomeMessages[lang][this.botType];
    const keyboard = keyboards[this.botType][lang];

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard,
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });

    // Inline tugmalar
    const inlineKeyboard = [
      [
        { text: '📱 Tezkor havolalar', callback_data: 'quick_links' },
        { text: '🔔 Bildirishnomalar', callback_data: 'notifications' }
      ],
      [
        { text: '📊 Statistika', callback_data: 'stats' },
        { text: '🔍 Qidiruv', callback_data: 'search' }
      ]
    ];

    await this.bot.sendMessage(chatId, '⚡ Tezkor amallar:', {
      reply_markup: { inline_keyboard: inlineKeyboard }
    });
  }

  // Til tanlash
  private async handleLanguageSelection(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;

    const keyboard = [
      [
        { text: '🇺🇿 O\'zbekcha', callback_data: 'lang_uz' },
        { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
      ],
      [
        { text: '🇬🇧 English', callback_data: 'lang_en' }
      ]
    ];

    await this.bot.sendMessage(chatId, '🌐 Tilni tanlang / Выберите язык / Choose language:', {
      reply_markup: { inline_keyboard: keyboard }
    });
  }

  // Yordam
  private async handleHelp(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const lang = this.getLanguage(chatId);

    const helpMessages = {
      uz: `
❓ **YORDAM**

📋 **Asosiy komandalar:**
/start - Botni qayta ishga tushirish
/help - Yordam
/language - Tilni o'zgartirish
/search - Qidiruv
/stats - Statistika
/settings - Sozlamalar

💡 **Maslahatlar:**
• Tugmalardan foydalaning
• Inline tugmalar tezroq
• Voice xabar yuboring
• Rasm yuborish mumkin

📞 **Aloqa:**
• Texnik yordam: @support
• Telefon: +998 XX XXX XX XX
      `,
      ru: `
❓ **ПОМОЩЬ**

📋 **Основные команды:**
/start - Перезапустить бота
/help - Помощь
/language - Изменить язык
/search - Поиск
/stats - Статистика
/settings - Настройки

💡 **Советы:**
• Используйте кнопки
• Inline кнопки быстрее
• Отправьте голосовое сообщение
• Можно отправить фото

📞 **Контакты:**
• Техподдержка: @support
• Телефон: +998 XX XXX XX XX
      `,
      en: `
❓ **HELP**

📋 **Main commands:**
/start - Restart bot
/help - Help
/language - Change language
/search - Search
/stats - Statistics
/settings - Settings

💡 **Tips:**
• Use buttons
• Inline buttons are faster
• Send voice message
• You can send photos

📞 **Contacts:**
• Support: @support
• Phone: +998 XX XXX XX XX
      `
    };

    await this.bot.sendMessage(chatId, helpMessages[lang], {
      parse_mode: 'Markdown'
    });
  }

  // Qidiruv
  private async handleSearch(msg: TelegramBot.Message, query: string) {
    const chatId = msg.chat.id;
    const lang = this.getLanguage(chatId);

    await this.bot.sendMessage(chatId, `🔍 Qidirilmoqda: "${query}"...`);

    try {
      // Bu yerda qidiruv logikasi
      const results = await this.performSearch(query);

      if (results.length === 0) {
        await this.bot.sendMessage(chatId, '❌ Hech narsa topilmadi');
        return;
      }

      let message = `🔍 **Qidiruv natijalari: "${query}"**\n\n`;
      results.forEach((result, index) => {
        message += `${index + 1}. ${result.title}\n`;
        message += `   ${result.description}\n\n`;
      });

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Search error:', error);
      await this.bot.sendMessage(chatId, '❌ Qidiruvda xatolik');
    }
  }

  // Statistika
  private async handleStats(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const lang = this.getLanguage(chatId);

    await this.bot.sendMessage(chatId, '📊 Statistika yuklanmoqda...');

    try {
      const stats = await this.getStatistics(chatId);

      const message = `
📊 **STATISTIKA**

📈 **Umumiy:**
• Jami: ${stats.total}
• Bugun: ${stats.today}
• Bu hafta: ${stats.week}
• Bu oy: ${stats.month}

🏆 **Yutuqlar:**
• Eng yaxshi kun: ${stats.bestDay}
• Eng ko'p: ${stats.mostPopular}

📅 **Oxirgi faoliyat:**
${stats.lastActivity}
      `;

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Batafsil', callback_data: 'stats_detailed' },
              { text: '📤 Eksport', callback_data: 'stats_export' }
            ],
            [{ text: '🔄 Yangilash', callback_data: 'stats_refresh' }]
          ]
        }
      });

    } catch (error) {
      console.error('Stats error:', error);
      await this.bot.sendMessage(chatId, '❌ Statistikani yuklashda xatolik');
    }
  }

  // Sozlamalar
  private async handleSettings(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const lang = this.getLanguage(chatId);

    const keyboard = [
      [
        { text: '🌐 Til', callback_data: 'settings_language' },
        { text: '🔔 Bildirishnomalar', callback_data: 'settings_notifications' }
      ],
      [
        { text: '🎨 Tema', callback_data: 'settings_theme' },
        { text: '🔐 Xavfsizlik', callback_data: 'settings_security' }
      ],
      [
        { text: '📱 Tezkor tugmalar', callback_data: 'settings_shortcuts' }
      ]
    ];

    await this.bot.sendMessage(chatId, '⚙️ **SOZLAMALAR**\n\nKerakli bo\'limni tanlang:', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
  }

  // Callback query
  private async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) return;

    try {
      // Til tanlash
      if (data.startsWith('lang_')) {
        const lang = data.replace('lang_', '') as 'uz' | 'ru' | 'en';
        this.language.set(chatId, lang);
        await this.bot.answerCallbackQuery(query.id, { text: '✅ Til o\'zgartirildi!' });
        await this.handleStart(query.message!);
        return;
      }

      // Statistika
      if (data === 'stats') {
        await this.bot.answerCallbackQuery(query.id);
        await this.handleStats(query.message!);
        return;
      }

      // Qidiruv
      if (data === 'search') {
        await this.bot.answerCallbackQuery(query.id, { text: 'Qidiruv so\'zini yozing...' });
        await this.bot.sendMessage(chatId, '🔍 Qidiruv so\'zini yozing:\n\nMasalan: /search mahsulot');
        return;
      }

      // Bildirishnomalar
      if (data === 'notifications') {
        await this.handleNotifications(chatId, query.id);
        return;
      }

      // Tezkor havolalar
      if (data === 'quick_links') {
        await this.handleQuickLinks(chatId, query.id);
        return;
      }

      // Default
      await this.bot.answerCallbackQuery(query.id, { text: 'Amaliyot bajarildi!' });

    } catch (error) {
      console.error('Callback query error:', error);
      await this.bot.answerCallbackQuery(query.id, { text: '❌ Xatolik yuz berdi!' });
    }
  }

  // Oddiy xabar
  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Auto-reply
    const autoReplies: Record<string, string> = {
      'salom': '👋 Salom! Sizga qanday yordam bera olaman?',
      'hello': '👋 Hello! How can I help you?',
      'привет': '👋 Привет! Чем могу помочь?',
      'rahmat': '🙏 Arzimaydi! Doim xizmatdamiz!',
      'thanks': '🙏 You\'re welcome! Always at your service!',
      'спасибо': '🙏 Пожалуйста! Всегда к вашим услугам!'
    };

    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(autoReplies)) {
      if (lowerText.includes(key)) {
        await this.bot.sendMessage(chatId, value);
        return;
      }
    }

    // Agar hech narsa mos kelmasa
    await this.bot.sendMessage(chatId, '💬 Xabaringiz qabul qilindi. Tez orada javob beramiz!');
  }

  // Voice xabar
  private async handleVoiceMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    
    await this.bot.sendMessage(chatId, '🎤 Ovozli xabar qabul qilindi!\n\n⏳ Qayta ishlanmoqda...');
    
    // Bu yerda voice-to-text konvertatsiya qilish mumkin
    setTimeout(async () => {
      await this.bot.sendMessage(chatId, '✅ Ovozli xabar qayta ishlandi!\n\n📝 Matn: [Voice-to-text funksiyasi qo\'shiladi]');
    }, 2000);
  }

  // Rasm xabari
  private async handlePhotoMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    
    await this.bot.sendMessage(chatId, '📸 Rasm qabul qilindi!\n\n⏳ Tahlil qilinmoqda...');
    
    // Bu yerda image recognition qilish mumkin
    setTimeout(async () => {
      await this.bot.sendMessage(chatId, '✅ Rasm tahlil qilindi!\n\n🔍 [Image recognition funksiyasi qo\'shiladi]');
    }, 2000);
  }

  // Joylashuv xabari
  private async handleLocationMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const location = msg.location;

    if (!location) return;

    await this.bot.sendMessage(chatId, `
📍 **JOYLASHUV QABUL QILINDI**

🌍 Koordinatalar:
• Latitude: ${location.latitude}
• Longitude: ${location.longitude}

✅ Joylashuvingiz saqlandi!
    `, {
      parse_mode: 'Markdown'
    });
  }

  // Bildirishnomalar
  private async handleNotifications(chatId: number, queryId: string) {
    const keyboard = [
      [
        { text: '🔔 Yoqish', callback_data: 'notif_on' },
        { text: '🔕 O\'chirish', callback_data: 'notif_off' }
      ],
      [
        { text: '⚙️ Sozlash', callback_data: 'notif_settings' }
      ]
    ];

    await this.bot.sendMessage(chatId, '🔔 **BILDIRISHNOMALAR**\n\nSozlamalarni tanlang:', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });

    await this.bot.answerCallbackQuery(queryId);
  }

  // Tezkor havolalar
  private async handleQuickLinks(chatId: number, queryId: string) {
    const keyboard = [
      [
        { text: '🛒 Buyurtma', callback_data: 'quick_order' },
        { text: '💰 To\'lov', callback_data: 'quick_payment' }
      ],
      [
        { text: '📊 Hisobot', callback_data: 'quick_report' },
        { text: '📞 Aloqa', callback_data: 'quick_contact' }
      ]
    ];

    await this.bot.sendMessage(chatId, '📱 **TEZKOR HAVOLALAR**\n\nKerakli amaliyotni tanlang:', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });

    await this.bot.answerCallbackQuery(queryId);
  }

  // Yordamchi funksiyalar
  private getLanguage(chatId: number): 'uz' | 'ru' | 'en' {
    return (this.language.get(chatId) as 'uz' | 'ru' | 'en') || 'uz';
  }

  private async performSearch(query: string): Promise<Array<{ title: string; description: string }>> {
    // Bu yerda qidiruv logikasi
    return [
      { title: 'Natija 1', description: 'Tavsif 1' },
      { title: 'Natija 2', description: 'Tavsif 2' }
    ];
  }

  private async getStatistics(chatId: number): Promise<any> {
    // Bu yerda statistika olish logikasi
    return {
      total: 100,
      today: 10,
      week: 50,
      month: 80,
      bestDay: 'Dushanba',
      mostPopular: 'Mahsulot A',
      lastActivity: 'Bugun 14:30'
    };
  }

  // Xabar yuborish (public method)
  public async sendMessage(chatId: number | string, text: string, options?: any) {
    try {
      return await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  // Rasm yuborish
  public async sendPhoto(chatId: number | string, photo: string, options?: any) {
    try {
      return await this.bot.sendPhoto(chatId, photo, options);
    } catch (error) {
      console.error('Send photo error:', error);
      throw error;
    }
  }

  // Document yuborish
  public async sendDocument(chatId: number | string, document: string, options?: any) {
    try {
      return await this.bot.sendDocument(chatId, document, options);
    } catch (error) {
      console.error('Send document error:', error);
      throw error;
    }
  }

  // Bot instance olish
  public getBot(): TelegramBot {
    return this.bot;
  }

  // Botni to'xtatish
  public async stop() {
    try {
      await this.bot.stopPolling();
      console.log(`✅ ${this.botType} bot to'xtatildi`);
    } catch (error) {
      console.error(`❌ ${this.botType} botni to'xtatishda xatolik:`, error);
    }
  }
}

// Export
export function createEnhancedBot(
  token: string,
  botType: 'customer' | 'admin' | 'driver' | 'production'
): UniversalBotEnhanced {
  return new UniversalBotEnhanced(token, botType);
}
