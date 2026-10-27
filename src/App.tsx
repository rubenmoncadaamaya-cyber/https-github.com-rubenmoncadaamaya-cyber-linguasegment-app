import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StudentProfile,
  MLCluster,
  MLConfig,
  RealtimeEvent,
  ScheduledClass,
  ReminderNotification,
  LessonDifficulty,
  MarketingProfile,
  MarketingCluster,
  MarketingSegmentationConfig,
  PaymentRecord
} from './types';
import { loadInitialDatasets } from './data/csvDataLoader';
import { runClustering, predictStudentCluster, DEFAULT_ML_CONFIG } from './services/mlEngine';
import {
  enrichWithMarketingAttributes,
  runMarketingSegmentation,
  DEFAULT_MARKETING_CONFIG
} from './services/marketingEngine';
import { initializeStudentPayments, formatCOP } from './services/paymentService';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { PersonalizationView } from './components/PersonalizationView';
import { MarketingView } from './components/MarketingView';
import { PaymentsView } from './components/PaymentsView';
import { SchedulingView } from './components/SchedulingView';
import { ReportsView } from './components/ReportsView';
import { NotificationToast, ToastData } from './components/NotificationToast';

const INITIAL_SCHEDULED_CLASSES: ScheduledClass[] = [
  {
    id: 'class_1',
    title: 'Taller de Fluidez y Modismos Idiomáticos B2/C1',
    topic: 'Expresiones coloquiales y conectores argumentativos',
    instructor: 'Dra. Carmen Valenzuela',
    dateTime: '2025-01-22T18:00',
    durationMinutes: 55,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 0,
    targetLabel: 'Segmento: Dominio Avanzado',
    attendeesCount: 14,
    status: 'scheduled',
    remindersSent: { email: true, push: true, lastSentAt: '2025-01-21 10:00' }
  },
  {
    id: 'class_2',
    title: 'Laboratorio de Fonética y Pronunciación Intensiva',
    topic: 'Pares mínimos y entonación de enlace (Connected Speech)',
    instructor: 'Prof. David Sterling',
    dateTime: '2025-01-23T16:30',
    durationMinutes: 45,
    modality: 'audio_lab',
    targetType: 'cluster',
    targetId: 1,
    targetLabel: 'Segmento: Constantes en Progreso',
    attendeesCount: 18,
    status: 'scheduled',
    remindersSent: { email: false, push: true, lastSentAt: '2025-01-22 14:00' }
  },
  {
    id: 'class_3',
    title: 'Sesión de Reactivación y Desbloqueo Lingüístico 1-a-1',
    topic: 'Diagnóstico conversacional sin presión para reanudar hábitos',
    instructor: 'Lic. Mateo Rivas',
    dateTime: '2025-01-24T19:00',
    durationMinutes: 30,
    modality: 'video_call',
    targetType: 'student',
    targetId: 2,
    targetLabel: 'Yara Schmidt (Alumno en Riesgo)',
    attendeesCount: 1,
    status: 'scheduled',
    remindersSent: { email: true, push: false, lastSentAt: '2025-01-23 09:00' }
  },
  {
    id: 'class_kids',
    title: 'Taller LinguaKids: Fonética Lúdica, Rimas y Cuentos (4-8 años)',
    topic: 'Enseñanza Infantil: Fonética Lúdica y Storytelling',
    instructor: 'Lic. Sofía Alarcón (Especialista Infantil)',
    dateTime: '2025-01-25T11:00',
    durationMinutes: 30,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 1,
    targetLabel: 'Enseñanza Infantil & Kids',
    attendeesCount: 16,
    status: 'scheduled',
    remindersSent: { email: true, push: true, lastSentAt: '2025-01-24 10:00' }
  }
];

