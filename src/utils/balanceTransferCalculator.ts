export interface BalanceTransferParams {
  totalDebt: number;
  currentApr: number;
  
  // Transfer Strategy
  transferAmount: number; // The limit we can transfer
  transferFeePercent: number;
  introDurationMonths: number;
  introApr: number;
  postIntroApr: number;
  monthlyPayment: number;

  // Loan Strategy
  loanRate: number;
  loanTermMonths: number;
  originationFeePercent: number;
  
  strategyType: 'transfer' | 'loan';
}

export interface SimulationResult {
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalCost: number;
  monthlyData: {
    month: number;
    balance: number;
    interestPaid: number;
    principalPaid: number;
    isIntroPeriod?: boolean;
  }[];
  isPaidInIntro?: boolean; // For transfer
  monthlyPayment?: number; // For loan (fixed)
  initialBalance: number; // Added to match previous interface usage if needed, or we can adapt
}

export const calculateRefinanceStrategy = (params: BalanceTransferParams): SimulationResult => {
  if (params.strategyType === 'loan') {
    return calculateConsolidationLoan(params);
  } else {
    return calculateSplitTransfer(params);
  }
};

// Kept for backward compatibility if needed, but we redirect to new logic
export const calculateBalanceTransfer = (params: any): any => {
  // Map old params to new structure if necessary, or just use the new one directly
  // The component is being updated to use calculateRefinanceStrategy, so this might be dead code soon.
  // But to be safe, let's just alias it to the split transfer logic which covers the basic case.
  return calculateSplitTransfer({
    ...params,
    totalDebt: params.transferAmount, // In old interface, transferAmount was the total debt
    currentApr: 0, // Old interface didn't have current APR for remainder
    strategyType: 'transfer'
  });
};

const calculateConsolidationLoan = (params: BalanceTransferParams): SimulationResult => {
  const { totalDebt, loanRate, loanTermMonths, originationFeePercent } = params;
  
  const principal = totalDebt * (1 + originationFeePercent / 100);
  
  const r = loanRate / 100 / 12;
  const n = loanTermMonths;
  
  // PMT formula
  const monthlyPayment = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  
  const monthlyData = [];
  let currentBalance = principal;
  let totalInterest = 0;
  
  monthlyData.push({
    month: 0,
    balance: currentBalance,
    interestPaid: 0,
    principalPaid: 0
  });

  for (let month = 1; month <= n; month++) {
    const interest = currentBalance * r;
    const principalPaid = monthlyPayment - interest;
    currentBalance -= principalPaid;
    totalInterest += interest;
    
    monthlyData.push({
      month,
      balance: Math.max(0, currentBalance),
      interestPaid: interest,
      principalPaid: principalPaid
    });
  }

  return {
    monthsToPayoff: n,
    totalInterestPaid: totalInterest,
    totalCost: principal + totalInterest,
    monthlyData,
    monthlyPayment,
    initialBalance: principal
  };
};

