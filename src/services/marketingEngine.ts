import {
  StudentProfile,
  MarketingProfile,
  MarketingCluster,
  MarketingSegmentationConfig,
  LeadSource,
  LearningGoal,
  BudgetRange,
  IndustryType,
  PriceSensitivity,
  MarketingSegmentCode
} from '../types';

export const DEFAULT_MARKETING_CONFIG: MarketingSegmentationConfig = {
  k: 7,
  useLeadSource: true,
  useLearningGoal: true,
  useBudgetRange: true,
  useIndustry: true,
  useUrgency: true,
  useUsageMetrics: true,
  imputationStrategy: 'neutral'
};

const MARKETING_PERSONA_DEFS: Record<MarketingSegmentCode, {
  name: string;
  color: string;
  description: string;
  targetAudience: string;
  baseConversionRate: number;
  baseLTV: number;
  primaryOffer: string;
  primaryChannel: string;
  recommendedHook: string;
  callToAction: string;
}> = {
  UPSELL_VIP: {
    name: 'Candidatos Upsell Premium VIP',
    color: '#6366F1', // Indigo
    description: 'Estudiantes de alta constancia que ya perciben valor en la plataforma y buscan máxima aceleración con mentoría individual.',
    targetAudience: 'Alumnos en planes Basic o Free con >5 lecciones, alta tasa de retos difíciles y metas profesionales.',
    baseConversionRate: 38,
    baseLTV: 540,
    primaryOffer: 'Membresía Anual VIP + 12 Sesiones de Mentoría 1-a-1 Exclusivas',
    primaryChannel: 'WhatsApp Directo / Llamada Consultiva',
    recommendedHook: '"Lleva tu fluidez al siguiente nivel: acceso ilimitado a tutores nativos y preparación ejecutiva."',
    callToAction: 'Agendar Sesión de Diagnóstico VIP'
  },
  B2B_CORP: {
    name: 'Prospectos Corporativos / B2B',
    color: '#0EA5E9', // Sky
    description: 'Profesionales en tecnología, finanzas y consultoría que necesitan el idioma para reuniones, pitches y liderazgo global.',
    targetAudience: 'Perfiles con meta de desarrollo profesional, presupuestos corporativos y urgencia laboral.',
    baseConversionRate: 29,
    baseLTV: 720,
    primaryOffer: 'Plan Corporate Executive: Facturación a empresa, grupos cerrados y simulaciones de negocio',
    primaryChannel: 'LinkedIn InMail / Email Corporativo',
    recommendedHook: '"Capacitación en Business English para ti y tu equipo con reporte de ROI y progreso en tiempo real."',
    callToAction: 'Solicitar Demo Corporativa para Equipos'
  },
  CERT_BOOTCAMP: {
    name: 'Aspirantes a Certificación Oficial',
    color: '#F59E0B', // Amber
    description: 'Leads con fecha límite próxima para presentar exámenes internacionales (IELTS, TOEFL, Cambridge, DELE).',
    targetAudience: 'Urgencia alta (< 2 meses), dedicación intensa por sesión y necesidad de simulacros cronometrados.',
    baseConversionRate: 34,
    baseLTV: 450,
    primaryOffer: 'Bootcamp Intensivo de 8 Semanas: Garantía de Puntaje o Devolución',
    primaryChannel: 'Email Secuencial + WhatsApp',
    recommendedHook: '"Asegura la banda 7.5+ en tu examen internacional con nuestros simuladores oficiales y feedback en 24h."',
    callToAction: 'Inscribirme al Bootcamp de Certificación'
  },
  KIDS_JUNIOR: {
    name: 'Enseñanza Infantil & Kids (4-12 años)',
    color: '#EC4899', // Pink / Fuchsia
    description: 'Padres de familia y tutores que buscan estimulación bilingüe temprana, fonética lúdica, canciones y apoyo escolar mediante gamificación interactiva.',
    targetAudience: 'Familias con niños en edad preescolar y primaria (4 a 12 años), alta valoración de reportes de avance y profesores pacientes certificados.',
    baseConversionRate: 35,
    baseLTV: 580,
    primaryOffer: 'Programa LinguaKids Junior: Clases dinámicas de 25 min, cuentos animados, rimas y portal para padres',
    primaryChannel: 'WhatsApp / Instagram Ads (Campañas para Familias)',
    recommendedHook: '"Despierta el bilingüismo natural de tus hijos de forma divertida con profesores certificados en pedagogía infantil."',
    callToAction: 'Agendar Clase Demostrativa Infantil Gratuita'
  },
  WINBACK_CHURN: {
    name: 'Campaña Rescate & Winback',
    color: '#F43F5E', // Rose
    description: 'Usuarios en riesgo de abandono o con inactividad superior a 45 días que necesitan un incentivo de reactivación sin fricción.',
    targetAudience: 'Días de inactividad elevados, baja finalización reciente o suscripciones canceladas.',
    baseConversionRate: 16,
    baseLTV: 210,
    primaryOffer: 'Pase de Bienvenida: 40% OFF en renovación + 1 Mes de Club de Conversación Gratis',
    primaryChannel: 'Campaña de Email de Re-engagement + Push App',
    recommendedHook: '"Te extrañamos en clase: reactiva tu cuenta hoy con 40% de descuento y conserva tu progreso previo."',
    callToAction: 'Reactivar mi Plan con Descuento'
  },
  TRAVEL_CASUAL: {
    name: 'Viajeros & Ocio Conversacional',
    color: '#10B981', // Emerald
    description: 'Entusiastas del idioma por placer, viajes, cultura y turismo. Buscan fluidez coloquial sin agobios gramaticales.',
    targetAudience: 'Preferencia por diálogos y pronunciación, sensibilidad al precio media-alta, horarios flexibles.',
    baseConversionRate: 22,
    baseLTV: 280,
    primaryOffer: 'Membresía Traveler: Mini-lecciones prácticas de situaciones de aeropuerto, hoteles y restaurantes',
    primaryChannel: 'Instagram Ads / Email con Guías Gratuitas',
    recommendedHook: '"Viaja por el mundo sin barreras: aprende a desenvolverte en cualquier país en solo 15 minutos al día."',
    callToAction: 'Ver Pack de Idiomas para Viajeros'
  },
  NURTURE_FREE: {
    name: 'Exploradores Gratuitos (Lead Nurturing)',
    color: '#8B5CF6', // Purple
    description: 'Usuarios en tier Free que exploran la plataforma pero aún no han tomado la decisión de pago.',
    targetAudience: 'Suscripción gratuita, bajo volumen histórico, información demográfica incompleta.',
    baseConversionRate: 11,
    baseLTV: 160,
    primaryOffer: 'Prueba de 7 Días de Todas las Funciones Premium por $1',
    primaryChannel: 'Newsletter Semanal / Notificaciones In-App',
    recommendedHook: '"Desbloquea todo el potencial de la plataforma: accede a clases en vivo y feedback por solo $1."',
    callToAction: 'Probar Premium por $1'
  }
};

