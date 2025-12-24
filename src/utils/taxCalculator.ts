export interface TaxParams {
  annualSalary: number;
  filingStatus: 'single' | 'married';
  contribution401kPercent: number;
  state: 'OR' | 'Other';
  customStateTaxRate?: number;
  isPortlandMetro?: boolean;
  isMultnomahCounty?: boolean;
}

export interface TaxResult {
  grossMonthly: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  ficaTax: number;
  contribution401k: number;
  netMonthly: number;
  effectiveTaxRate: number;
}

// 2025 Projected Tax Brackets (Simplified for estimation)
const BRACKETS_SINGLE = [
  { limit: 11925, rate: 0.10 },
  { limit: 48475, rate: 0.12 },
  { limit: 103350, rate: 0.22 },
  { limit: 197300, rate: 0.24 },
  { limit: 250525, rate: 0.32 },
  { limit: 626350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

const BRACKETS_MARRIED = [
  { limit: 23850, rate: 0.10 },
  { limit: 96950, rate: 0.12 },
  { limit: 206700, rate: 0.22 },
  { limit: 394600, rate: 0.24 },
  { limit: 501050, rate: 0.32 },
  { limit: 751600, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION_SINGLE = 15000; // Approx 2025
const STANDARD_DEDUCTION_MARRIED = 30000; // Approx 2025

const SS_WAGE_BASE = 176100; // 2025 estimate
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDL_MEDICARE_THRESHOLD = 200000;
const ADDL_MEDICARE_RATE = 0.009;

// Oregon Specifics
const OR_STD_DEDUCTION_SINGLE = 2745;
const OR_STD_DEDUCTION_MARRIED = 5495;
const OR_FED_TAX_SUBTRACTION_CAP = 7800;

const OR_BRACKETS_SINGLE = [
  { limit: 4050, rate: 0.0475 },
  { limit: 10200, rate: 0.0675 },
  { limit: 125000, rate: 0.0875 },
  { limit: Infinity, rate: 0.099 },
];

const OR_BRACKETS_MARRIED = [
  { limit: 8100, rate: 0.0475 },
  { limit: 20400, rate: 0.0675 },
  { limit: 250000, rate: 0.0875 },
  { limit: Infinity, rate: 0.099 },
];

export const calculateTakeHomePay = (params: TaxParams): TaxResult => {
  const { annualSalary, filingStatus, contribution401kPercent, state, customStateTaxRate, isPortlandMetro, isMultnomahCounty } = params;
  
  const grossMonthly = annualSalary / 12;
  
  // 401k (Pre-tax)
  const contribution401kAnnual = annualSalary * (contribution401kPercent / 100);
  const actual401k = Math.min(contribution401kAnnual, 23500);
  
  // --- Federal Tax Calculation ---
  const federalTaxableIncome = Math.max(0, annualSalary - actual401k - (filingStatus === 'single' ? STANDARD_DEDUCTION_SINGLE : STANDARD_DEDUCTION_MARRIED));
  
  let federalTaxAnnual = 0;
  let previousLimit = 0;
  const federalBrackets = filingStatus === 'single' ? BRACKETS_SINGLE : BRACKETS_MARRIED;
  
  for (const bracket of federalBrackets) {
    if (federalTaxableIncome > previousLimit) {
      const taxableInBracket = Math.min(federalTaxableIncome, bracket.limit) - previousLimit;
      federalTaxAnnual += taxableInBracket * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  // --- FICA ---
  const ssTax = Math.min(annualSalary, SS_WAGE_BASE) * SS_RATE;
  let medicareTax = annualSalary * MEDICARE_RATE;
  if (annualSalary > ADDL_MEDICARE_THRESHOLD) {
    medicareTax += (annualSalary - ADDL_MEDICARE_THRESHOLD) * ADDL_MEDICARE_RATE;
  }
  const ficaTaxAnnual = ssTax + medicareTax;

  // --- State Tax ---
  let stateTaxAnnual = 0;

  if (state === 'OR') {
    // Oregon allows subtraction of federal tax liability, up to a cap
    const federalSubtraction = Math.min(federalTaxAnnual, OR_FED_TAX_SUBTRACTION_CAP);
    
    // Oregon Taxable Income = AGI (Salary - 401k) - Federal Subtraction - Standard Deduction
    // Note: This is simplified. Oregon additions/subtractions vary.
    const orTaxableIncome = Math.max(0, annualSalary - actual401k - federalSubtraction - (filingStatus === 'single' ? OR_STD_DEDUCTION_SINGLE : OR_STD_DEDUCTION_MARRIED));
    
    const orBrackets = filingStatus === 'single' ? OR_BRACKETS_SINGLE : OR_BRACKETS_MARRIED;
    let orPrevLimit = 0;
    
    for (const bracket of orBrackets) {
      if (orTaxableIncome > orPrevLimit) {
        const taxableInBracket = Math.min(orTaxableIncome, bracket.limit) - orPrevLimit;
        stateTaxAnnual += taxableInBracket * bracket.rate;
        orPrevLimit = bracket.limit;
      } else {
        break;
      }
    }
  } else {
    // Custom flat rate
    stateTaxAnnual = (annualSalary - actual401k) * ((customStateTaxRate || 0) / 100);
  }

  // --- Local Taxes (Portland/Multnomah) ---
  let localTaxAnnual = 0;
  if (state === 'OR') {
    // Metro Supportive Housing Services (SHS) Tax
    // 1% on taxable income above $125k (Single) / $200k (Married)
    if (isPortlandMetro) {
      const threshold = filingStatus === 'single' ? 125000 : 200000;
      // Taxable income for Metro is roughly Oregon taxable income without federal subtraction
      // Simplified: Use AGI - Std Deduction
      const metroTaxable = Math.max(0, annualSalary - actual401k - (filingStatus === 'single' ? OR_STD_DEDUCTION_SINGLE : OR_STD_DEDUCTION_MARRIED));
      if (metroTaxable > threshold) {
        localTaxAnnual += (metroTaxable - threshold) * 0.01;
      }
    }

    // Multnomah County Preschool for All (PFA) Tax
    // 1.5% on taxable income above $125k (Single) / $200k (Married)
    // +1.5% (total 3%) on income above $250k (Single) / $400k (Married)
    if (isMultnomahCounty) {
      const threshold1 = filingStatus === 'single' ? 125000 : 200000;
      const threshold2 = filingStatus === 'single' ? 250000 : 400000;
      
      const pfaTaxable = Math.max(0, annualSalary - actual401k - (filingStatus === 'single' ? OR_STD_DEDUCTION_SINGLE : OR_STD_DEDUCTION_MARRIED));
      
      if (pfaTaxable > threshold1) {
        localTaxAnnual += (pfaTaxable - threshold1) * 0.015;
      }
      if (pfaTaxable > threshold2) {
        localTaxAnnual += (pfaTaxable - threshold2) * 0.015; // Additional 1.5%
      }
    }
  }

  const totalTaxAnnual = federalTaxAnnual + ficaTaxAnnual + stateTaxAnnual + localTaxAnnual;
  const netAnnual = annualSalary - actual401k - totalTaxAnnual;

  return {
    grossMonthly,
    federalTax: federalTaxAnnual / 12,
    stateTax: stateTaxAnnual / 12,
    localTax: localTaxAnnual / 12,
    ficaTax: ficaTaxAnnual / 12,
    contribution401k: actual401k / 12,
    netMonthly: netAnnual / 12,
    effectiveTaxRate: (totalTaxAnnual / annualSalary) * 100
  };
};

