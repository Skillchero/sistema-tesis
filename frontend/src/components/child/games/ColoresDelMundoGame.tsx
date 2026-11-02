// ============================================
// JUEGO: COLORES DEL MUNDO (20 niveles)
// Asocia colores con objetos del mundo real
// Enseña reconocimiento de colores y vocabulario
// Clic en el objeto correcto (sin teclado)
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
  playExito,
  playError,
} from '../../../services/audio/speech';
import { useChildStore } from '../../../stores/childStore';
import { useGameProgress } from '../../../hooks/useGameProgress';

// ============================================
// DATOS DE COLORES Y OBJETOS
// ============================================

interface Objeto {
  nombre: string;
  emoji: string;
  colorHex: string; // Color principal del objeto
}

interface ColorData {
  nombre: string;
  hex: string;
  objetos: Objeto[]; // 1+ objetos de ese color
}

const COLORES_MUNDO: ColorData[] = [
  {
    nombre: 'Rojo',
    hex: '#EF4444',
    objetos: [
      { nombre: 'Manzana', emoji: '🍎', colorHex: '#EF4444' },
      { nombre: 'Tomate', emoji: '🍅', colorHex: '#EF4444' },
      { nombre: 'Fresa', emoji: '🍓', colorHex: '#EF4444' },
      { nombre: 'Corazón', emoji: '❤️', colorHex: '#EF4444' },
    ],
  },
  {
    nombre: 'Azul',
    hex: '#3B82F6',
    objetos: [
      { nombre: 'Arándano', emoji: '🫐', colorHex: '#3B82F6' },
      { nombre: 'Mar', emoji: '🌊', colorHex: '#3B82F6' },
      { nombre: 'Cielo', emoji: '💧', colorHex: '#3B82F6' },
    ],
  },
  {
    nombre: 'Amarillo',
    hex: '#EAB308',
    objetos: [
      { nombre: 'Plátano', emoji: '🍌', colorHex: '#EAB308' },
      { nombre: 'Limón', emoji: '🍋', colorHex: '#EAB308' },
      { nombre: 'Sol', emoji: '☀️', colorHex: '#EAB308' },
      { nombre: 'Estrella', emoji: '⭐', colorHex: '#EAB308' },
    ],
  },
  {
    nombre: 'Verde',
    hex: '#22C55E',
    objetos: [
      { nombre: 'Hoja', emoji: '🌿', colorHex: '#22C55E' },
      { nombre: 'Pera', emoji: '🍐', colorHex: '#22C55E' },
      { nombre: 'Rana', emoji: '🐸', colorHex: '#22C55E' },
      { nombre: 'Árbol', emoji: '🌳', colorHex: '#22C55E' },
    ],
  },
  {
    nombre: 'Naranja',
    hex: '#F97316',
    objetos: [
      { nombre: 'Naranja', emoji: '🍊', colorHex: '#F97316' },
      { nombre: 'Zanahoria', emoji: '🥕', colorHex: '#F97316' },
      { nombre: 'Calabaza', emoji: '🎃', colorHex: '#F97316' },
    ],
  },
  {
    nombre: 'Morado',
    hex: '#A855F7',
    objetos: [
      { nombre: 'Uva', emoji: '🍇', colorHex: '#A855F7' },
      { nombre: 'Berengena', emoji: '🍆', colorHex: '#A855F7' },
      { nombre: 'Flores', emoji: '💜', colorHex: '#A855F7' },
    ],
  },
  {
    nombre: 'Rosa',
    hex: '#EC4899',
    objetos: [
      { nombre: 'Flor', emoji: '🌸', colorHex: '#EC4899' },
      { nombre: 'Flamingo', emoji: '🦩', colorHex: '#EC4899' },
    ],
  },
  {
    nombre: 'Marrón',
    hex: '#92400E',
    objetos: [
      { nombre: 'Oso', emoji: '🐻', colorHex: '#92400E' },
      { nombre: 'Chocolate', emoji: '🍫', colorHex: '#92400E' },
      { nombre: 'Pan', emoji: '🍞', colorHex: '#92400E' },
    ],
  },
  {
    nombre: 'Negro',
    hex: '#1E293B',
    objetos: [
      { nombre: 'Pingüino', emoji: '🐧', colorHex: '#1E293B' },
      { nombre: 'Murciélago', emoji: '🦇', colorHex: '#1E293B' },
    ],
  },
  {
    nombre: 'Blanco',
    hex: '#F5F5F5',
    objetos: [
      { nombre: 'Nube', emoji: '☁️', colorHex: '#F5F5F5' },
      { nombre: 'Nieve', emoji: '❄️', colorHex: '#F5F5F5' },
    ],
  },
];

