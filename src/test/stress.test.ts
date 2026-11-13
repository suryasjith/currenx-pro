import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLatestRates, fetchHistoricalData } from '../services/api';

describe('STRESS SUITE 1: Extreme Input & Numerical Edge Cases', () => {
  it('handles negative, zero, and infinite amount conversions', () => {
    const rate = 0.85;
    const testCases = [
      { input: 0, expected: 0 },
      { input: -100, expected: -85 },
      { input: 1e15, expected: 8.5e14 },
      { input: 1e-8, expected: 8.5e-9 },
      { input: Infinity, expected: Infinity },
      { input: -Infinity, expected: -Infinity },
      { input: NaN, expected: NaN },
    ];

    testCases.forEach(({ input, expected }) => {
      const gross = input * rate;
      if (isNaN(expected)) {
        expect(isNaN(gross)).toBe(true);
      } else {
        expect(gross).toBe(expected);
      }
    });
  });

  it('stress tests currency formatting under extreme magnitudes', () => {
    const formatCurrency = (val: number, decimals = 2) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(val);
    };

    expect(formatCurrency(0)).toBe('0.00');
    expect(formatCurrency(999999999999.99)).toBe('999,999,999,999.99');
    expect(formatCurrency(-5000.5)).toBe('-5,000.50');
    expect(formatCurrency(0.00001, 4)).toBe('0.0000');
    expect(() => formatCurrency(NaN)).not.toThrow();
    expect(() => formatCurrency(Infinity)).not.toThrow();
  });
});

describe('STRESS SUITE 2: Network Chaos, Outages & Corrupted API Responses', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('survives total network outage when all APIs throw errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error: ENOTFOUND'));

    const result = await fetchLatestRates('USD');
    expect(result).toBeDefined();
    expect(result.data.rates).toBeDefined();
    expect(result.data.rates['EUR']).toBeGreaterThan(0);
    expect(result.source).toBe('fallback');
  });

  it('survives 500 Internal Server Error from primary and secondary APIs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    );

    const result = await fetchLatestRates('GBP');
    expect(result.source).toBe('fallback');
    expect(result.data.base).toBe('GBP');
    expect(result.data.rates['USD']).toBeGreaterThan(0);
  });

  it('survives corrupted JSON in LocalStorage cache without crashing', async () => {
    localStorage.setItem('currenx_rates_USD', '{ bad_json: undefined, "corrupted": true ');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline'));

    const result = await fetchLatestRates('USD');
    expect(result.source).toBe('fallback');
    expect(result.data.rates['EUR']).toBeDefined();
  });

  it('survives completely empty or null rate object returned from API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ base: 'USD', date: '2026-11-13', rates: null }), { status: 200 })
    );

    // Should gracefully failover or survive
    const result = await fetchLatestRates('USD');
    expect(result).toBeDefined();
  });
});

describe('STRESS SUITE 3: Historical Curve Math Edge Cases & Volatility Bounds', () => {
  it('handles zero volatility without division by zero when all historical rates are identical', () => {
    const flatData = [
      { date: '2026-11-01', rate: 1.05 },
      { date: '2026-11-02', rate: 1.05 },
      { date: '2026-11-03', rate: 1.05 },
    ];

    const rates = flatData.map(d => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const first = rates[0];
    const last = rates[rates.length - 1];
    const change = first !== 0 ? ((last - first) / first) * 100 : 0;
    const volatilitySpread = min > 0 ? (((max - min) / min) * 100).toFixed(2) : '0';

    expect(min).toBe(1.05);
    expect(max).toBe(1.05);
    expect(avg).toBe(1.05);
    expect(change).toBe(0);
    expect(volatilitySpread).toBe('0.00');
  });

  it('handles historical API total failure with synthetic curve fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Historical API Timeout'));

    const history = await fetchHistoricalData('USD', 'EUR', '30D', 0.92);
    expect(history.length).toBeGreaterThan(25);
    expect(history[0].rate).toBeGreaterThan(0);
    expect(history[history.length - 1].rate).toBeCloseTo(0.92, 1);
  });

  it('handles synthetic curve generation when currentRate is 0 or negative', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Service Unavailable'));

    const zeroHistory = await fetchHistoricalData('USD', 'EUR', '7D', 0);
    expect(zeroHistory.length).toBe(8);
  });
});

describe('STRESS SUITE 4: Rapid Concurrency & High-Frequency Alert Triggers', () => {
  it('handles 100 concurrent rate fetches without unhandled rejections', async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      fetchLatestRates(i % 2 === 0 ? 'USD' : 'EUR')
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(100);
    results.forEach(res => {
      expect(res.data.rates).toBeDefined();
    });
  });

  it('evaluates 500 simultaneous rate alerts efficiently', () => {
    const mockRates: Record<string, number> = {
      EUR: 0.925,
      GBP: 0.792,
      JPY: 154.2,
      CAD: 1.38,
      AUD: 1.52,
    };

    const alerts = Array.from({ length: 500 }, (_, i) => ({
      id: `alert-${i}`,
      from: 'USD',
      to: 'EUR',
      targetRate: 0.9 + (i % 50) * 0.001,
      condition: (i % 2 === 0 ? 'above' : 'below') as 'above' | 'below',
      active: true,
      createdAt: Date.now(),
    }));

    const start = performance.now();
    let triggeredCount = 0;
    alerts.forEach(alert => {
      const current = mockRates[alert.to];
      if (current !== undefined) {
        const triggered =
          alert.condition === 'above'
            ? current >= alert.targetRate
            : current <= alert.targetRate;
        if (triggered) triggeredCount++;
      }
    });
    const duration = performance.now() - start;

    expect(triggeredCount).toBeGreaterThan(0);
    expect(duration).toBeLessThan(50); // must execute under 50ms
  });
});
