import {
  MarketingProfile,
  StudentProfile,
  MarketingSegmentCode,
  LeadSource,
  LearningGoal,
  BudgetRange,
  IndustryType,
  PriceSensitivity,
  SubscriptionType,
  CEFRLevel,
  StudentSkillScores
} from '../types';

/**
 * Generates a realistic CSV template for commercial leads
 * with mixed complete and partial data to demonstrate tolerance.
 */
export function generateSampleMarketingLeadsCSV(): string {
  return `full_name,email,subscription,learning_goal,estimated_budget,industry,urgency_level,lead_source,notes
Mariana Benítez,mbenitez.madre@gmail.com,premium,Enseñanza Infantil / Kids (4-12 años),Premium / VIP ($100-220/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Instagram Ads,Mamá de Mateo (6 años) busca clases de inglés lúdicas con canciones y cuentos
Rodrigo Arismendi,rarismendi@colegio.edu,basic,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Media (1-3 meses),Referral / Boca a Boca,Iniciación bilingüe para mellizos de 8 años
Alejandra Ramos,alejandra.ramos@techcorp.com,basic,Desarrollo Profesional / B2B,Corporativo Empresarial,Tecnología & Software,Alta (< 2 semanas),LinkedIn B2B,Ingeniera de software requiere inglés para entrevistas en EE.UU.
Carlos Mendoza,cmendoza@finanzas.pe,premium,Certificación Oficial (IELTS/TOEFL),Premium / VIP ($100-220/mes),Finanzas & Negocios,Media (1-3 meses),Google Search,Preparando examen IELTS banda 7.5
Daniela Soto,daniela.soto@viajes.org,free,Viajes e Inmersión,Económico ($15-35/mes),Turismo & Hospitalidad,Baja / Exploratoria,Instagram Ads,Interesada en francés conversacional para mochilazo
Esteban Morales,emorales@constructora.cl,basic,Desarrollo Profesional / B2B,,Finanzas & Negocios,Media (1-3 meses),Referral / Boca a Boca,Empresa dispuesta a cofinanciar curso
Fernanda Ortiz,fernanda.ortiz@gmail.com,free,Crecimiento Personal,,,Estudiante Universitario,,Instagram Ads,Solo le interesa aprender italiano por ocio
Guillermo Vidal,gvidal@medicos.org,premium,Desarrollo Profesional / B2B,Premium / VIP ($100-220/mes),Salud & Medicina,Alta (< 2 semanas),Webinar Educativo,Médico cirujano postulando a fellowship en Boston
Helena Castro,helena.castro@gmail.com,free,,,Educación & Academia,,Organic / Blog,Ex-alumna interesada en reactivar hábitos
Ignacio Valdés,ivaldes@retail.com,basic,Desarrollo Profesional / B2B,Estándar ($40-85/mes),Finanzas & Negocios,Media (1-3 meses),LinkedIn B2B,Gerente de operaciones buscando mejorar vocabulario
Jimena Fuentes,jfuentes@startup.co,free,Desarrollo Profesional / B2B,Estándar ($40-85/mes),Tecnología & Software,Media (1-3 meses),Google Search,Product Manager en startup de pagos
Klaus Weber,klaus.weber@global.de,premium,Certificación Oficial (IELTS/TOEFL),Corporativo Empresarial,Finanzas & Negocios,Alta (< 2 semanas),Referral / Boca a Boca,Abogado corporativo preparando TOLES
Lucía Navarrete,lucia.navarrete@yahoo.es,free,Viajes e Inmersión,Económico ($15-35/mes),,,Instagram Ads,Sin industria declarada
Mario Pardo,mario.pardo@logistica.com,basic,,,Tecnología & Software,Media (1-3 meses),Google Search,Interés en inglés técnico para transportes`;
}

/**
 * Triggers a browser download of the sample marketing CSV template
 */
