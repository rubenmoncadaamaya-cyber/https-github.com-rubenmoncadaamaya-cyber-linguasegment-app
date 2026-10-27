import React, { useState } from 'react';
import { StudentProfile, MLCluster, MarketingProfile, MarketingCluster, PaymentRecord } from '../types';
import {
  exportStudentsToCSV,
  exportToExcel,
  printExecutivePDFReport,
  exportMarketingToCSV,
  exportMarketingToExcel,
  printMarketingPDFReport
} from '../services/exportService';
import { exportPaymentsToCSV, formatCOP } from '../services/paymentService';
import {
  FileText,
  Download,
  Printer,
  Table,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface ReportsViewProps {
  students: StudentProfile[];
  clusters: MLCluster[];
  marketingProfiles: MarketingProfile[];
  marketingClusters: MarketingCluster[];
  payments?: PaymentRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  clusters,
  marketingProfiles,
  marketingClusters,
  payments = []
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'marketing' | 'academic' | 'financial'>('marketing');

  const totalHours = Math.round(students.reduce((acc, s) => acc + s.totalDurationMinutes, 0) / 60);
  const totalPoints = students.reduce((acc, s) => acc + s.totalPoints, 0);
  const totalPipelineLTV = marketingProfiles.reduce((acc, p) => acc + p.expectedLTV, 0);
  const highConversionLeads = marketingProfiles.filter(p => p.conversionProbability >= 30).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Centro de Reportes & Exportación de Datos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Descarga reportes estructurados para mercadeo, pedagogía y recaudo financiero Bre-B / Billeteras.
          </p>
        </div>

        {/* Switch report type tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setActiveReportTab('marketing')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeReportTab === 'marketing'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mercadeo</span>
          </button>
          <button
            onClick={() => setActiveReportTab('academic')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeReportTab === 'academic'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Académico</span>
          </button>
          <button
            onClick={() => setActiveReportTab('financial')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeReportTab === 'financial'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Recaudo Bre-B</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: MARKETING EXPORTS (Prominently featured) */}
      {activeReportTab === 'marketing' && (
        <div className="space-y-6">
          {/* Marketing Download Action Box */}
          <div className="p-5 rounded-lg bg-slate-900 border border-indigo-500/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-indigo-400 font-mono uppercase tracking-wider font-bold block mb-0.5">
                  Descargas de Segmentación para Mercadeo
                </span>
                <h3 className="text-base font-bold text-white">
                  Exportación de Estrategia Comercial y Padrón de Leads
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bases de datos optimizadas con probabilidad de cierre, LTV estimado, canal recomendado y oferta sugerida.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportMarketingToCSV(marketingProfiles)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                  title="Exportar base completa de leads de mercadeo a CSV"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Leads (CSV)</span>
                </button>

                <button
                  onClick={() => exportMarketingToExcel(marketingProfiles, marketingClusters)}
                  className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-800 shadow-sm"
                  title="Exportar libro de trabajo Excel con desglose comercial y contactos"
                >
                  <Table className="w-4 h-4 text-emerald-300" />
                  <span>Estrategia Mercadeo (Excel .xls)</span>
                </button>

                <button
                  onClick={() => printMarketingPDFReport(marketingProfiles, marketingClusters)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Generar vista imprimible o descargar en PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Dossier de Mercadeo (PDF)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Leads en Base</span>
                <span className="text-xl font-bold text-white font-mono tabular-nums">{marketingProfiles.length}</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Pipeline Estimado</span>
                <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">${(totalPipelineLTV / 1000).toFixed(1)}k</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Prospectos Clave (&gt;30%)</span>
                <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">{highConversionLeads}</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Campañas / Personas</span>
                <span className="text-xl font-bold text-indigo-400 font-mono tabular-nums">{marketingClusters.length}</span>
              </div>
            </div>
          </div>

          {/* Marketing Segments Preview Table */}
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Vista Previa: Distribución de Segmentos Comerciales y Ofertas
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Segmento de Campaña</th>
                    <th className="py-2.5 px-3 text-right">Leads</th>
                    <th className="py-2.5 px-3 text-right">% Cuota</th>
                    <th className="py-2.5 px-3 text-right">Conv. Media</th>
                    <th className="py-2.5 px-3 text-right">LTV Estimado</th>
                    <th className="py-2.5 px-3">Oferta Comercial Sugerida</th>
                    <th className="py-2.5 px-3">Canal Principal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                  {marketingClusters.map(c => (
                    <tr key={c.id} className="hover:bg-slate-850">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">{c.size}</td>
                      <td className="py-2.5 px-3 text-right">{c.percentage}%</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">{c.avgConversionRate}%</td>
                      <td className="py-2.5 px-3 text-right text-white">${c.avgExpectedLTV}</td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-300 max-w-xs truncate" title={c.primaryOffer}>
                        {c.primaryOffer}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-400">
                        {c.primaryChannel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>La descarga en Excel incluye la hoja de contactos estructurada para carga inmediata en CRM (HubSpot, Mailchimp, Salesforce).</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Compatible con variables opcionales y tolerante a nulos</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ACADEMIC / PEDAGOGICAL EXPORTS */}
      {activeReportTab === 'academic' && (
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider font-bold block mb-0.5">
                  Descargas de Segmentación Académica
                </span>
                <h3 className="text-base font-bold text-white">
                  Reportes de Progreso Pedagógico & Desempeño
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Métricas de lecciones completadas, dificultad, horas de estudio y niveles CEFR de los alumnos.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportStudentsToCSV(students)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  title="Exportar archivo CSV con 21 variables académicas"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Académico (CSV)</span>
                </button>

                <button
                  onClick={() => exportToExcel(students, clusters)}
                  className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-800"
                  title="Exportar resumen académico en formato Excel"
                >
                  <Table className="w-4 h-4 text-emerald-300" />
                  <span>Resumen Académico (Excel .xls)</span>
                </button>

                <button
                  onClick={() => printExecutivePDFReport(students, clusters)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Imprimir informe pedagógico en PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Informe Académico (PDF)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Alumnos</span>
                <span className="text-xl font-bold text-white font-mono tabular-nums">{students.length}</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Horas de Estudio</span>
                <span className="text-xl font-bold text-indigo-400 font-mono tabular-nums">{totalHours}h</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Puntos Totales</span>
                <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">{totalPoints.toLocaleString('es-ES')}</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Segmentos K-Means</span>
                <span className="text-xl font-bold text-white font-mono tabular-nums">{clusters.length}</span>
              </div>
            </div>
          </div>

          {/* Academic Table Preview */}
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Vista Previa: Diagnóstico y Estrategia por Segmento Pedagógico
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2 px-3">Segmento ML</th>
                    <th className="py-2 px-3 text-right">Alumnos</th>
                    <th className="py-2 px-3 text-right">% Cuota</th>
                    <th className="py-2 px-3 text-right">Lecciones Prom.</th>
                    <th className="py-2 px-3 text-right">Dificultad (1-3)</th>
                    <th className="py-2 px-3 text-right">Puntos Medios</th>
                    <th className="py-2 px-3 text-right">Inactividad</th>
                    <th className="py-2 px-3">Enfoque Didáctico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                  {clusters.map(c => (
                    <tr key={c.id} className="hover:bg-slate-850">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">{c.size}</td>
                      <td className="py-2.5 px-3 text-right">{c.percentage}%</td>
                      <td className="py-2.5 px-3 text-right">{c.avgLessons}</td>
                      <td className="py-2.5 px-3 text-right text-indigo-300">{c.avgDifficulty}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{c.avgPoints}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{c.avgRecencyDays}d</td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-300 max-w-xs truncate">
                        {c.recommendedFocus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FINANCIAL & BRE-B REPORT */}
      {activeReportTab === 'financial' && (
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-slate-900 border border-emerald-500/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-emerald-400 font-mono uppercase tracking-wider font-bold block mb-0.5">
                  Reportes de Recaudo Bre-B, Nequi & Daviplata
                </span>
                <h3 className="text-sm font-bold text-white">
                  Consolidado de Cartera Mensual y Ahorro por 0% Comisión
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportPaymentsToCSV(payments)}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Cartera Bre-B (CSV)</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Reporte contable que consolida los pagos de los 200 estudiantes para el periodo activo. Cada mensualidad está fijada en <strong className="text-white">$200.000 COP</strong>, procesada a través del sistema interoperable Bre-B del Banco de la República o billeteras digitales sin costos de intermediación.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block uppercase font-mono">Facturación Teórica</span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">{formatCOP(payments.length * 200000)}</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 block uppercase font-mono">Recaudado</span>
                <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                  {formatCOP(payments.filter(p => p.status === 'pagado').reduce((acc, p) => acc + p.amountCOP, 0))}
                </span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-amber-500/30">
                <span className="text-[11px] text-amber-400 block uppercase font-mono">En Cobro</span>
                <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                  {formatCOP(payments.filter(p => p.status !== 'pagado').reduce((acc, p) => acc + p.amountCOP, 0))}
                </span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-indigo-500/40">
                <span className="text-[11px] text-indigo-300 block uppercase font-mono">Ahorro Pasarela (0%)</span>
                <span className="text-lg font-bold text-indigo-400 font-mono tabular-nums">
                  +{formatCOP(payments.filter(p => p.status === 'pagado').length * Math.round((200000 * 0.029 + 900) * 1.19))}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Muestra de Registros de Recaudo (Últimos movimientos verificados)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2 px-3">Estudiante</th>
                    <th className="py-2 px-3">Periodo</th>
                    <th className="py-2 px-3 text-right">Tarifa</th>
                    <th className="py-2 px-3">Estado</th>
                    <th className="py-2 px-3">Método</th>
                    <th className="py-2 px-3 font-mono">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {payments.slice(0, 10).map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-sans font-semibold text-white">{p.studentName}</td>
                      <td className="py-2 px-3">{p.period}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-white font-bold">{formatCOP(p.amountCOP)}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                          p.status === 'pagado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-xs">{p.method || 'Pendiente'}</td>
                      <td className="py-2 px-3 text-indigo-300">{p.referenceNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
