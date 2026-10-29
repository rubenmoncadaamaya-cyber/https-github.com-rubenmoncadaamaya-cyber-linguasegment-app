import { ClassConfigTemplate, StudentEvaluation, CEFRLevel } from '../types';

export const CLASS_CONFIG_TEMPLATES: ClassConfigTemplate[] = [
  {
    id: 'tpl_conv_b1_b2',
    name: 'Club de Conversación & Debate de Actualidad (B1/B2)',
    code: 'CONV-B1B2',
    level: 'B1',
    defaultDuration: 55,
    defaultModality: 'video_call',
    defaultCapacity: 12,
    curriculumUnit: 'Unidad 4: Argumentación, Modismos y Conectores de Causa/Efecto',
    learningObjectives: [
      'Expresar opiniones con fluidez usando conectores formales e informales',
      'Defender un punto de vista en debates guiados sin pausas excesivas',
      'Identificar y corregir errores recurrentes de sintaxis en tiempo real'
    ],
    suggestedMaterials: [
      'Guía PDF: 25 Modismos Imprescindibles para Discusiones',
      'Video TED-Ed: "The Psychology of Effective Communication"',
      'Miro Board con tarjetas de debate temático'
    ],
    pedagogyTips: 'Fomentar la participación equitativa; limitar la intervención docente a máximo 20% del tiempo de clase.'
  },
  {
    id: 'tpl_phon_a2',
    name: 'Laboratorio de Fonética: Pares Mínimos & Connected Speech (A2)',
    code: 'PHON-A2',
    level: 'A2',
    defaultDuration: 45,
    defaultModality: 'audio_lab',
    defaultCapacity: 15,
    curriculumUnit: 'Unidad 2: Enlace Sonoro (Linking), Reducción Vocálica y /th/ vs /d/',
    learningObjectives: [
      'Dominar la distinción auditiva y muscular entre /θ/ y /ð/',
      'Aplicar enlace de consonante con vocal en frases cotidianas',
      'Mejorar la inteligibilidad global al hablar a velocidad normal'
    ],
    suggestedMaterials: [
      'Audio Lab Interactivo con oscilograma de voz',
      'Ficha de Pares Mínimos (Ship/Sheep, Bat/Bet, Thought/Taught)',
      'Grabadora de audio para autoevaluación'
    ],
    pedagogyTips: 'Usar técnica de repetición coral y luego grabaciones individuales cortas de 10 segundos.'
  },
  {
    id: 'tpl_gram_b1',
    name: 'Gramática en Acción: Tiempos Perfectos vs Pasado Simple (B1)',
    code: 'GRAM-B1',
    level: 'B1',
    defaultDuration: 50,
    defaultModality: 'video_call',
    defaultCapacity: 14,
    curriculumUnit: 'Unidad 5: Contrastes Temporales y Narración de Experiencias de Vida',
    learningObjectives: [
      'Diferenciar con precisión cuándo usar Present Perfect vs Past Simple',
      'Utilizar adverbios temporales clave (yet, already, since, for, ever)',
      'Narrar una anécdota personal sin cometer mezclas temporales'
    ],
    suggestedMaterials: [
      'Línea de tiempo visual interactiva',
      'Ejercicio de completar espacios contextuales en vivo',
      'Juego de rol: Entrevista de trabajo y logros pasados'
    ],
    pedagogyTips: 'Evitar explicaciones teóricas largas; demostrar la diferencia a través de contrastes situacionales.'
  },
  {
    id: 'tpl_kids_phonics',
    name: 'LinguaKids: Fonética Lúdica, Rimas y Cuentos Mágicos (4-8 años)',
    code: 'KIDS-A1',
    level: 'A1',
    defaultDuration: 35,
    defaultModality: 'video_call',
    defaultCapacity: 10,
    curriculumUnit: 'Módulo Infantil: Sonidos Iniciales, Rimas con Movimiento y Animales',
    learningObjectives: [
      'Reconocer los sonidos fonéticos básicos /b/, /p/, /m/, /s/ con mímica',
      'Cantar la rima musical de la semana asociando imagen y sonido',
      'Asociar 8 palabras clave de animales con su pronunciación correcta'
    ],
    suggestedMaterials: [
      'Cuento ilustrado digital en pantalla',
      'Tarjetas visuales animadas (Flashcards de animales)',
      'Pistas musicales con ritmo marcado'
    ],
    pedagogyTips: 'Cambiar de dinámica cada 7 minutos; utilizar refuerzo positivo constante y felicitaciones sonoras.'
  },
  {
    id: 'tpl_b2_c1_exam',
    name: 'Simulacro y Estrategias para Certificación Oficial IELTS/TOEFL (B2/C1)',
    code: 'CERT-B2C1',
    level: 'B2',
    defaultDuration: 60,
    defaultModality: 'video_call',
    defaultCapacity: 8,
    curriculumUnit: 'Módulo Avanzado: Speaking Part 2 & Writing Task 2 con Cronómetro',
    learningObjectives: [
      'Estructurar una respuesta de 2 minutos bajo presión sin titubeos',
      'Incorporar vocabulario de banda 7.5+ y estructuras gramaticales complejas',
      'Conocer los criterios exactos de evaluación de los examinadores oficiales'
    ],
    suggestedMaterials: [
      'Tarjetas oficiales de preguntas tipo IELTS Speaking Part 2',
      'Rúbrica de calificación oficial en pantalla compartida',
      'Cronómetro de examen en vivo'
    ],
    pedagogyTips: 'Grabar las respuestas y hacer retroalimentación inmediata basada estrictamente en la rúbrica oficial.'
  },
  {
    id: 'tpl_a1_placement',
    name: 'Sesión de Nivelación y Desbloqueo Lingüístico 1-a-1 (A1/A2)',
    code: 'LEVEL-1TO1',
    level: 'A1',
    defaultDuration: 30,
    defaultModality: 'video_call',
    defaultCapacity: 1,
    curriculumUnit: 'Tutoría Personalizada: Pérdida del Temor a Hablar y Diagnóstico Fino',
    learningObjectives: [
      'Crear un ambiente de total confianza para que el estudiante hable sin vergüenza',
      'Identificar la causa raíz del bloqueo comunicativo',
      'Trazar un plan de estudio semanal alcanzable'
    ],
    suggestedMaterials: [
      'Formulario de diagnóstico rápido de 10 preguntas conversacionales',
      'Ficha de metas personales del alumno',
      'Hoja de ruta personalizada de 4 semanas'
    ],
    pedagogyTips: 'Validar positivamente cada intento del estudiante; nunca interrumpir abruptamente durante la expresión de una idea.'
  }
];

