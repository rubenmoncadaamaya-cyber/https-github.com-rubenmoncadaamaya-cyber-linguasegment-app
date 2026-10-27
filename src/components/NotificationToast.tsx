import React, { useEffect } from 'react';
import { Bell, X, Video, ExternalLink } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  body: string;
  recipient: string;
  channel: 'push' | 'email';
}

interface NotificationToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Gentle soft dual-tone chime
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Audio context may be blocked before first user gesture
  }
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    playNotificationSound();
    const timer = setTimeout(() => {
      onDismiss();
    }, 6500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed top-16 right-5 z-50 w-88 max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900 border border-indigo-500/80 shadow-2xl p-4 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>{toast.title}</span>
              <span className="text-[10px] font-mono text-indigo-300 uppercase px-1 rounded bg-indigo-950 border border-indigo-800">
                {toast.channel}
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {toast.body}
            </p>
            <div className="mt-2 text-[11px] text-slate-500 font-mono">
              Para: <strong className="text-slate-400">{toast.recipient}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">Simulación Web Push</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="px-2 py-0.5 rounded text-slate-400 hover:text-white"
          >
            Descartar
          </button>
          <button
            onClick={() => {
              alert(`Conectando a la sesión de videollamada para ${toast.recipient}...`);
              onDismiss();
            }}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center gap-1 shadow-sm"
          >
            <Video className="w-3 h-3" />
            <span>Unirse a la Clase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
