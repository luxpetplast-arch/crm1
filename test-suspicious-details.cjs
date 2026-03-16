const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Login
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login muvaffaqiyatli\n');
    return true;
  } catch (error) {
    console.log('❌ Login xatolik:', error.message);
    return false;
  }
}

// API so'rov
async function apiRequest(method, endpoint) {
  return axios({
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
}

async function checkSuspiciousActivities() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        SHUBHALI FAOLIYATLAR BATAFSIL TAHLILI          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    // Ombor shubhali faoliyatlari
    const inventoryRes = await apiRequest('get', '/products/audit/suspicious-activity');
    const inventorySuspicious = inventoryRes.data;
    
    console.log('📦 OMBOR SHUBHALI FAOLIYATLARI\n');
    console.log(`Jami: ${inventorySuspicious.length} ta\n`);
    
    // Xavf darajasi bo'yicha
    const bySeverity = {
      HIGH: inventorySuspicious.filter(s => s.severity === 'HIGH'),
      MEDIUM: inventorySuspicious.filter(s => s.severity === 'MEDIUM'),
      WARNING: inventorySuspicious.filter(s => s.severity === 'WARNING')
    };
    
    console.log('🚨 YUQORI XAVF (HIGH):');
    if (bySeverity.HIGH.length === 0) {
      console.log('   ✅ Yuqori xavfli faoliyat yo\'q\n');
    } else {
      bySeverity.HIGH.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.message}`);
        console.log(`      Turi: ${item.type}`);
        console.log(`      Mahsulot: ${item.productName || 'N/A'}`);
        console.log(`      Miqdor: ${item.quantity || 'N/A'} qop`);
        console.log(`      Vaqt: ${item.time ? new Date(item.time).toLocaleString('uz-UZ') : 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('⚠️  O\'RTA XAVF (MEDIUM):');
    if (bySeverity.MEDIUM.length === 0) {
      console.log('   ✅ O\'rta xavfli faoliyat yo\'q\n');
    } else {
      console.log(`   Jami: ${bySeverity.MEDIUM.length} ta\n`);
      
      // Tunda faoliyatlarni guruhlash
      const nightActivities = bySeverity.MEDIUM.filter(s => s.type === 'NIGHT_ACTIVITY');
      if (nightActivities.length > 0) {
        console.log('   🌙 TUNDA FAOLIYAT:');
        
        // Soat bo'yicha guruhlash
        const byHour = {};
        nightActivities.forEach(item => {
          if (item.time) {
            const hour = new Date(item.time).getHours();
            byHour[hour] = (byHour[hour] || 0) + 1;
          }
        });
        
        console.log('   Soat bo\'yicha taqsimot:');
        Object.entries(byHour).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([hour, count]) => {
          console.log(`      ${hour}:00 - ${count} ta harakat`);
        });
        console.log('');
        
        // Birinchi 3 ta tunda faoliyatni ko'rsatish
        console.log('   Misol harakatlar:');
        nightActivities.slice(0, 3).forEach((item, idx) => {
          const hour = item.time ? new Date(item.time).getHours() : 'N/A';
          console.log(`      ${idx + 1}. ${item.message}`);
          console.log(`         Vaqt: ${item.time ? new Date(item.time).toLocaleString('uz-UZ') : 'N/A'}`);
        });
        console.log('');
      }
    }
    
    console.log('⚡ OGOHLANTIRISH (WARNING):');
    if (bySeverity.WARNING.length === 0) {
      console.log('   ✅ Ogohlantirish yo\'q\n');
    } else {
      bySeverity.WARNING.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.message}`);
        console.log(`      Turi: ${item.type}`);
        console.log(`      Soni: ${item.count || 'N/A'}`);
        console.log('');
      });
    }
    
    // Tavsiyalar
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                      TAVSIYALAR                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    if (bySeverity.HIGH.length > 0) {
      console.log('🔴 YUQORI XAVF:');
      console.log('   - Katta miqdordagi o\'zgarishlarni tekshiring');
      console.log('   - Mas\'ul shaxslar bilan gaplashing');
      console.log('   - Ombor inventarizatsiyasini o\'tkazing\n');
    }
    
    if (bySeverity.MEDIUM.length > 10) {
      console.log('🟡 O\'RTA XAVF:');
      console.log('   - Tunda ishlash tartibi belgilang');
      console.log('   - Ish vaqtini optimallashtiring');
      console.log('   - Kechki smena uchun maxsus ruxsat kiriting\n');
    }
    
    if (bySeverity.WARNING.length > 0) {
      console.log('🟠 OGOHLANTIRISH:');
      console.log('   - Ko\'p harakatlar qilayotgan foydalanuvchilarni monitoring qiling');
      console.log('   - Avtomatlashtirish imkoniyatlarini ko\'rib chiqing\n');
    }
    
    // Umumiy holat
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                   UMUMIY HOLAT                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    const totalSuspicious = inventorySuspicious.length;
    if (totalSuspicious === 0) {
      console.log('✅ Shubhali faoliyat topilmadi. Tizim normal ishlayapti.\n');
    } else if (totalSuspicious < 10) {
      console.log('🟢 Kam shubhali faoliyat. Tizim yaxshi ishlayapti.\n');
    } else if (totalSuspicious < 20) {
      console.log('🟡 O\'rtacha shubhali faoliyat. Monitoring davom ettiring.\n');
    } else {
      console.log('🔴 Ko\'p shubhali faoliyat. Tizimni tekshiring!\n');
    }
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

async function main() {
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('Login amalga oshmadi');
    return;
  }
  
  await checkSuspiciousActivities();
}

main();
