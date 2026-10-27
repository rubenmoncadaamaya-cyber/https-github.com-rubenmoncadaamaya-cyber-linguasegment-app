import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { ROLE_CONFIGS, DEMO_USERS, signInWithGooglePlatform } from '../services/authService';
import {
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  Baby,
  X,
  CheckCircle,
  KeyRound,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onSelectRole: (role: UserRole) => void;
  onUserAuthenticated?: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectRole,
  onUserAuthenticated
}) => {
  const [selectedTargetRole, setSelectedTargetRole] = useState<UserRole>(currentUser.role);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleIcons: Record<UserRole, React.ReactNode> = {
    admin: <ShieldCheck className="w-5 h-5 text-rose-400" />,
    teacher: <GraduationCap className="w-5 h-5 text-indigo-400" />,
    sales: <TrendingUp className="w-5 h-5 text-amber-400" />,
    parent_student: <Baby className="w-5 h-5 text-emerald-400" />
  };

  const handleQuickSwitch = (role: UserRole) => {
    setSelectedTargetRole(role);
    onSelectRole(role);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const user = await signInWithGooglePlatform(selectedTargetRole);
      if (onUserAuthenticated) {
        onUserAuthenticated(user);
      } else {
        onSelectRole(user.role);
      }
      onClose();
    } catch (err) {
      console.error('Google sign-in error:', err);
      // If popup is closed by user or blocked, provide clear message and allow test role fallback
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('popup-closed-by-user')) {
        setAuthError('La ventana de Google Identity fue cerrada. Puedes usar el Acceso Rápido de Demostración abajo.');
      } else if (errorMsg.includes('popup-blocked')) {
        setAuthError('Tu navegador bloqueó la ventana emergente. Por favor habilita ventanas emergentes o usa el Acceso Rápido.');
      } else {
        setAuthError(`No se completó la autenticación federada: ${errorMsg}. Puedes usar el cambio de rol directo.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Firebase Authentication & Control de Acceso (RBAC)</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Gestión de Cuentas y Roles de Usuario
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conexión en la nube con Google Identity / Firebase Firestore y cambio dinámico entre los 4 roles:
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
              ) : (
                currentUser.displayName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{currentUser.displayName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_CONFIGS[currentUser.role].badgeColor}`}>
                  {ROLE_CONFIGS[currentUser.role].badge}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{currentUser.email}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sesión Activa
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Firestore Sincronizado</span>
          </div>
        </div>

        {/* Google Identity Platform Login Button */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-300 block uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proveedor de Identidad Cloud:</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Firebase Auth v13</span>
          </div>

          <p className="text-[11px] text-slate-300">
            Inicia sesión con tu cuenta de Google real. Se vinculará con tu perfil en Firestore y te otorgará los permisos del rol seleccionado.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Conectando con Google Identity Platform...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Acceder con Google Identity / Firebase</span>
              </>
            )}
          </button>

          {authError && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}
        </div>

        {/* 4 Defined Roles Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider font-mono">
              Cambio Rápido de Rol (1-Click Switch):
            </label>
            <span className="text-[10px] text-slate-400">Prueba instantánea</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {(Object.keys(ROLE_CONFIGS) as UserRole[]).map(roleKey => {
              const config = ROLE_CONFIGS[roleKey];
              const demo = DEMO_USERS[roleKey];
              const isCurrent = currentUser.role === roleKey;

              return (
                <div
                  key={roleKey}
                  onClick={() => handleQuickSwitch(roleKey)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isCurrent
                      ? 'bg-slate-850 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {roleIcons[roleKey]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{config.label}</span>
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Activo</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {config.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                      <span>Cuenta de prueba: <strong className="text-slate-300">{demo.displayName}</strong></span>
                      <span>·</span>
                      <span>Módulos visibles: {config.allowedTabs.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
