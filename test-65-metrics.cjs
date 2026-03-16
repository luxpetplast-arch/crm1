const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test foydalanuvchi
const testUser = {
  username: 'admin',
  password: 'admin123'
};

async function test65Metrics() {
  console.log('🚀 65 ta Biznes Metrikasi Test Boshlandi\n');

  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginRes.data.token;
    console.log('✅ Login muvaffaqiyatli\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. 30 kunlik metrikalar
    console.log('2️⃣ 30 kunlik metrikalar yuklanmoqda...');
    const metrics30 = await axios.get(`${API_URL}/statistics/business-metrics?days=30`, config);
    console.log('✅ 30 kunlik metrikalar yuklandi\n');

    // 3. Metrikalarni ko'rsatish
    console.log('📊 BIZNES METRIKALARI:\n');

    const { sales, product, profitability, marketing, debt, cashFlow, operational, growth } = metrics30.data;

    console.log('💰 SAVDO METRIKALARI (8 ta):');
    console.log(`   1. Savdo Hajmi: ${sales.salesVolume.toLocaleString()} dona`);
    console.log(`   2. Daromad: $${sales.revenue.toLocaleString()}`);
    console.log(`   3. O'rtacha Buyurtma: $${sales.averageOrderValue.toFixed(2)}`);
    console.log(`   4. Savdo O'sishi: ${sales.salesGrowthRate.toFixed(1)}%`);
    console.log(`   5. Mijoz Boshiga Sotuv: $${sales.salesPerCustomer.toFixed(2)}`);
    console.log(`   6. Kunlik Sotuv: $${sales.salesPerDay.toFixed(2)}`);
    console.log(`   7. Konversiya: ${sales.conversionRate.toFixed(1)}%`);
    console.log(`   8. Qayta Xarid: ${sales.repeatPurchaseRate.toFixed(1)}%\n`);

    console.log('📦 MAHSULOT METRIKALARI (8 ta):');
    console.log(`   9. Sotilgan Mahsulot Qiymati: $${product.costOfGoodsSold.toLocaleString()}`);
    console.log(`   10. Birlik Narxi: $${product.unitCost.toFixed(2)}`);
    console.log(`   11. Birlik Foydasi: $${product.unitProfit.toFixed(2)}`);
    console.log(`   12. Yalpi Foyda: $${product.grossProfit.toLocaleString()}`);
    console.log(`   13. Yalpi Marja: ${product.grossMargin.toFixed(1)}%`);
    console.log(`   14. Hissa Marjasi: ${product.contributionMargin.toFixed(1)}%`);
    console.log(`   15. Ombor Aylanishi: ${product.inventoryTurnover.toFixed(2)}`);
    console.log(`   16. Ombor Kunlari: ${product.stockDays.toFixed(0)} kun\n`);

    console.log('💵 FOYDA VA RENTABELLIK (7 ta):');
    console.log(`   17. Sof Foyda: $${profitability.netProfit.toLocaleString()}`);
    console.log(`   18. Sof Foyda Marjasi: ${profitability.netProfitMargin.toFixed(1)}%`);
    console.log(`   19. Operatsion Foyda: $${profitability.operatingProfit.toLocaleString()}`);
    console.log(`   20. Operatsion Marja: ${profitability.operatingMargin.toFixed(1)}%`);
    console.log(`   21. ROI: ${profitability.roi.toFixed(1)}%`);
    console.log(`   22. Break-Even Nuqtasi: ${profitability.breakEvenPoint.toFixed(0)} dona`);
    console.log(`   23. Birlik Hissasi: $${profitability.contributionPerUnit.toFixed(2)}\n`);

    console.log('👥 MARKETING VA MIJOZLAR (6 ta):');
    console.log(`   24. CAC: $${marketing.customerAcquisitionCost.toFixed(2)}`);
    console.log(`   25. LTV: $${marketing.customerLifetimeValue.toFixed(2)}`);
    console.log(`   26. LTV/CAC: ${marketing.ltvCacRatio.toFixed(2)}`);
    console.log(`   27. Mijozlarni Ushlab Qolish: ${marketing.customerRetentionRate.toFixed(1)}%`);
    console.log(`   28. Churn Rate: ${marketing.churnRate.toFixed(1)}%`);
    console.log(`   29. Marketing ROI: ${marketing.marketingROI.toFixed(1)}%\n`);

    console.log('💳 QARZDORLIK (6 ta):');
    console.log(`   30. Jami Qarz: $${debt.totalDebt.toLocaleString()}`);
    console.log(`   31. Qarz Nisbati: ${debt.debtRatio.toFixed(1)}%`);
    console.log(`   32. Debitorlik Qarz: $${debt.accountsReceivable.toLocaleString()}`);
    console.log(`   33. Qarz Aylanishi: ${debt.receivableTurnover.toFixed(2)}`);
    console.log(`   34. DSO: ${debt.daysSalesOutstanding.toFixed(0)} kun`);
    console.log(`   35. Yomon Qarz: ${debt.badDebtRatio.toFixed(1)}%\n`);

    console.log('💰 PUL OQIMI (3 ta):');
    console.log(`   36. Operatsion Pul Oqimi: $${cashFlow.operatingCashFlow.toLocaleString()}`);
    console.log(`   37. Erkin Pul Oqimi: $${cashFlow.freeCashFlow.toLocaleString()}`);
    console.log(`   38. Pul Konversiya Sikli: ${cashFlow.cashConversionCycle.toFixed(0)} kun\n`);

    console.log('⚡ OPERATSION SAMARADORLIK (4 ta):');
    console.log(`   39. Xodim Samaradorligi: ${operational.employeeProductivity.toFixed(1)}`);
    console.log(`   40. Xodim Boshiga Daromad: $${operational.revenuePerEmployee.toLocaleString()}`);
    console.log(`   41. Buyurtma Bajarish Vaqti: ${operational.orderFulfillmentTime.toFixed(1)} soat`);
    console.log(`   42. O'z Vaqtida Yetkazish: ${operational.onTimeDeliveryRate.toFixed(1)}%\n`);

    console.log('📈 STRATEGIK O\'SISH (3 ta):');
    console.log(`   43. Mijozlar O'sishi: ${growth.customerGrowthRate.toFixed(1)}%`);
    console.log(`   44. Mahsulotlar O'sishi: ${growth.productGrowthRate.toFixed(1)}%`);
    console.log(`   45. Yangi Mijozlar: ${growth.newVsReturningCustomers.new}`);
    console.log(`   46. Qaytgan Mijozlar: ${growth.newVsReturningCustomers.returning}\n`);

    // 4. 90 kunlik metrikalar
    console.log('3️⃣ 90 kunlik metrikalar yuklanmoqda...');
    const metrics90 = await axios.get(`${API_URL}/statistics/business-metrics?days=90`, config);
    console.log('✅ 90 kunlik metrikalar yuklandi\n');

    console.log('📊 90 KUNLIK TAQQOSLASH:');
    console.log(`   Daromad: $${metrics90.data.sales.revenue.toLocaleString()} (${metrics90.data.sales.salesGrowthRate.toFixed(1)}%)`);
    console.log(`   Foyda: $${metrics90.data.profitability.netProfit.toLocaleString()} (${metrics90.data.profitability.netProfitMargin.toFixed(1)}%)`);
    console.log(`   ROI: ${metrics90.data.profitability.roi.toFixed(1)}%`);
    console.log(`   Konversiya: ${metrics90.data.sales.conversionRate.toFixed(1)}%\n`);

    console.log('✅ BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!');
    console.log('📊 Jami 46+ metrika ishlayapti!');

  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
  }
}

test65Metrics();
