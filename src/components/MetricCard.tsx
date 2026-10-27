import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  secondaryValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  trendType = 'neutral',
  secondaryValue
}) => {
  return (
    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
        <span>{label}</span>
        {secondaryValue && <span className="font-mono tabular-nums text-slate-500">{secondaryValue}</span>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-medium font-mono tabular-nums ${
            trendType === 'positive' 
              ? 'text-emerald-400' 
              : trendType === 'negative' 
                ? 'text-rose-400' 
                : 'text-slate-400'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 text-xs text-slate-500 line-clamp-1">
          {subtext}
        </div>
      )}
    </div>
  );
};