const INITIAL_NOTIFICATIONS: ReminderNotification[] = [
  {
    id: 'notif_1',
    classId: 'class_1',
    classTitle: 'Taller de Fluidez y Modismos Idiomáticos B2/C1',
    channel: 'email',
    recipientName: 'Zara Hoffmann',
    recipientEmail: 'zara.hoffmann@example.net',
    subject: 'Recordatorio 24h: Tu clase con Dra. Carmen Valenzuela',
    message: 'Hola Zara, te esperamos mañana a las 18:00 para la sesión de modismos avanzados.',
    scheduledTime: '2025-01-21T18:00',
    status: 'enviado',
    sentAt: '2025-01-21 18:00'
  },
  {
    id: 'notif_2',
    classId: 'class_1',
    classTitle: 'Taller de Fluidez y Modismos Idiomáticos B2/C1',
    channel: 'push',
    recipientName: 'Mila Schneider',
    recipientEmail: 'mila.schneider@example.com',
    subject: 'Aviso de Clase en Directo',
    message: 'Tu sesión de Taller de Fluidez comienza en breve. ¡Prepara tus auriculares!',
    scheduledTime: '2025-01-22T17:45',
    status: 'enviado',
    sentAt: '2025-01-22 17:45'
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'students' | 'personalization' | 'marketing' | 'payments' | 'scheduling' | 'reports'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [clusters, setClusters] = useState<MLCluster[]>([]);
  const [mlConfig, setMlConfig] = useState<MLConfig>(DEFAULT_ML_CONFIG);
  const [inertia, setInertia] = useState(0);
  const [silhouetteScore, setSilhouetteScore] = useState(0);
  const [iterationsRun, setIterationsRun] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Colombian Payments & Bre-B / Wallets State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Marketing Segmentation State
  const [marketingProfiles, setMarketingProfiles] = useState<MarketingProfile[]>([]);
  const [marketingClusters, setMarketingClusters] = useState<MarketingCluster[]>([]);
  const [marketingConfig, setMarketingConfig] = useState<MarketingSegmentationConfig>(DEFAULT_MARKETING_CONFIG);
  const [isCustomCohort, setIsCustomCohort] = useState<boolean>(false);

  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [preselectedTopic, setPreselectedTopic] = useState<string | undefined>(undefined);

  // Real-time Event Stream & Simulation
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [liveSimulationActive, setLiveSimulationActive] = useState(true);

  // Scheduled classes & reminders
  const [classes, setClasses] = useState<ScheduledClass[]>(INITIAL_SCHEDULED_CLASSES);
  const [notifications, setNotifications] = useState<ReminderNotification[]>(INITIAL_NOTIFICATIONS);

  // In-app push notification toast
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  // Ref for latest students and clusters in interval
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const clustersRef = useRef(clusters);
  clustersRef.current = clusters;
  const mlConfigRef = useRef(mlConfig);
  mlConfigRef.current = mlConfig;
  const marketingConfigRef = useRef(marketingConfig);
  marketingConfigRef.current = marketingConfig;

  // Load initial dataset and execute first clustering run
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const { profiles } = await loadInitialDatasets();
        const clusterResult = runClustering(profiles, DEFAULT_ML_CONFIG);

        setStudents(clusterResult.profiles);
        setClusters(clusterResult.clusters);
        setInertia(clusterResult.inertia);
        setSilhouetteScore(clusterResult.silhouetteScore);
        setIterationsRun(clusterResult.iterationsRun);
        setSelectedStudent(clusterResult.profiles[0] || null);

        // Initialize Colombian Bre-B and digital wallet payments ($200.000 COP)
        const initialPayments = initializeStudentPayments(clusterResult.profiles);
        setPayments(initialPayments);

        // Initialize marketing segmentation with flexible attributes
        const initialMarketing = enrichWithMarketingAttributes(clusterResult.profiles);
        const { profiles: mktProfiles, clusters: mktClusters } = runMarketingSegmentation(
          initialMarketing,
          clusterResult.profiles,
          DEFAULT_MARKETING_CONFIG
        );
        setMarketingProfiles(mktProfiles);
        setMarketingClusters(mktClusters);

        // Prepopulate initial real-time events
        const sampleEvents: RealtimeEvent[] = [
          {
            id: 'evt_init_1',
            timestamp: 'Hace 2 min',
            studentId: 8,
            studentName: 'Mila Schneider',
            type: 'lesson_completed',
            description: 'Completó "culture dialogue" con calificación alta',
            duration: 49,
            difficulty: 'hard',
            deltaPoints: 45
          },
          {
            id: 'evt_init_2',
            timestamp: 'Hace 5 min',
            studentId: 27,
            studentName: 'Theo Diaz',
            type: 'achievement_unlocked',
            description: 'Desbloqueó trofeo "Mastery Level B2"',
            deltaPoints: 50
          },
          {
            id: 'evt_init_3',
            timestamp: 'Hace 8 min',
            studentId: 1,
            studentName: 'Zara Hoffmann',
            type: 'lesson_completed',
            description: 'Completó "vocabulary advanced writing"',
            duration: 46,
            difficulty: 'easy',
            deltaPoints: 30
          }
        ];
        setEvents(sampleEvents);
      } catch (err) {
        console.error('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Re-run clustering handler
  const handleRunClustering = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = runClustering(studentsRef.current, mlConfigRef.current);
      setStudents(result.profiles);
      setClusters(result.clusters);
      setInertia(result.inertia);
      setSilhouetteScore(result.silhouetteScore);
      setIterationsRun(result.iterationsRun);
      setIsCalculating(false);
    }, 150);
  }, []);

  // Real-time live ingestion simulator
  useEffect(() => {
    if (!liveSimulationActive || students.length === 0) return;

    const interval = setInterval(() => {
      const currentList = studentsRef.current;
      if (currentList.length === 0) return;

      // Select random student
      const randomIdx = Math.floor(Math.random() * currentList.length);
      const student = currentList[randomIdx];

      const lessonTopics = [
        { name: 'Debate de Actualidad y Modismos B2', diff: 'hard' as LessonDifficulty, dur: 55, pts: 60, skill: 'conversation' },
        { name: 'Laboratorio de Fonética: Fonemas Complejos', diff: 'medium' as LessonDifficulty, dur: 40, pts: 45, skill: 'pronunciation' },
        { name: 'Conectores Lógicos y Cláusulas Condicionales', diff: 'hard' as LessonDifficulty, dur: 50, pts: 55, skill: 'grammar' },
        { name: 'Comprensión Auditiva: Entrevistas TED', diff: 'medium' as LessonDifficulty, dur: 35, pts: 40, skill: 'listening' },
        { name: 'Expansión de Vocabulario: Negocios y Tech', diff: 'easy' as LessonDifficulty, dur: 30, pts: 35, skill: 'vocabulary' }
      ];

      const chosen = lessonTopics[Math.floor(Math.random() * lessonTopics.length)];

      // Update student profile in real-time
      const updatedTotalLessons = student.totalLessons + 1;
      const updatedDuration = student.totalDurationMinutes + chosen.dur;
      const updatedPoints = student.totalPoints + chosen.pts;
      const updatedHardCount = student.hardLessonsCount + (chosen.diff === 'hard' ? 1 : 0);
      const updatedHardRatio = Number((updatedHardCount / updatedTotalLessons).toFixed(2));
      const updatedDifficultyScore = Number((((student.difficultyScore * student.totalLessons) + (chosen.diff === 'hard' ? 3 : chosen.diff === 'medium' ? 2 : 1)) / updatedTotalLessons).toFixed(2));

      const updatedSkills = { ...student.skills };
      const skillKey = chosen.skill as keyof typeof updatedSkills;
      if (updatedSkills[skillKey] !== undefined) {
        updatedSkills[skillKey] = Math.min(98, updatedSkills[skillKey] + 4);
      }

      const updatedStudent: StudentProfile = {
        ...student,
        totalLessons: updatedTotalLessons,
        totalDurationMinutes: updatedDuration,
        totalPoints: updatedPoints,
        hardLessonsCount: updatedHardCount,
        hardRatio: updatedHardRatio,
        difficultyScore: updatedDifficultyScore,
        recencyDays: 0,
        lastActivityDate: new Date().toISOString().split('T')[0],
        skills: updatedSkills
      };

      // Real-time nearest centroid re-assignment
      const newCluster = predictStudentCluster(updatedStudent, clustersRef.current, mlConfigRef.current);
      const clusterChanged = newCluster.clusterId !== student.clusterId;

      updatedStudent.clusterId = newCluster.clusterId;
      updatedStudent.clusterName = newCluster.clusterName;
      updatedStudent.clusterColor = newCluster.clusterColor;

      // Update list
      const updatedList = [...currentList];
      updatedList[randomIdx] = updatedStudent;
      setStudents(updatedList);

      // Create new event
      const nowTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newEvent: RealtimeEvent = {
        id: `evt_${Date.now()}`,
        timestamp: nowTime,
        studentId: student.id,
        studentName: student.full_name,
        type: 'lesson_completed',
        description: `Completó "${chosen.name}" (${chosen.dur} min)`,
        difficulty: chosen.diff,
        duration: chosen.dur,
        deltaPoints: chosen.pts
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 24)]);

      // If cluster changed, also log promotion event
      if (clusterChanged) {
        const promotionEvent: RealtimeEvent = {
          id: `evt_promo_${Date.now()}`,
          timestamp: nowTime,
          studentId: student.id,
          studentName: student.full_name,
          type: 'cluster_reassigned',
          description: `Reclasificado por ML a "${newCluster.clusterName}"`
        };
        setEvents(prev => [promotionEvent, ...prev.slice(0, 24)]);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [liveSimulationActive, students.length]);

  // Record manual lesson
  const handleRecordManualLesson = useCallback((
    studentId: number,
    lessonName: string,
    difficulty: LessonDifficulty,
    duration: number,
    points: number
  ) => {
    const currentList = studentsRef.current;
    const sIdx = currentList.findIndex(s => s.id === studentId);
    if (sIdx === -1) return;

    const student = currentList[sIdx];
    const updatedTotalLessons = student.totalLessons + 1;
    const updatedHard = student.hardLessonsCount + (difficulty === 'hard' ? 1 : 0);

    const updatedStudent: StudentProfile = {
      ...student,
      totalLessons: updatedTotalLessons,
      totalDurationMinutes: student.totalDurationMinutes + duration,
      totalPoints: student.totalPoints + points,
      hardLessonsCount: updatedHard,
      hardRatio: Number((updatedHard / updatedTotalLessons).toFixed(2)),
      difficultyScore: Number((((student.difficultyScore * student.totalLessons) + (difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1)) / updatedTotalLessons).toFixed(2)),
      recencyDays: 0,
      lastActivityDate: new Date().toISOString().split('T')[0]
    };

    const newCluster = predictStudentCluster(updatedStudent, clustersRef.current, mlConfigRef.current);
    updatedStudent.clusterId = newCluster.clusterId;
    updatedStudent.clusterName = newCluster.clusterName;
    updatedStudent.clusterColor = newCluster.clusterColor;

    const newList = [...currentList];
    newList[sIdx] = updatedStudent;
    setStudents(newList);

    const nowTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const newEvent: RealtimeEvent = {
      id: `evt_manual_${Date.now()}`,
      timestamp: nowTime,
      studentId: student.id,
      studentName: student.full_name,
      type: 'lesson_completed',
      description: `Registró lección "${lessonName}"`,
      difficulty,
      duration,
      deltaPoints: points
    };

    setEvents(prev => [newEvent, ...prev.slice(0, 24)]);
  }, []);

  // Add new scheduled class
  const handleAddClass = useCallback((newClassData: Omit<ScheduledClass, 'id' | 'attendeesCount' | 'status' | 'remindersSent'>) => {
    const newClass: ScheduledClass = {
      ...newClassData,
      id: `class_${Date.now()}`,
      attendeesCount: newClassData.targetType === 'student' ? 1 : newClassData.targetType === 'cluster' ? 24 : students.length,
      status: 'scheduled',
      remindersSent: { email: false, push: false }
    };

    setClasses(prev => [newClass, ...prev]);

    // Show immediate confirmation push notification
    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Clase Agendada Exitosamente',
      body: `"${newClass.title}" con ${newClass.instructor}. Recordatorios programados.`,
      recipient: newClass.targetLabel,
      channel: 'push'
    });
  }, [students.length]);

  // Send test reminder (Push or Email)
  const handleSendTestReminder = useCallback((classItem: ScheduledClass, channel: 'push' | 'email') => {
    // Find recipient info
    let recipientName = classItem.targetLabel;
    let recipientEmail = 'alumnos@lingua-ai.edu';

    if (classItem.targetType === 'student' && classItem.targetId) {
      const student = students.find(s => s.id === classItem.targetId);
      if (student) {
        recipientName = student.full_name;
        recipientEmail = student.email;
      }
    }

    const dateStr = new Date(classItem.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const message = `Hola ${recipientName}, tu sesión de "${classItem.title}" con ${classItem.instructor} está programada para hoy a las ${dateStr}.`;

    // Add to notification history
    const newNotif: ReminderNotification = {
      id: `notif_${Date.now()}`,
      classId: classItem.id,
      classTitle: classItem.title,
      channel,
      recipientName,
      recipientEmail,
      subject: `Recordatorio: ${classItem.title}`,
      message,
      scheduledTime: new Date().toISOString(),
      status: 'enviado',
      sentAt: 'Ahora mismo'
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Update class reminder status
    setClasses(prev => prev.map(c => {
      if (c.id === classItem.id) {
        return {
          ...c,
          remindersSent: {
            ...c.remindersSent,
            [channel]: true,
            lastSentAt: 'Hoy'
          }
        };
      }
      return c;
    }));

    // Trigger Rich In-App Push Notification banner with audio chime
    setActiveToast({
      id: `toast_${Date.now()}`,
      title: channel === 'push' ? 'Notificación Push: Recordatorio de Clase' : 'Correo Transaccional Enviado',
      body: message,
      recipient: `${recipientName} (${recipientEmail})`,
      channel
    });
  }, [students]);

  // Navigate to Personalization tab with selected student
  const handleNavigateToPersonalization = useCallback((student: StudentProfile) => {
    setSelectedStudent(student);
    setCurrentTab('personalization');
  }, []);

  // Navigate to Scheduling tab with preselected student and topic
  const handleNavigateToSchedule = useCallback((student: StudentProfile, lessonTopic?: string) => {
    setSelectedStudent(student);
    setPreselectedTopic(lessonTopic);
    setCurrentTab('scheduling');
  }, []);

  // Handle re-clustering marketing profiles with updated config
  const handleMarketingRecluster = useCallback(() => {
    setMarketingProfiles(prev => {
      const { profiles: newProfiles, clusters: newClusters } = runMarketingSegmentation(
        prev,
        studentsRef.current,
        marketingConfigRef.current
      );
      setMarketingClusters(newClusters);
      return newProfiles;
    });
  }, []);

  // Handle uploading external lead list (CSV)
  const handleUploadMarketingProfiles = useCallback((newLeads: MarketingProfile[], mode: 'replace' | 'append') => {
    const targetProfiles = mode === 'replace' ? newLeads : [...marketingProfiles, ...newLeads];
    const { profiles: segmentedProfiles, clusters: segmentedClusters } = runMarketingSegmentation(
      targetProfiles,
      studentsRef.current,
      marketingConfigRef.current
    );
    setMarketingProfiles(segmentedProfiles);
    setMarketingClusters(segmentedClusters);
    setIsCustomCohort(true);

    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Base Comercial Segmentada con Éxito',
      body: `${newLeads.length} leads cargados (${mode === 'replace' ? 'reemplazando lista previa' : 'añadidos al padrón'}). Total activo: ${segmentedProfiles.length} prospectos.`,
      recipient: 'Módulo de Mercadeo',
      channel: 'push'
    });
  }, [marketingProfiles]);

  // Handle resetting back to original 200 users cohort
  const handleResetOriginalMarketingProfiles = useCallback(() => {
    const initialMarketing = enrichWithMarketingAttributes(studentsRef.current);
    const { profiles: mktProfiles, clusters: mktClusters } = runMarketingSegmentation(
      initialMarketing,
      studentsRef.current,
      marketingConfigRef.current
    );
    setMarketingProfiles(mktProfiles);
    setMarketingClusters(mktClusters);
    setIsCustomCohort(false);

    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Base Restablecida',
      body: 'Se ha restaurado el padrón original de los 200 estudiantes provistos con sus métricas completas.',
      recipient: 'Módulo de Mercadeo',
      channel: 'push'
    });
  }, []);


  // Handle updating a student's payment record (Bre-B / Nequi / Daviplata)
  const handleUpdatePayment = useCallback((updatedPayment: PaymentRecord) => {
    setPayments(prev => prev.map(p => (p.id === updatedPayment.id ? updatedPayment : p)));
    if (updatedPayment.status === 'pagado') {
      setActiveToast({
        id: `toast_${Date.now()}`,
        title: 'Mensualidad Confirmada (0% Comisión)',
        body: `Se registró el pago de ${formatCOP(updatedPayment.amountCOP)} de ${updatedPayment.studentName} vía ${updatedPayment.method || 'Bre-B'}. Ref: ${updatedPayment.referenceNumber || 'OK'}.`,
        recipient: updatedPayment.studentEmail,
        channel: 'push'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenScheduleModal={() => setCurrentTab('scheduling')}
        liveSimulationActive={liveSimulationActive}
        onToggleSimulation={() => setLiveSimulationActive(prev => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-base font-bold text-white">
              Cargando Base de Datos y Ejecutando K-Means Clustering...
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              Procesando los 200 estudiantes, 800 lecciones y 400 logros provistos en los datasets adjuntos.
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                students={students}
                clusters={clusters}
                mlConfig={mlConfig}
                onChangeMLConfig={setMlConfig}
                onRunClustering={handleRunClustering}
                inertia={inertia}
                silhouetteScore={silhouetteScore}
                iterationsRun={iterationsRun}
                isCalculating={isCalculating}
                selectedStudent={selectedStudent}
                onSelectStudent={setSelectedStudent}
                events={events}
                liveSimulationActive={liveSimulationActive}
                onToggleSimulation={() => setLiveSimulationActive(prev => !prev)}
                onRecordManualLesson={handleRecordManualLesson}
              />
            )}

            {currentTab === 'students' && (
              <StudentsView
                students={students}
                clusters={clusters}
                selectedStudent={selectedStudent}
                onSelectStudent={setSelectedStudent}
                onNavigateToPersonalization={handleNavigateToPersonalization}
                onNavigateToSchedule={handleNavigateToSchedule}
              />
            )}

            {currentTab === 'marketing' && (
              <MarketingView
                marketingProfiles={marketingProfiles}
                marketingClusters={marketingClusters}
                config={marketingConfig}
                onChangeConfig={setMarketingConfig}
                onRecluster={handleMarketingRecluster}
                onUploadProfiles={handleUploadMarketingProfiles}
                onResetOriginalProfiles={handleResetOriginalMarketingProfiles}
                isCustomCohort={isCustomCohort}
                existingStudents={students}
              />
            )}

            {currentTab === 'payments' && (
              <PaymentsView
                students={students}
                payments={payments}
                onUpdatePayment={handleUpdatePayment}
              />
            )}

            {currentTab === 'personalization' && (
              <PersonalizationView
                students={students}
                initialStudentId={selectedStudent?.id}
                onNavigateToSchedule={handleNavigateToSchedule}
              />
            )}

            {currentTab === 'scheduling' && (
              <SchedulingView
                classes={classes}
                students={students}
                clusters={clusters}
                notifications={notifications}
                onAddClass={handleAddClass}
                onSendTestReminder={handleSendTestReminder}
                initialPreselectedStudent={selectedStudent}
                initialTopic={preselectedTopic}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                students={students}
                clusters={clusters}
                marketingProfiles={marketingProfiles}
                marketingClusters={marketingClusters}
                payments={payments}
              />
            )}
          </>
        )}
      </main>

      {/* Push Notification Banner Overlay */}
      <NotificationToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />
    </div>
  );
}
