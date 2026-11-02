// ============================================
// CONSTANTES DEL SISTEMA
// ============================================

import type { Dimension, TipoActividad, NivelDominio, AppConfig } from '../types';

// ============================================
// DIMENSIONES DE APRENDIZAJE
// ============================================
export const DIMENSIONES: Record<Dimension, { label: string; color: string; icon: string }> = {
  reconocimiento: {
    label: 'Reconocimiento de Componentes',
    color: 'bg-blue-100 text-blue-700',
    icon: 'Monitor',
  },
  interaccion: {
    label: 'Interacción con la Computadora',
    color: 'bg-green-100 text-green-700',
    icon: 'MousePointer',
  },
  autonomia: {
    label: 'Autonomía Digital Inicial',
    color: 'bg-purple-100 text-purple-700',
    icon: 'Sparkles',
  },
};

// ============================================
// TIPOS DE ACTIVIDAD
// ============================================
export const TIPOS_ACTIVIDAD: Record<TipoActividad, { label: string; icon: string }> = {
  reconocer_componente: {
    label: 'Reconocer Componente',
    icon: 'Eye',
  },
  hacer_clic: {
    label: 'Hacer Clic',
    icon: 'MousePointerClick',
  },
  mover_cursor: {
    label: 'Mover Cursor',
    icon: 'Move',
  },
  arrastrar_soltar: {
    label: 'Arrastrar y Soltar',
    icon: 'GripVertical',
  },
  seguir_instruccion: {
    label: 'Seguir Instrucción',
    icon: 'ArrowRight',
  },
  secuencia_paso: {
    label: 'Secuencia de Pasos',
    icon: 'ListOrdered',
  },
};

// ============================================
// NIVELES DE DIFICULTAD
// ============================================
export const NIVELES_DIFICULTAD = [
  { nivel: 1, descripcion: 'Reconocer componentes con nombres (máxima facilidad)', dificultad: 1 },
  { nivel: 2, descripcion: 'Reconocer componentes sin nombres, solo imagen', dificultad: 2 },
  { nivel: 3, descripcion: 'Hacer clic en componentes específicos', dificultad: 3 },
  { nivel: 4, descripcion: 'Mover cursor a ubicaciones específicas', dificultad: 4 },
  { nivel: 5, descripcion: 'Arrastrar y soltar elementos', dificultad: 5 },
  { nivel: 6, descripcion: 'Seguir instrucciones complejas (combinación)', dificultad: 6 },
] as const;

// ============================================
// NIVELES DE DOMINIO
// ============================================
export const NIVEL_DOMINIO: Record<NivelDominio, { min: number; max: number; color: string; label: string }> = {
  bajo: {
    min: 1.0,
    max: 2.33,
    color: 'bg-red-100 text-red-700',
    label: 'Bajo',
  },
  regular: {
    min: 2.34,
    max: 3.66,
    color: 'bg-yellow-100 text-yellow-700',
    label: 'Regular',
  },
  alto: {
    min: 3.67,
    max: 5.0,
    color: 'bg-green-100 text-green-700',
    label: 'Alto',
  },
};

// ============================================
// COMPONENTES DE COMPUTADORA
// ============================================
export const COMPONENTES_COMPUTADORA = [
  { id: 'monitor', nombre: 'Monitor', icono: 'monitor' },
  { id: 'teclado', nombre: 'Teclado', icono: 'keyboard' },
  { id: 'mouse', nombre: 'Mouse', icono: 'mouse' },
  { id: 'cpu', nombre: 'CPU / Unidad Central', icono: 'cpu' },
  { id: 'impresora', nombre: 'Impresora', icono: 'printer' },
  { id: 'bocinas', nombre: 'Bocinas', icono: 'volume' },
] as const;

// ============================================
// CONFIGURACIÓN DE LA IA
// ============================================
export const CONFIG_IA: AppConfig = {
  nivelInicial: 1,
  nivelMaximo: 6,
  umbralSubirNivel: 0.8, // 80% de aciertos para subir
  umbralBajarNivel: 0.6,  // Menos de 60% para bajar
  tiempoLimiteDefault: 30, // segundos
  pistasPermitidasDefault: 3,
};

