import { AuthUser, UserRole, RolePermissionConfig } from '../types';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ROLE_CONFIGS: Record<UserRole, RolePermissionConfig> = {
  admin: {
    role: 'admin',
    label: 'Administrador / Coordinador Académico',
    badge: 'Admin Global',
    description: 'Acceso total a configuración de clústeres ML, métricas globales, mercadeo, pagos Bre-B y reportes ejecutivos.',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    allowedTabs: [
      'dashboard',
      'students',
      'marketing',
      'payments',
      'personalization',
      'scheduling',
      'reports',
      'student_portal',
      'users_management'
    ]
  },
  teacher: {
    role: 'teacher',
    label: 'Profesor / Tutor Académico',
    badge: 'Tutor / Docente',
    description: 'Acceso a clases agendadas, diagnósticos de alumnos, asignación de tareas y reportes pedagógicos con IA.',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    allowedTabs: [
      'scheduling',
      'students',
      'personalization',
      'reports'
    ]
  },
  sales: {
    role: 'sales',
    label: 'Comercial / Mercadeo',
    badge: 'Mercadeo & Ventas',
    description: 'Carga de bases de prospectos, embudo de conversión, segmentación de oportunidades y generación de copies con IA.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    allowedTabs: [
      'marketing',
      'dashboard'
    ]
  },
  parent_student: {
    role: 'parent_student',
    label: 'Padre de Familia / Estudiante',
    badge: 'Estudiante & Familia',
    description: 'Vista protegida para consultar clases, progreso académico, tareas y módulo de Enseñanza Infantil & Lúdico.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    allowedTabs: [
      'student_portal'
    ]
  }
};

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  admin: {
    uid: 'usr_admin_001',
    email: 'ruben.moncada.amaya@gmail.com',
    displayName: 'Rubén Moncada (Admin)',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    institution: 'LinguaAcademy Colombia'
  },
  teacher: {
    uid: 'usr_teacher_002',
    email: 'carmen.valenzuela@lingua-ai.edu',
    displayName: 'Dra. Carmen Valenzuela',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    institution: 'Departamento Pedagógico'
  },
  sales: {
    uid: 'usr_sales_003',
    email: 'mateo.rivas@lingua-ai.edu',
    displayName: 'Mateo Rivas',
    role: 'sales',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    institution: 'Equipo Comercial & Adquisición'
  },
  parent_student: {
    uid: 'usr_student_004',
    email: 'zara.hoffmann@example.net',
    displayName: 'Zara Hoffmann (Familia)',
    role: 'parent_student',
    studentId: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    institution: 'Estudiante B2 / LinguaKids'
  }
};

const STORAGE_KEY = 'lingua_auth_user_v2';

export function getStoredUser(): AuthUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role && ROLE_CONFIGS[parsed.role as UserRole]) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEMO_USERS.admin; // Default to Admin for academic coordinator
}

export function saveStoredUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

/**
 * Fetch user profile document from Firestore 'users/{userId}'
 */
export async function fetchUserProfileFromFirestore(userId: string): Promise<AuthUser | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid || userId,
        email: data.email || '',
        displayName: data.displayName || 'Usuario Registrado',
        role: (data.role as UserRole) || 'admin',
        avatarUrl: data.photoURL || undefined
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Sync or create user profile document in Firestore 'users/{userId}'
 */
export async function syncUserProfileToFirestore(user: AuthUser): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      photoURL: user.avatarUrl || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Sign in using Firebase Google Identity Platform
 */
export async function signInWithGooglePlatform(targetRole: UserRole = 'admin'): Promise<AuthUser> {
  const res = await signInWithPopup(auth, googleProvider);
  const fbUser = res.user;

  // Attempt to read role from Firestore, or assign selected role
  let role: UserRole = targetRole;
  try {
    const profile = await fetchUserProfileFromFirestore(fbUser.uid);
    if (profile && profile.role) {
      role = profile.role;
    }
  } catch (err) {
    console.warn('Could not read existing user document, defaulting role:', err);
  }

  const authUser: AuthUser = {
    uid: fbUser.uid,
    email: fbUser.email || 'usuario@lingua-ai.edu',
    displayName: fbUser.displayName || 'Usuario Google',
    role,
    avatarUrl: fbUser.photoURL || undefined
  };

  // Persist into Firestore
  try {
    await syncUserProfileToFirestore(authUser);
  } catch (err) {
    console.warn('Could not persist profile in Firestore:', err);
  }

  saveStoredUser(authUser);
  return authUser;
}

/**
 * Sign out of Firebase session
 */
export async function signOutPlatform(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Error signing out of Firebase Auth:', err);
  }
  localStorage.removeItem(STORAGE_KEY);
}

