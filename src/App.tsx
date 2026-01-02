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
import { 
  InfoRounded, 
  DashboardRounded, 
  AccountBalanceWalletRounded, 
  AddRounded, 
  PercentRounded, 
  TrendingDownRounded, 
  EditRounded, 
  CheckRounded 
} from '@mui/icons-material';
import { clsx } from 'clsx';

const INITIAL_DEBTS: Debt[] = [
  { id: '1', name: 'Credit Card 1', balance: 75000, apr: 24.99, minPayment: 1562 },
];

type Tab = 'snowball' | 'transfer' | 'budget';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('snowball');
  const [analysisTab, setAnalysisTab] = useState<'baseline' | 'transfer' | 'consolidation'>('baseline');
  
  // Snowball State
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const [strategy, setStrategy] = useState<Strategy>('avalanche');
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const totalMinPayment = useMemo(() => debts.reduce((sum, d) => sum + d.minPayment, 0), [debts]);
  const totalBalance = useMemo(() => debts.reduce((sum, d) => sum + d.balance, 0), [debts]);
  const totalMonthlyInterest = useMemo(() => debts.reduce((sum, d) => sum + (d.balance * (d.apr / 100) / 12), 0), [debts]);
  const weightedAvgApr = useMemo(() => {
    if (totalBalance === 0) return 0;
    const weightedSum = debts.reduce((sum, d) => sum + (d.balance * d.apr), 0);
    return weightedSum / totalBalance;
  }, [debts, totalBalance]);
  
  // Initialize total budget to cover interest only by default
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    return Math.ceil(INITIAL_DEBTS.reduce((sum, d) => sum + (d.balance * (d.apr / 100) / 12), 0));
  });

  // Ensure we always pay at least the minimums
  const effectiveBudget = Math.max(totalBudget, totalMinPayment);
  const totalMonthlyPrincipal = Math.max(0, effectiveBudget - totalMonthlyInterest);

  const result = useMemo(() => {
    return calculatePayoff(debts, effectiveBudget, strategy);
  }, [debts, effectiveBudget, strategy]);

  // Calculate the "other" strategy for comparison
  const comparisonResult = useMemo(() => {
    const otherStrategy = strategy === 'snowball' ? 'avalanche' : 'snowball';
    return calculatePayoff(debts, effectiveBudget, otherStrategy);
  }, [debts, effectiveBudget, strategy]);

  const savings = comparisonResult.totalInterest - result.totalInterest;

  const handleApplyBudget = (availableAmount: number) => {
    setTotalBudget(availableAmount);
    setActiveTab('snowball');
  };

  const handleAddDebt = () => {
    const newDebt: Debt = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Credit Card ${debts.length + 1}`,
      balance: 5000,
      apr: 19.99,
      minPayment: 100
    };
    setDebts([...debts, newDebt]);
    setTotalBudget(prev => prev + newDebt.minPayment);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div 
            className="flex items-center gap-4"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Debt Crusher</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('snowball')}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === 'snowball' 
                  ? "bg-white text-emerald-600 border border-gray-200" 
                  : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"
              )}
            >
              <DashboardRounded sx={{ fontSize: 18 }} />
              Planning view
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === 'budget' 
                  ? "bg-white text-emerald-600 border border-gray-200" 
                  : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"
              )}
            >
              <AccountBalanceWalletRounded sx={{ fontSize: 18 }} />
              Salary view
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        <div>
          {activeTab === 'snowball' ? (
            <div
              className="space-y-8"
            >
              {/* Inputs Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Debts Input & Summary Combined */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 relative">
                  <div className="mb-8 pr-20">
                    <div className="text-sm text-gray-600 font-bold truncate mb-1">Total debt</div>
                    <div className="text-2xl font-extrabold text-gray-900 tracking-tight">${totalBalance.toLocaleString()}</div>
                  </div>
                  
                  <button
                    onClick={handleAddDebt}
                    className="absolute top-6 right-6 w-16 h-16 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center hover:text-emerald-600 transition-all active:scale-95"
                    aria-label="Add Debt"
                  >
                    <AddRounded sx={{ fontSize: 32 }} />
                  </button>

                  <DebtInput debts={debts} onChange={setDebts} />
                </section>

                {/* Strategy Selection - Hidden */}
                <section className="hidden bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Choose your strategy
                    <div className="group relative">
                      <InfoRounded sx={{ fontSize: 16 }} className="text-gray-400 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Lowest Balance builds momentum. Highest Interest saves money.
                      </div>
                    </div>
                  </h2>
                  <StrategySelector strategy={strategy} onChange={setStrategy} />
                  
                  {savings !== 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-center gap-2">
                      <InfoRounded sx={{ fontSize: 16 }} />
                      {savings > 0 ? (
                        <span>
                          You save <strong>${Math.round(savings).toLocaleString()}</strong> in interest with this strategy compared to {strategy === 'snowball' ? 'Highest Interest' : 'Lowest Balance'}!
                        </span>
                      ) : (
                        <span>
                          This strategy costs <strong>${Math.round(Math.abs(savings)).toLocaleString()}</strong> more than {strategy === 'snowball' ? 'Highest Interest' : 'Lowest Balance'}, but might feel better psychologically.
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {/* Budget Input */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 relative">
                  <div className="mb-8 pr-20">
                    <div className="text-sm text-gray-600 font-bold truncate mb-1">Total monthly contribution</div>
                    <div className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
                      $
                      {isEditingBudget ? (
                        <input
                          type="text"
                          value={totalBudget.toLocaleString()}
                          onChange={(e) => {
                            // Remove non-numeric characters except decimal point
                            const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                            // Prevent multiple decimal points
                            if ((rawValue.match(/\./g) || []).length > 1) return;
                            
                            setTotalBudget(Math.max(0, parseFloat(rawValue) || 0));
                          }}
                          className="bg-transparent border-none focus:ring-0 p-0 w-48 font-extrabold text-gray-900 placeholder-gray-300"
                          placeholder="0"
                          autoFocus
                        />
                      ) : (
                        totalBudget.toLocaleString()
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingBudget(!isEditingBudget)}
                    className="absolute top-6 right-6 w-16 h-16 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center hover:text-emerald-600 transition-all active:scale-95"
                    aria-label={isEditingBudget ? "Save Contribution" : "Edit Contribution"}
                  >
                    {isEditingBudget ? <CheckRounded sx={{ fontSize: 32 }} /> : <EditRounded sx={{ fontSize: 32 }} />}
                  </button>
                  
                  <div className="space-y-6">
                    {/* Breakdown */}
                    <div className="">
                      <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4 w-full min-h-[188px]">
                        <div className="flex-1 flex items-center gap-4">
                          <div className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                            <PercentRounded sx={{ fontSize: 24 }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-600 font-bold truncate">Interest / mo</div>
                            <div className="text-xl font-bold text-gray-900 truncate">${Math.round(totalMonthlyInterest).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="hidden sm:block w-px bg-gray-200 self-stretch"></div>

                        <div className="flex-1 flex items-center gap-4">
                          <div className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                            <TrendingDownRounded sx={{ fontSize: 24 }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-600 font-bold truncate">Principal / mo</div>
                            <div className="text-xl font-bold text-gray-900 truncate">
                              ${Math.round(totalMonthlyPrincipal).toLocaleString()}
                            </div>
                            <div className="text-xs mt-1 text-gray-400 truncate">
                              {totalMonthlyPrincipal > 0 ? "" : "Increase budget to pay off faster!"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {totalBudget < totalMinPayment && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <InfoRounded sx={{ fontSize: 16 }} />
                        Your budget is less than the required minimums (${totalMinPayment.toLocaleString()}). We'll use the minimums for calculation.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Merged Analysis Section */}
              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl inline-flex mb-6">
                  <button
                    onClick={() => setAnalysisTab('baseline')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                      analysisTab === 'baseline' 
                        ? "bg-white text-emerald-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Monthly Payments
                  </button>
                  <button
                    onClick={() => setAnalysisTab('transfer')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                      analysisTab === 'transfer' 
                        ? "bg-white text-emerald-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Split / Transfer
                  </button>
                  <button
                    onClick={() => setAnalysisTab('consolidation')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                      analysisTab === 'consolidation' 
                        ? "bg-white text-emerald-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Consolidation
                  </button>
                </div>

                {analysisTab === 'baseline' && (
                  <ResultsDashboard result={result} debts={debts} />
                )}

                {analysisTab === 'transfer' && (
                  <BalanceTransferSimulator 
                    currentDebt={totalBalance} 
                    currentApr={weightedAvgApr} 
                    currentMonthlyPayment={totalBudget}
                    baselineMonthsToPayoff={result.monthsToFree}
                    baselineTotalInterest={result.totalInterest}
                    mode="transfer"
                  />
                )}

                {analysisTab === 'consolidation' && (
                  <BalanceTransferSimulator 
                    currentDebt={totalBalance} 
                    currentApr={weightedAvgApr} 
                    currentMonthlyPayment={totalBudget}
                    baselineMonthsToPayoff={result.monthsToFree}
                    baselineTotalInterest={result.totalInterest}
                    mode="loan"
                  />
                )}
              </section>
            </div>
          ) : (
            <div
            >
              <BudgetAnalyzer onApplyBudget={handleApplyBudget} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

