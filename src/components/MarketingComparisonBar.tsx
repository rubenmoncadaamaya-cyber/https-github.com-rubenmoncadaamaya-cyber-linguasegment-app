import React from 'react';
import { MarketingCluster } from '../types';

interface MarketingComparisonBarProps {
  clusters: MarketingCluster[];
  selectedMetric: 'ltv' | 'conversion' | 'lessons' | 'difficulty' | 'recency';
  onChangeMetric: (metric: 'ltv' | 'conversion' | 'lessons' | 'difficulty' | 'recency') => void;
}

export const MarketingComparisonBar: React.FC<MarketingComparisonBarProps> = ({
  clusters,
  selectedMetric,
  onChangeMetric
}) => {
  const getMetricValue = (c: MarketingCluster) => {
    switch (selectedMetric) {
      case 'ltv':
        return c.avgExpectedLTV;
      case 'conversion':
        return c.avgConversionRate;
      case 'lessons':
        return c.avgLessons;
      case 'difficulty':
        return c.avgDifficulty;
      case 'recency':
        return c.avgRecencyDays;
    }
  };

  const getMetricUnit = () => {
    switch (selectedMetric) {
      case 'ltv':
        return '$';
      case 'conversion':
        return '%';
      case 'lessons':
        return ' lecc';
      case 'difficulty':
        return ' / 3.0';
      case 'recency':
        return ' días';
    }
  };

  const getMetricMax = () => {
    switch (selectedMetric) {
      case 'ltv':
        return 800;
      case 'conversion':
        return 50;
      case 'lessons':
        return 10;
      case 'difficulty':
        return 3.0;
      case 'recency':
        return 80;
    }
  };

  const maxValue = getMetricMax();

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-4">
      {/* Header and Metric Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Comparativa Inter-Segmentos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analiza el rendimiento comercial y pedagógico cruzado entre las 6 audiencias.
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => onChangeMetric('ltv')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedMetric === 'ltv'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            LTV Medio
          </button>
          <button
            onClick={() => onChangeMetric('conversion')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedMetric === 'conversion'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Conversión %
          </button>
          <button
            onClick={() => onChangeMetric('difficulty')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedMetric === 'difficulty'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Dificultad ML
          </button>
          <button
            onClick={() => onChangeMetric('lessons')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedMetric === 'lessons'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Lecciones ML
          </button>
          <button
            onClick={() => onChangeMetric('recency')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedMetric === 'recency'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Inactividad
          </button>
        </div>
      </div>

      {/* Horizontal Bar Visualizations */}
      <div className="space-y-3 font-mono">
        {clusters.map(cluster => {
          const val = getMetricValue(cluster);
          const barWidthPercent = Math.min(100, Math.max(8, (Number(val) / maxValue) * 100));

          return (
            <div key={`comp-bar-${cluster.id}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-sans truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cluster.color }}
                  />
                  <span className="font-medium text-slate-200 text-xs truncate max-w-[200px]">
                    {cluster.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({cluster.dominantMlCluster} · {cluster.dominantCefr})
                  </span>
                </div>

                <div className="text-right">
                  <strong className="text-white text-xs font-bold tabular-nums">
                    {selectedMetric === 'ltv' && '$'}
                    {val}
                    {getMetricUnit() !== '$' && getMetricUnit()}
                  </strong>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2.5 rounded bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${barWidthPercent}%`,
                    backgroundColor: cluster.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>Conexión directa entre esfuerzo pedagógico (ML) y valor comercial (LTV).</span>
        <span className="font-mono text-indigo-400">Benchmark Activo</span>
      </div>
    </div>
  );
};
