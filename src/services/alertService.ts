import { ScheduledClass, StudentProfile, PaymentRecord, AlertChannel, AlertType, AlertNotificationItem } from '../types';

/**
 * Normalizes a phone number to standard international format (+57 for Colombia if 10 digits starting with 3)
 */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '573105558899';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `57${cleaned}`;
  }
  return cleaned || '573105558899';
}

/**
 * Builds direct WhatsApp URL
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatWhatsAppNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds standard mailto URL
 */
export function buildMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Alert Templates Generator
 */
export const AlertTemplates = {
  // 1. Class Reminder Template
  classReminder: (cls: ScheduledClass, studentName: string) => {
    const formattedDate = new Date(cls.dateTime).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `🔔 Recordatorio de Clase: ${cls.title} · LinguaAcademy`;
    const message = 
`¡Hola ${studentName}! 👋

Te recordamos tu próxima clase en *LinguaAcademy*:

📚 *Sesión:* ${cls.title}
🎯 *Nivel:* ${cls.level || 'General'}
🗓 *Fecha y Hora:* ${formattedDate}
⏱ *Duración:* ${cls.durationMinutes} minutos
👨‍🏫 *Tutor:* ${cls.instructor}
📍 *Modalidad:* ${cls.modality === 'video_call' ? 'Videollamada en vivo' : 'Laboratorio de Práctica'}
🔗 *Enlace de Acceso:* ${cls.meetLink || 'https://meet.lingua-ai.edu/room-' + cls.id}

📌 *Recomendación:* Conéctate 5 minutos antes con tus audífonos listos para la sesión de práctica conversacional.

¡Nos vemos en clase!`;

    return { subject, message };
  },

  // 2. Class Enrollment Confirmation Template
  enrollmentConfirmation: (cls: ScheduledClass, studentName: string) => {
    const formattedDate = new Date(cls.dateTime).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `✅ Inscripción Confirmada: ${cls.title}`;
    const message = 
`¡Excelente noticia, ${studentName}! 🎉

Has quedado formalmente inscrito(a) en la clase programada de tu nivel *${cls.level || 'MCER'}*:

📖 *Materia:* ${cls.title}
🗓 *Horario asignado:* ${formattedDate}
👨‍🏫 *Profesor:* ${cls.instructor}
👥 *Cupo:* Confirmado y reservado en plataforma

Te enviaremos el enlace de videollamada y material de repaso antes de iniciar. Puedes consultar tu horario en el Portal de Estudiantes.`;

    return { subject, message };
  },

  // 3. Bre-B & Colombian Payment Reminder ($200.000 COP)
  paymentBreB: (studentName: string, amountCOP: number = 200000, dueDate: string = 'Fin de mes', refNumber: string = 'BREB-2026', breBKey: string = '3105558899') => {
    const subject = `💳 Recordatorio de Mensualidad Bre-B ($200.000 COP) - LinguaAcademy`;
    const message = 
`Hola ${studentName} y familia 👋

Te recordamos los datos para el pago mensual de tu suscripción académica en *LinguaAcademy*:

💵 *Valor:* $${amountCOP.toLocaleString('es-CO')} COP (Cero comisiones bancarias)
📅 *Fecha límite:* ${dueDate}
🔖 *Referencia:* ${refNumber}

🚀 *Canales Oficiales sin Costo (0% Comisión):*
1️⃣ *Llave Bre-B (Interoperable desde cualquier app bancaria):* ${breBKey}
2️⃣ *Billetera Nequi:* 310 555 8899
3️⃣ *Billetera Daviplata:* 310 555 8899
4️⃣ *Transfiya:* 310 555 8899

📲 Una vez realizado el pago, puedes confirmarlo directamente en tu portal de alumno o respondiendo a este mensaje con el comprobante. ¡Gracias por confiar en tu formación de idiomas!`;

    return { subject, message };
  },

  // 4. Diagnostic & Progress Alert
  diagnosticReport: (student: StudentProfile) => {
    const topSkills = Object.entries(student.skills)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([k, v]) => `${k} (${v}/100)`)
      .join(', ');

    const subject = `📊 Reporte de Avance Pedagógico - Nivel ${student.cefrLevel}`;
    const message = 
`¡Hola ${student.full_name}! 🌟

Compartimos tu diagnóstico pedagógico generado por la plataforma LinguaSegment AI:

🎯 *Nivel MCER Actual:* ${student.cefrLevel}
📈 *Segmento Pedagógico:* ${student.clusterName}
⏱ *Lecciones completadas:* ${student.totalLessons} (${((student.totalDurationMinutes || 0)/60).toFixed(1)} horas)
🏆 *Puntos acumulados:* ${student.totalPoints} pts
💪 *Habilidades destacadas:* ${topSkills}

El equipo docente ha preparado nuevos talleres ajustados a tus fortalezas para tu próximo hito de certificación.`;

    return { subject, message };
  }
};

/**
 * Dispatches an alert by triggering WhatsApp or Email client
 */
export function dispatchAlertAction(
  channel: 'whatsapp' | 'email',
  recipientContact: string,
  subject: string,
  message: string
): { success: boolean; url: string } {
  let url = '';

  if (channel === 'whatsapp') {
    url = buildWhatsAppUrl(recipientContact, message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } else {
    url = buildMailtoUrl(recipientContact, subject, message);
    if (typeof window !== 'undefined') {
      // Create hidden link or assign location
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return { success: true, url };
}
