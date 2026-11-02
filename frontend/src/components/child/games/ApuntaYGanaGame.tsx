// ============================================
// JUEGO: APUNTA Y GANA (20 niveles)
// Tanque de guerra dispara al color correcto
// Enseña reconocimiento de colores y precisión
// Bala animada con línea de apunte
// ============================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
// COLORES DISPONIBLES
// ============================================

interface ColorInfo {
  id: string;
  nombre: string;
  emoji: string;
  hex: string;
}

const COLORES: ColorInfo[] = [
  { id: 'rojo', nombre: 'Rojo', emoji: '🔴', hex: '#FF6B6B' },
  { id: 'azul', nombre: 'Azul', emoji: '🔵', hex: '#48DBFB' },
  { id: 'verde', nombre: 'Verde', emoji: '🟢', hex: '#6BCB77' },
  { id: 'amarillo', nombre: 'Amarillo', emoji: '🟡', hex: '#FFD93D' },
  { id: 'morado', nombre: 'Morado', emoji: '🟣', hex: '#A29BFE' },
  { id: 'naranja', nombre: 'Naranja', emoji: '🟠', hex: '#FF9F43' },
  { id: 'rosa', nombre: 'Rosa', emoji: '🌸', hex: '#FF6BAA' },
  { id: 'negro', nombre: 'Negro', emoji: '⚫', hex: '#2D3436' },
  { id: 'blanco', nombre: 'Blanco', emoji: '⚪', hex: '#F5F5F5' },
];

// ============================================
// CONFIGURACIÓN DE 20 NIVELES
// ============================================

interface NivelConfig {
  colorObjetivo: string;
  opciones: string[];
  conObstaculos: boolean;
  vidas: number;
}

