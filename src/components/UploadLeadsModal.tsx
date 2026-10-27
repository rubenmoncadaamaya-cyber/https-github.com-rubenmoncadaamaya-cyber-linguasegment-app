import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { MarketingProfile, StudentProfile } from '../types';
import {
  parseUploadedLeadsCSV,
  downloadSampleMarketingLeadsCSV,
  download50SampleLeadsCSV,
  download50SampleLeadsExcel,
  SAMPLE_50_LEADS_CSV
} from '../services/leadImportService';

interface UploadLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpload: (newProfiles: MarketingProfile[], mode: 'replace' | 'append') => void;
  existingStudents: StudentProfile[];
  currentProfilesCount: number;
}

export const UploadLeadsModal: React.FC<UploadLeadsModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpload,
  existingStudents,
  currentProfilesCount
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<MarketingProfile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    setSelectedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const leads = parseUploadedLeadsCSV(text, existingStudents);
        setParsedLeads(leads);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al procesar el archivo CSV.';
        setErrorMsg(message);
        setParsedLeads([]);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('No se pudo leer el archivo seleccionado.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample50 = () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const leads = parseUploadedLeadsCSV(SAMPLE_50_LEADS_CSV, existingStudents);
      setParsedLeads(leads);
      setSelectedFile(new File([SAMPLE_50_LEADS_CSV], '50_prospectos_prueba_segmentacion.csv', { type: 'text/csv' }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar prospectos de prueba.';
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedLeads.length === 0) return;
    onConfirmUpload(parsedLeads, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              <span>Cargar Base de Prospectos para Segmentación Comercial</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Importa clientes o leads desde cualquier archivo Excel o CSV. Las variables son 100% flexibles: si faltan columnas, el modelo de Machine Learning imputa valores neutrales sin invalidar registros.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Helper & Template Banner with 50 test records */}
          <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-900/60 flex flex-col items-start gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
              <div className="space-y-0.5">
                <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Base de Prueba Oficial con 50 Prospectos (Excel & CSV)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Contiene 50 leads colombianos representativos de todos los segmentos (Enseñanza Infantil, B2B, Certificaciones, VIP, Viajes y Winback).
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSample50}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-sm text-xs"
                title="Carga directamente los 50 registros a la vista previa para segmentar sin necesidad de arrastrar archivos"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Cargar 50 de Prueba (1 Clic)</span>
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-900/40 w-full">
              <span className="text-[11px] text-indigo-300 font-medium">O descarga el archivo para abrirlo en Excel:</span>
              <button
                type="button"
                onClick={download50SampleLeadsExcel}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Descargar en Excel (.xls)</span>
              </button>
              <button
                type="button"
                onClick={download50SampleLeadsCSV}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <Download className="w-3 h-3 text-indigo-400" />
                <span>Descargar en CSV</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-400 bg-indigo-950/30'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Arrastra tu archivo CSV aquí o haz clic para examinar'}
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Acepta archivos CSV separados por coma (,) o punto y coma (;). Admite encabezados en español o inglés como: <code className="text-indigo-300 font-mono">full_name, email, subscription, learning_goal, estimated_budget, industry, lead_source</code>.
              </p>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Selector */}
          {parsedLeads.length > 0 && (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Modo de Carga en la Base de Datos:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    importMode === 'replace'
                      ? 'border-indigo-500 bg-indigo-950/30 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Reemplazar Base Actual</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sustituir los {currentProfilesCount} leads actuales exclusivamente por los {parsedLeads.length} nuevos registros cargados.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    importMode === 'append'
                      ? 'border-indigo-500 bg-indigo-950/30 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Añadir a la Base Existente</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Conservar los {currentProfilesCount} actuales y agregar los {parsedLeads.length} nuevos para un total de {currentProfilesCount + parsedLeads.length} leads.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedLeads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Vista Previa: {parsedLeads.length} registros identificados</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Mostrando primeros {Math.min(5, parsedLeads.length)} prospectos
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 text-slate-400 font-sans border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Nombre</th>
                        <th className="py-2 px-3">Correo</th>
                        <th className="py-2 px-3 text-center">Plan</th>
                        <th className="py-2 px-3">Meta Declarada</th>
                        <th className="py-2 px-3">Presupuesto</th>
                        <th className="py-2 px-3">Sector</th>
                        <th className="py-2 px-3 text-center">Completitud</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {parsedLeads.slice(0, 5).map((lead, idx) => (
                        <tr key={`preview-${idx}`} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-sans font-semibold text-white">{lead.fullName}</td>
                          <td className="py-2 px-3 text-slate-400">{lead.email}</td>
                          <td className="py-2 px-3 text-center uppercase text-[10px] text-slate-400">{lead.currentSubscription}</td>
                          <td className="py-2 px-3 text-slate-300">{lead.learningGoal || <span className="text-slate-600 italic">No indicada</span>}</td>
                          <td className="py-2 px-3 text-slate-300">{lead.estimatedBudget || <span className="text-slate-600 italic">Omitido</span>}</td>
                          <td className="py-2 px-3 text-slate-300">{lead.industry || <span className="text-slate-600 italic">Omitido</span>}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              lead.profileCompleteness >= 80 ? 'text-emerald-400 bg-emerald-950/60' :
                              lead.profileCompleteness >= 40 ? 'text-amber-400 bg-amber-950/60' :
                              'text-slate-400 bg-slate-800'
                            }`}>
                              {lead.profileCompleteness}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={parsedLeads.length === 0 || isProcessing}
            className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
              parsedLeads.length > 0 && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              Procesar y Segmentar ({parsedLeads.length} Leads)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
