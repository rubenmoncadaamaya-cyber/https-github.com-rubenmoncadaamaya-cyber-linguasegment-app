import React, { useState } from 'react';
import {
  StudentProfile,
  ScheduledClass,
  StudentEvaluation,
  ClassConfigTemplate,
  CEFRLevel,
  EvaluationScores,
  EvaluationPerformance
} from '../types';
import {
  CLASS_CONFIG_TEMPLATES,
  generateClassesCSVTemplate,
  generateEvaluationsCSVTemplate
} from '../data/classTemplatesData';
import { dispatchAlertAction } from '../services/alertService';
import {
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Video,
  FileSpreadsheet,
  MessageSquare,
  Mail,
  Search,
  Sparkles,
  Sliders,
  Users,
  Target,
  FileText,
  Copy,
  ChevronRight,
  Send,
  HelpCircle
} from 'lucide-react';

interface TeacherAcademicViewProps {
  students: StudentProfile[];
  classes: ScheduledClass[];
  evaluations: StudentEvaluation[];
  onAddClass: (newClass: Omit<ScheduledClass, 'id' | 'attendeesCount' | 'status' | 'remindersSent'>) => void;
  onAddEvaluation: (evaluation: StudentEvaluation) => void;
  onSendTestReminder: (classItem: ScheduledClass, channel: 'push' | 'email' | 'whatsapp') => void;
}

