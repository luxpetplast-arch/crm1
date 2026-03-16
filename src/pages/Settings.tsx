import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import DataBackup from '../components/DataBackup';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { 
  Bell, 
  Shield, 
  Building, 
  DollarSign, 
  FileText, 
  Mail, 
  MessageSquare,
  Database,
  Lock,
  CreditCard,
  Factory,
  Percent
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Valyuta kurslari
    USD_TO_UZS_RATE: '12500',
    EUR_TO_UZS_RATE: '13500',
    RUB_TO_UZS_RATE: '135',
    
    // Kompaniya ma'lumotlari
    COMPANY_NAME: 'AzizTrades ERP',
    COMPANY_ADDRESS: 'Toshkent, O\'zbekiston',
    COMPANY_PHONE: '+998901234567',
    COMPANY_EMAIL: 'info@aziztrades.com',
    COMPANY_WEBSITE: 'www.aziztrades.com',
    COMPANY_INN: '123456789',
    COMPANY_BANK_ACCOUNT: '20208000000000000000',
    COMPANY_BANK_NAME: 'Milliy Bank',
    COMPANY_MFO: '00014',
    
    // Soliq va faktura
    TAX_RATE: '12',
    INVOICE_PREFIX: 'INV',
    INVOICE_START_NUMBER: '1',
    PAYMENT_TERMS_DAYS: '30',
    
    // Biznes sozlamalari
    LOW_STOCK_THRESHOLD: '10',
    CRITICAL_STOCK_THRESHOLD: '5',
    OPTIMAL_STOCK_MULTIPLIER: '2',
    DEBT_ALERT_DAYS: '30',
    DEBT_CRITICAL_DAYS: '60',
    MAX_CREDIT_LIMIT: '100000',
    AUTO_REORDER_ENABLED: 'false',
    
    // Narxlash
    DEFAULT_PROFIT_MARGIN: '20',
    VIP_DISCOUNT: '10',
    BULK_DISCOUNT_THRESHOLD: '100',
    BULK_DISCOUNT_PERCENT: '5',
    
    // Ishlab chiqarish
    PRODUCTION_SHIFT_HOURS: '8',
    QUALITY_CHECK_FREQUENCY: 'every_batch',
    DEFECT_TOLERANCE_PERCENT: '2',
    
    // Telegram
    TELEGRAM_BOT_TOKEN: '',
    TELEGRAM_ADMIN_CHAT_ID: '',
    TELEGRAM_NOTIFICATIONS_ENABLED: 'true',
    TELEGRAM_DAILY_REPORT_TIME: '18:00',
    
    // SMS
    SMS_API_KEY: '',
    SMS_PROVIDER: 'eskiz',
    SMS_NOTIFICATIONS_ENABLED: 'false',
    
    // Email
    EMAIL_SMTP_HOST: '',
    EMAIL_SMTP_PORT: '587',
    EMAIL_USERNAME: '',
    EMAIL_PASSWORD: '',
    EMAIL_FROM_NAME: 'AzizTrades ERP',
    EMAIL_NOTIFICATIONS_ENABLED: 'false',
    
    // Tizim
    BACKUP_FREQUENCY: 'daily',
    BACKUP_RETENTION_DAYS: '30',
    AUTO_BACKUP_ENABLED: 'true',
    LANGUAGE: 'uz',
    TIMEZONE: 'Asia/Tashkent',
    DATE_FORMAT: 'DD.MM.YYYY',
    TIME_FORMAT: '24h',
    CURRENCY_DISPLAY: 'symbol',
    
    // Xavfsizlik
    SESSION_TIMEOUT_MINUTES: '60',
    PASSWORD_MIN_LENGTH: '6',
    PASSWORD_REQUIRE_SPECIAL: 'false',
    TWO_FACTOR_ENABLED: 'false',
    LOGIN_ATTEMPTS_LIMIT: '5',
    
    // Hisobotlar
    REPORT_LOGO_URL: '',
    REPORT_FOOTER_TEXT: 'AzizTrades ERP - Biznesingiz uchun',
    REPORT_SHOW_WATERMARK: 'false',
    
    // Integratsiyalar
    CLICK_MERCHANT_ID: '',
    CLICK_SERVICE_ID: '',
    CLICK_SECRET_KEY: '',
    PAYME_MERCHANT_ID: '',
    PAYME_SECRET_KEY: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Sozlamalarni yuklashda xatolik');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings', settings);
      alert('Sozlamalar muvaffaqiyatli saqlandi!');
    } catch (error) {
      alert('Sozlamalarni saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Tizim Sozlamalari</h1>

      {/* Valyuta Kurslari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">Valyuta Kurslari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="USD → UZS Kursi"
              type="number"
              value={settings.USD_TO_UZS_RATE}
              onChange={(e) => updateSetting('USD_TO_UZS_RATE', e.target.value)}
            />
            <Input
              label="EUR → UZS Kursi"
              type="number"
              value={settings.EUR_TO_UZS_RATE}
              onChange={(e) => updateSetting('EUR_TO_UZS_RATE', e.target.value)}
            />
            <Input
              label="RUB → UZS Kursi"
              type="number"
              value={settings.RUB_TO_UZS_RATE}
              onChange={(e) => updateSetting('RUB_TO_UZS_RATE', e.target.value)}
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs sm:text-sm">
              <strong>Joriy kurslar:</strong> 1 USD = {settings.USD_TO_UZS_RATE} UZS, 
              1 EUR = {settings.EUR_TO_UZS_RATE} UZS, 
              1 RUB = {settings.RUB_TO_UZS_RATE} UZS
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Kompaniya Ma'lumotlari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <CardTitle>Kompaniya Ma'lumotlari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kompaniya Nomi"
              value={settings.COMPANY_NAME}
              onChange={(e) => updateSetting('COMPANY_NAME', e.target.value)}
            />
            <Input
              label="Telefon Raqami"
              value={settings.COMPANY_PHONE}
              onChange={(e) => updateSetting('COMPANY_PHONE', e.target.value)}
            />
            <Input
              label="Email Manzili"
              type="email"
              value={settings.COMPANY_EMAIL}
              onChange={(e) => updateSetting('COMPANY_EMAIL', e.target.value)}
            />
            <Input
              label="Manzil"
              value={settings.COMPANY_ADDRESS}
              onChange={(e) => updateSetting('COMPANY_ADDRESS', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Soliq va Faktura */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Soliq va Faktura Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="QQS Foizi (%)"
              type="number"
              value={settings.TAX_RATE}
              onChange={(e) => updateSetting('TAX_RATE', e.target.value)}
            />
            <Input
              label="Faktura Prefiksi"
              value={settings.INVOICE_PREFIX}
              onChange={(e) => updateSetting('INVOICE_PREFIX', e.target.value)}
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Misol:</strong> Faktura raqami: {settings.INVOICE_PREFIX}-2024-001, QQS: {settings.TAX_RATE}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Biznes Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Biznes Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kam Zaxira Chegarasi (qop)"
              type="number"
              value={settings.LOW_STOCK_THRESHOLD}
              onChange={(e) => updateSetting('LOW_STOCK_THRESHOLD', e.target.value)}
            />
            <Input
              label="Qarz Ogohlantirish (kun)"
              type="number"
              value={settings.DEBT_ALERT_DAYS}
              onChange={(e) => updateSetting('DEBT_ALERT_DAYS', e.target.value)}
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              Zaxira {settings.LOW_STOCK_THRESHOLD} qopdan kam bo'lsa ogohlantirish, qarz {settings.DEBT_ALERT_DAYS} kundan oshsa eslatma
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>Telegram Integratsiyasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Bot Token"
              type="password"
              value={settings.TELEGRAM_BOT_TOKEN}
              onChange={(e) => updateSetting('TELEGRAM_BOT_TOKEN', e.target.value)}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            />
            <Input
              label="Admin Chat ID"
              value={settings.TELEGRAM_ADMIN_CHAT_ID}
              onChange={(e) => updateSetting('TELEGRAM_ADMIN_CHAT_ID', e.target.value)}
              placeholder="123456789"
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Qo'llanma:</strong> @BotFather dan bot yarating va tokenni oling. Chat ID ni @userinfobot dan bilib oling.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMS Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>SMS Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            label="SMS API Kaliti"
            type="password"
            value={settings.SMS_API_KEY}
            onChange={(e) => updateSetting('SMS_API_KEY', e.target.value)}
            placeholder="SMS xizmati API kaliti"
          />
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              SMS xizmati (Eskiz.uz, Playmobile.uz) dan API kalitini oling
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Email Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              value={settings.EMAIL_SMTP_HOST}
              onChange={(e) => updateSetting('EMAIL_SMTP_HOST', e.target.value)}
              placeholder="smtp.gmail.com"
            />
            <Input
              label="SMTP Port"
              type="number"
              value={settings.EMAIL_SMTP_PORT}
              onChange={(e) => updateSetting('EMAIL_SMTP_PORT', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={settings.EMAIL_USERNAME}
              onChange={(e) => updateSetting('EMAIL_USERNAME', e.target.value)}
            />
            <Input
              label="Parol"
              type="password"
              value={settings.EMAIL_PASSWORD}
              onChange={(e) => updateSetting('EMAIL_PASSWORD', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tizim Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <CardTitle>Tizim Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Backup Chastotasi</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-2"
                value={settings.BACKUP_FREQUENCY}
                onChange={(e) => updateSetting('BACKUP_FREQUENCY', e.target.value)}
              >
                <option value="daily">Har kuni</option>
                <option value="weekly">Haftada bir marta</option>
                <option value="monthly">Oyda bir marta</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Til</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-2"
                value={settings.LANGUAGE}
                onChange={(e) => updateSetting('LANGUAGE', e.target.value)}
              >
                <option value="uz">O'zbek</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Vaqt Zonasi</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-2"
                value={settings.TIMEZONE}
                onChange={(e) => updateSetting('TIMEZONE', e.target.value)}
              >
                <option value="Asia/Tashkent">Toshkent</option>
                <option value="Asia/Samarkand">Samarqand</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Narxlash Strategiyalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            <CardTitle>Narxlash Strategiyalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Standart Foyda Marjasi (%)"
              type="number"
              value={settings.DEFAULT_PROFIT_MARGIN}
              onChange={(e) => updateSetting('DEFAULT_PROFIT_MARGIN', e.target.value)}
            />
            <Input
              label="VIP Mijozlar Chegirmasi (%)"
              type="number"
              value={settings.VIP_DISCOUNT}
              onChange={(e) => updateSetting('VIP_DISCOUNT', e.target.value)}
            />
            <Input
              label="Ulgurji Chegirma Chegarasi (qop)"
              type="number"
              value={settings.BULK_DISCOUNT_THRESHOLD}
              onChange={(e) => updateSetting('BULK_DISCOUNT_THRESHOLD', e.target.value)}
            />
            <Input
              label="Ulgurji Chegirma Foizi (%)"
              type="number"
              value={settings.BULK_DISCOUNT_PERCENT}
              onChange={(e) => updateSetting('BULK_DISCOUNT_PERCENT', e.target.value)}
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p>
              Standart foyda: {settings.DEFAULT_PROFIT_MARGIN}%, VIP chegirma: {settings.VIP_DISCOUNT}%, 
              {settings.BULK_DISCOUNT_THRESHOLD}+ qop uchun {settings.BULK_DISCOUNT_PERCENT}% chegirma
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ishlab Chiqarish Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-primary" />
            <CardTitle>Ishlab Chiqarish Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Smena Soatlari"
              type="number"
              value={settings.PRODUCTION_SHIFT_HOURS}
              onChange={(e) => updateSetting('PRODUCTION_SHIFT_HOURS', e.target.value)}
            />
            <div>
              <label className="text-sm font-medium">Sifat Nazorati</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-2"
                value={settings.QUALITY_CHECK_FREQUENCY}
                onChange={(e) => updateSetting('QUALITY_CHECK_FREQUENCY', e.target.value)}
              >
                <option value="every_batch">Har partiya</option>
                <option value="daily">Kunlik</option>
                <option value="weekly">Haftalik</option>
              </select>
            </div>
            <Input
              label="Nuqson Tolerantligi (%)"
              type="number"
              value={settings.DEFECT_TOLERANCE_PERCENT}
              onChange={(e) => updateSetting('DEFECT_TOLERANCE_PERCENT', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* To'lov Tizimi Integratsiyalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle>To'lov Tizimi Integratsiyalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-3">Click</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Merchant ID"
                  value={settings.CLICK_MERCHANT_ID}
                  onChange={(e) => updateSetting('CLICK_MERCHANT_ID', e.target.value)}
                  placeholder="12345"
                />
                <Input
                  label="Service ID"
                  value={settings.CLICK_SERVICE_ID}
                  onChange={(e) => updateSetting('CLICK_SERVICE_ID', e.target.value)}
                  placeholder="67890"
                />
                <Input
                  label="Secret Key"
                  type="password"
                  value={settings.CLICK_SECRET_KEY}
                  onChange={(e) => updateSetting('CLICK_SECRET_KEY', e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-3">Payme</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Merchant ID"
                  value={settings.PAYME_MERCHANT_ID}
                  onChange={(e) => updateSetting('PAYME_MERCHANT_ID', e.target.value)}
                />
                <Input
                  label="Secret Key"
                  type="password"
                  value={settings.PAYME_SECRET_KEY}
                  onChange={(e) => updateSetting('PAYME_SECRET_KEY', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Xavfsizlik Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle>Xavfsizlik Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sessiya Vaqti (daqiqa)"
              type="number"
              value={settings.SESSION_TIMEOUT_MINUTES}
              onChange={(e) => updateSetting('SESSION_TIMEOUT_MINUTES', e.target.value)}
            />
            <Input
              label="Parol Minimal Uzunligi"
              type="number"
              value={settings.PASSWORD_MIN_LENGTH}
              onChange={(e) => updateSetting('PASSWORD_MIN_LENGTH', e.target.value)}
            />
            <Input
              label="Login Urinishlar Limiti"
              type="number"
              value={settings.LOGIN_ATTEMPTS_LIMIT}
              onChange={(e) => updateSetting('LOGIN_ATTEMPTS_LIMIT', e.target.value)}
            />
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                checked={settings.TWO_FACTOR_ENABLED === 'true'}
                onChange={(e) => updateSetting('TWO_FACTOR_ENABLED', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Ikki Faktorli Autentifikatsiya</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hisobot Sozlamalari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Hisobot Sozlamalari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Hisobot Logo URL"
              value={settings.REPORT_LOGO_URL}
              onChange={(e) => updateSetting('REPORT_LOGO_URL', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <Input
              label="Hisobot Footer Matni"
              value={settings.REPORT_FOOTER_TEXT}
              onChange={(e) => updateSetting('REPORT_FOOTER_TEXT', e.target.value)}
            />
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                checked={settings.REPORT_SHOW_WATERMARK === 'true'}
                onChange={(e) => updateSetting('REPORT_SHOW_WATERMARK', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Hisobotlarda Watermark Ko'rsatish</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foydalanuvchi Ma'lumotlari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Foydalanuvchi Ma'lumotlari</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ism</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="font-semibold">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Backup - Only for Admins */}
      {user?.role === 'ADMIN' && <DataBackup />}

      {/* Saqlash Tugmasi */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full sm:w-auto px-6 sm:px-8"
        >
          {loading ? 'Saqlanmoqda...' : 'Barcha Sozlamalarni Saqlash'}
        </Button>
      </div>
    </div>
  );
}
