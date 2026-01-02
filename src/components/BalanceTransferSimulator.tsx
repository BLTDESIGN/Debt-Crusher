import React, { useState, useMemo } from 'react';
import { 
  calculateRefinanceStrategy, 
  calculateRequiredPaymentForTransfer,
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
import { 
  AttachMoneyRounded, 
  CalendarTodayRounded, 
  PercentRounded
} from '@mui/icons-material';
import { clsx } from 'clsx';

export const BalanceTransferSimulator: React.FC<{
  currentDebt: number;
  currentApr: number;
  currentMonthlyPayment: number;
  baselineMonthsToPayoff: number;
  baselineTotalInterest: number;
  mode?: 'transfer' | 'loan';
}> = ({ currentDebt, currentApr, currentMonthlyPayment, baselineMonthsToPayoff, baselineTotalInterest, mode }) => {
  const [params, setParams] = useState<BalanceTransferParams>({
    totalDebt: currentDebt,
    currentApr: currentApr,
    
    // Transfer Defaults
    strategyType: mode || 'transfer',
    transferAmount: Math.min(currentDebt, 15000), // Default to a realistic limit or half debt
    transferFeePercent: 3,
    introDurationMonths: 18,
    introApr: 0,
    postIntroApr: 18,
    monthlyPayment: currentMonthlyPayment,

    // Loan Defaults
    loanRate: 10,
    loanTermMonths: 60,
    originationFeePercent: 5
  });

  // Update local params when props change
  React.useEffect(() => {
    setParams(prev => ({
      ...prev,
      totalDebt: currentDebt,
      currentApr: currentApr,
      monthlyPayment: currentMonthlyPayment,
      strategyType: mode || prev.strategyType
    }));
  }, [currentDebt, currentApr, currentMonthlyPayment, mode]);

  const result = useMemo(() => calculateRefinanceStrategy(params), [params]);

  // Calculate required payment for transfer strategy
  const requiredPayment = useMemo(() => {
    if (params.strategyType === 'transfer') {
      return calculateRequiredPaymentForTransfer(params);
    }
    return 0;
  }, [params]);

  const updateParam = (key: keyof BalanceTransferParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const interestSavings = baselineTotalInterest - result.totalInterestPaid;
  const timeSavings = baselineMonthsToPayoff - result.monthsToPayoff;

  return (
    <div className="space-y-6">
      {/* Merged Details & Analysis */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Analysis & Tabs (Moved from Right) */}
          <div className="lg:border-r lg:border-gray-100 lg:pr-12 flex flex-col h-full">
            {/* Strategy Toggle - Only show if mode is not provided */}
            {!mode && (
              <div className="bg-gray-100 p-1 rounded-xl flex mb-6">
                <button
                  onClick={() => updateParam('strategyType', 'transfer')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                    params.strategyType === 'transfer' 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Split / Transfer
                </button>
                <button
                  onClick={() => updateParam('strategyType', 'loan')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                    params.strategyType === 'loan' 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Consolidation
                </button>
              </div>
            )}

            {params.strategyType === 'transfer' ? (
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>The Split Strategy:</strong> By using multiple balance transfer cards, you can move a significant portion of your debt to 0% interest.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Pros:</strong> Drastically reduces interest on the transferred amount.</li>
                  <li><strong>Cons:</strong> Requires good credit to get approved for multiple cards. Hard inquiries will temporarily dip your score.</li>
                  <li><strong>Tip:</strong> Pay the minimum on the 0% cards and aggressively attack the remaining {formatCurrency(Math.max(0, params.totalDebt - params.transferAmount))} high-interest debt first.</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Debt Consolidation Loan:</strong> A personal loan simplifies your debt into one fixed monthly payment.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Pros:</strong> Predictable payment, lower rate than credit cards (usually), no surprise rate hikes.</li>
                  <li><strong>Cons:</strong> You pay interest from day one (unlike 0% cards). Origination fees can be 1-8%.</li>
                  <li><strong>Verdict:</strong> Best if you want simplicity and can't qualify for enough balance transfer limit.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Inputs (Moved from Left) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {params.strategyType === 'transfer' ? 'Balance Transfer Details' : 'Loan Details'}
            </h2>
            
            <div className="space-y-4">
              {params.strategyType === 'transfer' ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 font-bold mb-1">Total transfer limit</label>
                    <div className="relative">
                      <AttachMoneyRounded sx={{ fontSize: 16 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={params.transferAmount}
                        onChange={(e) => updateParam('transferAmount', parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                      />
                    </div>
                    {params.transferAmount < params.totalDebt && (
                      <div className="text-xs text-red-600 mt-1 font-medium">
                        {formatCurrency(params.totalDebt - params.transferAmount)} remains at high interest
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 font-bold mb-1">Transfer fee %</label>
                      <div className="relative">
                        <PercentRounded sx={{ fontSize: 14 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={params.transferFeePercent}
                          onChange={(e) => updateParam('transferFeePercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 font-bold mb-1">Intro duration</label>
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
                      <label className="block text-sm text-gray-600 font-bold mb-1">Intro APR</label>
                      <div className="relative">
                        <PercentRounded sx={{ fontSize: 14 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={params.introApr}
                          onChange={(e) => updateParam('introApr', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 font-bold mb-1">Loan rate (APR)</label>
                      <div className="relative">
                        <PercentRounded sx={{ fontSize: 14 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={params.loanRate}
                          onChange={(e) => updateParam('loanRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 font-bold mb-1">Origination fee</label>
                      <div className="relative">
                        <PercentRounded sx={{ fontSize: 14 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={params.originationFeePercent}
                          onChange={(e) => updateParam('originationFeePercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 font-bold mb-1">Loan term (months)</label>
                    <select
                      value={params.loanTermMonths}
                      onChange={(e) => updateParam('loanTermMonths', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                    >
                      <option value={36}>36 Months (3 Years)</option>
                      <option value={48}>48 Months (4 Years)</option>
                      <option value={60}>60 Months (5 Years)</option>
                      <option value={72}>72 Months (6 Years)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Payment Strategy Hidden */}
          </div>
        </div>
      </div>

      {/* Savings Summary (Moved to Bottom) */}
      <div className={clsx(
        "p-8 rounded-2xl border flex flex-col justify-center",
        interestSavings > 0 
          ? "bg-emerald-50 border-emerald-100" 
          : interestSavings < 0 
            ? "bg-orange-50 border-orange-100" 
            : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="flex-1">
            <h3 className={clsx(
              "text-sm font-bold uppercase tracking-wide mb-2", 
              interestSavings > 0 ? "text-emerald-700" : interestSavings < 0 ? "text-orange-700" : "text-gray-500"
            )}>
              {interestSavings >= 0 ? "Projected Interest Savings" : "Additional Interest Cost"}
            </h3>
            <div className={clsx(
              "text-5xl font-extrabold mb-2", 
              interestSavings > 0 ? "text-emerald-900" : interestSavings < 0 ? "text-orange-900" : "text-gray-900"
            )}>
              {formatCurrency(Math.abs(interestSavings))}
            </div>
            <p className={clsx(
              "text-sm", 
              interestSavings > 0 ? "text-emerald-800" : interestSavings < 0 ? "text-orange-800" : "text-gray-500"
            )}>
              {interestSavings > 0 
                ? "Compared to your current payoff plan." 
                : interestSavings < 0
                  ? "This strategy costs more in interest than your current plan."
                  : "This strategy breaks even with your current plan."}
            </p>
          </div>

          {timeSavings !== 0 && (
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm min-w-[200px]">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-sm mb-1">
                <CalendarTodayRounded sx={{ fontSize: 16 }} />
                Time Saved
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.abs(timeSavings)} months {timeSavings > 0 ? 'sooner' : 'later'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
