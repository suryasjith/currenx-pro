import React, { useState, useMemo } from 'react';
import { POPULAR_CURRENCIES } from '../data/currencies';
import { CurrencyInfo } from '../types/currency';
import { Search, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: CurrencyInfo) => void;
  selectedCode: string;
  title: string;
}

export const CurrencySelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  title
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return POPULAR_CURRENCIES;
    return POPULAR_CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Select from 30+ major fiat currencies</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800/80 bg-gray-900/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by code (EUR, USD), currency name, or country..."
              className="w-full bg-gray-800/90 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
            />
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD'].map(code => (
              <button
                key={code}
                onClick={() => {
                  const curr = POPULAR_CURRENCIES.find(c => c.code === code);
                  if (curr) {
                    onSelect(curr);
                    onClose();
                  }
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition ${
                  selectedCode === code
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-gray-800/40">
          {filteredCurrencies.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No currencies match your search query "{searchTerm}"
            </div>
          ) : (
            filteredCurrencies.map(curr => {
              const isSelected = curr.code === selectedCode;
              return (
                <button
                  key={curr.code}
                  onClick={() => {
                    onSelect(curr);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left group ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'hover:bg-gray-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl p-1 bg-gray-800/80 rounded-lg group-hover:scale-110 transition-transform">
                      {curr.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white tracking-wide">{curr.code}</span>
                        <span className="text-xs text-gray-400 font-mono">({curr.symbol})</span>
                      </div>
                      <div className="text-xs text-gray-400">{curr.name} • {curr.country}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
