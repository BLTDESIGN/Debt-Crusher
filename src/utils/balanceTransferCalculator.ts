export interface BalanceTransferParams {
  transferAmount: number;
  transferFeePercent: number;
  introDurationMonths: number;
  introApr: number;
  postIntroApr: number;
  monthlyPayment: number;
}

export interface BalanceTransferResult {
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalCost: number;
  initialBalance: number;
  monthlyData: {
    month: number;
    balance: number;
    interestPaid: number;
    principalPaid: number;
    isIntroPeriod: boolean;
  }[];
  isPaidInIntro: boolean;
}

export const calculateBalanceTransfer = (params: BalanceTransferParams): BalanceTransferResult => {
  const {
    transferAmount,
    transferFeePercent,
    introDurationMonths,
    introApr,
    postIntroApr,
    monthlyPayment,
  } = params;

  const initialBalance = transferAmount * (1 + transferFeePercent / 100);
  let currentBalance = initialBalance;
  let totalInterestPaid = 0;
  let month = 0;
  const monthlyData = [];

  // Add initial state
  monthlyData.push({
    month: 0,
    balance: currentBalance,
    interestPaid: 0,
    principalPaid: 0,
    isIntroPeriod: true
  });

  // Cap at 600 months (50 years) to prevent infinite loops
  while (currentBalance > 0.01 && month < 600) {
    month++;
    const isIntro = month <= introDurationMonths;
    const apr = isIntro ? introApr : postIntroApr;
    const monthlyRate = apr / 100 / 12;
    
    const interest = currentBalance * monthlyRate;
    totalInterestPaid += interest;
    currentBalance += interest;
    
    const payment = Math.min(currentBalance, monthlyPayment);
    const principal = payment - interest;
    
    currentBalance -= payment;

    monthlyData.push({
      month,
      balance: Math.max(0, currentBalance),
      interestPaid: interest,
      principalPaid: principal,
      isIntroPeriod: isIntro
    });
  }

  return {
    monthsToPayoff: month,
    totalInterestPaid,
    totalCost: initialBalance + totalInterestPaid, // Note: initialBalance includes the fee
    initialBalance,
    monthlyData,
    isPaidInIntro: month <= introDurationMonths
  };
};

export const calculateRequiredPaymentForIntro = (params: Omit<BalanceTransferParams, 'monthlyPayment'>): number => {
  // Simple amortization calculation isn't quite right because rate changes, 
  // but for 0% intro it's just Balance / Months.
  // If Intro APR > 0, it's PMT formula.
  
  const initialBalance = params.transferAmount * (1 + params.transferFeePercent / 100);
  
  if (params.introApr === 0) {
    return initialBalance / params.introDurationMonths;
  }
  
  const r = params.introApr / 100 / 12;
  const n = params.introDurationMonths;
  // PMT = P * r * (1+r)^n / ((1+r)^n - 1)
  return initialBalance * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
};
