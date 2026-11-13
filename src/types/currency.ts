export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
  decimals?: number;
}

export interface ExchangeRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
  timestamp?: number;
}

export interface HistoricalRatePoint {
  date: string;
  rate: number;
}

export type TimeframeOption = '7D' | '30D' | '90D' | '1Y';

export interface RateAlert {
  id: string;
  from: string;
  to: string;
  targetRate: number;
  condition: 'above' | 'below';
  createdAt: number;
  active: boolean;
  triggered?: boolean;
}

export interface FeeCalculation {
  markupPercentage: number;
  feeAmount: number;
  netRate: number;
  totalReceived: number;
}
