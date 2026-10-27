import React from 'react';
import { CalendarPlus } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'students' | 'personalization' | 'marketing' | 'payments' | 'scheduling' | 'reports';
  onSelectTab: (tab: 'dashboard' | 'students' | 'personalization' | 'marketing' | 'payments' | 'scheduling' | 'reports') => void;
  onOpenScheduleModal: () => void;
  liveSimulationActive: boolean;
  onToggleSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenScheduleModal,
  liveSimulationActive,
  onToggleSimulation
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); onSelectTab('dashboard'); }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
            L
          </div>
          <span>LinguaSegment <span className="text-indigo-400 font-medium text-xs tracking-normal">ML Analytics</span></span>
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'dashboard'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard ML
        </button>
        <button
          onClick={() => onSelectTab('students')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'students'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Estudiantes en Vivo
        </button>
        <button
          onClick={() => onSelectTab('marketing')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'marketing'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Segmentación Mercadeo
        </button>
        <button
          onClick={() => onSelectTab('payments')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
            currentTab === 'payments'
              ? 'text-white border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Pagos & Bre-B</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            0%
          </span>
        </button>
        <button
          onClick={() => onSelectTab('personalization')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'personalization'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Personalización Pedagógica
        </button>
        <button
          onClick={() => onSelectTab('scheduling')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'scheduling'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Agendamiento & Recordatorios
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            currentTab === 'reports'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Reportes & Descargas
        </button>
      </nav>

      {/* Zone 3: 1 primary action with streaming toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSimulation}
          title={liveSimulationActive ? "Pausar adquisición en tiempo real" : "Iniciar adquisición de datos en tiempo real"}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            liveSimulationActive 
              ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${liveSimulationActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          <span>{liveSimulationActive ? 'Stream Activo' : 'Pausado'}</span>
        </button>
        
        <button
          onClick={onOpenScheduleModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>Agendar Clase</span>
        </button>
      </div>
    </header>
  );
};
