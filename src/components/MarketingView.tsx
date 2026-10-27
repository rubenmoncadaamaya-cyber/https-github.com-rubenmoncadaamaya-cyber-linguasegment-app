import React, { useState, useMemo } from 'react';
import {
  MarketingProfile,
  MarketingCluster,
  MarketingSegmentationConfig,
  StudentProfile
} from '../types';
import {
  exportMarketingToCSV,
  exportMarketingToExcel,
  printMarketingPDFReport
} from '../services/exportService';
import {
  TrendingUp,
  Download,
  Table,
  Printer,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Sliders,
  DollarSign,
  Users,
  Target,
  Send,
  Upload,
  RotateCcw,
  LayoutDashboard,
  ListFilter,
  FileSpreadsheet
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { MarketingOpportunityPlot } from './MarketingOpportunityPlot';
import { MarketingDistributionDonut } from './MarketingDistributionDonut';
import { MarketingComparisonBar } from './MarketingComparisonBar';
import { MarketingChannelFunnel } from './MarketingChannelFunnel';
import { UploadLeadsModal } from './UploadLeadsModal';
import { downloadSampleMarketingLeadsCSV } from '../services/leadImportService';

interface MarketingViewProps {
  marketingProfiles: MarketingProfile[];
  marketingClusters: MarketingCluster[];
  config: MarketingSegmentationConfig;
  onChangeConfig: (newConfig: MarketingSegmentationConfig) => void;
  onRecluster: () => void;
  onUploadProfiles: (newProfiles: MarketingProfile[], mode: 'replace' | 'append') => void;
  onResetOriginalProfiles: () => void;
  isCustomCohort: boolean;
  existingStudents: StudentProfile[];
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  marketingProfiles,
  marketingClusters,
  config,
  onChangeConfig,
  onRecluster,
  onUploadProfiles,
  onResetOriginalProfiles,
  isCustomCohort,
  existingStudents
}) => {
  // View mode switcher: 'dashboard' or 'directory'
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'directory'>('dashboard');

  // Lead upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // CRM Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [selectedCompletenessFilter, setSelectedCompletenessFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<MarketingProfile | null>(null);

  // Inter-cluster comparison metric
  const [comparisonMetric, setComparisonMetric] = useState<'ltv' | 'conversion' | 'lessons' | 'difficulty' | 'recency'>('ltv');

  // AI Copy Generator state
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);

  // Filter leads
  const filteredProfiles = useMemo(() => {
    return marketingProfiles.filter(p => {
      const matchesSearch =
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCluster =
        selectedClusterFilter === 'all' || p.marketingClusterCode === selectedClusterFilter;

      const matchesCompleteness =
        selectedCompletenessFilter === 'all' ? true :
        selectedCompletenessFilter === 'high' ? p.profileCompleteness >= 80 :
        selectedCompletenessFilter === 'mid' ? p.profileCompleteness >= 40 && p.profileCompleteness < 80 :
        p.profileCompleteness < 40;

      return matchesSearch && matchesCluster && matchesCompleteness;
    });
  }, [marketingProfiles, searchTerm, selectedClusterFilter, selectedCompletenessFilter]);

  // Aggregate KPI stats
  const totalPipelineLTV = useMemo(() => {
    return marketingProfiles.reduce((acc, p) => acc + p.expectedLTV, 0);
  }, [marketingProfiles]);

  const avgConversionRate = useMemo(() => {
    if (marketingProfiles.length === 0) return 0;
    return Math.round(
      marketingProfiles.reduce((acc, p) => acc + p.conversionProbability, 0) / marketingProfiles.length
    );
  }, [marketingProfiles]);

  const highPotentialCount = useMemo(() => {
    return marketingProfiles.filter(p => p.conversionProbability >= 30).length;
  }, [marketingProfiles]);

  const avgDataCompleteness = useMemo(() => {
    if (marketingProfiles.length === 0) return 0;
    return Math.round(
      marketingProfiles.reduce((acc, p) => acc + p.profileCompleteness, 0) / marketingProfiles.length
    );
  }, [marketingProfiles]);

  // Handle variable inclusion toggle
  const toggleVariable = (key: keyof MarketingSegmentationConfig) => {
    onChangeConfig({
      ...config,
      [key]: !config[key]
    });
    setTimeout(() => {
      onRecluster();
    }, 50);
  };

  // Generate marketing copy with Gemini AI
  const handleGenerateAICopy = async (lead: MarketingProfile) => {
    setIsGeneratingCopy(true);
    setGeneratedCopy(null);

    const apiKey = process.env.GEMINI_API_KEY || (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;

    if (!apiKey) {
      setGeneratedCopy(
        `[Plantilla Optimizada con Inteligencia ML]\nAsunto: Siguiente nivel en ${lead.cefrLevel}: Oferta especial para ${lead.fullName}\n\nHola ${lead.fullName},\n\nBasándonos en tu historial de ${lead.totalLessons} lecciones completadas y tu nivel ${lead.cefrLevel} dentro de nuestro segmento "${lead.mlClusterName}", sabemos que buscas ${lead.learningGoal || 'perfeccionar tu fluidez profesional'}.\n\nPara impulsarte hacia tus metas, hemos seleccionado para ti:\n👉 ${lead.suggestedOffer}\n\nCanal preferente: ${lead.recommendedChannel}\nGancho: ${lead.sampleCopyHook}\n\n¿Tienes 10 minutos esta semana para una breve sesión de orientación personalizada con un asesor de ${lead.industry || 'nuestro equipo'}?`
      );
      setIsGeneratingCopy(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Actúa como Director de Marketing y Ventas para una academia moderna de idiomas.
Redacta un mensaje de ventas persuasivo y altamente personalizado combinando los datos de MERCADEO y MACHINE LEARNING del prospecto:
- Nombre: ${lead.fullName}
- Plan actual: ${lead.currentSubscription}
- Segmento de Mercadeo: ${lead.marketingClusterName}
- Oferta sugerida: ${lead.suggestedOffer}
- Canal recomendado: ${lead.recommendedChannel}
- Objetivo de aprendizaje: ${lead.learningGoal || 'No especificado (usar tono general de superación)'}
- Presupuesto estimado: ${lead.estimatedBudget || 'Flexible'}
- Industria: ${lead.industry || 'Profesional'}
- Probabilidad de conversión: ${lead.conversionProbability}%
- LTV estimado: $${lead.expectedLTV} USD

DATOS DEL MÓDULO DE MACHINE LEARNING:
- Segmento Pedagógico (K-Means): ${lead.mlClusterName}
- Nivel CEFR: ${lead.cefrLevel}
- Total lecciones completadas: ${lead.totalLessons} (${(lead.totalDurationMinutes / 60).toFixed(1)} horas de estudio)
- Dificultad promedio: ${lead.difficultyScore}/3.0 (${Math.round(lead.hardRatio * 100)}% lecciones difíciles)
- Puntos de logros: ${lead.totalPoints} pts
- Días desde última actividad: ${lead.recencyDays} días
- Habilidades: Conversación ${lead.skills.conversation}/100, Gramática ${lead.skills.grammar}/100, Vocabulario ${lead.skills.vocabulary}/100

Proporciona:
1. Asunto de alto impacto para correo o primera línea para WhatsApp/LinkedIn que haga referencia sutil a su progreso o meta.
2. Mensaje breve (máx. 120 palabras), empático, que mencione su nivel o constancia, enfocado en el beneficio tangible y con llamado a la acción claro.
3. Justificación estratégica de por qué esta oferta encaja con su perfil.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setGeneratedCopy(response.text || 'Copy generado exitosamente.');
    } catch {
      setGeneratedCopy(
        `Hola ${lead.fullName}, basándonos en tu perfil en ${lead.marketingClusterName}, te ofrecemos: ${lead.suggestedOffer}. Contáctanos para agendar tu clase gratuita.`
      );
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Navigation Banner */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0" />
            <h2 className="text-base font-bold text-white">
              Segmentación para Mercadeo & Adquisición de Clientes
            </h2>
            {isCustomCohort && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                Lista Externa Activa
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Segmenta prospectos comerciales mediante algoritmos de Machine Learning y clustering con tolerancia a variables incompletas.
          </p>
        </div>

        {/* Action Controls: Upload CSV, Downloads, Reset */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* UPLOAD LEAD LIST BUTTON (Requested by user) */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/30"
            title="Cargar lista de personas o prospectos desde un archivo CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Cargar Lista de Leads (CSV)</span>
          </button>

          {/* Sample template download */}
          <button
            onClick={downloadSampleMarketingLeadsCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Descargar plantilla CSV con formato de ejemplo"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Plantilla CSV</span>
          </button>

          {/* Reset button if custom cohort is active */}
          {isCustomCohort && (
            <button
              onClick={onResetOriginalProfiles}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Restablecer la base original de los 200 usuarios provistos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Base Original (200)</span>
            </button>
          )}

          {/* Export to CSV */}
          <button
            onClick={() => exportMarketingToCSV(marketingProfiles)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Descargar base de leads segmentada en CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportMarketingToExcel(marketingProfiles, marketingClusters)}
            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-800"
            title="Descargar estrategia en libro Excel (.xls)"
          >
            <Table className="w-3.5 h-3.5 text-emerald-300" />
            <span>Excel (.xls)</span>
          </button>

          {/* PDF Dossier */}
          <button
            onClick={() => printMarketingPDFReport(marketingProfiles, marketingClusters)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Imprimir o guardar reporte PDF de mercadeo"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Dossier PDF</span>
          </button>
        </div>
      </div>

      {/* Sub-View Switcher (Dashboard Analítico vs Directorio CRM) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Analítico Comercial</span>
          </button>

          <button
            onClick={() => setActiveSubView('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubView === 'directory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Directorio de Leads & Acciones CRM ({marketingProfiles.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Modo Activo: <span className="text-white font-medium">{activeSubView === 'dashboard' ? 'Visualizaciones & Gráficos Dinámicos' : 'Gestión y Generación de Copies'}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Base Calificada</span>
            <Users className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {marketingProfiles.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Prospectos procesados</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pipeline LTV</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ${(totalPipelineLTV / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Valor esperado acumulado</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Conversión Media</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">
            {avgConversionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tasa ponderada estimada</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Alta Prioridad</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {highPotentialCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Leads con prob. &gt;30%</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completitud Media</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
            {avgDataCompleteness}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Variables no obligatorias</div>
        </div>
      </div>

      {/* DASHBOARD ANALÍTICO COMERCIAL VIEW */}
      {activeSubView === 'dashboard' && (
        <div className="space-y-6">
          {/* Main Charts Row: 2D Scatter Plot + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <MarketingOpportunityPlot
                profiles={marketingProfiles}
                clusters={marketingClusters}
                selectedLead={selectedLead}
                onSelectLead={(lead) => {
                  setSelectedLead(lead);
                  handleGenerateAICopy(lead);
                }}
                activeClusterFilter={selectedClusterFilter === 'all' ? null : selectedClusterFilter}
                onSelectClusterFilter={(code) => setSelectedClusterFilter(code || 'all')}
              />
            </div>
            <div>
              <MarketingDistributionDonut
                clusters={marketingClusters}
                totalLeads={marketingProfiles.length}
                totalPipelineLTV={totalPipelineLTV}
                onSelectCluster={(code) => setSelectedClusterFilter(prev => prev === code ? 'all' : code)}
                activeClusterCode={selectedClusterFilter === 'all' ? null : selectedClusterFilter}
              />
            </div>
          </div>

          {/* Secondary Charts Row: Inter-Segment Comparison + Channel Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MarketingComparisonBar
              clusters={marketingClusters}
              selectedMetric={comparisonMetric}
              onChangeMetric={setComparisonMetric}
            />
            <MarketingChannelFunnel
              profiles={marketingProfiles}
              clusters={marketingClusters}
            />
          </div>

          {/* Marketing Clusters / Personas Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">
                Segmentos de Mercadeo Identificados ({marketingClusters.length} Personas Comerciales)
              </h3>
              <span className="text-xs text-slate-400">
                Haz clic en una tarjeta para ver sus prospectos en el directorio
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketingClusters.map(cluster => {
                const isSelected = selectedClusterFilter === cluster.code;

                return (
                  <div
                    key={cluster.id}
                    onClick={() => {
                      setSelectedClusterFilter(prev => prev === cluster.code ? 'all' : cluster.code);
                    }}
                    className={`p-4 rounded-lg bg-slate-900 border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-slate-850'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cluster.color }} />
                        <h4 className="text-xs font-bold text-white">
                          {cluster.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {cluster.size} ({cluster.percentage}%)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {cluster.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Conv. Estimada</span>
                        <strong className="text-emerald-400 font-bold">{cluster.avgConversionRate}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">LTV Medio</span>
                        <strong className="text-white font-bold">${cluster.avgExpectedLTV}</strong>
                      </div>
                    </div>

                    {/* Machine Learning Module Integration */}
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[10px] space-y-1 font-mono">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500 font-sans">Clúster ML Base:</span>
                        <span className="font-semibold text-indigo-300 truncate max-w-[130px]">{cluster.dominantMlCluster}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500 font-sans">Nivel CEFR:</span>
                        <span className="font-semibold text-white">{cluster.dominantCefr}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500 font-sans">Uso App (Promedio):</span>
                        <span>{cluster.avgLessons} lecc · Dif. {cluster.avgDifficulty}/3</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                      <div>
                        <strong className="text-indigo-400 block text-[10px] uppercase font-mono">Oferta Comercial:</strong>
                        <span className="line-clamp-1">{cluster.primaryOffer}</span>
                      </div>
                      <div>
                        <strong className="text-slate-500 block text-[10px] uppercase font-mono">Canal Clave:</strong>
                        <span className="text-slate-300">{cluster.primaryChannel}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 italic line-clamp-1 pt-1 border-t border-slate-800/60">
                      {cluster.recommendedHook}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Flexible Model Variables Bar */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Variables del Modelo de Mercadeo & Flexibilidad de Datos
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Las variables ausentes se imputan automáticamente sin invalidar el registro.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Variables Activas en Clustering:</span>

          <button
            onClick={() => toggleVariable('useLearningGoal')}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              config.useLearningGoal
                ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Objetivo de Aprendizaje</span>
            <span className="text-[10px] font-mono">{config.useLearningGoal ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleVariable('useBudgetRange')}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              config.useBudgetRange
                ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Rango de Presupuesto</span>
            <span className="text-[10px] font-mono">{config.useBudgetRange ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleVariable('useIndustry')}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              config.useIndustry
                ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Sector / Ocupación</span>
            <span className="text-[10px] font-mono">{config.useIndustry ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleVariable('useUrgency')}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              config.useUrgency
                ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Nivel de Urgencia</span>
            <span className="text-[10px] font-mono">{config.useUrgency ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleVariable('useLeadSource')}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              config.useLeadSource
                ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Canal de Origen</span>
            <span className="text-[10px] font-mono">{config.useLeadSource ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleVariable('useUsageMetrics')}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              config.useUsageMetrics
                ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Métricas de Uso (Lessons/Points)</span>
            <span className="text-[10px] font-mono">{config.useUsageMetrics ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Leads Directory & CRM Action Table (Always accessible or when in directory sub-view) */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar prospecto por nombre o correo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Filter Counts */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Filtrados: <strong className="text-white font-mono">{filteredProfiles.length}</strong> de {marketingProfiles.length} leads</span>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Filtrar por Segmento de Campaña</label>
              <select
                value={selectedClusterFilter}
                onChange={e => setSelectedClusterFilter(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todos los Segmentos ({marketingProfiles.length})</option>
                {marketingClusters.map(c => (
                  <option key={c.id} value={c.code}>
                    {c.name} ({c.size})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Completitud del Perfil</label>
              <select
                value={selectedCompletenessFilter}
                onChange={e => setSelectedCompletenessFilter(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Cualquier Nivel de Información</option>
                <option value="high">Alta (&ge;80% variables completas)</option>
                <option value="mid">Media (40% - 79% completas)</option>
                <option value="low">Baja (&lt;40% información disponible)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedClusterFilter('all');
                  setSelectedCompletenessFilter('all');
                  setSearchTerm('');
                }}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Lead</th>
                  <th className="py-2.5 px-3">Segmento de Mercadeo</th>
                  <th className="py-2.5 px-3">Segmento ML / CEFR</th>
                  <th className="py-2.5 px-3 text-right">Uso App (ML)</th>
                  <th className="py-2.5 px-3 text-center">Plan</th>
                  <th className="py-2.5 px-3 text-right">Prob. Conv.</th>
                  <th className="py-2.5 px-3 text-right">LTV</th>
                  <th className="py-2.5 px-3">Oferta Comercial</th>
                  <th className="py-2.5 px-3">Canal</th>
                  <th className="py-2.5 px-3 text-center">Datos</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                {filteredProfiles.slice(0, 30).map(lead => {
                  return (
                    <tr
                      key={lead.studentId}
                      className="hover:bg-slate-850/60 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-white">{lead.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{lead.email}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1.5"
                          style={{
                            backgroundColor: `${lead.marketingClusterColor}20`,
                            color: lead.marketingClusterColor
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lead.marketingClusterColor }} />
                          {lead.marketingClusterName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-200 text-xs">{lead.mlClusterName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                            {lead.cefrLevel}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div><strong className="text-white">{lead.totalLessons}</strong> lecc <span className="text-slate-500 text-[11px]">(Dif {lead.difficultyScore.toFixed(1)})</span></div>
                        <div className="text-[10px] text-slate-500">{lead.totalPoints} pts · {lead.recencyDays}d inact.</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans uppercase text-[10px] text-slate-400">
                        {lead.currentSubscription}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {lead.conversionProbability}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        ${lead.expectedLTV}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-300 max-w-xs truncate" title={lead.suggestedOffer}>
                        {lead.suggestedOffer}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-400">
                        {lead.recommendedChannel.split('/')[0]}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          lead.profileCompleteness >= 80 ? 'text-emerald-400 bg-emerald-950/60' :
                          lead.profileCompleteness >= 40 ? 'text-amber-400 bg-amber-950/60' :
                          'text-slate-400 bg-slate-800'
                        }`}>
                          {lead.profileCompleteness}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            handleGenerateAICopy(lead);
                          }}
                          className="px-2 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors mx-auto shadow-sm"
                          title="Generar mensaje publicitario personalizado"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Copy IA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Mostrando primeros 30 prospectos con integración de métricas de Machine Learning y variables de mercadeo.</span>
            <span className="font-mono text-slate-400 tabular-nums">Total: {filteredProfiles.length} leads</span>
          </div>
        </div>
      </div>

      {/* AI Campaign Copy & Lead Diagnostic Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-lg bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Perfil Integral de Mercadeo & Machine Learning: {selectedLead.fullName}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID #{selectedLead.studentId} · {selectedLead.email} · Plan {selectedLead.currentSubscription.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

            {/* Side-by-side: Marketing Data vs Machine Learning Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Marketing Box */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider font-mono">
                  1. Diagnóstico Comercial & Mercadeo
                </span>
                <div><strong>Segmento Mercadeo:</strong> <span className="text-white">{selectedLead.marketingClusterName}</span></div>
                <div><strong>Probabilidad Conversión:</strong> <span className="text-emerald-400 font-mono font-bold">{selectedLead.conversionProbability}%</span> · <strong>LTV:</strong> <span className="text-white font-mono font-bold">${selectedLead.expectedLTV}</span></div>
                <div><strong>Oferta:</strong> <span className="text-slate-300">{selectedLead.suggestedOffer}</span></div>
                <div><strong>Canal Sugerido:</strong> <span className="text-slate-300">{selectedLead.recommendedChannel}</span></div>
                <div><strong>Meta:</strong> <span className="text-slate-400">{selectedLead.learningGoal || 'No especificada'}</span></div>
                <div><strong>Presupuesto:</strong> <span className="text-slate-400">{selectedLead.estimatedBudget || 'No indicado'}</span></div>
                <div><strong>Industria:</strong> <span className="text-slate-400">{selectedLead.industry || 'No registrada'}</span></div>
              </div>

              {/* Machine Learning Box */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider font-mono">
                  2. Diagnóstico de Machine Learning (K-Means)
                </span>
                <div><strong>Clúster Pedagógico ML:</strong> <span className="text-white">{selectedLead.mlClusterName}</span></div>
                <div><strong>Nivel CEFR:</strong> <span className="font-bold text-indigo-300 font-mono">{selectedLead.cefrLevel}</span></div>
                <div><strong>Total Lecciones:</strong> <span className="font-mono text-white">{selectedLead.totalLessons}</span> lecciones ({((selectedLead.totalDurationMinutes || 0) / 60).toFixed(1)}h estudio)</div>
                <div><strong>Dificultad Promedio:</strong> <span className="font-mono text-white">{selectedLead.difficultyScore.toFixed(2)} / 3.0</span> ({Math.round(selectedLead.hardRatio * 100)}% difíciles)</div>
                <div><strong>Puntos de Logros:</strong> <span className="font-mono text-amber-400">{selectedLead.totalPoints} pts</span> ({selectedLead.totalAchievements} trofeos)</div>
                <div><strong>Inactividad:</strong> <span className="font-mono text-slate-300">{selectedLead.recencyDays} días</span> (Última: {selectedLead.lastActivityDate})</div>
                <div className="pt-1 text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>Conv: {selectedLead.skills.conversation}/100</span>
                  <span>Gram: {selectedLead.skills.grammar}/100</span>
                  <span>Vocab: {selectedLead.skills.vocabulary}/100</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Mensaje de Conversión Generado por IA (Gemini):
              </label>

              {isGeneratingCopy ? (
                <div className="p-6 text-center text-xs text-slate-400 rounded bg-slate-950 border border-slate-800 animate-pulse">
                  Generando copy de conversión optimizado para {selectedLead.recommendedChannel}...
                </div>
              ) : (
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {generatedCopy}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => handleGenerateAICopy(selectedLead)}
                disabled={isGeneratingCopy}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerar Variación</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCopy || '');
                    alert('¡Texto copiado al portapapeles!');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Copiar al Portapapeles</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      <UploadLeadsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirmUpload={onUploadProfiles}
        existingStudents={existingStudents}
        currentProfilesCount={marketingProfiles.length}
      />
    </div>
  );
};
