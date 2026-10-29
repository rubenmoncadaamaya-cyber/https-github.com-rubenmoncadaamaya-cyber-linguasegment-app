import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Apple } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA in standalone mode, hide
  if (isInstalled) {
    return (
      <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>App Instalada</span>
      </span>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all"
          title="Instalar LinguaSegment AI en tu celular o computador"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">Instalar</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all"
          title="Instalar en iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Instalar en iOS</span>
          <span className="sm:hidden">App iOS</span>
        </button>
      )}

      {/* Fallback general install guidance button for desktop/mobile browsers */}
      {!isInstallable && !isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-all"
          title="Instalar en tu dispositivo"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Instalar Móvil</span>
        </button>
      )}

      {/* Guided installation modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  L
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instalar LinguaSegment AI</h3>
                  <p className="text-xs text-slate-400">Acceso instantáneo sin descargas de tienda</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Apple className="w-4 h-4 text-slate-300" />
                  <span>En iPhone / iPad (Safari):</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha arriba en la barra de Safari).</li>
                  <li>Baja en el menú y selecciona <strong>&quot;Agregar al inicio&quot;</strong> (Add to Home Screen).</li>
                  <li>Toca <strong>Agregar</strong> en la esquina superior derecha.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>En Android (Chrome / Edge):</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>Toca los <strong>tres puntos</strong> en la esquina superior derecha del navegador.</li>
                  <li>Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.</li>
                  <li>La aplicación quedará instalada como app nativa con icono propio.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Entendido, volver a la plataforma
            </button>
          </div>
        </div>
      )}
    </>
  );
};
