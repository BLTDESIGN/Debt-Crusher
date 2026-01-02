import React from 'react';
import { Strategy } from '../types';
import { clsx } from 'clsx';
import { AcUnitRounded, TrendingDownRounded } from '@mui/icons-material';

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
            ? 'bg-white border-emerald-500 text-emerald-700'
            : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'
        )}
      >
        <div className={clsx("p-2 rounded-full", strategy === 'snowball' ? "bg-emerald-100" : "bg-gray-200")}>
          <AcUnitRounded sx={{ fontSize: 24 }} />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">Lowest Balance First</div>
          <div className="text-xs opacity-80">Builds momentum quickly</div>
        </div>
      </button>

      <button
        onClick={() => onChange('avalanche')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 border-2',
          strategy === 'avalanche'
            ? 'bg-white border-emerald-500 text-emerald-700'
            : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'
        )}
      >
        <div className={clsx("p-2 rounded-full", strategy === 'avalanche' ? "bg-emerald-100" : "bg-gray-200")}>
          <TrendingDownRounded sx={{ fontSize: 24 }} />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">Highest Interest First</div>
          <div className="text-xs opacity-80">Saves the most money</div>
        </div>
      </button>
    </div>
  );
};
