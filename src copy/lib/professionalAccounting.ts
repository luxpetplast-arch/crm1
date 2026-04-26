import { Currency, CurrencyTransaction, CurrencyAccount, currencyManager } from './professionalCurrency';

// Accounting Entry Types
export enum AccountingEntryType {
  DEBIT = 'debit',
  CHARGE = 'charge',
  CREDIT = 'credit',
  INCOME = 'income',
  EXPENSE = 'expense',
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
}

// Chart of Accounts
export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountingEntryType;
  parent?: string;
  currency: Currency;
  balance: number;
  isActive: boolean;
  description?: string;
  category: string;
}

// Journal Entry Interface
export interface JournalEntry {
  id: string;
  date: Date;
  reference: string;
  description: string;
  entries: LedgerEntry[];
  status: 'draft' | 'posted' | 'cancelled';
  totalDebit: Record<Currency, number>;
  totalCredit: Record<Currency, number>;
  createdBy: string;
  createdAt: Date;
  postedAt?: Date;
  attachments?: string[];
  metadata?: Record<string, any>;
}

// Ledger Entry Interface
export interface LedgerEntry {
  id: string;
  accountId: string;
  entryId: string;
  type: AccountingEntryType;
  amount: number;
  currency: Currency;
  description: string;
  reference?: string;
  date: Date;
  balance: number;
  reconciled: boolean;
  reconciledAt?: Date;
  taxCode?: string;
  taxAmount?: number;
}

// Trial Balance Interface
export interface TrialBalance {
  date: Date;
  accounts: {
    accountId: string;
    accountName: string;
    accountType: AccountingEntryType;
    currency: Currency;
    debitBalance: number;
    creditBalance: number;
    balance: number;
  }[];
  totalDebits: Record<Currency, number>;
  totalCredits: Record<Currency, number>;
  isBalanced: boolean;
}

// Financial Statement Types
export interface BalanceSheet {
  date: Date;
  assets: {
    currentAssets: AccountBalance[];
    nonCurrentAssets: AccountBalance[];
    totalAssets: Record<Currency, number>;
  };
  liabilities: {
    currentLiabilities: AccountBalance[];
    nonCurrentLiabilities: AccountBalance[];
    totalLiabilities: Record<Currency, number>;
  };
  equity: {
    shareCapital: AccountBalance[];
    retainedEarnings: AccountBalance[];
    totalEquity: Record<Currency, number>;
  };
  totalLiabilitiesAndEquity: Record<Currency, number>;
}

export interface IncomeStatement {
  period: {
    start: Date;
    end: Date;
  };
  revenue: {
    operatingRevenue: AccountBalance[];
    otherRevenue: AccountBalance[];
    totalRevenue: Record<Currency, number>;
  };
  expenses: {
    operatingExpenses: AccountBalance[];
    otherExpenses: AccountBalance[];
    totalExpenses: Record<Currency, number>;
  };
  grossProfit: Record<Currency, number>;
  operatingIncome: Record<Currency, number>;
  netIncome: Record<Currency, number>;
}

export interface CashFlowStatement {
  period: {
    start: Date;
    end: Date;
  };
  operatingActivities: {
    entries: LedgerEntry[];
    netCashFlow: Record<Currency, number>;
  };
  investingActivities: {
    entries: LedgerEntry[];
    netCashFlow: Record<Currency, number>;
  };
  financingActivities: {
    entries: LedgerEntry[];
    netCashFlow: Record<Currency, number>;
  };
  netChangeInCash: Record<Currency, number>;
  beginningCashBalance: Record<Currency, number>;
  endingCashBalance: Record<Currency, number>;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: AccountingEntryType;
  currency: Currency;
  balance: number;
  percentage?: number;
}

// Tax Configuration
export interface TaxConfiguration {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: 'vat' | 'income_tax' | 'withholding_tax' | 'other';
  applicableAccounts: string[];
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

// Budget Interface
export interface Budget {
  id: string;
  accountId: string;
  period: {
    start: Date;
    end: Date;
  };
  amount: number;
  currency: Currency;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: 'active' | 'completed' | 'exceeded';
  notes?: string;
}

// Professional Accounting Manager Class
export class ProfessionalAccountingManager {
  private static instance: ProfessionalAccountingManager;
  private chartOfAccounts: Map<string, ChartOfAccount> = new Map();
  private journalEntries: JournalEntry[] = [];
  private ledgerEntries: LedgerEntry[] = [];
  private taxConfigurations: Map<string, TaxConfiguration> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private fiscalYear: { start: Date; end: Date };

