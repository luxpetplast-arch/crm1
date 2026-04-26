export interface SimpleReceiptData {
  saleId: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  currency?: string;
  customer: {
    name: string;
    phone?: string;
    address?: string;
    previousBalanceUZS?: number;
    previousBalanceUSD?: number;
    newBalanceUZS?: number;
    newBalanceUSD?: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    piecesPerBag?: number;
    pricePerUnit: number;
    subtotal: number;
  }>;
  subtotal: number;
  total: number;
  payments: {
    uzs?: number;
    usd?: number;
    click?: number;
  };
  totalPaid: number;
  debt: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export function generateSimpleReceiptHTML(data: SimpleReceiptData): string;
export function generateDeliveryReceiptHTML(data: SimpleReceiptData): string;
