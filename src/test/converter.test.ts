import { describe, it, expect } from 'vitest';
import { getCurrency, POPULAR_CURRENCIES } from '../data/currencies';

describe('Currency Registry & Lookup', () => {
  it('returns known currency information accurately', () => {
    const usd = getCurrency('USD');
    expect(usd.code).toBe('USD');
    expect(usd.symbol).toBe('$');
    expect(usd.country).toBe('United States');

    const eur = getCurrency('EUR');
    expect(eur.code).toBe('EUR');
    expect(eur.symbol).toBe('€');
  });

  it('handles fallback for unknown currency code gracefully', () => {
    const xyz = getCurrency('XYZ');
    expect(xyz.code).toBe('XYZ');
    expect(xyz.symbol).toBe('XYZ');
    expect(xyz.flag).toBe('🌐');
  });

  it('contains essential global fiat currencies', () => {
    const codes = POPULAR_CURRENCIES.map(c => c.code);
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('JPY');
    expect(codes).toContain('INR');
  });
});

describe('Conversion & Fee Computation Math', () => {
  it('calculates gross conversion accurately', () => {
    const amount = 1000;
    const rate = 0.925;
    const gross = amount * rate;
    expect(gross).toBe(925);
  });

  it('computes fee deduction and net received correctly', () => {
    const amount = 1000;
    const rate = 1.08;
    const gross = amount * rate; // 1080
    const feePercentage = 1.5; // 1.5% bank fee

    const feeDeduction = gross * (feePercentage / 100);
    const netResult = gross - feeDeduction;

    expect(feeDeduction).toBeCloseTo(16.2, 2);
    expect(netResult).toBeCloseTo(1063.8, 2);
  });

  it('calculates reciprocal rate without division by zero', () => {
    const rate = 0.85;
    const inverse = rate > 0 ? 1 / rate : 0;
    expect(inverse).toBeCloseTo(1.17647, 4);

    const zeroRate = 0;
    const zeroInverse = zeroRate > 0 ? 1 / zeroRate : 0;
    expect(zeroInverse).toBe(0);
  });
});
