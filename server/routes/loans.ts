import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

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
        repayments: { orderBy: { paymentDate: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Create loan
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { employeeId, amount, currency, purpose, description, dueDate, interestRate } = req.body;
    
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
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

// Add repayment
router.post('/:id/repay', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, description, isSalaryDeduction, payrollPeriod } = req.body;
    
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
    res.status(500).json({ error: 'Failed to fetch overdue loans' });
  }
});

export default router;
