import React from 'react';
import { MLConfig } from '../types';
import { Sliders, RefreshCw, RotateCcw } from 'lucide-react';
import { DEFAULT_ML_CONFIG } from '../services/mlEngine';

interface MLControlPanelProps {
  config: MLConfig;
  onChangeConfig: (newConfig: MLConfig) => void;
  onRunClustering: () => void;
  inertia: number;
  silhouetteScore: number;
  iterationsRun: number;
  isCalculating: boolean;
}

export const MLControlPanel: React.FC<MLControlPanelProps> = ({
  config,
  onChangeConfig,
  onRunClustering,
  inertia,
  silhouetteScore,
  iterationsRun,
  isCalculating
}) => {
  const handleWeightChange = (key: keyof MLConfig['weights'], value: number) => {
    onChangeConfig({
      ...config,
      weights: {
        ...config.weights,
        [key]: value
      }
    });
  };

  const handleKChange = (k: number) => {
    onChangeConfig({
      ...config,
      k
    });
  };

  const handleReset = () => {
    onChangeConfig({ ...DEFAULT_ML_CONFIG });
  };

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Parámetros del Algoritmo K-Means
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          title="Restablecer valores por defecto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restablecer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* K Clusters selection */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Número de Clústeres (K = {config.k})
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[3, 4, 5, 6].map(val => (
              <button
                key={val}
                onClick={() => handleKChange(val)}
                className={`py-1.5 text-xs font-semibold rounded font-mono transition-colors ${
                  config.k === val
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                K = {val}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Segmentos conductuales a particionar.
          </p>
        </div>

        {/* Weights Sliders Column 1 */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>Peso: Lecciones</span>
              <span className="font-mono text-white">{config.weights.lessons.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.weights.lessons}
              onChange={e => handleWeightChange('lessons', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>Peso: Dificultad</span>
              <span className="font-mono text-white">{config.weights.difficulty.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.weights.difficulty}
              onChange={e => handleWeightChange('difficulty', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Weights Sliders Column 2 */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>Peso: Puntos Logros</span>
              <span className="font-mono text-white">{config.weights.points.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.weights.points}
              onChange={e => handleWeightChange('points', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>Peso: Inactividad</span>
              <span className="font-mono text-white">{config.weights.recency.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.weights.recency}
              onChange={e => handleWeightChange('recency', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Real-time ML Evaluation metrics & Action */}
        <div className="flex flex-col justify-between p-2.5 rounded bg-slate-950 border border-slate-800/80">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Silhouette</span>
              <span className="font-mono tabular-nums font-bold text-emerald-400 text-sm">
                {silhouetteScore > 0 ? `+${silhouetteScore.toFixed(3)}` : silhouetteScore.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Inercia WCSS</span>
              <span className="font-mono tabular-nums font-bold text-slate-200 text-sm">
                {inertia}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Convergencia</span>
              <span className="font-mono tabular-nums text-slate-300">
                {iterationsRun} iteraciones
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Normalización</span>
              <span className="font-mono text-indigo-300">Z-Score 6D</span>
            </div>
          </div>

          <button
            onClick={onRunClustering}
            disabled={isCalculating}
            className="mt-2 w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Calculando...' : 'Re-ejecutar Clustering'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