export function downloadSampleMarketingLeadsCSV(): void {
  const content = generateSampleMarketingLeadsCSV();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'plantilla_leads_segmentacion_mercadeo.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Flexible CSV row parser handling quotes, semicolons and commas
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Normalize header keys to match our internal field names
 */
function normalizeHeader(h: string): string {
  const clean = h.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (['nombre', 'name', 'fullname', 'full_name', 'cliente', 'prospecto', 'alumno'].includes(clean)) return 'fullName';
  if (['email', 'correo', 'mail', 'email_address'].includes(clean)) return 'email';
  if (['plan', 'subscription', 'suscripcion', 'tipo_plan', 'tier'].includes(clean)) return 'subscription';
  if (['meta', 'goal', 'learning_goal', 'objetivo', 'objetivo_aprendizaje'].includes(clean)) return 'learningGoal';
  if (['presupuesto', 'budget', 'estimated_budget', 'rango_presupuesto'].includes(clean)) return 'estimatedBudget';
  if (['industria', 'industry', 'sector', 'ocupacion', 'rubro'].includes(clean)) return 'industry';
  if (['urgencia', 'urgency', 'urgency_level', 'nivel_urgencia'].includes(clean)) return 'urgencyLevel';
  if (['origen', 'source', 'lead_source', 'canal_origen', 'medio'].includes(clean)) return 'leadSource';
  if (['lecciones', 'lessons', 'total_lessons', 'clases'].includes(clean)) return 'totalLessons';
  if (['nivel', 'cefr', 'cefr_level', 'idioma_nivel'].includes(clean)) return 'cefrLevel';
  if (['notas', 'notes', 'comentarios'].includes(clean)) return 'notes';
  return clean;
}

/**
 * Parses uploaded CSV text flexibly into MarketingProfile records.
 * Tolerates any missing fields by imputing neutral defaults and measuring data completeness.
 */
export function parseUploadedLeadsCSV(
  csvText: string,
  existingStudents: StudentProfile[] = []
): MarketingProfile[] {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('El archivo CSV debe contener una fila de encabezados y al menos un registro.');
  }

  // Detect delimiter (, or ;)
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  const rawHeaders = parseCSVLine(firstLine, delimiter);
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  const parsedProfiles: MarketingProfile[] = [];
  const startId = 1000 + Math.floor(Math.random() * 500);

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCSVLine(lines[i], delimiter);
    if (rawCols.every(c => c === '')) continue;

    const rowData: Record<string, string> = {};
    normalizedHeaders.forEach((key, colIdx) => {
      rowData[key] = rawCols[colIdx] || '';
    });

    const fullName = rowData.fullName || `Prospecto #${i}`;
    const email = rowData.email || `lead_${startId + i}@importado.com`;
    
    // Parse subscription
    const rawSub = (rowData.subscription || '').toLowerCase();
    const currentSubscription: SubscriptionType = rawSub.includes('prem')
      ? 'premium'
      : rawSub.includes('bas')
      ? 'basic'
      : 'free';

    // Flexible parsing of marketing variables (optional)
    let learningGoal: LearningGoal | undefined;
    const rawGoal = (rowData.learningGoal || '').toLowerCase();
    if (rawGoal.includes('infantil') || rawGoal.includes('kid') || rawGoal.includes('niñ') || rawGoal.includes('nin') || rawGoal.includes('junior') || rawGoal.includes('hijo')) {
      learningGoal = 'Enseñanza Infantil / Kids (4-12 años)';
    } else if (rawGoal.includes('carrera') || rawGoal.includes('profesion') || rawGoal.includes('trabajo') || rawGoal.includes('b2b')) {
      learningGoal = 'Desarrollo Profesional / B2B';
    } else if (rawGoal.includes('examen') || rawGoal.includes('certif') || rawGoal.includes('ielts') || rawGoal.includes('toefl')) {
      learningGoal = 'Certificación Oficial (IELTS/TOEFL)';
    } else if (rawGoal.includes('viaje') || rawGoal.includes('turismo') || rawGoal.includes('inmersion')) {
      learningGoal = 'Viajes e Inmersión';
    } else if (rawGoal.includes('migra') || rawGoal.includes('residen') || rawGoal.includes('visa')) {
      learningGoal = 'Migración / Residencia';
    } else if (rawGoal.includes('personal') || rawGoal.includes('hobby') || rawGoal.includes('cultura')) {
      learningGoal = 'Crecimiento Personal';
    }

    let estimatedBudget: BudgetRange | undefined;
    const rawBudget = (rowData.estimatedBudget || '').toLowerCase();
    if (rawBudget.includes('corp') || rawBudget.includes('empresa') || rawBudget.includes('b2b')) {
      estimatedBudget = 'Corporativo Empresarial';
    } else if (rawBudget.includes('prem') || rawBudget.includes('vip') || rawBudget.includes('100') || rawBudget.includes('200')) {
      estimatedBudget = 'Premium / VIP ($100-220/mes)';
    } else if (rawBudget.includes('estandar') || rawBudget.includes('medio') || rawBudget.includes('50') || rawBudget.includes('80')) {
      estimatedBudget = 'Estándar ($40-85/mes)';
    } else if (rawBudget.includes('econ') || rawBudget.includes('bajo') || rawBudget.includes('20') || rawBudget.includes('35')) {
      estimatedBudget = 'Económico ($15-35/mes)';
    }

    let industry: IndustryType | undefined;
    const rawInd = (rowData.industry || '').toLowerCase();
    if (rawInd.includes('padre') || rawInd.includes('madre') || rawInd.includes('familia') || rawInd.includes('escolar') || rawInd.includes('colegio') || rawInd.includes('kinder')) {
      industry = 'Padres de Familia / Escolar';
    } else if (rawInd.includes('tec') || rawInd.includes('soft') || rawInd.includes('it') || rawInd.includes('program')) {
      industry = 'Tecnología & Software';
    } else if (rawInd.includes('fin') || rawInd.includes('banc') || rawInd.includes('negoc') || rawInd.includes('contab')) {
      industry = 'Finanzas & Negocios';
    } else if (rawInd.includes('salud') || rawInd.includes('med') || rawInd.includes('farm') || rawInd.includes('enferm')) {
      industry = 'Salud & Medicina';
    } else if (rawInd.includes('educ') || rawInd.includes('docen') || rawInd.includes('profesor') || rawInd.includes('academ')) {
      industry = 'Educación & Academia';
    } else if (rawInd.includes('tur') || rawInd.includes('hot') || rawInd.includes('gastron')) {
      industry = 'Turismo & Hospitalidad';
    } else if (rawInd.includes('estud') || rawInd.includes('univ') || rawInd.length > 0) {
      industry = 'Estudiante Universitario';
    }

    let leadSource: LeadSource | undefined;
    const rawSource = (rowData.leadSource || '').toLowerCase();
    if (rawSource.includes('link') || rawSource.includes('b2b')) {
      leadSource = 'LinkedIn B2B';
    } else if (rawSource.includes('goog') || rawSource.includes('search') || rawSource.includes('sem')) {
      leadSource = 'Google Search';
    } else if (rawSource.includes('insta') || rawSource.includes('ig') || rawSource.includes('meta')) {
      leadSource = 'Instagram Ads';
    } else if (rawSource.includes('ref') || rawSource.includes('boca') || rawSource.includes('amigo')) {
      leadSource = 'Referral / Boca a Boca';
    } else if (rawSource.includes('webin') || rawSource.includes('taller')) {
      leadSource = 'Webinar Educativo';
    } else if (rawSource.includes('blog') || rawSource.includes('organ') || rawSource.includes('seo')) {
      leadSource = 'Organic / Blog';
    }

    let urgencyLevel: 'Alta (< 2 semanas)' | 'Media (1-3 meses)' | 'Baja / Exploratoria' | undefined;
    const rawUrg = (rowData.urgencyLevel || '').toLowerCase();
    if (rawUrg.includes('alta') || rawUrg.includes('urgente') || rawUrg.includes('inmediat') || rawUrg.includes('1')) {
      urgencyLevel = 'Alta (< 2 semanas)';
    } else if (rawUrg.includes('media') || rawUrg.includes('moderada') || rawUrg.includes('2') || rawUrg.includes('3')) {
      urgencyLevel = 'Media (1-3 meses)';
    } else if (rawUrg.includes('baja') || rawUrg.includes('explor') || rawUrg.includes('sin')) {
      urgencyLevel = 'Baja / Exploratoria';
    }

    // Optional ML fields (if user included them or matched with existing)
    const matchedStudent = existingStudents.find(
      s => s.email.toLowerCase() === email.toLowerCase() || s.full_name.toLowerCase() === fullName.toLowerCase()
    );

    const parsedLessons = parseInt(rowData.totalLessons || '', 10);
    const totalLessons = !isNaN(parsedLessons) ? parsedLessons : (matchedStudent ? matchedStudent.totalLessons : Math.floor(Math.random() * 8) + 1);

    const validLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const rawCefr = (rowData.cefrLevel || '').toUpperCase();
    const cefrLevel: CEFRLevel = validLevels.includes(rawCefr as CEFRLevel)
      ? (rawCefr as CEFRLevel)
      : (matchedStudent ? matchedStudent.cefrLevel : 'B1');

    const difficultyScore = matchedStudent ? matchedStudent.difficultyScore : 2.1;
    const hardRatio = matchedStudent ? matchedStudent.hardRatio : 0.45;
    const totalPoints = matchedStudent ? matchedStudent.totalPoints : totalLessons * 35;
    const recencyDays = matchedStudent ? matchedStudent.recencyDays : Math.floor(Math.random() * 20) + 1;
    const mlClusterName = matchedStudent ? matchedStudent.clusterName : 'Prospecto Externo';
    const mlClusterColor = matchedStudent ? matchedStudent.clusterColor : '#6366F1';

    // Calculate Data Completeness percentage
    const optionalKeys = [learningGoal, estimatedBudget, industry, leadSource, urgencyLevel];
    const filledCount = optionalKeys.filter(Boolean).length;
    const profileCompleteness = Math.round((filledCount / optionalKeys.length) * 100);

    const priceSensitivity: PriceSensitivity = estimatedBudget === 'Corporativo Empresarial' || estimatedBudget === 'Premium / VIP ($100-220/mes)'
      ? 'Baja'
      : estimatedBudget === 'Estándar ($40-85/mes)'
      ? 'Media'
      : 'Alta';

    const defaultSkills: StudentSkillScores = matchedStudent ? matchedStudent.skills : {
      grammar: 65,
      conversation: 68,
      vocabulary: 70,
      listening: 64,
      reading: 72,
      pronunciation: 60,
      culture: 58,
      idioms: 55
    };

    // Calculate preliminary intent and conversion metrics
    let intentScore = 25;
    if (currentSubscription === 'premium') intentScore += 25;
    else if (currentSubscription === 'basic') intentScore += 15;
    if (urgencyLevel === 'Alta (< 2 semanas)') intentScore += 20;
    if (learningGoal === 'Desarrollo Profesional / B2B' || learningGoal === 'Certificación Oficial (IELTS/TOEFL)') intentScore += 15;
    intentScore = Math.min(99, Math.max(10, intentScore));

    let conversionProbability = Math.round(intentScore * 0.45);
    if (currentSubscription === 'basic') conversionProbability += 15;
    if (estimatedBudget === 'Premium / VIP ($100-220/mes)' || estimatedBudget === 'Corporativo Empresarial') conversionProbability += 12;
    conversionProbability = Math.min(88, Math.max(8, conversionProbability));

    let expectedLTV = 180;
    if (currentSubscription === 'premium') expectedLTV = 520;
    else if (currentSubscription === 'basic') expectedLTV = 320;
    if (estimatedBudget === 'Corporativo Empresarial') expectedLTV = 760;
    else if (estimatedBudget === 'Premium / VIP ($100-220/mes)') expectedLTV = 480;

    // Create preliminary profile (clustering will assign persona & customized offer)
    const profile: MarketingProfile = {
      studentId: matchedStudent ? matchedStudent.id : (startId + i),
      fullName,
      email,
      currentSubscription,
      learningGoal,
      estimatedBudget,
      industry,
      urgencyLevel,
      leadSource,
      ageGroup: (learningGoal === 'Enseñanza Infantil / Kids (4-12 años)' || industry === 'Padres de Familia / Escolar') ? 'Kids (4-12)' : '25-34',
      priceSensitivity,
      profileCompleteness,
      intentScore,
      conversionProbability,
      expectedLTV,
      
      // Machine Learning & Pedagogical attributes
      mlClusterId: matchedStudent ? matchedStudent.clusterId : 1,
      mlClusterName,
      mlClusterColor,
      cefrLevel,
      totalLessons,
      totalDurationMinutes: totalLessons * 45,
      avgLessonDuration: 45,
      difficultyScore,
      hardRatio,
      totalAchievements: Math.max(1, Math.floor(totalLessons / 2)),
      totalPoints,
      recencyDays,
      learningVelocity: 1.2,
      lastActivityDate: new Date().toISOString().split('T')[0],
      skills: defaultSkills,

      // Initial persona assignment (refined by runMarketingSegmentation)
      marketingClusterId: 0,
      marketingClusterName: 'Sin Clasificar',
      marketingClusterCode: 'NURTURE_FREE' as MarketingSegmentCode,
      marketingClusterColor: '#8B5CF6',
      suggestedOffer: 'Clase de Orientación y Diagnóstico de Nivel',
      recommendedChannel: 'WhatsApp / Correo Electrónico',
      sampleCopyHook: 'Impulsa tu fluidez con un plan adaptado a tus metas.'
    };

    parsedProfiles.push(profile);
  }

  return parsedProfiles;
}
