import React, { useState, useMemo } from 'react';
import { calculateTakeHomePay, TaxParams } from '../utils/taxCalculator';
import { DollarSign, PieChart, ArrowRight, Wallet, Building2, PiggyBank, MapPin } from 'lucide-react';
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
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Wallet className="text-indigo-600" />
            Income & Expenses
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Annual Salary</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Filing Status</label>
                <select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value as 'single' | 'married')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Location</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as 'OR' | 'Other')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900"
                >
                  <option value="OR">Oregon</option>
                  <option value="Other">Other State</option>
                </select>
              </div>
            </div>

            {state === 'OR' ? (
              <div className="p-3 bg-indigo-50 rounded-lg space-y-2">
                <div className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2">Local Taxes</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPortlandMetro}
                    onChange={(e) => setIsPortlandMetro(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Portland Metro (SHS Tax)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMultnomahCounty}
                    onChange={(e) => setIsMultnomahCounty(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Multnomah Co (PFA Tax)</span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">State Tax Rate (%)</label>
                <input
                  type="number"
                  value={customStateTaxRate}
                  onChange={(e) => setCustomStateTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">401k Contribution (%)</label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={contribution401k}
                onChange={(e) => setContribution401k(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-bold text-indigo-600">{contribution401k}%</span>
                <span>20%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Monthly Living Expenses</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Rent, food, utilities, transport, etc.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4">Monthly Breakdown</h3>
             <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-gray-200 rounded-full"><Building2 size={16} className="text-gray-600"/></div>
                   <span className="text-sm font-medium text-gray-600">Gross Pay</span>
                 </div>
                 <span className="font-bold text-gray-900">{formatCurrency(taxResult.grossMonthly)}</span>
               </div>
               
               <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-200 rounded-full"><Building2 size={16} className="text-red-600"/></div>
                   <span className="text-sm font-medium text-red-700">Federal & FICA</span>
                 </div>
                 <span className="font-bold text-red-700">-{formatCurrency(taxResult.federalTax + taxResult.ficaTax)}</span>
               </div>

               <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-200 rounded-full"><MapPin size={16} className="text-orange-600"/></div>
                   <span className="text-sm font-medium text-orange-700">State & Local</span>
                 </div>
                 <span className="font-bold text-orange-700">-{formatCurrency(taxResult.stateTax + taxResult.localTax)}</span>
               </div>

               {taxResult.contribution401k > 0 && (
                 <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-yellow-200 rounded-full"><PiggyBank size={16} className="text-yellow-600"/></div>
                     <span className="text-sm font-medium text-yellow-700">401k Savings</span>
                   </div>
                   <span className="font-bold text-yellow-700">-{formatCurrency(taxResult.contribution401k)}</span>
                 </div>
               )}

               <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-200 rounded-full"><Wallet size={16} className="text-indigo-600"/></div>
                   <span className="text-sm font-medium text-indigo-700">Net Take Home</span>
                 </div>
                 <span className="font-bold text-indigo-700">{formatCurrency(taxResult.netMonthly)}</span>
               </div>
             </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center">
             <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RePieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(val: number) => formatCurrency(val)} />
                   <Legend verticalAlign="bottom" height={36}/>
                 </RePieChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <DollarSign size={120} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Available for Debt</h2>
            <p className="text-emerald-200 mb-6 max-w-md">
              After taxes and living expenses, this is your estimated monthly free cash flow.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div>
                <div className="text-5xl font-extrabold tracking-tight">
                  {formatCurrency(disposableIncome)}
                </div>
                <div className="text-sm text-emerald-300 mt-1">per month</div>
              </div>

              <button
                onClick={() => onApplyBudget(disposableIncome)}
                className="group flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
              >
                Use This Amount
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
