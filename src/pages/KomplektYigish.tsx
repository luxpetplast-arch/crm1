import { useState, useEffect } from 'react';
import { 
  Plus, 
  Package,
  CheckCircle2,
  ArrowLeft,
  Layers,
  Factory,
  AlertCircle,
  Search,
  Save,
  History
} from 'lucide-react';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Product {
  id: string;
  name: string;
  warehouse: string;
  currentStock: number;
  currentUnits: number;
  unitsPerBag: number;
  pricePerBag: number;
  subType?: string;
  active?: boolean;
}

interface AssemblyHistory {
  id: string;
  createdAt: string;
  preformName: string;
  krishkaName: string;
  ruchkaName: string;
  quantity: number;
  assembledBy: string;
}

export default function KomplektYigish() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [assemblyHistory, setAssemblyHistory] = useState<AssemblyHistory[]>([]);
  
  // Preform qidiruvi
  const [preformSearch, setPreformSearch] = useState('');
  const [showPreformDropdown, setShowPreformDropdown] = useState(false);
  const [selectedPreform, setSelectedPreform] = useState<Product | null>(null);
  
  // Krishka qidiruvi
  const [krishkaSearch, setKrishkaSearch] = useState('');
  const [showKrishkaDropdown, setShowKrishkaDropdown] = useState(false);
  const [selectedKrishka, setSelectedKrishka] = useState<Product | null>(null);
  
  // Ruchka qidiruvi
  const [ruchkaSearch, setRuchkaSearch] = useState('');
  const [showRuchkaDropdown, setShowRuchkaDropdown] = useState(false);
  const [selectedRuchka, setSelectedRuchka] = useState<Product | null>(null);
  
  // Komplekt miqdori
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadProducts();
    loadAssemblyHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadAssemblyHistory = async () => {
    try {
      // Bu yerda assembly history API chaqiriladi
      // Hozircha local storage dan o'qish mumkin
      const saved = localStorage.getItem('komplekt_history');
      if (saved) {
        setAssemblyHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Preformlarni filterlash
  const preformProducts = products.filter(p => 
    p.warehouse === 'preform' || p.name.toLowerCase().includes('preform') || p.name.toLowerCase().includes('g')
  );

  const filteredPrefoms = preformProducts.filter(p => 
    p.name.toLowerCase().includes(preformSearch.toLowerCase())
  );

  // Krishkalarni filterlash (caps/qopqoq)
  const krishkaProducts = products.filter(p => 
    p.warehouse === 'caps' || p.warehouse === 'krishka' || 
    p.name.toLowerCase().includes('qopqoq') || p.name.toLowerCase().includes('krishka')
  );

  const filteredKrishkas = krishkaProducts.filter(p => 
    p.name.toLowerCase().includes(krishkaSearch.toLowerCase())
  );

  // Ruchkalarni filterlash (handles)
  const ruchkaProducts = products.filter(p => 
    p.warehouse === 'handles' || p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka')
  );

  const filteredRuchkas = ruchkaProducts.filter(p => 
    p.name.toLowerCase().includes(ruchkaSearch.toLowerCase())
  );

  // Avtomatik mos krishka va ruchka tanlash
  const autoSelectAccessories = (preform: Product) => {
    const nameMatch = preform.name.match(/(\d+)/);
    const weight = nameMatch ? parseInt(nameMatch[1]) : 0;
    
    let accessorySize = preform.subType || '';
    let needsRuchka = true;
    
    if (!accessorySize) {
      if ([15, 21, 26, 30].includes(weight)) {
        // 15, 21, 26, 30 gramlik preformlar uchun faqat 28 krishka (ruchka yo'q)
        accessorySize = '28';
        needsRuchka = false;
      } else if ([52, 70].includes(weight)) {
        // 52 va 70 gramlik preformlar uchun 38 krishka va ruchka
        accessorySize = '38';
      } else if ([75, 80, 85, 86, 135].includes(weight)) {
        // 75, 80, 85, 86, 135 gramlik preformlar uchun 48 krishka va ruchka
        accessorySize = '48';
      }
    }

    console.log('Auto selecting accessories for preform:', preform.name, 'weight:', weight, 'size:', accessorySize, 'needsRuchka:', needsRuchka);
    console.log('Available krishka products:', krishkaProducts.length);
    console.log('Available ruchka products:', ruchkaProducts.length);

    if (accessorySize) {
      // Mos keluvchi krishkani topish (faqat raqam qismini solishtirish)
      const matchingKrishka = krishkaProducts.find(p => {
        // Mahsulot nomidan raqamni ajratib olish (masalan "28" yoki "28mm")
        const productNumber = p.name.match(/(\d+)/);
        const matches = productNumber && productNumber[1] === accessorySize && p.active !== false;
        console.log('Checking krishka:', p.name, 'number:', productNumber ? productNumber[1] : 'none', 'matches:', matches);
        return matches;
      });
      
      if (matchingKrishka) {
        console.log('Found matching krishka:', matchingKrishka.name);
        setSelectedKrishka(matchingKrishka);
        setKrishkaSearch(matchingKrishka.name);
      } else {
        console.log('No matching krishka found for size:', accessorySize);
      }

      // Mos keluvchi ruchkani topish (faqat ruchka kerak bo'lganda)
      if (needsRuchka) {
        const matchingRuchka = ruchkaProducts.find(p => {
          // Mahsulot nomidan raqamni ajratib olish
          const productNumber = p.name.match(/(\d+)/);
          const matches = productNumber && productNumber[1] === accessorySize && p.active !== false;
          console.log('Checking ruchka:', p.name, 'number:', productNumber ? productNumber[1] : 'none', 'matches:', matches);
          return matches;
        });
        
        if (matchingRuchka) {
          console.log('Found matching ruchka:', matchingRuchka.name);
          setSelectedRuchka(matchingRuchka);
          setRuchkaSearch(matchingRuchka.name);
        } else {
          console.log('No matching ruchka found for size:', accessorySize);
        }
      } else {
        // Ruchka kerak emas - tozalash
        setSelectedRuchka(null);
        setRuchkaSearch('');
      }
    }
  };

  const handlePreformSelect = (preform: Product) => {
    setSelectedPreform(preform);
    setPreformSearch(preform.name);
    setShowPreformDropdown(false);
    autoSelectAccessories(preform);
  };

  const handleKrishkaSelect = (krishka: Product) => {
    setSelectedKrishka(krishka);
    setKrishkaSearch(krishka.name);
    setShowKrishkaDropdown(false);
  };

  const handleRuchkaSelect = (ruchka: Product) => {
    setSelectedRuchka(ruchka);
    setRuchkaSearch(ruchka.name);
    setShowRuchkaDropdown(false);
  };

  // Ruchka kerakligini tekshirish
  const needsRuchkaForPreform = (preform: Product): boolean => {
    const nameMatch = preform.name.match(/(\d+)/);
    const weight = nameMatch ? parseInt(nameMatch[1]) : 0;
    // 15, 21, 26, 30 gramlik preformlar uchun ruchka kerak emas
    return ![15, 21, 26, 30].includes(weight);
  };

  const handleAssemble = async () => {
    const requiresRuchka = selectedPreform ? needsRuchkaForPreform(selectedPreform) : false;
    
    if (!selectedPreform || !selectedKrishka || (requiresRuchka && !selectedRuchka)) {
      setErrorMessage(latinToCyrillic('Iltimos, barcha komponentlarni tanlang!'));
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setErrorMessage(latinToCyrillic('Iltimos, to\'g\'ri miqdor kiriting!'));
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setLoading(true);

    try {
      // Zaxira tekshiruvi
      const totalUnits = qty * (selectedPreform.unitsPerBag || 2000);
      
      if (selectedPreform.currentUnits < totalUnits) {
        setErrorMessage(latinToCyrillic(`Preform zaxirasi yetarli emas! Omborda: ${selectedPreform.currentUnits} dona`));
        setLoading(false);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      if (selectedKrishka.currentUnits < totalUnits) {
        setErrorMessage(latinToCyrillic(`Krishka zaxirasi yetarli emas! Omborda: ${selectedKrishka.currentUnits} dona`));
        setLoading(false);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Ruchka tekshiruvi (faqat kerak bo'lganda)
      if (requiresRuchka && selectedRuchka && selectedRuchka.currentUnits < totalUnits) {
        setErrorMessage(latinToCyrillic(`Ruchka zaxirasi yetarli emas! Omborda: ${selectedRuchka.currentUnits} dona`));
        setLoading(false);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Mahsulot zaxirasini kamaytirish (local)
      await api.post('/products/adjust-stock', {
        productId: selectedPreform.id,
        quantity: -totalUnits,
        type: 'ASSEMBLY',
        reason: `Komplekt yig'ish: ${qty} qop`
      });

      await api.post('/products/adjust-stock', {
        productId: selectedKrishka.id,
        quantity: -totalUnits,
        type: 'ASSEMBLY',
        reason: `Komplekt yig'ish: ${qty} qop`
      });

      // Ruchka zaxirasini kamaytirish (faqat kerak bo'lganda)
      if (requiresRuchka && selectedRuchka) {
        await api.post('/products/adjust-stock', {
          productId: selectedRuchka.id,
          quantity: -totalUnits,
          type: 'ASSEMBLY',
          reason: `Komplekt yig'ish: ${qty} qop`
        });
      }

      // Tarixga qo'shish
      const newAssembly: AssemblyHistory = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        preformName: selectedPreform.name,
        krishkaName: selectedKrishka.name,
        ruchkaName: selectedRuchka ? selectedRuchka.name : '-',
        quantity: qty,
        assembledBy: localStorage.getItem('user_name') || 'Kassir'
      };

      const updatedHistory = [newAssembly, ...assemblyHistory];
      setAssemblyHistory(updatedHistory);
      localStorage.setItem('komplekt_history', JSON.stringify(updatedHistory));

      setSuccessMessage(latinToCyrillic(`${qty} ta komplekt muvaffaqiyatli yig'ildi!`));
      
      // Formani tozalash
      setSelectedPreform(null);
      setSelectedKrishka(null);
      setSelectedRuchka(null);
      setPreformSearch('');
      setKrishkaSearch('');
      setRuchkaSearch('');
      setQuantity('');
      setNote('');

      // Mahsulotlarni qayta yuklash
      await loadProducts();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Assembly error:', error);
      setErrorMessage(latinToCyrillic('Komplekt yig\'ishda xatolik yuz berdi!'));
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cashier/inventory')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl font-medium text-sm text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {latinToCyrillic("Orqaga")}
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-600" />
                {latinToCyrillic("Komplekt Yig'ish")}
              </h1>
              <p className="text-sm text-gray-500">
                {latinToCyrillic("Preform + Krishka + Ruchka")}
              </p>
            </div>
          </div>
          
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('new')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'new'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Plus className="w-4 h-4" />
              {latinToCyrillic("Yangi")}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <History className="w-4 h-4" />
              {latinToCyrillic("Tarix")}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {activeTab === 'new' ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Preform tanlash */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-blue-600" />
                  {latinToCyrillic("Preform tanlash")}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={preformSearch}
                      onChange={(e) => {
                        setPreformSearch(e.target.value);
                        setShowPreformDropdown(true);
                        if (!e.target.value) setSelectedPreform(null);
                      }}
                      onFocus={() => setShowPreformDropdown(true)}
                      placeholder={latinToCyrillic("Preform qidirish...")}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    />
                    {selectedPreform && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                        {selectedPreform.currentUnits.toLocaleString()} dona
                      </span>
                    )}
                  </div>
                  
                  {showPreformDropdown && filteredPrefoms.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredPrefoms.map((preform) => (
                        <button
                          key={preform.id}
                          onClick={() => handlePreformSelect(preform)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{preform.name}</p>
                            <p className="text-sm text-gray-500">{preform.unitsPerBag || 2000} dona/qop</p>
                          </div>
                          <span className={cn(
                            "text-sm px-2 py-1 rounded-lg",
                            preform.currentUnits > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {preform.currentUnits.toLocaleString()} dona
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Krishka tanlash */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  {latinToCyrillic("Krishka tanlash")}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={krishkaSearch}
                      onChange={(e) => {
                        setKrishkaSearch(e.target.value);
                        setShowKrishkaDropdown(true);
                        if (!e.target.value) setSelectedKrishka(null);
                      }}
                      onFocus={() => setShowKrishkaDropdown(true)}
                      placeholder={latinToCyrillic("Krishka qidirish...")}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    />
                    {selectedKrishka && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">
                        {selectedKrishka.currentUnits.toLocaleString()} dona
                      </span>
                    )}
                  </div>
                  
                  {showKrishkaDropdown && filteredKrishkas.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredKrishkas.map((krishka) => (
                        <button
                          key={krishka.id}
                          onClick={() => handleKrishkaSelect(krishka)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{krishka.name}</p>
                            <p className="text-sm text-gray-500">{krishka.unitsPerBag || 1000} dona/qop</p>
                          </div>
                          <span className={cn(
                            "text-sm px-2 py-1 rounded-lg",
                            krishka.currentUnits > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {krishka.currentUnits.toLocaleString()} dona
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ruchka tanlash - faqat kerak bo'lganda ko'rsatiladi */}
              {selectedPreform && needsRuchkaForPreform(selectedPreform) && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-600" />
                    {latinToCyrillic("Ruchka tanlash")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={ruchkaSearch}
                        onChange={(e) => {
                          setRuchkaSearch(e.target.value);
                          setShowRuchkaDropdown(true);
                          if (!e.target.value) setSelectedRuchka(null);
                        }}
                        onFocus={() => setShowRuchkaDropdown(true)}
                        placeholder={latinToCyrillic("Ruchka qidirish...")}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                      {selectedRuchka && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                          {selectedRuchka.currentUnits.toLocaleString()} dona
                        </span>
                      )}
                    </div>
                    
                    {showRuchkaDropdown && filteredRuchkas.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {filteredRuchkas.map((ruchka) => (
                          <button
                            key={ruchka.id}
                            onClick={() => handleRuchkaSelect(ruchka)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{ruchka.name}</p>
                              <p className="text-sm text-gray-500">{ruchka.unitsPerBag || 1000} dona/qop</p>
                            </div>
                            <span className={cn(
                              "text-sm px-2 py-1 rounded-lg",
                              ruchka.currentUnits > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>
                              {ruchka.currentUnits.toLocaleString()} dona
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Miqdor */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  {latinToCyrillic("Komplekt miqdori (qop)")}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={latinToCyrillic("Miqdorni kiriting...")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                {selectedPreform && quantity && (
                  <p className="text-sm text-gray-500">
                    {latinToCyrillic("Jami dona:")} {(parseInt(quantity) || 0) * (selectedPreform.unitsPerBag || 2000)} dona
                  </p>
                )}
              </div>

              {/* Izoh */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  {latinToCyrillic("Izoh (ixtiyoriy)")}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={latinToCyrillic("Qo'shimcha ma'lumot...")}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Xulosa */}
              {selectedPreform && selectedKrishka && quantity && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <h3 className="font-semibold text-blue-900">{latinToCyrillic("Yig'iladigan komplekt:")}</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><span className="font-medium">{latinToCyrillic("Preform:")}</span> {selectedPreform.name}</p>
                    <p><span className="font-medium">{latinToCyrillic("Krishka:")}</span> {selectedKrishka.name}</p>
                    {needsRuchkaForPreform(selectedPreform) && selectedRuchka && (
                      <p><span className="font-medium">{latinToCyrillic("Ruchka:")}</span> {selectedRuchka.name}</p>
                    )}
                    <p><span className="font-medium">{latinToCyrillic("Miqdor:")}</span> {quantity} qop ({(parseInt(quantity) || 0) * (selectedPreform.unitsPerBag || 2000)} dona)</p>
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleAssemble}
                disabled={loading || !selectedPreform || !selectedKrishka || (selectedPreform && needsRuchkaForPreform(selectedPreform) && !selectedRuchka) || !quantity}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {latinToCyrillic("Yig'ilmoqda...")}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {latinToCyrillic("Komplektni yig'ish")}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* History Tab */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">{latinToCyrillic("Yig'ilgan komplektlar tarixi")}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {assemblyHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{latinToCyrillic("Hali komplekt yig'ilmagan")}</p>
                </div>
              ) : (
                assemblyHistory.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {item.quantity} {latinToCyrillic("ta komplekt")}
                        </p>
                        <p className="text-sm text-gray-600">{item.preformName}</p>
                        <p className="text-sm text-gray-500">{item.krishkaName} + {item.ruchkaName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                        <p className="text-xs text-gray-400">{item.assembledBy}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
