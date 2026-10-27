import React, { useState } from 'react';
import {
  CalendarPlus,
  Menu,
  X,
  UserCheck,
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  Calendar,
  FileSpreadsheet,
  Baby,
  ChevronDown,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { ROLE_CONFIGS } from '../services/authService';

export type AppTab = 
  | 'dashboard' 
  | 'students' 
  | 'personalization' 
  | 'marketing' 
  | 'payments' 
  | 'scheduling' 
  | 'reports' 
  | 'student_portal';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenScheduleModal: () => void;
  liveSimulationActive: boolean;
  onToggleSimulation: () => void;
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenScheduleModal,
  liveSimulationActive,
  onToggleSimulation,
  currentUser,
  onOpenAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allowedTabs = ROLE_CONFIGS[currentUser.role]?.allowedTabs || ['dashboard'];

  const tabItems: { id: AppTab; label: string; icon: React.ReactNode; shortLabel: string; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard ML',
      shortLabel: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'students',
      label: 'Estudiantes en Vivo',
      shortLabel: 'Alumnos',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'marketing',
      label: 'Segmentación Mercadeo',
      shortLabel: 'Mercadeo',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'payments',
      label: 'Pagos & Bre-B',
      shortLabel: 'Pagos',
      badge: '0%',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'personalization',
      label: 'Personalización Pedagógica',
      shortLabel: 'Pedagogía',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'scheduling',
      label: 'Agendamiento & Recordatorios',
      shortLabel: 'Clases',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'reports',
      label: 'Reportes & Descargas',
      shortLabel: 'Reportes',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      id: 'student_portal',
      label: 'Portal Estudiante & Familia',
      shortLabel: 'Mi Portal',
      badge: 'Kids',
      icon: <Baby className="w-4 h-4 text-amber-300" />
    }
  ];

  // Filter tabs by RBAC role
  const visibleTabs = tabItems.filter(item => allowedTabs.includes(item.id));

  const roleConfig = ROLE_CONFIGS[currentUser.role] || ROLE_CONFIGS.admin;

  const handleSelectTab = (tab: AppTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Wordmark + Mobile Menu Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Mobile hamburger button - visible on <lg */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab(visibleTabs[0]?.id || 'dashboard');
                }}
                className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/30">
                  L
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight font-extrabold">LinguaSegment</span>
                  <span className="text-[10px] text-indigo-400 font-semibold tracking-wider font-mono">
                    AI & ML PLATFORM
                  </span>
                </div>
              </a>
            </div>

            {/* Center: Desktop Navigation Bar (hidden on mobile, visible on lg+) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-300 overflow-x-auto py-1">
              {visibleTabs.map(tab => {
                const isActive = currentTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Role indicator & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Role Indicator & Switcher Button */}
              <button
                onClick={onOpenAuthModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs flex items-center gap-2 transition-all shadow-sm"
                title="Cambiar rol de usuario o ver credenciales RBAC"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white line-clamp-1">
                    {currentUser.displayName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-indigo-400 font-semibold">
                    {roleConfig.badge}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Live Streaming Toggle (Hidden on very small screens) */}
              <button
                onClick={onToggleSimulation}
                title={liveSimulationActive ? "Pausar adquisición de datos" : "Activar adquisición de datos"}
                className={`hidden md:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors items-center gap-1.5 ${
                  liveSimulationActive
                    ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${liveSimulationActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[11px]">{liveSimulationActive ? 'Stream ML' : 'Pausado'}</span>
              </button>

              {/* Primary Action Button (Agendar Clase) if allowed */}
              {allowedTabs.includes('scheduling') && (
                <button
                  onClick={onOpenScheduleModal}
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Agendar Clase</span>
                  <span className="sm:hidden">Agendar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Tab Bar - For quick navigation on mobile screens */}
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/90 px-2 py-1.5 overflow-x-auto scrollbar-none flex gap-1.5">
          {visibleTabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Slide-over Menu (Shows when hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    L
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">LinguaSegment</h3>
                    <span className="text-[10px] text-indigo-400 font-mono">Navegación Móvil</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info & Role Switcher in Drawer */}
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Rol Activo:</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${roleConfig.badgeColor}`}>
                    {roleConfig.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">{currentUser.displayName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{currentUser.email}</div>
                <div className="mt-2 text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Toca para cambiar de rol (RBAC)</span>
                </div>
              </div>

              {/* Full Navigation Links List for Mobile */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 block mb-2">
                  Módulos Disponibles
                </span>
                {visibleTabs.map(tab => {
                  const isActive = currentTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={onToggleSimulation}
                className={`w-full py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 ${
                  liveSimulationActive
                    ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${liveSimulationActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{liveSimulationActive ? 'Stream en Vivo Activo' : 'Stream Pausado'}</span>
              </button>

              {allowedTabs.includes('scheduling') && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenScheduleModal();
                  }}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Agendar Clase</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