export const INITIAL_MANAGED_USERS: import('../types').ManagedUserProfile[] = [
  {
    uid: 'usr_admin_001',
    displayName: 'Rubén Moncada',
    email: 'ruben.moncada.amaya@gmail.com',
    phoneNumber: '+57 310 555 8899',
    role: 'admin',
    status: 'Activo',
    assignedLevel: 'Coordinación Global',
    institutionOrDept: 'Dirección General & Académica',
    createdAt: '2025-01-10',
    lastLogin: 'Hoy, 19:40',
    notes: 'Administrador general y titular de cuenta'
  },
  {
    uid: 'usr_teacher_001',
    displayName: 'Dra. Carmen Valenzuela',
    email: 'carmen.valenzuela@lingua-ai.edu',
    phoneNumber: '+57 312 444 1122',
    role: 'teacher',
    status: 'Activo',
    assignedLevel: 'Niveles B2 / C1 & Fonética',
    institutionOrDept: 'Departamento Pedagógico',
    createdAt: '2025-01-12',
    lastLogin: 'Hoy, 18:15',
    notes: 'Líder de conversación y diagnóstico'
  },
  {
    uid: 'usr_teacher_002',
    displayName: 'Prof. David Sterling',
    email: 'david.sterling@lingua-ai.edu',
    phoneNumber: '+57 315 888 3344',
    role: 'teacher',
    status: 'Activo',
    assignedLevel: 'Niveles A1 / A2 & Laboratorios',
    institutionOrDept: 'Departamento Pedagógico',
    createdAt: '2025-01-15',
    lastLogin: 'Ayer, 16:30',
    notes: 'Tutor de inmersión inicial y acento'
  },
  {
    uid: 'usr_teacher_003',
    displayName: 'Lic. Sofía Alarcón',
    email: 'sofia.alarcon@lingua-ai.edu',
    phoneNumber: '+57 318 222 9900',
    role: 'teacher',
    status: 'Activo',
    assignedLevel: 'LinguaKids (4-12 años)',
    institutionOrDept: 'Pedagogía Infantil & Lúdica',
    createdAt: '2025-01-18',
    lastLogin: 'Hoy, 11:20',
    notes: 'Especialista en desarrollo bilingüe temprano'
  },
  {
    uid: 'usr_sales_001',
    displayName: 'Mateo Rivas',
    email: 'mateo.rivas@lingua-ai.edu',
    phoneNumber: '+57 311 999 4455',
    role: 'sales',
    status: 'Activo',
    assignedLevel: 'Prospectos B2B & Campañas',
    institutionOrDept: 'Equipo Comercial & Crecimiento',
    createdAt: '2025-01-14',
    lastLogin: 'Hoy, 15:45',
    notes: 'Encargado de embudo comercial y copies IA'
  },
  {
    uid: 'usr_sales_002',
    displayName: 'Lucía Gómez',
    email: 'lucia.gomez@lingua-ai.edu',
    phoneNumber: '+57 314 333 7788',
    role: 'sales',
    status: 'Activo',
    assignedLevel: 'Admisiones Particulares',
    institutionOrDept: 'Equipo Comercial & Crecimiento',
    createdAt: '2025-01-19',
    lastLogin: 'Hoy, 14:10',
    notes: 'Seguimiento de leads WhatsApp y agendamiento diagnóstico'
  },
  {
    uid: 'usr_student_001',
    displayName: 'Zara Hoffmann',
    email: 'zara.hoffmann@example.net',
    phoneNumber: '+57 310 555 1234',
    role: 'parent_student',
    status: 'Activo',
    assignedLevel: 'A2 (Elemental Alto)',
    institutionOrDept: 'Estudiante Activa (Cuota Bre-B al día)',
    createdAt: '2025-01-05',
    lastLogin: 'Hoy, 17:30',
    notes: 'Familia Hoffmann - 200 lecciones completadas',
    studentId: 1
  },
  {
    uid: 'usr_student_002',
    displayName: 'Theo Díaz',
    email: 'theo.diaz@example.com',
    phoneNumber: '+57 313 777 6655',
    role: 'parent_student',
    status: 'Activo',
    assignedLevel: 'B1 (Intermedio)',
    institutionOrDept: 'Estudiante Activo',
    createdAt: '2025-01-08',
    lastLogin: 'Ayer, 20:00',
    notes: 'En preparación para certificación B2',
    studentId: 27
  },
  {
    uid: 'usr_student_003',
    displayName: 'Mila Schneider',
    email: 'mila.schneider@example.com',
    phoneNumber: '+57 316 222 4433',
    role: 'parent_student',
    status: 'Activo',
    assignedLevel: 'B2 (Avanzado)',
    institutionOrDept: 'Estudiante Activa',
    createdAt: '2025-01-07',
    lastLogin: 'Hoy, 19:10',
    notes: 'Club de conversación y debates',
    studentId: 8
  },
  {
    uid: 'usr_student_004',
    displayName: 'Yara Schmidt',
    email: 'yara.schmidt@example.net',
    phoneNumber: '+57 317 666 1199',
    role: 'parent_student',
    status: 'Pendiente',
    assignedLevel: 'A1 (Iniciación)',
    institutionOrDept: 'Estudiante en Reactivación',
    createdAt: '2025-01-20',
    lastLogin: 'Hace 3 días',
    notes: 'Requiere tutoría 1-a-1 de nivelación',
    studentId: 2
  }
];

