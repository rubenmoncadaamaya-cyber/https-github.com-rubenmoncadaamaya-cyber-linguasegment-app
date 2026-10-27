import React, { useState } from 'react';
import { MLCluster } from '../types';

interface ClusterDistributionDonutProps {
  clusters: MLCluster[];
  totalStudents: number;
  onSelectCluster?: (clusterId: number) => void;
}

export const ClusterDistributionDonut: React.FC<ClusterDistributionDonutProps> = ({
  clusters,
  totalStudents,
  onSelectCluster
}) => {
  const [hoveredClusterId, setHoveredClusterId] = useState<number | null>(null);

  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const center = 90;

  let accumulatedPercent = 0;

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Proporción de Segmentos
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Distribución porcentual de los alumnos según perfil conductual.
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
              const isHovered = hoveredClusterId === c.id;

              return (
                <circle
                  key={`donut-slice-${c.id}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={c.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredClusterId(c.id)}
                  onMouseLeave={() => setHoveredClusterId(null)}
                  onClick={() => onSelectCluster?.(c.id)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              {totalStudents}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Alumnos</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {clusters.map(c => {
            const isHovered = hoveredClusterId === c.id;
            return (
              <div
                key={`legend-${c.id}`}
                className={`p-1.5 rounded transition-colors flex items-center justify-between text-xs cursor-pointer ${
                  isHovered ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                }`}
                onMouseEnter={() => setHoveredClusterId(c.id)}
                onMouseLeave={() => setHoveredClusterId(null)}
                onClick={() => onSelectCluster?.(c.id)}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="font-medium text-slate-200 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 text-right shrink-0 font-mono tabular-nums text-slate-400">
                  <span className="text-white font-semibold">{c.size}</span>
                  <span className="text-slate-500 w-12 text-right">({c.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
        Segmentación calculada automáticamente sobre 6 dimensiones normalizadas.
      </div>
    </div>
  );
};
