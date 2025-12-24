/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Debt, Strategy } from './types';
import { calculatePayoff } from './utils/debtCalculator';
import { DebtInput } from './components/DebtInput';
import { StrategySelector } from './components/StrategySelector';
import { ResultsDashboard } from './components/ResultsDashboard';
import { BalanceTransferSimulator } from './components/BalanceTransferSimulator';
import { BudgetAnalyzer } from './components/BudgetAnalyzer';
import { Calculator, DollarSign, Info, CreditCard, LayoutDashboard, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

const INITIAL_DEBTS: Debt[] = [
  { id: '1', name: 'Credit Card A (High APR)', balance: 15000, apr: 24.99, minPayment: 450 },
  { id: '2', name: 'Credit Card B (Big Bal)', balance: 40000, apr: 18.99, minPayment: 1000 },
  { id: '3', name: 'Personal Loan', balance: 20000, apr: 12.99, minPayment: 400 },
];

type Tab = 'snowball' | 'transfer' | 'budget';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('snowball');
  
  // Snowball State
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const [extraPayment, setExtraPayment] = useState<number>(500);
  const [strategy, setStrategy] = useState<Strategy>('avalanche');

  const totalMinPayment = useMemo(() => debts.reduce((sum, d) => sum + d.minPayment, 0), [debts]);
  const totalBalance = useMemo(() => debts.reduce((sum, d) => sum + d.balance, 0), [debts]);
  
  // Calculate total monthly budget (min + extra)
  const monthlyBudget = totalMinPayment + extraPayment;

  const result = useMemo(() => {
    return calculatePayoff(debts, monthlyBudget, strategy);
  }, [debts, monthlyBudget, strategy]);

  // Calculate the "other" strategy for comparison
  const comparisonResult = useMemo(() => {
    const otherStrategy = strategy === 'snowball' ? 'avalanche' : 'snowball';
    return calculatePayoff(debts, monthlyBudget, otherStrategy);
  }, [debts, monthlyBudget, strategy]);

  const savings = comparisonResult.totalInterest - result.totalInterest;

  const handleApplyBudget = (availableAmount: number) => {
    // The available amount is the TOTAL available for debt.
    // We need to subtract the minimum payments to find the "extra" payment.
    const newExtra = Math.max(0, availableAmount - totalMinPayment);
    setExtraPayment(newExtra);
    setActiveTab('snowball');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Hero Header */}
      <div className="bg-indigo-700 text-white pt-12 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                <Calculator size={32} className="text-indigo-100" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Debt Crusher</h1>
                <p className="text-indigo-200 text-lg mt-1 font-medium">Master your financial destiny.</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-indigo-800/50 p-1 rounded-xl backdrop-blur-md inline-flex">
            <button
              onClick={() => setActiveTab('snowball')}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === 'snowball' 
                  ? "bg-white text-indigo-700 shadow-md" 
                  : "text-indigo-200 hover:bg-white/10"
              )}
            >
              <LayoutDashboard size={18} />
              Payoff Planner
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === 'budget' 
                  ? "bg-white text-indigo-700 shadow-md" 
                  : "text-indigo-200 hover:bg-white/10"
              )}
            >
              <Wallet size={18} />
              Salary Analyzer
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === 'transfer' 
                  ? "bg-emerald-500 text-white shadow-md" 
                  : "text-indigo-200 hover:bg-white/10"
              )}
            >
              <CreditCard size={18} />
              Balance Transfer
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <AnimatePresence mode="wait">
          {activeTab === 'snowball' ? (
            <motion.div
              key="snowball"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Inputs */}
              <div className="lg:col-span-2 space-y-8">
                {/* Strategy Selection */}
                <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    1. Choose Your Strategy
                    <div className="group relative">
                      <Info size={16} className="text-gray-400 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Snowball builds momentum by paying small debts first. Avalanche saves money by paying high interest first.
                      </div>
                    </div>
                  </h2>
                  <StrategySelector strategy={strategy} onChange={setStrategy} />
                  
                  {savings !== 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-center gap-2">
                      <Info size={16} />
                      {savings > 0 ? (
                        <span>
                          You save <strong>${Math.round(savings).toLocaleString()}</strong> in interest with this strategy compared to {strategy === 'snowball' ? 'Avalanche' : 'Snowball'}!
                        </span>
                      ) : (
                        <span>
                          This strategy costs <strong>${Math.round(Math.abs(savings)).toLocaleString()}</strong> more than {strategy === 'snowball' ? 'Avalanche' : 'Snowball'}, but might feel better psychologically.
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {/* Budget Input */}
                <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">2. Define Your Budget</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Required Minimums</div>
                      <div className="text-2xl font-bold text-gray-900">${totalMinPayment.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-1">Sum of all min payments</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Monthly Payment
                      </label>
                      <div className="relative">
                        <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={extraPayment}
                          onChange={(e) => setExtraPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold transition-shadow"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Total Monthly Budget: <span className="font-bold text-indigo-600">${monthlyBudget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Debts Input */}
                <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <DebtInput debts={debts} onChange={setDebts} />
                </section>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4">Summary</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="text-indigo-300 text-sm">Total Debt</div>
                        <div className="text-3xl font-bold">${totalBalance.toLocaleString()}</div>
                      </div>
                      <div className="pt-4 border-t border-indigo-800">
                        <div className="text-indigo-300 text-sm">Debt Free Date</div>
                        <div className="text-2xl font-bold">
                          {new Date(new Date().setMonth(new Date().getMonth() + result.monthsToFree)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ResultsDashboard result={result} debts={debts} />
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'budget' ? (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetAnalyzer onApplyBudget={handleApplyBudget} />
            </motion.div>
          ) : (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BalanceTransferSimulator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

