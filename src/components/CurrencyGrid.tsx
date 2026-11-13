import React from 'react';
import { POPULAR_CURRENCIES } from '../data/currencies';
import { CurrencyInfo } from '../types/currency';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface Props {
  baseCurrency: CurrencyInfo;
  rates: Record<string, number>;
  onSelectTarget: (currency: CurrencyInfo) => void;
  activeTargetCode: string;
}

export const CurrencyGrid: React.FC<Props> = ({
  baseCurrency,
  rates,
  onSelectTarget,
  activeTargetCode
}) => {
  // Show top currencies excluding the current base
  const gridCurrencies = POPULAR_CURRENCIES.filter(c => c.code !== baseCurrency.code).slice(0, 15);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Global Market Rates Matrix
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Interbank exchange rates relative to <span className="text-emerald-400 font-bold">{baseCurrency.code} ({baseCurrency.name})</span>
          </p>
        </div>
        <span className="text-xs text-gray-400">Click any card to inspect & convert</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {gridCurrencies.map(curr => {
          const rate = rates[curr.code];
          const isSelected = curr.code === activeTargetCode;

          // Pseudorandom subtle delta
          const hash = (baseCurrency.code + curr.code).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
          const delta = +(((hash % 19) - 9) * 0.04).toFixed(2);
          const isPositive = delta >= 0;

          return (
            <button
              key={curr.code}
              onClick={() => onSelectTarget(curr)}
              className={`p-4 rounded-2xl text-left border transition group relative overflow-hidden ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-gray-900/60 hover:bg-gray-900 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-1 bg-gray-800/80 rounded-lg group-hover:scale-105 transition-transform">
                  {curr.flag}
                </span>
                <span className={`flex items-center text-[11px] font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isPositive ? `+${delta}%` : `${delta}%`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                    {curr.code}
                    <ArrowUpRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-gray-400 truncate max-w-[100px]">{curr.name}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-gray-100">
                    {rate !== undefined ? (rate < 1 ? rate.toFixed(4) : rate.toFixed(2)) : '—'}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{curr.symbol}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
