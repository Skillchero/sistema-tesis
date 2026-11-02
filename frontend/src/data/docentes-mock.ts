// ============================================
// DATOS SIMULADOS: Docentes y Alumnos
// Para el panel docente - 6 docentes, 5 alumnos cada uno (30 total)
// ============================================

export interface Alumno {
  id: string;
  codigo: string;
  nombre: string;
  edad: number;
  imagen: string; // emoji avatar
  nivel: number; // 1-10
  puntos: number;
  monedas: number;
  estrellas: number;
  juegosCompletados: number; // de 9
  progresoGeneral: number; // 0-100
  tiempoTotalMinutos: number;
  ultimaSesion: string;
  progresoPorJuego: Record<string, {
    completado: boolean;
    nivel: number;
    estrellas: number;
  }>;
  necesitaAyuda: boolean;
}

export interface Docente {
  id: string;
  nombre: string;
  email: string;
  curso: string; // ej: "4 años - Sección A"
  alumnos: Alumno[];
}

// Juegos del sistema
const JUEGOS = [
  'aprende-usar',
  'pinta-compu',
  'laberinto',
  'clasifica',
  'carrera',
  'pizarra',
  'apunta',
  'copia',
  'colores',
];

function generarProgresoPorJuego(nivelBase: number, completados: number) {
  const progreso: Record<string, { completado: boolean; nivel: number; estrellas: number }> = {};
  JUEGOS.forEach((juego, i) => {
    const completado = i < completados;
    progreso[juego] = {
      completado,
      nivel: completado ? Math.min(nivelBase + (i % 3), 10) : 0,
      estrellas: completado ? Math.floor(Math.random() * 3) + 1 : 0,
    };
  });
  return progreso;
}

// ============================================
// DOCENTE 1: Ana García - 4 años Sección A
// ============================================
const docente1Alumnos: Alumno[] = [
  {
    id: 'a1-1',
    codigo: 'A001',
    nombre: 'Alumno 1',
    edad: 4,
    imagen: '👦',
    nivel: 4,
    puntos: 320,
    monedas: 145,
    estrellas: 8,
    juegosCompletados: 4,
    progresoGeneral: 85,
    tiempoTotalMinutos: 120,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a1-2',
    codigo: 'A002',
    nombre: 'Alumno 2',
    edad: 4,
    imagen: '👧',
    nivel: 3,
    puntos: 245,
    monedas: 95,
    estrellas: 6,
    juegosCompletados: 3,
    progresoGeneral: 65,
    tiempoTotalMinutos: 95,
    ultimaSesion: 'Ayer',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a1-3',
    codigo: 'A003',
    nombre: 'Alumno 3',
    edad: 4,
    imagen: '👦',
    nivel: 5,
    puntos: 410,
    monedas: 180,
    estrellas: 10,
    juegosCompletados: 5,
    progresoGeneral: 92,
    tiempoTotalMinutos: 150,
    ultimaSesion: 'Hace 1 hora',
    progresoPorJuego: generarProgresoPorJuego(4, 5),
    necesitaAyuda: false,
  },
  {
    id: 'a1-4',
    codigo: 'A004',
    nombre: 'Alumno 4',
    edad: 4,
    imagen: '👧',
    nivel: 2,
    puntos: 180,
    monedas: 70,
    estrellas: 4,
    juegosCompletados: 2,
    progresoGeneral: 45,
    tiempoTotalMinutos: 60,
    ultimaSesion: 'Hace 3 días',
    progresoPorJuego: generarProgresoPorJuego(1, 2),
    necesitaAyuda: true,
  },
  {
    id: 'a1-5',
    codigo: 'A005',
    nombre: 'Alumno 5',
    edad: 4,
    imagen: '👦',
    nivel: 6,
    puntos: 450,
    monedas: 200,
    estrellas: 12,
    juegosCompletados: 6,
    progresoGeneral: 98,
    tiempoTotalMinutos: 200,
    ultimaSesion: 'Hace 30 min',
    progresoPorJuego: generarProgresoPorJuego(5, 6),
    necesitaAyuda: false,
  },
];

