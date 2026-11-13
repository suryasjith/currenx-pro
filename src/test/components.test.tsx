import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';
import { getCurrency } from '../data/currencies';
import { CurrencyGrid } from '../components/CurrencyGrid';

describe('Header Component', () => {
  it('renders branding and live status correctly', () => {
    render(
      <Header
        lastUpdated={new Date()}
        loading={false}
        source="network"
        isOnline={true}
        refreshCountdown={45}
        onRefresh={() => {}}
        onOpenAlerts={() => {}}
        activeAlertsCount={2}
      />
    );

    expect(screen.getByText(/Curren/i)).toBeDefined();
    expect(screen.getByText('Forex Pro')).toBeDefined();
    expect(screen.getByText('Live Feed')).toBeDefined();
    expect(screen.getByText('45s')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });
});

describe('CurrencyGrid Component', () => {
  it('renders currency rates matrix', () => {
    const usd = getCurrency('USD');
    const dummyRates = { EUR: 0.92, GBP: 0.79, JPY: 154.2 };

    render(
      <CurrencyGrid
        baseCurrency={usd}
        rates={dummyRates}
        onSelectTarget={() => {}}
        activeTargetCode="EUR"
      />
    );

    expect(screen.getByText(/Global Market Rates Matrix/i)).toBeDefined();
    expect(screen.getByText('EUR')).toBeDefined();
    expect(screen.getByText('GBP')).toBeDefined();
  });
});
