import React, { useState, useId } from 'react';
import { ArrowLeftRight, ChevronDown, SlidersHorizontal, BellRing, Sparkles } from 'lucide-react';
import { CurrencyInfo } from '../types/currency';
import { CurrencySelectorModal } from './CurrencySelectorModal';

interface Props {
  amount: number;
  onAmountChange: (val: number) => void;
  fromCurrency: CurrencyInfo;
  toCurrency: CurrencyInfo;
  onFromCurrencyChange: (curr: CurrencyInfo) => void;
  onToCurrencyChange: (curr: CurrencyInfo) => void;
  onSwap: () => void;
  rate: number;
  loading: boolean;
  onSetAlertForPair: (from: string, to: string, rate: number) => void;
}

const PRESET_AMOUNTS = [100, 500, 1000, 5000, 10000];

const FEE_OPTIONS = [
  { label: '0% Mid-Market', value: 0, tag: 'Interbank' },
  { label: '0.5% Low Fee', value: 0.5, tag: 'Fintech' },
  { label: '1.5% Standard', value: 1.5, tag: 'Bank' },
  { label: '3.0% Retail', value: 3.0, tag: 'Airport' }
];

export const CurrencyConverter: React.FC<Props> = ({
  amount,
  onAmountChange,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  onSwap,
  rate,
  loading,
  onSetAlertForPair
}) => {
  const [modalMode, setModalMode] = useState<'from' | 'to' | null>(null);
  const [feePercentage, setFeePercentage] = useState<number>(0);
  const [showFeeOptions, setShowFeeOptions] = useState<boolean>(false);
  const inputId = useId();

  // Sanitized Rate against undefined / NaN
  const safeRate = typeof rate === 'number' && !isNaN(rate) && rate > 0 ? rate : 1;

  // Calculations
  const grossResult = amount * safeRate;
  const feeDeduction = grossResult * (feePercentage / 100);
  const netResult = grossResult - feeDeduction;
  const inverseRate = safeRate > 0 ? 1 / safeRate : 0;

  const formatCurrency = (val: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(/,/g, ''));
    if (isNaN(val)) {
      onAmountChange(0);
    } else {
      onAmountChange(Math.max(0, val));
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Actions */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Instant Currency Conversion
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time interbank rate with custom margin calculator</p>
        </div>

        <button
          onClick={() => onSetAlertForPair(fromCurrency.code, toCurrency.code, rate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/80 text-emerald-400 text-xs font-medium transition"
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Set Alert</span>
        </button>
      </div>

      {/* Preset Amount Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-gray-400 flex items-center mr-1">Quick Select:</span>
        {PRESET_AMOUNTS.map(preset => (
          <button
            key={preset}
            onClick={() => onAmountChange(preset)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
              amount === preset
                ? 'bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/20'
                : 'bg-gray-800/70 hover:bg-gray-800 text-gray-300 border border-gray-700/60'
            }`}
          >
            {fromCurrency.symbol}{formatCurrency(preset, 0)}
          </button>
        ))}
      </div>

      {/* Input / Output Row with Centered Swap Button */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 items-center mb-6">
        {/* From Box */}
        <div className="bg-gray-900/90 border border-gray-800 focus-within:border-emerald-500/60 rounded-2xl p-4 transition shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={inputId} className="text-xs font-medium text-gray-400 uppercase tracking-wider">You Convert</label>
            <span className="text-xs text-gray-500 font-mono">{fromCurrency.country}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              id={inputId}
              type="number"
              min="0"
              step="any"
              value={amount === 0 ? '' : amount}
              onChange={handleAmountInput}
              placeholder="0.00"
              className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-white placeholder-gray-600 focus:outline-none"
            />

            {/* Currency Button */}
            <button
              onClick={() => setModalMode('from')}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl px-3 py-2 text-white transition shrink-0"
            >
              <span className="text-xl">{fromCurrency.flag}</span>
              <span className="font-bold tracking-wide">{fromCurrency.code}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 lg:my-0">
          <button
            onClick={onSwap}
            title="Swap currencies"
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/25 transition active:scale-95 group"
          >
            <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300 stroke-[2.5]" />
          </button>
        </div>

        {/* To Box */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 transition shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">You Receive (Gross)</span>
            <span className="text-xs text-gray-500 font-mono">{toCurrency.country}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-full text-2xl sm:text-3xl font-bold font-mono text-emerald-400 truncate">
              {loading ? (
                <span className="animate-pulse text-gray-500">Calculating...</span>
              ) : (
                `${toCurrency.symbol} ${formatCurrency(grossResult, toCurrency.decimals ?? 2)}`
              )}
            </div>

            {/* Currency Button */}
            <button
              onClick={() => setModalMode('to')}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl px-3 py-2 text-white transition shrink-0"
            >
              <span className="text-xl">{toCurrency.flag}</span>
              <span className="font-bold tracking-wide">{toCurrency.code}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Mid-Market Rate Summary Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900/60 border border-gray-800/80 rounded-2xl mb-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-400">Live Rate:</span>
          <span className="text-white font-mono font-semibold">
            1 {fromCurrency.code} = {safeRate.toFixed(4)} {toCurrency.code}
          </span>
          <span className="text-gray-600 font-mono">|</span>
          <span className="text-gray-400">
            1 {toCurrency.code} = {inverseRate.toFixed(4)} {fromCurrency.code}
          </span>
        </div>

        <button
          onClick={() => setShowFeeOptions(!showFeeOptions)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showFeeOptions ? 'Hide Fee Simulator' : 'Simulate Bank Transfer Fees'}</span>
        </button>
      </div>

      {/* Fee & Markup Simulator */}
      {showFeeOptions && (
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Fee & Spread Markup Simulator
              </span>
              <span className="text-[11px] text-gray-500">
                (Standard banks hide 1.5% - 3.5% in rate spreads)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{feePercentage}% Markup</span>
          </div>

          {/* Preset Fee Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FEE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFeePercentage(opt.value)}
                className={`p-2.5 rounded-xl text-left border transition ${
                  feePercentage === opt.value
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                    : 'bg-gray-800/60 border-gray-700/80 hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] text-gray-500">{opt.tag}</div>
              </button>
            ))}
          </div>

          {/* Fee Breakdown Summary */}
          {feePercentage > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-950/70 border border-gray-800/60 rounded-xl text-xs font-mono">
              <div>
                <span className="text-gray-500 block text-[10px]">Gross Converted:</span>
                <span className="text-gray-300 font-semibold">{toCurrency.symbol}{formatCurrency(grossResult)}</span>
              </div>
              <div>
                <span className="text-rose-400 block text-[10px]">Estimated Fee / Hidden Spread:</span>
                <span className="text-rose-400 font-semibold">-{toCurrency.symbol}{formatCurrency(feeDeduction)}</span>
              </div>
              <div>
                <span className="text-emerald-400 block text-[10px]">True Net Received:</span>
                <span className="text-emerald-400 font-bold">{toCurrency.symbol}{formatCurrency(netResult)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Currency Picker Modal */}
      <CurrencySelectorModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        selectedCode={modalMode === 'from' ? fromCurrency.code : toCurrency.code}
        title={modalMode === 'from' ? 'Select Base Currency' : 'Select Target Currency'}
        onSelect={curr => {
          if (modalMode === 'from') {
            if (curr.code === toCurrency.code) onSwap();
            else onFromCurrencyChange(curr);
          } else if (modalMode === 'to') {
            if (curr.code === fromCurrency.code) onSwap();
            else onToCurrencyChange(curr);
          }
        }}
      />
    </div>
  );
};
