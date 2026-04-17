import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all loans
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, employeeId, overdue } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (overdue === 'true') {
      where.status = 'ACTIVE';
      where.dueDate = { lt: new Date() };
    }
    
    const loans = await prisma.employeeLoan.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: { select: { name: true } },
            position: { select: { name: true } }
          }
        },
        repayments: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Create loan
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { employeeId, amount, currency, purpose, description, dueDate, interestRate } = req.body;
    
    if (!employeeId || !amount) {
      return res.status(400).json({ error: 'Employee ID and amount are required' });
    }
    
    const loan = await prisma.employeeLoan.create({
      data: {
        employeeId,
        amount: parseFloat(amount),
        currency: currency || 'UZS',
        purpose,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        interestRate: interestRate || 0,
        remainingAmount: parseFloat(amount),
        issuedBy: req.user?.id || '',
        issuedByName: req.user?.name || ''
      }
    });
    
    res.status(201).json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

// Add repayment
router.post('/:id/repay', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, description, isSalaryDeduction, payrollPeriod } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    const loan = await prisma.employeeLoan.findUnique({ where: { id } });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    
    const repaymentAmount = parseFloat(amount);
    const newTotalRepaid = loan.totalRepaid + repaymentAmount;
    const newRemaining = loan.amount - newTotalRepaid;
    
    // Create repayment
    const repayment = await prisma.loanRepayment.create({
      data: {
        loanId: id,
        amount: repaymentAmount,
        currency: loan.currency,
        paymentMethod: paymentMethod || 'CASH',
        description,
        isSalaryDeduction: isSalaryDeduction || false,
        payrollPeriod,
        receivedBy: req.user?.id || '',
        receivedByName: req.user?.name || ''
      }
    });
    
    // Update loan
    const newStatus = newRemaining <= 0 ? 'REPAID' : newRemaining < loan.amount ? 'PARTIAL' : 'ACTIVE';
    
    await prisma.employeeLoan.update({
      where: { id },
      data: {
        totalRepaid: newTotalRepaid,
        remainingAmount: newRemaining,
        status: newStatus
      }
    });
    
    res.json(repayment);
  } catch (error) {
    console.error('Error processing repayment:', error);
    res.status(500).json({ error: 'Failed to process repayment' });
  }
});

// Get overdue loans
router.get('/report/overdue', authenticate, async (req: AuthRequest, res) => {
  try {
    const overdueLoans = await prisma.employeeLoan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      },
      include: {
        employee: {
          select: {
            fullName: true,
            phone: true,
            telegramChatId: true
          }
        }
      }
    });
    
    res.json(overdueLoans);
  } catch (error) {
    console.error('Error fetching overdue loans:', error);
    res.status(500).json({ error: 'Failed to fetch overdue loans' });
  }
});

// Get single loan by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const loan = await prisma.employeeLoan.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: { select: { name: true } },
            position: { select: { name: true } },
            phone: true,
            telegramChatId: true
          }
        },
        repayments: { 
          orderBy: { createdAt: 'desc' } 
        }
      }
    });
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

// Update loan
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate, interestRate, description } = req.body;
    
    const loan = await prisma.employeeLoan.findUnique({ where: { id } });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (interestRate !== undefined) updateData.interestRate = parseFloat(interestRate);
    if (description !== undefined) updateData.description = description;
    
    const updatedLoan = await prisma.employeeLoan.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ error: 'Failed to update loan' });
  }
});

export default router;