// ============================================
// REGLAS DE IA PREDEFINIDAS
// ============================================
export const REGLAS_IA_PREDEFINIDAS = [
  {
    nombre: 'Subir de nivel',
    condicion: { tasa_aciertos: '>=', valor: 0.8 },
    accion: { tipo: 'subir_nivel' as const, cantidad: 1 },
    prioridad: 1,
    activa: true,
  },
  {
    nombre: 'Mantener nivel',
    condicion: { tasa_aciertos: '>=', valor: 0.6 },
    condicion2: { tasa_aciertos: '<', valor: 0.8 },
    accion: { tipo: 'mantener_nivel' as const },
    prioridad: 2,
    activa: true,
  },
  {
    nombre: 'Bajar de nivel (repetir)',
    condicion: { tasa_aciertos: '<', valor: 0.6 },
    accion: { tipo: 'bajar_nivel' as const, cantidad: 1 },
    prioridad: 3,
    activa: true,
  },
  {
    nombre: 'Dar pista automática',
    condicion: { tiempo_respuesta: '>', valor: 15000 },
    accion: { tipo: 'mostrar_pista' as const },
    prioridad: 4,
    activa: true,
  },
] as const;

// ============================================
// RETROALIMENTACIÓN
// ============================================
export const RETROALIMENTACION_EXITO = [
  '¡Muy bien! 🎉',
  '¡Excelente! ⭐',
  '¡Lo lograste! 🌟',
  '¡Eres genial! 👏',
  '¡Perfecto! ✨',
  '¡Increíble! 🎊',
  '¡Bien hecho! 💪',
  '¡Sigue así! 🚀',
] as const;

export const RETROALIMENTACION_ERROR = [
  '¡Inténtalo de nuevo! 💪',
  '¡Tú puedes! 🌈',
  '¡Casi lo logras! 🎯',
  '¡Otra vez! ✨',
  '¡No te rindas! 🌟',
] as const;

export const RETROALIMENTACION_PISTA = [
  'Mira bien... 👀',
  'Piensa un poquito más... 🤔',
  'Aquí hay una pista: 👇',
  'Observa con atención... 🔍',
] as const;

// ============================================
// PUNTUACIÓN
// ============================================
export const PUNTUACION = {
  CORRECTO_PRIMERA_VEZ: 100,
  CORRECTO_CON_PISTA: 50,
  INCORRECTO_INTENTO: 10,
  BONUS_RAPIDEZ: 50, // Si responde en menos de 3 segundos
  ESTRELLAS: {
    TRES: 0.9,  // 90%+ para 3 estrellas
    DOS: 0.7,   // 70%+ para 2 estrellas
    UNA: 0.5,   // 50%+ para 1 estrella
  },
} as const;

// ============================================
// RUTAS
// ============================================
export const ROUTES = {
  // Públicas
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Docente
  DASHBOARD: '/docente',
  STUDENTS: '/docente/ninos',
  STUDENT_DETAIL: '/docente/ninos/:id',
  REPORTS: '/docente/reportes',
  ACTIVITIES: '/docente/actividades',
  AI_CONFIG: '/docente/config-ia',
  
  // Niño
  CHILD_LOGIN: '/nino',
  CHILD_ACTIVITY: '/nino/actividad/:id',
  CHILD_PROGRESS: '/nino/progreso',
  CHILD_MENU: '/nino/menu',
  
  // Home
  HOME: '/',
} as const;

// ============================================
// LÍMITES Y VALIDACIONES
// ============================================
export const VALIDACIONES = {
  NINO: {
    NOMBRE_MIN: 3,
    NOMBRE_MAX: 100,
    EDAD_MIN: 4,
    EDAD_MAX: 5,
    CODIGO_PATTERN: /^Alumno \d{1,3}$/,
  },
  USUARIO: {
    PASSWORD_MIN: 6,
    PASSWORD_MAX: 128,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// ============================================
// TAMAÑOS DE PANTALLA (Breakpoints Tailwind)
// ============================================
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280,
} as const;

// ============================================
// COLORES DEL TEMA
// ============================================
export const COLORES_TEMA = {
  PRIMARIO: '#3b82f6',
  SECUNDARIO: '#22c55e',
  EXITO: '#22c55e',
  ERROR: '#ef4444',
  ADVERTENCIA: '#f59e0b',
  NEUTRAL: '#64748b',
} as const;
