import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Percent } from 'lucide-react';
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Your Debts</h2>
        <button
          onClick={addDebt}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
        >
          <Plus size={18} /> Add Debt
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => (
          <div
            key={debt.id}
            className="relative p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <button
              onClick={() => removeDebt(debt.id)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Remove debt"
            >
              <Trash2 size={16} />
            </button>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Debt Name</label>
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                  placeholder="e.g. Visa"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Balance</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-2.5 top-3 text-gray-400" />
                    <NumberInput
                      value={debt.balance}
                      onChange={(val) => updateDebt(debt.id, 'balance', val)}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">APR (%)</label>
                  <div className="relative">
                    <Percent size={14} className="absolute right-2.5 top-3 text-gray-400" />
                    <NumberInput
                      value={debt.apr}
                      onChange={(val) => updateDebt(debt.id, 'apr', val)}
                      className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Min Payment</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-2.5 top-3 text-gray-400" />
                  <NumberInput
                    value={debt.minPayment}
                    onChange={(val) => updateDebt(debt.id, 'minPayment', val)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