// Objetos distractores (otros colores)
const DISTRACTORES: Objeto[] = [
  { nombre: 'Manzana', emoji: '🍎', colorHex: '#EF4444' },
  { nombre: 'Plátano', emoji: '🍌', colorHex: '#EAB308' },
  { nombre: 'Uva', emoji: '🍇', colorHex: '#A855F7' },
  { nombre: 'Naranja', emoji: '🍊', colorHex: '#F97316' },
  { nombre: 'Pera', emoji: '🍐', colorHex: '#22C55E' },
  { nombre: 'Arándano', emoji: '🫐', colorHex: '#3B82F6' },
  { nombre: 'Fresa', emoji: '🍓', colorHex: '#EF4444' },
  { nombre: 'Limón', emoji: '🍋', colorHex: '#EAB308' },
  { nombre: 'Sandía', emoji: '🍉', colorHex: '#22C55E' },
  { nombre: 'Cereza', emoji: '🍒', colorHex: '#EF4444' },
];

// ============================================
// CONFIGURACIÓN DE 20 NIVELES
// ============================================

interface NivelConfig {
  colorIdx: number; // Índice en COLORES_MUNDO
  numOpciones: number; // 2 o 3 opciones
  vidas: number;
}

const NIVELES_CONFIG: NivelConfig[] = [
  // 1-5: Intro (2 opciones, 4 vidas)
  { colorIdx: 0, numOpciones: 2, vidas: 4 }, // Rojo
  { colorIdx: 1, numOpciones: 2, vidas: 4 }, // Azul
  { colorIdx: 2, numOpciones: 2, vidas: 4 }, // Amarillo
  { colorIdx: 3, numOpciones: 2, vidas: 4 }, // Verde
  { colorIdx: 4, numOpciones: 2, vidas: 4 }, // Naranja

  // 6-10: Fácil (3 opciones, 3 vidas)
  { colorIdx: 5, numOpciones: 3, vidas: 3 }, // Morado
  { colorIdx: 6, numOpciones: 3, vidas: 3 }, // Rosa
  { colorIdx: 7, numOpciones: 3, vidas: 3 }, // Marrón
  { colorIdx: 8, numOpciones: 3, vidas: 3 }, // Negro
  { colorIdx: 9, numOpciones: 3, vidas: 3 }, // Blanco

  // 11-15: Medio (3 opciones, 3 vidas)
  { colorIdx: 0, numOpciones: 3, vidas: 3 }, // Rojo
  { colorIdx: 1, numOpciones: 3, vidas: 3 }, // Azul
  { colorIdx: 2, numOpciones: 3, vidas: 3 }, // Amarillo
  { colorIdx: 3, numOpciones: 3, vidas: 3 }, // Verde
  { colorIdx: 4, numOpciones: 3, vidas: 3 }, // Naranja

  // 16-20: Difícil (3 opciones, 2 vidas)
  { colorIdx: 5, numOpciones: 3, vidas: 2 }, // Morado
  { colorIdx: 6, numOpciones: 3, vidas: 2 }, // Rosa
  { colorIdx: 7, numOpciones: 3, vidas: 2 }, // Marrón
  { colorIdx: 8, numOpciones: 3, vidas: 2 }, // Negro
  { colorIdx: 9, numOpciones: 3, vidas: 2 }, // Blanco
];

// ============================================
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('colores-mundo-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('colores-mundo-progreso', JSON.stringify(c)); } catch { /* */ }
}

// Mezclar array (Fisher-Yates)
function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'nivel';

