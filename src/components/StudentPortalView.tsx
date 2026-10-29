import React, { useState } from 'react';
import {
  StudentProfile,
  ScheduledClass,
  PaymentRecord,
  CEFRLevel
} from '../types';
import { formatCOP } from '../services/paymentService';
import {
  dispatchAlertAction,
  AlertTemplates
} from '../services/alertService';
import {
  Calendar,
  Clock,
  Video,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle,
  Circle,
  Baby,
  Smile,
  Volume2,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Target,
  MessageSquare,
  Mail,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StudentPortalViewProps {
  student: StudentProfile;
  classes: ScheduledClass[];
  payment?: PaymentRecord;
  onRecordPracticeLesson?: (lessonName: string, duration: number, points: number) => void;
  onReportPayment?: () => void;
  onToggleEnrollClass?: (classId: string) => void;
  onOpenAlertCenter?: (type?: 'class_reminder' | 'payment_bre_b' | 'enrollment_confirmation' | 'diagnostic_report', cls?: ScheduledClass) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  classes,
  payment,
  onRecordPracticeLesson,
  onReportPayment,
  onToggleEnrollClass,
  onOpenAlertCenter
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'progress' | 'homework' | 'kids' | 'payment'>('classes');
  const [levelFilter, setLevelFilter] = useState<CEFRLevel | 'Todos' | 'MiNivel'>('MiNivel');
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    task_1: true,
    task_2: false,
    task_3: false
  });

  const [activeKidActivity, setActiveKidActivity] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // Student is considered enrolled in a class if:
  // 1. Their ID is in enrolledStudentIds
  // 2. Or the class targetId matches their student ID
  // 3. Or it's a general class assigned to all
  const isStudentEnrolled = (cls: ScheduledClass): boolean => {
    if (cls.enrolledStudentIds && cls.enrolledStudentIds.includes(student.id)) {
      return true;
    }
    if (cls.targetType === 'student' && cls.targetId === student.id) {
      return true;
    }
    return false;
  };

  // Classes student is enrolled in
  const myEnrolledClasses = classes.filter(c => isStudentEnrolled(c));

  // Available classes according to selected filter
  const availableClasses = classes.filter(cls => {
    if (levelFilter === 'MiNivel') {
      return cls.level === student.cefrLevel || cls.level === 'Todos' || !cls.level;
    }
    if (levelFilter === 'Todos') {
      return true;
    }
    return cls.level === levelFilter || cls.level === 'Todos';
  });

  const handleEnrollClick = (cls: ScheduledClass) => {
    if (onToggleEnrollClass) {
      onToggleEnrollClass(cls.id);
    }
  };

  const handleQuickWhatsAppAlert = (cls: ScheduledClass) => {
    const { subject, message } = AlertTemplates.classReminder(cls, student.full_name);
    dispatchAlertAction('whatsapp', '3105558899', subject, message);
    setAlertFeedback(`Recordatorio WhatsApp abierto para la clase: ${cls.title}`);
    setTimeout(() => setAlertFeedback(null), 4000);
  };

  const handleQuickEmailAlert = (cls: ScheduledClass) => {
    const { subject, message } = AlertTemplates.classReminder(cls, student.full_name);
    dispatchAlertAction('email', student.email, subject, message);
    setAlertFeedback(`Plantilla de correo generada para ${student.email}`);
    setTimeout(() => setAlertFeedback(null), 4000);
  };

  const handleSendReportWhatsApp = () => {
    const { subject, message } = AlertTemplates.diagnosticReport(student);
    dispatchAlertAction('whatsapp', '3105558899', subject, message);
    setAlertFeedback('Reporte pedagógico abierto en WhatsApp');
    setTimeout(() => setAlertFeedback(null), 4000);
  };

  const homeworkList = [
    {
      id: 'task_1',
      title: 'Grabación de Audio: Presentación Personal (2 min)',
      dueDate: 'Mañana, 23:59',
      topic: 'Fluidez y Conectores B2',
      points: 25,
      skill: 'Conversación'
    },
    {
      id: 'task_2',
      title: 'Taller de Fonética: Pares Mínimos /th/ y /d/',
      dueDate: 'Viernes 25 de Enero',
      topic: 'Pronunciación y Enlace',
      points: 30,
      skill: 'Pronunciación'
    },
    {
      id: 'task_3',
      title: 'Lectura Comprensiva y 5 Preguntas de Inferencia',
      dueDate: 'Domingo 27 de Enero',
      topic: 'Lectura Crítica & Vocabulario',
      points: 20,
      skill: 'Vocabulario'
    }
  ];

  // Kids Fun Activities
  const kidsActivities = [
    {
      id: 0,
      title: 'Fonética Lúdica de Animales: "The Bouncing Bear"',
      age: '4 a 8 años',
      description: 'Aprende los sonidos de las letras con rimas musicales y movimientos corporales.',
      soundHook: '/b/ - Bear, Ball, Bounce, Blue!',
      rhyme: 'Big brown bear bounces high, reaches up into the sky! /b/ /b/ bear!',
      points: 15,
      words: ['Bear', 'Bounce', 'Big', 'Blue', 'Ball']
    },
    {
      id: 1,
      title: 'Cuento Interactivo: "The Lost Star in the Clouds"',
      age: '6 a 10 años',
      description: 'Historia ilustrada con preguntas guiadas para expandir vocabulario natural.',
      soundHook: 'Star, Sky, Shine, Smile!',
      rhyme: 'Twinkle, twinkle little star, how I wonder what you are! Let us fly together!',
      points: 20,
      words: ['Star', 'Cloud', 'Night', 'Glow', 'Moon']
    },
    {
      id: 2,
      title: 'Desafío de Rimas & Ritmo: "Rainbow Rhymes"',
      age: '5 a 12 años',
      description: 'Juego de parejas fonéticas y canciones de colores para entrenar el oído bilingüe.',
      soundHook: 'Red bed, Green bean, Blue shoe!',
      rhyme: 'Red on my bed, green in the trees, blue in the ocean, buzzing like bees!',
      points: 25,
      words: ['Rainbow', 'Purple', 'Yellow', 'Green', 'Orange']
    }
  ];

  const handleSimulateKidsPractice = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
      setPracticeCompleted(true);
      if (onRecordPracticeLesson) {
        onRecordPracticeLesson(kidsActivities[activeKidActivity].title, 15, kidsActivities[activeKidActivity].points);
      }
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Alert Dispatch Feedback Notification Banner */}
      {alertFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertFeedback}</span>
          </div>
          <button
            onClick={() => setAlertFeedback(null)}
            className="text-xs text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal de Alumnos & Familias · LinguaAcademy</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              ¡Hola, {student.full_name}! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Nivel actual: <strong className="text-indigo-400 font-mono font-bold">{student.cefrLevel}</strong> · Segmento: <span className="text-slate-200">{student.clusterName}</span> · {student.totalLessons} lecciones completadas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Puntos Acumulados</span>
              <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                {student.totalPoints} pts
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Student Portal */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'classes'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Clases por Nivel & Inscripciones ({myEnrolledClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'progress'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Mi Progreso & Habilidades</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'homework'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tareas & Retos Semanales</span>
        </button>

        <button
          onClick={() => setActiveTab('kids')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'kids'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-emerald-400 hover:text-white hover:bg-slate-850 border border-emerald-500/20'
          }`}
        >
          <Baby className="w-4 h-4 text-amber-300" />
          <span>Enseñanza Infantil & Lúdico (Kids)</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'payment'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Mi Mensualidad (Bre-B / Nequi)</span>
        </button>
      </div>

      {/* TAB 1: CLASES POR NIVEL & INSCRIPCIONES */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* SECTION A: Mis Clases Confirmadas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mis Clases Confirmadas en Horario ({myEnrolledClasses.length})</span>
              </h2>
              <span className="text-xs text-slate-400">
                Tu cupo está reservado
              </span>
            </div>

            {myEnrolledClasses.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Aún no estás inscrito en ninguna clase de este período.
                </p>
                <p className="text-xs text-indigo-400 font-medium">
                  👇 Explora abajo las clases recomendadas para tu nivel {student.cefrLevel} e inscríbete con un solo clic.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEnrolledClasses.map(cls => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all space-y-3 shadow-md relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            Nivel {cls.level || student.cefrLevel} · Inscrito
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {cls.modality === 'video_call' ? 'Videollamada' : 'Audio Lab'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                          {cls.title}
                        </h3>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" title="Confirmada" />
                    </div>

                    <p className="text-xs text-slate-400">
                      Materia: {cls.topic}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{new Date(cls.dateTime).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(cls.dateTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{cls.durationMinutes} min · {cls.instructor}</span>
                      </div>
                    </div>

                    {/* Alert & Reminder Triggers */}
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickWhatsAppAlert(cls)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                          title="Recibir o reenviar recordatorio a WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 fill-current" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickEmailAlert(cls)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                          title="Enviar detalles a mi correo"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Correo</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEnrollClick(cls)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                          title="Liberar tu cupo en esta clase"
                        >
                          Cancelar cupo
                        </button>

                        <button
                          type="button"
                          onClick={() => alert(`Conectando a la sala en vivo de "${cls.title}" con ${cls.instructor}...`)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Entrar a Clase</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION B: Catálogo de Clases Disponibles según Nivel Académico */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Catálogo de Clases Disponibles según Nivel Académico</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecciona tu nivel o explora otros horarios propuestos para inscribirte de inmediato.
                </p>
              </div>

              {onOpenAlertCenter && (
                <button
                  type="button"
                  onClick={() => onOpenAlertCenter('class_reminder')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar Alerta a WhatsApp</span>
                </button>
              )}
            </div>

            {/* Level Filter Tabs */}
            <div className="flex overflow-x-auto gap-1.5 pb-1 text-xs font-semibold scrollbar-none">
              <button
                onClick={() => setLevelFilter('MiNivel')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  levelFilter === 'MiNivel'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Recomendadas para Mi Nivel ({student.cefrLevel})</span>
              </button>

              {(['A1', 'A2', 'B1', 'B2', 'C1', 'Todos'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    levelFilter === lvl
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'Todos' ? 'Todas' : `Nivel ${lvl}`}
                </button>
              ))}
            </div>

            {/* Available Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableClasses.map(cls => {
                const enrolled = isStudentEnrolled(cls);
                const capacity = cls.capacity || 15;
                const currentCount = cls.enrolledStudentIds?.length || cls.attendeesCount || 0;
                const spotsLeft = Math.max(0, capacity - currentCount);
                const percentFull = Math.min(100, Math.round((currentCount / capacity) * 100));

                return (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      enrolled
                        ? 'bg-slate-900/90 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {cls.level ? `Nivel ${cls.level}` : 'Multinivel'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {cls.durationMinutes} min
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {cls.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {cls.topic}
                      </p>

                      <div className="space-y-1 text-xs pt-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{new Date(cls.dateTime).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} a las {new Date(cls.dateTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>Prof. {cls.instructor}</span>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Cupos Disponibles:</span>
                          <span className={`font-mono font-bold ${spotsLeft <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {spotsLeft} de {capacity} libres
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              spotsLeft <= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subscription Button */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {enrolled ? (
                        <div className="space-y-2">
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Inscrito en este horario</span>
                            </span>
                            <button
                              onClick={() => handleEnrollClick(cls)}
                              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              onClick={() => handleQuickWhatsAppAlert(cls)}
                              className="py-1.5 px-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 fill-current" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleQuickEmailAlert(cls)}
                              className="py-1.5 px-2 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center justify-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Correo</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollClick(cls)}
                          disabled={spotsLeft === 0}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            spotsLeft === 0
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{spotsLeft === 0 ? 'Cupos Agotados' : 'Inscribirme en este Horario'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MI PROGRESO & HABILIDADES */}
      {activeTab === 'progress' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">Resumen Pedagógico de Competencias</h3>
            <button
              onClick={handleSendReportWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>Enviar Reporte a WhatsApp</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Nivel MCER (CEFR)</span>
              <div className="text-3xl font-black text-indigo-400 font-mono">
                {student.cefrLevel}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Marco Común Europeo</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Lecciones</span>
              <div className="text-3xl font-black text-white font-mono">
                {student.totalLessons}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{((student.totalDurationMinutes || 0) / 60).toFixed(1)} horas de práctica</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Dificultad Promedio</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {student.difficultyScore.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 3.0</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{Math.round(student.hardRatio * 100)}% lecciones complejas</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Racha & Logros</span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {student.totalAchievements}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{student.totalPoints} puntos ganados</p>
            </div>
          </div>

          {/* Detailed Skill Breakdown */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Desglose de Competencias Lingüísticas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(student.skills).map(([skill, score]) => {
                const labels: Record<string, string> = {
                  grammar: 'Gramática & Sintaxis',
                  conversation: 'Fluidez Conversacional',
                  vocabulary: 'Riqueza de Vocabulario',
                  listening: 'Comprensión Auditiva',
                  reading: 'Lectura Comprensiva',
                  pronunciation: 'Pronunciación & Fonética',
                  culture: 'Competencia Intercultural',
                  idioms: 'Modismos & Expresiones'
                };

                return (
                  <div key={skill} className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{labels[skill] || skill}</span>
                      <strong className="text-indigo-400 font-mono">{score}/100</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TAREAS & RETOS SEMANALES */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Asignaciones y Ejercicios Prácticos</span>
            </h2>
            <span className="text-xs text-slate-400">
              Completa tareas para sumar puntos y desbloquear insignias
            </span>
          </div>

          <div className="space-y-3">
            {homeworkList.map(task => {
              const isDone = completedTasks[task.id];

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setCompletedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors"
                      title={isDone ? "Marcar como pendiente" : "Marcar como completada"}
                    >
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>Materia: {task.topic}</span>
                        <span>·</span>
                        <span className="text-amber-400 font-mono">+{task.points} pts</span>
                        <span>·</span>
                        <span className="text-rose-400">Entrega: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setCompletedTasks(prev => ({ ...prev, [task.id]: true }));
                        alert(`¡Tarea enviada con éxito! Has ganado ${task.points} puntos.`);
                      }}
                      disabled={isDone}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isDone
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <span>{isDone ? 'Completada' : 'Subir Respuesta'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ENSEÑANZA INFANTIL & LECCIONES LÚDICAS (KIDS) */}
      {activeTab === 'kids' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <Baby className="w-5 h-5 text-amber-300" />
              <span>Categoría Especial: Enseñanza Infantil & Fonética Lúdica (4 a 12 años)</span>
            </div>
            <p className="text-xs text-slate-300">
              Diseñado con pedagogía lúdica para los más pequeños: rimas sonoras, ritmo corporal, cuentos ilustrados y reforzamiento positivo sin frustración.
            </p>
          </div>

          {/* Activity selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kidsActivities.map((act, idx) => (
              <div
                key={act.id}
                onClick={() => {
                  setActiveKidActivity(idx);
                  setPracticeCompleted(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  activeKidActivity === idx
                    ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {act.age}
                  </span>
                  <span className="text-amber-400 text-xs font-mono font-bold">+{act.points} pts</span>
                </div>
                <h4 className="text-xs font-bold text-white">{act.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{act.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Player Box */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-emerald-400 uppercase font-mono font-bold">Actividad en Curso</span>
                <h3 className="text-base font-bold text-white">
                  {kidsActivities[activeKidActivity].title}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                <span>Modo Kids Activo</span>
              </span>
            </div>

            {/* Rhyme & Audio simulator */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-center">
              <span className="text-xs text-slate-400 block">Rima Sonora Repetitiva:</span>
              <p className="text-base md:text-lg font-bold text-emerald-300 font-sans tracking-wide">
                &ldquo;{kidsActivities[activeKidActivity].rhyme}&rdquo;
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-xs text-amber-300 font-mono border border-slate-800">
                Sonido fonético: {kidsActivities[activeKidActivity].soundHook}
              </div>
            </div>

            {/* Word Flashcards */}
            <div>
              <span className="text-xs text-slate-400 block mb-2 font-medium">Palabras mágicas para pronunciar:</span>
              <div className="flex flex-wrap gap-2">
                {kidsActivities[activeKidActivity].words.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => alert(`Pronunciando: "${w}"`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700 text-xs text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{w}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleSimulateKidsPractice}
                disabled={isPlayingAudio}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-amber-300' : ''}`} />
                <span>{isPlayingAudio ? 'Reproduciendo y Escuchando...' : 'Escuchar & Repetir (Audio)'}</span>
              </button>

              {practiceCompleted && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>¡Excelente práctica! +{kidsActivities[activeKidActivity].points} pts sumados.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MI MENSUALIDAD (BRE-B / NEQUI / DAVIPLATA) */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Estado de tu Cuota Mensual</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Mensualidad: {formatCOP(200000)} COP</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    payment?.status === 'pagado'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {payment?.status === 'pagado' ? 'Al Día (Pagado)' : 'Pendiente por Pagar'}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const { subject, message } = AlertTemplates.paymentBreB(student.full_name, 200000, payment?.dueDate, payment?.referenceNumber);
                    dispatchAlertAction('whatsapp', '3105558899', subject, message);
                  }}
                  className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Enviar comprobante o consultar por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Enviar por WhatsApp</span>
                </button>

                {onReportPayment && (
                  <button
                    onClick={onReportPayment}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Reportar Pago Realizado</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Canales Oficiales sin Comisión (0% Costo Bancario):</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Realiza tu pago en segundos desde cualquier banco colombiano o billetera digital usando los siguientes identificadores directos:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                <div className="p-2 rounded bg-slate-950 border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block font-sans">Llave Bre-B:</span>
                  <strong className="text-white">3105558899</strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block font-sans">Nequi:</span>
                  <strong className="text-white">310 555 8899</strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block font-sans">Daviplata:</span>
                  <strong className="text-white">310 555 8899</strong>
                </div>
              </div>
            </div>

            {payment && (
              <div className="pt-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <span>Período: <strong className="text-white">{payment.period}</strong></span>
                <span>Referencia: <code className="text-indigo-300 font-mono">{payment.referenceNumber || 'BREB-AUTO-2026'}</code></span>
                <span>Vencimiento: <strong className="text-slate-300">{payment.dueDate}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
