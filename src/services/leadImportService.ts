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
 * 50 realistic Colombian test leads representing all segments:
 * Enseñanza Infantil, B2B Corporativo, Certificación Oficial, VIP, Viajes, Winback y Nurturing.
 */
export const SAMPLE_50_LEADS_CSV = `full_name,email,subscription,learning_goal,estimated_budget,industry,urgency_level,lead_source,total_lessons,cefr_level,notes
Mariana Benítez Osorio,mbenitez.madre@gmail.com,premium,Enseñanza Infantil / Kids (4-12 años),Premium / VIP ($100-220/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Instagram Ads,8,A1,Mamá de Mateo (6 años). Busca clases lúdicas con canciones y cuentos en Bogotá
Rodrigo Arismendi Gómez,rarismendi@colegio.edu.co,basic,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Media (1-3 meses),Referral / Boca a Boca,5,A1,Papá de mellizos de 8 años en Medellín. Iniciación bilingüe escolar
Claudia Patricia Henao,claudia.henao@familias.co,free,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Instagram Ads,2,A1,Madre de Sofía (5 años). Desea estimulación temprana y fonética en Cali
Felipe Andrés Restrepo,felipe.restrepo.papa@gmail.com,premium,Enseñanza Infantil / Kids (4-12 años),Premium / VIP ($100-220/mes),Padres de Familia / Escolar,Media (1-3 meses),Google Search,10,A2,Padre de Lucas (9 años). Apoyo para colegio bilingüe en Chía
Natalia María Zuluaga,natalia.zuluaga@educacion.co,basic,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Instagram Ads,4,A1,Madre de Martín (7 años). Le interesan clases interactivas con juegos en Envigado
Juan Guillermo Londoño,jglondono.padre@yahoo.com,free,Enseñanza Infantil / Kids (4-12 años),Económico ($15-35/mes),Padres de Familia / Escolar,Baja / Exploratoria,Organic / Blog,1,A1,Papá de Luciana (4 años). Buscando opciones accesibles para preescolar
Andrea Marcela Cárdenas,andrea.cardenas@servicios.com,premium,Enseñanza Infantil / Kids (4-12 años),Premium / VIP ($100-220/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Referral / Boca a Boca,12,A2,Madre de Juan José (11 años). Preparación para campamento de verano en USA
David Esteban Morales,dmorales.familia@outlook.com,basic,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Media (1-3 meses),Instagram Ads,6,A1,Padre de Isabella (8 años) en Barranquilla. Interés en fluidez oral
Paola Andrea Echeverry,paola.echeverry@colombia.org,free,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Media (1-3 meses),Google Search,3,A1,Madre de Tomás (6 años) y Daniela (9 años) en Pereira
Santiago Vélez Montoya,santiago.velez@alcaldia.gov.co,basic,Enseñanza Infantil / Kids (4-12 años),Estándar ($40-85/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Webinar Educativo,5,A1,Papá de Gabriela (10 años). Interesado en club de conversación infantil
Diana Milena Quintero,diana.quintero@gmail.com,premium,Enseñanza Infantil / Kids (4-12 años),Premium / VIP ($100-220/mes),Padres de Familia / Escolar,Alta (< 2 semanas),Instagram Ads,9,A2,Mamá de Emiliano (7 años) en Bucaramanga. Desea tutor nativo 1 a 1
Carlos Eduardo Betancur,cbetancur.padre@hotmail.com,free,Enseñanza Infantil / Kids (4-12 años),Económico ($15-35/mes),Padres de Familia / Escolar,Baja / Exploratoria,Referral / Boca a Boca,2,A1,Papá de Salomé (5 años) en Manizales. Desea probar clase demo
Alejandra Ramos Pineda,alejandra.ramos@techcorp.co,basic,Desarrollo Profesional / B2B,Corporativo Empresarial,Tecnología & Software,Alta (< 2 semanas),LinkedIn B2B,7,B2,Tech Lead en fintech de Bogotá. Requiere inglés para liderar equipo en EE.UU.
Mauricio Silva Santos,mauricio.silva@bancolombia.com.co,premium,Desarrollo Profesional / B2B,Corporativo Empresarial,Finanzas & Negocios,Alta (< 2 semanas),LinkedIn B2B,14,B2,VP Adjunto de Riesgos. Presentación de resultados a fondos de inversión en NY
Valentina Casas Franco,vcasas@mercadolibre.com,basic,Desarrollo Profesional / B2B,Corporativo Empresarial,Tecnología & Software,Media (1-3 meses),Google Search,6,B1,Product Manager en MercadoLibre. Reuniones diarias en inglés con equipos regionales
Andrés Felipe Ospina,andres.ospina@rappi.com,free,Desarrollo Profesional / B2B,Corporativo Empresarial,Tecnología & Software,Alta (< 2 semanas),LinkedIn B2B,3,B1,Backend Engineer preparando entrevistas técnicas para unicornio de Silicon Valley
Juliana Correa Tabares,jcorrea@nutresa.com,premium,Desarrollo Profesional / B2B,Corporativo Empresarial,Finanzas & Negocios,Media (1-3 meses),Referral / Boca a Boca,11,B2,Gerente de Expansión Internacional. Negociación de contratos con proveedores asiáticos
Gustavo Adolfo Parra,gustavo.parra@globant.com,basic,Desarrollo Profesional / B2B,Corporativo Empresarial,Tecnología & Software,Alta (< 2 semanas),LinkedIn B2B,8,B2,Software Architect en Globant. Pitch comercial con clientes de Reino Unido
Luisa Fernanda Mendoza,lmendoza@ecopetrol.com.co,premium,Desarrollo Profesional / B2B,Corporativo Empresarial,Finanzas & Negocios,Media (1-3 meses),Webinar Educativo,9,B1,Líder de sostenibilidad en Ecopetrol. Conferencia internacional de energía
Héctor Fabio Carmona,hcarmona@segurosbolivar.com,basic,Desarrollo Profesional / B2B,Corporativo Empresarial,Finanzas & Negocios,Media (1-3 meses),LinkedIn B2B,5,B1,Director actuarial. Interés en terminología financiera anglosajona
Carlos Mendoza Vidal,cmendoza@uniandes.edu.co,premium,Certificación Oficial (IELTS/TOEFL),Premium / VIP ($100-220/mes),Estudiante Universitario,Alta (< 2 semanas),Google Search,13,B2,Graduado de economía preparando IELTS Académico (banda 7.5 requerida para LSE)
Camila Torres Vargas,ctorres@javeriana.edu.co,basic,Certificación Oficial (IELTS/TOEFL),Estándar ($40-85/mes),Estudiante Universitario,Alta (< 2 semanas),Instagram Ads,8,B2,Estudiante de Medicina Javeriana. Preparando examen OET para residencia en Reino Unido
Javier Ignacio Rojas,jrojas@eafit.edu.co,free,Certificación Oficial (IELTS/TOEFL),Estándar ($40-85/mes),Estudiante Universitario,Media (1-3 meses),Google Search,4,B1,Ingeniero mecánico EAFIT aplicando a beca Erasmus Mundus en Alemania
Daniela Sofía Rincón,daniela.rincon@unal.edu.co,basic,Certificación Oficial (IELTS/TOEFL),Estándar ($40-85/mes),Estudiante Universitario,Alta (< 2 semanas),Webinar Educativo,7,B2,Bióloga Universidad Nacional preparando TOEFL iBT (meta 100 puntos) para Canadá
Sebastián Marín Ocampo,smarin.toefl@gmail.com,premium,Certificación Oficial (IELTS/TOEFL),Premium / VIP ($100-220/mes),Finanzas & Negocios,Alta (< 2 semanas),Referral / Boca a Boca,10,B2,Consultor en Deloitte preparando GMAT e IELTS para MBA en INSEAD
Manuela Gómez Salcedo,mgomez.ielts@yahoo.com,basic,Certificación Oficial (IELTS/TOEFL),Estándar ($40-85/mes),Educación & Academia,Media (1-3 meses),Google Search,6,B1,Docente universitaria aplicando a doctorado en University of Melbourne
Nicolás Duque Arango,nduque@uis.edu.co,free,Certificación Oficial (IELTS/TOEFL),Económico ($15-35/mes),Estudiante Universitario,Media (1-3 meses),Organic / Blog,3,B1,Estudiante de UIS Bucaramanga preparando requisito de grado y visa de trabajo
Guillermo Vidal Pardo,gvidal@hospitalpablo.org,premium,Desarrollo Profesional / B2B,Premium / VIP ($100-220/mes),Salud & Medicina,Alta (< 2 semanas),Webinar Educativo,15,B2,Cirujano cardiovascular aplicando a fellowship de especialización en Boston
Klaus Alberto Weber,klaus.weber@abogados.com.co,premium,Certificación Oficial (IELTS/TOEFL),Premium / VIP ($100-220/mes),Finanzas & Negocios,Alta (< 2 semanas),Referral / Boca a Boca,16,C1,Socio de firma tributaria preparando certificación legal TOLES
Verónica Salazar Ríos,vsalazar@creativos.co,premium,Desarrollo Profesional / B2B,Premium / VIP ($100-220/mes),Tecnología & Software,Media (1-3 meses),Instagram Ads,12,B2,Directora creativa en agencia digital. Gestión de cuentas en EE.UU. y Canadá
Esteban Morales Peña,emorales@constructora.com.co,basic,Desarrollo Profesional / B2B,Premium / VIP ($100-220/mes),Finanzas & Negocios,Alta (< 2 semanas),Referral / Boca a Boca,9,B1,Gerente de proyectos inmobiliarios. Interés en negociar con inversionistas de Miami
Catalina Botero Luján,cbotero@laboratorios.com,premium,Desarrollo Profesional / B2B,Premium / VIP ($100-220/mes),Salud & Medicina,Media (1-3 meses),LinkedIn B2B,14,B2,Gerente de asuntos regulatorios farmacéuticos para Latinoamérica
Jorge Enrique Pinzón,jpinzon@inversiones.co,premium,Desarrollo Profesional / B2B,Premium / VIP ($100-220/mes),Finanzas & Negocios,Alta (< 2 semanas),LinkedIn B2B,15,C1,Managing Director en banca de inversión. Negociación M&A con firmas de Wall Street
Daniela Soto Carvajal,daniela.soto@viajes.com.co,free,Viajes e Inmersión,Económico ($15-35/mes),Turismo & Hospitalidad,Baja / Exploratoria,Instagram Ads,3,A2,Guía de turismo en Cartagena interesada en inglés conversacional para cruceros
Simón Arango Calle,simon.arango.viajero@gmail.com,free,Viajes e Inmersión,Económico ($15-35/mes),Turismo & Hospitalidad,Media (1-3 meses),Instagram Ads,4,A2,Chef planificando pasantía gastronómica en restaurantes de Dublín
Laura Camila Beltrán,laura.beltran@viajeros.co,basic,Viajes e Inmersión,Estándar ($40-85/mes),Turismo & Hospitalidad,Media (1-3 meses),Google Search,5,B1,Viaje sabático de 6 meses por el sudeste asiático y Oceanía
Lucas Mateo Herrera,lucas.herrera@nomada.io,basic,Viajes e Inmersión,Estándar ($40-85/mes),Tecnología & Software,Baja / Exploratoria,Referral / Boca a Boca,6,B1,Nómada digital trabajando desde Medellín. Desea soltura social para coworking
Carolina Vega Castillo,carolina.vega@gmail.com,free,Viajes e Inmersión,Económico ($15-35/mes),Educación & Academia,Baja / Exploratoria,Organic / Blog,2,A1,Diseñadora de modas preparando viaje a la semana de la moda en Milán y Londres
Pablo César Zambrano,pzambrano@turismo.gov.co,basic,Viajes e Inmersión,Estándar ($40-85/mes),Turismo & Hospitalidad,Media (1-3 meses),Instagram Ads,5,A2,Funcionario del viceministerio de turismo promoviendo destinos colombianos
Ignacio Valdés Cuéllar,ivaldes.rescate@retail.com,basic,Desarrollo Profesional / B2B,,Finanzas & Negocios,Baja / Exploratoria,LinkedIn B2B,8,B1,Antiguo alumno inactivo hace 75 días. Gerente de compras en cadena de retail
Helena Castro Mejía,helena.castro.ex@gmail.com,free,Crecimiento Personal,,Educación & Academia,Baja / Exploratoria,Organic / Blog,5,A2,Usuaria inactiva hace 68 días. Ex-alumna interesada en reactivar hábito de lectura
Gabriel Jaime Peláez,gpelaez.reactivacion@gmail.com,basic,Viajes e Inmersión,Estándar ($40-85/mes),Turismo & Hospitalidad,Baja / Exploratoria,Referral / Boca a Boca,7,B1,Inactivo hace 82 días por viaje de trabajo. Pendiente de retomar plan conversacional
Ángela María Serrano,aserrano.pausa@outlook.com,free,Desarrollo Profesional / B2B,,Tecnología & Software,Baja / Exploratoria,Google Search,6,B1,Pausa de 64 días por cambio laboral. Interés en reactivarse con descuento
Tomás Alberto Villamizar,tvillamizar.rescate@empresa.co,basic,Certificación Oficial (IELTS/TOEFL),Estándar ($40-85/mes),Estudiante Universitario,Baja / Exploratoria,Webinar Educativo,9,B2,Inactivo hace 70 días por entrega de tesis universitaria
Fernanda Ortiz Moncada,fernanda.ortiz@gmail.com,free,Crecimiento Personal,Económico ($15-35/mes),Estudiante Universitario,Baja / Exploratoria,Instagram Ads,1,A1,Estudiante de psicología. Interés exploratorio por aprender inglés por superación
Jimena Fuentes Lozano,jfuentes@startup.co,free,Desarrollo Profesional / B2B,,Tecnología & Software,Media (1-3 meses),Google Search,2,B1,Analista junior en fintech. Perfil con presupuesto omitido para probar imputación ML
Lucía Navarrete Peña,lucia.navarrete@yahoo.es,free,Viajes e Inmersión,Económico ($15-35/mes),,Baja / Exploratoria,Instagram Ads,1,A1,Sin industria especificada para comprobar resiliencia del modelo
Mario Pardo Buendía,mario.pardo@logistica.com.co,free,,,Tecnología & Software,Media (1-3 meses),Google Search,2,A2,Registro con meta y presupuesto vacíos para validar tolerancia a datos incompletos
Yenny Patricia Barrientos,ybarrientos@gmail.com,free,,Económico ($15-35/mes),,Baja / Exploratoria,Organic / Blog,1,A1,Lead de registro rápido en página de aterrizaje con información básica`;

