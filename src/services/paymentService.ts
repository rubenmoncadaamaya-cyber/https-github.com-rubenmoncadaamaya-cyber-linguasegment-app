import { StudentProfile, PaymentRecord, PaymentStatus, PaymentMethod, BreBConfig } from '../types';

export const DEFAULT_BRE_B_CONFIG: BreBConfig = {
  merchantName: 'LinguaSegment Idiomas & Educación',
  merchantNit: '901.684.230-8',
  breBKeyType: 'Celular',
  breBKeyValue: '315 892 4410',
  nequiNumber: '315 892 4410',
  daviplataNumber: '315 892 4410',
  transfiyaNumber: '315 892 4410',
  monthlyFeeCOP: 200000,
  bankName: 'Bancolombia / Red Bre-B Interoperable',
  accountType: 'Ahorros Empresarial',
  accountNumber: '450-982144-12'
};

/**
 * Initializes realistic payment records for the 200 enrolled students.
 * Mensualidad fija: $200.000 COP.
 */
export function initializeStudentPayments(students: StudentProfile[]): PaymentRecord[] {
  const currentPeriod = 'Noviembre 2026';
  const dueDate = '2026-11-05';

  return students.map((s, index) => {
    // Generate realistic status distribution:
    // ~80% Paid, ~13% Pending, ~4% Under review (comprobante subido), ~3% Overdue
    let status: PaymentStatus = 'pagado';
    let method: PaymentMethod | undefined = 'Bre-B (Llave / QR Interoperable)';
    let referenceNumber: string | undefined = `BRB-${840000 + index * 37}`;
    let paidAt: string | undefined = `2026-11-0${1 + (index % 4)} 10:${(index * 7) % 60 < 10 ? '0' : ''}${(index * 7) % 60}`;

    if (index % 12 === 0) {
      status = 'pendiente';
      method = undefined;
      referenceNumber = undefined;
      paidAt = undefined;
    } else if (index % 17 === 0) {
      status = 'vencido';
      method = undefined;
      referenceNumber = undefined;
      paidAt = undefined;
    } else if (index % 23 === 0) {
      status = 'en_revision';
      method = index % 2 === 0 ? 'Nequi' : 'Daviplata';
      referenceNumber = `COMP-${900000 + index}`;
      paidAt = `2026-11-06 14:20`;
    } else {
      // Methods distribution among paid
      const mIdx = index % 4;
      if (mIdx === 0) method = 'Bre-B (Llave / QR Interoperable)';
      else if (mIdx === 1) method = 'Nequi';
      else if (mIdx === 2) method = 'Daviplata';
      else method = 'Transfiya';
    }

    return {
      id: `pay_${s.id}_${currentPeriod.replace(/\s+/g, '_')}`,
      studentId: s.id,
      studentName: s.full_name,
      studentEmail: s.email,
      period: currentPeriod,
      amountCOP: DEFAULT_BRE_B_CONFIG.monthlyFeeCOP, // $200.000 COP
      dueDate,
      status,
      method,
      keyTypeUsed: 'Celular',
      keyValueUsed: DEFAULT_BRE_B_CONFIG.breBKeyValue,
      referenceNumber,
      paidAt,
      receiptNumber: status === 'pagado' ? `REC-2026-${String(index + 1).padStart(4, '0')}` : undefined,
      notes: status === 'en_revision' ? 'Comprobante recibido por WhatsApp en verificación' : undefined
    };
  });
}

/**
 * Calculates financial metrics for the 200 students
 */
