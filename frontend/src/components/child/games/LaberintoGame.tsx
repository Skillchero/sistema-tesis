// ============================================
// JUEGO: LABERINTO (30 niveles)
// Ratón 🐭 busca el queso 🧀 en un laberinto
// Enseña orientación espacial y planificación
// Sin teclado: D-pad táctil + clic en celdas
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import {
  NIVELES_LABERINTO,
  parseMapa,
  encontrarInicio,
  encontrarGatos,
} from './laberinto/mazeData';
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
    const d = localStorage.getItem('laberinto-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('laberinto-progreso', JSON.stringify(c)); } catch { /* */ }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'nivel';

interface Posicion { r: number; c: number }

export default function LaberintoGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto, registrarError } = useGameProgress({ juegoId: 'laberinto' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [mostrarPerder, setMostrarPerder] = useState(false);

  const config = NIVELES_LABERINTO[nivelActual - 1];
  const [mapa, setMapa] = useState<number[][]>([]);
  const [posJugador, setPosJugador] = useState<Posicion>({ r: 0, c: 0 });
  const [gatos, setGatos] = useState<Posicion[]>([]);
  const [animando, setAnimando] = useState(false);
  const completandoRef = useRef(false);

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);

  // Dimensiones del laberinto
  const filas = mapa.length;
  const columnas = mapa[0]?.length || 0;

  // Mapa de niveles
  const nivelesMapa = useMemo(() => {
    return NIVELES_LABERINTO.map(cfg => {
      let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
      if (completados.includes(cfg.numero)) estado = 'completado';
      else {
        const sig = NIVELES_LABERINTO.find(c => !completados.includes(c.numero));
        if (sig && sig.numero === cfg.numero) estado = 'actual';
      }
      return { numero: cfg.numero, nombre: cfg.nombre, estado };
    });
  }, [completados]);

  const siguienteDisponible = useMemo(() => {
    const sig = NIVELES_LABERINTO.find(c => !completados.includes(c.numero));
    return sig ? sig.numero : null;
  }, [completados]);

  // ============================================
  // LÓGICA DEL LABERINTO
  // ============================================

  // Mover gatos (solo niveles con gatos móviles)
  const moverGatos = useCallback((actualesGatos: Posicion[], mapaActual: number[][], jugador: Posicion): Posicion[] => {
    const nuevosGatos = actualesGatos.map(g => ({ ...g }));
    const dirs = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];

    for (const gato of nuevosGatos) {
      // Mezclar direcciones
      const dirsMezcladas = [...dirs].sort(() => Math.random() - 0.5);

      // 30% de probabilidad de moverse hacia el jugador
      if (Math.random() < 0.3) {
        dirsMezcladas.sort((a, b) => {
          const distA = Math.abs((gato.r + a.r) - jugador.r) + Math.abs((gato.c + a.c) - jugador.c);
          const distB = Math.abs((gato.r + b.r) - jugador.r) + Math.abs((gato.c + b.c) - jugador.c);
          return distA - distB;
        });
      }

      for (const dir of dirsMezcladas) {
        const nr = gato.r + dir.r;
        const nc = gato.c + dir.c;
        if (
          nr >= 0 && nr < mapaActual.length &&
          nc >= 0 && nc < mapaActual[0].length &&
          mapaActual[nr][nc] === 0 && // es camino
          !nuevosGatos.some(g => g.r === nr && g.c === nc) // no hay otro gato
        ) {
          gato.r = nr;
          gato.c = nc;
          break;
        }
      }
    }
    return nuevosGatos;
  }, []);

  // Mover jugador a una celda adyacente
  const moverJugador = useCallback((nr: number, nc: number) => {
    if (animando || mostrarPerder || mostrarCelebracion) return;
    if (nr < 0 || nr >= filas || nc < 0 || nc >= columnas) return;

    // Verificar que sea adyacente
    const dr = Math.abs(nr - posJugador.r);
    const dc = Math.abs(nc - posJugador.c);
    if (dr + dc !== 1) return;

    // Verificar que no sea pared
    if (mapa[nr][nc] === 1) return;

    setAnimando(true);

    // Verificar si hay un gato en la celda destino
    if (gatos.some(g => g.r === nr && g.c === nc)) {
      playError();
      registrarError(nivelActual);
      setPosJugador({ r: nr, c: nc });
      setTimeout(() => {
        setAnimando(false);
        setMostrarPerder(true);
        hablar('¡Oh no! Te atrapó un gato. ¡Intenta de nuevo!', { velocidad: 0.85 });
      }, 400);
      return;
    }

    // Mover jugador
    setPosJugador({ r: nr, c: nc });

    // Mover gatos si es nivel con gatos móviles
    if (config?.gatosMoviles) {
      const nuevosGatos = moverGatos(gatos, mapa, { r: nr, c: nc });
      setGatos(nuevosGatos);

      // Verificar si un gato llegó al jugador
      if (nuevosGatos.some(g => g.r === nr && g.c === nc)) {
        playError();
        registrarError(nivelActual);
        setTimeout(() => {
          setAnimando(false);
          setMostrarPerder(true);
          hablar('¡Oh no! Un gato te atrapó. ¡Intenta de nuevo!', { velocidad: 0.85 });
        }, 400);
        return;
      }
    }

    // Verificar si llegó a la meta
    if (mapa[nr][nc] === 2) {
      playExito();
      playNivelCompleto();
      agregarMonedas(15);
      agregarPuntos(30);
      agregarEstrellas(1);
      registrarAcierto(nivelActual);
      setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
      setTimeout(() => {
        setAnimando(false);
        setMostrarCelebracion(true);
        hablar(`¡Nivel ${nivelActual} completado! Llegaste al queso.`, { velocidad: 0.85 });
      }, 600);
    } else {
      playClic();
      setTimeout(() => setAnimando(false), 120);
    }
  }, [animando, mostrarPerder, mostrarCelebracion, filas, columnas, posJugador, mapa, gatos, config, moverGatos, nivelActual, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto, registrarError]);

  // Mover en una dirección (para D-pad)
  const moverDireccion = useCallback((dr: number, dc: number) => {
    moverJugador(posJugador.r + dr, posJugador.c + dc);
  }, [moverJugador, posJugador]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const cfg = NIVELES_LABERINTO[numero - 1];
    if (!cfg) return;
    playClic();

    const mapaParseado = parseMapa(cfg.filas);
    // Convertir gatos (3) a lista de enemigos y quitarlos del mapa
    const gatosIniciales = encontrarGatos(mapaParseado);
    const mapaLimpio = mapaParseado.map(fila => fila.map(c => c === 3 ? 0 : c));

    setMapa(mapaLimpio);
    setGatos(gatosIniciales);
    setPosJugador(encontrarInicio(mapaLimpio));
    completandoRef.current = false;
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);
    setMostrarPerder(false);
    setAnimando(false);

    hablar(`Nivel ${numero}: ${cfg.nombre}. Lleva al ratón al queso 🧀. ${cfg.gatosMoviles ? '¡Cuidado, los gatos se mueven!' : ''}`, { velocidad: 0.82 });
  }, []);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= NIVELES_LABERINTO.length) iniciarNivel(sig);
    else { setMostrarCelebracion(false); setPantalla('mapa'); }
  }, [nivelActual, iniciarNivel]);

  const reintentarNivel = useCallback(() => {
    setMostrarPerder(false);
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

  // ============================================
  // RENDER
  // ============================================

  // Tamaño de celda dinámico
  const cellSize = columnas >= 15 ? 40 : columnas >= 11 ? 50 : columnas >= 9 ? 56 : 64;

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
                <span className="text-2xl">🏃</span> Laberinto
              </h1>
              {pantalla === 'nivel' && config && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-emerald-500/20 text-emerald-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-emerald-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">{config.nombre}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{NIVELES_LABERINTO.length}
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
                <span className="text-8xl">🏃</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Laberinto!</h2>
              <p className="text-slate-300 text-lg mb-2">Ayuda al <span className="text-yellow-400 font-bold">ratón 🐭</span> a encontrar el <span className="text-yellow-300 font-bold">queso 🧀</span></p>
              <p className="text-slate-400 text-sm mb-8">{NIVELES_LABERINTO.length} niveles · Aprende orientación y planificación 🧠</p>
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
                  {completados.length}/{NIVELES_LABERINTO.length} completados
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4 max-w-3xl w-full">
                {nivelesMapa.map((nivel, idx) => (
                  <motion.button key={nivel.numero}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02, type: 'spring', bounce: 0.4 }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                      nivel.estado === 'completado' ? 'bg-game-surface border-2 border-transparent hover:border-emerald-400/50'
                      : nivel.estado === 'actual' ? 'bg-game-surface border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                    }`}
                    onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                    whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                    whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                    disabled={nivel.estado === 'bloqueado'}
                  >
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg ${
                      nivel.estado === 'completado' ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                      : nivel.estado === 'actual' ? 'bg-gradient-to-br from-emerald-500 to-green-600'
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
          {pantalla === 'nivel' && config && mapa.length > 0 && (
            <motion.div key={`nivel-${nivelActual}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }} className="w-full max-w-4xl flex flex-col items-center">
              {/* Barra superior */}
              <div className="flex items-center justify-between mb-3 w-full max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 rounded-full px-3 py-1 text-sm font-bold border border-emerald-500/30">
                    Nivel {nivelActual} / {NIVELES_LABERINTO.length}
                  </span>
                  <span className="text-white/60 text-sm hidden sm:inline">{config.nombre}</span>
                </div>
                {config.gatosMoviles && (
                  <span className="bg-red-500/20 text-red-300 rounded-full px-3 py-1 text-xs font-bold border border-red-500/30 animate-pulse">
                    ⚠️ ¡Gatos móviles!
                  </span>
                )}
              </div>

              {/* Instrucción */}
              <p className="text-white text-center text-base sm:text-lg font-semibold mb-4 game-title">
                🐭 Lleva al ratón hasta el queso 🧀
              </p>

              {/* Contenedor: Laberinto + D-pad al costado */}
              <div className="flex items-start gap-4 sm:gap-6 justify-center">
                {/* Laberinto */}
                <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-3 sm:p-4">
                  <div
                    className="grid gap-[2px] sm:gap-[3px]"
                    style={{ gridTemplateColumns: `repeat(${columnas}, ${cellSize}px)` }}
                  >
                    {mapa.map((fila, r) =>
                      fila.map((celda, c) => {
                        const esJugador = posJugador.r === r && posJugador.c === c;
                        const hayGato = gatos.some(g => g.r === r && g.c === c);
                        const esAdyacente = Math.abs(r - posJugador.r) + Math.abs(c - posJugador.c) === 1;

                        return (
                          <motion.div
                            key={`${r}-${c}`}
                            className={`
                              relative rounded-md flex items-center justify-center text-lg sm:text-xl select-none
                              ${celda === 1 ? 'bg-slate-700 border border-slate-600' : 'bg-slate-900/60 border border-slate-700/40'}
                              ${esAdyacente && celda !== 1 && !animando ? 'cursor-pointer hover:bg-emerald-900/40 hover:border-emerald-500/50' : ''}
                            `}
                            style={{ width: cellSize, height: cellSize }}
                            onClick={() => { if (esAdyacente && celda !== 1) moverJugador(r, c); }}
                            animate={esJugador ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Queso (meta) */}
                            {celda === 2 && !esJugador && (
                              <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                🧀
                              </motion.span>
                            )}

                            {/* Gato */}
                            {hayGato && !esJugador && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={config.gatosMoviles ? 'animate-bounce' : ''}
                              >
                                🐱
                              </motion.span>
                            )}

                            {/* Ratón (jugador) */}
                            {esJugador && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                                className="text-2xl sm:text-3xl drop-shadow-lg"
                              >
                                🐭
                              </motion.span>
                            )}

                            {/* Indicador de celda adyacente clickeable */}
                            {esAdyacente && celda !== 1 && !esJugador && !hayGato && !animando && (
                              <motion.div
                                className="absolute inset-0 rounded-md border-2 border-emerald-400/40"
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              />
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* D-Pad táctil (al costado) */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <DPadButton direction="up" onClick={() => moverDireccion(-1, 0)} disabled={animando} />
                  <div className="flex gap-1.5">
                    <DPadButton direction="left" onClick={() => moverDireccion(0, -1)} disabled={animando} />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-xl">
                      🐭
                    </div>
                    <DPadButton direction="right" onClick={() => moverDireccion(0, 1)} disabled={animando} />
                  </div>
                  <DPadButton direction="down" onClick={() => moverDireccion(1, 0)} disabled={animando} />
                </div>
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
                    backgroundColor: ['#10b981', '#3b82f6', '#22c55e', '#eab308', '#a855f7'][i % 5],
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
                🧀
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="game-title text-3xl sm:text-4xl mb-4 text-emerald-300"
                style={{ textShadow: '0 0 30px rgba(16,185,129,0.5)' }}>
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
                {nivelActual < NIVELES_LABERINTO.length ? (
                  <button onClick={irSiguienteNivel} className="btn-inicial text-lg px-10 py-3 animate-glow">Siguiente Nivel</button>
                ) : (
                  <button onClick={volverAlMapa} className="btn-inicial text-lg px-10 py-3 animate-glow">🏆 ¡Juego Completado!</button>
                )}
              </motion.div>
              {nivelActual < NIVELES_LABERINTO.length && (
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

      {/* ===== PERDER ===== */}
      <AnimatePresence>
        {mostrarPerder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
              className="relative text-center px-6 py-10 max-w-sm w-full">
              <motion.div className="text-8xl mb-4 inline-block"
                initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}>
                😿
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="game-title text-3xl sm:text-4xl mb-4 text-red-300"
                style={{ textShadow: '0 0 30px rgba(239,68,68,0.5)' }}>
                ¡Te atraparon!
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-400 mb-8">
                No te preocupes, ¡intenta otra vez!
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <button onClick={reintentarNivel} className="btn-inicial text-lg px-10 py-3 animate-glow">
                  🔄 ¡Otra Vez!
                </button>
              </motion.div>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                onClick={volverAlMapa}
                className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                Ver mapa de niveles
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// BOTÓN D-PAD
// ============================================

interface DPadButtonProps {
  direction: 'up' | 'down' | 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

function DPadButton({ direction, onClick, disabled }: DPadButtonProps) {
  const arrows = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };

  return (
    <motion.button
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-all
        ${disabled
          ? 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'
          : 'bg-gradient-to-br from-emerald-500/30 to-green-600/30 border-2 border-emerald-500/50 hover:bg-emerald-500/50 hover:border-emerald-400 active:scale-90'
        }`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
    >
      {arrows[direction]}
    </motion.button>
  );
}
