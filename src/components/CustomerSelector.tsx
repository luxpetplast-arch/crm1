import { Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  debtUSD: number;
  debtUZS: number;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string, name: string, isKocha?: boolean) => void;
  manualName?: string;
  manualPhone?: string;
  onManualNameChange?: (value: string) => void;
  onManualPhoneChange?: (value: string) => void;
}

export default function CustomerSelector({
  customers,
  selectedId,
  searchValue,
  onSearchChange,
  onSelect,
  manualName,
  manualPhone,
  onManualNameChange,
  onManualPhoneChange,
}: CustomerSelectorProps) {
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.phone.includes(searchValue)
  );

  const isKocha = selectedId === 'kocha';

  return (
    <div className="space-y-3">
      {/* Ko'chaga option */}
      <button
        type="button"
        onClick={() => onSelect('kocha', 'Ko\'chaga', true)}
        className={`w-full text-left px-4 py-3 border-2 rounded-xl transition-colors ${
          isKocha 
            ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-600' 
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛣️</span>
          <div>
            <p className="font-semibold text-base">Ko'chaga</p>
            <p className="text-sm text-muted-foreground">Ro'yxatdan o'tmagan mijoz</p>
          </div>
        </div>
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Mijoz ismi yoki telefon raqamini kiriting..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all shadow-sm"
        />
      </div>

      <div className="max-h-64 overflow-y-auto border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800 shadow-sm custom-scrollbar">
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer.id, customer.name)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 h-20 flex items-center ${
                  selectedId === customer.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="min-w-0">
                    <p className={`font-black uppercase tracking-tight truncate text-xs ${selectedId === customer.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{customer.name}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedId === customer.id ? 'text-blue-100' : 'text-gray-400'}`}>{customer.phone}</p>
                  </div>
                  {customer.debtUSD > 0 && (
                    <span className={`shrink-0 ml-2 px-2 py-1 rounded-lg text-[10px] font-black ${selectedId === customer.id ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                      ${customer.debtUSD.toFixed(0)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {searchValue ? (
              <div>
                <p className="text-lg mb-2">❌ Mijoz topilmadi</p>
                <p className="text-sm">Boshqa nom yoki telefon raqam bilan qidiring</p>
              </div>
            ) : (
              <p className="text-sm">Qidirish uchun yozing...</p>
            )}
          </div>
        )}
      </div>

      {/* Manual input for Ko'chaga */}
      {isKocha && (
        <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            Mijoz ma'lumotlari (ixtiyoriy):
          </p>
          <input
            type="text"
            placeholder="Mijoz ismi"
            value={manualName || ''}
            onChange={(e) => onManualNameChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800"
          />
          <input
            type="text"
            placeholder="Telefon raqami"
            value={manualPhone || ''}
            onChange={(e) => onManualPhoneChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800"
          />
        </div>
      )}
    </div>
  );
}
