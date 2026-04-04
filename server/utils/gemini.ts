import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function analyzeBusinessWithGemini(businessData: any) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `
    Siz professional biznes tahlilchisiz. Quyidagi zavod (Lux Pet Plast) biznes ma'lumotlarini tahlil qiling va biznes egasiga tavsiyalar bering.
    Tahlilni o'zbek tilida, juda aniq, professional va tushunarli qilib yozing.
    
    BIZNES MA'LUMOTLARI:
    - Umumiy Daromad: ${businessData.totalRevenue} UZS
    - Sof Foyda: ${businessData.netProfit} UZS
    - Umumiy Xarajatlar: ${businessData.totalExpenses} UZS
    - Sotuvlar soni: ${businessData.totalSales}
    - Mijozlar soni: ${businessData.totalCustomers}
    - Faol mijozlar: ${businessData.activeCustomers}
    - Qarzlar: ${businessData.totalDebt} UZS
    
    TOP MAHSULOTLAR:
    ${businessData.topProducts.map((p: any) => `- ${p.name}: ${p.revenue} UZS (${p.quantity} dona)`).join('\n')}
    
    OMBOR HOLATI:
    - Kam qolgan mahsulotlar: ${businessData.lowStockCount}
    - Tugagan mahsulotlar: ${businessData.outOfStockCount}
    
    XAVFLAR VA MUAMMOLAR:
    ${businessData.criticalIssues.join('\n')}
    
    ILTIMOS QUYIDAGI FORMATDA JAVOB BERING:
    1. **Umumiy Xulosa**: Biznesning hozirgi holati haqida 2-3 jumla.
    2. **Yutuqlar**: Nimalar yaxshi ketmoqda?
    3. **Muammolar va Kamchiliklar**: Nimalarga e'tibor berish kerak?
    4. **Strategik Tavsiyalar**: Daromadni oshirish va xarajatlarni kamaytirish uchun aniq qadamlar.
    5. **Bashorat**: Kelgusi 30 kun uchun kutilmalar.
  `;

  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error('Gemini AI tahlilida xatolik yuz berdi');
  }
}
