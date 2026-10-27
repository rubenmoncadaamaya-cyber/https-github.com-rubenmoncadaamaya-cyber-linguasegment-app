import React, { useState } from 'react';
import { StudentProfile, MLCluster } from '../types';

interface ClusterScatterPlotProps {
  students: StudentProfile[];
  clusters: MLCluster[];
  selectedStudent: StudentProfile | null;
  onSelectStudent: (student: StudentProfile) => void;
  activeClusterFilter: number | null;
  onSelectClusterFilter: (clusterId: number | null) => void;
}

export const ClusterScatterPlot: React.FC<ClusterScatterPlotProps> = ({
  students,
  clusters,
  selectedStudent,
  onSelectStudent,
  activeClusterFilter,
  onSelectClusterFilter
}) => {
  const [hoveredStudent, setHoveredStudent] = useState<StudentProfile | null>(null);

  // SVG dimensions
  const width = 640;
  const height = 400;
  const padding = 50;

  // Coordinate conversion (-80 to 80 domain mapped to padding to width-padding)
  const mapX = (x: number) => {
    const minVal = -85;
    const maxVal = 85;
    return padding + ((x - minVal) / (maxVal - minVal)) * (width - 2 * padding);
  };

  const mapY = (y: number) => {
    const minVal = -85;
    const maxVal = 85;
    // invert Y for SVG
    return height - padding - ((y - minVal) / (maxVal - minVal)) * (height - 2 * padding);
  };

  // Filter students if cluster filter is active
  const visibleStudents = activeClusterFilter === null 
    ? students 
    : students.filter(s => s.clusterId === activeClusterFilter);

  return (
    <div className="relative w-full rounded-lg bg-slate-900 border border-slate-800 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Espacio de Proyección Bidimensional (K-Means Clustering)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribución de los {students.length} estudiantes por volumen de estudio y reto cognitivo.
          </p>
        </div>

        {/* Cluster Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectClusterFilter(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activeClusterFilter === null
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todos ({students.length})
          </button>
          {clusters.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectClusterFilter(activeClusterFilter === c.id ? null : c.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeClusterFilter === c.id
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span>{c.name.split(' ')[0]}</span>
              <span className="font-mono text-[11px] opacity-75">({c.size})</span>
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden w-full aspect-[16/10] max-h-[440px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Axis lines */}
          <line
            x1={padding}
            y1={mapY(0)}
            x2={width - padding}
            y2={mapY(0)}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={mapX(0)}
            y1={padding}
            x2={mapX(0)}
            y2={height - padding}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Axis Labels */}
          <text
            x={width - padding}
            y={mapY(0) - 8}
            textAnchor="end"
            className="text-[10px] fill-slate-500 font-medium"
          >
            Mayor Volumen y Logros →
          </text>
          <text
            x={padding}
            y={mapY(0) - 8}
            textAnchor="start"
            className="text-[10px] fill-slate-500 font-medium"
          >
            ← Menor Actividad
          </text>

          <text
            x={mapX(0) + 8}
            y={padding + 10}
            textAnchor="start"
            className="text-[10px] fill-slate-500 font-medium"
          >
            ↑ Alta Dificultad / Frecuencia
          </text>
          <text
            x={mapX(0) + 8}
            y={height - padding - 8}
            textAnchor="start"
            className="text-[10px] fill-slate-500 font-medium"
          >
            ↓ Inactividad / Nivel Inicial
          </text>

          {/* Cluster Centroids */}
          {clusters.map(c => {
            const cx = mapX(c.pcaX);
            const cy = mapY(c.pcaY);
            return (
              <g key={`centroid-${c.id}`} className="transition-all duration-300">
                {/* Centroid halo */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="24"
                  fill={c.color}
                  fillOpacity="0.12"
                  stroke={c.color}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                {/* Centroid core icon */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill={c.color}
                  stroke="#0F172A"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-200 pointer-events-none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {c.name}
                </text>
              </g>
            );
          })}

          {/* Student Points */}
          {visibleStudents.map(student => {
            const cx = mapX(student.pcaX);
            const cy = mapY(student.pcaY);
            const isSelected = selectedStudent?.id === student.id;
            const isHovered = hoveredStudent?.id === student.id;

            return (
              <g key={`student-${student.id}`}>
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : isHovered ? 6 : 4}
                  fill={student.clusterColor}
                  fillOpacity={isHovered || isSelected ? 1 : 0.85}
                  stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                  strokeWidth={isHovered || isSelected ? 1.5 : 0.8}
                  className="cursor-pointer transition-all duration-150 hover:scale-125"
                  onMouseEnter={() => setHoveredStudent(student)}
                  onMouseLeave={() => setHoveredStudent(null)}
                  onClick={() => onSelectStudent(student)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredStudent && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 rounded bg-slate-950/95 border border-slate-700 text-xs shadow-xl backdrop-blur-md max-w-xs"
            style={{
              left: `${Math.min(width - 200, Math.max(10, mapX(hoveredStudent.pcaX) - 80))}px`,
              top: `${Math.max(10, mapY(hoveredStudent.pcaY) - 85)}px`
            }}
          >
            <div className="font-semibold text-white flex items-center justify-between gap-2">
              <span>{hoveredStudent.full_name}</span>
              <span className="font-mono text-[10px] px-1 py-0.2 bg-slate-800 rounded text-slate-300">
                {hoveredStudent.cefrLevel}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {hoveredStudent.email}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300 font-mono tabular-nums">
              <span>Lecciones: <strong>{hoveredStudent.totalLessons}</strong></span>
              <span>Puntos: <strong>{hoveredStudent.totalPoints}</strong></span>
              <span>Dificultad: <strong>{hoveredStudent.difficultyScore.toFixed(1)}/3</strong></span>
              <span>Inactividad: <strong>{hoveredStudent.recencyDays}d</strong></span>
            </div>
            <div className="mt-1 text-[10px] font-medium" style={{ color: hoveredStudent.clusterColor }}>
              ● {hoveredStudent.clusterName}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
        <span>Haz clic en cualquier punto para inspeccionar el perfil de aprendizaje del alumno.</span>
        <span className="font-mono tabular-nums">Muestra: {visibleStudents.length} / {students.length}</span>
      </div>
    </div>
  );
};
