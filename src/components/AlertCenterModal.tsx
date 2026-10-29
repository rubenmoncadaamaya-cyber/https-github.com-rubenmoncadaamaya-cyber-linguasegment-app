import React, { useState } from 'react';
import {
  StudentProfile,
  ScheduledClass,
  PaymentRecord,
  AlertNotificationItem
} from '../types';
import {
  AlertTemplates,
  dispatchAlertAction,
  formatWhatsAppNumber
} from '../services/alertService';
import {
  Bell,
  X,
  Send,
  MessageSquare,
  Mail,
  Calendar,
  DollarSign,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Clock,
  Sparkles
} from 'lucide-react';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  classes: ScheduledClass[];
  payments: PaymentRecord[];
  onAlertDispatched?: (item: AlertNotificationItem) => void;
  initialType?: 'class_reminder' | 'payment_bre_b' | 'enrollment_confirmation' | 'diagnostic_report';
  initialClass?: ScheduledClass;
  initialStudent?: StudentProfile;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  students,
  classes,
  payments,
  onAlertDispatched,
  initialType = 'class_reminder',
  initialClass,
  initialStudent
}) => {
  const [alertType, setAlertType] = useState<'class_reminder' | 'payment_bre_b' | 'enrollment_confirmation' | 'diagnostic_report'>(initialType);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(initialStudent?.id || students[0]?.id || 1);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClass?.id || classes[0]?.id || '');
  const [recipientPhone, setRecipientPhone] = useState<string>('3105558899');
  const [copied, setCopied] = useState(false);
  const [lastSentResult, setLastSentResult] = useState<{ channel: string; target: string } | null>(null);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentPayment = payments.find(p => p.studentId === selectedStudentId);

  // Generate payload based on alertType
  let templateResult = { subject: '', message: '' };

  if (alertType === 'class_reminder') {
    if (currentClass) {
      templateResult = AlertTemplates.classReminder(currentClass, currentStudent?.full_name || 'Estudiante');
    }
  } else if (alertType === 'enrollment_confirmation') {
    if (currentClass) {
      templateResult = AlertTemplates.enrollmentConfirmation(currentClass, currentStudent?.full_name || 'Estudiante');
    }
  } else if (alertType === 'payment_bre_b') {
    templateResult = AlertTemplates.paymentBreB(
      currentStudent?.full_name || 'Estudiante',
      200000,
      currentPayment?.dueDate || '30 de este mes',
      currentPayment?.referenceNumber || `BREB-${currentStudent?.id || 1}-2026`,
      '3105558899'
    );
  } else if (alertType === 'diagnostic_report') {
    if (currentStudent) {
      templateResult = AlertTemplates.diagnosticReport(currentStudent);
    }
  }

  const handleSend = (channel: 'whatsapp' | 'email') => {
    const contact = channel === 'whatsapp' ? recipientPhone : (currentStudent?.email || 'alumno@lingua-ai.edu');
    
    dispatchAlertAction(
      channel,
      contact,
      templateResult.subject,
      templateResult.message
    );

    const logItem: AlertNotificationItem = {
      id: `alert_${Date.now()}`,
      type: alertType,
      channel,
      recipientName: currentStudent?.full_name || 'Estudiante',
      recipientContact: contact,
      subject: templateResult.subject,
      message: templateResult.message,
      timestamp: 'Ahora',
      status: 'enviado',
      referenceId: alertType === 'class_reminder' ? currentClass?.id : currentPayment?.id
    };

    if (onAlertDispatched) {
      onAlertDispatched(logItem);
    }

    setLastSentResult({ channel: channel === 'whatsapp' ? 'WhatsApp' : 'Correo Electrónico', target: contact });
    setTimeout(() => setLastSentResult(null), 4000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(templateResult.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Centro de Alertas & Notificaciones</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  WhatsApp + Email
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Envía alertas reales instantáneas a alumnos y padres de familia con plantillas predefinidas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setAlertType('class_reminder')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center ${
              alertType === 'class_reminder'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span>Recordatorio Clase</span>
          </button>

          <button
            type="button"
            onClick={() => setAlertType('payment_bre_b')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center ${
              alertType === 'payment_bre_b'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Cobro Bre-B ($200k)</span>
          </button>

          <button
            type="button"
            onClick={() => setAlertType('enrollment_confirmation')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center ${
              alertType === 'enrollment_confirmation'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-300" />
            <span>Inscripción Nivel</span>
          </button>

          <button
            type="button"
            onClick={() => setAlertType('diagnostic_report')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center ${
              alertType === 'diagnostic_report'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Diagnóstico IA</span>
          </button>
        </div>

        {/* Configuration Row: Student & Class Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Estudiante Destinatario:
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            >
              {students.slice(0, 30).map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name} · Nivel {s.cefrLevel} ({s.email})
                </option>
              ))}
            </select>
          </div>

          {(alertType === 'class_reminder' || alertType === 'enrollment_confirmation') ? (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Clase o Taller Programado:
              </label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.level || 'Todos'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                WhatsApp del Alumno / Acudiente:
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                placeholder="Ej. 3105558899"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Live Message Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <span>Vista Previa del Mensaje:</span>
            </span>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado al portapapeles' : 'Copiar texto'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono whitespace-pre-wrap text-slate-300 max-h-56 overflow-y-auto leading-relaxed border-l-4 border-l-indigo-500">
            {templateResult.message}
          </div>
        </div>

        {/* Feedback message when triggered */}
        {lastSentResult && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              ¡Alerta abierta con éxito vía <strong>{lastSentResult.channel}</strong> para <code>{lastSentResult.target}</code>!
            </span>
          </div>
        )}

        {/* Action Buttons: WhatsApp & Email Direct Triggers */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Abre WhatsApp Web o la app nativa y tu gestor de correo de inmediato.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSend('whatsapp')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('email')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar por Correo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