  constructor() {
    this.initializeChartOfAccounts();
    this.loadFromStorage();
    this.setFiscalYear();
  }

  static getInstance(): ProfessionalAccountingManager {
    if (!ProfessionalAccountingManager.instance) {
      ProfessionalAccountingManager.instance = new ProfessionalAccountingManager();
    }
    return ProfessionalAccountingManager.instance;
  }

  // Initialize standard chart of accounts
  private initializeChartOfAccounts(): void {
    const standardAccounts: ChartOfAccount[] = [
      // Assets
      { id: '1000', code: '1000', name: 'Current Assets', type: AccountingEntryType.ASSET, currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1010', code: '1010', name: 'Cash', type: AccountingEntryType.ASSET, parent: '1000', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1020', code: '1020', name: 'Bank Accounts', type: AccountingEntryType.ASSET, parent: '1000', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1030', code: '1030', name: 'Accounts Receivable', type: AccountingEntryType.ASSET, parent: '1000', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1040', code: '1040', name: 'Inventory', type: AccountingEntryType.ASSET, parent: '1000', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      
      // Non-current Assets
      { id: '1500', code: '1500', name: 'Non-current Assets', type: AccountingEntryType.ASSET, currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1510', code: '1510', name: 'Equipment', type: AccountingEntryType.ASSET, parent: '1500', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1520', code: '1520', name: 'Vehicles', type: AccountingEntryType.ASSET, parent: '1500', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      { id: '1530', code: '1530', name: 'Buildings', type: AccountingEntryType.ASSET, parent: '1500', currency: Currency.UZS, balance: 0, isActive: true, category: 'assets' },
      
      // Liabilities
      { id: '2000', code: '2000', name: 'Current Liabilities', type: AccountingEntryType.LIABILITY, currency: Currency.UZS, balance: 0, isActive: true, category: 'liabilities' },
      { id: '2010', code: '2010', name: 'Accounts Payable', type: AccountingEntryType.LIABILITY, parent: '2000', currency: Currency.UZS, balance: 0, isActive: true, category: 'liabilities' },
      { id: '2020', code: '2020', name: 'Short-term Loans', type: AccountingEntryType.LIABILITY, parent: '2000', currency: Currency.UZS, balance: 0, isActive: true, category: 'liabilities' },
      { id: '2030', code: '2030', name: 'Accrued Expenses', type: AccountingEntryType.LIABILITY, parent: '2000', currency: Currency.UZS, balance: 0, isActive: true, category: 'liabilities' },
      
      // Non-current Liabilities
      { id: '2500', code: '2500', name: 'Non-current Liabilities', type: AccountingEntryType.LIABILITY, currency: Currency.UZS, balance: 0, isActive: true, category: 'liabilities' },
      { id: '2510', code: '2510', name: 'Long-term Loans', type: AccountingEntryType.LIABILITY, parent: '2500', currency: Currency.UZS, balance: 0, isActive: true, category: 'liabilities' },
      
      // Equity
      { id: '3000', code: '3000', name: 'Equity', type: AccountingEntryType.EQUITY, currency: Currency.UZS, balance: 0, isActive: true, category: 'equity' },
      { id: '3010', code: '3010', name: 'Share Capital', type: AccountingEntryType.EQUITY, parent: '3000', currency: Currency.UZS, balance: 0, isActive: true, category: 'equity' },
      { id: '3020', code: '3020', name: 'Retained Earnings', type: AccountingEntryType.EQUITY, parent: '3000', currency: Currency.UZS, balance: 0, isActive: true, category: 'equity' },
      
      // Revenue
      { id: '4000', code: '4000', name: 'Revenue', type: AccountingEntryType.INCOME, currency: Currency.UZS, balance: 0, isActive: true, category: 'revenue' },
      { id: '4010', code: '4010', name: 'Sales Revenue', type: AccountingEntryType.INCOME, parent: '4000', currency: Currency.UZS, balance: 0, isActive: true, category: 'revenue' },
      { id: '4020', code: '4020', name: 'Service Revenue', type: AccountingEntryType.INCOME, parent: '4000', currency: Currency.UZS, balance: 0, isActive: true, category: 'revenue' },
      { id: '4030', code: '4030', name: 'Other Revenue', type: AccountingEntryType.INCOME, parent: '4000', currency: Currency.UZS, balance: 0, isActive: true, category: 'revenue' },
      
      // Expenses
      { id: '5000', code: '5000', name: 'Expenses', type: AccountingEntryType.EXPENSE, currency: Currency.UZS, balance: 0, isActive: true, category: 'expenses' },
      { id: '5010', code: '5010', name: 'Cost of Goods Sold', type: AccountingEntryType.EXPENSE, parent: '5000', currency: Currency.UZS, balance: 0, isActive: true, category: 'expenses' },
      { id: '5020', code: '5020', name: 'Salaries', type: AccountingEntryType.EXPENSE, parent: '5000', currency: Currency.UZS, balance: 0, isActive: true, category: 'expenses' },
      { id: '5030', code: '5030', name: 'Rent', type: AccountingEntryType.EXPENSE, parent: '5000', currency: Currency.UZS, balance: 0, isActive: true, category: 'expenses' },
      { id: '5040', code: '5040', name: 'Utilities', type: AccountingEntryType.EXPENSE, parent: '5000', currency: Currency.UZS, balance: 0, isActive: true, category: 'expenses' },
      { id: '5050', code: '5050', name: 'Marketing', type: AccountingEntryType.EXPENSE, parent: '5000', currency: Currency.UZS, balance: 0, isActive: true, category: 'expenses' },
    ];

    standardAccounts.forEach(account => {
      this.chartOfAccounts.set(account.id, account);
    });
  }

  // Set fiscal year
  private setFiscalYear(): void {
    const now = new Date();
    const year = now.getFullYear();
    this.fiscalYear = {
      start: new Date(year, 0, 1), // January 1st
      end: new Date(year, 11, 31), // December 31st
    };
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    try {
      const storedAccounts = localStorage.getItem('chart_of_accounts');
      const storedEntries = localStorage.getItem('journal_entries');
      const storedLedger = localStorage.getItem('ledger_entries');
      const storedTaxes = localStorage.getItem('tax_configurations');
      const storedBudgets = localStorage.getItem('budgets');

      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        accounts.forEach((account: ChartOfAccount) => {
          this.chartOfAccounts.set(account.id, account);
        });
      }

      if (storedEntries) {
        this.journalEntries = JSON.parse(storedEntries).map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
          postedAt: e.postedAt ? new Date(e.postedAt) : undefined,
        }));
      }

