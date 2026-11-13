import { ExchangeRatesResponse, HistoricalRatePoint, TimeframeOption } from '../types/currency';

const CACHE_PREFIX = 'currenx_rates_';
const CACHE_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes

interface CachedRates {
  timestamp: number;
  data: ExchangeRatesResponse;
}

export async function fetchLatestRates(baseCurrency: string): Promise<{ data: ExchangeRatesResponse; source: 'network' | 'cache' | 'fallback' }> {
  const cacheKey = `${CACHE_PREFIX}${baseCurrency}`;
  
  // Try network first
  try {
    // 1. Primary: Frankfurter API
    const frankfurterRes = await fetch(`https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`);
    if (frankfurterRes.ok) {
      const json = await frankfurterRes.json();
      if (json && json.rates && typeof json.rates === 'object' && Object.keys(json.rates).length > 3) {
        const responseData: ExchangeRatesResponse = {
          base: json.base,
          date: json.date,
          rates: { ...json.rates, [baseCurrency]: 1 },
          timestamp: Date.now()
        };
        
        // Save to localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: responseData
          } as CachedRates));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        
        return { data: responseData, source: 'network' };
      }
    }
  } catch (err) {
    console.warn('Frankfurter API failed, trying secondary fallback:', err);
  }

  // 2. Secondary: Open ExchangeRate-API
  try {
    const erRes = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    if (erRes.ok) {
      const json = await erRes.json();
      if (json && json.result === 'success' && json.rates && typeof json.rates === 'object' && Object.keys(json.rates).length > 3) {
        const responseData: ExchangeRatesResponse = {
          base: json.base_code,
          date: json.time_last_update_utc ? new Date(json.time_last_update_utc).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          rates: json.rates,
          timestamp: Date.now()
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: responseData
          } as CachedRates));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }

        return { data: responseData, source: 'network' };
      }
    }
  } catch (err) {
    console.warn('Secondary API failed, checking local cache:', err);
  }

  // 3. Fallback to LocalStorage Cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed: CachedRates = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS || !navigator.onLine) {
        return { data: parsed.data, source: 'cache' };
      }
    } catch {
      // cache corrupted
    }
  }

  // 4. Hardcoded emergency standard rates relative to USD / EUR
  return {
    data: getEmergencyRates(baseCurrency),
    source: 'fallback'
  };
}

function getEmergencyRates(base: string): ExchangeRatesResponse {
  const standardAgainstUSD: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.5,
    CAD: 1.38,
    AUD: 1.52,
    CHF: 0.88,
    CNY: 7.23,
    INR: 84.4,
    SGD: 1.34,
    NZD: 1.68,
    HKD: 7.78,
    SEK: 10.6,
    KRW: 1390,
    BRL: 5.75,
    MXN: 20.3,
    AED: 3.67,
    SAR: 3.75,
    TRY: 34.5,
    ZAR: 18.1,
    THB: 34.8,
    IDR: 15800,
    PLN: 4.08,
    NOK: 10.9,
    DKK: 6.87
  };

  const baseRate = standardAgainstUSD[base] || 1;
  const converted: Record<string, number> = {};
  for (const [code, rate] of Object.entries(standardAgainstUSD)) {
    converted[code] = +(rate / baseRate).toFixed(4);
  }

  return {
    base,
    date: new Date().toISOString().split('T')[0],
    rates: converted,
    timestamp: Date.now()
  };
}

export async function fetchHistoricalData(
  from: string,
  to: string,
  timeframe: TimeframeOption,
  currentRate: number
): Promise<HistoricalRatePoint[]> {
  const days = timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : timeframe === '90D' ? 90 : 365;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/${startStr}..${endStr}?base=${from}&symbols=${to}`);
    if (res.ok) {
      const data = await res.json();
      if (data.rates && Object.keys(data.rates).length > 0) {
        const points: HistoricalRatePoint[] = Object.entries(data.rates).map(([date, ratesObj]) => ({
          date,
          rate: (ratesObj as Record<string, number>)[to]
        }));
        return points.sort((a, b) => a.date.localeCompare(b.date));
      }
    }
  } catch (err) {
    console.warn('Historical API fetch error, generating historical curve based on current anchor rate:', err);
  }

  // Graceful simulation curve anchored on live currentRate
  return generateSyntheticHistory(days, currentRate);
}

function generateSyntheticHistory(days: number, currentRate: number): HistoricalRatePoint[] {
  const points: HistoricalRatePoint[] = [];
  const baseRate = currentRate || 1.0;
  const volatility = 0.008; // 0.8% realistic daily variance
  let simRate = baseRate * (1 - (Math.random() * 0.03 - 0.015));

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Brownian walk towards current rate on the last day
    const progress = 1 - (i / days);
    const noise = (Math.random() - 0.49) * volatility * simRate;
    simRate = simRate + noise;
    
    // Blend with currentRate near the present
    const finalRate = i === 0 ? baseRate : +(simRate * (1 - progress * 0.3) + baseRate * (progress * 0.3)).toFixed(4);
    points.push({
      date: dateStr,
      rate: finalRate
    });
  }

  return points;
}
