export type SubscriptionType = 'free' | 'basic' | 'premium';
export type LessonDifficulty = 'easy' | 'medium' | 'hard';
export type AchievementType = 'skill' | 'milestone' | 'participation';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface RawUser {
  id: number;
  full_name: string;
  email: string;
  subscription_start: string;
  subscription_type: SubscriptionType;
}

export interface RawLesson {
  id: number;
  user_id: number;
  lesson_name: string;
  completion_date: string;
  lesson_difficulty: LessonDifficulty;
  lesson_duration_minutes: number;
}

export interface RawAchievement {
  id: number;
  user_id: number;
  achievement_name: string;
  unlocked_date: string;
  achievement_type: AchievementType;
  achievement_points: number;
}

export interface StudentSkillScores {
  grammar: number;
  conversation: number;
  vocabulary: number;
  listening: number;
  reading: number;
  pronunciation: number;
  culture: number;
  idioms: number;
}

export interface StudentProfile {
  id: number;
  full_name: string;
  email: string;
  subscription_start: string;
  subscription_type: SubscriptionType;
  
  // Aggregated behavior metrics
  totalLessons: number;
  totalDurationMinutes: number;
  avgLessonDuration: number;
  difficultyScore: number; // weighted 1=easy, 2=med, 3=hard
  easyLessonsCount: number;
  mediumLessonsCount: number;
  hardLessonsCount: number;
  hardRatio: number; // 0 to 1
  
  totalAchievements: number;
  totalPoints: number;
  skillAchievements: number;
  milestoneAchievements: number;
  participationAchievements: number;
  
  lastActivityDate: string;
  recencyDays: number; // days since last activity
  
  learningVelocity: number; // lessons per month
  skills: StudentSkillScores;
  cefrLevel: CEFRLevel;
  
  // ML assignment
  clusterId: number;
  clusterName: string;
  clusterColor: string;
  
  // 2D projection coordinates for visualization (e.g. PCA or normalized features)
  pcaX: number;
  pcaY: number;
}

export interface MLCluster {
  id: number;
  name: string;
  code: string;
  color: string;
  description: string;
  pedagogicalProfile: string;
  recommendedFocus: string;
  
  // Centroid stats
  size: number;
  percentage: number;
  avgLessons: number;
  avgPoints: number;
  avgDifficulty: number;
  avgDuration: number;
  hardRatio: number;
  avgRecencyDays: number;
  dominantSubscription: string;
  dominantCefr: string;
  
  // Centroid feature vector (normalized)
  centroid: number[];
  
  // 2D centroid coords
  pcaX: number;
  pcaY: number;
}

export interface MLConfig {
  k: number; // 3 to 6
  maxIterations: number;
  weights: {
    lessons: number;
    points: number;
    difficulty: number;
    duration: number;
    hardRatio: number;
    recency: number;
  };
}

export interface RealtimeEvent {
  id: string;
  timestamp: string;
  studentId: number;
  studentName: string;
  type: 'lesson_completed' | 'achievement_unlocked' | 'class_scheduled' | 'cluster_reassigned';
  description: string;
  deltaPoints?: number;
  duration?: number;
  difficulty?: LessonDifficulty;
}

export interface ScheduledClass {
  id: string;
  title: string;
  topic: string;
  instructor: string;
  dateTime: string;
  durationMinutes: number;
  modality: 'video_call' | 'in_person' | 'audio_lab';
  targetType: 'student' | 'cluster' | 'all';
  targetId?: number; // studentId or clusterId
  targetLabel: string;
  attendeesCount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  level?: CEFRLevel | 'Todos';
  capacity?: number;
  enrolledStudentIds?: number[];
  description?: string;
  meetLink?: string;
  remindersSent: {
    email: boolean;
    push: boolean;
    whatsapp?: boolean;
    lastSentAt?: string;
  };
}

export type AlertChannel = 'whatsapp' | 'email' | 'push';
export type AlertType = 'class_reminder' | 'payment_bre_b' | 'enrollment_confirmation' | 'diagnostic_report';

export interface AlertNotificationItem {
  id: string;
  type: AlertType;
  channel: AlertChannel;
  recipientName: string;
  recipientContact: string; // Phone or Email
  subject: string;
  message: string;
  timestamp: string;
  status: 'enviado' | 'abierto';
  referenceId?: string;
}

export interface ReminderNotification {
  id: string;
  classId: string;
  classTitle: string;
  channel: 'push' | 'email' | 'whatsapp';
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  subject: string;
  message: string;
  scheduledTime: string;
  status: 'enviado' | 'programado' | 'pendiente';
  sentAt?: string;
}

