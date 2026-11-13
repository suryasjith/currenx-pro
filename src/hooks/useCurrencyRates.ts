import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLatestRates } from '../services/api';

export function useCurrencyRates(baseCurrency: string) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'network' | 'cache' | 'fallback'>('network');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(60);
  
  const timerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadRates = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    setError(null);
    try {
      const result = await fetchLatestRates(baseCurrency);
      setRates(result.data.rates);
      setLastUpdated(new Date(result.data.timestamp || Date.now()));
      setSource(result.source);
      setRefreshCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  // Initial fetch and base currency change
  useEffect(() => {
    loadRates(true);
  }, [loadRates]);

  // 60-second auto refresh & countdown
  useEffect(() => {
    countdownTimerRef.current = window.setInterval(() => {
      setRefreshCountdown(prev => (prev > 1 ? prev - 1 : 60));
    }, 1000);

    timerRef.current = window.setInterval(() => {
      loadRates(false);
    }, 60000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [loadRates]);

  return {
    rates,
    lastUpdated,
    loading,
    error,
    source,
    isOnline,
    refreshCountdown,
    refresh: () => loadRates(true)
  };
}
