import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { HistoricalRatePoint, TimeframeOption, CurrencyInfo } from '../types/currency';
import { fetchHistoricalData } from '../services/api';
import { TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';

interface Props {
  fromCurrency: CurrencyInfo;
  toCurrency: CurrencyInfo;
  currentRate: number;
}

export const HistoricalChart: React.FC<Props> = ({
  fromCurrency,
  toCurrency,
  currentRate
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30D');
  const [data, setData] = useState<HistoricalRatePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetchHistoricalData(fromCurrency.code, toCurrency.code, timeframe, currentRate)
      .then(points => {
        if (!isCancelled) {
          setData(points);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [fromCurrency.code, toCurrency.code, timeframe, currentRate]);

  // Compute Stats
  const stats = useMemo(() => {
    if (!data.length) return { min: 0, max: 0, avg: 0, change: 0, isPositive: true };

    const rates = data.map(d => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;

    const first = rates[0];
    const last = rates[rates.length - 1];
    const change = first !== 0 ? ((last - first) / first) * 100 : 0;

    return {
      min,
      max,
      avg,
      change,
      isPositive: change >= 0
    };
  }, [data]);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {fromCurrency.code}/{toCurrency.code} Historical Trend
            </h3>
            <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
              stats.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {stats.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stats.isPositive ? `+${stats.change.toFixed(2)}%` : `${stats.change.toFixed(2)}%`}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Historical interbank close prices</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl">
          {(['7D', '30D', '90D', '1Y'] as TimeframeOption[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                timeframe === tf
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
        <div className="p-3 bg-gray-900/70 border border-gray-800/80 rounded-xl">
          <span className="text-[10px] text-gray-500 uppercase block tracking-wider">Period High</span>
          <span className="text-sm sm:text-base font-bold text-white">
            {stats.max < 1 ? stats.max.toFixed(4) : stats.max.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-gray-900/70 border border-gray-800/80 rounded-xl">
          <span className="text-[10px] text-gray-500 uppercase block tracking-wider">Period Low</span>
          <span className="text-sm sm:text-base font-bold text-white">
            {stats.min < 1 ? stats.min.toFixed(4) : stats.min.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-gray-900/70 border border-gray-800/80 rounded-xl">
          <span className="text-[10px] text-gray-500 uppercase block tracking-wider">Average Rate</span>
          <span className="text-sm sm:text-base font-bold text-gray-300">
            {stats.avg < 1 ? stats.avg.toFixed(4) : stats.avg.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-gray-900/70 border border-gray-800/80 rounded-xl">
          <span className="text-[10px] text-gray-500 uppercase block tracking-wider">Volatility Spread</span>
          <span className="text-sm sm:text-base font-bold text-amber-400">
            {stats.min > 0 ? (((stats.max - stats.min) / stats.min) * 100).toFixed(2) : 0}%
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 animate-pulse">
            <Activity className="w-5 h-5 mr-2 animate-spin text-emerald-400" />
            Loading historical exchange curve...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stats.isPositive ? "#10B981" : "#F43F5E"} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={stats.isPositive ? "#10B981" : "#F43F5E"} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: string) => {
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val: number) => (val < 1 ? val.toFixed(3) : val.toFixed(1))}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload as HistoricalRatePoint;
                    return (
                      <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl shadow-xl font-mono text-xs">
                        <div className="text-gray-400 flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{pt.date}</span>
                        </div>
                        <div className="text-white font-bold text-sm">
                          1 {fromCurrency.code} = {pt.rate.toFixed(4)} {toCurrency.code}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={stats.isPositive ? "#10B981" : "#F43F5E"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
