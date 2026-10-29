import React, { useState, useMemo } from 'react';
import { PaymentRecord, PaymentStatus, PaymentMethod, BreBConfig, StudentProfile } from '../types';
import {
  calculatePaymentMetrics,
  formatCOP,
  generateWhatsAppCobroLink,
  exportPaymentsToCSV,
  printReceipt,
  DEFAULT_BRE_B_CONFIG
} from '../services/paymentService';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Download,
  Copy,
  ExternalLink,
  Check,
  QrCode,
  Smartphone,
  ShieldCheck,
  Send,
  CreditCard,
  Settings2,
  X,
  Mail
} from 'lucide-react';

interface PaymentsViewProps {
  students: StudentProfile[];
  payments: PaymentRecord[];
  onUpdatePayment: (updatedPayment: PaymentRecord) => void;
  onBulkUpdatePayments?: (updatedPayments: PaymentRecord[]) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  students,
  payments,
  onUpdatePayment
}) => {
  const [config, setConfig] = useState<BreBConfig>(DEFAULT_BRE_B_CONFIG);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState<PaymentRecord | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Manual payment verification form state
  const [voucherMethod, setVoucherMethod] = useState<PaymentMethod>('Bre-B (Llave / QR Interoperable)');
  const [voucherRef, setVoucherRef] = useState('');
  const [voucherNotes, setVoucherNotes] = useState('');

  // Calculate metrics
  const metrics = useMemo(() => calculatePaymentMetrics(payments), [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch =
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenVoucherModal = (payment: PaymentRecord) => {
    setSelectedPaymentForModal(payment);
    setVoucherMethod(payment.method || 'Bre-B (Llave / QR Interoperable)');
    setVoucherRef(payment.referenceNumber || `BRB-${Math.floor(100000 + Math.random() * 900000)}`);
    setVoucherNotes(payment.notes || '');
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentForModal) return;
    const now = new Date();
    const paidAtStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    
    const updated: PaymentRecord = {
      ...selectedPaymentForModal,
      status: 'pagado',
      method: voucherMethod,
      referenceNumber: voucherRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
      paidAt: paidAtStr,
      receiptNumber: selectedPaymentForModal.receiptNumber || `REC-2026-${String(selectedPaymentForModal.studentId).padStart(4, '0')}`,
      notes: voucherNotes.trim() ? voucherNotes : undefined
    };

    onUpdatePayment(updated);
    setSelectedPaymentForModal(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Quick Description */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              0% Comisión Bancaria
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Bre-B • Nequi • Daviplata
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>Gestión de Recaudo & Mensualidades ({formatCOP(config.monthlyFeeCOP)} COP)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistema automatizado de cobro para los {payments.length} estudiantes sin intermediarios ni tarifas de pasarela.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configurar Llaves Bre-B</span>
          </button>
          <button
            onClick={() => exportPaymentsToCSV(payments)}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Cartera CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Target */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Facturación Mensual (200 Alumnos)
          </span>
          <div className="text-2xl font-black text-white mt-1 tabular-nums">
            {formatCOP(metrics.totalTargetCOP)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>200 estudiantes × {formatCOP(config.monthlyFeeCOP)}</span>
          </div>
        </div>

        {/* Collected COP */}
        <div className="p-4 rounded-lg bg-slate-900 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
              Recaudo Efectivo Cobrado
            </span>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">
              {metrics.collectionRate}%
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">
            {formatCOP(metrics.collectedCOP)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <strong className="text-white font-mono">{metrics.paidCount}</strong> de {metrics.totalStudents} estudiantes al día
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${metrics.collectionRate}%` }}
            />
          </div>
        </div>

        {/* Pending & Overdue */}
        <div className="p-4 rounded-lg bg-slate-900 border border-amber-500/30 bg-amber-950/10">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
            Cartera en Cobro / Pendiente
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1 tabular-nums">
            {formatCOP(metrics.pendingCOP)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span>{metrics.pendingCount} pendientes</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">{metrics.overdueCount} vencidos</span>
            {metrics.reviewCount > 0 && (
              <>
                <span>•</span>
                <span className="text-sky-400 font-medium">{metrics.reviewCount} en revisión</span>
              </>
            )}
          </div>
        </div>

        {/* Ahorro en Comisiones Bre-B */}
        <div className="p-4 rounded-lg bg-slate-900 border border-indigo-500/40 bg-indigo-950/15 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
              Ahorro Comisión Bre-B (0%)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              Exento Pasarela
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1 tabular-nums">
            +{formatCOP(metrics.feeSavedThisMonthCOP)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ahorro anual proyectado: <strong className="text-white font-mono">{formatCOP(metrics.projectedAnnualSavingsCOP)}</strong> vs Wompi/Stripe (2.9%+900)
          </p>
        </div>
      </div>

      {/* 3. Terminal Interoperable Bre-B & Billeteras (Interactive Colombian Rails) */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Canales de Pago Directo Interoperables (Sin Costo de Comisión)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparte estos datos con los estudiantes o utiliza el generador de cobro directo por WhatsApp.
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Mensualidad Oficial:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-white font-mono">
              {formatCOP(config.monthlyFeeCOP)} COP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Bre-B Interoperable */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/40 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
                  Bre-B
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sistema Bre-B</div>
                  <div className="text-[10px] text-slate-400">Banco de la República</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Interoperable
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Llave Bre-B ({config.breBKeyType})
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-sm font-mono font-bold text-white tracking-wide">
                    {config.breBKeyValue}
                  </span>
                  <button
                    onClick={() => copyToClipboard(config.breBKeyValue, 'breb')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copiar Llave Bre-B"
                  >
                    {copiedKey === 'breb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>NIT:</span>
                <span className="text-slate-300 font-mono">{config.merchantNit}</span>
                <span className="mx-1">•</span>
                <span className="text-emerald-400 font-medium">Inmediato &lt; 20s</span>
              </div>
            </div>
          </div>

          {/* Card 2: Nequi */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-500/40 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#200020] border border-pink-500/60 flex items-center justify-center font-black text-pink-400 text-xs">
                  N
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Nequi</div>
                  <div className="text-[10px] text-slate-400">Billetera Digital</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">
                Sin Comisión
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Número de Celular Nequi
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-sm font-mono font-bold text-white tracking-wide">
                    {config.nequiNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(config.nequiNumber, 'nequi')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copiar Nequi"
                  >
                    {copiedKey === 'nequi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Titular:</span>
                <span className="text-slate-300 truncate max-w-[170px]">{config.merchantName}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Daviplata & Bancos */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-red-500/40 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#ED1C24] flex items-center justify-center font-black text-white text-xs">
                  D
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Daviplata & Ahorros</div>
                  <div className="text-[10px] text-slate-400">Davivienda / Bancolombia</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                Transferencia
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Daviplata / Transfiya
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-sm font-mono font-bold text-white tracking-wide">
                    {config.daviplataNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(config.daviplataNumber, 'daviplata')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copiar Daviplata"
                  >
                    {copiedKey === 'daviplata' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Cta:</span>
                <span className="text-slate-300 font-mono text-[10px]">{config.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Table Controls & Filters */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar estudiante, email o referencia..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos ({payments.length})
            </button>
            <button
              onClick={() => { setStatusFilter('pagado'); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'pagado'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
              }`}
            >
              Pagados ({metrics.paidCount})
            </button>
            <button
              onClick={() => { setStatusFilter('pendiente'); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'pendiente'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
              }`}
            >
              Pendientes ({metrics.pendingCount})
            </button>
            <button
              onClick={() => { setStatusFilter('vencido'); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'vencido'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
              }`}
            >
              Vencidos ({metrics.overdueCount})
            </button>
            <button
              onClick={() => { setStatusFilter('en_revision'); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'en_revision'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
              }`}
            >
              En Revisión ({metrics.reviewCount})
            </button>
          </div>
        </div>

        {/* 5. Payments Table */}
        <div className="overflow-x-auto border border-slate-800 rounded">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-3 py-3">Periodo</th>
                <th className="px-3 py-3">Valor</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Método / Llave</th>
                <th className="px-3 py-3">Comprobante / Ref</th>
                <th className="px-4 py-3 text-right">Acciones de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedPayments.map(p => {
                const waLink = generateWhatsAppCobroLink(p, config);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Estudiante */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.studentEmail}</div>
                    </td>

                    {/* Periodo */}
                    <td className="px-3 py-3 text-slate-300 font-mono text-[11px]">
                      {p.period}
                      <div className="text-[10px] text-slate-500">Límite: {p.dueDate}</div>
                    </td>

                    {/* Valor */}
                    <td className="px-3 py-3 font-mono font-bold text-white tabular-nums">
                      {formatCOP(p.amountCOP)}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-3">
                      {p.status === 'pagado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Pagado
                        </span>
                      )}
                      {p.status === 'pendiente' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                      {p.status === 'vencido' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Vencido
                        </span>
                      )}
                      {p.status === 'en_revision' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          <Smartphone className="w-3 h-3" />
                          En Revisión
                        </span>
                      )}
                    </td>

                    {/* Método / Llave */}
                    <td className="px-3 py-3">
                      {p.method ? (
                        <div>
                          <span className="text-[11px] text-slate-200 font-medium">{p.method}</span>
                          {p.paidAt && <div className="text-[10px] text-slate-500">{p.paidAt}</div>}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Por registrar</span>
                      )}
                    </td>

                    {/* Comprobante / Ref */}
                    <td className="px-3 py-3 font-mono text-[11px]">
                      {p.referenceNumber ? (
                        <span className="text-indigo-400">{p.referenceNumber}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Cobro */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                          title="Enviar cobro por WhatsApp con llave Bre-B"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Correo Cobro */}
                        <a
                          href={`mailto:${p.studentEmail}?subject=${encodeURIComponent(`Cobro Mensualidad Bre-B ($200.000 COP) - ${p.period}`)}&body=${encodeURIComponent(`Hola ${p.studentName},\n\nTe recordamos el pago de tu mensualidad de $200.000 COP para ${p.period}.\n\nPuedes pagar sin comisión a través de nuestra Llave Bre-B: ${config.breBKeyValue} o a Nequi/Daviplata: ${config.nequiNumber}.\n\nReferencia: ${p.referenceNumber || 'BREB-2026'}.\n\n¡Gracias!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                          title="Enviar detalles de pago por Correo Electrónico"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Correo</span>
                        </a>

                        {/* Validar / Registrar Comprobante */}
                        {p.status !== 'pagado' ? (
                          <button
                            onClick={() => handleOpenVoucherModal(p)}
                            className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors"
                          >
                            Registrar Pago
                          </button>
                        ) : (
                          <button
                            onClick={() => printReceipt(p, config)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium inline-flex items-center gap-1 transition-colors border border-slate-700"
                            title="Imprimir Recibo Electrónico"
                          >
                            <FileText className="w-3 h-3 text-indigo-400" />
                            <span>Recibo</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Página <strong className="text-white">{page}</strong> de {totalPages} ({filteredPayments.length} registros)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Registrar / Validar Pago Manualmente */}
      {selectedPaymentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Validar Comprobante de Pago</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estudiante: <strong className="text-white">{selectedPaymentForModal.studentName}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedPaymentForModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Monto de la Mensualidad</label>
                <input
                  type="text"
                  disabled
                  value={formatCOP(selectedPaymentForModal.amountCOP)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Método / Canal Utilizado</label>
                <select
                  value={voucherMethod}
                  onChange={e => setVoucherMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Bre-B (Llave / QR Interoperable)">Bre-B (Llave / QR Interoperable)</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Transfiya">Transfiya</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria Directa</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Número de Aprobación / Comprobante</label>
                <input
                  type="text"
                  placeholder="Ej: M8923412 o BRB-89410"
                  value={voucherRef}
                  onChange={e => setVoucherRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observaciones o Notas (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Comprobante verificado por WhatsApp"
                  value={voucherNotes}
                  onChange={e => setVoucherNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedPaymentForModal(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Pago como Pagado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Configurar Llaves Bre-B y Billeteras */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <span>Configurar Llaves Bre-B & Billeteras</span>
              </h4>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nombre Comercial de la Academia</label>
                  <input
                    type="text"
                    value={config.merchantName}
                    onChange={e => setConfig({ ...config, merchantName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">NIT / Identificación</label>
                  <input
                    type="text"
                    value={config.merchantNit}
                    onChange={e => setConfig({ ...config, merchantNit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Llave Bre-B</label>
                  <select
                    value={config.breBKeyType}
                    onChange={e => setConfig({ ...config, breBKeyType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  >
                    <option value="Celular">Celular</option>
                    <option value="Cédula / Documento">Cédula / Documento</option>
                    <option value="NIT Empresa">NIT Empresa</option>
                    <option value="Correo Electrónico">Correo Electrónico</option>
                    <option value="Código Alfanumérico">Código Alfanumérico</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Valor de la Llave Bre-B</label>
                  <input
                    type="text"
                    value={config.breBKeyValue}
                    onChange={e => setConfig({ ...config, breBKeyValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Número Nequi</label>
                  <input
                    type="text"
                    value={config.nequiNumber}
                    onChange={e => setConfig({ ...config, nequiNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Número Daviplata</label>
                  <input
                    type="text"
                    value={config.daviplataNumber}
                    onChange={e => setConfig({ ...config, daviplataNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tarifa Mensualidad Fija (COP)</label>
                <input
                  type="number"
                  value={config.monthlyFeeCOP}
                  onChange={e => setConfig({ ...config, monthlyFeeCOP: Number(e.target.value) || 200000 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-emerald-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
