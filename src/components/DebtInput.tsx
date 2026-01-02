import React, { useState, useEffect } from 'react';
import { DeleteRounded, AttachMoneyRounded, PercentRounded, CreditCardRounded } from '@mui/icons-material';
import { Debt } from '../types';
import { clsx } from 'clsx';

interface DebtInputProps {
  debts: Debt[];
  onChange: (debts: Debt[]) => void;
}

const NumberInput = ({ 
  value, 
  onChange, 
  className,
  ...props 
}: { 
  value: number; 
  onChange: (val: number) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    // Only update local state if the prop value is different from the parsed local state
    // This allows the user to type "10." without it being forced back to "10" immediately
    const parsedLocal = parseFloat(inputValue);
    // Handle edge case where value is 0 and input is empty or just "-"
    if (parsedLocal !== value) {
       // If the parent value changed (e.g. reset), sync up
       // But check if it's just a formatting difference (e.g. "10." vs 10)
       if (inputValue !== value.toString() && parseFloat(inputValue) !== value) {
          setInputValue(value.toString());
       }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (newValue === '') {
      onChange(0);
    }
  };

  return (
    <input
      type="number"
      step="any"
      value={inputValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
};

export const DebtInput: React.FC<DebtInputProps> = ({ debts, onChange }) => {
  const addDebt = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    onChange([
      ...debts,
      { id: newId, name: `Card ${debts.length + 1}`, balance: 5000, apr: 19.99, minPayment: 100 },
    ]);
  };

  const removeDebt = (id: string) => {
    onChange(debts.filter((d) => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    onChange(
      debts.map((d) => {
        if (d.id === id) {
          return { ...d, [field]: value };
        }
        return d;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1">
        {debts.map((debt) => (
          <div
            key={debt.id}
            className="relative p-4 bg-white rounded-xl border border-gray-200 group min-h-[188px] flex flex-col justify-center"
          >
            <button
              onClick={() => removeDebt(debt.id)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-all z-10"
              aria-label="Remove debt"
            >
              <DeleteRounded sx={{ fontSize: 16 }} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                <CreditCardRounded sx={{ fontSize: 24 }} />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="font-bold text-gray-800 text-lg truncate">{debt.name}</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 font-bold mb-1">Balance</label>
                  <div className="relative">
                    <AttachMoneyRounded sx={{ fontSize: 14 }} className="absolute left-2.5 top-3 text-gray-400" />
                    <NumberInput
                      value={debt.balance}
                      onChange={(val) => updateDebt(debt.id, 'balance', val)}
                      className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-bold mb-1">APR (%)</label>
                  <div className="relative">
                    <PercentRounded sx={{ fontSize: 14 }} className="absolute right-2.5 top-3 text-gray-400" />
                    <NumberInput
                      value={debt.apr}
                      onChange={(val) => updateDebt(debt.id, 'apr', val)}
                      className="w-full pl-3 pr-7 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