export interface PersonalizedModule {
  id: string;
  title: string;
  skillFocus: string;
  difficulty: LessonDifficulty;
  cefrTarget: CEFRLevel;
  estimatedMinutes: number;
  learningGoal: string;
  pedagogyTip: string;
  suggestedActivities: string[];
}

export interface PersonalizedStudentPlan {
  studentId: number;
  studentName: string;
  cefrLevel: CEFRLevel;
  clusterName: string;
  diagnosticSummary: string;
  keyStrengths: string[];
  growthOpportunities: string[];
  nextModules: PersonalizedModule[];
  recommendedScheduleFrequency: string;
  tailoredHomework: string;
}

// ========================
// MARKETING SEGMENTATION TYPES
// ========================
export type LeadSource = 
  | 'Google Search' 
  | 'Instagram Ads' 
  | 'LinkedIn B2B' 
  | 'Referral / Boca a Boca' 
  | 'Organic / Blog' 
  | 'Webinar Educativo';

export type LearningGoal = 
  | 'Desarrollo Profesional / B2B' 
  | 'Certificación Oficial (IELTS/TOEFL)' 
  | 'Viajes e Inmersión' 
  | 'Migración / Residencia' 
  | 'Crecimiento Personal'
  | 'Enseñanza Infantil / Kids (4-12 años)';

export type BudgetRange = 
  | 'Económico ($15-35/mes)' 
  | 'Estándar ($40-85/mes)' 
  | 'Premium / VIP ($100-220/mes)' 
  | 'Corporativo Empresarial';

export type PriceSensitivity = 'Alta' | 'Media' | 'Baja';

export type IndustryType = 
  | 'Tecnología & Software' 
  | 'Finanzas & Negocios' 
  | 'Salud & Medicina' 
  | 'Educación & Academia' 
  | 'Turismo & Hospitalidad' 
  | 'Estudiante Universitario'
  | 'Padres de Familia / Escolar';

export type MarketingSegmentCode = 
  | 'UPSELL_VIP' 
  | 'B2B_CORP' 
  | 'CERT_BOOTCAMP' 
  | 'WINBACK_CHURN' 
  | 'TRAVEL_CASUAL' 
  | 'NURTURE_FREE'
  | 'KIDS_JUNIOR';

export interface MarketingProfile {
  studentId: number;
  fullName: string;
  email: string;
  currentSubscription: SubscriptionType;
  
  // Optional / flexible marketing variables (may be missing/undefined in raw records)
  leadSource?: LeadSource;
  learningGoal?: LearningGoal;
  estimatedBudget?: BudgetRange;
  industry?: IndustryType;
  preferredChannel?: 'Email' | 'WhatsApp' | 'LinkedIn' | 'Llamada Asesor';
  ageGroup?: 'Kids (4-12)' | '18-24' | '25-34' | '35-49' | '50+';
  urgencyLevel?: 'Alta (< 2 semanas)' | 'Media (1-3 meses)' | 'Baja / Exploratoria';
  
  // Data completeness score (0 to 100%)
  profileCompleteness: number;
  
  // Derived analytical scores
  intentScore: number; // 0 to 100
  conversionProbability: number; // 0 to 100%
  expectedLTV: number; // in USD
  priceSensitivity: PriceSensitivity;
  
  // All Machine Learning & Pedagogical variables integrated into Marketing
  mlClusterId: number;
  mlClusterName: string;
  mlClusterColor: string;
  cefrLevel: CEFRLevel;
  totalLessons: number;
  totalDurationMinutes: number;
  avgLessonDuration: number;
  difficultyScore: number;
  hardRatio: number;
  totalPoints: number;
  totalAchievements: number;
  recencyDays: number;
  learningVelocity: number;
  lastActivityDate: string;
  skills: StudentSkillScores;

  // Marketing Cluster assignment
  marketingClusterId: number;
  marketingClusterName: string;
  marketingClusterCode: MarketingSegmentCode;
  marketingClusterColor: string;
  suggestedOffer: string;
  recommendedChannel: string;
  sampleCopyHook: string;
}

export interface MarketingCluster {
  id: number;
  name: string;
  code: MarketingSegmentCode;
  color: string;
  description: string;
  targetAudience: string;
  size: number;
  percentage: number;
  avgConversionRate: number; // e.g. 28%
  avgExpectedLTV: number; // e.g. $420
  avgLessons: number;
  avgDifficulty: number;
  avgPoints: number;
  avgRecencyDays: number;
  dominantCefr: string;
  dominantMlCluster: string;
  primaryOffer: string;
  primaryChannel: string;
  recommendedHook: string;
  callToAction: string;
}