export function calculatePaymentMetrics(payments: PaymentRecord[]) {
  const totalStudents = payments.length;
  const totalTargetCOP = totalStudents * DEFAULT_BRE_B_CONFIG.monthlyFeeCOP;
  
  const paidRecords = payments.filter(p => p.status === 'pagado');
  const pendingRecords = payments.filter(p => p.status === 'pendiente');
  const overdueRecords = payments.filter(p => p.status === 'vencido');
  const reviewRecords = payments.filter(p => p.status === 'en_revision');

  const collectedCOP = paidRecords.reduce((acc, p) => acc + p.amountCOP, 0);
  const pendingCOP = pendingRecords.reduce((acc, p) => acc + p.amountCOP, 0) + overdueRecords.reduce((acc, p) => acc + p.amountCOP, 0);
  const inReviewCOP = reviewRecords.reduce((acc, p) => acc + p.amountCOP, 0);

  const collectionRate = totalTargetCOP > 0 ? (collectedCOP / totalTargetCOP) * 100 : 0;

  // Standard Colombian Payment Gateway cost (e.g. Wompi/Stripe: 2.9% + $900 COP + 19% IVA on fee)
  // Per $200.000 COP transaction: Fee = 200,000 * 0.029 + 900 = $6,700 COP + IVA ($1,273) = $7,973 COP por estudiante.
  // With Bre-B, Nequi, Daviplata: $0 COP.
  const feePerTransactionGateway = 200000 * 0.029 + 900;
  const feeWithIva = feePerTransactionGateway * 1.19;
  const totalSavingsCOP = Math.round(paidRecords.length * feeWithIva);
  const projectedAnnualSavingsCOP = Math.round(totalStudents * feeWithIva * 12);

  return {
    totalStudents,
    totalTargetCOP,
    collectedCOP,
    pendingCOP,
    inReviewCOP,
    collectionRate: Math.round(collectionRate * 10) / 10,
    paidCount: paidRecords.length,
    pendingCount: pendingRecords.length,
    overdueCount: overdueRecords.length,
    reviewCount: reviewRecords.length,
    feeSavedThisMonthCOP: totalSavingsCOP,
    projectedAnnualSavingsCOP
  };
}

/**
 * Formats COP currency nicely
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Creates an interoperable WhatsApp payment link with prefilled copy
 */
