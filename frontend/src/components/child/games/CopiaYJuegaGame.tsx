// ============================================
// JUEGO: COPIA Y JUEGA (20 niveles)
// Copia el dibujo pixel por pixel
// Enseña patrones, colores y precisión del mouse
// Grids pequeños para niños de 4-5 años
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import {
  hablar,
  detenerVoz,
  setVozActiva,
  playNivelCompleto,
  playClic,
  playError,
} from '../../../services/audio/speech';
import { useChildStore } from '../../../stores/childStore';
import { useGameProgress } from '../../../hooks/useGameProgress';

// ============================================
// PALETA DE COLORES
// ============================================

interface ColorInfo {
  id: number;
  nombre: string;
  hex: string;
}

// 0 = vacío (fondo), 1+ = colores reales
const PALETA: ColorInfo[] = [
  { id: 0, nombre: 'Vacío', hex: '#1e293b' },    // Fondo
  { id: 1, nombre: 'Rojo', hex: '#EF4444' },
  { id: 2, nombre: 'Azul', hex: '#3B82F6' },
  { id: 3, nombre: 'Verde', hex: '#22C55E' },
  { id: 4, nombre: 'Amarillo', hex: '#EAB308' },
  { id: 5, nombre: 'Naranja', hex: '#F97316' },
  { id: 6, nombre: 'Morado', hex: '#A855F7' },
  { id: 7, nombre: 'Rosa', hex: '#EC4899' },
  { id: 8, nombre: 'Marrón', hex: '#92400e' },
  { id: 9, nombre: 'Celeste', hex: '#7dd3fc' },
];

// ============================================
// NIVELES - Pixel art simplificado 8x8 a 10x10
// ============================================

interface NivelPixel {
  nombre: string;
  emoji: string;
  size: number;
  grid: number[][]; // 0 = vacío, 1-9 = colores
}

