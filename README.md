# CurrenX Pro - Real-Time Currency Exchange & Forex Intelligence

A high-performance, institutional-grade forex currency converter and market dashboard built with **React 19, TypeScript, Vite, Tailwind CSS, and Recharts**.

## Key Features

1. **Live Interbank Exchange Rates**:
   - Zero-configuration live rate feeds from the European Central Bank (Frankfurter API) with automatic failover to Open ExchangeRate-API.
   - 60-second automatic polling with visible countdown timer and manual sync trigger.
   - Intelligent stale-while-revalidate caching with offline mode detection.

2. **Flagship Bi-Directional Converter**:
   - High-speed calculations with instant swap button.
   - Currency selector modal supporting 30+ major global fiat currencies.
   - Quick amount shortcuts ($100, $500, $1,000, $5,000, $10,000).
   - Interactive bank fee & spread markup simulator (0%, 0.5%, 1.5%, 3.0%).

3. **Interactive Historical Analytics**:
   - Dynamic SVG AreaChart powered by Recharts with gradient fills.
   - Switchable timeframes: 7 Days (7D), 30 Days (30D), 90 Days (90D), and 1 Year (1Y).
   - Key statistical metrics: High, Low, Average, and Volatility Spread %.

4. **Rate Alerts & Audio Frequency Chimes**:
   - Monitor exchange rate thresholds with custom directional conditions (≥ or ≤).
   - Real-time rate triggers synthesized via the native Web Audio API (no external audio assets).
   - Floating notification banner with dismiss options.

5. **Live Forex Ticker & Market Matrix**:
   - Real-time scrolling ticker tape for major currency pairs.
   - 15-pair global rates matrix relative to the active base currency.

---

## Getting Started

### 1. Development Mode
```bash
npm run dev
```

### 2. Production Build
```bash
npm run build
npm run preview
```
