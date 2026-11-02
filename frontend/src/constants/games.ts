// ============================================
// JUEGOS DE LA PLATAFORMA
// ============================================

export type JuegoId =
  | 'aprende-usar'
  | 'pinta-la-compu'
  | 'laberinto'
  | 'clasifica'
  | 'carrera'
  | 'pizarra-magica'
  | 'apunta-y-gana'
  | 'copia-y-juega'
  | 'colores-del-mundo';

export interface Juego {
  id: JuegoId;
  nombre: string;
  /** Emoji placeholder hasta que lleguen los assets reales */
  icono: string;
  /** URL de imagen real (opcional, reemplaza al emoji si existe) */
  imagenUrl?: string;
  /** Categoría/dimensión educativa */
  categoria: 'reconocimiento' | 'interaccion' | 'autonomia';
  /** Disponible para jugar */
  disponible: boolean;
  /** Orden de aparición en la cuadrícula */
  orden: number;
}

/**
 * Lista de juegos mostrados en "Mis Juegos".
 * El usuario irá pasando los juegos uno por uno para desarrollarlos.
 * Cuando se agregue un juego real, se cambia `disponible: true`
 * y se crea su componente en `src/components/child/games/`.
 */
export const JUEGOS: Juego[] = [
  {
    id: 'aprende-usar',
    nombre: 'Aprende a Usar',
    icono: '🖱️',
    categoria: 'interaccion',
    disponible: true, // Primer juego a desarrollar
    orden: 1,
  },
  {
    id: 'pinta-la-compu',
    nombre: 'Pinta la Compu',
    icono: '🎨',
    categoria: 'interaccion',
    disponible: true,
    orden: 2,
  },
  {
    id: 'laberinto',
    nombre: 'Laberinto',
    icono: '🏃',
    categoria: 'interaccion',
    disponible: true,
    orden: 3,
  },
  {
    id: 'clasifica',
    nombre: 'Clasifica',
    icono: '🏪',
    categoria: 'autonomia',
    disponible: true,
    orden: 4,
  },
  {
    id: 'carrera',
    nombre: 'Carrera',
    icono: '🏇',
    categoria: 'interaccion',
    disponible: true,
    orden: 5,
  },
  {
    id: 'pizarra-magica',
    nombre: 'Pizarra Mágica',
    icono: '🖌️',
    categoria: 'interaccion',
    disponible: true,
    orden: 6,
  },
  {
    id: 'apunta-y-gana',
    nombre: 'Apunta y gana',
    icono: '🏴‍☠️',
    categoria: 'reconocimiento',
    disponible: true,
    orden: 7,
  },
  {
    id: 'copia-y-juega',
    nombre: 'Copia y juega',
    icono: '🖼️',
    categoria: 'reconocimiento',
    disponible: true,
    orden: 8,
  },
  {
    id: 'colores-del-mundo',
    nombre: 'Colores del Mundo',
    icono: '🎨',
    categoria: 'reconocimiento',
    disponible: true,
    orden: 9,
  },
];

/**
 * Obtiene un juego por su ID
 */
export function getJuegoById(id: string): Juego | undefined {
  return JUEGOS.find(j => j.id === id);
}

/**
 * Obtiene los juegos ordenados
 */
export function getJuegosOrdenados(): Juego[] {
  return [...JUEGOS].sort((a, b) => a.orden - b.orden);
}

// ============================================
// NIVELES DEL NIÑO
// ============================================

export interface NivelInfo {
  id: string;
  nombre: string;
  icono: string;
  /** Puntaje mínimo para alcanzar este nivel */
  puntosMinimos: number;
}

export const NIVELES_NINO: NivelInfo[] = [
  { id: 'novato', nombre: 'Novato', icono: '🌱', puntosMinimos: 0 },
  { id: 'aprendiz', nombre: 'Aprendiz', icono: '📚', puntosMinimos: 100 },
  { id: 'explorador', nombre: 'Explorador', icono: '🔍', puntosMinimos: 300 },
  { id: 'experto', nombre: 'Experto', icono: '⭐', puntosMinimos: 600 },
  { id: 'maestro', nombre: 'Maestro', icono: '🏆', puntosMinimos: 1000 },
];

/**
 * Determina el nivel actual del niño según sus puntos
 */
export function getNivelPorPuntos(puntos: number): NivelInfo {
  // Iterar de mayor a menor para encontrar el nivel alcanzado
  for (let i = NIVELES_NINO.length - 1; i >= 0; i--) {
    if (puntos >= NIVELES_NINO[i].puntosMinimos) {
      return NIVELES_NINO[i];
    }
  }
  return NIVELES_NINO[0];
}
