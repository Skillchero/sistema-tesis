// ============================================
// JUEGO: CLASIFICA (20 niveles)
// Arrastra frutas a su canasta correcta
// Enseña clasificación por color/tipo
// Soporte drag & drop + clic como respaldo
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
// DATOS DE FRUTAS
// ============================================

interface Fruta {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
}

const FRUTAS: Fruta[] = [
  { id: 'manzana', nombre: 'Manzana', emoji: '🍎', color: '#ff6b6b' },
  { id: 'platano', nombre: 'Plátano', emoji: '🍌', color: '#ffd32a' },
  { id: 'sandia', nombre: 'Sandía', emoji: '🍉', color: '#2ecc71' },
  { id: 'uvas', nombre: 'Uvas', emoji: '🍇', color: '#a29bfe' },
  { id: 'naranja', nombre: 'Naranja', emoji: '🍊', color: '#fd9644' },
  { id: 'fresa', nombre: 'Fresa', emoji: '🍓', color: '#ff6b81' },
  { id: 'pina', nombre: 'Piña', emoji: '🍍', color: '#f0932b' },
  { id: 'pera', nombre: 'Pera', emoji: '🍐', color: '#a3cb38' },
  { id: 'cereza', nombre: 'Cereza', emoji: '🍒', color: '#ff4757' },
  { id: 'limon', nombre: 'Limón', emoji: '🍋', color: '#f9ca24' },
];

// ============================================
// CONFIGURACIÓN DE 20 NIVELES
// ============================================

interface NivelConfig {
  frutas: string[];
  mostrarNombres: boolean;
}

const NIVELES_CONFIG: NivelConfig[] = [
  // 1-5: Intro (5 frutas, con nombres)
  { frutas: ['manzana', 'platano', 'sandia', 'uvas', 'naranja'], mostrarNombres: true },
  { frutas: ['fresa', 'pina', 'pera', 'cereza', 'limon'], mostrarNombres: true },
  { frutas: ['manzana', 'naranja', 'pera', 'cereza', 'sandia'], mostrarNombres: true },
  { frutas: ['platano', 'uvas', 'pina', 'limon', 'fresa'], mostrarNombres: true },
  { frutas: ['manzana', 'platano', 'uvas', 'pera', 'cereza'], mostrarNombres: true },

  // 6-10: Fácil (6 frutas, con nombres)
  { frutas: ['manzana', 'platano', 'sandia', 'uvas', 'naranja', 'fresa'], mostrarNombres: true },
  { frutas: ['pina', 'pera', 'cereza', 'limon', 'manzana', 'platano'], mostrarNombres: true },
  { frutas: ['sandia', 'uvas', 'naranja', 'fresa', 'pina', 'pera'], mostrarNombres: true },
  { frutas: ['cereza', 'limon', 'manzana', 'platano', 'sandia', 'uvas'], mostrarNombres: true },
  { frutas: ['naranja', 'fresa', 'pina', 'pera', 'cereza', 'limon'], mostrarNombres: true },

  // 11-15: Medio (7 frutas, sin nombres)
  { frutas: ['manzana', 'platano', 'sandia', 'uvas', 'naranja', 'fresa', 'pina'], mostrarNombres: false },
  { frutas: ['pera', 'cereza', 'limon', 'manzana', 'platano', 'sandia', 'uvas'], mostrarNombres: false },
  { frutas: ['naranja', 'fresa', 'pina', 'pera', 'cereza', 'limon', 'manzana'], mostrarNombres: false },
  { frutas: ['platano', 'sandia', 'uvas', 'naranja', 'fresa', 'pina', 'pera'], mostrarNombres: false },
  { frutas: ['cereza', 'limon', 'manzana', 'platano', 'sandia', 'uvas', 'naranja'], mostrarNombres: false },

  // 16-20: Difícil (8 frutas, sin nombres)
  { frutas: ['manzana', 'platano', 'sandia', 'uvas', 'naranja', 'fresa', 'pina', 'pera'], mostrarNombres: false },
  { frutas: ['cereza', 'limon', 'manzana', 'platano', 'sandia', 'uvas', 'naranja', 'fresa'], mostrarNombres: false },
  { frutas: ['pina', 'pera', 'cereza', 'limon', 'manzana', 'platano', 'sandia', 'uvas'], mostrarNombres: false },
  { frutas: ['naranja', 'fresa', 'pina', 'pera', 'cereza', 'limon', 'manzana', 'platano'], mostrarNombres: false },
  { frutas: ['sandia', 'uvas', 'naranja', 'fresa', 'pina', 'pera', 'cereza', 'limon'], mostrarNombres: false },
];

