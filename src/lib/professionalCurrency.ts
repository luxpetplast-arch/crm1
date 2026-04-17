// Professional Currency Management System

// Currency Types
export enum Currency {
  UZS = 'UZS',
  USD = 'USD',
  EUR = 'EUR',
  RUB = 'RUB',
}

// Exchange Rate Interface
export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
  source: 'central_bank' | 'commercial' | 'manual';
}

// Currency Conversion Result
export interface ConversionResult {
  amount: number;
  from: Currency;
  to: Currency;
  rate: number;
  convertedAmount: number;
  timestamp: Date;
  fee?: number;
}

// Currency Account Interface
export interface CurrencyAccount {
  id: string;
  currency: Currency;
  balance: number;
  frozenAmount: number;
  lastUpdated: Date;
  accountNumber: string;
  isActive: boolean;
}

// Transaction Interface
export interface CurrencyTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'exchange' | 'payment';
  amount: number;
  currency: Currency;
  fromAccount?: string;
  toAccount?: string;
  exchangeRate?: number;
  targetCurrency?: Currency;
  description: string;
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

// Financial Report Interface
export interface FinancialReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: Record<Currency, number>;
  totalExpenses: Record<Currency, number>;
  netProfit: Record<Currency, number>;
  cashFlow: Record<Currency, number>;
  accountsReceivable: Record<Currency, number>;
  accountsPayable: Record<Currency, number>;
  exchangeRateImpact: {
    currency: Currency;
    rateChange: number;
    impact: number;
  }[];
  transactions: CurrencyTransaction[];
}

// Professional Currency Manager Class
export class ProfessionalCurrencyManager {
  private static instance: ProfessionalCurrencyManager;
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private accounts: Map<string, CurrencyAccount> = new Map();
  private transactions: CurrencyTransaction[] = [];
  private baseCurrency: Currency = Currency.UZS;
  private supportedCurrencies: Currency[] = [Currency.UZS, Currency.USD, Currency.EUR, Currency.RUB];

  constructor() {
    this.initializeDefaultRates();
    this.loadFromStorage();
  }

  static getInstance(): ProfessionalCurrencyManager {
    if (!ProfessionalCurrencyManager.instance) {
      ProfessionalCurrencyManager.instance = new ProfessionalCurrencyManager();
    }
    return ProfessionalCurrencyManager.instance;
  }

  // Initialize default exchange rates
  private initializeDefaultRates(): void {
    const defaultRates: ExchangeRate[] = [
      { from: Currency.USD, to: Currency.UZS, rate: 12500, timestamp: new Date(), source: 'manual' },
      { from: Currency.UZS, to: Currency.USD, rate: 1/12500, timestamp: new Date(), source: 'manual' },
      { from: Currency.EUR, to: Currency.UZS, rate: 13500, timestamp: new Date(), source: 'manual' },
      { from: Currency.UZS, to: Currency.EUR, rate: 1/13500, timestamp: new Date(), source: 'manual' },
      { from: Currency.RUB, to: Currency.UZS, rate: 140, timestamp: new Date(), source: 'manual' },
      { from: Currency.UZS, to: Currency.RUB, rate: 1/140, timestamp: new Date(), source: 'manual' },
      { from: Currency.EUR, to: Currency.USD, rate: 1.08, timestamp: new Date(), source: 'manual' },
      { from: Currency.USD, to: Currency.EUR, rate: 0.92, timestamp: new Date(), source: 'manual' },
    ];

    defaultRates.forEach(rate => {
      this.exchangeRates.set(this.getRateKey(rate.from, rate.to), rate);
    });
  }

