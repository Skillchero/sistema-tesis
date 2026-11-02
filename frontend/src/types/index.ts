// ============================================
// TIPOS PRINCIPALES DEL SISTEMA
// ============================================

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================
export type UserRole = 'docente' | 'admin';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  creadoEn: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// NIÑOS (ESTUDIANTES)
// ============================================
export interface Nino {
  id: string;
  docenteId: string;
  nombreCompleto: string;
  codigoAlumno: string; // "Alumno 1", "Alumno 2", etc.
  edad: number; // 4 o 5
  fechaNacimiento?: string;
  activo: boolean;
  nivelActual: number; // 1-6
  createdAt: string;
  updatedAt: string;
}

export interface CreateNinoRequest {
  nombreCompleto: string;
  codigoAlumno: string;
  edad: number;
  fechaNacimiento?: string;
}

// ============================================
// ACTIVIDADES
// ============================================
export type Dimension = 'reconocimiento' | 'interaccion' | 'autonomia';

export type TipoActividad = 
  | 'reconocer_componente'  // Seleccionar monitor/teclado/etc
  | 'hacer_clic'            // Clic en el elemento correcto
  | 'mover_cursor'          // Mover mouse a destino
  | 'arrastrar_soltar'      // Drag and drop
  | 'seguir_instruccion'    // Siga la instrucción visual
  | 'secuencia_paso';       // Ordenar pasos

export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  dimension: Dimension;
  tipoActividad: TipoActividad;
  nivelDificultad: number; // 1-6
  configuracion: ConfigActividad;
  instrucciones: InstruccionesActividad;
  esPregunta: boolean;
  opciones?: Opcion[];
  respuestaCorrecta?: string;
  pista?: string;
  tiempoLimiteSegundos?: number;
  imagenUrl?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigActividad {
  tiempoLimite?: number; // segundos
  pistasPermitidas: number;
  retroalimentacionInmediata: boolean;
  animacionExito: string;
  animacionError: string;
  sonidoExito: string;
  sonidoError: string;
}

export interface InstruccionesActividad {
  texto: string;
  audioUrl?: string;
  imagenUrl?: string;
}

export interface Opcion {
  id: string;
  texto?: string;
  imagenUrl: string;
  esCorrecta: boolean;
}

// ============================================
// SESIONES DE APRENDIZAJE
// ============================================
export type EstadoSesion = 'activa' | 'completada' | 'pausada';

export interface SesionAprendizaje {
  id: string;
  ninoId: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoSesion;
  nivelInicial: number;
  nivelFinal?: number;
  createdAt: string;
}

// ============================================
// INTENTOS DE ACTIVIDAD
// ============================================
export type ResultadoIntento = 'correcto' | 'incorrecto' | 'abandonado';

export interface IntentoActividad {
  id: string;
  sesionId: string;
  actividadId: string;
  ninoId: string;
  resultado: ResultadoIntento;
  tiempoRespuestaMs: number;
  pistasUtilizadas: number;
  intentosTotales: number;
  nivelDificultad: number;
  createdAt: string;
}

// ============================================
// PROGRESO DEL NIÑO
// ============================================
export type NivelDominio = 'bajo' | 'regular' | 'alto';

export interface ProgresoNino {
  id: string;
  ninoId: string;
  dimension: Dimension;
  puntajeAcumulado: number;
  totalActividades: number;
  actividadesCorrectas: number;
  nivelDominio: NivelDominio;
  ultimaActividad: string;
  updatedAt: string;
}

// ============================================
// CONFIGURACIÓN IA
// ============================================
export interface CondicionIA {
  metrica: string;
  operador: '==' | '>=' | '<=' | '>' | '<';
  valor: number | string;
}

export interface AccionIA {
  tipo: 'subir_nivel' | 'bajar_nivel' | 'mantener_nivel' | 'mostrar_pista' | 'aumentar_peso_dimension';
  cantidad?: number;
  dimension?: Dimension;
}

export interface ReglaIA {
  id: string;
  nombreRegla: string;
  condicion: CondicionIA[];
  accion: AccionIA;
  prioridad: number;
  activa: boolean;
}

// ============================================
// MÉTRICAS PARA LA IA
// ============================================
export interface MetricasNino {
  ninoId: string;
  tasaAciertos: number; // 0-1
  tiempoPromedioRespuesta: number; // ms
  pistasUtilizadas: number;
  consistencia: number; // 0-1
  dimensionesDebil: Dimension | null;
  nivelActual: number;
  totalActividadesCompletadas: number;
}

// ============================================
// RESPUESTAS DE API
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// EVENTOS DE INTERFAZ (para analytics)
// ============================================
export interface EventoInteraccion {
  tipo: 'click' | 'drag' | 'drop' | 'hover' | 'start' | 'complete' | 'error' | 'hint';
  actividadId: string;
  ninoId: string;
  timestamp: number;
  datos?: Record<string, unknown>;
}

// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================
export interface AppConfig {
  nivelInicial: number;
  nivelMaximo: number;
  umbralSubirNivel: number; // 0.8 = 80%
  umbralBajarNivel: number; // 0.6 = 60%
  tiempoLimiteDefault: number; // segundos
  pistasPermitidasDefault: number;
}
