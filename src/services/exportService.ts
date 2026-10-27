import { StudentProfile, MLCluster, MarketingProfile, MarketingCluster } from '../types';

export function exportStudentsToCSV(students: StudentProfile[], filename = 'segmentacion_estudiantes_lingua_ai.csv'): void {
  const headers = [
    'ID',
    'Nombre Completo',
    'Email',
    'Suscripción',
    'Segmento ML',
    'Nivel CEFR',
    'Total Lecciones',
    'Dificultad Promedio (1-3)',
    'Ratio Difíciles (%)',
    'Minutos Totales',
    'Duración Media (min)',
    'Total Puntos',
    'Total Logros',
    'Días Inactivo (Recency)',
    'Última Actividad',
    'Gramática (pts)',
    'Conversación (pts)',
    'Vocabulario (pts)',
    'Escucha (pts)',
    'Pronunciación (pts)',
    'Modismos (pts)'
  ];

  const rows = students.map(s => [
    s.id,
    `"${s.full_name.replace(/"/g, '""')}"`,
    `"${s.email}"`,
    s.subscription_type,
    `"${s.clusterName}"`,
    s.cefrLevel,
    s.totalLessons,
    s.difficultyScore.toFixed(2),
    `${Math.round(s.hardRatio * 100)}%`,
    s.totalDurationMinutes,
    s.avgLessonDuration,
    s.totalPoints,
    s.totalAchievements,
    s.recencyDays,
    s.lastActivityDate,
    s.skills.grammar,
    s.skills.conversation,
    s.skills.vocabulary,
    s.skills.listening,
    s.skills.pronunciation,
    s.skills.idioms
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(
  students: StudentProfile[],
  clusters: MLCluster[],
  filename = 'reporte_segmentacion_lingua_ai.xls'
): void {
  // Generate multi-section HTML spreadsheet with styling that Excel opens directly
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Segmentación y Clústeres</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; padding: 10px; border: 1px solid #CBD5E1; text-align: left; }
        td { padding: 8px; border: 1px solid #E2E8F0; }
        .num { text-align: right; }
        .title { font-size: 18px; font-weight: bold; color: #0F172A; margin: 15px 0 10px 0; }
        .subtitle { font-size: 13px; color: #64748B; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="title">REPORTE EJECUTIVO DE SEGMENTACIÓN PEDAGÓGICA (LINGUASEGMENT AI)</div>
      <div class="subtitle">Generado el ${new Date().toLocaleDateString('es-ES')} - Total Estudiantes: ${students.length}</div>

      <div class="title">1. Resumen de Clústeres de Aprendizaje Automático</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Segmento</th>
            <th>Alumnos</th>
            <th>% del Total</th>
            <th>Promedio Lecciones</th>
            <th>Puntos Medios</th>
            <th>Dificultad (1-3)</th>
            <th>Ratio Difícil</th>
            <th>Días Inactividad</th>
            <th>Enfoque Pedagógico Recomendado</th>
          </tr>
        </thead>
        <tbody>
  `;

  clusters.forEach(c => {
    html += `
      <tr>
        <td>${c.id}</td>
        <td><strong>${c.name}</strong></td>
        <td class="num">${c.size}</td>
        <td class="num">${c.percentage}%</td>
        <td class="num">${c.avgLessons}</td>
        <td class="num">${c.avgPoints}</td>
        <td class="num">${c.avgDifficulty}</td>
        <td class="num">${Math.round(c.hardRatio * 100)}%</td>
        <td class="num">${c.avgRecencyDays} d</td>
        <td>${c.recommendedFocus}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>

      <div class="title">2. Padrón Detallado de Estudiantes</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Segmento ML</th>
            <th>Nivel CEFR</th>
            <th>Lecciones</th>
            <th>Dificultad</th>
            <th>Horas de Estudio</th>
            <th>Puntos</th>
            <th>Días Inactivo</th>
            <th>Última Actividad</th>
          </tr>
        </thead>
        <tbody>
  `;

  students.forEach(s => {
    const hours = (s.totalDurationMinutes / 60).toFixed(1);
    html += `
      <tr>
        <td>${s.id}</td>
        <td><strong>${s.full_name}</strong></td>
        <td>${s.email}</td>
        <td>${s.subscription_type.toUpperCase()}</td>
        <td>${s.clusterName}</td>
        <td>${s.cefrLevel}</td>
        <td class="num">${s.totalLessons}</td>
        <td class="num">${s.difficultyScore.toFixed(2)}</td>
        <td class="num">${hours} h</td>
        <td class="num">${s.totalPoints}</td>
        <td class="num">${s.recencyDays}</td>
        <td>${s.lastActivityDate}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printExecutivePDFReport(
  students: StudentProfile[],
  clusters: MLCluster[]
): void {
  // Create a printable print-styled popup window that cleanly triggers window.print()
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para ver el reporte PDF imprimible.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalHours = Math.round(students.reduce((acc, s) => acc + s.totalDurationMinutes, 0) / 60);
  const avgHardRatio = Math.round((students.reduce((acc, s) => acc + s.hardRatio, 0) / (students.length || 1)) * 100);

  let clusterCards = '';
  clusters.forEach(c => {
    clusterCards += `
      <div style="border: 1px solid #CBD5E1; border-radius: 8px; padding: 14px; margin-bottom: 12px; background: #F8FAFC;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
          <h3 style="margin: 0; font-size: 15px; color: #0F172A;">${c.name} (${c.size} alumnos · ${c.percentage}%)</h3>
          <span style="font-weight: bold; color: ${c.color}; font-size: 13px;">Nivel Típico: ${c.dominantCefr}</span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;">${c.description}</p>
        <div style="font-size: 11px; color: #334155; line-height: 1.5;">
          <strong>Enfoque Didáctico:</strong> ${c.recommendedFocus}<br>
          <strong>Métricas Clave:</strong> ${c.avgLessons} lecciones prom. | ${c.avgPoints} pts | Dif. ${c.avgDifficulty}/3 | Inactividad: ${c.avgRecencyDays} días.
        </div>
      </div>
    `;
  });

  const topStudentsRows = students.slice(0, 15).map(s => `
    <tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${s.id}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">${s.full_name}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${s.clusterName}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${s.cefrLevel}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">${s.totalLessons}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">${s.difficultyScore.toFixed(2)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">${s.totalPoints} pts</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">${s.recencyDays}d</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Segmentación de Idiomas - LinguaSegment AI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 30px; line-height: 1.4; font-size: 13px; }
        .header { border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 22px; font-weight: 800; margin: 0; color: #0F172A; letter-spacing: -0.5px; }
        .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .kpi-card { border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; background: #F8FAFC; text-align: center; }
        .kpi-val { font-size: 22px; font-weight: 700; color: #0F172A; font-family: monospace; }
        .kpi-lbl { font-size: 11px; color: #64748B; text-transform: uppercase; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        th { background: #0F172A; color: white; padding: 8px; text-align: left; }
        @media print {
          body { margin: 0; font-size: 12px; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
        <button onclick="window.print()" style="background: #0F172A; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Imprimir / Guardar como PDF</button>
      </div>

      <div class="header">
        <div>
          <h1 class="title">LinguaSegment AI · Reporte Ejecutivo de Segmentación</h1>
          <div class="subtitle">Plataforma de Inteligencia Pedagógica y Aprendizaje Automático en Tiempo Real</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748B;">
          <strong>Fecha:</strong> ${dateStr}<br>
          <strong>Muestra Analizada:</strong> ${students.length} estudiantes
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val">${students.length}</div>
          <div class="kpi-lbl">Estudiantes Activos</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${clusters.length}</div>
          <div class="kpi-lbl">Segmentos ML Identificados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${totalHours}h</div>
          <div class="kpi-lbl">Horas de Práctica Acumuladas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${avgHardRatio}%</div>
          <div class="kpi-lbl">Ratio de Desafío Alto</div>
        </div>
      </div>

      <h2 style="font-size: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 20px;">1. Diagnóstico y Estrategia por Segmento</h2>
      ${clusterCards}

      <h2 style="font-size: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px;">2. Muestra de Estudiantes y Clasificación</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Segmento</th>
            <th style="text-align: center;">Nivel</th>
            <th style="text-align: right;">Lecciones</th>
            <th style="text-align: right;">Dificultad</th>
            <th style="text-align: right;">Puntos</th>
            <th style="text-align: right;">Inactividad</th>
          </tr>
        </thead>
        <tbody>
          ${topStudentsRows}
        </tbody>
      </table>

      <div style="margin-top: 30px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 10px;">
        Generado automáticamente por LinguaSegment AI · Todos los derechos reservados.
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
}

// ============================================
// MARKETING SEGMENTATION EXPORTS
// ============================================

export function exportMarketingToCSV(
  profiles: MarketingProfile[],
  filename = 'segmentacion_mercadeo_leads_idiomas.csv'
): void {
  const headers = [
    'ID Alumno',
    'Nombre Completo',
    'Email',
    'Suscripción Actual',
    'Segmento de Mercadeo',
    'Código Segmento',
    'Segmento ML (K-Means)',
    'Nivel CEFR',
    'Total Lecciones (ML)',
    'Horas de Estudio (h)',
    'Dificultad Media (1-3)',
    'Ratio Difíciles (%)',
    'Puntos de Logros',
    'Días Inactividad (Recency)',
    'Probabilidad Conversión (%)',
    'LTV Esperado (USD)',
    'Sensibilidad al Precio',
    'Canal Recomendado',
    'Oferta Comercial Sugerida',
    'Gancho Publicitario (Copy)',
    'Fuente de Lead',
    'Objetivo de Aprendizaje',
    'Rango de Presupuesto',
    'Industria / Ocupación',
    'Nivel de Urgencia',
    'Completitud Perfil (%)'
  ];

  const rows = profiles.map(p => [
    p.studentId,
    `"${p.fullName.replace(/"/g, '""')}"`,
    `"${p.email}"`,
    p.currentSubscription.toUpperCase(),
    `"${p.marketingClusterName}"`,
    p.marketingClusterCode,
    `"${p.mlClusterName}"`,
    p.cefrLevel,
    p.totalLessons,
    (p.totalDurationMinutes / 60).toFixed(1),
    p.difficultyScore.toFixed(2),
    `${Math.round(p.hardRatio * 100)}%`,
    p.totalPoints,
    p.recencyDays,
    `${p.conversionProbability}%`,
    `$${p.expectedLTV}`,
    p.priceSensitivity,
    `"${p.recommendedChannel}"`,
    `"${p.suggestedOffer.replace(/"/g, '""')}"`,
    `"${p.sampleCopyHook.replace(/"/g, '""')}"`,
    `"${p.leadSource || 'No registrado'}"`,
    `"${p.learningGoal || 'No especificado'}"`,
    `"${p.estimatedBudget || 'No indicado'}"`,
    `"${p.industry || 'No especificada'}"`,
    `"${p.urgencyLevel || 'Media (estimada)'}"`,
    `${p.profileCompleteness}%`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMarketingToExcel(
  profiles: MarketingProfile[],
  clusters: MarketingCluster[],
  filename = 'estrategia_mercadeo_segmentos_idiomas.xls'
): void {
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Segmentación Mercadeo</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
        th { background-color: #0F172A; color: #FFFFFF; font-weight: bold; padding: 9px; border: 1px solid #CBD5E1; text-align: left; }
        td { padding: 7px; border: 1px solid #E2E8F0; }
        .num { text-align: right; }
        .title { font-size: 17px; font-weight: bold; color: #0F172A; margin: 15px 0 6px 0; }
        .subtitle { font-size: 12px; color: #64748B; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="title">PLAN DE SEGMENTACIÓN PARA MERCADEO Y ADQUISICIÓN · SERVICIOS DE IDIOMAS</div>
      <div class="subtitle">Generado: ${new Date().toLocaleDateString('es-ES')} · Total Leads: ${profiles.length} · Integración Completa con Métricas de Machine Learning</div>

      <div class="title">1. Resumen Estratégico de Segmentos de Mercadeo y Perfil ML</div>
      <table>
        <thead>
          <tr>
            <th>Segmento Mercadeo</th>
            <th>Público Objetivo</th>
            <th>Leads</th>
            <th>% Cuota</th>
            <th>Conv. Promedio</th>
            <th>LTV Medio</th>
            <th>Clúster ML Dominante</th>
            <th>Nivel CEFR</th>
            <th>Lecciones Medias</th>
            <th>Puntos ML</th>
            <th>Oferta Principal</th>
            <th>Canal Clave</th>
          </tr>
        </thead>
        <tbody>
  `;

  clusters.forEach(c => {
    html += `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.targetAudience}</td>
        <td class="num">${c.size}</td>
        <td class="num">${c.percentage}%</td>
        <td class="num">${c.avgConversionRate}%</td>
        <td class="num">$${c.avgExpectedLTV}</td>
        <td>${c.dominantMlCluster}</td>
        <td style="text-align: center;">${c.dominantCefr}</td>
        <td class="num">${c.avgLessons}</td>
        <td class="num">${c.avgPoints}</td>
        <td>${c.primaryOffer}</td>
        <td>${c.primaryChannel}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>

      <div class="title">2. Padrón Calificado de Leads con Variables Comerciales y de Machine Learning</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Lead</th>
            <th>Email</th>
            <th>Plan Actual</th>
            <th>Segmento Mercadeo</th>
            <th>Segmento ML</th>
            <th>CEFR</th>
            <th>Lecciones</th>
            <th>Dificultad</th>
            <th>Puntos ML</th>
            <th>Inactividad</th>
            <th>Prob. Conv.</th>
            <th>LTV</th>
            <th>Oferta Recomendada</th>
            <th>Canal</th>
            <th>Fuente</th>
            <th>Objetivo</th>
            <th>Presupuesto</th>
            <th>Industria</th>
            <th>Completitud</th>
          </tr>
        </thead>
        <tbody>
  `;

  profiles.forEach(p => {
    html += `
      <tr>
        <td>${p.studentId}</td>
        <td><strong>${p.fullName}</strong></td>
        <td>${p.email}</td>
        <td>${p.currentSubscription.toUpperCase()}</td>
        <td>${p.marketingClusterName}</td>
        <td>${p.mlClusterName}</td>
        <td style="text-align: center;"><strong>${p.cefrLevel}</strong></td>
        <td class="num">${p.totalLessons}</td>
        <td class="num">${p.difficultyScore.toFixed(2)}</td>
        <td class="num">${p.totalPoints}</td>
        <td class="num">${p.recencyDays}d</td>
        <td class="num">${p.conversionProbability}%</td>
        <td class="num">$${p.expectedLTV}</td>
        <td>${p.suggestedOffer}</td>
        <td>${p.recommendedChannel}</td>
        <td>${p.leadSource || '-'}</td>
        <td>${p.learningGoal || '-'}</td>
        <td>${p.estimatedBudget || '-'}</td>
        <td>${p.industry || '-'}</td>
        <td class="num">${p.profileCompleteness}%</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printMarketingPDFReport(
  profiles: MarketingProfile[],
  clusters: MarketingCluster[]
): void {
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para ver el reporte PDF.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalPipelineLTV = profiles.reduce((acc, p) => acc + p.expectedLTV, 0);
  const highConversionCount = profiles.filter(p => p.conversionProbability >= 30).length;

  let clusterCards = '';
  clusters.forEach(c => {
    clusterCards += `
      <div style="border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; background: #F8FAFC;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
          <h3 style="margin: 0; font-size: 14px; color: #0F172A;">${c.name} (${c.size} leads · ${c.percentage}%)</h3>
          <span style="font-weight: bold; color: ${c.color}; font-size: 13px;">Conv. Estimada: ${c.avgConversionRate}% · LTV: $${c.avgExpectedLTV}</span>
        </div>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">${c.description}</p>
        <div style="font-size: 11px; color: #334155; line-height: 1.5;">
          <strong>Oferta:</strong> ${c.primaryOffer}<br>
          <strong>Canal Recomendado:</strong> ${c.primaryChannel}<br>
          <strong>Gancho de Campaña:</strong> <em>${c.recommendedHook}</em>
        </div>
      </div>
    `;
  });

  const sampleRows = profiles.slice(0, 15).map(p => `
    <tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">#${p.studentId}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">${p.fullName}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${p.marketingClusterName}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${p.conversionProbability}%</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${p.expectedLTV}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${p.leadSource || 'Orgánico'}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${p.preferredChannel || 'Email'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Segmentación para Mercadeo - LinguaSegment AI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 30px; line-height: 1.4; font-size: 13px; }
        .header { border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 20px; font-weight: 800; margin: 0; color: #0F172A; letter-spacing: -0.5px; }
        .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .kpi-card { border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; background: #F8FAFC; text-align: center; }
        .kpi-val { font-size: 20px; font-weight: 700; color: #0F172A; font-family: monospace; }
        .kpi-lbl { font-size: 11px; color: #64748B; text-transform: uppercase; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        th { background: #0F172A; color: white; padding: 8px; text-align: left; }
        @media print {
          body { margin: 0; font-size: 12px; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
        <button onclick="window.print()" style="background: #0F172A; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Imprimir / Guardar como PDF</button>
      </div>

      <div class="header">
        <div>
          <h1 class="title">LinguaSegment AI · Dossier de Segmentación para Mercadeo</h1>
          <div class="subtitle">Estrategia de Adquisición y Upsell para Servicios de Enseñanza de Idiomas</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748B;">
          <strong>Fecha:</strong> ${dateStr}<br>
          <strong>Base Calificada:</strong> ${profiles.length} prospectos
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val">${profiles.length}</div>
          <div class="kpi-lbl">Total Oportunidades</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">$${(totalPipelineLTV / 1000).toFixed(1)}k</div>
          <div class="kpi-lbl">Valor Pipeline (LTV)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${highConversionCount}</div>
          <div class="kpi-lbl">Leads Alta Prioridad (>30%)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${clusters.length}</div>
          <div class="kpi-lbl">Segmentos de Campaña</div>
        </div>
      </div>

      <h2 style="font-size: 15px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 20px;">1. Playbook de Campañas y Ofertas por Segmento</h2>
      ${clusterCards}

      <h2 style="font-size: 15px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px;">2. Muestra de Leads Calificados</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Segmento de Campaña</th>
            <th style="text-align: center;">Prob. Conv.</th>
            <th style="text-align: right;">LTV Est.</th>
            <th>Fuente</th>
            <th>Canal</th>
          </tr>
        </thead>
        <tbody>
          ${sampleRows}
        </tbody>
      </table>

      <div style="margin-top: 30px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 10px;">
        Generado automáticamente por LinguaSegment AI · Módulo de Mercadeo.
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
}

