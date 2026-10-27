import React from 'react';
import { MLCluster } from '../types';

interface ClusterComparisonBarProps {
  clusters: MLCluster[];
  selectedMetric: 'lessons' | 'difficulty' | 'points' | 'recency';
  onChangeMetric: (metric: 'lessons' | 'difficulty' | 'points' | 'recency') => void;
}

export const ClusterComparisonBar: React.FC<ClusterComparisonBarProps> = ({
  clusters,
  selectedMetric,
  onChangeMetric
}) => {
  const getMetricValue = (c: MLCluster) => {
    switch (selectedMetric) {
      case 'lessons':
        return { val: c.avgLessons, label: `${c.avgLessons} lecc.`, max: 7 };
      case 'difficulty':
        return { val: c.avgDifficulty, label: `${c.avgDifficulty}/3.0`, max: 3.0 };
      case 'points':
        return { val: c.avgPoints, label: `${c.avgPoints} pts`, max: 150 };
      case 'recency':
        return { val: c.avgRecencyDays, label: `${c.avgRecencyDays} días`, max: 160 };
    }
  };

  const metricTitles = {
    lessons: 'Lecciones Completadas (Promedio)',
    difficulty: 'Índice de Dificultad (1=Fácil, 3=Difícil)',
    points: 'Puntos de Logros Promedio',
    recency: 'Días de Inactividad (Recency)'
  };

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Comparativa de Desempeño Inter-Clúster
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {metricTitles[selectedMetric]}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => onChangeMetric('lessons')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              selectedMetric === 'lessons' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lecciones
          </button>
          <button
            onClick={() => onChangeMetric('difficulty')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              selectedMetric === 'difficulty' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dificultad
          </button>
          <button
            onClick={() => onChangeMetric('points')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              selectedMetric === 'points' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Puntos
          </button>
          <button
            onClick={() => onChangeMetric('recency')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              selectedMetric === 'recency' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inactividad
          </button>
        </div>
      </div>

      <div className="space-y-3.5 my-2">
        {clusters.map(c => {
          const { val, label, max } = getMetricValue(c);
          const percent = Math.min(100, Math.max(5, (val / max) * 100));

          return (
            <div key={`comp-${c.id}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold text-slate-200">{c.name}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-300 font-medium">{label}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: c.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>Fuente: Agregación de 800 lecciones y 400 logros de estudiantes.</span>
        <span className="font-mono tabular-nums">Normalización Z-Score</span>
      </div>
    </div>
  );
};