const NIVELES_CONFIG: NivelConfig[] = [
  { colorObjetivo: 'rojo', opciones: ['rojo', 'azul', 'verde'], conObstaculos: false, vidas: 4 },
  { colorObjetivo: 'azul', opciones: ['azul', 'amarillo', 'rojo'], conObstaculos: false, vidas: 4 },
  { colorObjetivo: 'verde', opciones: ['verde', 'morado', 'amarillo'], conObstaculos: false, vidas: 4 },
  { colorObjetivo: 'amarillo', opciones: ['amarillo', 'rojo', 'azul'], conObstaculos: false, vidas: 4 },
  { colorObjetivo: 'morado', opciones: ['morado', 'naranja', 'verde'], conObstaculos: false, vidas: 4 },
  { colorObjetivo: 'naranja', opciones: ['naranja', 'morado', 'rojo', 'amarillo'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'rosa', opciones: ['rosa', 'negro', 'rojo', 'verde'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'negro', opciones: ['negro', 'blanco', 'rojo', 'azul'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'rojo', opciones: ['rojo', 'azul', 'verde', 'amarillo'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'azul', opciones: ['azul', 'rojo', 'morado', 'naranja'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'verde', opciones: ['verde', 'amarillo', 'negro', 'rosa'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'amarillo', opciones: ['amarillo', 'verde', 'rojo', 'azul'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'morado', opciones: ['morado', 'naranja', 'azul', 'verde'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'naranja', opciones: ['naranja', 'morado', 'rojo', 'amarillo'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'rosa', opciones: ['rosa', 'negro', 'rojo', 'azul'], conObstaculos: true, vidas: 3 },
  { colorObjetivo: 'negro', opciones: ['negro', 'rosa', 'verde', 'amarillo'], conObstaculos: true, vidas: 2 },
  { colorObjetivo: 'rojo', opciones: ['rojo', 'azul', 'verde', 'amarillo'], conObstaculos: true, vidas: 2 },
  { colorObjetivo: 'azul', opciones: ['azul', 'rojo', 'morado', 'naranja'], conObstaculos: true, vidas: 2 },
  { colorObjetivo: 'verde', opciones: ['verde', 'amarillo', 'negro', 'rosa'], conObstaculos: true, vidas: 2 },
  { colorObjetivo: 'morado', opciones: ['morado', 'naranja', 'azul', 'verde'], conObstaculos: true, vidas: 2 },
];

// ============================================
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('apunta-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('apunta-progreso', JSON.stringify(c)); } catch { /* */ }
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

// Interfaz para partícula de bala
interface Bala {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
}

export default function ApuntaYGanaGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'apunta-y-gana' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [mostrarPerder, setMostrarPerder] = useState(false);

  // Estado del nivel
  const [opciones, setOpciones] = useState<ColorInfo[]>([]);
  const [vidas, setVidas] = useState(3);
  const [impacto, setImpacto] = useState<string | null>(null);
  const [disparando, setDisparando] = useState(false);

  // Estado para animación de bala
  const [bala, setBala] = useState<Bala | null>(null);
  const [explosion, setExplosion] = useState<{ x: number; y: number; color: string } | null>(null);
  const [humo, setHumo] = useState(false);

  const config = NIVELES_CONFIG[nivelActual - 1];
  const objetivo = config ? COLORES.find(c => c.id === config.colorObjetivo) : null;

  // Referencias para posiciones
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const tankRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  // ============================================
  // LÓGICA DE DISPARO CON ANIMACIÓN
  // ============================================

  const disparar = useCallback((colorId: string) => {
    if (!config || disparando) return;

    playClic();
    setDisparando(true);
    setHumo(true);

    // Obtener posiciones del tanque y objetivo
    const gameArea = gameAreaRef.current;
    const tank = tankRef.current;
    const target = targetRefs.current[colorId];

    if (gameArea && tank && target) {
      const gameRect = gameArea.getBoundingClientRect();
      const tankRect = tank.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Posición inicial (cañón del tanque)
      const startX = tankRect.left + tankRect.width / 2 - gameRect.left;
      const startY = tankRect.top - gameRect.top;

      // Posición final (centro del objetivo)
      const endX = targetRect.left + targetRect.width / 2 - gameRect.left;
      const endY = targetRect.top + targetRect.height / 2 - gameRect.top;

      // Crear bala animada
      const nuevaBala: Bala = {
        id: Date.now(),
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        color: COLORES.find(c => c.id === colorId)?.hex || '#FFFFFF',
      };

      setBala(nuevaBala);

      // Animar bala (simular vuelo)
      setTimeout(() => {
        setBala(null);
        setExplosion({ x: endX, y: endY, color: nuevaBala.color });

        // Verificar si es correcto
        if (colorId === config.colorObjetivo) {
          setImpacto(colorId);
          playExito();

          setTimeout(() => {
            setExplosion(null);
            setImpacto(null);
            setHumo(false);
            setDisparando(false);
            hablar('¡Directo al blanco! ¡Muy bien!', { velocidad: 0.85 });

            setTimeout(() => {
              playNivelCompleto();
              agregarMonedas(15);
              agregarPuntos(30);
              agregarEstrellas(1);
              registrarAcierto(nivelActual);
              setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
              setMostrarCelebracion(true);
              hablar(`¡Nivel ${nivelActual} completado! ¡Eres un tirador experto en ${objetivo?.nombre}!`, { velocidad: 0.85 });
            }, 800);
          }, 800);
        } else {
          setImpacto(colorId);
          playError();
          registrarError(nivelActual);
          const nuevasVidas = vidas - 1;
          setVidas(nuevasVidas);

          const colorErroneo = COLORES.find(c => c.id === colorId);
          setTimeout(() => {
            setExplosion(null);
            setImpacto(null);
            setHumo(false);
            setDisparando(false);
            hablar(`¡No! Eso es ${colorErroneo?.nombre}. El objetivo es ${objetivo?.nombre}.`, { velocidad: 0.85 });

            if (nuevasVidas <= 0) {
              setTimeout(() => {
                setMostrarPerder(true);
                hablar('¡Se acabaron las vidas! ¡Intenta otra vez!', { velocidad: 0.85 });
              }, 800);
            }
          }, 800);
        }
      }, 600); // Tiempo de vuelo de la bala
    } else {
      // Fallback si no hay referencias
      setTimeout(() => {
        if (colorId === config.colorObjetivo) {
          setImpacto(colorId);
          playExito();
          setTimeout(() => {
            setImpacto(null);
            setDisparando(false);
            playNivelCompleto();
            agregarMonedas(15);
            agregarPuntos(30);
            agregarEstrellas(1);
            registrarAcierto(nivelActual);
            setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
            setMostrarCelebracion(true);
          }, 800);
        } else {
          setImpacto(colorId);
          playError();
          registrarError(nivelActual);
          const nuevasVidas = vidas - 1;
          setVidas(nuevasVidas);
          setTimeout(() => {
            setImpacto(null);
            setDisparando(false);
            if (nuevasVidas <= 0) setMostrarPerder(true);
          }, 800);
        }
      }, 400);
    }
  }, [config, disparando, vidas, nivelActual, objetivo, agregarMonedas, agregarPuntos, agregarEstrellas]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const cfg = NIVELES_CONFIG[numero - 1];
    if (!cfg) return;
    playClic();

    const opcionesMezcladas = mezclar(cfg.opciones);
    const opcionesInfo = opcionesMezcladas.map(id => COLORES.find(c => c.id === id)!).filter(Boolean);

    const objetivoInfo = COLORES.find(c => c.id === cfg.colorObjetivo)!;
    if (!opcionesInfo.find(o => o.id === objetivoInfo.id)) {
      opcionesInfo[0] = objetivoInfo;
    }

    setOpciones(opcionesInfo);
    setVidas(cfg.vidas);
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);
    setMostrarPerder(false);
    setDisparando(false);
    setImpacto(null);
    setBala(null);
    setExplosion(null);
    setHumo(false);
    targetRefs.current = {};

    hablar(`Nivel ${numero}. ¡Dispara al color ${objetivoInfo.nombre}! Toca el objetivo ${objetivoInfo.nombre}.`, { velocidad: 0.82 });
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
                <span className="text-2xl">🎯</span> Apunta y gana
              </h1>
              {pantalla === 'nivel' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-amber-500/20 text-amber-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-amber-500/30">
                    Nivel {nivelActual}
                  </span>
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
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-8xl">🎯</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Apunta y gana!</h2>
              <p className="text-slate-300 text-lg mb-2">
                El tanque dispara al <span className="text-amber-400 font-bold">color correcto</span>
              </p>
              <p className="text-slate-400 text-sm mb-8">
                {NIVELES_CONFIG.length} niveles · ¡Conviértete en un tirador experto! 💪
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
                {nivelesMapa.map((nivel, idx) => (
                  <motion.button
                    key={nivel.numero}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03, type: 'spring', bounce: 0.4 }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                      nivel.estado === 'completado'
                        ? 'bg-game-surface border-2 border-transparent hover:border-amber-400/50'
                        : nivel.estado === 'actual'
                        ? 'bg-game-surface border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                    }`}
                    onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                    whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                    whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                    disabled={nivel.estado === 'bloqueado'}
                  >
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg ${
                      nivel.estado === 'completado'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : nivel.estado === 'actual'
                        ? 'bg-gradient-to-br from-amber-500 to-red-500'
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
          {pantalla === 'nivel' && config && objetivo && (
            <motion.div
              key={`nivel-${nivelActual}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              {/* Barra superior: vidas + nivel */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">
                  {'❤️'.repeat(Math.max(vidas, 0))}{'🖤'.repeat(Math.max(config.vidas - vidas, 0))}
                </span>
                <span className="bg-amber-500/20 text-amber-300 rounded-full px-3 py-1 text-sm font-bold border border-amber-500/30">
                  Nivel {nivelActual} / {NIVELES_CONFIG.length}
                </span>
              </div>

              {/* Instrucción */}
              <div className="text-center mb-4">
                <p className="text-white text-xl font-bold">🎯 ¡Dispara al color!</p>
                <motion.div
                  className="inline-flex items-center gap-3 mt-2 bg-white/10 rounded-2xl px-6 py-3 border-2 border-white/20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <span className="text-5xl">{objetivo.emoji}</span>
                  <p className="text-white text-3xl font-black game-title" style={{ textShadow: `0 0 20px ${objetivo.hex}` }}>
                    {objetivo.nombre}
                  </p>
                </motion.div>
              </div>

              {/* ===== ZONA DE JUEGO ===== */}
              <div
                ref={gameAreaRef}
                className="relative bg-gradient-to-b from-sky-900/50 to-slate-900/80 rounded-3xl border-4 border-white/10 overflow-hidden"
                style={{ minHeight: '450px' }}
              >
                {/* Cielo estrellado */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-30"
                      style={{
                        left: `${(i * 7) % 100}%`,
                        top: `${(i * 13) % 60}%`,
                        animation: `pulse ${2 + (i % 3)}s infinite`,
                      }}
                    />
                  ))}
                </div>

                {/* Objetivos de color (arriba) */}
                <div className="relative z-10 flex flex-wrap justify-center gap-4 sm:gap-6 pt-8 pb-4">
                  {opciones.map((color) => {
                    const esImpacto = impacto === color.id;
                    const esCorrecto = esImpacto && color.id === config.colorObjetivo;

                    return (
                      <div
                        key={color.id}
                        ref={(el) => { targetRefs.current[color.id] = el; }}
                        className="relative"
                      >
                        {/* Plataforma del objetivo */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-700 rounded-full opacity-50" />

                        <motion.button
                          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-5xl sm:text-6xl transition-all
                            ${esCorrecto
                              ? 'bg-green-500/40 border-4 border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.7)]'
                              : esImpacto
                              ? 'bg-red-500/40 border-4 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                              : 'border-4 border-white/30 hover:border-white/60 hover:scale-110 bg-white/10'
                            }`}
                          style={{
                            boxShadow: !esImpacto ? `0 0 25px ${color.hex}60` : undefined,
                          }}
                          onClick={() => disparar(color.id)}
                          disabled={disparando}
                          whileHover={!disparando ? { scale: 1.15 } : {}}
                          whileTap={!disparando ? { scale: 0.9 } : {}}
                          animate={esImpacto ? { x: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {color.emoji}
                          {/* Brillo del color */}
                          <div
                            className="absolute inset-0 rounded-full opacity-40"
                            style={{ background: `radial-gradient(circle, ${color.hex}, transparent 70%)` }}
                          />
                          {/* Anillo de energía */}
                          <div
                            className="absolute inset-0 rounded-full border-2 opacity-30"
                            style={{ borderColor: color.hex, animation: 'pulse 2s infinite' }}
                          />
                        </motion.button>
                      </div>
                    );
                  })}
                </div>

                {/* Obstáculos flotantes */}
                {config.conObstaculos && (
                  <div className="relative z-10 flex justify-center gap-8 py-2">
                    {Array.from({ length: Math.min(nivelActual - 5, 4) }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="text-3xl"
                        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
                      >
                        🪵
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Humo del cañón */}
                <AnimatePresence>
                  {humo && (
                    <motion.div
                      className="absolute left-1/2 bottom-32 z-20 pointer-events-none"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0.8, 0], scale: [0.5, 2], y: [0, -40] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <span className="text-4xl">💨</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bala animada */}
                <AnimatePresence>
                  {bala && (
                    <motion.div
                      className="absolute z-30 pointer-events-none"
                      initial={{
                        x: bala.x,
                        y: bala.y,
                        scale: 0.5,
                        opacity: 1,
                      }}
                      animate={{
                        x: bala.targetX,
                        y: bala.targetY,
                        scale: 1,
                        opacity: 1,
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.6, ease: 'easeIn' }}
                    >
                      {/* Rastro de la bala */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 rounded-full"
                        style={{
                          background: `linear-gradient(to left, ${bala.color}, transparent)`,
                          transformOrigin: 'right center',
                          transform: `rotate(${Math.atan2(bala.targetY - bala.y, bala.targetX - bala.x) * (180 / Math.PI)}deg)`,
                        }}
                      />
                      {/* Bala */}
                      <div className="relative -translate-x-1/2 -translate-y-1/2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white/50"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, #FFF, ${bala.color})`,
                            boxShadow: `0 0 20px ${bala.color}, 0 0 40px ${bala.color}80`,
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Explosión */}
                <AnimatePresence>
                  {explosion && (
                    <motion.div
                      className="absolute z-40 pointer-events-none"
                      style={{ left: explosion.x, top: explosion.y }}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: [0, 1.5, 2], opacity: [1, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="relative -translate-x-1/2 -translate-y-1/2">
                        {/* Onda expansiva */}
                        <div
                          className="absolute inset-0 rounded-full border-4"
                          style={{ borderColor: explosion.color, width: '100px', height: '100px', marginLeft: '-50px', marginTop: '-50px' }}
                        />
                        <span className="text-6xl">💥</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* TANQUE (abajo) */}
                <div
                  ref={tankRef}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                >
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {/* Cañón */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-10 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-full" />

                    {/* Cuerpo del tanque */}
                    <div className="relative w-24 h-16 sm:w-32 sm:h-20">
                      {/* Oruga inferior */}
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full flex items-center justify-center gap-1 px-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full bg-slate-600 border border-slate-500" />
                        ))}
                      </div>
                      {/* Cuerpo principal */}
                      <div className="absolute bottom-4 left-2 right-2 h-10 bg-gradient-to-b from-slate-500 to-slate-600 rounded-lg border-2 border-slate-400">
                        {/* Detalles */}
                        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-500/50" />
                      </div>
                    </div>

                    {/* Estrella del tanque */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xl">⭐</div>
                  </motion.div>
                </div>

                {/* Suelo */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-800 to-transparent" />
              </div>

              {/* Barra de puntuación */}
              <div className="mt-4 text-center">
                <p className="text-slate-400 text-sm">
                  {impacto && (
                    <span className={esCorrectoImpacto(impacto, config.colorObjetivo) ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {esCorrectoImpacto(impacto, config.colorObjetivo) ? '🎯 ¡Directo!' : '❌ Fallaste'}
                    </span>
                  )}
                </p>
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

// Helper para verificar impacto correcto
function esCorrectoImpacto(impactoId: string, objetivoId: string): boolean {
  return impactoId === objetivoId;
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
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i / 30) * 100}%`,
              top: '-5%',
              fontSize: `${20 + (i % 4) * 10}px`,
            }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: i * 72 }}
            transition={{ duration: 1.5 + (i % 3) * 0.5, delay: (i % 5) * 0.1, ease: 'easeIn' }}
          >
            {['🎉', '⭐', '🏆', '🎯', '💫'][i % 5]}
          </motion.div>
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
          🎯
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-amber-300"
          style={{ textShadow: '0 0 30px rgba(245,158,11,0.5)' }}
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
