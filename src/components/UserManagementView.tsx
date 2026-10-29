import React, { useState, useMemo } from 'react';
import { AuthUser, ManagedUserProfile, UserRole, UserAccountStatus, CEFRLevel } from '../types';
import { ROLE_CONFIGS } from '../services/authService';
import { dispatchAlertAction } from '../services/alertService';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Users,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Lock,
  ChevronDown,
  X,
  GraduationCap,
  Briefcase,
  Baby,
  Sparkles
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: AuthUser;
  users: ManagedUserProfile[];
  onAddUser: (user: Omit<ManagedUserProfile, 'uid' | 'createdAt'>) => void;
  onUpdateUser: (updatedUser: ManagedUserProfile) => void;
  onDeleteUser: (uid: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserProfile | null>(null);

  // Form states for creating / editing user
  const [formData, setFormData] = useState<{
    displayName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    status: UserAccountStatus;
    assignedLevel: string;
    institutionOrDept: string;
    notes: string;
  }>({
    displayName: '',
    email: '',
    phoneNumber: '+57 310 ',
    role: 'parent_student',
    status: 'Activo',
    assignedLevel: 'A2 (Elemental)',
    institutionOrDept: 'LinguaAcademy',
    notes: ''
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // RBAC GUARD: Only Admin can access or manage this view!
  if (currentUser.role !== 'admin') {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
            Acceso Restringido por Control RBAC
          </span>
          <h2 className="text-xl font-bold text-white">
            Módulo Reservado Exclusivamente para el Administrador
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            La tabla de gestión de perfiles y usuarios solo puede ser administrada por el perfil de <strong>Administrador / Coordinador Académico</strong>.
            Actualmente has iniciado sesión como <strong className="text-indigo-400">{currentUser.displayName}</strong> con el rol de <span className="font-mono text-slate-300">({currentUser.role})</span>.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          Para gestionar usuarios y asignar roles, cambia al perfil de <strong>Administrador (Rubén Moncada)</strong> usando el selector de usuario en la esquina superior derecha.
        </div>
      </div>
    );
  }

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber && u.phoneNumber.includes(searchTerm)) ||
        (u.assignedLevel && u.assignedLevel.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Metrics summary
  const metrics = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      sales: users.filter(u => u.role === 'sales').length,
      students: users.filter(u => u.role === 'parent_student').length,
      active: users.filter(u => u.status === 'Activo').length
    };
  }, [users]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      displayName: '',
      email: '',
      phoneNumber: '+57 310 ',
      role: 'parent_student',
      status: 'Activo',
      assignedLevel: 'A2 (Elemental)',
      institutionOrDept: 'LinguaAcademy',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: ManagedUserProfile) => {
    setEditingUser(user);
    setFormData({
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      status: user.status,
      assignedLevel: user.assignedLevel || '',
      institutionOrDept: user.institutionOrDept || '',
      notes: user.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.email.trim()) {
      alert('Por favor completa el nombre y el correo electrónico.');
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        role: formData.role,
        status: formData.status,
        assignedLevel: formData.assignedLevel.trim() || undefined,
        institutionOrDept: formData.institutionOrDept.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
      setFeedbackMsg(`Perfil de ${formData.displayName} actualizado correctamente.`);
    } else {
      onAddUser({
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        role: formData.role,
        status: formData.status,
        assignedLevel: formData.assignedLevel.trim() || undefined,
        institutionOrDept: formData.institutionOrDept.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        lastLogin: 'Nunca'
      });
      setFeedbackMsg(`Usuario ${formData.displayName} registrado con éxito.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleToggleStatus = (user: ManagedUserProfile) => {
    const nextStatus: UserAccountStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    onUpdateUser({
      ...user,
      status: nextStatus
    });
    setFeedbackMsg(`Estado de ${user.displayName} cambiado a: ${nextStatus}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSendWhatsAppWelcome = (user: ManagedUserProfile) => {
    const cleanPhone = user.phoneNumber?.replace(/\D/g, '') || '573105558899';
    const roleMeta = ROLE_CONFIGS[user.role];
    const message =
`¡Hola ${user.displayName}! 👋 Te damos la bienvenida a *LinguaSegment AI*.

Tus credenciales y perfil institucional han sido configurados por la Coordinación Académica:
👤 *Rol asignado:* ${roleMeta.label}
📧 *Correo de acceso:* ${user.email}
📍 *Nivel / Asignación:* ${user.assignedLevel || 'General'}
🔑 *Acceso web:* https://ais-pre-jmvnivfibjycxfuicd2ss2-536444609502.us-east1.run.app

Puedes ingresar usando tu cuenta Google con este correo institucional. ¡Éxitos!`;

    dispatchAlertAction('whatsapp', cleanPhone, `Bienvenido a LinguaSegment AI`, message);
    setFeedbackMsg(`Mensaje de WhatsApp generado para ${user.displayName}.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['UID', 'Nombre', 'Correo', 'Telefono', 'Rol', 'Estado', 'Nivel_Asignado', 'Departamento', 'Fecha_Creacion', 'Ultimo_Acceso'];
    const rows = users.map(u => [
      `"${u.uid}"`,
      `"${u.displayName}"`,
      `"${u.email}"`,
      `"${u.phoneNumber || ''}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.assignedLevel || ''}"`,
      `"${u.institutionOrDept || ''}"`,
      `"${u.createdAt}"`,
      `"${u.lastLogin || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Padron_Usuarios_LinguaSegment_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Control Exclusivo del Administrador · Seguridad RBAC</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Gestión de Perfiles y Directorio de Usuarios
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-0.5 max-w-2xl">
            Registra y asigna roles a Administradores, Profesores, Comerciales y Estudiantes/Familias. Controla estados, datos de contacto y accesos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            title="Descargar padrón en formato CSV"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Persona</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Total Usuarios</span>
          <div className="text-2xl font-black text-white font-mono mt-0.5">{metrics.total}</div>
          <span className="text-[10px] text-emerald-400">{metrics.active} activos</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/20">
          <span className="text-[11px] text-rose-400 block font-semibold">Admins Globales</span>
          <div className="text-2xl font-black text-rose-300 font-mono mt-0.5">{metrics.admins}</div>
          <span className="text-[10px] text-slate-500">Coordinación</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/20">
          <span className="text-[11px] text-indigo-400 block font-semibold">Profesores / Tutores</span>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-0.5">{metrics.teachers}</div>
          <span className="text-[10px] text-slate-500">Docentes</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/20">
          <span className="text-[11px] text-amber-400 block font-semibold">Comercial & Ventas</span>
          <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">{metrics.sales}</div>
          <span className="text-[10px] text-slate-500">Mercadeo</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/20">
          <span className="text-[11px] text-emerald-400 block font-semibold">Alumnos & Familias</span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">{metrics.students}</div>
          <span className="text-[10px] text-slate-500">Estudiantes</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Seguridad RBAC</span>
          <div className="text-xs font-bold text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4 Roles Activos</span>
          </div>
          <span className="text-[10px] text-slate-500">Firestore Rules</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, correo, teléfono o nivel..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Estado:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
              <option value="Pendiente">Pendientes</option>
            </select>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex overflow-x-auto gap-1.5 pt-1 text-xs font-semibold scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              roleFilter === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({users.length})
          </button>

          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              roleFilter === 'admin'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-950 text-rose-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Administradores ({metrics.admins})</span>
          </button>

          <button
            onClick={() => setRoleFilter('teacher')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              roleFilter === 'teacher'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-indigo-300 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Profesores / Tutores ({metrics.teachers})</span>
          </button>

          <button
            onClick={() => setRoleFilter('sales')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              roleFilter === 'sales'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-950 text-amber-300 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Comercial & Ventas ({metrics.sales})</span>
          </button>

          <button
            onClick={() => setRoleFilter('parent_student')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              roleFilter === 'parent_student'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-emerald-300 hover:text-white'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estudiantes / Familias ({metrics.students})</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-md">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Persona / Usuario</th>
              <th className="px-3 py-3">Contacto & WhatsApp</th>
              <th className="px-3 py-3">Rol Asignado</th>
              <th className="px-3 py-3">Nivel / Asignación</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Último Acceso</th>
              <th className="px-4 py-3 text-right">Acciones de Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No se encontraron usuarios con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const roleMeta = ROLE_CONFIGS[user.role];

                return (
                  <tr key={user.uid} className="hover:bg-slate-800/40 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{user.displayName}</span>
                            {user.uid === currentUser.uid && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-3 py-3.5 font-mono text-[11px]">
                      {user.phoneNumber ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Sin teléfono</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${roleMeta.badgeColor}`}>
                        {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                        {user.role === 'teacher' && <GraduationCap className="w-3 h-3" />}
                        {user.role === 'sales' && <Briefcase className="w-3 h-3" />}
                        {user.role === 'parent_student' && <Baby className="w-3 h-3" />}
                        <span>{roleMeta.badge}</span>
                      </span>
                    </td>

                    {/* Assignment / CEFR Level */}
                    <td className="px-3 py-3.5 text-slate-300 text-xs">
                      <div className="font-medium text-white">{user.assignedLevel || '—'}</div>
                      <div className="text-[10px] text-slate-500">{user.institutionOrDept || 'LinguaAcademy'}</div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title="Toca para cambiar estado"
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          user.status === 'Activo'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : user.status === 'Pendiente'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Activo' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        <span>{user.status}</span>
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="px-3 py-3.5 text-[11px] text-slate-400 font-mono">
                      {user.lastLogin || 'Reciente'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Welcome / Credentials */}
                        <button
                          onClick={() => handleSendWhatsAppWelcome(user)}
                          className="p-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs transition-colors"
                          title="Enviar credenciales o bienvenida por WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                          title="Editar información y rol del usuario"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                        </button>

                        {/* Delete User (Prevent deleting self) */}
                        {user.uid !== currentUser.uid && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el perfil de ${user.displayName}?`)) {
                                onDeleteUser(user.uid);
                                setFeedbackMsg(`Usuario ${user.displayName} eliminado.`);
                                setTimeout(() => setFeedbackMsg(null), 3000);
                              }
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition-colors"
                            title="Eliminar usuario del padrón"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Create or Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingUser ? 'Editar Perfil de Usuario' : 'Registrar Nueva Persona en el Sistema'}
                  </h3>
                  <p className="text-xs text-slate-400">Administrado exclusivamente por Coordinación Académica</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo: *</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ej. Andrés Camilo Restrepo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico: *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@lingua-ai.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Celular / WhatsApp (Colombia):</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+57 310 555 8899"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol en el Sistema (RBAC): *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="admin">Administrador / Coordinador</option>
                    <option value="teacher">Profesor / Tutor Académico</option>
                    <option value="sales">Comercial / Mercadeo</option>
                    <option value="parent_student">Padre de Familia / Estudiante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estado de la Cuenta:</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as UserAccountStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Pendiente">Pendiente de Verificación</option>
                    <option value="Inactivo">Inactivo / Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel MCER / Especialidad:</label>
                  <input
                    type="text"
                    value={formData.assignedLevel}
                    onChange={e => setFormData({ ...formData, assignedLevel: e.target.value })}
                    placeholder="Ej. Nivel B2 o Fonética Infantil"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Departamento / Grupo:</label>
                  <input
                    type="text"
                    value={formData.institutionOrDept}
                    onChange={e => setFormData({ ...formData, institutionOrDept: e.target.value })}
                    placeholder="Ej. Departamento Pedagógico"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notas Internas de Coordinación:</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observaciones de admisión, acuerdos de pago o historial docente..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30"
                >
                  {editingUser ? 'Actualizar Perfil' : 'Guardar y Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