      if (storedLedger) {
        this.ledgerEntries = JSON.parse(storedLedger).map((e: any) => ({
          ...e,
          date: new Date(e.date),
          reconciledAt: e.reconciledAt ? new Date(e.reconciledAt) : undefined,
        }));
      }

      if (storedTaxes) {
        const taxes = JSON.parse(storedTaxes);
        taxes.forEach((tax: TaxConfiguration) => {
          tax.effectiveFrom = new Date(tax.effectiveFrom);
          tax.effectiveTo = tax.effectiveTo ? new Date(tax.effectiveTo) : undefined;
          this.taxConfigurations.set(tax.id, tax);
        });
      }

      if (storedBudgets) {
        const budgets = JSON.parse(storedBudgets);
        budgets.forEach((budget: Budget) => {
          budget.period.start = new Date(budget.period.start);
          budget.period.end = new Date(budget.period.end);
          this.budgets.set(budget.id, budget);
        });
      }
    } catch (error) {
      console.error('Failed to load accounting data from storage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('chart_of_accounts', JSON.stringify(Array.from(this.chartOfAccounts.values())));
      localStorage.setItem('journal_entries', JSON.stringify(this.journalEntries));
      localStorage.setItem('ledger_entries', JSON.stringify(this.ledgerEntries));
      localStorage.setItem('tax_configurations', JSON.stringify(Array.from(this.taxConfigurations.values())));
      localStorage.setItem('budgets', JSON.stringify(Array.from(this.budgets.values())));
    } catch (error) {
      console.error('Failed to save accounting data to storage:', error);
    }
  }

