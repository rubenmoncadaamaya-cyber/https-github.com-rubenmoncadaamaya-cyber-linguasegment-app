import React, { useState } from 'react';
import { MarketingCluster } from '../types';

interface MarketingDistributionDonutProps {
  clusters: MarketingCluster[];
  totalLeads: number;
  totalPipelineLTV: number;
  onSelectCluster?: (clusterCode: string) => void;
  activeClusterCode?: string | null;
}

export const MarketingDistributionDonut: React.FC<MarketingDistributionDonutProps> = ({
  clusters,
  totalLeads,
  totalPipelineLTV,
  onSelectCluster,
  activeClusterCode
}) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const center = 90;

  let accumulatedPercent = 0;

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Distribución de Cuota de Mercado
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Proporción de prospectos según perfil psicográfico y comercial.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-3">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
            {clusters.map(c => {
              const strokeDasharray = `${(c.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += c.percentage;
              const isHovered = hoveredCode === c.code;
              const isActive = activeClusterCode === c.code;

              return (
                <circle
                  key={`mkt-donut-${c.id}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={c.color}
                  strokeWidth={isHovered || isActive ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredCode(c.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  onClick={() => onSelectCluster?.(c.code)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              ${(totalPipelineLTV / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Pipeline LTV</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-1.5">
          {clusters.map(c => {
            const isHovered = hoveredCode === c.code;
            const isActive = activeClusterCode === c.code;

            return (
              <div
                key={`legend-${c.id}`}
                onMouseEnter={() => setHoveredCode(c.code)}
                onMouseLeave={() => setHoveredCode(null)}
                onClick={() => onSelectCluster?.(c.code)}
                className={`p-1.5 rounded cursor-pointer transition-colors flex items-center justify-between text-xs ${
                  isHovered || isActive ? 'bg-slate-800' : 'hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-slate-200 truncate font-medium text-[11px]">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-slate-400">{c.size}</span>
                  <span className="font-bold text-white">{c.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between font-mono">
        <span>Base Total: {totalLeads} prospectos</span>
        <span className="text-indigo-400">K = {clusters.length} Personas</span>
      </div>
    </div>
  );
};