  // Get exchange rate key
  private getRateKey(from: Currency, to: Currency): string {
    return `${from}_${to}`;
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    try {
      const storedRates = localStorage.getItem('exchange_rates');
      const storedAccounts = localStorage.getItem('currency_accounts');
      const storedTransactions = localStorage.getItem('currency_transactions');

      if (storedRates) {
        const rates = JSON.parse(storedRates);
        rates.forEach((rate: ExchangeRate) => {
          rate.timestamp = new Date(rate.timestamp);
          this.exchangeRates.set(this.getRateKey(rate.from, rate.to), rate);
        });
      }

      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        accounts.forEach((account: CurrencyAccount) => {
          account.lastUpdated = new Date(account.lastUpdated);
          this.accounts.set(account.id, account);
        });
      }

      if (storedTransactions) {
        this.transactions = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load currency data from storage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('exchange_rates', JSON.stringify(Array.from(this.exchangeRates.values())));
      localStorage.setItem('currency_accounts', JSON.stringify(Array.from(this.accounts.values())));
      localStorage.setItem('currency_transactions', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save currency data to storage:', error);
    }
  }

  // Update exchange rate
  updateExchangeRate(from: Currency, to: Currency, rate: number, source: 'central_bank' | 'commercial' | 'manual' = 'manual'): void {
    const exchangeRate: ExchangeRate = {
      from,
      to,
      rate,
      timestamp: new Date(),
      source,
    };

    this.exchangeRates.set(this.getRateKey(from, to), exchangeRate);
    
    // Update reverse rate
    const reverseRate = 1 / rate;
    this.exchangeRates.set(this.getRateKey(to, from), {
      from: to,
      to: from,
      rate: reverseRate,
      timestamp: new Date(),
      source,
    });

    this.saveToStorage();
  }

  // Get exchange rate
  getExchangeRate(from: Currency, to: Currency): number | null {
    if (from === to) return 1;
    
    const rate = this.exchangeRates.get(this.getRateKey(from, to));
    return rate ? rate.rate : null;
  }

  // Convert currency
  convertCurrency(amount: number, from: Currency, to: Currency, fee: number = 0): ConversionResult | null {
    const rate = this.getExchangeRate(from, to);
    if (rate === null) return null;

    const convertedAmount = amount * rate * (1 - fee / 100);

    return {
      amount,
      from,
      to,
      rate,
      convertedAmount,
      timestamp: new Date(),
      fee,
    };
  }

  // Create currency account
  createAccount(currency: Currency, initialBalance: number = 0): CurrencyAccount {
    const account: CurrencyAccount = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currency,
      balance: initialBalance,
      frozenAmount: 0,
      lastUpdated: new Date(),
      accountNumber: this.generateAccountNumber(currency),
      isActive: true,
    };

    this.accounts.set(account.id, account);
    this.saveToStorage();

    if (initialBalance > 0) {
      this.createTransaction({
        type: 'deposit',
        amount: initialBalance,
        currency,
        fromAccount: account.id,
        description: 'Initial deposit',
        category: 'account_creation',
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
      });
    }

    return account;
  }

