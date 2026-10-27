import { StudentProfile, PersonalizedStudentPlan, PersonalizedModule, CEFRLevel, LessonDifficulty } from '../types';
import { GoogleGenAI } from '@google/genai';

const CURRICULUM_BANK: Record<CEFRLevel, {
  grammar: PersonalizedModule[];
  conversation: PersonalizedModule[];
  vocabulary: PersonalizedModule[];
  listening: PersonalizedModule[];
  pronunciation: PersonalizedModule[];
  idioms: PersonalizedModule[];
}> = {
  A1: {
    grammar: [
      {
        id: 'a1_g1',
        title: 'Fundamentos: Presente Simple y Verbo To Be / Être / Estar',
        skillFocus: 'Grammar',
        difficulty: 'easy',
        cefrTarget: 'A1',
        estimatedMinutes: 30,
        learningGoal: 'Construir afirmaciones, negaciones y preguntas básicas sin titubear.',
        pedagogyTip: 'Enfatizar repetición guiada con apoyos visuales y tarjetas nemotécnicas.',
        suggestedActivities: ['Tarjetas de memoria de pronombres', 'Rellenar huecos en diálogos de presentación', 'Juego de roles de check-in']
      }
    ],
    conversation: [
      {
        id: 'a1_c1',
        title: 'Primeras Conversaciones: Saludos, Ciudad y Rutinas',
        skillFocus: 'Conversation',
        difficulty: 'easy',
        cefrTarget: 'A1',
        estimatedMinutes: 35,
        learningGoal: 'Expresar necesidades inmediatas y presentarse en entornos informales.',
        pedagogyTip: 'Mantener turnos de habla cortos (< 30 segundos) para reforzar seguridad fonética.',
        suggestedActivities: ['Simulación de cafetería', 'Preguntas rápidas de intercambio personal', 'Grabación de audio de 1 minuto']
      }
    ],
    vocabulary: [
      {
        id: 'a1_v1',
        title: 'Léxico Vital: 300 Palabras Clave de Frecuencia Máxima',
        skillFocus: 'Vocabulary',
        difficulty: 'easy',
        cefrTarget: 'A1',
        estimatedMinutes: 25,
        learningGoal: 'Reconocer números, horas, comidas y direcciones básicas de viaje.',
        pedagogyTip: 'Asociación directa imagen-palabra sin traducción reflexiva previa.',
        suggestedActivities: ['Asociación de imágenes', 'Dictado de números y precios', 'Categorización por campos semánticos']
      }
    ],
    listening: [
      {
        id: 'a1_l1',
        title: 'Comprensión Auditiva: Instrucciones y Mensajes Públicos',
        skillFocus: 'Listening',
        difficulty: 'easy',
        cefrTarget: 'A1',
        estimatedMinutes: 30,
        learningGoal: 'Identificar palabras clave en audios con pronunciación pausada y clara.',
        pedagogyTip: 'Permitir dos escuchas antes de solicitar la respuesta final.',
        suggestedActivities: ['Escucha activa con selección múltiple', 'Completar datos en billete de tren', 'Transcripción de micro-frases']
      }
    ],
    pronunciation: [
      {
        id: 'a1_p1',
        title: 'Fonética Esencial: Vocales Claras y Acento Tónico',
        skillFocus: 'Pronunciation',
        difficulty: 'easy',
        cefrTarget: 'A1',
        estimatedMinutes: 25,
        learningGoal: 'Diferenciar pares mínimos de sonidos que no existen en la lengua materna.',
        pedagogyTip: 'Modelado exagerado de posición lingual y labial frente a espejo o cámara.',
        suggestedActivities: ['Pares mínimos (ship/sheep)', 'Práctica de eco con metrónomo', 'Sombreado fonético guiado']
      }
    ],
    idioms: [
      {
        id: 'a1_i1',
        title: 'Fórmulas Sociales: Modismos de Cortesía Diaria',
        skillFocus: 'Idioms',
        difficulty: 'easy',
        cefrTarget: 'A1',
        estimatedMinutes: 20,
        learningGoal: 'Usar fórmulas naturales de agradecimiento, disculpa e invitación.',
        pedagogyTip: 'Enseñar como unidades léxicas prefabricadas sin análisis sintáctico.',
        suggestedActivities: ['Reacción rápida ante situaciones', 'Identificar el nivel de cortesía', 'Mapeo contextual']
      }
    ]
  },
  A2: {
    grammar: [
      {
        id: 'a2_g1',
        title: 'Narrativa en Pasado: Pasado Simple vs Continuo',
        skillFocus: 'Grammar',
        difficulty: 'easy',
        cefrTarget: 'A2',
        estimatedMinutes: 40,
        learningGoal: 'Relatar acontecimientos cronológicos y anécdotas de viajes o fines de semana.',
        pedagogyTip: 'Utilizar líneas de tiempo visuales para distinguir acciones puntuales de estados de fondo.',
        suggestedActivities: ['Reconstruir relato desordenado', 'Cadena de anécdotas en clase', 'Diario breve de ayer']
      }
    ],
    conversation: [
      {
        id: 'a2_c1',
        title: 'Resolución Cotidiana: Tiendas, Reclamaciones y Sugerencias',
        skillFocus: 'Conversation',
        difficulty: 'medium',
        cefrTarget: 'A2',
        estimatedMinutes: 45,
        learningGoal: 'Interactuar con fluidez suficiente para resolver imprevistos sencillos.',
        pedagogyTip: 'Introducir elementos sorpresa en el juego de roles para fomentar espontaneidad.',
        suggestedActivities: ['Simulación de devolución en tienda', 'Pedir recomendaciones a un transeúnte', 'Negociación de menú']
      }
    ],
    vocabulary: [
      {
        id: 'a2_v1',
        title: 'Expansión Temática: Trabajo, Salud y Entorno Urbano',
        skillFocus: 'Vocabulary',
        difficulty: 'easy',
        cefrTarget: 'A2',
        estimatedMinutes: 30,
        learningGoal: 'Describir síntomas médicos básicos, profesiones y tareas habituales.',
        pedagogyTip: 'Crear mapas mentales colaborativos organizados por escenarios reales.',
        suggestedActivities: ['Juego de tabú adaptado', 'Clasificación de síntomas y remedios', 'Creación de infografía breve']
      }
    ],
    listening: [
      {
        id: 'a2_l1',
        title: 'Audio Auténtico: Entrevistas Cortas y Podcasts Pedagógicos',
        skillFocus: 'Listening',
        difficulty: 'medium',
        cefrTarget: 'A2',
        estimatedMinutes: 35,
        learningGoal: 'Extraer la idea principal y detalles específicos de conversaciones naturales.',
        pedagogyTip: 'Preguntar por el estado de ánimo de los interlocutores para activar pragmática.',
        suggestedActivities: ['Detección de tono e intención', 'Rellenar formulario de reserva', 'Resumen en tres puntos']
      }
    ],
    pronunciation: [
      {
        id: 'a2_p1',
        title: 'Conexión Silábica (Connected Speech) y Formas Débiles',
        skillFocus: 'Pronunciation',
        difficulty: 'medium',
        cefrTarget: 'A2',
        estimatedMinutes: 30,
        learningGoal: 'Comprender y reproducir la elisión y enlace de palabras en habla fluida.',
        pedagogyTip: 'Cantar rimas o trabalenguas rítmicos para interiorizar el ritmo acentual.',
        suggestedActivities: ['Transcripción fonética simplificada', 'Lectura rítmica guiada', 'Desafío de velocidad controlada']
      }
    ],
    idioms: [
      {
        id: 'a2_i1',
        title: 'Expresiones Idiomáticas de Tiempo y Clima',
        skillFocus: 'Idioms',
        difficulty: 'medium',
        cefrTarget: 'A2',
        estimatedMinutes: 30,
        learningGoal: 'Incorporar giros idiomáticos comunes como "once in a blue moon" o equivalentes.',
        pedagogyTip: 'Analizar el origen histórico o visual del modismo para facilitar fijación.',
        suggestedActivities: ['Relacionar expresión con viñeta de cómic', 'Sustituir lenguaje plano por idiomático', 'Debate corto con uso forzado']
      }
    ]
  },
  B1: {
    grammar: [
      {
        id: 'b1_g1',
        title: 'Conectores Complejos, Condicionales y Voz Pasiva',
        skillFocus: 'Grammar',
        difficulty: 'medium',
        cefrTarget: 'B1',
        estimatedMinutes: 45,
        learningGoal: 'Estructurar argumentos de causa-efecto e hipótesis sobre el futuro.',
        pedagogyTip: 'Fomentar la autocorrección mediante preguntas guía en lugar de corrección inmediata.',
        suggestedActivities: ['Debate de hipótesis "Qué pasaría si..."', 'Reescritura de noticias en voz pasiva', 'Creación de matrices lógicas']
      }
    ],
    conversation: [
      {
        id: 'b1_c1',
        title: 'Debate Guiado: Opiniones, Acuerdos y Desacuerdos Matizados',
        skillFocus: 'Conversation',
        difficulty: 'medium',
        cefrTarget: 'B1',
        estimatedMinutes: 50,
        learningGoal: 'Sostener una conversación extensa expresando matices y solicitando clarificaciones.',
        pedagogyTip: 'Prohibir respuestas binarias (sí/no) para obligar a justificar puntos de vista.',
        suggestedActivities: ['Mesa redonda sobre tecnología y ocio', 'Defensa de posturas contrarias a la propia', 'Entrevista de simulación laboral']
      }
    ],
    vocabulary: [
      {
        id: 'b1_v1',
        title: 'Colocaciones Léxicas (Collocations) y Phrasal Verbs',
        skillFocus: 'Vocabulary',
        difficulty: 'medium',
        cefrTarget: 'B1',
        estimatedMinutes: 40,
        learningGoal: 'Evitar traducciones literales empleando combinaciones naturales de verbos y preposiciones.',
        pedagogyTip: 'Agrupar colocaciones por partículas preposicionales y campos de significado.',
        suggestedActivities: ['Juego de emparejamiento de piezas colocacionales', 'Redacción de anécdota con 5 phrasal verbs', 'Detección de errores en párrafos']
      }
    ],
    listening: [
      {
        id: 'b1_l1',
        title: 'Inmersión Real: Conferencias TED Cortas y Debates Radiales',
        skillFocus: 'Listening',
        difficulty: 'hard',
        cefrTarget: 'B1',
        estimatedMinutes: 45,
        learningGoal: 'Seguir el hilo argumental de discursos con acentos variados a velocidad estándar.',
        pedagogyTip: 'Trabajar toma de notas estructurada tipo Cornell durante la reproducción.',
        suggestedActivities: ['Toma de notas Cornell', 'Identificación de falacias argumentales', 'Resumen oral grabado de 90 segundos']
      }
    ],
    pronunciation: [
      {
        id: 'b1_p1',
        title: 'Entonación y Énfasis Pragmático (Sentence Stress)',
        skillFocus: 'Pronunciation',
        difficulty: 'medium',
        cefrTarget: 'B1',
        estimatedMinutes: 35,
        learningGoal: 'Transmitir ironía, certidumbre o duda modificando el acento de frase.',
        pedagogyTip: 'Marcar visualmente las curvas de entonación en la pizarra interactiva.',
        suggestedActivities: ['Práctica de la misma frase con 4 intenciones distintas', 'Análisis espectrográfico simplificado', 'Lectura dramatizada de guiones']
      }
    ],
    idioms: [
      {
        id: 'b1_i1',
        title: 'Metáforas de Negocios y Emociones en Conversación Real',
        skillFocus: 'Idioms',
        difficulty: 'hard',
        cefrTarget: 'B1',
        estimatedMinutes: 40,
        learningGoal: 'Comprender metáforas conceptuales (tiempo es dinero, ver la luz al final del túnel).',
        pedagogyTip: 'Vincular el modismo a su aplicación en reuniones de trabajo y correos.',
        suggestedActivities: ['Simulación de reunión de equipo con expresiones clave', 'Creación de analogías', 'Quiz contextual rápido']
      }
    ]
  },
  B2: {
    grammar: [
      {
        id: 'b2_g1',
        title: 'Inversión Gramatical, Cleft Sentences y Estilo Formal',
        skillFocus: 'Grammar',
        difficulty: 'hard',
        cefrTarget: 'B2',
        estimatedMinutes: 50,
        learningGoal: 'Dominar recursos de énfasis estilístico para redactar informes persuasivos.',
        pedagogyTip: 'Comparar registros textuales (correo informal entre amigos vs comunicación a clientes).',
        suggestedActivities: ['Transformación de frases neutras a enfatizadas', 'Edición de cartas ejecutivas', 'Análisis retórico de discursos']
      }
    ],
    conversation: [
      {
        id: 'b2_c1',
        title: 'Negociación Estratégica y Resolución de Conflictos',
        skillFocus: 'Conversation',
        difficulty: 'hard',
        cefrTarget: 'B2',
        estimatedMinutes: 60,
        learningGoal: 'Defender propuestas complejas respondiendo objeciones con tacto y diplomacia.',
        pedagogyTip: 'Introducir presión de tiempo y objetivos contrapuestos en la dinámica grupal.',
        suggestedActivities: ['Simulación de presupuesto en crisis', 'Mediación de conflicto entre departamentos', 'Presentación tipo Pitch con preguntas difíciles']
      }
    ],
    vocabulary: [
      {
        id: 'b2_v1',
        title: 'Léxico Académico y Profesional Especializado',
        skillFocus: 'Vocabulary',
        difficulty: 'hard',
        cefrTarget: 'B2',
        estimatedMinutes: 45,
        learningGoal: 'Manejar terminología abstracta, sustantivos de nominalización y matices conceptuales.',
        pedagogyTip: 'Construir glosarios vivos comentados en equipo.',
        suggestedActivities: ['Nominalización de cláusulas verbales', 'Redacción de abstract de proyecto', 'Análisis de artículos de prensa especializada']
      }
    ],
    listening: [
      {
        id: 'b2_l1',
        title: 'Habla Superpuesta y Discursos Técnicos sin Filtro',
        skillFocus: 'Listening',
        difficulty: 'hard',
        cefrTarget: 'B2',
        estimatedMinutes: 50,
        learningGoal: 'Descifrar diálogos con ruido ambiental, interrupciones y turnos superpuestos.',
        pedagogyTip: 'Enfocarse en la inferencia contextual de términos no escuchados con nitidez.',
        suggestedActivities: ['Transcripción selectiva en fragmentos ruidosos', 'Debate parlamentario con habla rápida', 'Síntesis ejecutiva de conferencia']
      }
    ],
    pronunciation: [
      {
        id: 'b2_p1',
        title: 'Acento Neutro Internacional y Variedades Dialectales',
        skillFocus: 'Pronunciation',
        difficulty: 'hard',
        cefrTarget: 'B2',
        estimatedMinutes: 40,
        learningGoal: 'Ajustar la articulación para ser perfectamente inteligible en contextos multiculturales.',
        pedagogyTip: 'Exposición comparativa a variedades (británica, estadounidense, australiana, no-nativas).',
        suggestedActivities: ['Shadowing con oradores de diversos trasfondos', 'Grabación y autoevaluación con rúbrica CEFR', 'Lectura de noticias en directo']
      }
    ],
    idioms: [
      {
        id: 'b2_i1',
        title: 'Ironía Cultural, Dobles Sentidos y Humor Idiomático',
        skillFocus: 'Idioms',
        difficulty: 'hard',
        cefrTarget: 'B2',
        estimatedMinutes: 45,
        learningGoal: 'Captar el subtexto humorístico y la ironía sutil en conversaciones avanzadas.',
        pedagogyTip: 'Analizar fragmentos de comedias de situación o editoriales satíricas.',
        suggestedActivities: ['Desarmar chistes lingüísticos', 'Reescribir una queja con cortesía irónica', 'Debate sobre tabúes culturales']
      }
    ]
  },
  C1: {
    grammar: [
      {
        id: 'c1_g1',
        title: 'Sintaxis Avanzada: Oraciones Complejas y Matices Semánticos',
        skillFocus: 'Grammar',
        difficulty: 'hard',
        cefrTarget: 'C1',
        estimatedMinutes: 60,
        learningGoal: 'Controlar estructuras sintácticas complejas con precisión nativa o cuasi-nativa.',
        pedagogyTip: 'Análisis filológico de textos ensayísticos y sentencias jurídicas.',
        suggestedActivities: ['Comentario de texto ensayístico', 'Corrección de estilo en redacción académica', 'Traducción inversa de precisión']
      }
    ],
    conversation: [
      {
        id: 'c1_c1',
        title: 'Oratoria de Alto Impacto y Pensamiento Crítico Espontáneo',
        skillFocus: 'Conversation',
        difficulty: 'hard',
        cefrTarget: 'C1',
        estimatedMinutes: 60,
        learningGoal: 'Hablar con soltura sin esfuerzo aparente sobre temas filosóficos, éticos o científicos.',
        pedagogyTip: 'Feedback detallado enfocado en pragmática, registro y economía verbal.',
        suggestedActivities: ['Debate estilo Oxford', 'Discurso improvisado de 3 minutos sobre tema sorteado', 'Defensa de tesis dialéctica']
      }
    ],
    vocabulary: [
      {
        id: 'c1_v1',
        title: 'Precisión Léxica Quirúrgica y Sinónimos de Matiz Crítico',
        skillFocus: 'Vocabulary',
        difficulty: 'hard',
        cefrTarget: 'C1',
        estimatedMinutes: 50,
        learningGoal: 'Seleccionar la palabra exacta que distinga connotaciones sutiles (e.g. shrewd vs astute).',
        pedagogyTip: 'Estudio de corpus lingüístico y análisis diacrónico breve.',
        suggestedActivities: ['Gradación de intensidad en sinónimos', 'Redacción de ensayo crítico con restricciones léxicas', 'Diseño de glosario analítico']
      }
    ],
    listening: [
      {
        id: 'c1_l1',
        title: 'Discurso Complejo no Estructurado e Implicaturas Pragmáticas',
        skillFocus: 'Listening',
        difficulty: 'hard',
        cefrTarget: 'C1',
        estimatedMinutes: 55,
        learningGoal: 'Deducir intenciones ocultas, ironías veladas y sesgos ideológicos en el discurso oral.',
        pedagogyTip: 'Escucha de tertulias políticas o juicios orales en versión íntegra.',
        suggestedActivities: ['Análisis crítico del discurso', 'Desglose de alusiones culturales no explícitas', 'Redacción de informe pericial oral']
      }
    ],
    pronunciation: [
      {
        id: 'c1_p1',
        title: 'Musicalidad Retórica, Pausas Dramáticas y Cadencia Natural',
        skillFocus: 'Pronunciation',
        difficulty: 'hard',
        cefrTarget: 'C1',
        estimatedMinutes: 45,
        learningGoal: 'Modular el tono para cautivar a una audiencia profesional o académica.',
        pedagogyTip: 'Estudio de discursos célebres marcando el tempo, la respiración y los silencios.',
        suggestedActivities: ['Grabación de podcast propio', 'Interpretación dramática de monólogos clásicos', 'Autoevaluación con espectrograma vocal']
      }
    ],
    idioms: [
      {
        id: 'c1_i1',
        title: 'Léxico Cultural Profundo: Modismos Arcaicos y Neologismos',
        skillFocus: 'Idioms',
        difficulty: 'hard',
        cefrTarget: 'C1',
        estimatedMinutes: 50,
        learningGoal: 'Usar modismos con naturalidad sin sonar forzado ni anacrónico.',
        pedagogyTip: 'Mapear la evolución del lenguaje callejero y digital contemporáneo.',
        suggestedActivities: ['Glosario de jerga profesional y urbana', 'Análisis de sátiras audiovisuales', 'Creación de microrrelatos idiomáticos']
      }
    ]
  }
};

