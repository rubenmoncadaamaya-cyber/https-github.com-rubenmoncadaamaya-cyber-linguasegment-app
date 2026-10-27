import React, { useState } from 'react';
import { ScheduledClass, StudentProfile, MLCluster, ReminderNotification } from '../types';
import { Calendar, Bell, Mail, Plus, Send, Video, MapPin, Headphones, CheckCircle2, AlertCircle } from 'lucide-react';

interface SchedulingViewProps {
  classes: ScheduledClass[];
  students: StudentProfile[];
  clusters: MLCluster[];
  notifications: ReminderNotification[];
  onAddClass: (newClass: Omit<ScheduledClass, 'id' | 'attendeesCount' | 'status' | 'remindersSent'>) => void;
  onSendTestReminder: (classItem: ScheduledClass, channel: 'push' | 'email') => void;
  initialPreselectedStudent?: StudentProfile | null;
  initialTopic?: string;
}

export const SchedulingView: React.FC<SchedulingViewProps> = ({
  classes,
  students,
  clusters,
  notifications,
  onAddClass,
  onSendTestReminder,
  initialPreselectedStudent,
  initialTopic
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'scheduled' | 'completed'>('all');

  // Form states
  const [title, setTitle] = useState(initialTopic || 'Club de Conversación: Modismos y Fluidez B2');
  const [topic, setTopic] = useState('Conversación e Inmersión Situacional');
  const [instructor, setInstructor] = useState('Prof. Elena Morales (Lingua Lead)');
  const [dateTime, setDateTime] = useState('2025-01-20T17:00');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [modality, setModality] = useState<'video_call' | 'in_person' | 'audio_lab'>('video_call');
  const [targetType, setTargetType] = useState<'student' | 'cluster' | 'all'>('student');
  const [targetId, setTargetId] = useState<number>(initialPreselectedStudent?.id || students[0]?.id || 1);

  // Template preferences
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [remind24h, setRemind24h] = useState(true);
  const [remind2h, setRemind2h] = useState(true);
  const [remind15m, setRemind15m] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetLabel = 'Todos los Alumnos';
    if (targetType === 'student') {
      const student = students.find(s => s.id === targetId);
      targetLabel = student ? student.full_name : `Alumno #${targetId}`;
    } else if (targetType === 'cluster') {
      const cluster = clusters.find(c => c.id === targetId);
      targetLabel = cluster ? `Segmento: ${cluster.name}` : `Cluster #${targetId}`;
    }

    onAddClass({
      title,
      topic,
      instructor,
      dateTime,
      durationMinutes,
      modality,
      targetType,
      targetId,
      targetLabel
    });

    setModalOpen(false);
  };

  const filteredClasses = classes.filter(c => {
    if (filterType === 'all') return true;
    return c.status === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Agendamiento de Clases & Recordatorios Automáticos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Programa tutorías 1 a 1 o talleres por segmento y automatiza notificaciones push y correos con plantillas personalizadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Nueva Clase</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Classes List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">
              Sesiones Programadas ({filteredClasses.length})
            </h3>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filterType === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('scheduled')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filterType === 'scheduled' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Próximas
              </button>
              <button
                onClick={() => setFilterType('completed')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filterType === 'completed' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Completadas
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredClasses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 rounded-lg bg-slate-900 border border-slate-800">
                No hay clases programadas en esta vista. Agrega una nueva clase arriba.
              </div>
            ) : (
              filteredClasses.map(c => {
                const dateObj = new Date(c.dateTime);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            c.status === 'scheduled' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            c.status === 'in_progress' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {c.status === 'scheduled' ? 'Programada' : c.status === 'in_progress' ? 'En Vivo' : 'Completada'}
                          </span>
                          <span className="text-xs text-indigo-400 font-mono">
                            {formattedDate} ({c.durationMinutes} min)
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tutor: <strong className="text-slate-300">{c.instructor}</strong> · Destinatario: <strong className="text-slate-200">{c.targetLabel}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {c.modality === 'video_call' && <Video className="w-3.5 h-3.5 text-indigo-400" />}
                        {c.modality === 'in_person' && <MapPin className="w-3.5 h-3.5 text-emerald-400" />}
                        {c.modality === 'audio_lab' && <Headphones className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="capitalize">{c.modality.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Reminders trigger bar */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Bell className="w-3.5 h-3.5 text-slate-500" />
                          <span>Push: {c.remindersSent.push ? 'Enviado' : 'Pendiente'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>Email: {c.remindersSent.email ? 'Enviado' : 'Pendiente'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSendTestReminder(c, 'push')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                          title="Simular envío de Notificación Push ahora"
                        >
                          <Bell className="w-3 h-3 text-indigo-400" />
                          <span>Disparar Push</span>
                        </button>
                        <button
                          onClick={() => onSendTestReminder(c, 'email')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                          title="Simular envío de Correo Electrónico ahora"
                        >
                          <Send className="w-3 h-3 text-emerald-400" />
                          <span>Enviar Correo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Automated Reminders Config & Live Log */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Reglas de Recordatorios Automáticos</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                  Canales Activos:
                </span>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={e => setPushEnabled(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Notificaciones Push al Navegador / App Móvil</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={e => setEmailEnabled(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Correo Electrónico Transaccional con Enlace Directo</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                  Momentos de Envío Automático:
                </span>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind24h}
                    onChange={e => setRemind24h(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>24 horas antes (Confirmación de asistencia)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind2h}
                    onChange={e => setRemind2h(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>2 horas antes (Recordatorio de material y enlace)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind15m}
                    onChange={e => setRemind15m(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>15 minutos antes (Aviso inminente: sala abierta)</span>
                </label>
              </div>

              {/* Template Preview */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider mb-1.5">
                  Vista Previa de Plantilla:
                </span>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-bold block mb-1">Push: Recordatorio de Clase</span>
                  &quot;Hola {'{nombre_alumno}'}, tu clase de &apos;{'{tema_clase}'}&apos; con {'{tutor}'} comienza en breve. ¡Prepárate para practicar!&quot;
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Log */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Historial de Recordatorios ({notifications.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">Últimas 24h</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  Aún no se han enviado recordatorios. Usa los botones &quot;Disparar Push&quot; o &quot;Enviar Correo&quot;.
                </div>
              ) : (
                notifications.slice(0, 6).map(n => (
                  <div
                    key={n.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {n.channel === 'push' ? (
                          <Bell className="w-3 h-3 text-indigo-400" />
                        ) : (
                          <Mail className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>{n.recipientName}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Entregado</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {n.classTitle}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                      <span>{n.recipientEmail}</span>
                      <span>{n.sentAt || 'Hoy'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Agendar Nueva Sesión de Idiomas</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Título de la Clase
                  </label>
                  <span className="text-[10px] text-slate-500">Plantillas rápidas:</span>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                />

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('Taller LinguaKids: Fonética Lúdica, Rimas y Cuentos (4-8 años)');
                      setTopic('Enseñanza Infantil: Fonética Lúdica y Storytelling');
                      setInstructor('Lic. Sofía Alarcón (Especialista en Pedagogía Infantil)');
                      setDurationMinutes(30);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-950/60 text-pink-300 border border-pink-800/80 hover:bg-pink-900/60 transition-colors"
                  >
                    🧸 LinguaKids (4-8 años, 30 min)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('Club Junior: Juegos de Vocabulario y Trivia Gamificada (9-12 años)');
                      setTopic('Enseñanza Infantil: Refuerzo Escolar y Juegos de Rol');
                      setInstructor('Prof. Gabriel Paz (Pedagogía Gamificada)');
                      setDurationMinutes(35);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-950/60 text-pink-300 border border-pink-800/80 hover:bg-pink-900/60 transition-colors"
                  >
                    🎮 Club Junior (9-12 años, 35 min)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('Taller de Fluidez y Modismos Idiomáticos B2/C1');
                      setTopic('Expresiones coloquiales y conectores argumentativos');
                      setInstructor('Dra. Carmen Valenzuela');
                      setDurationMinutes(50);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    💼 Modismos B2/C1 (50 min)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Destinatario
                  </label>
                  <select
                    value={targetType}
                    onChange={e => setTargetType(e.target.value as typeof targetType)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="student">Estudiante Individual (1 a 1)</option>
                    <option value="cluster">Segmento Completo (Grupo)</option>
                    <option value="all">Todos los Estudiantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {targetType === 'student' ? 'Estudiante' : targetType === 'cluster' ? 'Segmento' : 'Destinatario'}
                  </label>
                  {targetType === 'student' ? (
                    <select
                      value={targetId}
                      onChange={e => setTargetId(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          #{s.id} - {s.full_name} ({s.cefrLevel})
                        </option>
                      ))}
                    </select>
                  ) : targetType === 'cluster' ? (
                    <select
                      value={targetId}
                      onChange={e => setTargetId(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {clusters.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.size} alumnos)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400">
                      Todos los 200 alumnos
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tutor / Profesor
                  </label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={e => setInstructor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Modalidad
                  </label>
                  <select
                    value={modality}
                    onChange={e => setModality(e.target.value as typeof modality)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="video_call">Videollamada (Meet / Zoom)</option>
                    <option value="in_person">Presencial en Campus</option>
                    <option value="audio_lab">Laboratorio de Fonética / Audio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="180"
                    step="5"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 45)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Al guardar, el sistema programará automáticamente los recordatorios por push y correo según las reglas configuradas.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
