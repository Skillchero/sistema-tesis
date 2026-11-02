// ============================================
// JUEGO: APRENDE A USAR
// Mapa de 40 niveles + celebración + audio
// Enseña a manejar el mouse progresivamente
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import {
  RenderizarNivel,
  type Mecanica,
} from './aprende-usar/Niveles';
import NivelMap, {
  generarConfigNiveles,
} from './aprende-usar/NivelMap';
import Celebracion from './aprende-usar/Celebracion';
import MouseSVG from './aprende-usar/MouseSVG';
import {
  hablar,
  detenerVoz,
  setVozActiva,
  playNivelCompleto,
  playClic,
} from '../../../services/audio/speech';
import { useChildStore } from '../../../stores/childStore';
import { useGameProgress } from '../../../hooks/useGameProgress';

// ============================================
// TEXTOS DE INSTRUCCIÓN POR MECÁNICA
// ============================================

const INSTRUCCIONES: Record<Mecanica, string> = {
  clic: 'Da clic en el mouse. ¡Tócalo con el cursor y presiona el botón izquierdo!',
  arrastrar: 'Arrastra la estrella hasta la nube. Mantén presionado el botón izquierdo y mueve el mouse sin soltar.',
  'arrastrar-clic': 'Arrastra la pelota hasta la canasta. Después, haz clic en la canasta.',
  'clic-izquierdo': 'Haz clic en las estrellas con el botón izquierdo del mouse.',
  'clic-derecho': 'Haz clic derecho en los regalos. Usa el botón derecho del mouse.',
  'doble-clic': 'Haz doble clic en los huevos. Haz clic dos veces rápido.',
  'mover': 'Pasa el mouse sobre las flores. Mueve el cursor sin hacer clic.',
};

