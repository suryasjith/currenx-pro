import React from 'react';
import { RefreshCw, Bell, WifiOff, Database, Clock } from 'lucide-react';

interface Props {
  lastUpdated: Date | null;
  loading: boolean;
  source: 'network' | 'cache' | 'fallback';
  isOnline: boolean;
  refreshCountdown: number;
  onRefresh: () => void;
  onOpenAlerts: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<Props> = ({
  lastUpdated,
  loading,
  source,
  isOnline,
  refreshCountdown,
  onRefresh,
  onOpenAlerts,
  activeAlertsCount
}) => {
  return (
    <header className="border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
            💱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Curren<span className="text-emerald-400">X</span></span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Forex Pro
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Real-time institutional forex rates & intelligence</p>
          </div>
        </div>

        {/* Live Network & Action Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
            {isOnline ? (
              source === 'network' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-gray-300 font-medium">Live Feed</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Cached Data</span>
                </>
              )
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 font-medium">Offline Mode</span>
              </>
            )}

            <span className="text-gray-600">|</span>
            <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 font-mono text-[11px]">
              {refreshCountdown}s
            </span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Force refresh current market rates"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition disabled:opacity-50 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Rate Alerts Button */}
          <button
            onClick={onOpenAlerts}
            title="Manage Rate Alerts"
            className="relative flex items-center justify-center p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black ring-2 ring-[#0B0F19]">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
