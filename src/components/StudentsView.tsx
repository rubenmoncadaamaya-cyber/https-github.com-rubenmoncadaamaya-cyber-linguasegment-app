import React, { useState, useMemo } from 'react';
import { StudentProfile, MLCluster, CEFRLevel, SubscriptionType } from '../types';
import { Search, ChevronRight, UserCheck, BookOpen, Clock, Award, Compass, X } from 'lucide-react';

interface StudentsViewProps {
  students: StudentProfile[];
  clusters: MLCluster[];
  selectedStudent: StudentProfile | null;
  onSelectStudent: (student: StudentProfile | null) => void;
  onNavigateToPersonalization: (student: StudentProfile) => void;
  onNavigateToSchedule: (student: StudentProfile) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  clusters,
  selectedStudent,
  onSelectStudent,
  onNavigateToPersonalization,
  onNavigateToSchedule
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [selectedCefrFilter, setSelectedCefrFilter] = useState<string>('all');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'lessons' | 'points' | 'difficulty' | 'recency'>('lessons');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch = 
          s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCluster = selectedClusterFilter === 'all' || s.clusterId === parseInt(selectedClusterFilter, 10);
        const matchesCefr = selectedCefrFilter === 'all' || s.cefrLevel === selectedCefrFilter;
        const matchesSub = selectedSubFilter === 'all' || s.subscription_type === selectedSubFilter;

        return matchesSearch && matchesCluster && matchesCefr && matchesSub;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'id') diff = a.id - b.id;
        else if (sortBy === 'lessons') diff = a.totalLessons - b.totalLessons;
        else if (sortBy === 'points') diff = a.totalPoints - b.totalPoints;
        else if (sortBy === 'difficulty') diff = a.difficultyScore - b.difficultyScore;
        else if (sortBy === 'recency') diff = a.recencyDays - b.recencyDays;

        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [students, searchTerm, selectedClusterFilter, selectedCefrFilter, selectedSubFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filters Bar */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Mostrando: <strong className="text-white font-mono tabular-nums">{filteredStudents.length}</strong> de {students.length} estudiantes</span>
          </div>
        </div>

        {/* Dropdowns Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Segmento ML</label>
            <select
              value={selectedClusterFilter}
              onChange={e => { setSelectedClusterFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los Segmentos</option>
              {clusters.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.size})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Nivel CEFR</label>
            <select
              value={selectedCefrFilter}
              onChange={e => { setSelectedCefrFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los Niveles</option>
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Plan de Suscripción</label>
            <select
              value={selectedSubFilter}
              onChange={e => { setSelectedSubFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los Planes</option>
              {(['free', 'basic', 'premium'] as SubscriptionType[]).map(sub => (
                <option key={sub} value={sub}>{sub.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Ordenar por</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="lessons">Lecciones Completadas</option>
              <option value="points">Puntos de Logros</option>
              <option value="difficulty">Dificultad Promedio</option>
              <option value="recency">Días de Inactividad</option>
              <option value="id">ID de Estudiante</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th 
                  onClick={() => toggleSort('id')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white"
                >
                  ID {sortBy === 'id' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="py-2.5 px-3">Alumno</th>
                <th className="py-2.5 px-3">Segmento ML</th>
                <th className="py-2.5 px-3 text-center">Nivel CEFR</th>
                <th className="py-2.5 px-3 text-center">Plan</th>
                <th 
                  onClick={() => toggleSort('lessons')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  Lecciones {sortBy === 'lessons' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  onClick={() => toggleSort('difficulty')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  Dificultad {sortBy === 'difficulty' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  onClick={() => toggleSort('points')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  Puntos {sortBy === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  onClick={() => toggleSort('recency')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  Inactividad {sortBy === 'recency' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
              {paginatedStudents.map(student => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-indigo-950/40 hover:bg-indigo-950/60' 
                        : 'hover:bg-slate-850/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-500 font-semibold">
                      #{student.id}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-white">{student.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: student.clusterColor }} 
                        />
                        <span className="font-medium text-slate-200">{student.clusterName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {student.cefrLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center uppercase text-[10px] text-slate-400 font-sans">
                      {student.subscription_type}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {student.totalLessons}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={student.difficultyScore >= 2.3 ? 'text-rose-400' : student.difficultyScore >= 1.8 ? 'text-amber-400' : 'text-emerald-400'}>
                        {student.difficultyScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400">
                      {student.totalPoints}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={student.recencyDays > 60 ? 'text-rose-400' : 'text-slate-400'}>
                        {student.recencyDays}d
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(student);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        title="Ver Diagnóstico"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Página <span className="font-mono tabular-nums text-white">{page}</span> de <span className="font-mono tabular-nums">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Selected Student Detail Drawer */}
      {selectedStudent && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-5">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {selectedStudent.full_name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                    Nivel {selectedStudent.cefrLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedStudent.email} · ID #{selectedStudent.id}
                </p>
              </div>
              <button
                onClick={() => onSelectStudent(null)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segment Badge */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-mono block">Segmento ML Asignado</span>
                <span className="font-semibold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedStudent.clusterColor }} />
                  {selectedStudent.clusterName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-mono block">Plan</span>
                <span className="font-bold text-indigo-400 text-xs uppercase">{selectedStudent.subscription_type}</span>
              </div>
            </div>

            {/* Mensualidad & Pago Bre-B */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono uppercase block font-semibold">Mensualidad Institucional</span>
                <span className="text-sm font-bold text-white font-mono">$200.000 COP / mes</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Canales 0% Comisión</span>
                <span className="text-xs font-bold text-amber-400">Bre-B • Nequi • Daviplata</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1 text-slate-500 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lecciones</span>
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {selectedStudent.totalLessons}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selectedStudent.hardLessonsCount} difíciles
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dedicación</span>
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {Math.round(selectedStudent.totalDurationMinutes / 60)}h
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selectedStudent.avgLessonDuration} min/lecc
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1 text-slate-500 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Logros</span>
                </div>
                <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                  {selectedStudent.totalPoints}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selectedStudent.totalAchievements} trofeos
                </div>
              </div>
            </div>

            {/* Skills Radar / Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Perfil de Competencias Lingüísticas</span>
              </h4>

              <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                {Object.entries(selectedStudent.skills).map(([skill, score]) => {
                  const names: Record<string, string> = {
                    grammar: 'Gramática',
                    conversation: 'Conversación',
                    vocabulary: 'Vocabulario',
                    listening: 'Comprensión Auditiva',
                    reading: 'Lectura',
                    pronunciation: 'Pronunciación',
                    culture: 'Cultura',
                    idioms: 'Modismos (Idioms)'
                  };

                  return (
                    <div key={skill} className="space-y-0.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>{names[skill] || skill}</span>
                        <span className="font-mono text-white font-semibold">{score}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inactivity Warning if relevant */}
            {selectedStudent.recencyDays > 60 && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-xs text-rose-200">
                <strong className="block text-rose-100 font-semibold mb-0.5">
                  Alerta de Estancamiento
                </strong>
                El estudiante no registra actividad desde hace {selectedStudent.recencyDays} días (última sesión: {selectedStudent.lastActivityDate}). Se aconseja agendar una tutoría de reactivación.
              </div>
            )}
          </div>

          {/* Action Buttons at bottom of Drawer */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onNavigateToPersonalization(selectedStudent);
              }}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Ver y Generar Plan de Lecciones Personalizado</span>
            </button>
            <button
              onClick={() => {
                onNavigateToSchedule(selectedStudent);
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Compass className="w-4 h-4" />
              <span>Agendar Clase de Nivelación Directa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