export const INITIAL_STUDENT_EVALUATIONS: StudentEvaluation[] = [
  {
    id: 'eval_001',
    studentId: 1,
    studentName: 'Zara Hoffmann',
    studentEmail: 'zara.hoffmann@example.net',
    evaluatorName: 'Dra. Carmen Valenzuela',
    evaluationDate: '2025-01-22',
    cefrLevel: 'A2',
    lessonTopic: 'Taller de Rutinas y Descripción Temporal',
    scores: {
      grammar: 84,
      pronunciation: 88,
      conversation: 86,
      listening: 90,
      vocabulary: 82,
      reading: 88
    },
    averageScore: 86,
    performance: 'Sobresaliente',
    strengths: 'Excelente entonación en preguntas y muy buena comprensión auditiva natural.',
    growthAreas: 'Reforzar el uso del pasado irregular (went, saw, bought) en conversaciones espontáneas.',
    assignedHomework: 'Grabar audio de 1 minuto describiendo las actividades del fin de semana usando conectores de tiempo.',
    teacherFeedback: 'Zara muestra un avance acelerado. Está lista para comenzar lecciones introductorias a nivel B1.',
    attendanceStatus: 'Presente',
    sharedViaWhatsApp: true,
    sharedViaEmail: true
  },
  {
    id: 'eval_002',
    studentId: 8,
    studentName: 'Mila Schneider',
    studentEmail: 'mila.schneider@example.com',
    evaluatorName: 'Prof. David Sterling',
    evaluationDate: '2025-01-20',
    cefrLevel: 'B2',
    lessonTopic: 'Debate de Actualidad y Modismos',
    scores: {
      grammar: 92,
      pronunciation: 90,
      conversation: 94,
      listening: 95,
      vocabulary: 91,
      reading: 93
    },
    averageScore: 93,
    performance: 'Sobresaliente',
    strengths: 'Capacidad sobresaliente de argumentación y uso espontáneo de modismos sin titubear.',
    growthAreas: 'Perfeccionar matices formales en redacción escrita y cartas argumentativas.',
    assignedHomework: 'Lectura de artículo de The Economist y síntesis de 2 párrafos.',
    teacherFeedback: 'Mila tiene un nivel casi nativo en comprensión oral. Recomendada para preparación de examen C1.',
    attendanceStatus: 'Presente',
    sharedViaWhatsApp: true,
    sharedViaEmail: false
  },
  {
    id: 'eval_003',
    studentId: 2,
    studentName: 'Yara Schmidt',
    studentEmail: 'yara.schmidt@example.net',
    evaluatorName: 'Lic. Mateo Rivas',
    evaluationDate: '2025-01-18',
    cefrLevel: 'A1',
    lessonTopic: 'Diagnóstico Conversacional de Reactivación',
    scores: {
      grammar: 62,
      pronunciation: 68,
      conversation: 64,
      listening: 70,
      vocabulary: 65,
      reading: 72
    },
    averageScore: 67,
    performance: 'En Progreso',
    strengths: 'Gran motivación para retomar el estudio y buena retención de vocabulario básico.',
    growthAreas: 'Inseguridad al conjugar en presente simple con tercera persona (he/she/it).',
    assignedHomework: 'Completar los 3 ejercicios interactivos del módulo A1 y escuchar la rima fonética.',
    teacherFeedback: 'Yara necesita sesiones cortas pero frecuentes de 30 minutos para consolidar el hábito.',
    attendanceStatus: 'Presente',
    sharedViaWhatsApp: false,
    sharedViaEmail: true
  }
];

