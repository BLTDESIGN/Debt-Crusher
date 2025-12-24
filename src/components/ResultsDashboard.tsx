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
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface ResultsDashboardProps {
  result: PayoffResult;
  debts: Debt[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, debts }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full flex-shrink-0">
            <Calendar size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-gray-500 font-medium truncate">Debt Free In</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(result.monthsToFree / 12)}y {result.monthsToFree % 12}m
            </div>
            <div className="text-xs text-gray-400 truncate">Total {result.monthsToFree} months</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full flex-shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-gray-500 font-medium truncate">Total Interest</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.totalInterest)}</div>
            <div className="text-xs text-gray-400 truncate">Paid over time</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full flex-shrink-0">
            <DollarSign size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-gray-500 font-medium truncate">Total Paid</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(result.totalInterest + debts.reduce((sum, d) => sum + d.balance, 0))}
            </div>
            <div className="text-xs text-gray-400 truncate">Principal + Interest</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Payoff Timeline</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af" 
                tick={{fontSize: 12}}
                tickFormatter={(val) => `Mo ${val}`}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{fontSize: 12}}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="totalBalance" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="Total Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Payoff Order */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Victory Milestones</h3>
        <div className="space-y-3">
          {result.payoffOrder.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full text-sm">
                {index + 1}
              </div>
              <div className="flex-grow">
                <div className="font-bold text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">Paid off in month {item.month}</div>
              </div>
              <div className="text-indigo-600 font-bold text-sm">
                {Math.floor(item.month / 12) > 0 ? `${Math.floor(item.month / 12)}y ` : ''}{item.month % 12}m
              </div>
            </div>
          ))}
          {result.payoffOrder.length === 0 && (
            <div className="text-gray-500 text-center py-4">Add debts and budget to see your milestones!</div>
          )}
        </div>
      </div>
    </div>
  );
};