// Seed realistic marketing attributes deterministically based on student ID and behaviour
export function enrichWithMarketingAttributes(students: StudentProfile[]): MarketingProfile[] {
  const sources: LeadSource[] = [
    'Google Search',
    'Instagram Ads',
    'LinkedIn B2B',
    'Referral / Boca a Boca',
    'Organic / Blog',
    'Webinar Educativo'
  ];

  const goals: LearningGoal[] = [
    'Desarrollo Profesional / B2B',
    'Certificación Oficial (IELTS/TOEFL)',
    'Viajes e Inmersión',
    'Migración / Residencia',
    'Crecimiento Personal',
    'Enseñanza Infantil / Kids (4-12 años)'
  ];

  const budgets: BudgetRange[] = [
    'Económico ($15-35/mes)',
    'Estándar ($40-85/mes)',
    'Premium / VIP ($100-220/mes)',
    'Corporativo Empresarial'
  ];

  const industries: IndustryType[] = [
    'Tecnología & Software',
    'Finanzas & Negocios',
    'Salud & Medicina',
    'Educación & Academia',
    'Turismo & Hospitalidad',
    'Estudiante Universitario',
    'Padres de Familia / Escolar'
  ];

  return students.map(s => {
    // Determine deterministic pseudorandomness per student id
    const seed = (s.id * 9301 + 49297) % 233280;
    const r1 = (seed % 100) / 100;
    const r2 = ((seed * 7) % 100) / 100;
    const r3 = ((seed * 13) % 100) / 100;
    const r4 = ((seed * 19) % 100) / 100;
    const r5 = ((seed * 23) % 100) / 100;

    // Simulate missing variables intentionally (flexibility demonstration)
    // ~15% chance leadSource is missing
    const leadSource: LeadSource | undefined = r1 > 0.15 ? sources[Math.floor(r1 * sources.length)] : undefined;
    
    // ~20% chance learningGoal is missing
    const learningGoal: LearningGoal | undefined = r2 > 0.20 ? goals[Math.floor(r2 * goals.length)] : undefined;
    
    // ~25% chance estimatedBudget is missing
    const estimatedBudget: BudgetRange | undefined = r3 > 0.25 ? budgets[Math.floor(r3 * budgets.length)] : undefined;
    
    // ~30% chance industry is missing
    const industry: IndustryType | undefined = r4 > 0.30 ? industries[Math.floor(r4 * industries.length)] : undefined;

    const urgencyLevel: 'Alta (< 2 semanas)' | 'Media (1-3 meses)' | 'Baja / Exploratoria' | undefined =
      r5 > 0.20 ? (r5 > 0.7 ? 'Alta (< 2 semanas)' : r5 > 0.4 ? 'Media (1-3 meses)' : 'Baja / Exploratoria') : undefined;

    const isKidsTarget = learningGoal === 'Enseñanza Infantil / Kids (4-12 años)' || industry === 'Padres de Familia / Escolar';

    const ageGroup: 'Kids (4-12)' | '18-24' | '25-34' | '35-49' | '50+' =
      isKidsTarget ? 'Kids (4-12)' : r1 > 0.7 ? '35-49' : r1 > 0.4 ? '25-34' : r1 > 0.2 ? '18-24' : '50+';

    const preferredChannel: 'Email' | 'WhatsApp' | 'LinkedIn' | 'Llamada Asesor' =
      isKidsTarget ? 'WhatsApp' :
      leadSource === 'LinkedIn B2B' ? 'LinkedIn' :
      leadSource === 'Instagram Ads' ? 'WhatsApp' :
      estimatedBudget === 'Corporativo Empresarial' ? 'Llamada Asesor' : 'Email';

    // Calculate profile data completeness percentage
    let filledCount = 0;
    const totalFields = 5;
    if (leadSource) filledCount++;
    if (learningGoal) filledCount++;
    if (estimatedBudget) filledCount++;
    if (industry) filledCount++;
    if (urgencyLevel) filledCount++;
    const profileCompleteness = Math.round((filledCount / totalFields) * 100);

    // Intent Score (0 to 100) combining usage signals + marketing attributes
    let intentScore = 20;
    intentScore += Math.min(30, s.totalLessons * 6);
    intentScore += Math.min(20, Math.round(s.hardRatio * 25));
    if (s.subscription_type === 'premium') intentScore += 20;
    else if (s.subscription_type === 'basic') intentScore += 15;
    if (urgencyLevel === 'Alta (< 2 semanas)') intentScore += 15;
    if (learningGoal === 'Desarrollo Profesional / B2B' || learningGoal === 'Certificación Oficial (IELTS/TOEFL)') intentScore += 10;
    if (s.recencyDays > 60) intentScore -= 20;
    intentScore = Math.min(99, Math.max(10, intentScore));

    // Conversion probability (%)
    let conversionProbability = Math.round(intentScore * 0.45);
    if (s.subscription_type === 'basic') conversionProbability += 15;
    if (estimatedBudget === 'Premium / VIP ($100-220/mes)' || estimatedBudget === 'Corporativo Empresarial') conversionProbability += 12;
    conversionProbability = Math.min(88, Math.max(8, conversionProbability));

    // Expected LTV
    let expectedLTV = 180;
    if (s.subscription_type === 'premium') expectedLTV = 520;
    else if (s.subscription_type === 'basic') expectedLTV = 320;
    if (estimatedBudget === 'Corporativo Empresarial') expectedLTV = 780;
    else if (estimatedBudget === 'Premium / VIP ($100-220/mes)') expectedLTV = 490;

    // Price Sensitivity
    let priceSensitivity: PriceSensitivity = 'Media';
    if (estimatedBudget === 'Económico ($15-35/mes)' || s.subscription_type === 'free') {
      priceSensitivity = 'Alta';
    } else if (estimatedBudget === 'Premium / VIP ($100-220/mes)' || estimatedBudget === 'Corporativo Empresarial') {
      priceSensitivity = 'Baja';
    }

    return {
      studentId: s.id,
      fullName: s.full_name,
      email: s.email,
      currentSubscription: s.subscription_type,

      // ML Module features & pedagogical metrics integrated directly
      mlClusterId: s.clusterId,
      mlClusterName: s.clusterName,
      mlClusterColor: s.clusterColor,
      cefrLevel: s.cefrLevel,
      totalLessons: s.totalLessons,
      totalDurationMinutes: s.totalDurationMinutes,
      avgLessonDuration: s.avgLessonDuration,
      difficultyScore: s.difficultyScore,
      hardRatio: s.hardRatio,
      totalPoints: s.totalPoints,
      totalAchievements: s.totalAchievements,
      recencyDays: s.recencyDays,
      learningVelocity: s.learningVelocity,
      lastActivityDate: s.lastActivityDate,
      skills: s.skills,

      leadSource,
      learningGoal,
      estimatedBudget,
      industry,
      preferredChannel,
      ageGroup,
      urgencyLevel,
      profileCompleteness,
      intentScore,
      conversionProbability,
      expectedLTV,
      priceSensitivity,
      marketingClusterId: 0,
      marketingClusterName: '',
      marketingClusterCode: 'NURTURE_FREE',
      marketingClusterColor: '#6366F1',
      suggestedOffer: '',
      recommendedChannel: '',
      sampleCopyHook: ''
    };
  });
}