const calculateSplitTransfer = (params: BalanceTransferParams): SimulationResult => {
  const {
    totalDebt,
    currentApr,
    transferAmount,
    transferFeePercent,
    introDurationMonths,
    introApr,
    postIntroApr,
    monthlyPayment,
  } = params;

  // 1. Determine split
  const amountToTransfer = Math.min(totalDebt, transferAmount);
  const amountRemaining = Math.max(0, totalDebt - amountToTransfer);

  // Initial Balances
  let transferBalance = amountToTransfer * (1 + transferFeePercent / 100);
  let remainingBalance = amountRemaining;
  const initialTotalBalance = transferBalance + remainingBalance;
  
  let totalInterestPaid = 0;
  let month = 0;
  const monthlyData = [];

  monthlyData.push({
    month: 0,
    balance: initialTotalBalance,
    interestPaid: 0,
    principalPaid: 0,
    isIntroPeriod: true
  });

  // Simulation Loop
  while ((transferBalance > 0.01 || remainingBalance > 0.01) && month < 600) {
    month++;
    const isIntro = month <= introDurationMonths;
    
    // --- Interest Accrual ---
    
    // Transfer Portion
    const transferRate = (isIntro ? introApr : postIntroApr) / 100 / 12;
    const transferInterest = transferBalance * transferRate;
    transferBalance += transferInterest;
    
    // Remaining Portion (High Interest)
    const remainingRate = currentApr / 100 / 12;
    const remainingInterest = remainingBalance * remainingRate;
    remainingBalance += remainingInterest;
    
    const totalInterestThisMonth = transferInterest + remainingInterest;
    totalInterestPaid += totalInterestThisMonth;

    // --- Payment Allocation ---
    let moneyAvailable = monthlyPayment;
    
    // Priority: Highest Rate First
    const rateTransfer = isIntro ? introApr : postIntroApr;
    const rateRemaining = currentApr;

    if (rateRemaining > rateTransfer) {
      // Pay Remaining first
      const payRem = Math.min(remainingBalance, moneyAvailable);
      remainingBalance -= payRem;
      moneyAvailable -= payRem;

      // Pay Transfer second
      const payTrans = Math.min(transferBalance, moneyAvailable);
      transferBalance -= payTrans;
      moneyAvailable -= payTrans;
    } else {
      // Pay Transfer first
      const payTrans = Math.min(transferBalance, moneyAvailable);
      transferBalance -= payTrans;
      moneyAvailable -= payTrans;

      const payRem = Math.min(remainingBalance, moneyAvailable);
      remainingBalance -= payRem;
      moneyAvailable -= payRem;
    }

    const currentTotal = transferBalance + remainingBalance;
    const previousTotal = monthlyData[monthlyData.length - 1].balance;
    // Principal paid is roughly Previous - Current + Interest (Wait, Balance = Prev - Principal + Interest)
    // So Principal = Prev + Interest - Balance? No.
    // Balance = Prev + Interest - Payment.
    // Payment = Prev + Interest - Balance.
    // Principal = Payment - Interest.
    
    // Let's just calculate actual principal reduction
    // PrincipalPaid = TotalPayment - TotalInterest
    // But TotalPayment isn't always monthlyPayment (if balance is low)
    // Actual Payment = (Prev + Interest) - Current
    const actualPayment = (monthlyData[monthlyData.length - 1].balance + totalInterestThisMonth) - currentTotal;
    const principalPaid = actualPayment - totalInterestThisMonth;

    monthlyData.push({
      month,
      balance: Math.max(0, currentTotal),
      interestPaid: totalInterestThisMonth,
      principalPaid: Math.max(0, principalPaid),
      isIntroPeriod: isIntro
    });
  }

  return {
    monthsToPayoff: month,
    totalInterestPaid,
    totalCost: initialTotalBalance + totalInterestPaid, // Approximation
    monthlyData,
    isPaidInIntro: month <= introDurationMonths && remainingBalance <= 0.01 && transferBalance <= 0.01,
    initialBalance: initialTotalBalance
  };
};

export const calculateRequiredPaymentForTransfer = (params: BalanceTransferParams): number => {
  // Simple approximation for the "Golden Payment"
  // We want to pay off (Transfer + Fee) AND (Remaining) in IntroMonths.
  // Remaining accrues interest at CurrentApr.
  // Transfer accrues interest at IntroApr (usually 0).
  
  const transferPrincipal = Math.min(params.totalDebt, params.transferAmount) * (1 + params.transferFeePercent/100);
  const remainingPrincipal = Math.max(0, params.totalDebt - params.transferAmount);
  
  // Payment for Transfer part (simple division if 0%)
  let paymentTransfer = 0;
  if (params.introApr === 0) {
    paymentTransfer = transferPrincipal / params.introDurationMonths;
  } else {
    const r = params.introApr / 100 / 12;
    const n = params.introDurationMonths;
    paymentTransfer = transferPrincipal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }
  
  // Payment for Remaining part (PMT formula with high interest)
  let paymentRemaining = 0;
  if (remainingPrincipal > 0) {
    const r = params.currentApr / 100 / 12;
    const n = params.introDurationMonths;
    paymentRemaining = remainingPrincipal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }
  
  return paymentTransfer + paymentRemaining;
};
