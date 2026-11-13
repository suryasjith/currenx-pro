import { useState } from 'react';
import { getCurrency } from './data/currencies';
import { CurrencyInfo } from './types/currency';
import { useCurrencyRates } from './hooks/useCurrencyRates';
import { useRateAlerts } from './hooks/useRateAlerts';
import { Header } from './components/Header';
import { MarketTicker } from './components/MarketTicker';
import { CurrencyConverter } from './components/CurrencyConverter';
import { HistoricalChart } from './components/HistoricalChart';
import { CurrencyGrid } from './components/CurrencyGrid';
import { RateAlertsModal } from './components/RateAlertsModal';
import { Bell, X, ShieldCheck, Zap } from 'lucide-react';

export function App() {
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(getCurrency('USD'));
  const [toCurrency, setToCurrency] = useState<CurrencyInfo>(getCurrency('EUR'));
  const [amount, setAmount] = useState<number>(1000);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [alertPrefill, setAlertPrefill] = useState<{ from: string; to: string; rate: number } | null>(null);

  // Fetch rates with base = fromCurrency.code
  const {
    rates,
    lastUpdated,
    loading,
    source,
    isOnline,
    refreshCountdown,
    refresh
  } = useCurrencyRates(fromCurrency.code);

  // Rate alerts monitor
  const {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    notification,
    clearNotification
  } = useRateAlerts(rates, fromCurrency.code);

  const activeRate = rates[toCurrency.code] || 1.0;

  const handleSwap = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
  };

  const handleSetAlertForPair = (from: string, to: string, rate: number) => {
    setAlertPrefill({ from, to, rate });
    setIsAlertsOpen(true);
  };

  const activeAlertsCount = alerts.filter(a => a.active).length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        lastUpdated={lastUpdated}
        loading={loading}
        source={source}
        isOnline={isOnline}
        refreshCountdown={refreshCountdown}
        onRefresh={refresh}
        onOpenAlerts={() => {
          setAlertPrefill(null);
          setIsAlertsOpen(true);
        }}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Real-time Ticker */}
      <MarketTicker rates={rates} baseCurrency={fromCurrency.code} />

      {/* Floating Triggered Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-500 text-black p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
            <Bell className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={clearNotification}
            className="p-1 hover:bg-black/10 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Flagship Converter Section */}
        <CurrencyConverter
          amount={amount}
          onAmountChange={setAmount}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          onFromCurrencyChange={setFromCurrency}
          onToCurrencyChange={setToCurrency}
          onSwap={handleSwap}
          rate={activeRate}
          loading={loading}
          onSetAlertForPair={handleSetAlertForPair}
        />

        {/* Analytics & Charts */}
        <HistoricalChart
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          currentRate={activeRate}
        />

        {/* Global Multi-Currency Grid */}
        <CurrencyGrid
          baseCurrency={fromCurrency}
          rates={rates}
          onSelectTarget={curr => setToCurrency(curr)}
          activeTargetCode={toCurrency.code}
        />

        {/* Institutional Trust & Architecture Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">ECB Reference Benchmark</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Powered by official European Central Bank reference exchange rates updated daily.
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Sub-Second Smart Cache</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Stale-while-revalidate client persistence with automatic offline grace degradation.
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Local Audio Chime Alerts</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Synthesized Web Audio frequency cues with zero external tracking or audio bloat.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#070A11] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">CurrenX Pro</span>
            <span>•</span>
            <span>Enterprise Forex Intelligence</span>
          </div>
          <div>
            Data sourced via European Central Bank & Open Exchange Feeds. All rates are mid-market indications.
          </div>
        </div>
      </footer>

      {/* Rate Alerts Modal */}
      <RateAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAddAlert={addAlert}
        onRemoveAlert={removeAlert}
        onToggleAlert={toggleAlert}
        prefill={alertPrefill}
      />
    </div>
  );
}

export default App;
