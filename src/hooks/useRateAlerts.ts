import { useState, useEffect, useCallback } from 'react';
import { RateAlert } from '../types/currency';

const ALERTS_STORAGE_KEY = 'currenx_rate_alerts';

export function useRateAlerts(currentRates: Record<string, number>, baseCurrency: string) {
  const [alerts, setAlerts] = useState<RateAlert[]>(() => {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Play audio chime via Web Audio API
  const playAlertChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts:', e);
    }
  }, [alerts]);

  // Monitor rates for active alerts
  useEffect(() => {
    if (!currentRates || Object.keys(currentRates).length === 0) return;

    setAlerts(prevAlerts => {
      let changed = false;
      const updated = prevAlerts.map(alert => {
        // If alert matches current base
        if (alert.active && !alert.triggered && alert.from === baseCurrency) {
          const currentRate = currentRates[alert.to];
          if (currentRate !== undefined) {
            const isTriggered =
              alert.condition === 'above'
                ? currentRate >= alert.targetRate
                : currentRate <= alert.targetRate;

            if (isTriggered) {
              changed = true;
              playAlertChime();
              setNotification(
                `🚨 Alert Triggered! ${alert.from}/${alert.to} is now ${currentRate.toFixed(4)} (${alert.condition} ${alert.targetRate})`
              );
              return { ...alert, triggered: true, active: false };
            }
          }
        }
        return alert;
      });

      return changed ? updated : prevAlerts;
    });
  }, [currentRates, baseCurrency, playAlertChime]);

  const addAlert = (from: string, to: string, targetRate: number, condition: 'above' | 'below') => {
    const newAlert: RateAlert = {
      id: Math.random().toString(36).substring(2, 9),
      from,
      to,
      targetRate,
      condition,
      createdAt: Date.now(),
      active: true,
      triggered: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, active: !a.active, triggered: false } : a))
    );
  };

  const clearNotification = () => setNotification(null);

  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    notification,
    clearNotification
  };
}