export interface MarketingSegmentationConfig {
  k: number;
  // Feature inclusion flags (allows model flexibility when variables are absent)
  useLeadSource: boolean;
  useLearningGoal: boolean;
  useBudgetRange: boolean;
  useIndustry: boolean;
  useUrgency: boolean;
  useUsageMetrics: boolean; // lessons, points, recency
  imputationStrategy: 'mode' | 'neutral' | 'zero';
}

// ========================
// COLOMBIAN PAYMENTS & BRE-B / WALLETS TYPES
// ========================
export type PaymentStatus = 'pagado' | 'pendiente' | 'vencido' | 'en_revision';

export type PaymentMethod = 
  | 'Bre-B (Llave / QR Interoperable)' 
  | 'Nequi' 
  | 'Daviplata' 
  | 'Transfiya' 
  | 'Transferencia Bancaria';

export type BreBKeyType = 'Celular' | 'Cédula / Documento' | 'NIT Empresa' | 'Correo Electrónico' | 'Código Alfanumérico';

export interface PaymentRecord {
  id: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  period: string; // e.g. "Mes Actual - Octubre 2026"
  amountCOP: number; // $200.000 COP
  dueDate: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  keyTypeUsed?: BreBKeyType;
  keyValueUsed?: string;
  referenceNumber?: string;
  paidAt?: string;
  notes?: string;
  receiptNumber?: string;
}

export interface BreBConfig {
  merchantName: string;
  merchantNit: string;
  breBKeyType: BreBKeyType;
  breBKeyValue: string;
  nequiNumber: string;
  daviplataNumber: string;
  transfiyaNumber: string;
  monthlyFeeCOP: number; // 200000
  bankName: string;
  accountType: string;
  accountNumber: string;
}

// ========================
// AUTHENTICATION & RBAC ROLES (4.1 to 4.4)
// ========================
export type UserRole = 
  | 'admin'          // 4.1 Administrador / Coordinador Académico
  | 'teacher'        // 4.2 Profesor / Tutor
  | 'sales'          // 4.3 Comercial / Mercadeo
  | 'parent_student'; // 4.4 Padre de Familia / Estudiante

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: number; // Linked student profile for student/parent view
  phoneNumber?: string;
  institution?: string;
}

export interface RolePermissionConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
  badgeColor: string;
  allowedTabs: ('dashboard' | 'students' | 'personalization' | 'marketing' | 'payments' | 'scheduling' | 'reports' | 'student_portal' | 'users_management')[];
}

// ========================
// TEACHER / TUTOR ACADEMIC TEMPLATES & EVALUATIONS
// ========================
export type EvaluationPerformance = 'Sobresaliente' | 'Aprobado' | 'En Progreso' | 'Requiere Refuerzo';

export interface EvaluationScores {
  grammar: number;       // 1-100
  pronunciation: number; // 1-100
  conversation: number;  // 1-100
  listening: number;     // 1-100
  vocabulary: number;    // 1-100
  reading: number;       // 1-100
}

export interface StudentEvaluation {
  id: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  evaluatorName: string;
  evaluationDate: string;
  cefrLevel: CEFRLevel;
  lessonTopic: string;
  scores: EvaluationScores;
  averageScore: number;
  performance: EvaluationPerformance;
  strengths: string;
  growthAreas: string;
  assignedHomework?: string;
  teacherFeedback: string;
  attendanceStatus?: 'Presente' | 'Tarde' | 'Ausente';
  sharedViaWhatsApp?: boolean;
  sharedViaEmail?: boolean;
}

export interface ClassConfigTemplate {
  id: string;
  name: string;
  code: string;
  level: CEFRLevel | 'Todos';
  defaultDuration: number;
  defaultModality: 'video_call' | 'in_person' | 'audio_lab';
  defaultCapacity: number;
  curriculumUnit: string;
  learningObjectives: string[];
  suggestedMaterials: string[];
  pedagogyTips: string;
}

// ========================
// ADMIN USER / PROFILE DIRECTORY MANAGEMENT
// ========================
export type UserAccountStatus = 'Activo' | 'Inactivo' | 'Pendiente';

export interface ManagedUserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserAccountStatus;
  assignedLevel?: CEFRLevel | 'Multinivel' | string;
  institutionOrDept?: string;
  createdAt: string;
  lastLogin?: string;
  notes?: string;
  studentId?: number;
}
