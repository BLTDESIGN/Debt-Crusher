import React, { useState, useMemo } from 'react';
import { 
  calculateBalanceTransfer, 
  calculateRequiredPaymentForIntro, 
  BalanceTransferParams 
} from '../utils/balanceTransferCalculator';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { DollarSign, Calendar, Percent, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

export const BalanceTransferSimulator: React.FC = () => {
  const [params, setParams] = useState<BalanceTransferParams>({
    transferAmount: 75000,
    transferFeePercent: 3,
    introDurationMonths: 18,
    introApr: 0,
    postIntroApr: 15,
    monthlyPayment: 2000 // Default placeholder
  });

  // Calculate the "Golden Payment" to pay off exactly in the intro period
  const requiredPayment = useMemo(() => {
    return calculateRequiredPaymentForIntro({
      transferAmount: params.transferAmount,
      transferFeePercent: params.transferFeePercent,
      introDurationMonths: params.introDurationMonths,
      introApr: params.introApr,
      postIntroApr: params.postIntroApr
    });
  }, [params.transferAmount, params.transferFeePercent, params.introDurationMonths, params.introApr]);

  // Run simulation
  const result = useMemo(() => calculateBalanceTransfer(params), [params]);

  const updateParam = (key: keyof BalanceTransferParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="text-emerald-600" />
            Loan Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Transfer Amount</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={params.transferAmount}
                  onChange={(e) => updateParam('transferAmount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Transfer Fee</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={params.transferFeePercent}
                    onChange={(e) => updateParam('transferFeePercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Intro Duration</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">mo</span>
                  <input
                    type="number"
                    value={params.introDurationMonths}
                    onChange={(e) => updateParam('introDurationMonths', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Intro APR</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={params.introApr}
                    onChange={(e) => updateParam('introApr', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Post-Intro APR</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={params.postIntroApr}
                    onChange={(e) => updateParam('postIntroApr', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl">
           <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-300" />
            Payment Strategy
           </h2>
           
           <div className="mb-6">
             <label className="block text-xs font-bold text-emerald-200 uppercase tracking-wide mb-2">Monthly Payment</label>
             <div className="relative">
                <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" />
                <input
                  type="number"
                  value={params.monthlyPayment}
                  onChange={(e) => updateParam('monthlyPayment', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 bg-emerald-800/50 border border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none font-bold text-2xl text-white placeholder-emerald-600"
                />
              </div>
           </div>

           <div className="p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50">
             <div className="flex justify-between items-start mb-2">
               <span className="text-emerald-200 text-sm font-medium">To pay off in {params.introDurationMonths} months:</span>
             </div>
             <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold text-white">{formatCurrency(Math.ceil(requiredPayment))}</span>
               <span className="text-emerald-300 text-sm">/mo</span>
             </div>
             <button 
               onClick={() => updateParam('monthlyPayment', Math.ceil(requiredPayment))}
               className="mt-3 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
             >
               Apply This Amount
             </button>
           </div>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={clsx(
            "p-5 rounded-xl border shadow-sm transition-all",
            result.isPaidInIntro ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
          )}>
            <div className="flex items-center gap-3 mb-2">
              {result.isPaidInIntro ? (
                <CheckCircle2 className="text-emerald-600" size={20} />
              ) : (
                <AlertCircle className="text-orange-600" size={20} />
              )}
              <span className={clsx("text-sm font-bold", result.isPaidInIntro ? "text-emerald-800" : "text-orange-800")}>
                {result.isPaidInIntro ? "Success!" : "Warning"}
              </span>
            </div>
            <div className={clsx("text-2xl font-bold", result.isPaidInIntro ? "text-emerald-900" : "text-orange-900")}>
              {Math.floor(result.monthsToPayoff / 12)}y {result.monthsToPayoff % 12}m
            </div>
            <div className={clsx("text-xs mt-1", result.isPaidInIntro ? "text-emerald-600" : "text-orange-600")}>
              Time to debt free
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-gray-400" size={20} />
              <span className="text-sm font-bold text-gray-500">Total Interest</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(result.totalInterestPaid)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Excludes {formatCurrency(result.initialBalance - params.transferAmount)} fee
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-gray-400" size={20} />
              <span className="text-sm font-bold text-gray-500">Total Cost</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(result.totalCost)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Principal + Fee + Interest
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Balance Projection</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'balance' ? 'Balance' : 'Interest Paid']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <ReferenceLine x={params.introDurationMonths} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Intro Ends', position: 'insideTopRight', fill: '#d97706', fontSize: 12 }} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  name="balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            The orange line marks the end of the {params.introDurationMonths}-month introductory period.
          </div>
        </div>

        {/* Monthly Breakdown Table (First 24 months or until payoff) */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Monthly Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium">Balance</th>
                  <th className="px-6 py-3 font-medium">Interest</th>
                  <th className="px-6 py-3 font-medium">Principal</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.monthlyData.slice(1, 25).map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-3 text-gray-600">{formatCurrency(row.balance)}</td>
                    <td className={clsx("px-6 py-3", row.interestPaid > 0 ? "text-red-500 font-medium" : "text-gray-400")}>
                      {formatCurrency(row.interestPaid)}
                    </td>
                    <td className="px-6 py-3 text-emerald-600">{formatCurrency(row.principalPaid)}</td>
                    <td className="px-6 py-3">
                      {row.isIntroPeriod ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          Intro Rate
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Standard APR
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.monthlyData.length > 25 && (
              <div className="px-6 py-3 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                Showing first 24 months only
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
