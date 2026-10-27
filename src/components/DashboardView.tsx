import React, { useState } from 'react';
import { StudentProfile, MLCluster, MLConfig, RealtimeEvent, LessonDifficulty } from '../types';
import { MetricCard } from './MetricCard';
import { ClusterScatterPlot } from './ClusterScatterPlot';
import { ClusterDistributionDonut } from './ClusterDistributionDonut';
import { ClusterComparisonBar } from './ClusterComparisonBar';
import { MLControlPanel } from './MLControlPanel';
import { RealtimeStreamTicker } from './RealtimeStreamTicker';

interface DashboardViewProps {
  students: StudentProfile[];
  clusters: MLCluster[];
  mlConfig: MLConfig;
  onChangeMLConfig: (config: MLConfig) => void;
  onRunClustering: () => void;
  inertia: number;
  silhouetteScore: number;
  iterationsRun: number;
  isCalculating: boolean;
  selectedStudent: StudentProfile | null;
  onSelectStudent: (student: StudentProfile | null) => void;
  events: RealtimeEvent[];
  liveSimulationActive: boolean;
  onToggleSimulation: () => void;
  onRecordManualLesson: (
    studentId: number,
    lessonName: string,
    difficulty: LessonDifficulty,
    duration: number,
    points: number
  ) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  clusters,
  mlConfig,
  onChangeMLConfig,
  onRunClustering,
  inertia,
  silhouetteScore,
  iterationsRun,
  isCalculating,
  selectedStudent,
  onSelectStudent,
  events,
  liveSimulationActive,
  onToggleSimulation,
  onRecordManualLesson
}) => {
  const [activeClusterFilter, setActiveClusterFilter] = useState<number | null>(null);
  const [comparisonMetric, setComparisonMetric] = useState<'lessons' | 'difficulty' | 'points' | 'recency'>('lessons');

  // Aggregated KPI numbers
  const totalStudents = students.length;
  const totalLessons = students.reduce((acc, s) => acc + s.totalLessons, 0);
  const totalHours = Math.round(students.reduce((acc, s) => acc + s.totalDurationMinutes, 0) / 60);
  const avgHardRatio = Math.round((students.reduce((acc, s) => acc + s.hardRatio, 0) / (totalStudents || 1)) * 100);
  const atRiskCount = students.filter(s => s.recencyDays > 60).length;

  return (
    <div className="space-y-5">
      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Estudiantes"
          value={totalStudents}
          subtext="Base activa procesada"
          secondaryValue="100% clasificados"
        />
        <MetricCard
          label="Segmentos ML"
          value={clusters.length}
          subtext={`K = ${mlConfig.k} clusters`}
          trend="K-Means++"
          trendType="neutral"
        />
        <MetricCard
          label="Lecciones"
          value={totalLessons}
          subtext={`${totalHours} horas acumuladas`}
          trend="+18 hoy"
          trendType="positive"
        />
        <MetricCard
          label="Desafío Alto"
          value={`${avgHardRatio}%`}
          subtext="Lecciones nivel difícil"
          trend="Creciente"
          trendType="positive"
        />
        <MetricCard
          label="Calidad Clustering"
          value={silhouetteScore > 0 ? `+${silhouetteScore.toFixed(3)}` : silhouetteScore.toFixed(3)}
          subtext="Coeficiente Silhouette"
          trend={silhouetteScore >= 0.35 ? 'Robusto' : 'Aceptable'}
          trendType={silhouetteScore >= 0.35 ? 'positive' : 'neutral'}
        />
        <MetricCard
          label="Alumnos en Riesgo"
          value={atRiskCount}
          subtext=">60 días inactivos"
          trend={`${Math.round((atRiskCount / totalStudents) * 100)}%`}
          trendType="negative"
        />
      </div>

      {/* Main Charts Row: Scatter Plot + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ClusterScatterPlot
            students={students}
            clusters={clusters}
            selectedStudent={selectedStudent}
            onSelectStudent={onSelectStudent}
            activeClusterFilter={activeClusterFilter}
            onSelectClusterFilter={setActiveClusterFilter}
          />
        </div>
        <div>
          <ClusterDistributionDonut
            clusters={clusters}
            totalStudents={totalStudents}
            onSelectCluster={(cId) => setActiveClusterFilter(prev => prev === cId ? null : cId)}
          />
        </div>
      </div>

      {/* Row 2: ML Control Panel + Inter-Cluster Comparison Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MLControlPanel
          config={mlConfig}
          onChangeConfig={onChangeMLConfig}
          onRunClustering={onRunClustering}
          inertia={inertia}
          silhouetteScore={silhouetteScore}
          iterationsRun={iterationsRun}
          isCalculating={isCalculating}
        />
        <ClusterComparisonBar
          clusters={clusters}
          selectedMetric={comparisonMetric}
          onChangeMetric={setComparisonMetric}
        />
      </div>

      {/* Row 3: Realtime Event Stream & Live Ingestion Ticker */}
      <RealtimeStreamTicker
        events={events}
        students={students}
        liveSimulationActive={liveSimulationActive}
        onToggleSimulation={onToggleSimulation}
        onRecordManualLesson={onRecordManualLesson}
      />
    </div>
  );
};