  // Generate account number
  private generateAccountNumber(currency: Currency): string {
    const prefix = currency === Currency.UZS ? 'UZ' : currency === Currency.USD ? 'US' : currency === Currency.EUR ? 'EU' : 'RU';
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${random}`;
  }

  // Get account
  getAccount(accountId: string): CurrencyAccount | null {
    return this.accounts.get(accountId) || null;
  }

  // Get accounts by currency
  getAccountsByCurrency(currency: Currency): CurrencyAccount[] {
    return Array.from(this.accounts.values()).filter(account => account.currency === currency && account.isActive);
  }

  // Create transaction
  createTransaction(transaction: Omit<CurrencyTransaction, 'id' | 'createdAt'>): CurrencyTransaction {
    const newTransaction: CurrencyTransaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.transactions.push(newTransaction);

    // Update account balances
    if (transaction.type === 'deposit' && transaction.fromAccount) {
      this.updateAccountBalance(transaction.fromAccount, transaction.amount);
    } else if (transaction.type === 'withdrawal' && transaction.fromAccount) {
      this.updateAccountBalance(transaction.fromAccount, -transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.fromAccount && transaction.toAccount) {
      this.updateAccountBalance(transaction.fromAccount, -transaction.amount);
      if (transaction.targetCurrency && transaction.targetCurrency !== transaction.currency) {
        const converted = this.convertCurrency(transaction.amount, transaction.currency, transaction.targetCurrency);
        if (converted) {
          this.updateAccountBalance(transaction.toAccount, converted.convertedAmount);
        }
      } else {
        this.updateAccountBalance(transaction.toAccount, transaction.amount);
      }
    }

    this.saveToStorage();
    return newTransaction;
  }

  // Update account balance
  private updateAccountBalance(accountId: string, amount: number): void {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance += amount;
      account.lastUpdated = new Date();
    }
  }

  // Get transactions
  getTransactions(accountId?: string, startDate?: Date, endDate?: Date): CurrencyTransaction[] {
    let filtered = this.transactions;

    if (accountId) {
      filtered = filtered.filter(t => t.fromAccount === accountId || t.toAccount === accountId);
    }

    if (startDate) {
      filtered = filtered.filter(t => t.createdAt >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(t => t.createdAt <= endDate);
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get account balance in multiple currencies
  getAccountBalanceInAllCurrencies(accountId: string): Record<Currency, number> {
    const account = this.getAccount(accountId);
    if (!account) return {} as Record<Currency, number>;

    const balances: Record<Currency, number> = {} as Record<Currency, number>;
    
    this.supportedCurrencies.forEach(currency => {
      if (currency === account.currency) {
        balances[currency] = account.balance;
      } else {
        const converted = this.convertCurrency(account.balance, account.currency, currency);
        balances[currency] = converted ? converted.convertedAmount : 0;
      }
    });

    return balances;
  }

  // Calculate total balance across all accounts
  getTotalBalance(targetCurrency: Currency = this.baseCurrency): number {
    let total = 0;

    this.accounts.forEach(account => {
      if (account.isActive) {
        if (account.currency === targetCurrency) {
          total += account.balance;
        } else {
          const converted = this.convertCurrency(account.balance, account.currency, targetCurrency);
          if (converted) {
            total += converted.convertedAmount;
          }
        }
      }
    });

    return total;
  }

  // Generate financial report
  generateFinancialReport(startDate: Date, endDate: Date): FinancialReport {
    const transactions = this.getTransactions(undefined, startDate, endDate);
    
    const revenue = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((acc, t) => {
        acc[t.currency] = (acc[t.currency] || 0) + t.amount;
        return acc;
      }, {} as Record<Currency, number>);

    const expenses = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((acc, t) => {
        acc[t.currency] = (acc[t.currency] || 0) + t.amount;
        return acc;
      }, {} as Record<Currency, number>);

    // Convert all to base currency for comparison
    const baseRevenue = this.convertToBaseCurrency(revenue);
    const baseExpenses = this.convertToBaseCurrency(expenses);
    const netProfit = baseRevenue - baseExpenses;

    return {
      period: { start: startDate, end: endDate },
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit: { [this.baseCurrency]: netProfit } as Record<Currency, number>,
      cashFlow: { [this.baseCurrency]: this.getTotalBalance(this.baseCurrency) } as Record<Currency, number>,
      accountsReceivable: {} as Record<Currency, number>,
      accountsPayable: {} as Record<Currency, number>,
      exchangeRateImpact: [],
      transactions,
    };
  }

  // Convert amounts to base currency
  private convertToBaseCurrency(amounts: Record<Currency, number>): number {
    let total = 0;
    
    Object.entries(amounts).forEach(([currency, amount]) => {
      if (currency === this.baseCurrency) {
        total += amount;
      } else {
        const converted = this.convertCurrency(amount, currency as Currency, this.baseCurrency);
        if (converted) {
          total += converted.convertedAmount;
        }
      }
    });

    return total;
  }

  // Get exchange rate history
  getExchangeRateHistory(from: Currency, to: Currency, days: number = 30): ExchangeRate[] {
    // In a real application, this would fetch from a database
    // For now, return current rate as placeholder
    const rate = this.getExchangeRate(from, to);
    return rate ? [{
      from,
      to,
      rate,
      timestamp: new Date(),
      source: 'manual',
    }] : [];
  }

  // Set base currency
  setBaseCurrency(currency: Currency): void {
    this.baseCurrency = currency;
    this.saveToStorage();
  }

  // Get base currency
  getBaseCurrency(): Currency {
    return this.baseCurrency;
  }

  // Get supported currencies
  getSupportedCurrencies(): Currency[] {
    return [...this.supportedCurrencies];
  }

  // Validate currency amount
  validateAmount(amount: number, currency: Currency): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be positive' };
    }

    if (currency === Currency.UZS && amount > 999999999) {
      return { isValid: false, error: 'Amount exceeds maximum limit for UZS' };
    }

    if ((currency === Currency.USD || currency === Currency.EUR) && amount > 9999999) {
      return { isValid: false, error: 'Amount exceeds maximum limit for USD/EUR' };
    }

    return { isValid: true };
  }

  // Format currency amount
  formatAmount(amount: number, currency: Currency, locale: string = 'uz-UZ'): string {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.getCurrencyCode(currency),
      minimumFractionDigits: currency === Currency.UZS ? 0 : 2,
      maximumFractionDigits: currency === Currency.UZS ? 0 : 2,
    });

    return formatter.format(amount);
  }

  // Get currency code
  private getCurrencyCode(currency: Currency): string {
    const codes: Record<Currency, string> = {
      [Currency.UZS]: 'UZS',
      [Currency.USD]: 'USD',
      [Currency.EUR]: 'EUR',
      [Currency.RUB]: 'RUB',
    };
    return codes[currency];
  }

  // Calculate exchange rate impact
  calculateExchangeRateImpact(from: Currency, to: Currency, oldRate: number, newRate: number, amount: number): number {
    const oldValue = amount * oldRate;
    const newValue = amount * newRate;
    return newValue - oldValue;
  }

  // Get currency summary
  getCurrencySummary(): {
    totalAccounts: number;
    totalBalance: Record<Currency, number>;
    totalTransactions: number;
    exchangeRates: Record<string, number>;
  } {
    const totalBalance: Record<Currency, number> = {} as Record<Currency, number>;
    const exchangeRates: Record<string, number> = {};

    this.supportedCurrencies.forEach(currency => {
      totalBalance[currency] = this.getTotalBalance(currency);
    });

    this.exchangeRates.forEach((rate, key) => {
      exchangeRates[key] = rate.rate;
    });

    return {
      totalAccounts: this.accounts.size,
      totalBalance,
      totalTransactions: this.transactions.length,
      exchangeRates,
    };
  }

  // Cleanup old data
  cleanupOldData(daysToKeep: number = 365): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.transactions = this.transactions.filter(t => t.createdAt > cutoffDate);
    this.saveToStorage();
  }
}

// Create singleton instance
export const currencyManager = ProfessionalCurrencyManager.getInstance();

// Convenience functions
export const updateExchangeRate = (from: Currency, to: Currency, rate: number) => {
  currencyManager.updateExchangeRate(from, to, rate);
};

export const convertCurrency = (amount: number, from: Currency, to: Currency, fee?: number) => {
  return currencyManager.convertCurrency(amount, from, to, fee);
};

export const formatCurrency = (amount: number, currency: Currency, locale?: string) => {
  return currencyManager.formatAmount(amount, currency, locale);
};

export const createAccount = (currency: Currency, initialBalance?: number) => {
  return currencyManager.createAccount(currency, initialBalance);
};

export const getAccountBalance = (accountId: string) => {
  return currencyManager.getAccount(accountId);
};

export default ProfessionalCurrencyManager;
