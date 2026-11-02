// ============================================
// JUEGO: CARRERA (20 niveles)
// Reconoce la dirección y avanza en la carrera
// Enseña direcciones (↑↓←→) y velocidad de reacción
// Botones grandes sin teclado
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
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
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('carrera-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('carrera-progreso', JSON.stringify(c)); } catch { /* */ }
}

// ============================================
// CONFIGURACIÓN
// ============================================

type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

const DIRECCIONES: Record<Direccion, { emoji: string; nombre: string }> = {
  arriba: { emoji: '⬆️', nombre: 'arriba' },
  abajo: { emoji: '⬇️', nombre: 'abajo' },
  izquierda: { emoji: '⬅️', nombre: 'izquierda' },
  derecha: { emoji: '➡️', nombre: 'derecha' },
};

const TOTAL_NIVELES = 20;
const META_POS = 85; // % de la carrera

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'nivel';

export default function CarreraGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'carrera' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [mostrarPerder, setMostrarPerder] = useState(false);

  // Estado de carrera
  const [posJugador, setPosJugador] = useState(5);
  const [posEnemigos, setPosEnemigos] = useState<number[]>([5, 5, 5]);
  const [direccionActual, setDireccionActual] = useState<Direccion>('derecha');
  const [vidas, setVidas] = useState(5);
  const [carreraActiva, setCarreraActiva] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  const [mostrarGanaron, setMostrarGanaron] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => { detenerVoz(); if (intervalRef.current) clearInterval(intervalRef.current); if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  // Guardar progreso
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  // Dificultad basada en nivel
  const velocidadBase = 0.08 + (Math.min(nivelActual, 20) * 0.006);
  const factorPersecucion = 0.003 + (Math.min(nivelActual, 20) * 0.0003);

  // Dirección aleatoria
  const nuevaDireccion = useCallback((): Direccion => {
    const dirs: Direccion[] = ['arriba', 'abajo', 'izquierda', 'derecha'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }, []);

  // Iniciar/detener loop de carrera
  useEffect(() => {
    if (carreraActiva && pantalla === 'nivel') {
      intervalRef.current = setInterval(() => {
        setPosEnemigos(prev => {
          const nuevos = prev.map(pos => {
            const catchUp = (posJugador - pos) * factorPersecucion;
            const avance = velocidadBase + Math.random() * 0.04 + (catchUp > 0 ? catchUp : 0);
            return Math.min(pos + avance, 100);
          });

          // Verificar si algún enemigo llegó a la meta
          if (nuevos.some(p => p >= META_POS)) {
            setTimeout(() => manejarGanaron(), 100);
          }

          return nuevos;
        });
      }, 60);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [carreraActiva, pantalla, posJugador, velocidadBase, factorPersecucion]);

  // Verificar victoria del jugador
  useEffect(() => {
    if (posJugador >= META_POS && carreraActiva) {
      setCarreraActiva(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      playExito();
      playNivelCompleto();
      agregarMonedas(15);
      agregarPuntos(30);
      agregarEstrellas(1);
      registrarAcierto(nivelActual);
      setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
      timeoutRef.current = setTimeout(() => {
        setMostrarCelebracion(true);
        hablar(`¡Nivel ${nivelActual} completado! ¡Ganaste la carrera!`, { velocidad: 0.85 });
      }, 600);
    }
  }, [posJugador, carreraActiva, nivelActual, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto]);

  // Manejar cuando los enemigos ganan
  const manejarGanaron = useCallback(() => {
    if (!carreraActiva) return;
    setCarreraActiva(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const nuevasVidas = vidas - 1;
    setVidas(nuevasVidas);
    setMostrarGanaron(true);
    playError();
    registrarError(nivelActual);

    if (nuevasVidas <= 0) {
      timeoutRef.current = setTimeout(() => {
        setMostrarPerder(true);
        hablar('¡Se acabaron las vidas! ¡Intenta de nuevo!', { velocidad: 0.85 });
      }, 1500);
    } else {
      timeoutRef.current = setTimeout(() => {
        setMostrarGanaron(false);
        setPosJugador(5);
        setPosEnemigos([5, 5, 5]);
        setDireccionActual(nuevaDireccion());
        setCarreraActiva(true);
        hablar('¡Te ganaron! Pero tienes más vidas. ¡Sigue intentando!', { velocidad: 0.85 });
      }, 1500);
    }
  }, [carreraActiva, vidas, nuevaDireccion, nivelActual, registrarError]);

  // Manejar clic en dirección
  const manejarClicDireccion = useCallback((dir: Direccion) => {
    if (!carreraActiva || mostrarGanaron || mostrarPerder) return;

    if (dir === direccionActual) {
      // ¡Correcto!
      playExito();
      setPosJugador(prev => Math.min(prev + 7, 100));
      setDireccionActual(nuevaDireccion());
    } else {
      // Incorrecto
      playError();
      registrarError(nivelActual);
      setMostrarError(true);
      setTimeout(() => setMostrarError(false), 400);
    }
  }, [carreraActiva, mostrarGanaron, mostrarPerder, direccionActual, nuevaDireccion, nivelActual, registrarError]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    playClic();
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);
    setMostrarPerder(false);
    setMostrarGanaron(false);
    setPosJugador(5);
    setPosEnemigos([5, 5, 5]);
    setVidas(5);
    setDireccionActual(nuevaDireccion());
    setCarreraActiva(true);

    hablar(`Nivel ${numero}. Carrera. Toca la dirección que aparece. ¡Corre rápido!`, { velocidad: 0.82 });
  }, [nuevaDireccion]);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= TOTAL_NIVELES) iniciarNivel(sig);
    else { setMostrarCelebracion(false); setPantalla('mapa'); }
  }, [nivelActual, iniciarNivel]);

  const reintentarNivel = useCallback(() => {
    iniciarNivel(nivelActual);
  }, [nivelActual, iniciarNivel]);

  const volverAlMapa = useCallback(() => {
    detenerVoz();
    setCarreraActiva(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMostrarCelebracion(false);
    setMostrarPerder(false);
    setPantalla('mapa');
  }, []);

  const salir = useCallback(() => {
    detenerVoz();
    setCarreraActiva(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate('/nino/menu');
  }, [navigate]);

  // Mapa de niveles
  const nivelesMapa = Array.from({ length: TOTAL_NIVELES }, (_, i) => {
    const numero = i + 1;
    let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
    if (completados.includes(numero)) estado = 'completado';
    else if (numero === completados.length + 1 || (completados.length === 0 && numero === 1)) estado = 'actual';
    return { numero, estado };
  });

  const siguienteDisponible = completados.length < TOTAL_NIVELES ? completados.length + 1 : null;

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
                <span className="text-2xl">🏇</span> Carrera
              </h1>
              {pantalla === 'nivel' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-red-500/20 text-red-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-red-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">Velocidad {'🐰'.repeat(Math.min(Math.ceil(nivelActual / 5), 4))}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{TOTAL_NIVELES}
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
              <motion.div className="inline-block mb-6" animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <span className="text-8xl">🏇</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Carrera!</h2>
              <p className="text-slate-300 text-lg mb-2">Toca la <span className="text-red-400 font-bold">dirección correcta</span> para correr</p>
              <p className="text-slate-400 text-sm mb-8">{TOTAL_NIVELES} niveles · Aprende direcciones y velocidad ⚡</p>
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
              <div className="grid grid-cols-5 gap-3 sm:gap-4 max-w-2xl w-full">
                {nivelesMapa.map((nivel, idx) => (
                  <motion.button key={nivel.numero}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03, type: 'spring', bounce: 0.4 }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                      nivel.estado === 'completado' ? 'bg-game-surface border-2 border-transparent hover:border-red-400/50'
                      : nivel.estado === 'actual' ? 'bg-game-surface border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                      : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                    }`}
                    onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                    whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                    whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                    disabled={nivel.estado === 'bloqueado'}
                  >
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg ${
                      nivel.estado === 'completado' ? 'bg-gradient-to-br from-red-400 to-rose-500'
                      : nivel.estado === 'actual' ? 'bg-gradient-to-br from-red-500 to-pink-500'
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
          {pantalla === 'nivel' && (
            <motion.div key={`nivel-${nivelActual}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }} className="w-full max-w-4xl">
              {/* Vidas */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">
                  {'❤️'.repeat(Math.max(vidas, 0))}{'🖤'.repeat(Math.max(5 - vidas, 0))}
                </span>
                <span className="bg-red-500/20 text-red-300 rounded-full px-3 py-1 text-sm font-bold border border-red-500/30">
                  Nivel {nivelActual} / {TOTAL_NIVELES}
                </span>
              </div>

              {/* Dirección a seguir */}
              <motion.div
                className={`mx-auto mb-4 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl
                  ${mostrarError
                    ? 'bg-red-500/30 border-4 border-red-400'
                    : 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-4 border-blue-400/60 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  }`}
                animate={mostrarError ? { x: [0, -10, 10, -6, 6, 0] } : { scale: [1, 1.05, 1] }}
                transition={mostrarError ? { duration: 0.4 } : { repeat: Infinity, duration: 1.5 }}
              >
                {DIRECCIONES[direccionActual].emoji}
              </motion.div>

              {/* Contenedor: Pista + Botones al costado */}
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Pista de carrera */}
                <div className="relative flex-1 bg-slate-800/60 rounded-2xl border border-white/10 p-3 sm:p-4 overflow-hidden">
                  {/* Línea de meta */}
                  <div className="absolute right-3 sm:right-4 top-0 bottom-0 w-4 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] opacity-80" />

                  {/* Carril jugador */}
                  <div className="relative h-10 sm:h-12 mb-2">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg" />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 text-2xl sm:text-3xl"
                      style={{ left: `${posJugador}%` }}
                      animate={{ x: ['-50%', '-50%'] }}
                    >
                      🏃‍♂️
                    </motion.div>
                  </div>

                  {/* Carriles enemigos */}
                  {posEnemigos.map((pos, i) => (
                    <div key={i} className="relative h-8 sm:h-10 mb-1 last:mb-0">
                      <div className="absolute inset-0 bg-red-500/5 rounded-lg" />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 text-xl sm:text-2xl"
                        style={{ left: `${pos}%` }}
                      >
                        🏃‍♀️
                      </motion.div>
                    </div>
                  ))}
                </div>

                {/* Botones de dirección (al costado) */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <DireccionBoton dir="arriba" onClick={() => manejarClicDireccion('arriba')} activo={direccionActual === 'arriba'} error={mostrarError} />
                  <div className="flex gap-2">
                    <DireccionBoton dir="izquierda" onClick={() => manejarClicDireccion('izquierda')} activo={direccionActual === 'izquierda'} error={mostrarError} />
                    <div className="w-12 h-12 sm:w-14 sm:h-14" />
                    <DireccionBoton dir="derecha" onClick={() => manejarClicDireccion('derecha')} activo={direccionActual === 'derecha'} error={mostrarError} />
                  </div>
                  <DireccionBoton dir="abajo" onClick={() => manejarClicDireccion('abajo')} activo={direccionActual === 'abajo'} error={mostrarError} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== CELEBRACIÓN ===== */}
      <AnimatePresence>
        {mostrarCelebracion && (
          <OverlayCelebracion nivel={nivelActual} total={TOTAL_NIVELES} onSiguiente={irSiguienteNivel} onMapa={volverAlMapa} />
        )}
      </AnimatePresence>

      {/* ===== PERDER ===== */}
      <AnimatePresence>
        {mostrarPerder && (
          <OverlayPerder onReintentar={reintentarNivel} onMapa={volverAlMapa} />
        )}
      </AnimatePresence>

      {/* ===== TE GANARON (temporal) ===== */}
      <AnimatePresence>
        {mostrarGanaron && !mostrarPerder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
              <span className="text-7xl">😤</span>
              <p className="text-orange-400 text-2xl font-bold mt-2">¡TE GANARON!</p>
              <p className="text-slate-400 text-sm mt-1">Preparando...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// BOTÓN DE DIRECCIÓN
// ============================================

interface DireccionBotonProps {
  dir: Direccion;
  onClick: () => void;
  activo: boolean;
  error: boolean;
}

function DireccionBoton({ dir, onClick, activo, error }: DireccionBotonProps) {
  return (
    <motion.button
      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all
        ${error
          ? 'bg-red-500/30 border-4 border-red-400'
          : activo
            ? 'bg-gradient-to-br from-blue-500/40 to-purple-500/40 border-4 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            : 'bg-white/10 border-4 border-white/20 hover:bg-white/20 hover:border-white/40'
        }`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
    >
      {DIRECCIONES[dir].emoji}
    </motion.button>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} className="absolute rounded-sm"
            style={{
              left: `${(i / 20) * 100}%`, top: '-5%',
              width: 6 + (i % 4) * 3, height: 8 + (i % 3) * 4,
              backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'][i % 5],
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
          🏆
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-red-300"
          style={{ textShadow: '0 0 30px rgba(239,68,68,0.5)' }}>
          ¡Ganaste!
        </motion.h2>
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring', bounce: 0.6 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-full px-6 py-2.5 mb-8 shadow-lg shadow-orange-500/30">
          <span>+15</span>
          <span className="coin-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          {nivel < total ? (
            <button onClick={onSiguiente} className="btn-inicial text-lg px-10 py-3 animate-glow">Siguiente Nivel</button>
          ) : (
            <button onClick={onMapa} className="btn-inicial text-lg px-10 py-3 animate-glow">🏆 ¡Juego Completado!</button>
          )}
        </motion.div>
        {nivel < total && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            onClick={onMapa}
            className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors">
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="relative text-center px-6 py-10 max-w-sm w-full">
        <motion.div className="text-8xl mb-4 inline-block"
          initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}>
          😢
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-red-300">
          ¡Se acabaron las vidas!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-400 mb-8">
          ¡No te preocupes, intenta otra vez!
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <button onClick={onReintentar} className="btn-inicial text-lg px-10 py-3 animate-glow">
            🔄 ¡Otra Vez!
          </button>
        </motion.div>
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          onClick={onMapa}
          className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors">
          Ver mapa de niveles
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
