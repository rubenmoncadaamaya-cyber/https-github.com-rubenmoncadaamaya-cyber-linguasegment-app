import React, { useState, useMemo } from 'react';
import { StudentProfile, PersonalizedStudentPlan } from '../types';
import { generatePersonalizedPlan, generateAIPlanWithGemini } from '../services/recommendationEngine';
import { Sparkles, Calendar, BookOpen, Target, Lightbulb, Clock, Check, RefreshCw } from 'lucide-react';

interface PersonalizationViewProps {
  students: StudentProfile[];
  initialStudentId?: number;
  onNavigateToSchedule: (student: StudentProfile, lessonTopic?: string) => void;
}

export const PersonalizationView: React.FC<PersonalizationViewProps> = ({
  students,
  initialStudentId,
  onNavigateToSchedule
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(
    initialStudentId || students[0]?.id || 1
  );
  const [customGoal, setCustomGoal] = useState('');
  const [aiPlanText, setAiPlanText] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const plan: PersonalizedStudentPlan = useMemo(() => {
    if (!currentStudent) {
      return {
        studentId: 1,
        studentName: '',
        cefrLevel: 'B1',
        clusterName: '',
        diagnosticSummary: '',
        keyStrengths: [],
        growthOpportunities: [],
        nextModules: [],
        recommendedScheduleFrequency: '',
        tailoredHomework: ''
      };
    }
    return generatePersonalizedPlan(currentStudent);
  }, [currentStudent]);

  const handleGenerateAI = async () => {
    if (!currentStudent) return;
    setIsGeneratingAI(true);
    setAiPlanText(null);
    try {
      const result = await generateAIPlanWithGemini(currentStudent, customGoal);
      setAiPlanText(result);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Cargando datos de estudiantes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Motor de Personalización Curricular y Adaptativa</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescripción pedagógica en tiempo real según nivel CEFR, brechas cognitivas y cluster conductual.
          </p>
        </div>

        {/* Student Selector Dropdown */}
        <div className="w-full md:w-80">
          <label className="text-[11px] text-slate-400 block mb-1">
            Seleccionar Alumno a Personalizar ({students.length} disponibles):
          </label>
          <select
            value={selectedStudentId}
            onChange={e => {
              setSelectedStudentId(parseInt(e.target.value, 10));
              setAiPlanText(null);
            }}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                #{s.id} - {s.full_name} ({s.cefrLevel} · {s.clusterName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Diagnostic & Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Diagnostic card */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Nivel CEFR Actual</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {plan.cefrLevel}
                </span>
                <span className="text-xs text-indigo-400 font-medium">
                  {plan.cefrLevel === 'C1' ? 'Avanzado / Dominio Operativo' :
                   plan.cefrLevel === 'B2' ? 'Intermedio Alto / Independiente' :
                   plan.cefrLevel === 'B1' ? 'Intermedio / Umbral' :
                   plan.cefrLevel === 'A2' ? 'Básico / Plataforma' : 'Acceso / Principiante'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Segmento ML</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block" style={{ backgroundColor: `${currentStudent.clusterColor}20`, color: currentStudent.clusterColor }}>
                {plan.clusterName}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
            {plan.diagnosticSummary}
          </p>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Ritmo de estudio:</span>
              <strong className="text-slate-200 font-mono">{currentStudent.learningVelocity} lecciones/mes</strong>
            </div>
            <div className="flex justify-between">
              <span>Ratio lecciones difíciles:</span>
              <strong className="text-slate-200 font-mono">{Math.round(currentStudent.hardRatio * 100)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Inactividad reciente:</span>
              <strong className="text-slate-200 font-mono">{currentStudent.recencyDays} días</strong>
            </div>
          </div>
        </div>

        {/* Strengths & Growth Areas */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Diagnóstico de Competencias</span>
          </h3>

          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              Fortalezas Clave Consolidadas:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {plan.keyStrengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Brechas y Oportunidades Prioritarias:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {plan.growthOpportunities.map((opp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cadence & Homework */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Cadencia Recomendada</span>
            </h3>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <strong className="block text-indigo-300 font-semibold mb-1">Frecuencia Óptima:</strong>
              {plan.recommendedScheduleFrequency}
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Micro-Tarea Asignada:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {plan.tailoredHomework}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToSchedule(currentStudent, plan.nextModules[0]?.title)}
            className="mt-4 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Clase con este Plan</span>
          </button>
        </div>
      </div>

      {/* Recommended 4 Adaptive Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Secuencia Pedagógica Prescrita (Próximos 4 Módulos Adaptativos)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diseñados específicamente para mitigar sus brechas en {plan.growthOpportunities[0]?.split(' ')[0] || 'conversación'} y consolidar nivel {plan.cefrLevel}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.nextModules.map((mod, index) => (
            <div
              key={`${mod.id}_${index}`}
              className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                    0{index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {mod.title}
                    </h4>
                    <span className="text-[11px] text-indigo-400 font-medium">
                      Eje: {mod.skillFocus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                    mod.difficulty === 'hard' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    mod.difficulty === 'medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {mod.difficulty}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {mod.estimatedMinutes}m
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5">
                <div>
                  <strong className="text-slate-400 text-[11px] block">Objetivo de Aprendizaje:</strong>
                  <p>{mod.learningGoal}</p>
                </div>
                
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Nota para el Tutor:</strong> {mod.pedagogyTip}</span>
                </div>

                <div>
                  <strong className="text-slate-400 text-[11px] block mb-1">Actividades Sugeridas:</strong>
                  <div className="flex flex-wrap gap-1">
                    {mod.suggestedActivities.map((act, aIdx) => (
                      <span key={aIdx} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Custom Syllabus Generation Section */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Generador Inteligente de Syllabus con IA (Gemini 2.5 Flash)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Crea un reporte pedagógico personalizado de 4 semanas para el tutor.
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Objetivo específico (ej. Enseñanza Infantil: clases lúdicas con canciones, entrevista laboral, examen C1...)"
              value={customGoal}
              onChange={e => setCustomGoal(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analizando Perfil...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar Informe Pedagógico con IA</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 font-medium">Metas sugeridas:</span>
            <button
              type="button"
              onClick={() => setCustomGoal('Enseñanza Infantil / Kids: iniciación lúdica con canciones, fonética y cuentos interactivos para niños de 4-10 años')}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-950/60 text-pink-300 border border-pink-800/80 hover:bg-pink-900/60 transition-colors"
            >
              🧸 Enseñanza Infantil / Kids (Gamificación)
            </button>
            <button
              type="button"
              onClick={() => setCustomGoal('Desarrollo Profesional: inglés para entrevistas, presentaciones técnicas y reuniones B2B')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              💼 Carrera & Negocios B2B
            </button>
            <button
              type="button"
              onClick={() => setCustomGoal('Certificación Oficial: preparación intensiva para alcanzar banda 7.5 en IELTS o 100+ en TOEFL')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              🎯 Certificación IELTS / TOEFL
            </button>
            <button
              type="button"
              onClick={() => setCustomGoal('Viajes e Inmersión: fluidez conversacional en restaurantes, aeropuertos y situaciones cotidianas')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              ✈️ Viajes & Ocio
            </button>
          </div>
        </div>

        {aiPlanText && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {aiPlanText}
          </div>
        )}
      </div>
    </div>
  );
};
