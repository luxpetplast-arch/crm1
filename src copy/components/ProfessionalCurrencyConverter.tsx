import React, { useState, useEffect } from 'react';
import { Currency, currencyManager, convertCurrency, formatCurrency } from '../lib/professionalCurrency';
import { ArrowUpDown, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { safeParseFloat } from '../lib/safe-math';

interface CurrencyConverterProps {
  amount?: number;
  fromCurrency?: Currency;
  toCurrency?: Currency;
  onAmountChange?: (amount: number) => void;
  onFromCurrencyChange?: (currency: Currency) => void;
  onToCurrencyChange?: (currency: Currency) => void;
  showHistory?: boolean;
  showRateInfo?: boolean;
  className?: string;
}

export default function ProfessionalCurrencyConverter({
  amount = 0,
  fromCurrency = Currency.USD,
  toCurrency = Currency.UZS,
  onAmountChange,
  onFromCurrencyChange,
  onToCurrencyChange,
  showHistory = false,
  showRateInfo = true,
  className = '',
}: CurrencyConverterProps) {
  const [inputAmount, setInputAmount] = useState(amount.toString());
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [rateHistory, setRateHistory] = useState<{ rate: number; date: Date }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    performConversion();
  }, [inputAmount, fromCurrency, toCurrency]);

  useEffect(() => {
    if (showHistory) {
      loadRateHistory();
    }
  }, [fromCurrency, toCurrency]);

  const performConversion = async () => {
    setIsConverting(true);
    setError(null);

    try {
      const numAmount = safeParseFloat(inputAmount, 0);
      
      if (numAmount <= 0) {
        setConvertedAmount(0);
        setCurrentRate(0);
        return;
      }

      const conversion = convertCurrency(numAmount, fromCurrency, toCurrency);
      
      if (conversion) {
        setConvertedAmount(conversion.convertedAmount);
        setCurrentRate(conversion.rate);
        
        if (onAmountChange) {
          onAmountChange(numAmount);
        }
      } else {
        setError('Conversion rate not available');
        setConvertedAmount(0);
        setCurrentRate(0);
      }
    } catch (err) {
      setError('Conversion failed');
      setConvertedAmount(0);
      setCurrentRate(0);
    } finally {
      setIsConverting(false);
    }
  };

  const loadRateHistory = () => {
    const history = currencyManager.getExchangeRateHistory(fromCurrency, toCurrency, 7);
    setRateHistory(history);
  };

  const swapCurrencies = () => {
    const newFromCurrency = toCurrency;
    const newToCurrency = fromCurrency;
    
    if (onFromCurrencyChange) onFromCurrencyChange(newFromCurrency);
    if (onToCurrencyChange) onToCurrencyChange(newToCurrency);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    
    // Only allow one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setInputAmount(sanitized);
  };

  const getRateTrend = () => {
    if (rateHistory.length < 2) return null;
    
    const latest = rateHistory[rateHistory.length - 1].rate;
    const previous = rateHistory[rateHistory.length - 2].rate;
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const getRateChange = () => {
    if (rateHistory.length < 2) return 0;
    
    const latest = rateHistory[rateHistory.length - 1].rate;
    const previous = rateHistory[rateHistory.length - 2].rate;
    
    return ((latest - previous) / previous) * 100;
  };

  const currencies = [
    { code: Currency.UZS, name: 'Uzbekistan Sum', symbol: 'so\'m', flag: 'UZ' },
    { code: Currency.USD, name: 'US Dollar', symbol: '$', flag: 'US' },
    { code: Currency.EUR, name: 'Euro', symbol: 'EUR', flag: 'EU' },
    { code: Currency.RUB, name: 'Russian Ruble', symbol: 'RUB', flag: 'RU' },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Currency Converter</h3>
        {showRateInfo && currentRate > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Rate:</span>
            <span className="font-semibold text-gray-900">
              1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
            </span>
            {getRateTrend() && (
              <div className={`flex items-center gap-1 ${
                getRateTrend() === 'up' ? 'text-green-600' : 
                getRateTrend() === 'down' ? 'text-red-600' : 'text-gray-400'
              }`}>
                {getRateTrend() === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                 getRateTrend() === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                <span className="text-xs font-medium">
                  {Math.abs(getRateChange()).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Converter */}
      <div className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="flex gap-3">
            <select
              value={fromCurrency}
              onChange={(e) => onFromCurrencyChange?.(e.target.value as Currency)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={inputAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="flex gap-3">
            <select
              value={toCurrency}
              onChange={(e) => onToCurrencyChange?.(e.target.value as Currency)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
              {isConverting ? (
                <span className="text-gray-500">Converting...</span>
              ) : error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <span className="font-semibold text-gray-900">
                  {formatCurrency(convertedAmount, toCurrency)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rate History */}
      {showHistory && rateHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Rate History (7 days)</h4>
          <div className="space-y-2">
            {rateHistory.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {item.date.toLocaleDateString()}
                </span>
                <span className="font-medium text-gray-900">
                  1 {fromCurrency} = {item.rate.toFixed(4)} {toCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      {showRateInfo && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Exchange Rate Information</p>
              <p className="text-blue-600">
                Rates are updated regularly. For large transactions, please verify current rates with your bank.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