export default function ColoresDelMundoGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'colores-del-mundo' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [mostrarPerder, setMostrarPerder] = useState(false);

  // Estado del nivel
  const [opciones, setOpciones] = useState<Objeto[]>([]);
  const [colorObjetivo, setColorObjetivo] = useState<ColorData | null>(null);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<string | null>(null);
  const [esCorrecto, setEsCorrecto] = useState<boolean | null>(null);
  const [vidas, setVidas] = useState(3);

  const config = NIVELES_CONFIG[nivelActual - 1];

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  // ============================================
  // LÓGICA DE SELECCIÓN
  // ============================================

  const seleccionarObjeto = useCallback((obj: Objeto) => {
    if (!config || !colorObjetivo || objetoSeleccionado) return;

    playClic();
    setObjetoSeleccionado(obj.nombre);

    // Verificar si es correcto
    const esObjetoCorrecto = colorObjetivo.objetos.some(o => o.nombre === obj.nombre);

    setTimeout(() => {
      if (esObjetoCorrecto) {
        // ¡Correcto!
        setEsCorrecto(true);
        playExito();

        setTimeout(() => {
          playNivelCompleto();
          agregarMonedas(15);
          agregarPuntos(30);
          agregarEstrellas(1);
          registrarAcierto(nivelActual);
          setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
          setMostrarCelebracion(true);
          hablar(`¡Nivel ${nivelActual} completado! ¡${obj.nombre} es ${colorObjetivo.nombre}! ¡Muy bien!`, { velocidad: 0.85 });
        }, 800);
      } else {
        // Incorrecto
        setEsCorrecto(false);
        playError();
        registrarError(nivelActual);
        const nuevasVidas = vidas - 1;
        setVidas(nuevasVidas);

        setTimeout(() => {
          setObjetoSeleccionado(null);
          setEsCorrecto(null);

          if (nuevasVidas <= 0) {
            setMostrarPerder(true);
            hablar('¡Se acabaron las vidas! ¡Intenta otra vez!', { velocidad: 0.85 });
          } else {
            hablar(`¡No! ${obj.nombre} no es ${colorObjetivo.nombre}. ¡Inténtalo otra vez!`, { velocidad: 0.85 });
          }
        }, 1200);
      }
    }, 400);
  }, [config, colorObjetivo, objetoSeleccionado, vidas, nivelActual, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto, registrarError]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const cfg = NIVELES_CONFIG[numero - 1];
    if (!cfg) return;
    playClic();

    const color = COLORES_MUNDO[cfg.colorIdx];

    // Seleccionar objeto correcto aleatorio
    const objetoCorrecto = color.objetos[Math.floor(Math.random() * color.objetos.length)];

    // Seleccionar distractores (de otros colores)
    const distractoresDisponibles = DISTRACTORES.filter(d => d.colorHex !== color.hex);
    const distractoresMezclados = mezclar(distractoresDisponibles).slice(0, cfg.numOpciones - 1);

    // Combinar y mezclar
    const opcionesMezcladas = mezclar([objetoCorrecto, ...distractoresMezclados]);

    setOpciones(opcionesMezcladas);
    setColorObjetivo(color);
    setObjetoSeleccionado(null);
    setEsCorrecto(null);
    setVidas(cfg.vidas);
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);
    setMostrarPerder(false);

    hablar(`Nivel ${numero}. ¿Cuál es ${color.nombre}? ¡Toca el objeto ${color.nombre}!`, { velocidad: 0.82 });
  }, []);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= NIVELES_CONFIG.length) iniciarNivel(sig);
    else { setMostrarCelebracion(false); setPantalla('mapa'); }
  }, [nivelActual, iniciarNivel]);

  const reintentarNivel = useCallback(() => {
    iniciarNivel(nivelActual);
  }, [nivelActual, iniciarNivel]);

  const volverAlMapa = useCallback(() => {
    detenerVoz();
    setMostrarCelebracion(false);
    setMostrarPerder(false);
    setPantalla('mapa');
  }, []);

  const salir = useCallback(() => {
    detenerVoz();
    navigate('/nino/menu');
  }, [navigate]);

  // Mapa de niveles
  const nivelesMapa = useMemo(() => {
    return NIVELES_CONFIG.map((_, idx) => {
      const numero = idx + 1;
      let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
      if (completados.includes(numero)) estado = 'completado';
      else {
        const sig = NIVELES_CONFIG.findIndex((_, i) => !completados.includes(i + 1));
        if (sig + 1 === numero) estado = 'actual';
      }
      return { numero, estado };
    });
  }, [completados]);

  const siguienteDisponible = useMemo(() => {
    const sig = NIVELES_CONFIG.findIndex((_, i) => !completados.includes(i + 1));
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
                <span className="text-2xl">🎨</span> Colores del Mundo
              </h1>
              {pantalla === 'nivel' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-pink-500/20 text-pink-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-pink-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">{colorObjetivo?.nombre}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{NIVELES_CONFIG.length}
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
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-8xl">🎨</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Colores del Mundo!</h2>
              <p className="text-slate-300 text-lg mb-2">
                Encuentra objetos de <span className="text-pink-400 font-bold">cada color</span>
              </p>
              <p className="text-slate-400 text-sm mb-8">
                {NIVELES_CONFIG.length} niveles · Aprende colores y vocabulario 🌈
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
              <div className="grid grid-cols-5 gap-3 sm:gap-4 max-w-2xl w-full">
                {nivelesMapa.map((nivel, idx) => {
                  const colorNivel = COLORES_MUNDO[NIVELES_CONFIG[idx].colorIdx];
                  return (
                    <motion.button
                      key={nivel.numero}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03, type: 'spring', bounce: 0.4 }}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                        nivel.estado === 'completado'
                          ? 'bg-game-surface border-2 border-transparent hover:border-pink-400/50'
                          : nivel.estado === 'actual'
                          ? 'bg-game-surface border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                          : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                      }`}
                      onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                      whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                      whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                      disabled={nivel.estado === 'bloqueado'}
                    >
                      <div
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg border-2 border-white/30"
                        style={{ backgroundColor: colorNivel.hex }}
                      >
                        {nivel.numero}
                      </div>
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
                  ▶ Nivel {siguienteDisponible}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ===== NIVEL ===== */}
          {pantalla === 'nivel' && config && colorObjetivo && (
            <motion.div
              key={`nivel-${nivelActual}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              {/* Barra superior: vidas + nivel */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">
                  {'❤️'.repeat(Math.max(vidas, 0))}{'🖤'.repeat(Math.max(config.vidas - vidas, 0))}
                </span>
                <span className="bg-pink-500/20 text-pink-300 rounded-full px-3 py-1 text-sm font-bold border border-pink-500/30">
                  Nivel {nivelActual} / {NIVELES_CONFIG.length}
                </span>
              </div>

              {/* Instrucción: Color objetivo */}
              <div className="text-center mb-8">
                <p className="text-white text-lg font-bold mb-4">🎨 ¡Encuentra el objeto</p>
                <motion.div
                  className="inline-flex items-center gap-4 bg-white/10 rounded-3xl px-8 py-5 border-4 border-white/20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div
                    className="w-16 h-16 rounded-full border-4 border-white/50 shadow-lg"
                    style={{ backgroundColor: colorObjetivo.hex }}
                  />
                  <p className="text-white text-4xl font-black game-title" style={{ textShadow: `0 0 30px ${colorObjetivo.hex}` }}>
                    {colorObjetivo.nombre}
                  </p>
                </motion.div>
              </div>

              {/* Opciones de objetos */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6">
                {opciones.map((obj) => {
                  const seleccionado = objetoSeleccionado === obj.nombre;
                  const esObjetoCorrecto = seleccionado && esCorrecto === true;
                  const esObjetoIncorrecto = seleccionado && esCorrecto === false;

                  return (
                    <motion.button
                      key={obj.nombre}
                      className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all
                        ${esObjetoCorrecto
                          ? 'bg-green-500/30 border-4 border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.6)]'
                          : esObjetoIncorrecto
                          ? 'bg-red-500/30 border-4 border-red-400'
                          : 'bg-white/5 border-4 border-white/20 hover:border-white/50 hover:scale-105'
                        }`}
                      onClick={() => seleccionarObjeto(obj)}
                      disabled={!!objetoSeleccionado}
                      whileHover={!objetoSeleccionado ? { scale: 1.1 } : {}}
                      whileTap={!objetoSeleccionado ? { scale: 0.9 } : {}}
                      animate={seleccionado && esCorrecto === false ? { x: [0, -10, 10, -6, 6, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="text-6xl sm:text-7xl">{obj.emoji}</span>
                      <span className="text-white/80 text-sm font-bold">{obj.nombre}</span>

                      {/* Efecto de selección */}
                      {seleccionado && (
                        <motion.span
                          className="absolute text-5xl"
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        >
                          {esCorrecto === true ? '✨' : '❌'}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
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
            total={NIVELES_CONFIG.length}
            onSiguiente={irSiguienteNivel}
            onMapa={volverAlMapa}
          />
        )}
      </AnimatePresence>

      {/* ===== PERDER ===== */}
      <AnimatePresence>
        {mostrarPerder && (
          <OverlayPerder onReintentar={reintentarNivel} onMapa={volverAlMapa} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// OVERLAYS
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
              backgroundColor: ['#ec4899', '#a855f7', '#3b82f6', '#22c55e', '#eab308'][i % 5],
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
          🎨
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-pink-300"
          style={{ textShadow: '0 0 30px rgba(236,72,153,0.5)' }}
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

interface OverlayPerderProps {
  onReintentar: () => void;
  onMapa: () => void;
}

function OverlayPerder({ onReintentar, onMapa }: OverlayPerderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="relative text-center px-6 py-10 max-w-sm w-full"
      >
        <motion.div
          className="text-8xl mb-4 inline-block"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
        >
          😢
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-red-300"
        >
          ¡Se acabaron las vidas!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-400 mb-8"
        >
          ¡No te preocupes, inténtalo otra vez!
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <button onClick={onReintentar} className="btn-inicial text-lg px-10 py-3 animate-glow">
            🔄 ¡Otra Vez!
          </button>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onMapa}
          className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Ver mapa de niveles
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
