import { Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  debt: number;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string, name: string) => void;
}

export default function CustomerSelector({
  customers,
  selectedId,
  searchValue,
  onSearchChange,
  onSelect,
}: CustomerSelectorProps) {
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.phone.includes(searchValue)
  );

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-blue-600">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>
        1. Mijozni Tanlang
      </label>
      
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

      <div className="max-h-64 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-inner">
        {filteredCustomers.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer.id, customer.name)}
                className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                  selectedId === customer.id ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-base">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                  {customer.debt > 0 && (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-xs font-semibold">
                      Qarz: ${customer.debt.toFixed(2)}
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
    </div>
  );
}
