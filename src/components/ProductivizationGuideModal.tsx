import React, { useState } from 'react';
import {
  Rocket,
  X,
  CheckCircle2,
  Circle,
  Globe,
  DollarSign,
  Smartphone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Server
} from 'lucide-react';

interface ProductivizationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductivizationGuideModal: React.FC<ProductivizationGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    check_1: true,  // GitHub y código listo
    check_2: true,  // Base de datos Firestore configurada
    check_3: true,  // PWA y alertas configuradas
    check_4: false, // Despliegue en Cloud Run o Vercel
    check_5: false, // Dominio propio (.com o .co)
    check_6: false, // Habilitación Llave Bre-B en banco
    check_7: false  // Envío masivo con WhatsApp Business API
  });

  if (!isOpen) return null;

  const steps = [
    {
      id: 0,
      title: '1. Tu Código y Repositorio en GitHub',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      badge: 'Completado',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'El código fuente completo de la plataforma está listo para producción con TypeScript, Vite y Tailwind CSS.',
      details: [
        {
          title: '¿Qué significa?',
          content: 'Todo el sistema (algoritmo de K-Means, portal de alumnos, agendamiento y pasarela Bre-B) está empaquetado en tu repositorio de GitHub bajo tu usuario rubenmoncadaamaya-cyber!.'
        },
        {
          title: 'Acción práctica:',
          content: 'Puedes descargar el repositorio o conectarlo directamente a servicios de despliegue continuo (CI/CD) que actualizan la página automáticamente cada vez que hagas un cambio.'
        }
      ]
    },
    {
      id: 1,
      title: '2. Alojamiento (Hosting) y Dominio Propio',
      icon: <Globe className="w-4 h-4 text-indigo-400" />,
      badge: 'Próximo Paso',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      description: 'Pon tu aplicación en internet con una dirección profesional (ej. www.tuacademia.com) accesible 24/7.',
      details: [
        {
          title: 'Opciones recomendadas sin costo mensual fijo:',
          content: 'Google Cloud Run o Firebase Hosting: Al ser serverless, soportan los 200 estudiantes y hasta 500 prospectos dentro de la capa gratuita de Google Cloud (costo aproximado de $0 USD mientras no superes millones de visitas).'
        },
        {
          title: 'Comprar tu dominio:',
          content: 'Adquiere tu dominio en Namecheap, GoDaddy o Google Domains (cuesta alrededor de $12 a $15 USD al año). Luego, vincula los registros DNS (CNAME) en menos de 5 minutos.'
        }
      ]
    },
    {
      id: 2,
      title: '3. Pasarela Bre-B e Interoperabilidad en Producción',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      badge: 'Cero Comisiones',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Recibe los $200.000 COP directamente en la cuenta bancaria de tu academia sin pagar el 3% al 5% que cobran pasarelas tradicionales.',
      details: [
        {
          title: '¿Cómo funciona la Llave Bre-B?',
          content: 'El Banco de la República de Colombia y Redeban crearon Bre-B para pagos inmediatos e interoperables entre todos los bancos (Bancolombia, Davivienda, Nu, Lulo, Nequi, Daviplata).'
        },
        {
          title: 'Paso bancario requerido:',
          content: 'Ingresa a la app o portal empresarial de tu banco y registra tu número celular o NIT como tu "Llave Bre-B Oficial". Cuando los padres paguen a esa llave, los fondos entran de inmediato con costo $0.'
        }
      ]
    },
    {
      id: 3,
      title: '4. Distribución PWA a Familias (Sin pagar a Apple/Google)',
      icon: <Smartphone className="w-4 h-4 text-amber-300" />,
      badge: 'PWA Activa',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Los padres y alumnos pueden instalar LinguaSegment AI en la pantalla de su celular con un solo clic.',
      details: [
        {
          title: 'Ventaja económica para tu academia:',
          content: 'Publicar una app en el App Store de Apple cuesta $99 USD/año y Google Play cobra $25 USD, además de demorarse semanas en revisiones. Con la tecnología PWA que acabamos de instalar, los padres abren tu link y tocan "Instalar App".'
        },
        {
          title: 'Experiencia idéntica a una app nativa:',
          content: 'Queda guardada con icono en el celular, funciona en pantalla completa sin barra de navegación y funciona aún con conexión lenta.'
        }
      ]
    },
    {
      id: 4,
      title: '5. Automatización de WhatsApp & Correos a Escala',
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      badge: 'Escalabilidad',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Pasa del clic manual de WhatsApp a envíos masivos y recordatorios programados 24/7.',
      details: [
        {
          title: 'Para 200 estudiantes y 500 prospectos:',
          content: 'La herramienta ya incluye integración interactiva directa por wa.me y mailto para enviar recordatorios individuales. Cuando quieras que el servidor envíe 200 WhatsApps automáticamente a las 8:00 AM, puedes vincular la WhatsApp Business Cloud API de Meta o Twilio.'
        },
        {
          title: 'Para correos electrónicos masivos:',
          content: 'Servicios como Resend o SendGrid ofrecen hasta 3.000 correos al mes 100% gratis, ideal para tus boletines y alertas de cobro.'
        }
      ]
    }
  ];

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / Object.keys(checklist).length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Guía de Productivización Paso a Paso
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Para Fundadores & Coordinadores
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ruta clara y sin complicaciones técnicas para llevar LinguaSegment AI a producción para tus 200 alumnos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Meter */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Progreso de Puesta en Marcha: {completedCount} de {Object.keys(checklist).length} hitos alcanzados</span>
            </span>
            <span className="text-indigo-400 font-mono font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {steps.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeStep === idx
                  ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-xs">{st.icon}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border font-mono ${st.badgeColor}`}>
                  {st.badge}
                </span>
              </div>
              <span className="text-[11px] font-bold text-white block line-clamp-1">
                {st.title.split('.')[1] || st.title}
              </span>
            </button>
          ))}
        </div>

        {/* Active Step Details */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold tracking-wider">
                Fase Detallada
              </span>
              <h3 className="text-base font-bold text-white">
                {steps[activeStep].title}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold border ${steps[activeStep].badgeColor}`}>
              {steps[activeStep].badge}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {steps[activeStep].description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {steps[activeStep].details.map((d, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-white block">{d.title}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">{d.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Checklist for Rubén */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Lista de Chequeo Operativo (Toca para marcar):</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              onClick={() => toggleCheck('check_1')}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors"
            >
              {checklist.check_1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className={checklist.check_1 ? 'line-through text-slate-400' : 'text-slate-200'}>
                Código en GitHub (rubenmoncadaamaya-cyber!)
              </span>
            </div>

            <div
              onClick={() => toggleCheck('check_2')}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors"
            >
              {checklist.check_2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className={checklist.check_2 ? 'line-through text-slate-400' : 'text-slate-200'}>
                Base de datos Firestore provisionada
              </span>
            </div>

            <div
              onClick={() => toggleCheck('check_3')}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors"
            >
              {checklist.check_3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className={checklist.check_3 ? 'line-through text-slate-400' : 'text-slate-200'}>
                PWA instalable y alertas WhatsApp / Mail
              </span>
            </div>

            <div
              onClick={() => toggleCheck('check_4')}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors"
            >
              {checklist.check_4 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className={checklist.check_4 ? 'line-through text-slate-400' : 'text-slate-200'}>
                Despliegue en Cloud Run / Firebase Hosting
              </span>
            </div>

            <div
              onClick={() => toggleCheck('check_5')}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors"
            >
              {checklist.check_5 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className={checklist.check_5 ? 'line-through text-slate-400' : 'text-slate-200'}>
                Asignar dominio institucional (.com o .co)
              </span>
            </div>

            <div
              onClick={() => toggleCheck('check_6')}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors"
            >
              {checklist.check_6 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className={checklist.check_6 ? 'line-through text-slate-400' : 'text-slate-200'}>
                Vincular Llave Bre-B en cuenta bancaria
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Todos los componentes técnicos necesarios ya están programados en la aplicación.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