export const TeacherAcademicView: React.FC<TeacherAcademicViewProps> = ({
  students,
  classes,
  evaluations,
  onAddClass,
  onAddEvaluation,
  onSendTestReminder
}) => {
  const [activeTab, setActiveTab] = useState<'classes_config' | 'evaluations_rubric' | 'placement_test'>('classes_config');

  // Class form state
  const [classTitle, setClassTitle] = useState('Club de Conversación & Debate de Actualidad (B1/B2)');
  const [classLevel, setClassLevel] = useState<CEFRLevel | 'Todos'>('B1');
  const [classTopic, setClassTopic] = useState('Unidad 4: Argumentación, Modismos y Conectores de Causa/Efecto');
  const [classInstructor, setClassInstructor] = useState('Dra. Carmen Valenzuela');
  const [classDateTime, setClassDateTime] = useState('2025-01-26T18:00');
  const [classDuration, setClassDuration] = useState(55);
  const [classModality, setClassModality] = useState<'video_call' | 'in_person' | 'audio_lab'>('video_call');
  const [classCapacity, setClassCapacity] = useState(15);
  const [classMeetingUrl, setClassMeetingUrl] = useState('https://meet.google.com/lin-acad-demo');
  const [classObjectives, setClassObjectives] = useState('Expresar opiniones con fluidez y debatir noticias actuales.');

  // Evaluation form state
  const [evalStudentId, setEvalStudentId] = useState<number>(students[0]?.id || 1);
  const [evalLessonTopic, setEvalLessonTopic] = useState('Taller Práctico de Conversación y Fonética');
  const [evalCefrLevel, setEvalCefrLevel] = useState<CEFRLevel>('A2');
  const [evalScores, setEvalScores] = useState<EvaluationScores>({
    grammar: 82,
    pronunciation: 85,
    conversation: 88,
    listening: 90,
    vocabulary: 84,
    reading: 86
  });
  const [evalStrengths, setEvalStrengths] = useState('Fluidez natural en respuestas espontáneas y excelente comprensión auditiva.');
  const [evalGrowthAreas, setEvalGrowthAreas] = useState('Reforzar precisión en tiempos pasados irregulares y entonación de preguntas.');
  const [evalHomework, setEvalHomework] = useState('Grabar audio de 2 minutos describiendo un viaje pasado con conectores.');
  const [evalFeedback, setEvalFeedback] = useState('Progreso muy notable. Lista para avanzar a temas introductorios de nivel B1.');

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Calculate current average score
  const currentAverage = Math.round(
    (evalScores.grammar + evalScores.pronunciation + evalScores.conversation + evalScores.listening + evalScores.vocabulary + evalScores.reading) / 6
  );

  const currentPerformance: EvaluationPerformance =
    currentAverage >= 85 ? 'Sobresaliente' : currentAverage >= 70 ? 'Aprobado' : currentAverage >= 50 ? 'En Progreso' : 'Requiere Refuerzo';

  // Apply predefined template to class form
  const handleApplyTemplate = (tpl: ClassConfigTemplate) => {
    setClassTitle(tpl.name);
    setClassLevel(tpl.level);
    setClassTopic(tpl.curriculumUnit);
    setClassDuration(tpl.defaultDuration);
    setClassModality(tpl.defaultModality);
    setClassCapacity(tpl.defaultCapacity);
    setClassObjectives(tpl.learningObjectives.join('. '));
    setNotificationMsg(`Plantilla aplicada: "${tpl.name}". Datos prellenados con éxito.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Submit class creation
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClass({
      title: classTitle,
      topic: classTopic,
      instructor: classInstructor,
      dateTime: classDateTime,
      durationMinutes: classDuration,
      modality: classModality,
      targetType: 'all',
      targetLabel: `Nivel ${classLevel}`,
      level: classLevel,
      capacity: classCapacity,
      description: classObjectives,
      meetLink: classMeetingUrl
    });

    setNotificationMsg(`Clase "${classTitle}" creada y publicada en el catálogo.`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Submit evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === evalStudentId) || students[0];

    const newEval: StudentEvaluation = {
      id: `eval_${Date.now()}`,
      studentId: student.id,
      studentName: student.full_name,
      studentEmail: student.email,
      evaluatorName: 'Dra. Carmen Valenzuela',
      evaluationDate: new Date().toISOString().slice(0, 10),
      cefrLevel: evalCefrLevel,
      lessonTopic: evalLessonTopic,
      scores: { ...evalScores },
      averageScore: currentAverage,
      performance: currentPerformance,
      strengths: evalStrengths,
      growthAreas: evalGrowthAreas,
      assignedHomework: evalHomework,
      teacherFeedback: evalFeedback,
      attendanceStatus: 'Presente'
    };

    onAddEvaluation(newEval);
    setNotificationMsg(`Evaluación registrada para ${student.full_name} (${currentAverage}/100 · ${currentPerformance}).`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Send evaluation via WhatsApp
  const handleSendEvalWhatsApp = (ev: StudentEvaluation) => {
    const student = students.find(s => s.id === ev.studentId);
    const phone = '573105558899';
    const message =
`¡Hola ${ev.studentName}! 🌟

Compartimos tu evaluación pedagógica en *LinguaAcademy*:

📚 *Materia/Sesión:* ${ev.lessonTopic}
🎯 *Nivel evaluado:* ${ev.cefrLevel}
👨‍🏫 *Docente:* ${ev.evaluatorName}
📅 *Fecha:* ${ev.evaluationDate}

📊 *Rúbrica de Competencias:*
- Gramática: ${ev.scores.grammar}/100
- Pronunciación: ${ev.scores.pronunciation}/100
- Fluidez: ${ev.scores.conversation}/100
- Listening: ${ev.scores.listening}/100
- Vocabulario: ${ev.scores.vocabulary}/100
- Lectura: ${ev.scores.reading}/100

🏆 *Promedio Global:* *${ev.averageScore}/100* (${ev.performance})
✨ *Fortalezas:* ${ev.strengths}
🎯 *Área de Refuerzo:* ${ev.growthAreas}
📝 *Tarea Asignada:* ${ev.assignedHomework || 'Repasar material de clase'}
💬 *Comentario del Tutor:* "${ev.teacherFeedback}"

¡Continúa con tu excelente progreso!`;

    dispatchAlertAction('whatsapp', phone, `Reporte de Evaluación - ${ev.studentName}`, message);
    setNotificationMsg(`Evaluación de ${ev.studentName} abierta en WhatsApp.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Send evaluation via Email
  const handleSendEvalEmail = (ev: StudentEvaluation) => {
    const subject = `Evaluación Pedagógica - Nivel ${ev.cefrLevel}: ${ev.studentName}`;
    const body =
`Estimado(a) ${ev.studentName} y familia:

Adjuntamos el informe de desempeño de tu sesión de idiomas:

Materia: ${ev.lessonTopic}
Nivel: ${ev.cefrLevel}
Tutor evaluador: ${ev.evaluatorName}
Fecha: ${ev.evaluationDate}

PUNTAJES POR COMPETENCIA:
- Gramática & Estructura: ${ev.scores.grammar}/100
- Pronunciación & Fonética: ${ev.scores.pronunciation}/100
- Fluidez Conversacional: ${ev.scores.conversation}/100
- Comprensión Auditiva: ${ev.scores.listening}/100
- Vocabulario: ${ev.scores.vocabulary}/100
- Lectura: ${ev.scores.reading}/100

PROMEDIO GLOBAL: ${ev.averageScore}/100 (${ev.performance})

Fortalezas observadas: ${ev.strengths}
Oportunidades de mejora: ${ev.growthAreas}
Tarea / Reto semanal: ${ev.assignedHomework || 'N/A'}
Observaciones del docente: "${ev.teacherFeedback}"

Cordialmente,
Coordinación Académica · LinguaAcademy`;

    dispatchAlertAction('email', ev.studentEmail, subject, body);
    setNotificationMsg(`Plantilla de correo generada para ${ev.studentEmail}.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Download CSV Templates
  const handleDownloadClassesCSV = () => {
    const csv = generateClassesCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Configuracion_Clases.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadEvaluationsCSV = () => {
    const csv = generateEvaluationsCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Evaluacion_Alumnos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Módulo de Profesor / Tutor Académico</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Plantillas Pedagógicas, Clases & Rúbricas de Evaluación
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-0.5 max-w-2xl">
            Configura clases por niveles con plantillas estándar, registra evaluaciones por competencias lingüísticas y notifica resultados directamente por WhatsApp y Correo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadClassesCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Descargar plantilla de clases en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Plantilla Clases CSV</span>
          </button>

          <button
            onClick={handleDownloadEvaluationsCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Descargar plantilla de evaluaciones en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plantilla Rúbricas CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('classes_config')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'classes_config'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Configurar Clases & Plantillas de Horarios ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations_rubric')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'evaluations_rubric'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Plantilla de Evaluaciones & Rúbricas ({evaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('placement_test')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'placement_test'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Diagnóstico de Nivel & Placement Test</span>
        </button>
      </div>

      {/* TAB 1: CONFIGURAR CLASES & PLANTILLAS */}
      {activeTab === 'classes_config' && (
        <div className="space-y-6">
          {/* Quick Predefined Templates Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Plantillas Curriculares Predefinidas (Toca para cargar con 1 clic):</span>
              </h3>
              <span className="text-[11px] text-slate-500">6 plantillas listas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CLASS_CONFIG_TEMPLATES.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Nivel {tpl.level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{tpl.defaultDuration} min</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {tpl.curriculumUnit}
                  </p>
                  <div className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 pt-1">
                    <span>Usar esta plantilla</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Configuration Form */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Formulario de Configuración y Publicación de Clase</span>
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Título de la Clase: *</label>
                  <input
                    type="text"
                    required
                    value={classTitle}
                    onChange={e => setClassTitle(e.target.value)}
                    placeholder="Ej. Club de Conversación B1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel Académico (MCER): *</label>
                  <select
                    value={classLevel}
                    onChange={e => setClassLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="A1">Nivel A1 · Principiante</option>
                    <option value="A2">Nivel A2 · Básico</option>
                    <option value="B1">Nivel B1 · Pre-intermedio</option>
                    <option value="B2">Nivel B2 · Intermedio Alto</option>
                    <option value="C1">Nivel C1 · Dominio Avanzado</option>
                    <option value="Todos">Multinivel / Todos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Materia / Unidad Curricular: *</label>
                  <input
                    type="text"
                    required
                    value={classTopic}
                    onChange={e => setClassTopic(e.target.value)}
                    placeholder="Ej. Tiempos Pasados y Conectores"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Profesor / Tutor a Cargo: *</label>
                  <input
                    type="text"
                    required
                    value={classInstructor}
                    onChange={e => setClassInstructor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha y Hora: *</label>
                  <input
                    type="datetime-local"
                    required
                    value={classDateTime}
                    onChange={e => setClassDateTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duración (Minutos):</label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={classDuration}
                    onChange={e => setClassDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cupo Máximo:</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={classCapacity}
                    onChange={e => setClassCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modalidad:</label>
                  <select
                    value={classModality}
                    onChange={e => setClassModality(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="video_call">Videollamada en Vivo</option>
                    <option value="audio_lab">Laboratorio de Audio</option>
                    <option value="in_person">Presencial en Sede</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Enlace de Videollamada (Meet / Zoom):</label>
                  <input
                    type="url"
                    value={classMeetingUrl}
                    onChange={e => setClassMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Objetivos Pedagógicos:</label>
                  <input
                    type="text"
                    value={classObjectives}
                    onChange={e => setClassObjectives(e.target.value)}
                    placeholder="Metas de aprendizaje esperadas..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-slate-500">
                  La clase se sincronizará automáticamente en el Portal de Alumnos para que puedan inscribirse.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Clase en el Sistema</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PLANTILLA DE EVALUACIONES Y RÚBRICAS */}
      {activeTab === 'evaluations_rubric' && (
        <div className="space-y-6">
          {/* Evaluation Form */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Plantilla de Rúbrica de Evaluación por Competencias</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Evalúa las 6 dimensiones lingüísticas de 1 a 100 y genera la retroalimentación cualitativa.
                </p>
              </div>

              {/* Dynamic Overall Score Indicator */}
              <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Promedio Ponderado</span>
                  <span className={`text-lg font-black font-mono ${
                    currentAverage >= 85 ? 'text-emerald-400' : currentAverage >= 70 ? 'text-indigo-400' : 'text-amber-400'
                  }`}>
                    {currentAverage} / 100
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                  currentPerformance === 'Sobresaliente' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  currentPerformance === 'Aprobado' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {currentPerformance}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estudiante a Evaluar: *</label>
                  <select
                    value={evalStudentId}
                    onChange={e => {
                      const id = Number(e.target.value);
                      setEvalStudentId(id);
                      const std = students.find(s => s.id === id);
                      if (std) setEvalCefrLevel(std.cefrLevel);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {students.slice(0, 30).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} · Nivel {s.cefrLevel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel MCER Evaluado:</label>
                  <select
                    value={evalCefrLevel}
                    onChange={e => setEvalCefrLevel(e.target.value as CEFRLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="A1">A1 · Principiante</option>
                    <option value="A2">A2 · Básico</option>
                    <option value="B1">B1 · Pre-intermedio</option>
                    <option value="B2">B2 · Intermedio Alto</option>
                    <option value="C1">C1 · Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sesión / Lección Evaluada:</label>
                  <input
                    type="text"
                    required
                    value={evalLessonTopic}
                    onChange={e => setEvalLessonTopic(e.target.value)}
                    placeholder="Ej. Taller de Fonética y Fluidez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 6 Competencies Sliders */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                  Rúbrica de 6 Competencias Lingüísticas (1 a 100):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'grammar', label: '1. Gramática & Sintaxis' },
                    { key: 'pronunciation', label: '2. Pronunciación & Fonética' },
                    { key: 'conversation', label: '3. Fluidez Conversacional' },
                    { key: 'listening', label: '4. Comprensión Auditiva' },
                    { key: 'vocabulary', label: '5. Riqueza de Vocabulario' },
                    { key: 'reading', label: '6. Comprensión Lectora' }
                  ].map(item => {
                    const k = item.key as keyof EvaluationScores;
                    const val = evalScores[k];

                    return (
                      <div key={item.key} className="space-y-1.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{item.label}</span>
                          <span className="text-indigo-400 font-mono font-bold">{val}/100</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={val}
                          onChange={e => setEvalScores({ ...evalScores, [k]: Number(e.target.value) })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fortalezas Observadas: *</label>
                  <textarea
                    rows={2}
                    required
                    value={evalStrengths}
                    onChange={e => setEvalStrengths(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Oportunidades de Mejora / Refuerzo: *</label>
                  <textarea
                    rows={2}
                    required
                    value={evalGrowthAreas}
                    onChange={e => setEvalGrowthAreas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tarea o Reto Pedagógico Asignado:</label>
                  <input
                    type="text"
                    value={evalHomework}
                    onChange={e => setEvalHomework(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Comentario Final del Docente:</label>
                  <input
                    type="text"
                    value={evalFeedback}
                    onChange={e => setEvalFeedback(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Guardar Evaluación en Historial</span>
                </button>
              </div>
            </form>
          </div>

          {/* Evaluations History Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Historial de Evaluaciones Registradas ({evaluations.length})</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-md">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-3 py-3">Nivel</th>
                    <th className="px-3 py-3">Lección / Materia</th>
                    <th className="px-3 py-3">Puntaje</th>
                    <th className="px-3 py-3">Desempeño</th>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Notificar al Alumno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {evaluations.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{ev.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{ev.studentEmail}</div>
                      </td>

                      <td className="px-3 py-3 font-mono font-bold text-indigo-400">
                        {ev.cefrLevel}
                      </td>

                      <td className="px-3 py-3 text-slate-200">
                        <div className="line-clamp-1">{ev.lessonTopic}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{ev.teacherFeedback}</div>
                      </td>

                      <td className="px-3 py-3 font-mono font-bold text-white">
                        {ev.averageScore}/100
                      </td>

                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          ev.performance === 'Sobresaliente' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          ev.performance === 'Aprobado' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ev.performance}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-[11px] text-slate-400 font-mono">
                        {ev.evaluationDate}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendEvalWhatsApp(ev)}
                            className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Enviar rúbrica completa a WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleSendEvalEmail(ev)}
                            className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Enviar reporte formal por correo"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Correo</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTICO INICIAL & PLACEMENT TEST */}
      {activeTab === 'placement_test' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Plantilla de Diagnóstico Inicial & Placement Test de Admisión
              </h3>
              <p className="text-xs text-slate-400">
                Determina el nivel MCER de partida para un nuevo alumno o prospecto comercial antes de agendar clases.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">1. Diagnóstico Escrito & Gramática</span>
              <p className="text-[11px] text-slate-400">
                25 preguntas de opción múltiple para medir dominio de estructuras desde A1 hasta C1.
              </p>
              <div className="text-[10px] text-indigo-400 font-mono">Tiempo estimado: 20 min</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">2. Entrevista Oral 1-a-1</span>
              <p className="text-[11px] text-slate-400">
                10 minutos de conversación espontánea evaluando naturalidad, fonética y respuesta inmediata.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono">Calificación por Rúbrica</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">3. Asignación de Grupo & Ruta</span>
              <p className="text-[11px] text-slate-400">
                Clasificación automática en el Clúster de Machine Learning y catálogo de clases disponible.
              </p>
              <div className="text-[10px] text-amber-400 font-mono">Generación de Certificado</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
