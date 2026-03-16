// Print service for sales - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

class PrintService {
    constructor() {
        this.printerName = 'Xprinter XP-365B';
        this.isEnabled = true;
    }

    // Generate 80mm width sales receipt
    generateSalesReceipt(orderData) {
        const date = new Date().toLocaleDateString('uz-UZ');
        const time = new Date().toLocaleTimeString('uz-UZ');
        
        const receipt = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: ${date}  Vaqt: ${time}
Buyurtma raqami: ${orderData.orderNumber}
Kassir: ${orderData.cashier || 'Admin'}
Mijoz: ${orderData.customer?.name || 'Mijoz'}
Tel: ${orderData.customer?.phone || ''}
----------------------------------------
Mahsulot                Soni  Narx  Jami
----------------------------------------
${orderData.items?.map(item => 
    `${(item.product?.name || item.productName || 'Noma\'lum').padEnd(22)} ${item.quantityBags.toString().padStart(3)} ${item.unitPrice?.toString().padStart(5)} ${(item.quantityBags * (item.unitPrice || 0)).toString().padStart(5)}`
).join('\n') || 'Mahsulotlar mavjud emas'}
----------------------------------------
Jami mahsulotlar: ${orderData.items?.length || 0} ta
Umumiy summa: ${orderData.totalAmount} so'm
To'lov turi: ${orderData.paymentType || 'Naqd'}
To'langan: ${orderData.paidAmount || orderData.totalAmount} so'm
Qaytim: ${(orderData.paidAmount || orderData.totalAmount) - orderData.totalAmount} so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: ${orderData.customer?.name || '[Mijoz ismi]'}
Telefon: ${orderData.customer?.phone || '[Telefon]'}
Manzil: ${orderData.customer?.address || '[Manzil]'}
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: SLS-${orderData.id || Date.now()}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
        `.trim();
        
        return receipt;
    }

    // Print sales receipt
    async printSalesReceipt(orderData) {
        if (!this.isEnabled) {
            console.log('🖨️  Printer o\'chirilgan');
            return;
        }

        try {
            const receipt = this.generateSalesReceipt(orderData);
            const tempFile = `./sales-receipt-${Date.now()}.txt`;
            
            fs.writeFileSync(tempFile, receipt, 'utf8');
            console.log(`📄 Savdo cheki yaratildi: ${orderData.orderNumber}`);
            
            // Send to printer
            await execAsync(`powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${this.printerName}'"`);
            
            // Clean up temp file
            setTimeout(() => {
                try {
                    fs.unlinkSync(tempFile);
                } catch (error) {
                    console.log('Temp file cleanup error:', error.message);
                }
            }, 5000);
            
            console.log(`✅ Savdo cheki chop etildi: ${orderData.totalAmount} so'm`);
            return true;
            
        } catch (error) {
            console.error('❌ Savdo ch chop etish xatolik:', error.message);
            return false;
        }
    }

    // Test print
    async testPrint() {
        const testData = {
            orderNumber: 'TEST-001',
            cashier: 'Admin',
            customer: {
                name: 'Test Mijoz',
                phone: '+998 90 123-45-67',
                address: 'Toshkent'
            },
            items: [
                { productName: 'Plastik butilka 1.5L', quantityBags: 3, unitPrice: 12000 },
                { productName: 'Plastik qop 5kg', quantityBags: 2, unitPrice: 8000 }
            ],
            totalAmount: 52000,
            paymentType: 'Naqd',
            paidAmount: 52000
        };

        return await this.printSalesReceipt(testData);
    }

    // Enable/disable printer
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🖨️  Printer ${enabled ? 'yoqildi' : 'o\'chirildi'}`);
    }

    // Check printer status
    async checkPrinterStatus() {
        try {
            const { stdout } = await execAsync('powershell -Command "Get-Printer -Name \'Xprinter XP-365B\' | Select-Object Name, PrinterStatus"');
            console.log('🖨️  Printer holati:', stdout.trim());
            return true;
        } catch (error) {
            console.error('❌ Printer holatini tekshirib bo\'lmadi:', error.message);
            return false;
        }
    }
}

// Create global print service instance
const printService = new PrintService();

// Auto-integration with sales
const integrateWithSales = () => {
    console.log('🔗 Savdo tizimi bilan integratsiya...');
    
    // Override the handleSellOrder function to include printing
    const originalHandleSellOrder = window.handleSellOrder;
    
    window.handleSellOrder = async function(...args) {
        console.log('🛒 Savdo amalga oshirilmoqda...');
        
        // Call original function
        let result;
        if (originalHandleSellOrder) {
            result = await originalHandleSellOrder.apply(this, args);
        }
        
        // Print receipt after successful sale
        if (result !== false) {
            console.log('🖨️  Chek chop etilmoqda...');
            
            // Get order data (this would come from your app state)
            const orderData = {
                orderNumber: 'ORD-' + Date.now(),
                cashier: 'Admin',
                customer: { name: 'Mijoz' },
                items: [],
                totalAmount: 0,
                paymentType: 'Naqd'
            };
            
            await printService.printSalesReceipt(orderData);
        }
        
        return result;
    };
    
    console.log('✅ Savdo tizimi integratsiyasi yakunlandi');
};

// Export for use
export { PrintService, printService, integrateWithSales };

// Auto-test on load
printService.testPrint().then(success => {
    if (success) {
        console.log('🎉 Print service tayyor!');
        integrateWithSales();
    } else {
        console.log('⚠️ Print service xato bor');
    }
}).catch(console.error);