// ============================================
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('clasifica-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('clasifica-progreso', JSON.stringify(c)); } catch { /* */ }
}

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

export default function ClasificaGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'clasifica' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  // Estado del nivel
  const [canastas, setCanastas] = useState<Fruta[]>([]);
  const [frutasMostrador, setFrutasMostrador] = useState<Fruta[]>([]);
  const [frutasEnCanasta, setFrutasEnCanasta] = useState<Record<string, Fruta[]>>({});
  const [frutaSeleccionada, setFrutaSeleccionada] = useState<string | null>(null);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);

  // Estado para drag & drop
  const [frutaArrastrada, setFrutaArrastrada] = useState<string | null>(null);
  const [canastaHover, setCanastaHover] = useState<string | null>(null);

  // Refs para posiciones (para drag & drop con touch)
  const frutaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canastaRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const config = NIVELES_CONFIG[nivelActual - 1];

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  const totalFrutas = useMemo(() => config?.frutas.length || 0, [config]);
  const clasificadas = useMemo(() => Object.values(frutasEnCanasta).reduce((acc, frutas) => acc + frutas.length, 0), [frutasEnCanasta]);

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
  // LÓGICA DE CLASIFICACIÓN
  // ============================================

  // Clic en fruta (selección simple)
  const seleccionarFruta = useCallback((frutaId: string) => {
    playClic();
    setFrutaSeleccionada(prev => prev === frutaId ? null : frutaId);
    const fruta = FRUTAS.find(f => f.id === frutaId);
    if (fruta) hablar(fruta.nombre, { velocidad: 0.9 });
  }, []);

  // Clic en canasta (cuando hay fruta seleccionada)
  const clasificarEnCanasta = useCallback((canastaId: string) => {
    if (!frutaSeleccionada) return;

    const fruta = FRUTAS.find(f => f.id === frutaSeleccionada);

    if (frutaSeleccionada === canastaId && fruta) {
      // ¡Correcto!
      playExito();
      setFrutasEnCanasta(prev => ({ ...prev, [canastaId]: [...(prev[canastaId] || []), fruta] }));
      setFrutasMostrador(prev => prev.filter(f => f.id !== frutaSeleccionada));
      setFrutaSeleccionada(null);
    } else {
      // Incorrecto
      playError();
      registrarError(nivelActual);
      setErrorFlash(canastaId);
      hablar('¡No es esa canasta! Intenta de nuevo.', { velocidad: 0.85 });
      setTimeout(() => setErrorFlash(null), 600);
    }
  }, [frutaSeleccionada, registrarError, nivelActual]);

  // ============================================
  // DRAG & DROP (HTML5 + Touch)
  // ============================================

  // Drag sobre canasta
  const handleDragOver = useCallback((e: React.DragEvent, canastaId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setCanastaHover(canastaId);
  }, []);

  // Salir de canasta
  const handleDragLeave = useCallback((canastaId: string) => {
    setCanastaHover(prev => prev === canastaId ? null : prev);
  }, []);

  // Soltar en canasta
  const handleDrop = useCallback((e: React.DragEvent, canastaId: string) => {
    e.preventDefault();
    const frutaId = e.dataTransfer.getData('text/plain');
    const fruta = FRUTAS.find(f => f.id === frutaId);

    if (frutaId === canastaId && fruta) {
      // ¡Correcto!
      playExito();
      setFrutasEnCanasta(prev => ({ ...prev, [canastaId]: [...(prev[canastaId] || []), fruta] }));
      setFrutasMostrador(prev => prev.filter(f => f.id !== frutaId));
      setFrutaSeleccionada(null);

      if (fruta) hablar(`¡${fruta.nombre} en su canasta!`, { velocidad: 0.9 });
    } else {
      // Incorrecto
      playError();
      registrarError(nivelActual);
      setErrorFlash(canastaId);
      hablar('¡No es esa canasta! Mira bien el color.', { velocidad: 0.85 });
      setTimeout(() => setErrorFlash(null), 600);
    }

    setFrutaArrastrada(null);
    setCanastaHover(null);
  }, []);

  // ============================================
  // TOUCH DRAG (para móviles)
  // ============================================

  const touchStartPos = useRef<{ x: number; y: number; frutaId: string } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, frutaId: string) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY, frutaId };
    setFrutaArrastrada(frutaId);
    setFrutaSeleccionada(frutaId);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;

    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // Verificar si está sobre alguna canasta
    Object.entries(canastaRefs.current).forEach(([canastaId, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          setCanastaHover(canastaId);
        } else {
          setCanastaHover(prev => prev === canastaId ? null : prev);
        }
      }
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;

    const touch = e.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const frutaId = touchStartPos.current.frutaId;
    const fruta = FRUTAS.find(f => f.id === frutaId);

    // Verificar si soltó sobre alguna canasta
    Object.entries(canastaRefs.current).forEach(([canastaId, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          if (frutaId === canastaId && fruta) {
            // ¡Correcto!
            playExito();
            setFrutasEnCanasta(prev => ({ ...prev, [canastaId]: [...(prev[canastaId] || []), fruta] }));
            setFrutasMostrador(prev => prev.filter(f => f.id !== frutaId));
            setFrutaSeleccionada(null);
            hablar(`¡${fruta.nombre} en su canasta!`, { velocidad: 0.9 });
          } else {
            // Incorrecto
            playError();
            registrarError(nivelActual);
            setErrorFlash(canastaId);
            hablar('¡No es esa canasta!', { velocidad: 0.85 });
            setTimeout(() => setErrorFlash(null), 600);
          }
        }
      }
    });

    touchStartPos.current = null;
    setFrutaArrastrada(null);
    setCanastaHover(null);
  }, [nivelActual, registrarError]);

  // Verificar completado
  useEffect(() => {
    if (!config || pantalla !== 'nivel' || mostrarCelebracion) return;
    if (totalFrutas > 0 && clasificadas >= totalFrutas && frutasMostrador.length === 0) {
      playNivelCompleto();
      agregarMonedas(15);
      agregarPuntos(30);
      agregarEstrellas(1);
      registrarAcierto(nivelActual);
      setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
      setTimeout(() => {
        setMostrarCelebracion(true);
        hablar(`¡Nivel ${nivelActual} completado! ¡Muy bien!`, { velocidad: 0.85 });
      }, 600);
    }
  }, [clasificadas, frutasMostrador.length, config, pantalla, mostrarCelebracion, nivelActual, totalFrutas, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const cfg = NIVELES_CONFIG[numero - 1];
    if (!cfg) return;
    playClic();

    const frutasNivel = cfg.frutas.map(id => FRUTAS.find(f => f.id === id)!).filter(Boolean);
    const canastasMezcladas = mezclar(frutasNivel);
    const mostradorMezclado = mezclar(frutasNivel);

    setCanastas(canastasMezcladas);
    setFrutasMostrador(mostradorMezclado);
    setFrutasEnCanasta({});
    setFrutaSeleccionada(null);
    setErrorFlash(null);
    setFrutaArrastrada(null);
    setCanastaHover(null);
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);
    frutaRefs.current = {};
    canastaRefs.current = {};

    hablar(`Nivel ${numero}. Arrastra cada fruta a su canasta. ${cfg.mostrarNombres ? 'Mira los nombres.' : '¡Solo colores!'}`, { velocidad: 0.82 });
  }, []);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= NIVELES_CONFIG.length) iniciarNivel(sig);
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

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="game-bg min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="w-full px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="back-btn" onClick={() => {
              if (pantalla === 'nivel') volverAlMapa();
              else salir();
            }} title="Volver">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="game-title text-xl sm:text-2xl flex items-center gap-2">
                <span className="text-2xl">🏪</span> Clasifica
              </h1>
              {pantalla === 'nivel' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-orange-500/20 text-orange-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-orange-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">{config?.mostrarNombres ? 'Con nombres' : '¡Sin nombres!'}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{NIVELES_CONFIG.length}
            </span>
            <button className="icon-btn" onClick={alternarSonido} title={sonidoActivo ? 'Silenciar' : 'Activar sonido'}>
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
            <motion.div key="inicio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md">
              <motion.div className="inline-block mb-6" animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <span className="text-8xl">🏪</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Clasifica!</h2>
              <p className="text-slate-300 text-lg mb-2">Arrastra cada fruta a su <span className="text-orange-400 font-bold">canasta 🧺</span></p>
              <p className="text-slate-400 text-sm mb-8">{NIVELES_CONFIG.length} niveles · Aprende colores y clasificación 🍎</p>
              <motion.button className="btn-inicial text-lg px-8 py-3"
                onClick={() => { playClic(); setPantalla('mapa'); }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                ▶ ¡JUGAR!
              </motion.button>
              <div className="mt-6">
                <button onClick={salir} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Volver a Mis Juegos</button>
              </div>
            </motion.div>
          )}

          {/* ===== MAPA ===== */}
          {pantalla === 'mapa' && (
            <motion.div key="mapa" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center">
              <h2 className="game-title text-2xl sm:text-3xl mb-6 text-center">Elige un nivel</h2>
              <div className="flex justify-center mb-6">
                <span className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-slate-300 text-sm">
                  {completados.length}/{NIVELES_CONFIG.length} completados
                </span>
              </div>
              <div className="grid grid-cols-5 gap-3 sm:gap-4 max-w-2xl w-full">
                {nivelesMapa.map((nivel, idx) => (
                  <motion.button key={nivel.numero}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03, type: 'spring', bounce: 0.4 }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                      nivel.estado === 'completado' ? 'bg-game-surface border-2 border-transparent hover:border-orange-400/50'
                      : nivel.estado === 'actual' ? 'bg-game-surface border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                    }`}
                    onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                    whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                    whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                    disabled={nivel.estado === 'bloqueado'}
                  >
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg ${
                      nivel.estado === 'completado' ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                      : nivel.estado === 'actual' ? 'bg-gradient-to-br from-orange-500 to-red-500'
                      : 'bg-slate-700/60'
                    }`}>
                      {nivel.numero}
                    </div>
                    <div className="h-4 flex items-center justify-center text-xs">
                      {nivel.estado === 'completado' ? '✅' : nivel.estado === 'actual' ? '▶️' : '🔒'}
                    </div>
                  </motion.button>
                ))}
              </div>
              {siguienteDisponible && (
                <motion.button className="btn-inicial mt-8 text-lg px-8 py-3"
                  onClick={() => iniciarNivel(siguienteDisponible)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  ▶ Nivel {siguienteDisponible}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ===== NIVEL ===== */}
          {pantalla === 'nivel' && config && (
            <motion.div key={`nivel-${nivelActual}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }} className="w-full max-w-5xl">
              {/* Barra superior */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-orange-500/20 text-orange-300 rounded-full px-3 py-1 text-sm font-bold border border-orange-500/30">
                  Nivel {nivelActual} / {NIVELES_CONFIG.length}
                </span>
                <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-300 text-sm">
                  {clasificadas} / {totalFrutas}
                </span>
              </div>

              {/* Instrucción */}
              <p className="text-white text-center text-base sm:text-lg font-semibold mb-4 game-title">
                {frutaArrastrada
                  ? '👆 ¡Suelta la fruta en su canasta!'
                  : frutaSeleccionada
                  ? '🧺 Ahora toca la canasta correcta'
                  : '🧺 Arrastra cada fruta a su canasta'}
              </p>

              {/* Canastas (arriba) */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6">
                {canastas.map((canasta) => {
                  const frutasEnEstaCanasta = frutasEnCanasta[canasta.id] || [];
                  const count = frutasEnEstaCanasta.length;
                  const esError = errorFlash === canasta.id;
                  const esHover = canastaHover === canasta.id && frutaArrastrada !== null;
                  const esSeleccionada = frutaSeleccionada === canasta.id;
                  const tieneFrutas = count > 0;

                  return (
                    <motion.div
                      key={canasta.id}
                      ref={(el) => { canastaRefs.current[canasta.id] = el; }}
                      className={`relative w-24 h-28 sm:w-28 sm:h-32 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer overflow-hidden
                        ${esError
                          ? 'bg-red-500/30 border-4 border-red-400'
                          : esHover
                            ? 'bg-green-500/30 border-4 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.5)] scale-110'
                            : esSeleccionada
                              ? 'bg-orange-500/20 border-4 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                              : tieneFrutas
                                ? 'bg-amber-800/50 border-4 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'bg-amber-900/30 border-4 border-dashed border-amber-500/40 hover:border-amber-400/70'
                        }`}
                      onClick={() => clasificarEnCanasta(canasta.id)}
                      onDragOver={(e) => handleDragOver(e, canasta.id)}
                      onDragLeave={() => handleDragLeave(canasta.id)}
                      onDrop={(e) => handleDrop(e, canasta.id)}
                      animate={esError ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Fondo de la canasta con frutas */}
                      {tieneFrutas && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="flex flex-wrap gap-0.5 p-1 justify-center items-center">
                            {frutasEnEstaCanasta.map((fruta, idx) => (
                              <motion.span
                                key={`${fruta.id}-${idx}`}
                                initial={{ scale: 0, y: -20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                transition={{ type: 'spring', bounce: 0.6, delay: idx * 0.05 }}
                                className="text-lg sm:text-xl"
                                style={{
                                  filter: `drop-shadow(0 0 3px ${fruta.color})`,
                                }}
                              >
                                {fruta.emoji}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Emoji de la canasta (se vuelve color cuando tiene frutas) */}
                      <span className={`text-4xl sm:text-5xl transition-all relative z-10 ${
                        tieneFrutas
                          ? 'opacity-60 drop-shadow-lg'
                          : esHover
                            ? 'opacity-70 scale-110'
                            : 'opacity-40 grayscale'
                      }`}>
                        {canasta.emoji}
                      </span>

                      {/* Nombre */}
                      {config.mostrarNombres && (
                        <span className={`text-xs font-bold relative z-10 ${
                          tieneFrutas ? 'text-amber-100' : 'text-amber-200'
                        }`}>
                          {canasta.nombre}
                        </span>
                      )}

                      {/* Contador de frutas */}
                      {count > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center z-20 shadow-lg"
                        >
                          {count}
                        </motion.span>
                      )}

                      {/* Indicador de hover durante drag */}
                      {esHover && (
                        <motion.span
                          className="absolute inset-0 rounded-2xl border-2 border-green-400 z-30"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Barra de progreso */}
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                    animate={{ width: `${totalFrutas > 0 ? (clasificadas / totalFrutas) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Mostrador de frutas (abajo) */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                <p className="text-white/50 text-xs text-center mb-3">Frutas para clasificar:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <AnimatePresence>
                    {frutasMostrador.map((fruta) => {
                      const esSeleccionada = frutaSeleccionada === fruta.id;
                      const esArrastrando = frutaArrastrada === fruta.id;

                      return (
                        <div
                          key={fruta.id}
                          ref={(el) => { frutaRefs.current[fruta.id] = el; }}
                          className="relative"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', fruta.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setFrutaArrastrada(fruta.id);
                            setFrutaSeleccionada(fruta.id);
                          }}
                          onDragEnd={() => {
                            setFrutaArrastrada(null);
                            setCanastaHover(null);
                          }}
                          onTouchStart={(e) => handleTouchStart(e, fruta.id)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          <motion.div
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all cursor-grab active:cursor-grabbing
                              ${esSeleccionada || esArrastrando
                                ? 'bg-orange-500/30 border-4 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]'
                                : 'bg-white/10 border-2 border-white/20 hover:bg-white/20 hover:border-white/40'
                              }`}
                            onClick={() => seleccionarFruta(fruta.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            layout
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: esArrastrando ? 0.5 : 1, scale: esSeleccionada || esArrastrando ? 1.1 : 1 }}
                            exit={{ opacity: 0, scale: 0, y: -50 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                          >
                          {fruta.emoji}
                          {/* Brillo del color */}
                          <div
                            className="absolute inset-0 rounded-2xl opacity-20"
                            style={{ background: `radial-gradient(circle, ${fruta.color}, transparent)` }}
                          />
                          {/* Indicador de arrastre */}
                          {esArrastrando && (
                            <motion.div
                              className="absolute inset-0 rounded-2xl border-2 border-orange-400"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            />
                          )}
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {frutasMostrador.length === 0 && (
                  <p className="text-green-400 text-center text-lg font-bold mt-2">✅ ¡Todas clasificadas!</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== CELEBRACIÓN ===== */}
      <AnimatePresence>
        {mostrarCelebracion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i} className="absolute rounded-sm"
                  style={{
                    left: `${(i / 20) * 100}%`, top: '-5%',
                    width: 6 + (i % 4) * 3, height: 8 + (i % 3) * 4,
                    backgroundColor: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899'][i % 5],
                  }}
                  initial={{ y: 0, opacity: 1, rotate: 0 }}
                  animate={{ y: '110vh', opacity: [1, 1, 0], rotate: i * 72 }}
                  transition={{ duration: 1.5 + (i % 3) * 0.5, delay: (i % 5) * 0.1, ease: 'easeIn' }}
                />
              ))}
            </div>
            <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
              className="relative text-center px-6 py-10 max-w-sm w-full">
              <motion.div className="text-8xl mb-4 inline-block"
                initial={{ rotate: -20, scale: 0 }} animate={{ rotate: [0, -10, 10, 0], scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}>
                🧺
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="game-title text-3xl sm:text-4xl mb-4 text-orange-300"
                style={{ textShadow: '0 0 30px rgba(249,115,22,0.5)' }}>
                ¡Nivel Completado!
              </motion.h2>
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring', bounce: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-full px-6 py-2.5 mb-8 shadow-lg shadow-orange-500/30">
                <span>+15</span>
                <span className="coin-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                {nivelActual < NIVELES_CONFIG.length ? (
                  <button onClick={irSiguienteNivel} className="btn-inicial text-lg px-10 py-3 animate-glow">Siguiente Nivel</button>
                ) : (
                  <button onClick={volverAlMapa} className="btn-inicial text-lg px-10 py-3 animate-glow">🏆 ¡Juego Completado!</button>
                )}
              </motion.div>
              {nivelActual < NIVELES_CONFIG.length && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  onClick={volverAlMapa}
                  className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Ver mapa de niveles
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
