import React, { useState } from 'react';
import { RateAlert } from '../types/currency';
import { POPULAR_CURRENCIES } from '../data/currencies';
import { X, Bell, Trash2, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alerts: RateAlert[];
  onAddAlert: (from: string, to: string, targetRate: number, condition: 'above' | 'below') => void;
  onRemoveAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
  prefill?: { from: string; to: string; rate: number } | null;
}

export const RateAlertsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onToggleAlert,
  prefill
}) => {
  const [fromCode, setFromCode] = useState(prefill?.from || 'USD');
  const [toCode, setToCode] = useState(prefill?.to || 'EUR');
  const [targetRate, setTargetRate] = useState<string>(prefill ? (prefill.rate * 1.02).toFixed(4) : '1.0000');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(targetRate);
    if (!isNaN(rateVal) && rateVal > 0) {
      onAddAlert(fromCode, toCode, rateVal, condition);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Rate Alert Monitor</h3>
              <p className="text-xs text-gray-400">Trigger chimes when exchange rates hit target thresholds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleSubmit} className="p-6 border-b border-gray-800 bg-gray-900/50 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            Create New Rate Alert
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">Base Currency</label>
              <select
                value={fromCode}
                onChange={e => setFromCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">Target Currency</label>
              <select
                value={toCode}
                onChange={e => setToCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as 'above' | 'below')}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="above">rises above (≥</option>
                <option value="below">drops below (≤)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">Target Rate</label>
              <input
                type="number"
                step="any"
                required
                value={targetRate}
                onChange={e => setTargetRate(e.target.value)}
                placeholder="e.g. 1.0950"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-semibold text-black text-xs transition shadow-lg shadow-emerald-500/20"
          >
            Activate Alert
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Active Watchlist ({alerts.length})
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No active rate alerts. Set one above to receive audio chimes when rates hit your threshold!
            </div>
          ) : (
            alerts.map(a => (
              <div
                key={a.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  a.triggered
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : a.active
                    ? 'bg-gray-800/60 border-gray-700'
                    : 'bg-gray-900/30 border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {a.triggered ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <div>
                    <div className="font-mono font-bold text-white text-sm">
                      {a.from} / {a.to} {a.condition === 'above' ? '≥' : '≤'} {a.targetRate.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {a.triggered ? 'Triggered!' : a.active ? 'Monitoring live...' : 'Paused'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleAlert(a.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
                  >
                    {a.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => onRemoveAlert(a.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
