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
  PaymentRecord,
  AuthUser,
  UserRole
} from './types';
import { loadInitialDatasets } from './data/csvDataLoader';
import { runClustering, predictStudentCluster, DEFAULT_ML_CONFIG } from './services/mlEngine';
import {
  enrichWithMarketingAttributes,
  runMarketingSegmentation,
  DEFAULT_MARKETING_CONFIG
} from './services/marketingEngine';
import { initializeStudentPayments, formatCOP } from './services/paymentService';
import { Header, AppTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { PersonalizationView } from './components/PersonalizationView';
import { MarketingView } from './components/MarketingView';
import { PaymentsView } from './components/PaymentsView';
import { SchedulingView } from './components/SchedulingView';
import { TeacherAcademicView } from './components/TeacherAcademicView';
import { UserManagementView } from './components/UserManagementView';
import { ReportsView } from './components/ReportsView';
import { StudentPortalView } from './components/StudentPortalView';
import { AuthModal } from './components/AuthModal';
import { AlertCenterModal } from './components/AlertCenterModal';
import { ProductivizationGuideModal } from './components/ProductivizationGuideModal';
import { getStoredUser, saveStoredUser, DEMO_USERS, ROLE_CONFIGS, syncUserProfileToFirestore, INITIAL_MANAGED_USERS } from './services/authService';
import { NotificationToast, ToastData } from './components/NotificationToast';
import { auth, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { dispatchAlertAction, AlertTemplates } from './services/alertService';
import { AlertNotificationItem, ManagedUserProfile, StudentEvaluation } from './types';
import { INITIAL_STUDENT_EVALUATIONS } from './data/classTemplatesData';

const INITIAL_SCHEDULED_CLASSES: ScheduledClass[] = [
  {
    id: 'class_a1_intro',
    title: 'Iniciación y Saludos en Inglés: Tu Primer Diálogo Cotidiano',
    topic: 'Presentaciones personales, verb to be, números y deletreo fonético',
    instructor: 'Prof. David Sterling',
    dateTime: '2025-01-22T10:00',
    durationMinutes: 45,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 3,
    targetLabel: 'Nivel A1: Principiantes e Iniciación',
    level: 'A1',
    capacity: 15,
    enrolledStudentIds: [5, 12, 18],
    attendeesCount: 3,
    status: 'scheduled',
    remindersSent: { email: false, push: true, whatsapp: false, lastSentAt: '2025-01-21 10:00' }
  },
  {
    id: 'class_2',
    title: 'Laboratorio de Fonética y Pronunciación Básica A2',
    topic: 'Pares mínimos, entonación de preguntas y enlace sonoro cotidiano',
    instructor: 'Prof. David Sterling',
    dateTime: '2025-01-23T16:30',
    durationMinutes: 45,
    modality: 'audio_lab',
    targetType: 'cluster',
    targetId: 1,
    targetLabel: 'Nivel A2: Constantes en Progreso',
    level: 'A2',
    capacity: 14,
    enrolledStudentIds: [1, 2, 7], // Zara Hoffmann (#1) enrolled
    attendeesCount: 3,
    status: 'scheduled',
    remindersSent: { email: true, push: true, whatsapp: true, lastSentAt: '2025-01-22 14:00' }
  },
  {
    id: 'class_a2_conversation',
    title: 'Taller Práctico A2: Rutinas Diarias, Compras y Direcciones',
    topic: 'Práctica conversacional para describir el día a día y pedir indicaciones',
    instructor: 'Lic. Mateo Rivas',
    dateTime: '2025-01-24T17:00',
    durationMinutes: 50,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 1,
    targetLabel: 'Nivel A2: Intermedio Básico',
    level: 'A2',
    capacity: 12,
    enrolledStudentIds: [6, 14],
    attendeesCount: 2,
    status: 'scheduled',
    remindersSent: { email: false, push: false, whatsapp: false }
  },
  {
    id: 'class_b1_grammar',
    title: 'Gramática en Acción B1: Tiempos Perfectos y Pasados Continuos',
    topic: 'Contrastar Present Perfect vs Past Simple en anécdotas de vida',
    instructor: 'Dra. Carmen Valenzuela',
    dateTime: '2025-01-23T18:30',
    durationMinutes: 50,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 2,
    targetLabel: 'Nivel B1: Pre-Intermedio',
    level: 'B1',
    capacity: 15,
    enrolledStudentIds: [4, 9, 13],
    attendeesCount: 3,
    status: 'scheduled',
    remindersSent: { email: true, push: true, whatsapp: false }
  },
  {
    id: 'class_1',
    title: 'Taller de Fluidez y Modismos Idiomáticos B2/C1',
    topic: 'Expresiones coloquiales, conectores argumentativos y debate',
    instructor: 'Dra. Carmen Valenzuela',
    dateTime: '2025-01-24T18:00',
    durationMinutes: 55,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 0,
    targetLabel: 'Nivel B2: Dominio Avanzado',
    level: 'B2',
    capacity: 15,
    enrolledStudentIds: [8, 15, 20],
    attendeesCount: 3,
    status: 'scheduled',
    remindersSent: { email: true, push: true, whatsapp: true, lastSentAt: '2025-01-21 10:00' }
  },
  {
    id: 'class_c1_business',
    title: 'Mesa Redonda C1: Negociación Ejecutiva y Presentaciones B2B',
    topic: 'Pitch de negocios, lenguaje diplomático y resolución de conflictos',
    instructor: 'Dra. Carmen Valenzuela',
    dateTime: '2025-01-25T15:00',
    durationMinutes: 60,
    modality: 'video_call',
    targetType: 'cluster',
    targetId: 0,
    targetLabel: 'Nivel C1: Fluidez Nativa & Negocios',
    level: 'C1',
    capacity: 10,
    enrolledStudentIds: [22, 27],
    attendeesCount: 2,
    status: 'scheduled',
    remindersSent: { email: true, push: false, whatsapp: false }
  },
  {
    id: 'class_kids',
    title: 'Taller LinguaKids: Fonética Lúdica, Rimas y Cuentos (4-8 años)',
    topic: 'Enseñanza Infantil: Fonética Lúdica y Storytelling sensorial',
    instructor: 'Lic. Sofía Alarcón (Especialista Infantil)',
    dateTime: '2025-01-25T11:00',
    durationMinutes: 30,
    modality: 'video_call',
    targetType: 'all',
    targetLabel: 'Enseñanza Infantil & Kids (4 a 12 años)',
    level: 'Todos',
    capacity: 16,
    enrolledStudentIds: [10, 11, 16],
    attendeesCount: 3,
    status: 'scheduled',
    remindersSent: { email: true, push: true, whatsapp: true, lastSentAt: '2025-01-24 10:00' }
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
  const [currentUser, setCurrentUser] = useState<AuthUser>(getStoredUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    const user = getStoredUser();
    if (user.role === 'parent_student') return 'student_portal';
    if (user.role === 'teacher') return 'scheduling';
    if (user.role === 'sales') return 'marketing';
    return 'dashboard';
  });
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

  // Modals for Alerts & Productivization
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isProductivizationModalOpen, setIsProductivizationModalOpen] = useState(false);
  const [alertModalParams, setAlertModalParams] = useState<{
    type?: 'class_reminder' | 'payment_bre_b' | 'enrollment_confirmation' | 'diagnostic_report';
    initialClass?: ScheduledClass;
    initialStudent?: StudentProfile;
  }>({});

  // Managed Users / Profiles Directory (Admin RBAC only)
  const [managedUsers, setManagedUsers] = useState<ManagedUserProfile[]>(INITIAL_MANAGED_USERS);

  // Student Evaluations & Rubrics (Teacher / Academic Tutor Module)
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>(INITIAL_STUDENT_EVALUATIONS);

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
        // Check connection to provisioned Firestore database
        testFirestoreConnection().catch(console.warn);
      } catch (err) {
        console.error('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    }

    init();

    // Listen to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Active Firebase Auth user detected
        const updatedUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email || 'usuario@lingua-ai.edu',
          displayName: fbUser.displayName || 'Usuario Google',
          role: currentUser.role, // Maintain selected role
          avatarUrl: fbUser.photoURL || undefined
        };
        setCurrentUser(updatedUser);
        saveStoredUser(updatedUser);
        syncUserProfileToFirestore(updatedUser).catch(console.warn);
      }
    });

    return () => {
      unsubscribeAuth();
    };
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

  // Send reminder (Push, Email, or WhatsApp)
  const handleSendTestReminder = useCallback((classItem: ScheduledClass, channel: 'push' | 'email' | 'whatsapp') => {
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

    const { subject, message } = AlertTemplates.classReminder(classItem, recipientName);

    // If channel is whatsapp or email, dispatch directly via browser URL scheme
    if (channel === 'whatsapp') {
      dispatchAlertAction('whatsapp', '3105558899', subject, message);
    } else if (channel === 'email') {
      dispatchAlertAction('email', recipientEmail, subject, message);
    }

    // Add to notification history
    const newNotif: ReminderNotification = {
      id: `notif_${Date.now()}`,
      classId: classItem.id,
      classTitle: classItem.title,
      channel,
      recipientName,
      recipientEmail,
      subject,
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
      title: channel === 'whatsapp' ? 'Alerta WhatsApp Abierta' : channel === 'push' ? 'Notificación Push Disparada' : 'Correo Transaccional Generado',
      body: `"${classItem.title}" · ${channel === 'whatsapp' ? 'Abierto en WhatsApp' : 'Notificación enviada'} a ${recipientName}.`,
      recipient: channel === 'whatsapp' ? 'WhatsApp (+57 3105558899)' : `${recipientName} (${recipientEmail})`,
      channel: channel === 'whatsapp' ? 'push' : channel
    });
  }, [students]);

  // Handle student enrolling/unsubscribing to a class
  const handleToggleEnrollClass = useCallback((classId: string) => {
    const studentToEnroll = students.find(s => s.id === currentUser.studentId) || selectedStudent || students[0];
    if (!studentToEnroll) return;

    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        const currentEnrolled = cls.enrolledStudentIds || [];
        const isEnrolled = currentEnrolled.includes(studentToEnroll.id);

        let newEnrolled: number[];
        if (isEnrolled) {
          newEnrolled = currentEnrolled.filter(id => id !== studentToEnroll.id);
          setActiveToast({
            id: `toast_${Date.now()}`,
            title: 'Inscripción Cancelada',
            body: `Has liberado tu cupo en "${cls.title}". Puedes registrarte en otro horario cuando lo desees.`,
            recipient: studentToEnroll.full_name,
            channel: 'push'
          });
        } else {
          newEnrolled = [...currentEnrolled, studentToEnroll.id];
          setActiveToast({
            id: `toast_${Date.now()}`,
            title: '¡Inscripción Exitosa en Horario!',
            body: `Te has inscrito en "${cls.title}" con ${cls.instructor} para el ${new Date(cls.dateTime).toLocaleDateString('es-CO')}.`,
            recipient: studentToEnroll.full_name,
            channel: 'push'
          });
        }

        return {
          ...cls,
          enrolledStudentIds: newEnrolled,
          attendeesCount: newEnrolled.length
        };
      }
      return cls;
    }));
  }, [currentUser, selectedStudent, students]);

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

  // Handle switching RBAC role
  const handleSelectRole = useCallback((newRole: UserRole) => {
    const newUser = DEMO_USERS[newRole];
    setCurrentUser(newUser);
    saveStoredUser(newUser);

    const allowed = ROLE_CONFIGS[newRole].allowedTabs;
    if (!allowed.includes(currentTab)) {
      setCurrentTab(allowed[0]);
    }

    setActiveToast({
      id: `toast_${Date.now()}`,
      title: `Sesión Iniciada: ${ROLE_CONFIGS[newRole].badge}`,
      body: `Has ingresado como ${newUser.displayName} (${newUser.email}). Módulos adaptados para ${ROLE_CONFIGS[newRole].label}.`,
      recipient: ROLE_CONFIGS[newRole].label,
      channel: 'push'
    });
  }, [currentTab]);

  // User profile directory management handlers (Admin exclusive)
  const handleAddUser = useCallback((newUserData: Omit<ManagedUserProfile, 'uid' | 'createdAt'>) => {
    const newUser: ManagedUserProfile = {
      ...newUserData,
      uid: `usr_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: 'Recién creado'
    };
    setManagedUsers(prev => [newUser, ...prev]);
    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Persona Registrada en el Padrón',
      body: `${newUser.displayName} ha sido agregado(a) con rol de ${ROLE_CONFIGS[newUser.role].badge}.`,
      recipient: 'Directorio de Usuarios',
      channel: 'push'
    });
  }, []);

  const handleUpdateUser = useCallback((updated: ManagedUserProfile) => {
    setManagedUsers(prev => prev.map(u => (u.uid === updated.uid ? updated : u)));
    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Perfil de Usuario Actualizado',
      body: `Datos de ${updated.displayName} guardados (${updated.status} · ${ROLE_CONFIGS[updated.role].badge}).`,
      recipient: updated.displayName,
      channel: 'push'
    });
  }, []);

  const handleDeleteUser = useCallback((uid: string) => {
    setManagedUsers(prev => prev.filter(u => u.uid !== uid));
    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Usuario Eliminado',
      body: 'El registro ha sido removido del padrón institucional.',
      recipient: 'Directorio de Usuarios',
      channel: 'push'
    });
  }, []);

  // Academic Evaluation handler (Teacher / Academic module)
  const handleAddEvaluation = useCallback((evaluation: StudentEvaluation) => {
    setEvaluations(prev => [evaluation, ...prev]);

    // Also update student skill scores in state if student matches
    setStudents(prev => prev.map(s => {
      if (s.id === evaluation.studentId) {
        return {
          ...s,
          cefrLevel: evaluation.cefrLevel,
          skills: {
            ...s.skills,
            grammar: evaluation.scores.grammar,
            pronunciation: evaluation.scores.pronunciation,
            conversation: evaluation.scores.conversation,
            listening: evaluation.scores.listening,
            vocabulary: evaluation.scores.vocabulary,
            reading: evaluation.scores.reading
          }
        };
      }
      return s;
    }));

    setActiveToast({
      id: `toast_${Date.now()}`,
      title: 'Evaluación y Rúbrica Guardada',
      body: `${evaluation.studentName} · Nivel ${evaluation.cefrLevel} (${evaluation.averageScore}/100 - ${evaluation.performance}).`,
      recipient: evaluation.studentEmail,
      channel: 'push'
    });
  }, []);

  const currentStudentForPortal = students.find(s => s.id === currentUser.studentId) || selectedStudent || students[0];
  const currentStudentPayment = currentStudentForPortal ? payments.find(p => p.studentId === currentStudentForPortal.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Header with Mobile Drawer & Role Switcher */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenScheduleModal={() => setCurrentTab('scheduling')}
        liveSimulationActive={liveSimulationActive}
        onToggleSimulation={() => setLiveSimulationActive(prev => !prev)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAlertModal={() => {
          setAlertModalParams({ type: 'class_reminder' });
          setIsAlertModalOpen(true);
        }}
        onOpenProductivizationModal={() => setIsProductivizationModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
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
              <TeacherAcademicView
                students={students}
                classes={classes}
                evaluations={evaluations}
                onAddClass={handleAddClass}
                onAddEvaluation={handleAddEvaluation}
                onSendTestReminder={handleSendTestReminder}
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

            {currentTab === 'users_management' && (
              <UserManagementView
                currentUser={currentUser}
                users={managedUsers}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {currentTab === 'student_portal' && currentStudentForPortal && (
              <StudentPortalView
                student={currentStudentForPortal}
                classes={classes}
                payment={currentStudentPayment}
                onRecordPracticeLesson={(name, dur, pts) => handleRecordManualLesson(currentStudentForPortal.id, name, 'easy', dur, pts)}
                onToggleEnrollClass={handleToggleEnrollClass}
                onOpenAlertCenter={(type, cls) => {
                  setAlertModalParams({
                    type: type || 'class_reminder',
                    initialClass: cls,
                    initialStudent: currentStudentForPortal
                  });
                  setIsAlertModalOpen(true);
                }}
                onReportPayment={() => {
                  if (currentStudentPayment) {
                    handleUpdatePayment({
                      ...currentStudentPayment,
                      status: 'pagado',
                      method: 'Bre-B (Llave / QR Interoperable)',
                      paidAt: new Date().toISOString().split('T')[0],
                      referenceNumber: `BREB-PORTAL-${Date.now().toString().slice(-6)}`
                    });
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Guarantees navigation on mobile and external devices) */}
      <nav aria-label="Navegación móvil" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {ROLE_CONFIGS[currentUser.role].allowedTabs.slice(0, 5).map(tabId => {
          const tabMeta: Record<string, { label: string; icon: string }> = {
            dashboard: { label: 'ML', icon: '📊' },
            students: { label: 'Alumnos', icon: '👥' },
            marketing: { label: 'Mercadeo', icon: '📈' },
            payments: { label: 'Pagos', icon: '💳' },
            personalization: { label: 'Pedagogía', icon: '✨' },
            scheduling: { label: 'Docente', icon: '🎓' },
            reports: { label: 'Reportes', icon: '📑' },
            student_portal: { label: 'Mi Portal', icon: '🧸' },
            users_management: { label: 'Perfiles', icon: '🛡️' }
          };
          const meta = tabMeta[tabId] || { label: tabId, icon: '📌' };
          const isActive = currentTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setCurrentTab(tabId)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-400 font-bold bg-indigo-950/70 border border-indigo-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base leading-tight">{meta.icon}</span>
              <span className="leading-tight mt-0.5">{meta.label}</span>
            </button>
          );
        })}
      </nav>

      {/* RBAC Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onUserAuthenticated={(authenticatedUser) => {
          setCurrentUser(authenticatedUser);
          saveStoredUser(authenticatedUser);
          const allowed = ROLE_CONFIGS[authenticatedUser.role].allowedTabs;
          if (!allowed.includes(currentTab)) {
            setCurrentTab(allowed[0]);
          }
          setActiveToast({
            id: `toast_${Date.now()}`,
            title: `Google Identity Conectado (${ROLE_CONFIGS[authenticatedUser.role].badge})`,
            body: `Bienvenido ${authenticatedUser.displayName}. Tu perfil fue verificado y registrado en Firebase Firestore.`,
            recipient: authenticatedUser.email,
            channel: 'push'
          });
        }}
      />

      {/* Alert Center Modal (WhatsApp & Email Direct Dispatch) */}
      <AlertCenterModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        students={students}
        classes={classes}
        payments={payments}
        initialType={alertModalParams.type}
        initialClass={alertModalParams.initialClass}
        initialStudent={alertModalParams.initialStudent}
        onAlertDispatched={(item) => {
          setActiveToast({
            id: `toast_${Date.now()}`,
            title: item.channel === 'whatsapp' ? 'Alerta WhatsApp Disparada' : 'Correo Generado',
            body: `Mensaje enviado a ${item.recipientName} (${item.recipientContact})`,
            recipient: item.recipientName,
            channel: 'push'
          });
        }}
      />

      {/* Production & Deployment Step-by-Step Guide Modal for Ruben */}
      <ProductivizationGuideModal
        isOpen={isProductivizationModalOpen}
        onClose={() => setIsProductivizationModalOpen(false)}
      />

      {/* Push Notification Banner Overlay */}
      <NotificationToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />
    </div>
  );
}
