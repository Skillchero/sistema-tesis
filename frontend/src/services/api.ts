// ============================================
// SERVICIO API - Conexión Frontend ↔ Backend
// Guarda progreso, errores, intentos y aciertos
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// Tipos
// ============================================
export interface IntentoData {
  ninoId: string;
  juegoId: string;
  nivel: number;
  resultado: 'CORRECTO' | 'INCORRECTO' | 'ABANDONADO';
  tiempoRespuestaMs: number;
  errores: number;
  aciertos: number;
  pistasUtilizadas?: number;
}

export interface ProgresoData {
  ninoId: string;
  juegoId: string;
  nivelAlcanzado: number;
  porcentajeProgreso: number;
  estrellas: number;
  monedas: number;
}

// ============================================
// Niño activo (se guarda al iniciar sesión)
// ============================================
let ninoActivoId: string | null = null;

export function setNinoActivo(id: string) {
  ninoActivoId = id;
  localStorage.setItem('nino-activo-id', id);
}

export function getNinoActivo(): string | null {
  if (ninoActivoId) return ninoActivoId;
  ninoActivoId = localStorage.getItem('nino-activo-id');
  return ninoActivoId;
}

// ============================================
// POST /api/progreso/intento
// Registrar un intento (acierto o error)
// ============================================
export async function registrarIntento(data: IntentoData): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/progreso/intento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.success;
  } catch (error) {
    console.warn('API no disponible, guardando solo en localStorage:', error);
    return false;
  }
}

// ============================================
// POST /api/progreso/guardar
// Guardar progreso de un juego
// ============================================
export async function guardarProgreso(data: ProgresoData): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/progreso/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.success;
  } catch (error) {
    console.warn('API no disponible:', error);
    return false;
  }
}

// ============================================
// GET /api/progreso/:ninoId
// Obtener progreso completo
// ============================================
export async function obtenerProgreso(ninoId: string) {
  try {
    const res = await fetch(`${API_URL}/progreso/${ninoId}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ============================================
// GET /api/progreso/docente/:docenteId
// Obtener progreso de todos los alumnos
// ============================================
export async function obtenerProgresoDocente(docenteId: string) {
  try {
    const res = await fetch(`${API_URL}/progreso/docente/${docenteId}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

// ============================================
// GET /api/ninos?docenteId=xxx
// Obtener niños de un docente
// ============================================
export async function obtenerNinos(docenteId: string) {
  try {
    const res = await fetch(`${API_URL}/ninos?docenteId=${docenteId}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

// ============================================
// GET /api/ia/siguiente-actividad?ninoId=xxx
// Recomendación de IA adaptativa
// ============================================
export async function obtenerRecomendacionIA(ninoId: string) {
  try {
    const res = await fetch(`${API_URL}/ia/siguiente-actividad?ninoId=${ninoId}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ============================================
// GET /api/ninos/perfil/:id
// Cargar perfil del niño (monedas, estrellas, etc.)
// ============================================
export interface PerfilNino {
  id: string;
  docenteId: string;
  nombreCompleto: string;
  codigoAlumno: string;
  edad: number;
  nivelActual: number;
  monedas: number;
  puntos: number;
  estrellas: number;
  actividadesCompletadas: number;
  desaciertos: number;
  intentosTotales: number;
}

export async function cargarPerfilNino(ninoId: string): Promise<PerfilNino | null> {
  try {
    const res = await fetch(`${API_URL}/ninos/perfil/${ninoId}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ============================================
// POST /api/ninos/recompensa/:id
// Guardar recompensas tras completar un nivel
// ============================================
export interface RecompensaData {
  monedasGanadas?: number;
  puntosGanados?: number;
  estrellasGanadas?: number;
  nivelAlcanzado?: number;
}

export async function guardarRecompensa(
  ninoId: string,
  data: RecompensaData
): Promise<PerfilNino | null> {
  try {
    const res = await fetch(`${API_URL}/ninos/recompensa/${ninoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ============================================
// Helper: guardar recompensa del niño activo
// ============================================
export async function guardarRecompensaActiva(
  data: RecompensaData
): Promise<PerfilNino | null> {
  const ninoId = getNinoActivo();
  if (!ninoId) return null;
  return guardarRecompensa(ninoId, data);
}

// ============================================
// POST /api/auth/login (docente)
// ============================================
export async function loginDocente(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ============================================
// Helper: registrar intento desde un juego
// Usa el ninoActivoId si no se especifica
// ============================================
export async function registrarIntentoJuego(
  juegoId: string,
  nivel: number,
  resultado: 'CORRECTO' | 'INCORRECTO' | 'ABANDONADO',
  opciones?: {
    tiempoMs?: number;
    errores?: number;
    aciertos?: number;
    pistas?: number;
  }
): Promise<boolean> {
  const ninoId = getNinoActivo();
  if (!ninoId) {
    console.warn('No hay niño activo, no se guardará en BD');
    return false;
  }

  return registrarIntento({
    ninoId,
    juegoId,
    nivel,
    resultado,
    tiempoRespuestaMs: opciones?.tiempoMs || 0,
    errores: opciones?.errores ?? (resultado === 'INCORRECTO' ? 1 : 0),
    aciertos: opciones?.aciertos ?? (resultado === 'CORRECTO' ? 1 : 0),
    pistasUtilizadas: opciones?.pistas || 0,
  });
}
