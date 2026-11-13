import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { HistoricalChart } from '../components/HistoricalChart';
import { CurrencyGrid } from '../components/CurrencyGrid';
import { getCurrency } from '../data/currencies';

describe('FAULT INJECTION: Edge cases that trigger crashes', () => {
  const usd = getCurrency('USD');
  const eur = getCurrency('EUR');

  it('safely handles rate as undefined or NaN in CurrencyConverter without throwing', () => {
    expect(() => {
      render(
        <CurrencyConverter
          amount={100}
          onAmountChange={() => {}}
          fromCurrency={usd}
          toCurrency={eur}
          onFromCurrencyChange={() => {}}
          onToCurrencyChange={() => {}}
          onSwap={() => {}}
          rate={undefined as unknown as number}
          loading={false}
          onSetAlertForPair={() => {}}
        />
      );
    }).not.toThrow();
  });

  it('fails if rate is NaN in CurrencyConverter', () => {
    expect(() => {
      render(
        <CurrencyConverter
          amount={100}
          onAmountChange={() => {}}
          fromCurrency={usd}
          toCurrency={eur}
          onFromCurrencyChange={() => {}}
          onToCurrencyChange={() => {}}
          onSwap={() => {}}
          rate={NaN}
          loading={false}
          onSetAlertForPair={() => {}}
        />
      );
    }).not.toThrow(); // NaN.toFixed(4) produces "NaN" in JS, but let's test if it renders cleanly
  });

  it('verifies CurrencyGrid rendering when rates dictionary is empty or missing currencies', () => {
    expect(() => {
      render(
        <CurrencyGrid
          baseCurrency={usd}
          rates={{}} // empty rates map
          onSelectTarget={() => {}}
          activeTargetCode="EUR"
        />
      );
    }).not.toThrow();

    // Should display dashes '—' instead of throwing
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('verifies HistoricalChart when currentRate is 0 or negative', () => {
    expect(() => {
      render(
        <HistoricalChart
          fromCurrency={usd}
          toCurrency={eur}
          currentRate={0}
        />
      );
    }).not.toThrow();
  });
});
