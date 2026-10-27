import React, { useState } from 'react';
import { MarketingProfile, MarketingCluster } from '../types';

interface MarketingOpportunityPlotProps {
  profiles: MarketingProfile[];
  clusters: MarketingCluster[];
  selectedLead: MarketingProfile | null;
  onSelectLead: (lead: MarketingProfile) => void;
  activeClusterFilter: string | null;
  onSelectClusterFilter: (code: string | null) => void;
}

export const MarketingOpportunityPlot: React.FC<MarketingOpportunityPlotProps> = ({
  profiles,
  clusters,
  selectedLead,
  onSelectLead,
  activeClusterFilter,
  onSelectClusterFilter
}) => {
  const [hoveredLead, setHoveredLead] = useState<MarketingProfile | null>(null);

  // SVG coordinate dimensions
  const width = 680;
  const height = 420;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 45;
  const paddingBottom = 55;

  // Domain ranges
  // X: Conversion Probability 0% to 55%
  const minX = 0;
  const maxX = 50;

  // Y: Expected LTV $100 to $800
  const minY = 100;
  const maxY = 800;

  const mapX = (prob: number) => {
    const clamped = Math.max(minX, Math.min(maxX, prob));
    return paddingLeft + ((clamped - minX) / (maxX - minX)) * (width - paddingLeft - paddingRight);
  };

  const mapY = (ltv: number) => {
    const clamped = Math.max(minY, Math.min(maxY, ltv));
    return height - paddingBottom - ((clamped - minY) / (maxY - minY)) * (height - paddingTop - paddingBottom);
  };

  // Quadrant dividing lines
  const splitProb = 25; // 25%
  const splitLtv = 400; // $400 USD
  const splitX = mapX(splitProb);
  const splitY = mapY(splitLtv);

  // Visible profiles based on filter
  const visibleProfiles = activeClusterFilter
    ? profiles.filter(p => p.marketingClusterCode === activeClusterFilter)
    : profiles;

  // Cluster centroids
  const centroids = clusters.map(c => {
    return {
      cluster: c,
      cx: mapX(c.avgConversionRate),
      cy: mapY(c.avgExpectedLTV)
    };
  });

  return (
    <div className="relative w-full rounded-lg bg-slate-900 border border-slate-800 p-4">
      {/* Top Bar with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Matriz de Oportunidad Comercial (Probabilidad vs. LTV Esperado)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribución analítica de los {profiles.length} prospectos según potencial de monetización e intención de compra.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectClusterFilter(null)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              activeClusterFilter === null
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todos ({profiles.length})
          </button>
          {clusters.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectClusterFilter(activeClusterFilter === c.code ? null : c.code)}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeClusterFilter === c.code
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="truncate max-w-[90px]">{c.name.split(' ')[0]}</span>
              <span className="font-mono text-[10px] opacity-75">({c.size})</span>
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden w-full aspect-[16/10] max-h-[440px] select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <pattern id="mkt-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={width - paddingLeft - paddingRight}
            height={height - paddingTop - paddingBottom}
            fill="url(#mkt-grid)"
          />

          {/* Quadrant Tint Overlays */}
          {/* Top-Right Quadrant: High Value & High Conversion */}
          <rect
            x={splitX}
            y={paddingTop}
            width={width - paddingRight - splitX}
            height={splitY - paddingTop}
            fill="#6366F1"
            fillOpacity="0.04"
          />
          {/* Top-Left Quadrant: High LTV / Nurturing Required */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={splitX - paddingLeft}
            height={splitY - paddingTop}
            fill="#0EA5E9"
            fillOpacity="0.03"
          />

          {/* Quadrant Reference Dashed Lines */}
          <line
            x1={splitX}
            y1={paddingTop}
            x2={splitX}
            y2={height - paddingBottom}
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={splitY}
            x2={width - paddingRight}
            y2={splitY}
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* Quadrant Labels */}
          <text
            x={width - paddingRight - 8}
            y={paddingTop + 16}
            textAnchor="end"
            className="fill-indigo-400 font-mono text-[10px] font-bold tracking-wider uppercase opacity-80"
          >
            Q1: Alta Prioridad VIP & Corp (ROI Máximo)
          </text>
          <text
            x={width - paddingRight - 8}
            y={height - paddingBottom - 10}
            textAnchor="end"
            className="fill-emerald-400 font-mono text-[10px] font-bold tracking-wider uppercase opacity-80"
          >
            Q2: Quick Wins & Alto Volumen
          </text>
          <text
            x={paddingLeft + 10}
            y={paddingTop + 16}
            textAnchor="start"
            className="fill-sky-400 font-mono text-[10px] font-bold tracking-wider uppercase opacity-80"
          >
            Q3: Cuentas Estratégicas a Nutrir
          </text>
          <text
            x={paddingLeft + 10}
            y={height - paddingBottom - 10}
            textAnchor="start"
            className="fill-slate-500 font-mono text-[10px] font-bold tracking-wider uppercase opacity-80"
          >
            Q4: Nurturing Digital Freemium
          </text>

          {/* X and Y Axis border lines */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Y-Axis Tick marks and Labels ($100 to $800) */}
          {[100, 200, 300, 400, 500, 600, 700, 800].map(val => {
            const yPos = mapY(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={paddingLeft - 4}
                  y1={yPos}
                  x2={paddingLeft}
                  y2={yPos}
                  stroke="#64748B"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px] tabular-nums"
                >
                  ${val}
                </text>
              </g>
            );
          })}

          {/* X-Axis Tick marks and Labels (0% to 50%) */}
          {[0, 10, 20, 30, 40, 50].map(val => {
            const xPos = mapX(val);
            return (
              <g key={`x-${val}`}>
                <line
                  x1={xPos}
                  y1={height - paddingBottom}
                  x2={xPos}
                  y2={height - paddingBottom + 4}
                  stroke="#64748B"
                  strokeWidth="1"
                />
                <text
                  x={xPos}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[10px] tabular-nums"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Axis Titles */}
          <text
            x={(paddingLeft + width - paddingRight) / 2}
            y={height - 12}
            textAnchor="middle"
            className="fill-slate-300 text-xs font-semibold"
          >
            Probabilidad de Conversión Estimada (%) →
          </text>
          <text
            x={16}
            y={(paddingTop + height - paddingBottom) / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${(paddingTop + height - paddingBottom) / 2})`}
            className="fill-slate-300 text-xs font-semibold"
          >
            LTV Esperado ($ USD) →
          </text>

          {/* Cluster Centroids */}
          {centroids.map(({ cluster, cx, cy }) => (
            <g key={`centroid-${cluster.id}`} className="pointer-events-none">
              <circle
                cx={cx}
                cy={cy}
                r="18"
                fill={cluster.color}
                fillOpacity="0.15"
                stroke={cluster.color}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={cx}
                cy={cy}
                r="4.5"
                fill={cluster.color}
                stroke="#0F172A"
                strokeWidth="2"
              />
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                className="fill-white font-mono text-[9px] font-bold drop-shadow"
              >
                {cluster.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* Data Points */}
          {visibleProfiles.map(lead => {
            const cx = mapX(lead.conversionProbability);
            // Add subtle pseudorandom jitter based on id to prevent overlapping on discrete bins
            const jitterY = ((lead.studentId * 17) % 25) - 12;
            const cy = mapY(lead.expectedLTV) + jitterY;
            const isHovered = hoveredLead?.studentId === lead.studentId;
            const isSelected = selectedLead?.studentId === lead.studentId;

            return (
              <circle
                key={`point-${lead.studentId}`}
                cx={cx}
                cy={cy}
                r={isSelected ? 6.5 : isHovered ? 5.5 : 3.8}
                fill={lead.marketingClusterColor}
                fillOpacity={isHovered || isSelected ? 1 : 0.8}
                stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                strokeWidth={isSelected ? 2 : 1}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredLead(lead)}
                onMouseLeave={() => setHoveredLead(null)}
                onClick={() => onSelectLead(lead)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredLead && (
          <div
            className="absolute z-30 pointer-events-none rounded-lg bg-slate-950/95 border border-slate-700 p-2.5 shadow-xl text-xs space-y-1 backdrop-blur-md font-mono"
            style={{
              left: Math.min(width - 240, Math.max(10, mapX(hoveredLead.conversionProbability) - 60)),
              top: Math.max(10, mapY(hoveredLead.expectedLTV) - 110)
            }}
          >
            <div className="font-sans font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredLead.marketingClusterColor }} />
              <span>{hoveredLead.fullName}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {hoveredLead.marketingClusterName}
            </div>
            <div className="flex items-center gap-3 text-[11px] pt-1 border-t border-slate-800">
              <span className="text-emerald-400 font-bold">Conv: {hoveredLead.conversionProbability}%</span>
              <span className="text-white font-bold">LTV: ${hoveredLead.expectedLTV}</span>
              <span className="text-indigo-300">{hoveredLead.cefrLevel}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans truncate max-w-[210px]">
              Oferta: {hoveredLead.suggestedOffer}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
        <span>Haz clic en cualquier punto para cargar el prospecto y redactar copy personalizado con IA.</span>
        <span className="font-mono">{visibleProfiles.length} leads visibles en proyección</span>
      </div>
    </div>
  );
};