const TITULOS: Record<Mecanica, string> = {
  clic: 'Da clic en el mouse',
  arrastrar: 'Arrastra el mouse',
  'arrastrar-clic': 'Arrastra y da clic',
  'clic-izquierdo': 'Clic izquierdo',
  'clic-derecho': 'Clic derecho',
  'doble-clic': 'Doble clic',
  'mover': 'Mover el mouse',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'nivel';

// Persistencia simple en localStorage
function cargarProgreso(): number[] {
  try {
    const datos = localStorage.getItem('aprende-usar-progreso');
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

function guardarProgreso(completados: number[]): void {
  try {
    localStorage.setItem('aprende-usar-progreso', JSON.stringify(completados));
  } catch {
    // ignorar
  }
}

export default function AprendeUsarGame() {
  const navigate = useNavigate();
  const {
    agregarMonedas,
    agregarPuntos,
    agregarEstrellas,
    sonidoActivo,
    alternarSonido,
  } = useChildStore();
  const { registrarAcierto } = useGameProgress({ juegoId: 'aprende-usar' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1); // número de nivel (1-40)
  const [nivelesCompletados, setNivelesCompletados] = useState<number[]>(() => cargarProgreso());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  // Configuración de los 40 niveles
  const configNiveles = useMemo(() => generarConfigNiveles(), []);

  // Sincronizar voz con store
  useEffect(() => {
    setVozActiva(sonidoActivo);
  }, [sonidoActivo]);

  // Limpiar voz al desmontar
  useEffect(() => () => detenerVoz(), []);

  // Guardar progreso cuando cambia
  useEffect(() => {
    guardarProgreso(nivelesCompletados);
  }, [nivelesCompletados]);

  // ============================================
  // CALCULAR ESTADOS DEL MAPA
  // ============================================

  const nivelesMapa = useMemo(() => {
    return configNiveles.map(cfg => {
      let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
      if (nivelesCompletados.includes(cfg.numero)) {
        estado = 'completado';
      } else {
        // El primer nivel no completado es el "actual"
        const siguiente = configNiveles.find(
          c => !nivelesCompletados.includes(c.numero)
        );
        if (siguiente && siguiente.numero === cfg.numero) {
          estado = 'actual';
        }
      }
      return { numero: cfg.numero, estado };
    });
  }, [configNiveles, nivelesCompletados]);

  const siguienteNivelDisponible = useMemo(() => {
    const sig = configNiveles.find(c => !nivelesCompletados.includes(c.numero));
    return sig ? sig.numero : null;
  }, [configNiveles, nivelesCompletados]);

  // Config del nivel actual
  const configActual = configNiveles[nivelActual - 1];

  // ============================================
  // INICIAR NIVEL
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const cfg = configNiveles[numero - 1];
    if (!cfg) return;

    playClic();
    setNivelActual(numero);
    setPantalla('nivel');
    setMostrarCelebracion(false);

    // Audio de instrucción
    hablar(INSTRUCCIONES[cfg.mecanica], { velocidad: 0.82 });
  }, [configNiveles]);

  // ============================================
  // NIVEL COMPLETADO → CELEBRACIÓN
  // ============================================

  const manejarNivelCompletado = useCallback(() => {
    playNivelCompleto();

    // Recompensas
    agregarMonedas(15);
    agregarPuntos(30);
    agregarEstrellas(1);
    registrarAcierto(nivelActual);

    setNivelesCompletados(prev => {
      if (prev.includes(nivelActual)) return prev;
      return [...prev, nivelActual];
    });

    // Mostrar celebración
    setMostrarCelebracion(true);

    // Audio de celebración
    hablar(`¡Nivel ${nivelActual} completado! Eres genial.`, { velocidad: 0.85 });
  }, [nivelActual, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto]);

  // ============================================
  // SIGUIENTE NIVEL (desde celebración)
  // ============================================

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= configNiveles.length) {
      iniciarNivel(sig);
    } else {
      // Último nivel del juego
      setMostrarCelebracion(false);
      setPantalla('mapa');
    }
  }, [nivelActual, configNiveles.length, iniciarNivel]);

  // ============================================
  // VOLVER AL MAPA
  // ============================================

  const volverAlMapa = useCallback(() => {
    detenerVoz();
    setMostrarCelebracion(false);
    setPantalla('mapa');
  }, []);

  // ============================================
  // SALIR DEL JUEGO
  // ============================================

  const salir = useCallback(() => {
    detenerVoz();
    navigate('/nino/menu');
  }, [navigate]);

  // ============================================
  // REPETIR INSTRUCCIÓN
  // ============================================

  const repetirInstruccion = useCallback(() => {
    if (configActual) {
      hablar(INSTRUCCIONES[configActual.mecanica], { velocidad: 0.82 });
    }
  }, [configActual]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="game-bg min-h-screen flex flex-col">
      {/* ============================================
          HEADER
          ============================================ */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="back-btn"
              onClick={() => {
                if (pantalla === 'nivel') {
                  volverAlMapa();
                } else {
                  salir();
                }
              }}
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="game-title text-xl sm:text-2xl flex items-center gap-2">
                <span className="text-2xl">🖱️</span> Aprende a Usar
              </h1>
              {pantalla === 'nivel' && configActual && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-cyan-500/20 text-cyan-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-cyan-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">
                    {TITULOS[configActual.mecanica]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            {/* Progreso global */}
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {nivelesCompletados.length}/{configNiveles.length}
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

      {/* ============================================
          CONTENIDO
          ============================================ */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* ----------------------------------------
              PANTALLA: INICIO
              ---------------------------------------- */}
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
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <MouseSVG size={130} />
              </motion.div>

              <h2 className="game-title text-3xl sm:text-4xl mb-3">
                ¡Vamos a aprender!
              </h2>
              <p className="text-slate-300 text-lg mb-2">
                Aprende a usar el <span className="text-cyan-400 font-bold">mouse</span> jugando
              </p>
              <p className="text-slate-400 text-sm mb-8">
                25 niveles · Sigue las instrucciones de voz 🔊
              </p>

              <motion.button
                className="btn-inicial text-lg px-8 py-3"
                onClick={() => {
                  playClic();
                  setPantalla('mapa');
                }}
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

          {/* ----------------------------------------
              PANTALLA: MAPA DE NIVELES
              ---------------------------------------- */}
          {pantalla === 'mapa' && (
            <motion.div
              key="mapa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="game-title text-2xl sm:text-3xl mb-6 text-center">
                Elige un nivel
              </h2>

              <NivelMap
                niveles={nivelesMapa}
                totalCompletados={nivelesCompletados.length}
                totalNiveles={configNiveles.length}
                onSeleccionarNivel={iniciarNivel}
              />

              {/* Botón jugar siguiente nivel */}
              {siguienteNivelDisponible && (
                <motion.button
                  className="btn-inicial mt-8 text-lg px-8 py-3"
                  onClick={() => iniciarNivel(siguienteNivelDisponible)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶ Nivel {siguienteNivelDisponible}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ----------------------------------------
              PANTALLA: JUGANDO NIVEL
              ---------------------------------------- */}
          {pantalla === 'nivel' && configActual && (
            <motion.div
              key={`nivel-${nivelActual}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              {/* Barra superior del nivel */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-500/20 text-cyan-300 rounded-full px-3 py-1 text-sm font-bold border border-cyan-500/30">
                    Nivel {nivelActual} / {configNiveles.length}
                  </span>
                </div>

                <button
                  onClick={repetirInstruccion}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors border border-white/10"
                  title="Repetir instrucción"
                >
                  🔊 Repetir
                </button>
              </div>

              {/* Componente del nivel */}
              <div className="bg-game-surface/50 rounded-2xl border border-white/10 p-4 sm:p-6">
                <RenderizarNivel
                  mecanica={configActual.mecanica}
                  objetivos={configActual.objetivos}
                  dificultad={configActual.dificultad}
                  onCompletado={manejarNivelCompletado}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ============================================
          OVERLAY: CELEBRACIÓN
          ============================================ */}
      <AnimatePresence>
        {mostrarCelebracion && (
          <Celebracion
            nivelCompletado={nivelActual}
            siguienteNivel={nivelActual < configNiveles.length ? nivelActual + 1 : null}
            monedasGanadas={15}
            onSiguiente={irSiguienteNivel}
            onVolverAlMapa={volverAlMapa}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