  // Create journal entry
  createJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'totalDebit' | 'totalCredit'>): JournalEntry {
    // Calculate totals
    const totals = this.calculateEntryTotals(entry.entries);

    // Validate debits equal credits
    if (!this.validateEntryBalance(totals)) {
      throw new Error('Debits must equal credits');
    }

    const journalEntry: JournalEntry = {
      ...entry,
      id: `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      totalDebit: totals.debits,
      totalCredit: totals.credits,
    };

    this.journalEntries.push(journalEntry);

    if (entry.status === 'posted') {
      this.postJournalEntry(journalEntry);
    }

    this.saveToStorage();
    return journalEntry;
  }

  // Calculate entry totals
  private calculateEntryTotals(entries: LedgerEntry[]): {
    debits: Record<Currency, number>;
    credits: Record<Currency, number>;
  } {
    const debits: Record<Currency, number> = {} as Record<Currency, number>;
    const credits: Record<Currency, number> = {} as Record<Currency, number>;

    entries.forEach(entry => {
      if (entry.type === AccountingEntryType.DEBIT || entry.type === AccountingEntryType.EXPENSE || entry.type === AccountingEntryType.ASSET) {
        debits[entry.currency] = (debits[entry.currency] || 0) + entry.amount;
      } else {
        credits[entry.currency] = (credits[entry.currency] || 0) + entry.amount;
      }
    });

    return { debits, credits };
  }

  // Validate entry balance
  private validateEntryBalance(totals: { debits: Record<Currency, number>; credits: Record<Currency, number> }): boolean {
    const allCurrencies = new Set([...Object.keys(totals.debits), ...Object.keys(totals.credits)]);
    
    for (const currency of allCurrencies) {
      const debit = totals.debits[currency] || 0;
      const credit = totals.credits[currency] || 0;
      if (Math.abs(debit - credit) > 0.01) { // Allow for rounding errors
        return false;
      }
    }
    
    return true;
  }

  // Post journal entry
  private postJournalEntry(entry: JournalEntry): void {
    entry.postedAt = new Date();

    entry.entries.forEach(ledgerEntry => {
      const account = this.chartOfAccounts.get(ledgerEntry.accountId);
      if (account) {
        // Update account balance
        if (ledgerEntry.type === AccountingEntryType.DEBIT || ledgerEntry.type === AccountingEntryType.EXPENSE) {
          account.balance += ledgerEntry.amount;
        } else {
          account.balance -= ledgerEntry.amount;
        }

        // Create ledger entry
        const entry: LedgerEntry = {
          ...ledgerEntry,
          id: `le_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          entryId: entry.id,
          balance: account.balance,
          reconciled: false,
        };

        this.ledgerEntries.push(entry);
      }
    });
  }

  // Get trial balance
  getTrialBalance(date: Date = new Date()): TrialBalance {
    const accounts: TrialBalance['accounts'] = [];
    const totalDebits: Record<Currency, number> = {} as Record<Currency, number>;
    const totalCredits: Record<Currency, number> = {} as Record<Currency, number>;

    this.chartOfAccounts.forEach(account => {
      if (account.isActive) {
        const balance = this.getAccountBalance(account.id, date);
        
        let debitBalance = 0;
        let creditBalance = 0;

        if (this.hasDebitBalance(account.type)) {
          debitBalance = balance.balance;
        } else {
          creditBalance = balance.balance;
        }

        accounts.push({
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          currency: account.currency,
          debitBalance,
          creditBalance,
          balance: balance.balance,
        });

        totalDebits[account.currency] = (totalDebits[account.currency] || 0) + debitBalance;
        totalCredits[account.currency] = (totalCredits[account.currency] || 0) + creditBalance;
      }
    });

    const isBalanced = this.validateEntryBalance({ debits: totalDebits, credits: totalCredits });

    return {
      date,
      accounts,
      totalDebits,
      totalCredits,
      isBalanced,
    };
  }

  // Get account balance
  private getAccountBalance(accountId: string, date: Date): { balance: number; currency: Currency } {
    const account = this.chartOfAccounts.get(accountId);
    if (!account) return { balance: 0, currency: Currency.UZS };

    const entries = this.ledgerEntries.filter(
      entry => entry.accountId === accountId && entry.date <= date
    );

    return {
      balance: entries.reduce((sum, entry) => sum + entry.balance, 0),
      currency: account.currency,
    };
  }

  // Check if account has debit balance
  private hasDebitBalance(type: AccountingEntryType): boolean {
    return [
      AccountingEntryType.ASSET,
      AccountingEntryType.EXPENSE,
      AccountingEntryType.DEBIT,
      AccountingEntryType.CHARGE,
    ].includes(type);
  }

  // Generate balance sheet
  generateBalanceSheet(date: Date = new Date()): BalanceSheet {
    const trialBalance = this.getTrialBalance(date);
    
    const assets = this.categorizeAccounts(trialBalance.accounts, [
      AccountingEntryType.ASSET
    ]);
    
    const liabilities = this.categorizeAccounts(trialBalance.accounts, [
      AccountingEntryType.LIABILITY
    ]);
    
    const equity = this.categorizeAccounts(trialBalance.accounts, [
      AccountingEntryType.EQUITY
    ]);

    const totalAssets = this.calculateCategoryTotal(assets);
    const totalLiabilities = this.calculateCategoryTotal(liabilities);
    const totalEquity = this.calculateCategoryTotal(equity);

    return {
      date,
      assets: {
        currentAssets: assets.filter(a => this.isCurrentAsset(a.accountId)),
        nonCurrentAssets: assets.filter(a => !this.isCurrentAsset(a.accountId)),
        totalAssets,
      },
      liabilities: {
        currentLiabilities: liabilities.filter(a => this.isCurrentLiability(a.accountId)),
        nonCurrentLiabilities: liabilities.filter(a => !this.isCurrentLiability(a.accountId)),
        totalLiabilities,
      },
      equity: {
        shareCapital: equity.filter(a => a.accountId === '3010'),
        retainedEarnings: equity.filter(a => a.accountId === '3020'),
        totalEquity,
      },
      totalLiabilitiesAndEquity: this.addCurrencyRecords(totalLiabilities, totalEquity),
    };
  }

  // Generate income statement
  generateIncomeStatement(startDate: Date, endDate: Date): IncomeStatement {
    const revenue = this.getRevenueForPeriod(startDate, endDate);
    const expenses = this.getExpensesForPeriod(startDate, endDate);

    const totalRevenue = this.calculateCategoryTotal(revenue);
    const totalExpenses = this.calculateCategoryTotal(expenses);

    const grossProfit = this.subtractCurrencyRecords(totalRevenue, totalExpenses);
    const operatingIncome = grossProfit; // Simplified
    const netIncome = operatingIncome; // Simplified

    return {
      period: { start: startDate, end: endDate },
      revenue: {
        operatingRevenue: revenue.filter(a => a.accountId.startsWith('401')),
        otherRevenue: revenue.filter(a => a.accountId.startsWith('403')),
        totalRevenue,
      },
      expenses: {
        operatingExpenses: expenses.filter(a => a.accountId.startsWith('50')),
        otherExpenses: expenses.filter(a => a.accountId.startsWith('50')),
        totalExpenses,
      },
      grossProfit,
      operatingIncome,
      netIncome,
    };
  }

  // Generate cash flow statement
  generateCashFlowStatement(startDate: Date, endDate: Date): CashFlowStatement {
    const cashAccounts = ['1010', '1020']; // Cash and Bank Accounts
    const entries = this.ledgerEntries.filter(
      entry => cashAccounts.includes(entry.accountId) && 
               entry.date >= startDate && 
               entry.date <= endDate
    );

    const operatingActivities = entries.filter(e => 
      e.description.toLowerCase().includes('operating') ||
      e.description.toLowerCase().includes('sales') ||
      e.description.toLowerCase().includes('expense')
    );

    const investingActivities = entries.filter(e => 
      e.description.toLowerCase().includes('investment') ||
      e.description.toLowerCase().includes('equipment') ||
      e.description.toLowerCase().includes('asset')
    );

    const financingActivities = entries.filter(e => 
      e.description.toLowerCase().includes('loan') ||
      e.description.toLowerCase().includes('capital') ||
      e.description.toLowerCase().includes('equity')
    );

    const netOperatingCash = this.calculateNetCashFlow(operatingActivities);
    const netInvestingCash = this.calculateNetCashFlow(investingActivities);
    const netFinancingCash = this.calculateNetCashFlow(financingActivities);

    const netChangeInCash = this.addCurrencyRecords(
      this.addCurrencyRecords(netOperatingCash, netInvestingCash),
      netFinancingCash
    );

    const beginningCash = this.getCashBalance(startDate);
    const endingCash = this.addCurrencyRecords(beginningCash, netChangeInCash);

    return {
      period: { start: startDate, end: endDate },
      operatingActivities: {
        entries: operatingActivities,
        netCashFlow: netOperatingCash,
      },
      investingActivities: {
        entries: investingActivities,
        netCashFlow: netInvestingCash,
      },
      financingActivities: {
        entries: financingActivities,
        netCashFlow: netFinancingCash,
      },
      netChangeInCash,
      beginningCashBalance: beginningCash,
      endingCashBalance: endingCash,
    };
  }

  // Helper methods
  private categorizeAccounts(accounts: TrialBalance['accounts'], types: AccountingEntryType[]): AccountBalance[] {
    return accounts
      .filter(account => types.includes(account.accountType))
      .map(account => ({
        accountId: account.accountId,
        accountName: account.accountName,
        accountType: account.accountType,
        currency: account.currency,
        balance: account.balance,
      }));
  }

  private calculateCategoryTotal(accounts: AccountBalance[]): Record<Currency, number> {
    const total: Record<Currency, number> = {} as Record<Currency, number>;

    accounts.forEach(account => {
      total[account.currency] = (total[account.currency] || 0) + account.balance;
    });

    return total;
  }

  private isCurrentAsset(accountId: string): boolean {
    return ['1010', '1020', '1030', '1040'].includes(accountId);
  }

  private isCurrentLiability(accountId: string): boolean {
    return ['2010', '2020', '2030'].includes(accountId);
  }

  private addCurrencyRecords(a: Record<Currency, number>, b: Record<Currency, number>): Record<Currency, number> {
    const result: Record<Currency, number> = {} as Record<Currency, number>;
    
    const allCurrencies = new Set([...Object.keys(a), ...Object.keys(b)]);
    
    for (const currency of allCurrencies) {
      result[currency as Currency] = (a[currency as Currency] || 0) + (b[currency as Currency] || 0);
    }
    
    return result;
  }

  private subtractCurrencyRecords(a: Record<Currency, number>, b: Record<Currency, number>): Record<Currency, number> {
    const result: Record<Currency, number> = {} as Record<Currency, number>;
    
    const allCurrencies = new Set([...Object.keys(a), ...Object.keys(b)]);
    
    for (const currency of allCurrencies) {
      result[currency as Currency] = (a[currency as Currency] || 0) - (b[currency as Currency] || 0);
    }
    
    return result;
  }

  private getRevenueForPeriod(startDate: Date, endDate: Date): AccountBalance[] {
    const revenueAccounts = this.chartOfAccounts
      .filter(account => account.type === AccountingEntryType.INCOME && account.isActive)
      .map(account => ({
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        currency: account.currency,
        balance: this.getAccountBalanceForPeriod(account.id, startDate, endDate),
      }));

    return revenueAccounts;
  }

  private getExpensesForPeriod(startDate: Date, endDate: Date): AccountBalance[] {
    const expenseAccounts = this.chartOfAccounts
      .filter(account => account.type === AccountingEntryType.EXPENSE && account.isActive)
      .map(account => ({
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        currency: account.currency,
        balance: this.getAccountBalanceForPeriod(account.id, startDate, endDate),
      }));

    return expenseAccounts;
  }

  private getAccountBalanceForPeriod(accountId: string, startDate: Date, endDate: Date): number {
    const entries = this.ledgerEntries.filter(
      entry => entry.accountId === accountId && 
               entry.date >= startDate && 
               entry.date <= endDate
    );

    return entries.reduce((sum, entry) => sum + entry.balance, 0);
  }

  private calculateNetCashFlow(entries: LedgerEntry[]): Record<Currency, number> {
    const netFlow: Record<Currency, number> = {} as Record<Currency, number>;

    entries.forEach(entry => {
      netFlow[entry.currency] = (netFlow[entry.currency] || 0) + entry.balance;
    });

    return netFlow;
  }

  private getCashBalance(date: Date): Record<Currency, number> {
    const cashAccounts = ['1010', '1020'];
    let balance: Record<Currency, number> = {} as Record<Currency, number>;

    cashAccounts.forEach(accountId => {
      const accountBalance = this.getAccountBalance(accountId, date);
      balance[accountBalance.currency] = (balance[accountBalance.currency] || 0) + accountBalance.balance;
    });

    return balance;
  }

  // Create budget
  createBudget(budget: Omit<Budget, 'id' | 'actualAmount' | 'variance' | 'variancePercentage' | 'status'>): Budget {
    const newBudget: Budget = {
      ...budget,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actualAmount: 0,
      variance: 0,
      variancePercentage: 0,
      status: 'active',
    };

    this.budgets.set(newBudget.id, newBudget);
    this.saveToStorage();

    return newBudget;
  }

  // Update budget actual amount
  updateBudgetActualAmount(budgetId: string, actualAmount: number): void {
    const budget = this.budgets.get(budgetId);
    if (budget) {
      budget.actualAmount = actualAmount;
      budget.variance = budget.amount - actualAmount;
      budget.variancePercentage = budget.amount > 0 ? (budget.variance / budget.amount) * 100 : 0;
      
      if (Math.abs(budget.variancePercentage) > 100) {
        budget.status = 'exceeded';
      } else if (new Date() > budget.period.end) {
        budget.status = 'completed';
      }

      this.saveToStorage();
    }
  }

  // Get chart of accounts
  getChartOfAccounts(): ChartOfAccount[] {
    return Array.from(this.chartOfAccounts.values());
  }

  // Get journal entries
  getJournalEntries(startDate?: Date, endDate?: Date): JournalEntry[] {
    let entries = this.journalEntries;

    if (startDate) {
      entries = entries.filter(e => e.date >= startDate);
    }

    if (endDate) {
      entries = entries.filter(e => e.date <= endDate);
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Get ledger entries
  getLedgerEntries(accountId?: string, startDate?: Date, endDate?: Date): LedgerEntry[] {
    let entries = this.ledgerEntries;

    if (accountId) {
      entries = entries.filter(e => e.accountId === accountId);
    }

    if (startDate) {
      entries = entries.filter(e => e.date >= startDate);
    }

    if (endDate) {
      entries = entries.filter(e => e.date <= endDate);
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Reconcile account
  reconcileAccount(accountId: string, date: Date): void {
    const entries = this.ledgerEntries.filter(
      entry => entry.accountId === accountId && entry.date <= date
    );

    entries.forEach(entry => {
      entry.reconciled = true;
      entry.reconciledAt = date;
    });

    this.saveToStorage();
  }

  // Get reconciliation status
  getReconciliationStatus(accountId: string): {
    totalEntries: number;
    reconciledEntries: number;
    lastReconciledDate?: Date;
    unreconciledEntries: LedgerEntry[];
  } {
    const entries = this.ledgerEntries.filter(entry => entry.accountId === accountId);
    const reconciled = entries.filter(entry => entry.reconciled);
    const unreconciled = entries.filter(entry => !entry.reconciled);

    return {
      totalEntries: entries.length,
      reconciledEntries: reconciled.length,
      lastReconciledDate: reconciled.length > 0 ? 
        new Date(Math.max(...reconciled.map(e => e.reconciledAt!.getTime()))) : 
        undefined,
      unreconciledEntries: unreconciled,
    };
  }

  // Get fiscal year
  getFiscalYear(): { start: Date; end: Date } {
    return this.fiscalYear;
  }

  // Set fiscal year
  setFiscalYear(start: Date, end: Date): void {
    this.fiscalYear = { start, end };
    this.saveToStorage();
  }
}

// Create singleton instance
export const accountingManager = ProfessionalAccountingManager.getInstance();

// Convenience functions
export const createJournalEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'totalDebit' | 'totalCredit'>) => {
  return accountingManager.createJournalEntry(entry);
};

export const getTrialBalance = (date?: Date) => {
  return accountingManager.getTrialBalance(date);
};

export const generateBalanceSheet = (date?: Date) => {
  return accountingManager.generateBalanceSheet(date);
};

export const generateIncomeStatement = (startDate: Date, endDate: Date) => {
  return accountingManager.generateIncomeStatement(startDate, endDate);
};

export const generateCashFlowStatement = (startDate: Date, endDate: Date) => {
  return accountingManager.generateCashFlowStatement(startDate, endDate);
};

export default ProfessionalAccountingManager;