// ============================================
// DOCENTE 2: Roberto Silva - 4 años Sección B
// ============================================
const docente2Alumnos: Alumno[] = [
  {
    id: 'a2-1',
    codigo: 'B001',
    nombre: 'Alumno 1',
    edad: 4,
    imagen: '👧',
    nivel: 3,
    puntos: 280,
    monedas: 110,
    estrellas: 7,
    juegosCompletados: 3,
    progresoGeneral: 70,
    tiempoTotalMinutos: 110,
    ultimaSesion: 'Hace 4 horas',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a2-2',
    codigo: 'B002',
    nombre: 'Alumno 2',
    edad: 4,
    imagen: '👦',
    nivel: 4,
    puntos: 350,
    monedas: 130,
    estrellas: 9,
    juegosCompletados: 4,
    progresoGeneral: 80,
    tiempoTotalMinutos: 130,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a2-3',
    codigo: 'B003',
    nombre: 'Alumno 3',
    edad: 4,
    imagen: '👧',
    nivel: 2,
    puntos: 190,
    monedas: 75,
    estrellas: 5,
    juegosCompletados: 2,
    progresoGeneral: 50,
    tiempoTotalMinutos: 70,
    ultimaSesion: 'Ayer',
    progresoPorJuego: generarProgresoPorJuego(1, 2),
    necesitaAyuda: true,
  },
  {
    id: 'a2-4',
    codigo: 'B004',
    nombre: 'Alumno 4',
    edad: 4,
    imagen: '👦',
    nivel: 5,
    puntos: 390,
    monedas: 160,
    estrellas: 10,
    juegosCompletados: 5,
    progresoGeneral: 88,
    tiempoTotalMinutos: 145,
    ultimaSesion: 'Hace 1 día',
    progresoPorJuego: generarProgresoPorJuego(4, 5),
    necesitaAyuda: false,
  },
  {
    id: 'a2-5',
    codigo: 'B005',
    nombre: 'Alumno 5',
    edad: 4,
    imagen: '👧',
    nivel: 3,
    puntos: 260,
    monedas: 100,
    estrellas: 6,
    juegosCompletados: 3,
    progresoGeneral: 68,
    tiempoTotalMinutos: 100,
    ultimaSesion: 'Hace 5 horas',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
];

// ============================================
// DOCENTE 3: Elena Torres - 5 años Sección A
// ============================================
const docente3Alumnos: Alumno[] = [
  {
    id: 'a3-1',
    codigo: 'C001',
    nombre: 'Alumno 1',
    edad: 5,
    imagen: '👦',
    nivel: 5,
    puntos: 380,
    monedas: 150,
    estrellas: 9,
    juegosCompletados: 5,
    progresoGeneral: 85,
    tiempoTotalMinutos: 140,
    ultimaSesion: 'Hace 3 horas',
    progresoPorJuego: generarProgresoPorJuego(4, 5),
    necesitaAyuda: false,
  },
  {
    id: 'a3-2',
    codigo: 'C002',
    nombre: 'Alumno 2',
    edad: 5,
    imagen: '👧',
    nivel: 4,
    puntos: 310,
    monedas: 120,
    estrellas: 8,
    juegosCompletados: 4,
    progresoGeneral: 75,
    tiempoTotalMinutos: 125,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a3-3',
    codigo: 'C003',
    nombre: 'Alumno 3',
    edad: 5,
    imagen: '👦',
    nivel: 6,
    puntos: 420,
    monedas: 175,
    estrellas: 11,
    juegosCompletados: 6,
    progresoGeneral: 95,
    tiempoTotalMinutos: 180,
    ultimaSesion: 'Hace 1 hora',
    progresoPorJuego: generarProgresoPorJuego(5, 6),
    necesitaAyuda: false,
  },
  {
    id: 'a3-4',
    codigo: 'C004',
    nombre: 'Alumno 4',
    edad: 5,
    imagen: '👧',
    nivel: 3,
    puntos: 250,
    monedas: 90,
    estrellas: 6,
    juegosCompletados: 3,
    progresoGeneral: 60,
    tiempoTotalMinutos: 90,
    ultimaSesion: 'Ayer',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a3-5',
    codigo: 'C005',
    nombre: 'Alumno 5',
    edad: 5,
    imagen: '👦',
    nivel: 2,
    puntos: 170,
    monedas: 65,
    estrellas: 3,
    juegosCompletados: 2,
    progresoGeneral: 40,
    tiempoTotalMinutos: 55,
    ultimaSesion: 'Hace 4 días',
    progresoPorJuego: generarProgresoPorJuego(1, 2),
    necesitaAyuda: true,
  },
];

// ============================================
// DOCENTE 4: Miguel Rojas - 5 años Sección B
// ============================================
const docente4Alumnos: Alumno[] = [
  {
    id: 'a4-1',
    codigo: 'D001',
    nombre: 'Alumno 1',
    edad: 5,
    imagen: '👧',
    nivel: 4,
    puntos: 340,
    monedas: 135,
    estrellas: 8,
    juegosCompletados: 4,
    progresoGeneral: 78,
    tiempoTotalMinutos: 135,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a4-2',
    codigo: 'D002',
    nombre: 'Alumno 2',
    edad: 5,
    imagen: '👦',
    nivel: 5,
    puntos: 395,
    monedas: 165,
    estrellas: 10,
    juegosCompletados: 5,
    progresoGeneral: 90,
    tiempoTotalMinutos: 155,
    ultimaSesion: 'Hace 1 hora',
    progresoPorJuego: generarProgresoPorJuego(4, 5),
    necesitaAyuda: false,
  },
  {
    id: 'a4-3',
    codigo: 'D003',
    nombre: 'Alumno 3',
    edad: 5,
    imagen: '👧',
    nivel: 3,
    puntos: 270,
    monedas: 105,
    estrellas: 7,
    juegosCompletados: 3,
    progresoGeneral: 66,
    tiempoTotalMinutos: 105,
    ultimaSesion: 'Hace 3 horas',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a4-4',
    codigo: 'D004',
    nombre: 'Alumno 4',
    edad: 5,
    imagen: '👦',
    nivel: 4,
    puntos: 325,
    monedas: 125,
    estrellas: 8,
    juegosCompletados: 4,
    progresoGeneral: 74,
    tiempoTotalMinutos: 120,
    ultimaSesion: 'Ayer',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a4-5',
    codigo: 'D005',
    nombre: 'Alumno 5',
    edad: 5,
    imagen: '👧',
    nivel: 6,
    puntos: 440,
    monedas: 190,
    estrellas: 12,
    juegosCompletados: 6,
    progresoGeneral: 97,
    tiempoTotalMinutos: 190,
    ultimaSesion: 'Hace 45 min',
    progresoPorJuego: generarProgresoPorJuego(5, 6),
    necesitaAyuda: false,
  },
];

// ============================================
// DOCENTE 5: Patricia Vega - 4 años Sección C
// ============================================
const docente5Alumnos: Alumno[] = [
  {
    id: 'a5-1',
    codigo: 'E001',
    nombre: 'Alumno 1',
    edad: 4,
    imagen: '👦',
    nivel: 3,
    puntos: 290,
    monedas: 115,
    estrellas: 7,
    juegosCompletados: 3,
    progresoGeneral: 72,
    tiempoTotalMinutos: 115,
    ultimaSesion: 'Hace 3 horas',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a5-2',
    codigo: 'E002',
    nombre: 'Alumno 2',
    edad: 4,
    imagen: '👧',
    nivel: 4,
    puntos: 330,
    monedas: 125,
    estrellas: 8,
    juegosCompletados: 4,
    progresoGeneral: 79,
    tiempoTotalMinutos: 130,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a5-3',
    codigo: 'E003',
    nombre: 'Alumno 3',
    edad: 4,
    imagen: '👦',
    nivel: 2,
    puntos: 185,
    monedas: 72,
    estrellas: 4,
    juegosCompletados: 2,
    progresoGeneral: 46,
    tiempoTotalMinutos: 65,
    ultimaSesion: 'Hace 5 días',
    progresoPorJuego: generarProgresoPorJuego(1, 2),
    necesitaAyuda: true,
  },
  {
    id: 'a5-4',
    codigo: 'E004',
    nombre: 'Alumno 4',
    edad: 4,
    imagen: '👧',
    nivel: 3,
    puntos: 265,
    monedas: 98,
    estrellas: 6,
    juegosCompletados: 3,
    progresoGeneral: 64,
    tiempoTotalMinutos: 98,
    ultimaSesion: 'Ayer',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a5-5',
    codigo: 'E005',
    nombre: 'Alumno 5',
    edad: 4,
    imagen: '👦',
    nivel: 5,
    puntos: 375,
    monedas: 155,
    estrellas: 9,
    juegosCompletados: 5,
    progresoGeneral: 86,
    tiempoTotalMinutos: 145,
    ultimaSesion: 'Hace 1 hora',
    progresoPorJuego: generarProgresoPorJuego(4, 5),
    necesitaAyuda: false,
  },
];

// ============================================
// DOCENTE 6: Daniel Pérez - 5 años Sección C
// ============================================
const docente6Alumnos: Alumno[] = [
  {
    id: 'a6-1',
    codigo: 'F001',
    nombre: 'Alumno 1',
    edad: 5,
    imagen: '👧',
    nivel: 5,
    puntos: 395,
    monedas: 160,
    estrellas: 10,
    juegosCompletados: 5,
    progresoGeneral: 89,
    tiempoTotalMinutos: 150,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(4, 5),
    necesitaAyuda: false,
  },
  {
    id: 'a6-2',
    codigo: 'F002',
    nombre: 'Alumno 2',
    edad: 5,
    imagen: '👦',
    nivel: 4,
    puntos: 345,
    monedas: 135,
    estrellas: 8,
    juegosCompletados: 4,
    progresoGeneral: 81,
    tiempoTotalMinutos: 135,
    ultimaSesion: 'Hace 3 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
  {
    id: 'a6-3',
    codigo: 'F003',
    nombre: 'Alumno 3',
    edad: 5,
    imagen: '👧',
    nivel: 6,
    puntos: 430,
    monedas: 185,
    estrellas: 11,
    juegosCompletados: 6,
    progresoGeneral: 94,
    tiempoTotalMinutos: 175,
    ultimaSesion: 'Hace 1 hora',
    progresoPorJuego: generarProgresoPorJuego(5, 6),
    necesitaAyuda: false,
  },
  {
    id: 'a6-4',
    codigo: 'F004',
    nombre: 'Alumno 4',
    edad: 5,
    imagen: '👦',
    nivel: 3,
    puntos: 285,
    monedas: 110,
    estrellas: 7,
    juegosCompletados: 3,
    progresoGeneral: 69,
    tiempoTotalMinutos: 110,
    ultimaSesion: 'Ayer',
    progresoPorJuego: generarProgresoPorJuego(2, 3),
    necesitaAyuda: false,
  },
  {
    id: 'a6-5',
    codigo: 'F005',
    nombre: 'Alumno 5',
    edad: 5,
    imagen: '👧',
    nivel: 4,
    puntos: 355,
    monedas: 140,
    estrellas: 9,
    juegosCompletados: 4,
    progresoGeneral: 82,
    tiempoTotalMinutos: 140,
    ultimaSesion: 'Hace 2 horas',
    progresoPorJuego: generarProgresoPorJuego(3, 4),
    necesitaAyuda: false,
  },
];

export const DOCENTES: Docente[] = [
  {
    id: 'doc1',
    nombre: 'Docente 1',
    email: 'docente1@colegio.edu',
    curso: '4 años - Sección A',
    alumnos: docente1Alumnos,
  },
  {
    id: 'doc2',
    nombre: 'Docente 2',
    email: 'docente2@colegio.edu',
    curso: '4 años - Sección B',
    alumnos: docente2Alumnos,
  },
  {
    id: 'doc3',
    nombre: 'Docente 3',
    email: 'docente3@colegio.edu',
    curso: '5 años - Sección A',
    alumnos: docente3Alumnos,
  },
  {
    id: 'doc4',
    nombre: 'Docente 4',
    email: 'docente4@colegio.edu',
    curso: '5 años - Sección B',
    alumnos: docente4Alumnos,
  },
  {
    id: 'doc5',
    nombre: 'Docente 5',
    email: 'docente5@colegio.edu',
    curso: '4 años - Sección C',
    alumnos: docente5Alumnos,
  },
  {
    id: 'doc6',
    nombre: 'Docente 6',
    email: 'docente6@colegio.edu',
    curso: '5 años - Sección C',
    alumnos: docente6Alumnos,
  },
];

export function obtenerDocentePorId(id: string): Docente | undefined {
  return DOCENTES.find(d => d.id === id);
}

export function obtenerTodosDocentes(): Docente[] {
  return DOCENTES;
}