export function runMarketingSegmentation(
  profiles: MarketingProfile[],
  students: StudentProfile[],
  config: MarketingSegmentationConfig = DEFAULT_MARKETING_CONFIG
): {
  profiles: MarketingProfile[];
  clusters: MarketingCluster[];
} {
  const studentMap = new Map<number, StudentProfile>();
  students.forEach(s => studentMap.set(s.id, s));

  // Segment each lead based on available signals, handling missing variables gracefully
  const classifiedProfiles = profiles.map(lead => {
    const student = studentMap.get(lead.studentId);
    let assignedCode: MarketingSegmentCode = 'NURTURE_FREE';

    // Rule priority matrix with flexible fallbacks:
    // 1. Churn / Winback: If inactive for > 60 days
    if (student && student.recencyDays > 60 && student.totalLessons >= 2) {
      assignedCode = 'WINBACK_CHURN';
    }
    // 2. Corporate B2B: If learning goal is B2B or industry is tech/finance or budget is corporate
    else if (
      (config.useLearningGoal && lead.learningGoal === 'Desarrollo Profesional / B2B') ||
      (config.useBudgetRange && lead.estimatedBudget === 'Corporativo Empresarial') ||
      (config.useIndustry && (lead.industry === 'Tecnología & Software' || lead.industry === 'Finanzas & Negocios'))
    ) {
      assignedCode = 'B2B_CORP';
    }
    // 3. Exam / Certification: If goal is certification or urgency is high
    else if (
      (config.useLearningGoal && lead.learningGoal === 'Certificación Oficial (IELTS/TOEFL)') ||
      (config.useUrgency && lead.urgencyLevel === 'Alta (< 2 semanas)' && (student?.difficultyScore || 0) >= 1.8)
    ) {
      assignedCode = 'CERT_BOOTCAMP';
    }
    // 4. Upsell VIP: If student is engaged (many lessons, hard difficulty, or basic/premium with high intent)
    else if (
      (student && student.totalLessons >= 4 && student.hardRatio >= 0.25) ||
      (config.useBudgetRange && lead.estimatedBudget === 'Premium / VIP ($100-220/mes)') ||
      (lead.intentScore >= 65 && lead.currentSubscription !== 'free')
    ) {
      assignedCode = 'UPSELL_VIP';
    }
    // 5. Kids & Early Language Learning: If goal is kids learning or industry is parents/school or ageGroup is kids
    else if (
      (config.useLearningGoal && lead.learningGoal === 'Enseñanza Infantil / Kids (4-12 años)') ||
      (config.useIndustry && lead.industry === 'Padres de Familia / Escolar') ||
      (lead.ageGroup === 'Kids (4-12)')
    ) {
      assignedCode = 'KIDS_JUNIOR';
    }
    // 6. Travel & Leisure: If goal is travel or culture, or casual schedule
    else if (
      (config.useLearningGoal && lead.learningGoal === 'Viajes e Inmersión') ||
      (student && student.skills.culture > 50 && student.skills.conversation > 50)
    ) {
      assignedCode = 'TRAVEL_CASUAL';
    }
    // 7. Free Tier Nurturing (default/fallback when variables are missing or user is in exploratory stage)
    else {
      assignedCode = 'NURTURE_FREE';
    }

    const persona = MARKETING_PERSONA_DEFS[assignedCode];

    return {
      ...lead,
      // Synchronize latest ML values from the Student Profile
      mlClusterId: student?.clusterId ?? lead.mlClusterId ?? 0,
      mlClusterName: student?.clusterName ?? lead.mlClusterName ?? 'Sin Asignar',
      mlClusterColor: student?.clusterColor ?? lead.mlClusterColor ?? '#6366F1',
      cefrLevel: student?.cefrLevel ?? lead.cefrLevel ?? 'B1',
      totalLessons: student?.totalLessons ?? lead.totalLessons ?? 0,
      totalDurationMinutes: student?.totalDurationMinutes ?? lead.totalDurationMinutes ?? 0,
      avgLessonDuration: student?.avgLessonDuration ?? lead.avgLessonDuration ?? 0,
      difficultyScore: student?.difficultyScore ?? lead.difficultyScore ?? 1.0,
      hardRatio: student?.hardRatio ?? lead.hardRatio ?? 0,
      totalPoints: student?.totalPoints ?? lead.totalPoints ?? 0,
      totalAchievements: student?.totalAchievements ?? lead.totalAchievements ?? 0,
      recencyDays: student?.recencyDays ?? lead.recencyDays ?? 0,
      learningVelocity: student?.learningVelocity ?? lead.learningVelocity ?? 0,
      lastActivityDate: student?.lastActivityDate ?? lead.lastActivityDate ?? '2024-01-01',
      skills: student?.skills ?? lead.skills,

      marketingClusterName: persona.name,
      marketingClusterCode: assignedCode,
      marketingClusterColor: persona.color,
      suggestedOffer: persona.primaryOffer,
      recommendedChannel: persona.primaryChannel,
      sampleCopyHook: persona.recommendedHook
    };
  });

  // Calculate cluster aggregations
  const codes: MarketingSegmentCode[] = [
    'UPSELL_VIP',
    'B2B_CORP',
    'CERT_BOOTCAMP',
    'KIDS_JUNIOR',
    'WINBACK_CHURN',
    'TRAVEL_CASUAL',
    'NURTURE_FREE'
  ];

  const total = classifiedProfiles.length || 1;
  const clusters: MarketingCluster[] = codes.map((code, idx) => {
    const persona = MARKETING_PERSONA_DEFS[code];
    const members = classifiedProfiles.filter(p => p.marketingClusterCode === code);
    const size = members.length;
    const percentage = Number(((size / total) * 100).toFixed(1));
    const avgConversion = size > 0 
      ? Math.round(members.reduce((acc, m) => acc + m.conversionProbability, 0) / size)
      : persona.baseConversionRate;
    const avgLTV = size > 0
      ? Math.round(members.reduce((acc, m) => acc + m.expectedLTV, 0) / size)
      : persona.baseLTV;

    const avgLessons = size > 0
      ? Number((members.reduce((acc, m) => acc + m.totalLessons, 0) / size).toFixed(1))
      : 0;
    const avgDifficulty = size > 0
      ? Number((members.reduce((acc, m) => acc + m.difficultyScore, 0) / size).toFixed(2))
      : 0;
    const avgPoints = size > 0
      ? Math.round(members.reduce((acc, m) => acc + m.totalPoints, 0) / size)
      : 0;
    const avgRecencyDays = size > 0
      ? Math.round(members.reduce((acc, m) => acc + m.recencyDays, 0) / size)
      : 0;

    // Dominant CEFR in this marketing cluster
    const cefrCounts: Record<string, number> = {};
    members.forEach(m => {
      cefrCounts[m.cefrLevel] = (cefrCounts[m.cefrLevel] || 0) + 1;
    });
    const dominantCefr = Object.entries(cefrCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'B1';

    // Dominant ML cluster
    const mlClusterCounts: Record<string, number> = {};
    members.forEach(m => {
      mlClusterCounts[m.mlClusterName] = (mlClusterCounts[m.mlClusterName] || 0) + 1;
    });
    const dominantMlCluster = Object.entries(mlClusterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Constantes en Progreso';

    return {
      id: idx,
      name: persona.name,
      code,
      color: persona.color,
      description: persona.description,
      targetAudience: persona.targetAudience,
      size,
      percentage,
      avgConversionRate: avgConversion,
      avgExpectedLTV: avgLTV,
      avgLessons,
      avgDifficulty,
      avgPoints,
      avgRecencyDays,
      dominantCefr,
      dominantMlCluster,
      primaryOffer: persona.primaryOffer,
      primaryChannel: persona.primaryChannel,
      recommendedHook: persona.recommendedHook,
      callToAction: persona.callToAction
    };
  });

  // Update profile cluster IDs
  const finalProfiles = classifiedProfiles.map(p => {
    const cluster = clusters.find(c => c.code === p.marketingClusterCode);
    return {
      ...p,
      marketingClusterId: cluster?.id ?? 0
    };
  });

  return { profiles: finalProfiles, clusters };
}