export function generateWhatsAppCobroLink(
  payment: PaymentRecord,
  config: BreBConfig = DEFAULT_BRE_B_CONFIG
): string {
  const message = `👋 Hola *${payment.studentName}*,\n\nTe recordamos el pago de tu mensualidad de idiomas en *${config.merchantName}* correspondiente a *${payment.period}* por valor de *${formatCOP(payment.amountCOP)}*.\n\n✨ *Paga fácil, inmediato y SIN COMISIÓN por Bre-B o Billeteras:*\n\n1️⃣ *Bre-B (Interoperable desde cualquier banco):*\n   • Llave (${config.breBKeyType}): *${config.breBKeyValue}*\n\n2️⃣ *Billeteras Móviles:*\n   • Nequi: *${config.nequiNumber}*\n   • Daviplata: *${config.daviplataNumber}*\n   • Transfiya: *${config.transfiyaNumber}*\n\n3️⃣ *Cuenta de Ahorros:*\n   • ${config.bankName} No. ${config.accountNumber}\n   • NIT: ${config.merchantNit}\n\n📌 *Fecha límite de pago:* ${payment.dueDate}\n\nPor favor envíanos la captura de tu comprobante a este chat una vez transferido. ¡Gracias por confiar en nosotros!`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an exportable CSV for financial collection and accounting
 */
export function exportPaymentsToCSV(payments: PaymentRecord[]): void {
  const headers = [
    'ID Pago',
    'ID Estudiante',
    'Nombre Completo',
    'Email',
    'Periodo',
    'Valor Mensualidad (COP)',
    'Fecha Limite',
    'Estado',
    'Metodo de Pago',
    'Numero de Comprobante / Ref',
    'Fecha de Pago',
    'Numero de Recibo',
    'Observaciones'
  ];

  const rows = payments.map(p => [
    `"${p.id}"`,
    p.studentId,
    `"${p.studentName}"`,
    `"${p.studentEmail}"`,
    `"${p.period}"`,
    p.amountCOP,
    `"${p.dueDate}"`,
    `"${p.status.toUpperCase()}"`,
    `"${p.method || 'NO REGISTRADO'}"`,
    `"${p.referenceNumber || 'N/A'}"`,
    `"${p.paidAt || 'N/A'}"`,
    `"${p.receiptNumber || 'N/A'}"`,
    `"${p.notes || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Pagos_BreB_Mensualidades_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Renders and prints a professional Colombian payment receipt
 */
export function printReceipt(payment: PaymentRecord, config: BreBConfig = DEFAULT_BRE_B_CONFIG): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Recibo de Caja - ${payment.receiptNumber || payment.id}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
        .receipt-card { max-width: 650px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .brand { font-size: 20px; font-weight: 800; color: #4338ca; }
        .sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .receipt-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; font-size: 13px; }
        .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .value { color: #0f172a; font-weight: 600; margin-top: 2px; }
        .table-box { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
        .table-box th { text-align: left; background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 10px; color: #475569; font-size: 11px; }
        .table-box td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; }
        .total-box { display: flex; justify-content: flex-end; margin-top: 16px; font-size: 16px; font-weight: 800; color: #0f172a; }
        .stamp { margin-top: 30px; padding: 14px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #10b981; font-size: 12px; color: #334155; }
        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        @media print {
          body { padding: 0; }
          .receipt-card { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div>
            <div class="brand">${config.merchantName}</div>
            <div class="sub">NIT: ${config.merchantNit} • Régimen Común</div>
            <div class="sub">Plataforma Educativa LinguaSegment</div>
          </div>
          <div style="text-align: right;">
            <div class="receipt-badge">${payment.status === 'pagado' ? 'PAGADO ✓' : payment.status.toUpperCase()}</div>
            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 6px;">${payment.receiptNumber || 'REC-' + payment.id}</div>
            <div class="sub">Fecha emisión: ${payment.paidAt || new Date().toISOString().slice(0, 10)}</div>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <div class="label">Estudiante / Pagador</div>
            <div class="value">${payment.studentName}</div>
            <div style="color: #64748b; font-size: 12px;">ID Alumno: #${payment.studentId}</div>
            <div style="color: #64748b; font-size: 12px;">Email: ${payment.studentEmail}</div>
          </div>
          <div>
            <div class="label">Detalles de la Transacción</div>
            <div class="value">Método: ${payment.method || 'Bre-B / Billeteras'}</div>
            <div style="color: #64748b; font-size: 12px;">Comprobante / Ref: ${payment.referenceNumber || 'N/A'}</div>
            <div style="color: #64748b; font-size: 12px;">Comisión de Pasarela: $0 COP (Exenta)</div>
          </div>
        </div>

        <table class="table-box">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Periodo</th>
              <th style="text-align: right;">Tarifa</th>
              <th style="text-align: right;">IVA (0% Art. 476 ET)</th>
              <th style="text-align: right;">Total COP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mensualidad Programa de Idiomas</strong><br><span style="font-size: 11px; color: #64748b;">Acceso completo a lecciones, analítica ML y sesiones tutoradas</span></td>
              <td>${payment.period}</td>
              <td style="text-align: right;">${formatCOP(payment.amountCOP)}</td>
              <td style="text-align: right;">$0</td>
              <td style="text-align: right; font-weight: 700;">${formatCOP(payment.amountCOP)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <span>Total Pagado: <strong style="color: #047857; margin-left: 8px;">${formatCOP(payment.amountCOP)}</strong></span>
        </div>

        <div class="stamp">
          ✓ <strong>Transacción Verificada con Éxito:</strong> Pagado a través del Sistema Interoperable Bre-B / Billetera Digital (Nequi / Daviplata) sin costo de comisión bancaria para el estudiante ni para la academia.
        </div>

        <div class="footer">
          Documento Soporte Electrónico de Pago para Servicios de Educación No Formal y Continua.<br>
          Generado automáticamente por la plataforma LinguaSegment.
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
