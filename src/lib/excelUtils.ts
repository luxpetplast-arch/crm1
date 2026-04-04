import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // Agar saveAs bo'lmasa, quyidagi funksiyani ishlatamiz

/**
 * Ma'lumotlarni Excel fayliga eksport qilish
 * @param data Eksport qilinadigan ma'lumotlar massivi
 * @param fileName Fayl nomi (kengaytmasiz)
 * @param sheetName List nomi
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Ma\'lumotlar') => {
  try {
    if (!data || data.length === 0) {
      console.warn('Eksport uchun ma\'lumotlar yo\'q');
      return;
    }

    // 1. Worksheet yaratish
    const ws = XLSX.utils.json_to_sheet(data);

    // 2. Workbook yaratish
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 3. Faylni generatsiya qilish
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // 4. Faylni yuklab olish
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fullFileName = `${fileName}_${new Date().toLocaleDateString()}.xlsx`;
    
    // Brauzerda yuklab olish
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fullFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Excel fayli yaratildi: ${fullFileName}`);
  } catch (error) {
    console.error('❌ Excel eksportda xatolik:', error);
    alert('Excel faylini yaratishda xatolik yuz berdi');
  }
};
