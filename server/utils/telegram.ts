import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function sendTelegramMessage(chatId: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return false;
  }

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

export async function sendInvoiceToTelegram(invoice: any, customer: any, items: any[]) {
  const message = `
🧾 <b>Yangi Faktura</b>

📋 Faktura: ${invoice.invoiceNumber}
👤 Mijoz: ${customer.name}
💰 Summa: ${invoice.totalAmount.toLocaleString()} ${invoice.currency}

📦 <b>Mahsulotlar:</b>
${items.map(item => `• ${item.product.name}: ${item.quantity} qop × ${item.pricePerBag} = ${item.subtotal}`).join('\n')}

📅 Sana: ${new Date(invoice.createdAt).toLocaleString('uz-UZ')}
  `.trim();

  return sendTelegramMessage(TELEGRAM_ADMIN_CHAT_ID!, message);
}

export async function sendLowStockAlert(product: any) {
  const message = `
⚠️ <b>Ombor Ogohlantirish</b>

📦 Mahsulot: ${product.name}
📊 Qolgan: ${product.currentStock} qop
🔴 Minimal: ${product.minStockLimit} qop

Iltimos, ishlab chiqarishni rejalashtiring!
  `.trim();

  return sendTelegramMessage(TELEGRAM_ADMIN_CHAT_ID!, message);
}

export async function sendDebtAlert(customer: any) {
  const message = `
💳 <b>Qarz Ogohlantirish</b>

👤 Mijoz: ${customer.name}
💰 Qarz: ${customer.debt.toLocaleString()} UZS
📅 Oxirgi to'lov: ${customer.lastPayment ? new Date(customer.lastPayment).toLocaleDateString('uz-UZ') : 'Yo\'q'}

Iltimos, mijoz bilan bog'laning!
  `.trim();

  return sendTelegramMessage(TELEGRAM_ADMIN_CHAT_ID!, message);
}