const NIVELES: NivelPixel[] = [
  // ── 1-5: Muy fácil 8x8 (1-2 colores) ──
  {
    nombre: 'Corazón', emoji: '❤️', size: 8,
    grid: [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    nombre: 'Sol', emoji: '☀️', size: 8,
    grid: [
      [0, 0, 4, 0, 0, 4, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [4, 4, 5, 4, 4, 5, 4, 4],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [4, 4, 5, 4, 4, 5, 4, 4],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [0, 0, 4, 0, 0, 4, 0, 0],
    ],
  },
  {
    nombre: 'Pelota', emoji: '⚽', size: 8,
    grid: [
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [2, 2, 0, 0, 0, 0, 2, 2],
      [2, 2, 0, 0, 0, 0, 2, 2],
      [2, 2, 0, 0, 0, 0, 2, 2],
      [2, 2, 0, 0, 0, 0, 2, 2],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
    ],
  },
  {
    nombre: 'Flor', emoji: '🌸', size: 8,
    grid: [
      [0, 0, 7, 7, 7, 7, 0, 0],
      [0, 7, 7, 4, 4, 7, 7, 0],
      [7, 7, 4, 4, 4, 4, 7, 7],
      [7, 7, 4, 4, 4, 4, 7, 7],
      [0, 7, 7, 4, 4, 7, 7, 0],
      [0, 0, 7, 7, 7, 7, 0, 0],
      [0, 0, 0, 3, 3, 0, 0, 0],
      [0, 0, 0, 3, 3, 0, 0, 0],
    ],
  },
  {
    nombre: 'Casa', emoji: '🏠', size: 8,
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 8, 8, 8, 8, 8, 8, 0],
      [0, 8, 8, 2, 2, 8, 8, 0],
      [0, 8, 8, 2, 2, 8, 8, 0],
      [0, 8, 8, 8, 8, 8, 8, 0],
    ],
  },

  // ── 6-10: Fácil 8x8 (2-3 colores) ──
  {
    nombre: 'Cohete', emoji: '🚀', size: 8,
    grid: [
      [0, 0, 0, 9, 9, 0, 0, 0],
      [0, 0, 9, 9, 9, 9, 0, 0],
      [0, 0, 9, 0, 0, 9, 0, 0],
      [0, 0, 9, 0, 0, 9, 0, 0],
      [0, 1, 9, 9, 9, 9, 1, 0],
      [1, 1, 0, 9, 9, 0, 1, 1],
      [0, 0, 0, 5, 5, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0],
    ],
  },
  {
    nombre: 'Arbol', emoji: '🌳', size: 8,
    grid: [
      [0, 0, 0, 3, 3, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 8, 8, 0, 0, 0],
      [0, 0, 0, 8, 8, 0, 0, 0],
    ],
  },
  {
    nombre: 'Pez', emoji: '🐟', size: 8,
    grid: [
      [0, 0, 0, 0, 0, 2, 2, 0],
      [0, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 0, 0],
      [2, 2, 0, 2, 2, 2, 0, 0],
      [2, 2, 2, 2, 2, 2, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 2],
      [0, 0, 0, 0, 0, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    nombre: 'Estrella', emoji: '⭐', size: 8,
    grid: [
      [0, 0, 0, 4, 4, 0, 0, 0],
      [0, 0, 0, 4, 4, 0, 0, 0],
      [0, 0, 4, 4, 4, 4, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [0, 0, 4, 4, 4, 4, 0, 0],
      [0, 4, 4, 0, 0, 4, 4, 0],
      [4, 4, 0, 0, 0, 0, 4, 4],
    ],
  },
  {
    nombre: 'Nube', emoji: '☁️', size: 8,
    grid: [
      [0, 0, 0, 9, 9, 0, 0, 0],
      [0, 0, 9, 9, 9, 9, 0, 0],
      [0, 9, 9, 9, 9, 9, 9, 0],
      [9, 9, 9, 9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9, 9, 9, 9],
      [0, 9, 9, 9, 9, 9, 9, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },

  // ── 11-15: Medio 10x10 (3-4 colores) ──
  {
    nombre: 'Carita', emoji: '😊', size: 10,
    grid: [
      [0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [4, 4, 4, 1, 1, 4, 4, 1, 1, 4],
      [4, 4, 4, 1, 1, 4, 4, 1, 1, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [4, 4, 1, 4, 4, 4, 4, 1, 4, 4],
      [4, 4, 4, 1, 4, 4, 1, 4, 4, 4],
      [0, 4, 4, 4, 1, 1, 4, 4, 4, 0],
      [0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
    ],
  },
  {
    nombre: 'Gato', emoji: '🐱', size: 10,
    grid: [
      [0, 3, 3, 0, 0, 0, 0, 3, 3, 0],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 1, 3, 3, 3, 3, 1, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 5, 5, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 0, 3, 3, 0, 3, 3, 3],
      [0, 3, 3, 0, 0, 0, 0, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    nombre: 'Mariposa', emoji: '🦋', size: 10,
    grid: [
      [0, 6, 6, 0, 0, 0, 0, 6, 6, 0],
      [6, 6, 6, 6, 0, 0, 6, 6, 6, 6],
      [6, 6, 7, 6, 6, 6, 6, 7, 6, 6],
      [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      [0, 6, 6, 6, 1, 1, 6, 6, 6, 0],
      [0, 6, 6, 6, 1, 1, 6, 6, 6, 0],
      [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      [6, 6, 7, 6, 6, 6, 6, 7, 6, 6],
      [6, 6, 6, 6, 0, 0, 6, 6, 6, 6],
      [0, 6, 6, 0, 0, 0, 0, 6, 6, 0],
    ],
  },
  {
    nombre: 'Pato', emoji: '🦆', size: 10,
    grid: [
      [0, 0, 0, 0, 4, 4, 4, 0, 0, 0],
      [0, 0, 0, 4, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 4, 1, 1, 4, 4, 0, 0],
      [0, 0, 0, 4, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
      [0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    nombre: 'Pirata', emoji: '🏴‍☠️', size: 10,
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },

  // ── 16-20: Difícil 10x10 (4-5 colores) ──
  {
    nombre: 'Navidad', emoji: '🎄', size: 10,
    grid: [
      [0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
      [0, 0, 0, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 3, 3, 1, 3, 3, 3, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
      [3, 3, 3, 1, 3, 3, 1, 3, 3, 3],
      [0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 3, 3, 1, 3, 3, 3, 0, 0],
      [0, 0, 0, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 8, 8, 0, 0, 0, 0],
      [0, 0, 8, 8, 8, 8, 8, 8, 0, 0],
    ],
  },
  {
    nombre: 'Robot', emoji: '🤖', size: 10,
    grid: [
      [0, 0, 0, 0, 6, 6, 0, 0, 0, 0],
      [0, 0, 0, 6, 6, 6, 6, 0, 0, 0],
      [0, 6, 6, 9, 9, 9, 9, 6, 6, 0],
      [0, 6, 6, 9, 1, 9, 1, 6, 6, 0],
      [0, 6, 6, 9, 9, 9, 9, 6, 6, 0],
      [0, 6, 6, 9, 4, 4, 9, 6, 6, 0],
      [0, 6, 6, 9, 9, 9, 9, 6, 6, 0],
      [0, 0, 0, 6, 6, 6, 6, 0, 0, 0],
      [0, 6, 6, 6, 6, 6, 6, 6, 6, 0],
      [0, 6, 6, 0, 0, 0, 0, 6, 6, 0],
    ],
  },
  {
    nombre: 'Corona', emoji: '👑', size: 10,
    grid: [
      [0, 0, 4, 0, 0, 0, 0, 4, 0, 0],
      [0, 4, 4, 4, 0, 0, 4, 4, 4, 0],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [0, 4, 1, 4, 2, 2, 4, 1, 4, 0],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
      [0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    nombre: 'Penguin', emoji: '🐧', size: 10,
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 5, 5, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 5, 5, 0, 0, 5, 5, 0, 0],
    ],
  },
  {
    nombre: 'Arcoiris', emoji: '🌈', size: 10,
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 2, 2, 1, 1, 0],
      [1, 1, 2, 2, 3, 3, 2, 2, 1, 1],
      [1, 2, 2, 3, 3, 4, 4, 2, 2, 1],
      [1, 2, 3, 3, 4, 4, 5, 3, 2, 1],
      [1, 2, 3, 4, 4, 5, 5, 3, 2, 1],
      [1, 0, 2, 3, 4, 5, 6, 3, 0, 1],
      [1, 0, 0, 2, 3, 6, 6, 0, 0, 1],
      [1, 1, 0, 0, 6, 6, 0, 0, 1, 1],
    ],
  },
];

// ============================================
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('copia-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('copia-progreso', JSON.stringify(c)); } catch { /* */ }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'nivel';

export default function CopiaYJuegaGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'copia-y-juega' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  // Estado del nivel
  const [gridUsuario, setGridUsuario] = useState<number[][]>([]);
  const [colorSeleccionado, setColorSeleccionado] = useState(1);
  const [celdaError, setCeldaError] = useState<string | null>(null); // "r-c" para animación de error
  const [celdasRecientes, setCeldasRecientes] = useState<string[]>([]); // celdas recién pintadas (efecto cadena)

  const config = NIVELES[nivelActual - 1];

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  // Progreso de celdas pintadas correctamente
  const progreso = useMemo(() => {
    if (!config || gridUsuario.length === 0) return 0;
    let correctas = 0;
    let total = 0;
    for (let r = 0; r < config.size; r++) {
      for (let c = 0; c < config.size; c++) {
        if (config.grid[r][c] !== 0) { // Solo contar celdas que deben pintarse
          total++;
          if (gridUsuario[r][c] === config.grid[r][c]) correctas++;
        }
      }
    }
    return total > 0 ? correctas / total : 0;
  }, [config, gridUsuario]);

  // Verificar si completó el nivel
  useEffect(() => {
    if (!config || pantalla !== 'nivel' || mostrarCelebracion) return;
    if (progreso >= 1) {
      playNivelCompleto();
      agregarMonedas(15);
      agregarPuntos(30);
      agregarEstrellas(1);
      registrarAcierto(nivelActual);
      setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
      setTimeout(() => {
        setMostrarCelebracion(true);
        hablar(`¡Nivel ${nivelActual} completado! ¡Copiaste el ${config.nombre} perfectamente!`, { velocidad: 0.85 });
      }, 600);
    }
  }, [progreso, config, pantalla, mostrarCelebracion, nivelActual, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto]);

  // ============================================
  // LÓGICA DE PINTADO CON VALIDACIÓN DE COLOR
  // ============================================

  // Pintar celda con validación de espacio vacío + color correcto
  const pintarCelda = useCallback((row: number, col: number) => {
    if (!config) return;

    const colorObjetivo = config.grid[row][col];
    const esEspacioVacio = colorObjetivo === 0;

    // ❌ CASO 1: Espacio que debe quedar vacío
    if (esEspacioVacio) {
      playError();
      registrarError(nivelActual);
      setCeldaError(`${row}-${col}`);
      hablar('¡Ese espacio debe quedar vacío! No lo pintes.', { velocidad: 0.85 });
      setTimeout(() => setCeldaError(null), 600);
      return;
    }

    // ❌ CASO 2: Casilla correcta pero color equivocado
    if (colorSeleccionado !== colorObjetivo) {
      const colorSeleccionadoInfo = PALETA.find(p => p.id === colorSeleccionado);
      const colorObjetivoInfo = PALETA.find(p => p.id === colorObjetivo);
      playError();
      registrarError(nivelActual);
      setCeldaError(`${row}-${col}`);
      hablar(`¡No! Ese cuadro es ${colorObjetivoInfo?.nombre}, no ${colorSeleccionadoInfo?.nombre}. Cambia el color.`, { velocidad: 0.85 });
      setTimeout(() => setCeldaError(null), 700);
      return;
    }

    // ✅ CASO 3: Correcto - pintar en cadena (varias celdas continuas del mismo color)
    playClic();

    const nuevasCeldas: string[] = [];

    // BFS para expandir en cadena solo celdas adyacentes del MISMO color objetivo
    const visitadas = new Set<string>();
    const cola: Array<{ r: number; c: number }> = [{ r: row, c: col }];

    while (cola.length > 0 && nuevasCeldas.length < 6) {
      const actual = cola.shift()!;
      const key = `${actual.r}-${actual.c}`;
      if (visitadas.has(key)) continue;
      visitadas.add(key);

      if (
        actual.r >= 0 && actual.r < config.size &&
        actual.c >= 0 && actual.c < config.size &&
        config.grid[actual.r][actual.c] === colorObjetivo &&
        gridUsuario[actual.r][actual.c] !== colorObjetivo
      ) {
        nuevasCeldas.push(key);

        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
          const nr = actual.r + dr;
          const nc = actual.c + dc;
          const nKey = `${nr}-${nc}`;
          if (
            nr >= 0 && nr < config.size &&
            nc >= 0 && nc < config.size &&
            !visitadas.has(nKey) &&
            config.grid[nr][nc] === colorObjetivo
          ) {
            cola.push({ r: nr, c: nc });
          }
        }
      }
    }

    // Siempre pintar al menos la celda clickeada
    if (nuevasCeldas.length === 0) {
      nuevasCeldas.push(`${row}-${col}`);
    }

    // Aplicar pintado en cadena con el color seleccionado (que coincide con el objetivo)
    setGridUsuario(prev => {
      const nuevo = prev.map(r => [...r]);
      for (const key of nuevasCeldas) {
        const [r, c] = key.split('-').map(Number);
        nuevo[r][c] = colorSeleccionado;
      }
      return nuevo;
    });

    // Efecto visual de celdas recién pintadas
    setCeldasRecientes(nuevasCeldas);
    setTimeout(() => setCeldasRecientes([]), 500);
  }, [config, gridUsuario, colorSeleccionado]);

  const seleccionarColor = useCallback((id: number) => {
    playClic();
    setColorSeleccionado(id);
    const p = PALETA.find(c => c.id === id);
    if (p && id !== 0) hablar(p.nombre, { velocidad: 0.9 });
  }, []);

  const borrarTodo = useCallback(() => {
    if (!config) return;
    playClic();
    setGridUsuario(Array(config.size).fill(null).map(() => Array(config.size).fill(0)));
    hablar('Grid limpio. ¡Empieza de nuevo!', { velocidad: 0.85 });
  }, [config]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const nivel = NIVELES[numero - 1];
    if (!nivel) return;
    playClic();

    // Grid vacío al inicio
    const gridVacio = Array(nivel.size).fill(null).map(() => Array(nivel.size).fill(0));

    setGridUsuario(gridVacio);
    setColorSeleccionado(1);
    setCeldaError(null);
    setCeldasRecientes([]);
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);

    hablar(`Nivel ${numero}. Copia el ${nivel.nombre}. Primero elige el color, luego toca los cuadros.`, { velocidad: 0.82 });
  }, []);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= NIVELES.length) iniciarNivel(sig);
    else { setMostrarCelebracion(false); setPantalla('mapa'); }
  }, [nivelActual, iniciarNivel]);

  const volverAlMapa = useCallback(() => {
    detenerVoz();
    setMostrarCelebracion(false);
    setPantalla('mapa');
  }, []);

  const salir = useCallback(() => {
    detenerVoz();
    navigate('/nino/menu');
  }, [navigate]);

  // Mapa de niveles
  const nivelesMapa = useMemo(() => {
    return NIVELES.map((_, idx) => {
      const numero = idx + 1;
      let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
      if (completados.includes(numero)) estado = 'completado';
      else {
        const sig = NIVELES.findIndex((_, i) => !completados.includes(i + 1));
        if (sig + 1 === numero) estado = 'actual';
      }
      return { numero, estado };
    });
  }, [completados]);

  const siguienteDisponible = useMemo(() => {
    const sig = NIVELES.findIndex((_, i) => !completados.includes(i + 1));
    return sig >= 0 ? sig + 1 : null;
  }, [completados]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="game-bg min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="w-full px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="back-btn"
              onClick={() => {
                if (pantalla === 'nivel') volverAlMapa();
                else salir();
              }}
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="game-title text-xl sm:text-2xl flex items-center gap-2">
                <span className="text-2xl">🖼️</span> Copia y juega
              </h1>
              {pantalla === 'nivel' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-teal-500/20 text-teal-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-teal-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">{config?.nombre}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{NIVELES.length}
            </span>
            <button
              className="icon-btn"
              onClick={alternarSonido}
              title={sonidoActivo ? 'Silenciar' : 'Activar sonido'}
            >
              {sonidoActivo ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* ===== INICIO ===== */}
          {pantalla === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md"
            >
              <motion.div
                className="inline-block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-8xl">🖼️</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Copia y juega!</h2>
              <p className="text-slate-300 text-lg mb-2">
                Copia el dibujo <span className="text-teal-400 font-bold">píxel por píxel</span>
              </p>
              <p className="text-slate-400 text-sm mb-8">
                {NIVELES.length} niveles · Aprende patrones y colores 🎨
              </p>
              <motion.button
                className="btn-inicial text-lg px-8 py-3"
                onClick={() => { playClic(); setPantalla('mapa'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ▶ ¡JUGAR!
              </motion.button>
              <div className="mt-6">
                <button
                  onClick={salir}
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  ← Volver a Mis Juegos
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== MAPA ===== */}
          {pantalla === 'mapa' && (
            <motion.div
              key="mapa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="game-title text-2xl sm:text-3xl mb-6 text-center">Elige un nivel</h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 max-w-2xl w-full">
                {nivelesMapa.map((nivel, idx) => {
                  const nivelData = NIVELES[idx];
                  return (
                    <motion.button
                      key={nivel.numero}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03, type: 'spring', bounce: 0.4 }}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                        nivel.estado === 'completado'
                          ? 'bg-game-surface border-2 border-transparent hover:border-teal-400/50'
                          : nivel.estado === 'actual'
                          ? 'bg-game-surface border-2 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                          : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                      }`}
                      onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                      whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                      whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                      disabled={nivel.estado === 'bloqueado'}
                    >
                      <span className="text-3xl">{nivelData.emoji}</span>
                      <span className="text-white/80 text-xs font-bold">{nivelData.nombre}</span>
                      <div className="h-4 flex items-center justify-center text-xs">
                        {nivel.estado === 'completado' ? '✅' : nivel.estado === 'actual' ? '▶️' : '🔒'}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {siguienteDisponible && (
                <motion.button
                  className="btn-inicial mt-8 text-lg px-8 py-3"
                  onClick={() => iniciarNivel(siguienteDisponible)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶ Nivel {siguienteDisponible}: {NIVELES[siguienteDisponible - 1].nombre}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ===== NIVEL ===== */}
          {pantalla === 'nivel' && config && (
            <motion.div
              key={`nivel-${nivelActual}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              {/* Instrucción */}
              <p className="text-white text-center text-lg font-bold mb-4">
                🎨 Copia el <span className="text-teal-400">{config.nombre} {config.emoji}</span>
              </p>

              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
                {/* Imagen objetivo (referencia) */}
                <div className="text-center">
                  <p className="text-white/70 text-sm font-bold mb-2">👁️ Imagen Original</p>
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-3">
                    <div
                      className="grid gap-0.5"
                      style={{
                        gridTemplateColumns: `repeat(${config.size}, 1fr)`,
                        width: `${config.size * 28}px`,
                      }}
                    >
                      {config.grid.flatMap((row, r) =>
                        row.map((cell, c) => (
                          <div
                            key={`target-${r}-${c}`}
                            className="aspect-square rounded-sm"
                            style={{
                              backgroundColor: cell === 0 ? '#1e293b' : PALETA.find(p => p.id === cell)?.hex,
                              border: cell === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid editable del usuario */}
                <div className="text-center">
                  <p className="text-white/70 text-sm font-bold mb-2">✏️ Tu Dibujo</p>
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-3">
                    <div
                      className="grid gap-0.5"
                      style={{
                        gridTemplateColumns: `repeat(${config.size}, 1fr)`,
                        width: `${config.size * 32}px`,
                      }}
                    >
                      {gridUsuario.flatMap((row, r) =>
                        row.map((cell, c) => {
                          const esCorrecto = cell !== 0 && cell === config.grid[r][c];
                          const esError = celdaError === `${r}-${c}`;
                          const esReciente = celdasRecientes.includes(`${r}-${c}`);

                          return (
                            <button
                              key={`user-${r}-${c}`}
                              className={`aspect-square rounded-sm transition-all hover:scale-110 hover:z-10 relative ${
                                esError ? 'animate-shake' : ''
                              }`}
                              style={{
                                backgroundColor: esError
                                  ? '#dc2626' // Rojo de error
                                  : cell === 0 ? '#1e293b' : PALETA.find(p => p.id === cell)?.hex,
                                border: esError
                                  ? '3px solid #ef4444'
                                  : esReciente
                                    ? '3px solid #fbbf24' // Amarillo dorado para celdas recién pintadas
                                    : esCorrecto
                                      ? '2px solid #22C55E'
                                      : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: esReciente
                                  ? '0 0 15px rgba(251,191,36,0.8), 0 0 30px rgba(251,191,36,0.4)'
                                  : esError
                                    ? '0 0 20px rgba(239,68,68,0.8)'
                                    : undefined,
                                animation: esReciente ? 'pulse 0.3s ease-out' : undefined,
                              }}
                              onClick={() => pintarCelda(r, c)}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Paleta de colores */}
              <div className="mt-6 bg-white/5 rounded-2xl border border-white/10 p-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {PALETA.filter(p => p.id !== 0).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => seleccionarColor(p.id)}
                      className={`w-10 h-10 rounded-xl border-4 transition-all ${
                        colorSeleccionado === p.id
                          ? 'border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.6)] scale-110'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: p.hex }}
                      title={p.nombre}
                    />
                  ))}
                </div>
              </div>

              {/* Barra de progreso + botones */}
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progreso</span>
                    <span>{Math.round(progreso * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"
                      animate={{ width: `${progreso * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={borrarTodo}
                    className="px-4 py-2 rounded-xl bg-slate-600/60 hover:bg-slate-600 text-white font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑️ Borrar
                  </motion.button>
                  <motion.button
                    onClick={() => iniciarNivel(nivelActual)}
                    className="px-4 py-2 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Reiniciar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== CELEBRACIÓN ===== */}
      <AnimatePresence>
        {mostrarCelebracion && (
          <OverlayCelebracion
            nivel={nivelActual}
            total={NIVELES.length}
            onSiguiente={irSiguienteNivel}
            onMapa={volverAlMapa}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// OVERLAY CELEBRACIÓN
// ============================================

interface OverlayCelebracionProps {
  nivel: number;
  total: number;
  onSiguiente: () => void;
  onMapa: () => void;
}

function OverlayCelebracion({ nivel, total, onSiguiente, onMapa }: OverlayCelebracionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${(i / 20) * 100}%`,
              top: '-5%',
              width: 6 + (i % 4) * 3,
              height: 8 + (i % 3) * 4,
              backgroundColor: ['#14b8a6', '#06b6d4', '#22c55e', '#3b82f6', '#a855f7'][i % 5],
            }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: i * 72 }}
            transition={{ duration: 1.5 + (i % 3) * 0.5, delay: (i % 5) * 0.1, ease: 'easeIn' }}
          />
        ))}
      </div>
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="relative text-center px-6 py-10 max-w-sm w-full"
      >
        <motion.div
          className="text-8xl mb-4 inline-block"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: [0, -10, 10, 0], scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
        >
          🖼️
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-teal-300"
          style={{ textShadow: '0 0 30px rgba(20,184,166,0.5)' }}
        >
          ¡Nivel Completado!
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', bounce: 0.6 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-full px-6 py-2.5 mb-8 shadow-lg shadow-orange-500/30"
        >
          <span>+15</span>
          <span className="coin-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          {nivel < total ? (
            <button onClick={onSiguiente} className="btn-inicial text-lg px-10 py-3 animate-glow">
              Siguiente Nivel
            </button>
          ) : (
            <button onClick={onMapa} className="btn-inicial text-lg px-10 py-3 animate-glow">
              🏆 ¡Juego Completado!
            </button>
          )}
        </motion.div>
        {nivel < total && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onMapa}
            className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Ver mapa de niveles
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
