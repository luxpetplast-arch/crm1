// Mijoz qarzini yangilash API endpoint
app.put('/api/customers/:id/debt', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, description } = req.body;
    
    // Mijozni topish
    const customer = await prisma.customer.findUnique({
      where: { id }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Mijoz topilmadi' });
    }
    
    // Qarz limitini tekshirish
    const currentDebt = customer.debtUSD + (customer.debtUZS / 12500);
    const newDebtUSD = currency === 'USD' ? amount : amount / 12500;
    const newDebtUZS = currency === 'UZS' ? amount : amount * 12500;
    
    const totalNewDebt = currentDebt + newDebtUSD;
    
    // Qarz limitlari
    const limits = {
      UZS: 800000,
      USD: 550
    };
    
    if (totalNewDebt > limits[currency]) {
      return res.status(400).json({ 
        error: `Qarz limitidan oshib ketdi. Maksimal qarz: ${limits[currency]} ${currency}` 
      });
    }
    
    // Mijoz qarzini yangilash
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        debtUSD: customer.debtUSD + newDebtUSD,
        debtUZS: customer.debtUZS + newDebtUZS,
        updatedAt: new Date()
      }
    });
    
    // Qarz tarixini saqlash
    await prisma.debtHistory.create({
      data: {
        customerId: id,
        amount: currency === 'USD' ? newDebtUSD : newDebtUZS / 12500,
        currency,
        description: description || 'Qarz qo\'shildi',
        type: 'DEBT',
        createdAt: new Date()
      }
    });
    
    res.json({
      success: true,
      customer: updatedCustomer,
      message: 'Mijoz qarzi muvaffaqiyatli yangilandi'
    });
    
  } catch (error) {
    console.error('Error updating customer debt:', error);
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

// Mijoz qarzini to'lash API endpoint
app.post('/api/customers/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, description } = req.body;
    
    // Mijozni topish
    const customer = await prisma.customer.findUnique({
      where: { id }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Mijoz topilmadi' });
    }
    
    // To'lov summasini dollarga aylantirish
    const paymentUSD = currency === 'USD' ? amount : amount / 12500;
    const paymentUZS = currency === 'UZS' ? amount : amount * 12500;
    
    // Mijoz qarzini kamaytirish
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        debtUSD: Math.max(0, customer.debtUSD - paymentUSD),
        debtUZS: Math.max(0, customer.debtUZS - paymentUZS),
        updatedAt: new Date()
      }
    });
    
    // To'lov tarixini saqlash
    await prisma.paymentHistory.create({
      data: {
        customerId: id,
        amount: currency === 'USD' ? paymentUSD : paymentUZS / 12500,
        currency,
        description: description || 'To\'lov qilindi',
        type: 'PAYMENT',
        createdAt: new Date()
      }
    });
    
    res.json({
      success: true,
      customer: updatedCustomer,
      message: 'To\'lov muvaffaqiyatli amalga oshirildi'
    });
    
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

// Mijoz qarz tarixini olish API endpoint
app.get('/api/customers/:id/debt-history', async (req, res) => {
  try {
    const { id } = req.params;
    
    const debtHistory = await prisma.debtHistory.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    const paymentHistory = await prisma.paymentHistory.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      debtHistory,
      paymentHistory,
      totalDebt: {
        USD: debtHistory.reduce((sum, item) => sum + (item.currency === 'USD' ? item.amount : item.amount / 12500), 0),
        UZS: debtHistory.reduce((sum, item) => sum + (item.currency === 'UZS' ? item.amount : item.amount * 12500), 0)
      },
      totalPayments: {
        USD: paymentHistory.reduce((sum, item) => sum + (item.currency === 'USD' ? item.amount : item.amount / 12500), 0),
        UZS: paymentHistory.reduce((sum, item) => sum + (item.currency === 'UZS' ? item.amount : item.amount * 12500), 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching debt history:', error);
    res.status(500).json({ error: 'Server xatoligi' });
  }
});