/**
 * Generates a downloadable CSV string for class configuration templates
 */
export function generateClassesCSVTemplate(): string {
  const headers = [
    'Titulo_Clase',
    'Nivel_MCER',
    'Materia_Tema',
    'Profesor_Tutor',
    'Fecha_Hora_ISO',
    'Duracion_Minutos',
    'Modalidad',
    'Cupo_Maximo',
    'Enlace_Videollamada',
    'Objetivos_Aprendizaje'
  ];

  const sampleRows = [
    [
      '"Club de Conversación B1"',
      '"B1"',
      '"Modismos y Argumentación"',
      '"Dra. Carmen Valenzuela"',
      '"2025-02-01T18:00"',
      '55',
      '"video_call"',
      '15',
      '"https://meet.google.com/abc-defg-hij"',
      '"Debate fluido de noticias actuales"'
    ],
    [
      '"Laboratorio de Fonética A2"',
      '"A2"',
      '"Pares Mínimos y Connected Speech"',
      '"Prof. David Sterling"',
      '"2025-02-02T16:30"',
      '45',
      '"audio_lab"',
      '12',
      '"https://meet.google.com/xyz-uvwx-rst"',
      '"Entrenamiento de oído y fonemas complejos"'
    ]
  ];

  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
}

/**
 * Generates a downloadable CSV string for student evaluations
 */
export function generateEvaluationsCSVTemplate(): string {
  const headers = [
    'Estudiante_ID',
    'Nombre_Estudiante',
    'Correo_Estudiante',
    'Profesor_Evaluador',
    'Fecha_Evaluacion',
    'Nivel_MCER',
    'Tema_Leccion',
    'Gramatica_1_100',
    'Pronunciacion_1_100',
    'Fluidez_1_100',
    'Listening_1_100',
    'Vocabulario_1_100',
    'Lectura_1_100',
    'Puntaje_Promedio',
    'Desempeno',
    'Fortalezas',
    'Oportunidades_Mejora',
    'Observaciones_Docente'
  ];

  const sampleRows = [
    [
      '1',
      '"Zara Hoffmann"',
      '"zara.hoffmann@example.net"',
      '"Dra. Carmen Valenzuela"',
      '"2025-01-22"',
      '"A2"',
      '"Rutinas y Pasados"',
      '84',
      '88',
      '86',
      '90',
      '82',
      '88',
      '86',
      '"Sobresaliente"',
      '"Buena entonación y fluidez"',
      '"Repasar pasados irregulares"',
      '"Lista para avanzar a temas B1"'
    ]
  ];

  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
}
