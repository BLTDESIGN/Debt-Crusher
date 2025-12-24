export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export type Strategy = 'snowball' | 'avalanche';

export interface PayoffResult {
  totalInterest: number;
  monthsToFree: number;
  chartData: { month: number; totalBalance: number; [key: string]: number }[];
  payoffOrder: { name: string; month: number }[];
}
