import React, { useState } from 'react';
import { RealtimeEvent, StudentProfile, LessonDifficulty } from '../types';
import { Radio, PlusCircle, CheckCircle2, Award, Zap } from 'lucide-react';

interface RealtimeStreamTickerProps {
  events: RealtimeEvent[];
  students: StudentProfile[];
  liveSimulationActive: boolean;
  onToggleSimulation: () => void;
  onRecordManualLesson: (
    studentId: number,
    lessonName: string,
    difficulty: LessonDifficulty,
    duration: number,
    points: number
  ) => void;
}

export const RealtimeStreamTicker: React.FC<RealtimeStreamTickerProps> = ({
  events,
  students,
  liveSimulationActive,
  onToggleSimulation,
  onRecordManualLesson
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 1);
  const [lessonName, setLessonName] = useState('Conversación de Inmersión B2');
  const [difficulty, setDifficulty] = useState<LessonDifficulty>('medium');
  const [duration, setDuration] = useState(45);
  const [points, setPoints] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordManualLesson(selectedStudentId, lessonName, difficulty, duration, points);
    setModalOpen(false);
  };

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-400" />
            {liveSimulationActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-white">
            Flujo de Eventos y Adquisición en Tiempo Real
          </h3>
          <span className="text-xs text-slate-400">
            {liveSimulationActive ? '(Simulación activa · ~4s por evento)' : '(Pausado)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Registrar Lección Manual</span>
          </button>
          
          <button
            onClick={onToggleSimulation}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              liveSimulationActive
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {liveSimulationActive ? 'Pausar Simulación' : 'Iniciar Simulación'}
          </button>
        </div>
      </div>

      {/* Events Stream List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No hay eventos registrados recientemente. Inicia la simulación o registra una lección manualmente.
          </div>
        ) : (
          events.slice(0, 8).map(event => (
            <div
              key={event.id}
              className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs gap-3 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {event.type === 'lesson_completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : event.type === 'achievement_unlocked' ? (
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
                <div className="truncate">
                  <span className="font-semibold text-white mr-1.5">{event.studentName}</span>
                  <span className="text-slate-300">{event.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
                {event.difficulty && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                    event.difficulty === 'hard' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    event.difficulty === 'medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {event.difficulty}
                  </span>
                )}
                {event.deltaPoints && (
                  <span className="text-amber-400 font-semibold">+{event.deltaPoints} pts</span>
                )}
                <span className="text-slate-500">{event.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Lesson Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Registrar Progreso de Alumno en Tiempo Real
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simula la finalización de una lección o prueba para actualizar métricas y re-inferir segmento.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Estudiante
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.id} - {s.full_name} ({s.clusterName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tema / Nombre de la Lección
                </label>
                <input
                  type="text"
                  required
                  value={lessonName}
                  onChange={e => setLessonName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="ej. Conversación de Inmersión B2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as LessonDifficulty)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Fácil (Easy)</option>
                    <option value="medium">Media (Medium)</option>
                    <option value="hard">Difícil (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={duration}
                    onChange={e => setDuration(parseInt(e.target.value, 10) || 30)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Puntos Logro
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={points}
                    onChange={e => setPoints(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-500 transition-colors"
                >
                  Registrar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
