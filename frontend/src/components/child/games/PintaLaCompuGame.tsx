// ============================================
// JUEGO: PINTA LA COMPÚ (30 niveles)
// Basado en sistema CompuMundos de referencia
// Colorea partes con paleta + pista al hover
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import DibujoInteractivo from './pinta-la-compu/DibujoInteractivo';
import { NIVELES_PINTA, PALETA_PINTA } from './pinta-la-compu/nivelesData';
import {
  hablar,
  detenerVoz,
  setVozActiva,
  playNivelCompleto,
  playClic,
  playExito,
} from '../../../services/audio/speech';
import { useChildStore } from '../../../stores/childStore';
import { useGameProgress } from '../../../hooks/useGameProgress';

// ============================================
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('pinta-compu-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('pinta-compu-progreso', JSON.stringify(c)); } catch { /* */ }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'nivel';

export default function PintaLaCompuGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'pinta-la-compu' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  const config = NIVELES_PINTA[nivelActual - 1];
  const [coloresPartes, setColoresPartes] = useState<(string | null)[]>([]);
  const [colorSeleccionado, setColorSeleccionado] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const completandoRef = useRef(false);

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  // Contar partes pintables del nivel actual
  const totalPartes = useMemo(() => {
    if (!config) return 0;
    return (config.svg.match(/class="ps"/g) || []).length;
  }, [config]);

  const partesPintadas = coloresPartes.filter(Boolean).length;

  // Mapa de niveles
  const nivelesMapa = useMemo(() => {
    return NIVELES_PINTA.map(cfg => {
      let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
      if (completados.includes(cfg.numero)) estado = 'completado';
      else {
        const sig = NIVELES_PINTA.find(c => !completados.includes(c.numero));
        if (sig && sig.numero === cfg.numero) estado = 'actual';
      }
      return { numero: cfg.numero, estado };
    });
  }, [completados]);

  const siguienteDisponible = useMemo(() => {
    const sig = NIVELES_PINTA.find(c => !completados.includes(c.numero));
    return sig ? sig.numero : null;
  }, [completados]);

  // ============================================
  // LÓGICA DE PINTADO
  // ============================================

  const manejarClicParte = useCallback((idx: number) => {
    if (!config) return;
    if (coloresPartes[idx]) return; // ya pintada

    // Obtener índice de color objetivo del SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<svg>${config.svg}</svg>`, 'image/svg+xml');
    const partes = doc.querySelectorAll('.ps');
    const parteEl = partes[idx];
    if (!parteEl) return;
    const colorObjetivoIdx = Number(parteEl.getAttribute('data-c'));

    if (colorSeleccionado === null) {
      hablar('Primero elige un color de la paleta', { velocidad: 0.85 });
      return;
    }

    if (colorSeleccionado === colorObjetivoIdx) {
      // Color correcto
      playClic();
      setColoresPartes(prev => {
        const nuevo = [...prev];
        nuevo[idx] = PALETA_PINTA[colorObjetivoIdx].hex;
        return nuevo;
      });
      playExito();
      setColorSeleccionado(null);
      setHoverIdx(null);
    } else {
      // Color incorrecto
      hablar('Ese color no es el correcto. ¡Intenta de nuevo!', { velocidad: 0.85 });
      registrarError(nivelActual);
    }
  }, [config, coloresPartes, colorSeleccionado, registrarError, nivelActual]);

  // Hover: mostrar pista del color correcto
  const manejarHoverParte = useCallback((idx: number | null) => {
    setHoverIdx(idx);
    if (idx !== null && config) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<svg>${config.svg}</svg>`, 'image/svg+xml');
      const partes = doc.querySelectorAll('.ps');
      const parteEl = partes[idx];
      if (parteEl) {
        const colorIdx = Number(parteEl.getAttribute('data-c'));
        hablar(`Pista: usa el color ${PALETA_PINTA[colorIdx].nombre}`, { velocidad: 0.9 });
      }
    }
  }, [config]);

  // Verificar completado
  useEffect(() => {
    if (!config || pantalla !== 'nivel' || mostrarCelebracion) return;
    if (completandoRef.current) return;
    if (totalPartes > 0 && partesPintadas >= totalPartes) {
      completandoRef.current = true;
      playNivelCompleto();
      agregarMonedas(15);
      agregarPuntos(30);
      agregarEstrellas(1);
      registrarAcierto(nivelActual);
      setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
      setTimeout(() => {
        setMostrarCelebracion(true);
        hablar(`¡Nivel ${nivelActual} completado! Qué hermoso quedó.`, { velocidad: 0.85 });
      }, 800);
    }
  }, [coloresPartes, config, pantalla, mostrarCelebracion, nivelActual, totalPartes, partesPintadas, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const cfg = NIVELES_PINTA[numero - 1];
    if (!cfg) return;
    playClic();
    // Reset síncrono
    const n = (cfg.svg.match(/class="ps"/g) || []).length;
    setColoresPartes(Array(n).fill(null));
    setColorSeleccionado(null);
    setHoverIdx(null);
    completandoRef.current = false;
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);
    hablar(`Nivel ${numero}: ${cfg.nombre}. Elige un color y pinta cada parte.`, { velocidad: 0.82 });
  }, []);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= NIVELES_PINTA.length) iniciarNivel(sig);
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
                <span className="text-2xl">🎨</span> Pinta la Compu
              </h1>
              {pantalla === 'nivel' && config && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-pink-500/20 text-pink-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-pink-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">{config.nombre}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{NIVELES_PINTA.length}
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
                <span className="text-8xl">🎨</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Vamos a pintar!</h2>
              <p className="text-slate-300 text-lg mb-2">Colorea las computadoras con el <span className="text-pink-400 font-bold">mouse</span></p>
              <p className="text-slate-400 text-sm mb-8">{NIVELES_PINTA.length} niveles · Aprende colores y precisión 🎨</p>
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
                  {completados.length}/{NIVELES_PINTA.length} completados
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4 max-w-3xl w-full">
                {nivelesMapa.map((nivel, idx) => (
                  <motion.button key={nivel.numero}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02, type: 'spring', bounce: 0.4 }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                      nivel.estado === 'completado' ? 'bg-game-surface border-2 border-transparent hover:border-green-400/50'
                      : nivel.estado === 'actual' ? 'bg-game-surface border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                      : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                    }`}
                    onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                    whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                    whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                    disabled={nivel.estado === 'bloqueado'}
                  >
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg ${
                      nivel.estado === 'completado' ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : nivel.estado === 'actual' ? 'bg-gradient-to-br from-pink-500 to-rose-500'
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
              transition={{ duration: 0.3 }} className="w-full max-w-4xl">
              {/* Barra superior */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-pink-500/20 text-pink-300 rounded-full px-3 py-1 text-sm font-bold border border-pink-500/30">
                    Nivel {nivelActual} / {NIVELES_PINTA.length}
                  </span>
                  <span className="text-white/60 text-sm hidden sm:inline">{config.nombre}</span>
                </div>
                <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-300 text-sm">
                  {partesPintadas} / {totalPartes}
                </span>
              </div>

              {/* Instrucción / pista */}
              <p className="text-white text-center text-base sm:text-lg font-semibold mb-3 game-title">
                {hoverIdx !== null && colorSeleccionado !== null
                  ? `🎨 Toca la parte para pintarla`
                  : '👆 Elige un color y pinta la pieza correcta'}
              </p>

              {/* Dibujo + META */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* Dibujo principal */}
                <div className="flex-1 bg-white rounded-2xl border border-white/10 p-4 flex items-center justify-center">
                  <div className="w-full max-w-md mx-auto" style={{ aspectRatio: '4/3' }}>
                    <DibujoInteractivo
                      svg={config.svg}
                      coloresPartes={coloresPartes}
                      onClicParte={manejarClicParte}
                      onHoverParte={manejarHoverParte}
                    />
                  </div>
                </div>

                {/* Referencia META */}
                <div className="sm:w-52 lg:w-56 flex-shrink-0">
                  <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-blue-400 p-3 h-full flex flex-col shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="text-blue-500 font-extrabold text-sm tracking-wide uppercase">META</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-white rounded-xl p-2">
                      <div className="w-full pointer-events-none select-none">
                        <DibujoInteractivo
                          svg={config.svg}
                          esReferencia={true}
                          coloresPartes={[]}
                          onClicParte={() => {}}
                        />
                      </div>
                    </div>
                    <p className="text-center text-blue-400 text-xs mt-2 leading-tight font-semibold">
                      Así debe quedar
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4 w-full max-w-md mx-auto">
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: partesPintadas >= totalPartes ? 'linear-gradient(90deg, #fd79a8, #e84393)' : 'linear-gradient(90deg, #00b894, #00cec9)' }}
                    animate={{ width: `${totalPartes > 0 ? (partesPintadas / totalPartes) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Paleta de colores */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 bg-white/5 rounded-xl py-3 px-4 border border-white/10 flex-wrap">
                <span className="text-white/60 text-sm mr-1 hidden sm:inline">Paleta:</span>
                {PALETA_PINTA.map((color, idx) => {
                  const esResaltado = hoverIdx !== null && (() => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(`<svg>${config.svg}</svg>`, 'image/svg+xml');
                    const partes = doc.querySelectorAll('.ps');
                    const parteEl = partes[hoverIdx];
                    return parteEl && Number(parteEl.getAttribute('data-c')) === idx;
                  })();
                  return (
                    <motion.button key={color.hex}
                      className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-full border-4 transition-all ${
                        colorSeleccionado === idx ? 'border-white scale-110 shadow-lg'
                        : esResaltado ? 'border-yellow-300 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                        : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => { setColorSeleccionado(idx); playClic(); }}
                      whileTap={{ scale: 0.9 }}
                      title={color.nombre}
                    >
                      {esResaltado && colorSeleccionado !== idx && (
                        <motion.span
                          className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-300 text-xs font-bold whitespace-nowrap"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          ¡Usa este!
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            {/* Confeti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i} className="absolute rounded-sm"
                  style={{
                    left: `${(i / 20) * 100}%`, top: '-5%',
                    width: 6 + (i % 4) * 3, height: 8 + (i % 3) * 4,
                    backgroundColor: ['#ec4899', '#3b82f6', '#22c55e', '#eab308', '#a855f7'][i % 5],
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
                🎨
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="game-title text-3xl sm:text-4xl mb-4 text-pink-300"
                style={{ textShadow: '0 0 30px rgba(236,72,153,0.5)' }}>
                ¡Nivel Completado!
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-400 mb-5">
                {config?.nombre}
              </motion.p>
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring', bounce: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-full px-6 py-2.5 mb-8 shadow-lg shadow-orange-500/30">
                <span>+15</span>
                <span className="coin-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                {nivelActual < NIVELES_PINTA.length ? (
                  <button onClick={irSiguienteNivel} className="btn-inicial text-lg px-10 py-3 animate-glow">Siguiente Nivel</button>
                ) : (
                  <button onClick={volverAlMapa} className="btn-inicial text-lg px-10 py-3 animate-glow">🏆 ¡Juego Completado!</button>
                )}
              </motion.div>
              {nivelActual < NIVELES_PINTA.length && (
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
