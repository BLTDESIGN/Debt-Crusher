import React, { useState, useMemo } from 'react';
import { calculateTakeHomePay, TaxParams } from '../utils/taxCalculator';
import { 
  AttachMoneyRounded, 
  ArrowForwardRounded, 
  AccountBalanceWalletRounded, 
  ApartmentRounded, 
  SavingsRounded, 
  LocationOnRounded,
  KeyboardArrowDownRounded,
  HomeRounded
} from '@mui/icons-material';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { clsx } from 'clsx';

interface BudgetAnalyzerProps {
  onApplyBudget: (amount: number) => void;
}

export const BudgetAnalyzer: React.FC<BudgetAnalyzerProps> = ({ onApplyBudget }) => {
  const [salary, setSalary] = useState(250000);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [contribution401k, setContribution401k] = useState(0);
  const [state, setState] = useState<'OR' | 'Other'>('OR');
  const [customStateTaxRate, setCustomStateTaxRate] = useState(5.0);
  const [isPortlandMetro, setIsPortlandMetro] = useState(false);
  const [isMultnomahCounty, setIsMultnomahCounty] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState(5000);

  const taxResult = useMemo(() => {
    return calculateTakeHomePay({
      annualSalary: salary,
      filingStatus,
      contribution401kPercent: contribution401k,
      state,
      customStateTaxRate,
      isPortlandMetro,
      isMultnomahCounty
    });
  }, [salary, filingStatus, contribution401k, state, customStateTaxRate, isPortlandMetro, isMultnomahCounty]);

  const disposableIncome = Math.max(0, taxResult.netMonthly - monthlyExpenses);

  const chartData = [
    { name: 'Federal & FICA', value: taxResult.federalTax + taxResult.ficaTax, color: '#ef4444' },
    { name: 'State & Local', value: taxResult.stateTax + taxResult.localTax, color: '#f97316' },
    { name: '401k', value: taxResult.contribution401k, color: '#f59e0b' },
    { name: 'Expenses', value: monthlyExpenses, color: '#6366f1' },
    { name: 'Available', value: disposableIncome, color: '#10b981' },
  ].filter(d => d.value > 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Income & Expenses
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 font-bold mb-1">Annual salary</label>
              <div className="relative">
                <AttachMoneyRounded sx={{ fontSize: 16 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 font-bold mb-1">Monthly living expenses</label>
              <div className="relative">
                <AttachMoneyRounded sx={{ fontSize: 16 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Rent, food, utilities, transport, etc.</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 font-bold mb-1">Location</label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as 'OR' | 'Other')}
                  className="w-full appearance-none px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium text-gray-900 pr-10 transition-colors hover:border-gray-400"
                >
                  <option value="OR">Oregon</option>
                  <option value="Other">Other State</option>
                </select>
                <KeyboardArrowDownRounded className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {state === 'OR' ? (
              <div className="p-3 bg-emerald-50 rounded-lg space-y-2">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Local Taxes</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPortlandMetro}
                    onChange={(e) => setIsPortlandMetro(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Portland Metro (SHS Tax)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMultnomahCounty}
                    onChange={(e) => setIsMultnomahCounty(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Multnomah Co (PFA Tax)</span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">State tax rate (%)</label>
                <input
                  type="number"
                  value={customStateTaxRate}
                  onChange={(e) => setCustomStateTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 font-bold mb-1">401k contribution (%)</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={contribution401k}
                  onChange={(e) => setContribution401k(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 block"
                />
                <div className="relative mt-1 h-5">
                  <div className={`absolute left-0 text-xs text-gray-400 transition-opacity ${contribution401k === 0 ? 'opacity-0' : 'opacity-100'}`}>0%</div>
                  <div 
                    className="absolute -translate-x-1/2 text-sm font-bold text-emerald-600 transition-all"
                    style={{ left: `${(contribution401k / 20) * 100}%` }}
                  >
                    {contribution401k}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header / Action Section */}
          <div className="p-8 border-b border-gray-100 relative">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Available for Debt
              </h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12">
                <div>
                  <div className="text-sm text-gray-600 font-bold mb-1">Gross pay</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(taxResult.grossMonthly)} <span className="text-xl text-gray-400 font-medium">/mo</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 font-bold mb-1">Available for debt</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(disposableIncome)} <span className="text-xl text-gray-400 font-medium">/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visuals & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Breakdown List */}
            <div className="p-8">
               <h3 className="font-bold text-gray-800 mb-4">Monthly Breakdown</h3>
               <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-red-200 rounded-full"><ApartmentRounded sx={{ fontSize: 16 }} className="text-red-600"/></div>
                     <span className="text-sm font-medium text-red-700">Federal & FICA</span>
                   </div>
                   <span className="font-bold text-red-700">-{formatCurrency(taxResult.federalTax + taxResult.ficaTax)}</span>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-orange-200 rounded-full"><LocationOnRounded sx={{ fontSize: 16 }} className="text-orange-600"/></div>
                     <span className="text-sm font-medium text-orange-700">State & Local</span>
                   </div>
                   <span className="font-bold text-orange-700">-{formatCurrency(taxResult.stateTax + taxResult.localTax)}</span>
                 </div>

                 {taxResult.contribution401k > 0 && (
                   <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-200 rounded-full"><SavingsRounded sx={{ fontSize: 16 }} className="text-yellow-600"/></div>
                       <span className="text-sm font-medium text-yellow-700">401k Savings</span>
                     </div>
                     <span className="font-bold text-yellow-700">-{formatCurrency(taxResult.contribution401k)}</span>
                   </div>
                 )}

                 <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-200 rounded-full"><HomeRounded sx={{ fontSize: 16 }} className="text-indigo-600"/></div>
                     <span className="text-sm font-medium text-indigo-700">Living Expenses</span>
                   </div>
                   <span className="font-bold text-indigo-700">-{formatCurrency(monthlyExpenses)}</span>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-200 rounded-full"><AccountBalanceWalletRounded sx={{ fontSize: 16 }} className="text-emerald-600"/></div>
                     <span className="text-sm font-medium text-emerald-700">Available for Debt</span>
                   </div>
                   <span className="font-bold text-emerald-700">{formatCurrency(disposableIncome)}</span>
                 </div>
               </div>
            </div>

            {/* Chart */}
            <div className="p-6 flex flex-col items-center justify-center">
               <div className="h-[300px] w-24 py-3">
                 <svg className="w-full h-full overflow-visible">
                   {chartData.map((entry, index) => {
                     const total = taxResult.grossMonthly;
                     const offset = chartData.slice(0, index).reduce((sum, d) => sum + d.value, 0);
                     const pct = (entry.value / total) * 100;
                     const startPct = (offset / total) * 100;
                     
                     // With round caps, the visual length extends by strokeWidth.
                     // We need a larger gap to prevent overlap and distinct separation.
                     const gap = 3; 
                     const dashVal = Math.max(0.1, pct - gap);
                     const dashArray = `${dashVal} ${100 - dashVal}`;
                     
                     return (
                       <rect
                         key={`bar-${index}`}
                         x="0"
                         y="0"
                         width="100%"
                         height="100%"
                         rx="20"
                         fill="none"
                         stroke={entry.color}
                         strokeWidth="16"
                         strokeLinecap="round"
                         pathLength="100"
                         strokeDasharray={dashArray}
                         strokeDashoffset={-startPct}
                         className="transition-all hover:opacity-80"
                       >
                         <title>{`${entry.name}: ${formatCurrency(entry.value)}`}</title>
                       </rect>
                     );
                   })}
                 </svg>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