export function generatePersonalizedPlan(student: StudentProfile): PersonalizedStudentPlan {
  const cefr = student.cefrLevel;
  const skillsObj = student.skills;

  // Rank skills from lowest (gaps) to highest (strengths)
  const sortedSkills = Object.entries(skillsObj).sort((a, b) => a[1] - b[1]);
  const weakestKeys = sortedSkills.slice(0, 2).map(([k]) => k);
  const strongestKeys = sortedSkills.slice(-2).map(([k]) => k);

  const skillNamesMap: Record<string, string> = {
    grammar: 'Gramática y Estructura',
    conversation: 'Fluidez Conversacional',
    vocabulary: 'Amplitud de Vocabulario',
    listening: 'Comprensión Auditiva',
    reading: 'Lectura Crítica',
    pronunciation: 'Pronunciación y Fonética',
    culture: 'Contexto Cultural y Pragmática',
    idioms: 'Modismos y Expresiones Idiomáticas'
  };

  const keyStrengths = strongestKeys.map(k => `${skillNamesMap[k] || k} (${skillsObj[k as keyof typeof skillsObj]}/100 pts)`);
  const growthOpportunities = weakestKeys.map(k => `${skillNamesMap[k] || k} (${skillsObj[k as keyof typeof skillsObj]}/100 pts) - Necesita refuerzo prioritario`);

  // Build 4 distinct modules without duplicates
  const pool = CURRICULUM_BANK[cefr] || CURRICULUM_BANK.B1;
  const rawModules: PersonalizedModule[] = [];
  const addedIds = new Set<string>();

  const tryAddModule = (mod?: PersonalizedModule) => {
    if (mod && !addedIds.has(mod.id)) {
      rawModules.push(mod);
      addedIds.add(mod.id);
    }
  };

  const getModuleForSkill = (skillKey: string): PersonalizedModule | undefined => {
    const validKey = skillKey as keyof typeof pool;
    if (pool[validKey] && pool[validKey].length > 0) {
      return pool[validKey][0];
    }
    return undefined;
  };

  // 1. Weakest skill module
  tryAddModule(getModuleForSkill(weakestKeys[0]));

  // 2. Second weakest skill module
  tryAddModule(getModuleForSkill(weakestKeys[1]));

  // 3. Conversation module
  tryAddModule(pool.conversation?.[0]);

  // 4. Cluster-tailored module
  if (student.clusterName.includes('Riesgo') || student.recencyDays > 60) {
    tryAddModule({
      id: `reactivation_${student.id}`,
      title: 'Micro-Desafío de Reenganche: 20 Minutos de Diálogo Situacional',
      skillFocus: 'Conversación Rápida',
      difficulty: 'easy',
      cefrTarget: cefr,
      estimatedMinutes: 20,
      learningGoal: 'Completar una sesión sin fricción para reactivar el hábito de estudio.',
      pedagogyTip: 'Proveer feedback positivo inmediato y fijar micro-objetivo para la siguiente semana.',
      suggestedActivities: ['Test rápido de 5 preguntas', 'Grabación de voz informal', 'Quiz gamificado']
    });
  } else if (student.clusterName.includes('Avanzado')) {
    tryAddModule(pool.idioms?.[0] || pool.grammar?.[0]);
  } else {
    tryAddModule(pool.listening?.[0] || pool.vocabulary?.[0]);
  }

  // Fill up to 4 modules if any were duplicates
  const allAvailableSkills = (['grammar', 'conversation', 'vocabulary', 'listening', 'pronunciation', 'idioms'] as const);
  for (const skill of allAvailableSkills) {
    if (rawModules.length >= 4) break;
    const candidate = pool[skill]?.[0];
    tryAddModule(candidate);
  }

  // Ensure each module in nextModules has a guaranteed unique instance ID
  const nextModules: PersonalizedModule[] = rawModules.slice(0, 4).map((mod, idx) => ({
    ...mod,
    id: `${mod.id}_slot${idx + 1}`
  }));

  let diagnosticSummary = `El alumno se encuentra en nivel ${cefr} dentro del segmento "${student.clusterName}". Registra un promedio de ${student.avgLessonDuration} min por sesión con ${Math.round(student.hardRatio * 100)}% de lecciones avanzadas. `;
  if (student.recencyDays > 60) {
    diagnosticSummary += `Alerta de inactividad: Han transcurrido ${student.recencyDays} días desde su última práctica. Se sugiere intervención proactiva.`;
  } else {
    diagnosticSummary += `Mantiene una constancia positiva de aprendizaje (${student.learningVelocity} lecciones/mes).`;
  }

  let recommendedScheduleFrequency = '2 sesiones semanales de 45 minutos (1 tutoría 1-a-1 + 1 club de conversación)';
  if (student.clusterName.includes('Avanzado')) {
    recommendedScheduleFrequency = '3 sesiones semanales de 60 minutos con enfoque en debate libre y redacción académica';
  } else if (student.clusterName.includes('Riesgo')) {
    recommendedScheduleFrequency = '1 sesión breve de reactivación de 25 minutos con mentor pedagógico';
  }

  return {
    studentId: student.id,
    studentName: student.full_name,
    cefrLevel: cefr,
    clusterName: student.clusterName,
    diagnosticSummary,
    keyStrengths,
    growthOpportunities,
    nextModules,
    recommendedScheduleFrequency,
    tailoredHomework: `Practicar 10 minutos diarios con la lista personalizada de colocaciones léxicas en la app y preparar 3 preguntas para el próximo club de conversación.`
  };
}

