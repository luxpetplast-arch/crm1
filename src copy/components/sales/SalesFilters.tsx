import { Search } from 'lucide-react';

interface SalesFiltersProps {
  search: string;
  status: 'all' | 'paid' | 'debt';
  resultCount: number;
  latinToCyrillic: (text: string) => string;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: 'all' | 'paid' | 'debt') => void;
}

export const SalesFilters = ({
  search,
  status,
  resultCount,
  latinToCyrillic,
  onSearchChange,
  onStatusChange,
}: SalesFiltersProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-slate-900/5 border border-white/50">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={latinToCyrillic('Mijoz nomi yoki sotuv ID...')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => onStatusChange('all')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              status === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            {latinToCyrillic('Barchasi')}
          </button>
          <button
            onClick={() => onStatusChange('paid')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              status === 'paid'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            {latinToCyrillic("To'langan")}
          </button>
          <button
            onClick={() => onStatusChange('debt')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              status === 'debt'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            {latinToCyrillic('Qarz')}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          {latinToCyrillic(`${resultCount} ta sotuv topildi`)}
        </p>
      </div>
    </div>
  );
};

export default SalesFilters;
