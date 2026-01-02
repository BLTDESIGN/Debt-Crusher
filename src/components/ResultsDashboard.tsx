import React from 'react';
import { PayoffResult, Debt } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CalendarTodayRounded, AttachMoneyRounded, TrendingUpRounded } from '@mui/icons-material';

interface ResultsDashboardProps {
  result: PayoffResult;
  debts: Debt[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, debts }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const colors = ['#10b981', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Section - Top Row */}
      <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1 flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
              <CalendarTodayRounded />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-600 font-bold truncate">Debt free in</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-extrabold text-gray-900">
                  {Math.floor(result.monthsToFree / 12)}y {result.monthsToFree % 12}m
                </div>
                <div className="text-sm font-medium text-gray-500 truncate">
                  {new Date(new Date().setMonth(new Date().getMonth() + result.monthsToFree)).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).replace(' ', " '")}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-gray-200 self-stretch"></div>

          <div className="flex-1 flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
              <TrendingUpRounded />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-600 font-bold truncate">Total interest</div>
              <div className="text-2xl font-extrabold text-gray-900">{formatCurrency(result.totalInterest)}</div>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-gray-200 self-stretch"></div>

          <div className="flex-1 flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
              <AttachMoneyRounded />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-600 font-bold truncate">Total paid</div>
              <div className="text-2xl font-extrabold text-gray-900">
                {formatCurrency(result.totalInterest + debts.reduce((sum, d) => sum + d.balance, 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section - Bottom Row */}
        <div className="w-full h-[300px] bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payoff timeline</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af" 
                tick={{fontSize: 12}}
                tickFormatter={(val) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + val);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).replace(' ', " '");
                }}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{fontSize: 12}}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + (label as number));
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).replace(' ', " '");
                }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="totalBalance" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="Total Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
  );
};