// Optional AI-powered custom syllabus generation using Gemini
export async function generateAIPlanWithGemini(
  student: StudentProfile,
  specificGoal?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;
  
  if (!apiKey) {
    return 'Nota: Clave de API de Gemini no detectada. Mostrando plan pedagógico optimizado generado por el motor algorítmico.';
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como un Coordinador Pedagógico Senior de una prestigiosa academia de idiomas.
Analiza el siguiente perfil de estudiante obtenido mediante clustering de Machine Learning:
- Nombre: ${student.full_name}
- Nivel estimado: ${student.cefrLevel}
- Segmento ML: ${student.clusterName}
- Total lecciones: ${student.totalLessons} (Dificultad media: ${student.difficultyScore}/3, Ratio difíciles: ${Math.round(student.hardRatio * 100)}%)
- Puntos de logros: ${student.totalPoints}
- Días desde última actividad: ${student.recencyDays}
- Fortalezas y debilidades estimadas:
  * Gramática: ${student.skills.grammar}/100
  * Conversación: ${student.skills.conversation}/100
  * Vocabulario: ${student.skills.vocabulary}/100
  * Escucha: ${student.skills.listening}/100
  * Fonética: ${student.skills.pronunciation}/100
  * Idioms/Modismos: ${student.skills.idioms}/100
- Meta adicional del alumno: ${specificGoal || 'Mejorar fluidez laboral y certificar nivel'}

Escribe un reporte pedagógico personalizado breve y contundente en español que contenga:
1. Diagnóstico de perfil de aprendizaje
2. Ruta de acción para las próximas 4 semanas (1 hito por semana)
3. Recomendaciones específicas para el profesor tutor
4. Dinámica recomendada para romper barreras psicológicas o de estancamiento.
Usa tono profesional, alentador y fundamentado en pedagogía comunicativa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || 'Plan generado correctamente.';
  } catch (error) {
    console.error('Error generating AI plan:', error);
    return 'No fue posible contactar con el modelo Gemini en este momento. Se recomienda utilizar el plan algorítmico predeterminado.';
  }
}
