import React from 'react';
import { Strategy } from '../types';
import { clsx } from 'clsx';
import { Snowflake, TrendingDown } from 'lucide-react';

interface StrategySelectorProps {
  strategy: Strategy;
  onChange: (s: Strategy) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({ strategy, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-1 bg-gray-100 rounded-xl">
      <button
        onClick={() => onChange('snowball')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 border-2',
          strategy === 'snowball'
            ? 'bg-white border-indigo-500 shadow-md text-indigo-700'
            : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'
        )}
      >
        <div className={clsx("p-2 rounded-full", strategy === 'snowball' ? "bg-indigo-100" : "bg-gray-200")}>
          <Snowflake size={24} />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">Snowball Method</div>
          <div className="text-xs opacity-80">Pay smallest balance first</div>
        </div>
      </button>

      <button
        onClick={() => onChange('avalanche')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 border-2',
          strategy === 'avalanche'
            ? 'bg-white border-emerald-500 shadow-md text-emerald-700'
            : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'
        )}
      >
        <div className={clsx("p-2 rounded-full", strategy === 'avalanche' ? "bg-emerald-100" : "bg-gray-200")}>
          <TrendingDown size={24} />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">Avalanche Method</div>
          <div className="text-xs opacity-80">Pay highest interest first</div>
        </div>
      </button>
    </div>
  );
};
