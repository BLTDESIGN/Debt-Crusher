import { Debt, PayoffResult, Strategy } from '../types';

export const calculatePayoff = (
  debts: Debt[],
  monthlyBudget: number,
  strategy: Strategy
): PayoffResult => {
  // 1. Setup initial state
  // We infer the minimum payment rate from the initial values provided by the user.
  // Rate = minPayment / balance.
  // We'll use this rate to calculate future minimum payments as the balance decreases.
  const initialDebts = debts.map(d => ({
    ...d,
    minPaymentRate: d.balance > 0 ? d.minPayment / d.balance : 0
  }));

  let currentDebts = initialDebts.map(d => ({ ...d }));
  let totalInterest = 0;
  let month = 0;
  const chartData: { month: number; totalBalance: number; [key: string]: number }[] = [];
  const payoffOrder: { name: string; month: number }[] = [];
  const paidOffIds = new Set<string>();

  // Log initial state
  chartData.push({
    month: 0,
    totalBalance: currentDebts.reduce((sum, d) => sum + d.balance, 0),
    ...currentDebts.reduce((acc, d) => ({ ...acc, [d.name]: d.balance }), {})
  });

  // Safety break at 600 months (50 years)
  while (currentDebts.some(d => d.balance > 0.01) && month < 600) {
    month++;
    
    // 2. Accrue Interest
    currentDebts.forEach(d => {
      if (d.balance > 0) {
        const interest = d.balance * (d.apr / 100 / 12);
        d.balance += interest;
        totalInterest += interest;
      }
    });

    // 3. Calculate Required Minimums for this month
    // We assume min payment drops as balance drops, but never below $25 (unless balance < 25)
    const requiredPayments = currentDebts.map(d => {
      if (d.balance <= 0) return { id: d.id, amount: 0 };
      
      let min = d.balance * d.minPaymentRate;
      // Floor at $25 or balance if lower
      if (min < 25) min = 25;
      if (min > d.balance) min = d.balance;
      
      return { id: d.id, amount: min };
    });

    const totalRequiredMin = requiredPayments.reduce((sum, p) => sum + p.amount, 0);

    // 4. Determine Actual Payments
    // If budget < totalRequiredMin, we assume the user finds the money or pays what they can.
    // For this tool, we'll use the MAX of (budget, totalRequiredMin) to ensure mins are met.
    let moneyAvailable = Math.max(monthlyBudget, totalRequiredMin);
    
    // Deduct mins from available money
    moneyAvailable -= totalRequiredMin;

    // Apply minimums
    requiredPayments.forEach(p => {
      const debt = currentDebts.find(d => d.id === p.id);
      if (debt) {
        debt.balance -= p.amount;
      }
    });

    // 5. Apply Excess (Snowball/Avalanche)
    if (moneyAvailable > 0) {
      // Sort debts that still have balance
      const activeDebts = currentDebts.filter(d => d.balance > 0.01);
      
      if (activeDebts.length > 0) {
        activeDebts.sort((a, b) => {
          if (strategy === 'snowball') {
            // Lowest balance first
            return a.balance - b.balance;
          } else {
            // Highest APR first
            return b.apr - a.apr;
          }
        });

        // Pour money into the top priority
        // If we pay it off, move to next
        let remainingMoney = moneyAvailable;
        for (const debt of activeDebts) {
          if (remainingMoney <= 0) break;
          
          const payment = Math.min(debt.balance, remainingMoney);
          debt.balance -= payment;
          remainingMoney -= payment;
        }
      }
    }

    // 6. Check for payoffs
    currentDebts.forEach(d => {
      if (d.balance <= 0.01 && !paidOffIds.has(d.id)) {
        d.balance = 0;
        paidOffIds.add(d.id);
        payoffOrder.push({ name: d.name, month });
      }
    });

    // 7. Log Data
    chartData.push({
      month,
      totalBalance: Math.max(0, currentDebts.reduce((sum, d) => sum + d.balance, 0)),
      ...currentDebts.reduce((acc, d) => ({ ...acc, [d.name]: Math.max(0, d.balance) }), {})
    });
  }

  return {
    totalInterest,
    monthsToFree: month,
    chartData,
    payoffOrder
  };
};
