// Auto print service for sales - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

class AutoPrintService {
    constructor() {
        this.printerName = 'Xprinter XP-365B';
        this.salesQueue = [];
        this.isPrinting = false;
    }

    // Generate 80mm width cheque
    generateCheque(saleData) {
        const date = new Date().toLocaleDateString('uz-UZ');
        const time = new Date().toLocaleTimeString('uz-UZ');
        
        const cheque = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: ${date}  Vaqt: ${time}
Kassir: ${saleData.cashier || 'Admin'}
Mijoz: ${saleData.customer || 'Mijoz'}
----------------------------------------
Mahsulot                Soni Narx Jami
----------------------------------------
${saleData.items.map(item => 
    `${item.name.padEnd(22)} ${item.qty.toString().padStart(3)} ${item.price.toString().padStart(5)} ${(item.qty * item.price).toString().padStart(5)}`
).join('\n')}
----------------------------------------
Jami tovarlar: ${saleData.totalItems} ta
Umumiy summa: ${saleData.totalAmount} so'm
Chegirma: ${saleData.discount || 0} so'm
To'lov: ${saleData.payment} so'm
Naqd to'lov: ${saleData.cashPayment} so'm
Qaytim: ${saleData.change || 0} so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: ${saleData.customerName || '[Mijoz ismi]'}
Tel: ${saleData.customerPhone || '[Telefon]'}
Manzil: ${saleData.customerAddress || '[Yetkazib berish]'}
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: CHK-${Date.now()}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
        `.trim();
        
        return cheque;
    }

    // Add sale to queue
    async addSale(saleData) {
        console.log('🛒 Savdo qo\'shildi...');
        this.salesQueue.push(saleData);
        
        if (!this.isPrinting) {
            await this.processQueue();
        }
    }

    // Process print queue
    async processQueue() {
        if (this.isPrinting || this.salesQueue.length === 0) {
            return;
        }

        this.isPrinting = true;
        console.log('🖨️  Print navbati boshlandi...');

        while (this.salesQueue.length > 0) {
            const sale = this.salesQueue.shift();
            await this.printCheque(sale);
        }

        this.isPrinting = false;
        console.log('✅ Print navbati tugadi');
    }

    // Print single cheque
    async printCheque(saleData) {
        try {
            const cheque = this.generateCheque(saleData);
            const tempFile = `./temp-cheque-${Date.now()}.txt`;
            
            fs.writeFileSync(tempFile, cheque, 'utf8');
            console.log(`📄 Cheque yaratildi: ${saleData.customer || 'Mijoz'}`);
            
            // Send to printer
            await execAsync(`powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${this.printerName}'"`);
            
            // Clean up temp file
            fs.unlinkSync(tempFile);
            
            console.log(`✅ Cheque chop etildi: ${saleData.totalAmount} so'm`);
            
        } catch (error) {
            console.error('❌ Cheque chop etish xatolik:', error.message);
        }
    }

    // Test with sample data
    async testAutoPrint() {
        console.log('🧪 Avtomatik chop etish testi...\n');
        
        const sampleSale = {
            cashier: 'Admin',
            customer: 'Test Mijoz',
            customerName: 'Ali Valiyev',
            customerPhone: '+998 90 123-45-67',
            customerAddress: 'Toshkent, Chilonzor',
            totalItems: 3,
            totalAmount: 77000,
            discount: 2000,
            payment: 75000,
            cashPayment: 75000,
            change: 0,
            items: [
                { name: 'Plastik butilka 1.5L', qty: 3, price: 12000 },
                { name: 'Plastik qop 5kg', qty: 2, price: 8000 },
                { name: 'Plastik qop 10kg', qty: 1, price: 15000 },
                { name: 'Qadoq qop', qty: 10, price: 1000 }
            ]
        };
        
        await this.addSale(sampleSale);
    }
}

// Create and test service
const autoPrint = new AutoPrintService();
autoPrint.testAutoPrint().catch(console.error);

// Export for use in main application
export { AutoPrintService };