export function generate50TestLeadsCSV(): string {
  return SAMPLE_50_LEADS_CSV;
}

/**
 * Triggers a browser download of the 50 test leads CSV with UTF-8 BOM for Excel compatibility
 */
export function download50SampleLeadsCSV(): void {
  const content = '\uFEFF' + SAMPLE_50_LEADS_CSV;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', '50_prospectos_prueba_segmentacion.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a download of the 50 test leads formatted as an Excel spreadsheet (.xls)
 */
export function download50SampleLeadsExcel(): void {
  const lines = SAMPLE_50_LEADS_CSV.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));

  const rowsHtml = rows
    .map(
      cols =>
        `<tr>${cols.map(c => `<td>${c || ''}</td>`).join('')}</tr>`
    )
    .join('\n');

  const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>50 Prospectos Prueba</x:Name>
          <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; padding: 10px; border: 1px solid #94A3B8; text-align: left; }
    td { padding: 8px; border: 1px solid #CBD5E1; font-size: 11pt; }
  </style>
</head>
<body>
  <h2>LINGUASEGMENT AI - 50 PROSPECTOS COMERCIALES DE PRUEBA</h2>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', '50_prospectos_prueba_segmentacion.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a realistic CSV template for commercial leads
 * with mixed complete and partial data to demonstrate tolerance.
 */
export function generateSampleMarketingLeadsCSV(): string {
  return SAMPLE_50_LEADS_CSV;
}

/**
 * Triggers a browser download of the sample marketing CSV template
 */
export function downloadSampleMarketingLeadsCSV(): void {
  download50SampleLeadsCSV();
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
