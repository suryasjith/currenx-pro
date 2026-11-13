import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  rates: Record<string, number>;
  baseCurrency: string;
}

const TICKER_PAIRS = [
  { from: 'EUR', to: 'USD' },
  { from: 'GBP', to: 'USD' },
  { from: 'USD', to: 'JPY' },
  { from: 'USD', to: 'CHF' },
  { from: 'USD', to: 'CAD' },
  { from: 'AUD', to: 'USD' },
  { from: 'USD', to: 'INR' },
  { from: 'EUR', to: 'GBP' },
  { from: 'USD', to: 'CNY' },
  { from: 'USD', to: 'SGD' }
];

export const MarketTicker: React.FC<Props> = ({ rates, baseCurrency }) => {
  // Compute pair rate using triangulation if rates are against baseCurrency
  const getPairRate = (from: string, to: string): { rate: number; delta: number } => {
    let rate = 1;
    if (baseCurrency === from) {
      rate = rates[to] || 1;
    } else if (baseCurrency === to) {
      rate = rates[from] ? 1 / rates[from] : 1;
    } else {
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;
      rate = toRate / fromRate;
    }

    // Deterministic subtle pseudorandom delta based on pair name
    const hash = (from + to).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const delta = +(((hash % 17) - 8) * 0.05).toFixed(2);

    return { rate, delta };
  };

  return (
    <div className="w-full bg-[#0D1322] border-b border-gray-800/80 overflow-x-auto scrollbar-none py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs whitespace-nowrap">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-gray-500 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          FOREX TICKER:
        </span>
        <div className="flex items-center gap-6">
          {TICKER_PAIRS.map(pair => {
            const { rate, delta } = getPairRate(pair.from, pair.to);
            const isPositive = delta >= 0;
            return (
              <div key={`${pair.from}-${pair.to}`} className="flex items-center gap-2 font-mono">
                <span className="text-gray-300 font-semibold">{pair.from}/{pair.to}</span>
                <span className="text-white font-medium">{rate < 1 ? rate.toFixed(4) : rate.toFixed(2)}</span>
                <span className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? `+${delta}%` : `${delta}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
