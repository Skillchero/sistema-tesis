// ============================================
// NIVELES DEL JUEGO "APRENDE A USAR"
// 7 mecánicas únicas del mouse (sin repetición):
// 1. clic           → Clic simple
// 2. arrastrar      → Arrastrar objeto al objetivo
// 3. arrastrar-clic → Arrastrar + clic
// 4. clic-izquierdo → Clic izquierdo múltiple
// 5. clic-derecho   → Clic derecho
// 6. doble-clic     → Doble clic
// 7. mover          → Mover cursor (hover)
// ============================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MouseSVG from './MouseSVG';
import { playClic, playExito } from '../../../../services/audio/speech';

export type Mecanica =
  | 'clic'
  | 'arrastrar'
  | 'arrastrar-clic'
  | 'clic-izquierdo'
  | 'clic-derecho'
  | 'doble-clic'
  | 'mover';

// ============================================
// HOOK: Medir tamaño del contenedor
// ============================================

function useTamanoContador<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [tamano, setTamano] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const medir = () => {
      if (ref.current) {
        setTamano({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
      }
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  return { ref, tamano };
}

// ============================================
// NIVEL 1: CLIC
// ============================================

interface NivelClicProps {
  objetivos: number;
  onCompletado: () => void;
}

export function NivelClic({ objetivos, onCompletado }: NivelClicProps) {
  const [clicados, setClicados] = useState<number[]>([]);

  const posiciones = [
    { x: 50, y: 45 },
    { x: 25, y: 60 },
    { x: 75, y: 60 },
  ];

  const manejarClic = (id: number) => {
    if (clicados.includes(id)) return;
    setClicados(prev => [...prev, id]);
    playClic();
    playExito();

    if (clicados.length + 1 >= objetivos) {
      setTimeout(() => onCompletado(), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        👆 Da clic en {objetivos === 1 ? 'el mouse' : `los ${objetivos} mice`}
      </p>

      <div className="relative w-full max-w-2xl h-72">
        {Array.from({ length: objetivos }).map((_, i) => {
          const clicado = clicados.includes(i);
          const pos = posiciones[i] || posiciones[0];
          return (
            <motion.div
              key={i}
              className="absolute cursor-pointer select-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => manejarClic(i)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              animate={clicado ? { scale: [1, 1.3, 0.8], opacity: [1, 1, 0.4] } : {}}
            >
              <MouseSVG size={objetivos === 1 ? 150 : 90} clicando={clicado} />
            </motion.div>
          );
        })}
      </div>

      <div className="text-white/60 text-sm">
        {clicados.length} / {objetivos}
      </div>
    </div>
  );
}

// ============================================
// NIVEL 2: ARRASTRAR
// Radio de captura: 50px (solo en el objetivo)
// Dificultad controla distancia y precisión
// ============================================

interface NivelArrastrarProps {
  dificultad?: number;
  onCompletado: () => void;
}

export function NivelArrastrar({ dificultad = 1, onCompletado }: NivelArrastrarProps) {
  const { ref: contenedorRef, tamano } = useTamanoContador<HTMLDivElement>();
  const [desplazamiento, setDesplazamiento] = useState({ x: 0, y: 0 });
  const [completado, setCompletado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const inicioRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const desplazamientoRef = useRef({ x: 0, y: 0 });
  const completadoRef = useRef(false);

  useEffect(() => { desplazamientoRef.current = desplazamiento; }, [desplazamiento]);
  useEffect(() => { completadoRef.current = completado; }, [completado]);

  // Posiciones según dificultad (más distancia = más difícil)
  const configs = {
    1: { inicio: { x: 0.25, y: 0.55 }, objetivo: { x: 0.65, y: 0.35 }, radio: 60 },
    2: { inicio: { x: 0.15, y: 0.65 }, objetivo: { x: 0.72, y: 0.25 }, radio: 55 },
    3: { inicio: { x: 0.10, y: 0.72 }, objetivo: { x: 0.80, y: 0.20 }, radio: 50 },
    4: { inicio: { x: 0.08, y: 0.78 }, objetivo: { x: 0.85, y: 0.15 }, radio: 45 },
  };
  const cfg = configs[Math.min(4, Math.max(1, dificultad)) as keyof typeof configs] || configs[1];

  const inicioPx = { x: tamano.w * cfg.inicio.x, y: tamano.h * cfg.inicio.y };
  const objetivoPx = { x: tamano.w * cfg.objetivo.x, y: tamano.h * cfg.objetivo.y };
  const posActual = { x: inicioPx.x + desplazamiento.x, y: inicioPx.y + desplazamiento.y };
  const RADIO_CAPTURA = cfg.radio;

  const manejarInicio = useCallback((e: React.PointerEvent) => {
    if (completadoRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(true);
    inicioRef.current = {
      x: e.clientX, y: e.clientY,
      posX: desplazamientoRef.current.x, posY: desplazamientoRef.current.y,
    };
    playClic();
  }, []);

  useEffect(() => {
    if (!arrastrando) return;

    const manejarMovimiento = (e: PointerEvent) => {
      if (completadoRef.current) return;
      e.preventDefault();
      const dx = e.clientX - inicioRef.current.x;
      const dy = e.clientY - inicioRef.current.y;
      const nuevaX = inicioRef.current.posX + dx;
      const nuevaY = inicioRef.current.posY + dy;
      setDesplazamiento({ x: nuevaX, y: nuevaY });

      const actualX = inicioPx.x + nuevaX;
      const actualY = inicioPx.y + nuevaY;
      const distancia = Math.hypot(actualX - objetivoPx.x, actualY - objetivoPx.y);

      if (distancia < RADIO_CAPTURA) {
        setCompletado(true);
        setArrastrando(false);
        playExito();
        setTimeout(() => onCompletado(), 1500);
      }
    };

    const manejarFin = () => setArrastrando(false);
    window.addEventListener('pointermove', manejarMovimiento);
    window.addEventListener('pointerup', manejarFin);
    window.addEventListener('pointercancel', manejarFin);
    return () => {
      window.removeEventListener('pointermove', manejarMovimiento);
      window.removeEventListener('pointerup', manejarFin);
      window.removeEventListener('pointercancel', manejarFin);
    };
  }, [arrastrando, onCompletado, inicioPx.x, inicioPx.y, objetivoPx.x, objetivoPx.y, RADIO_CAPTURA]);

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        🖱️ Arrastra la estrella hasta la nube
      </p>

      <div
        ref={contenedorRef}
        className="relative w-full max-w-2xl h-80 bg-gradient-to-b from-indigo-900/50 to-purple-900/50 rounded-2xl border border-white/10 overflow-hidden touch-none"
      >
        {/* Nube objetivo */}
        <motion.div
          role="button"
          aria-label="Nube objetivo"
          className="absolute select-none pointer-events-none"
          style={{
            left: objetivoPx.x,
            top: objetivoPx.y,
            transform: 'translate(-50%, -50%)',
          }}
          animate={completado ? { scale: [1, 1.4, 1.1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-6xl block">☁️</span>
          {!completado && (
            <motion.span
              className="absolute inset-0 rounded-full bg-cyan-400/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 80, height: 80, left: -24, top: -24 }}
            />
          )}
        </motion.div>

        {/* Línea guía */}
        {tamano.w > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={inicioPx.x} y1={inicioPx.y}
              x2={objetivoPx.x} y2={objetivoPx.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="3" strokeDasharray="8 8"
            />
          </svg>
        )}

        {/* Estrella arrastrable */}
        {!completado && (
          <motion.div
            role="button"
            aria-label="Estrella arrastrable"
            className="absolute cursor-grab active:cursor-grabbing select-none touch-none"
            style={{
              left: posActual.x,
              top: posActual.y,
              transform: 'translate(-50%, -50%)',
            }}
            onPointerDown={manejarInicio}
            animate={{
              scale: arrastrando ? 1.25 : 1,
              filter: arrastrando ? 'brightness(1.3)' : 'brightness(1)',
            }}
          >
            <span className="text-5xl block">⭐</span>
          </motion.div>
        )}

        {/* Estrella llega a la nube */}
        {completado && (
          <motion.div
            className="absolute select-none pointer-events-none"
            style={{
              left: objetivoPx.x,
              top: objetivoPx.y,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ scale: [1, 1.3, 0.8], opacity: [1, 1, 0.6] }}
          >
            <span className="text-4xl block">⭐</span>
          </motion.div>
        )}

        {/* Éxito */}
        <AnimatePresence>
          {completado && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
            >
              <motion.div
                initial={{ scale: 0.3 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center"
              >
                <div className="text-6xl mb-2">🌟</div>
                <div className="text-3xl text-white font-bold game-title">¡Lo lograste!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!arrastrando && !completado && (
        <p className="text-slate-400 text-sm">👆 Mantén presionado y arrastra sin soltar</p>
      )}
    </div>
  );
}

// ============================================
// NIVEL 3: ARRASTRAR Y CLIC
// ============================================

interface NivelArrastrarClicProps {
  onCompletado: () => void;
}

export function NivelArrastrarClic({ onCompletado }: NivelArrastrarClicProps) {
  const { ref: contenedorRef, tamano } = useTamanoContador<HTMLDivElement>();
  const [desplazamiento, setDesplazamiento] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [pelotaEnCanasta, setPelotaEnCanasta] = useState(false);
  const [clicEnCanasta, setClicEnCanasta] = useState(false);
  const [completado, setCompletado] = useState(false);
  const inicioRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const desplazamientoRef = useRef({ x: 0, y: 0 });
  const pelotaEnCanastaRef = useRef(false);

  useEffect(() => { desplazamientoRef.current = desplazamiento; }, [desplazamiento]);
  useEffect(() => { pelotaEnCanastaRef.current = pelotaEnCanasta; }, [pelotaEnCanasta]);

  const inicioPx = { x: tamano.w * 0.15, y: tamano.h * 0.65 };
  const objetivoPx = { x: tamano.w * 0.72, y: tamano.h * 0.3 };
  const posActual = { x: inicioPx.x + desplazamiento.x, y: inicioPx.y + desplazamiento.y };
  const RADIO_CAPTURA = 50;

  const manejarInicio = useCallback((e: React.PointerEvent) => {
    if (pelotaEnCanastaRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(true);
    inicioRef.current = {
      x: e.clientX, y: e.clientY,
      posX: desplazamientoRef.current.x, posY: desplazamientoRef.current.y,
    };
    playClic();
  }, []);

  useEffect(() => {
    if (!arrastrando) return;

    const manejarMovimiento = (e: PointerEvent) => {
      if (pelotaEnCanastaRef.current) return;
      e.preventDefault();
      const dx = e.clientX - inicioRef.current.x;
      const dy = e.clientY - inicioRef.current.y;
      const nuevaX = inicioRef.current.posX + dx;
      const nuevaY = inicioRef.current.posY + dy;
      setDesplazamiento({ x: nuevaX, y: nuevaY });

      const actualX = inicioPx.x + nuevaX;
      const actualY = inicioPx.y + nuevaY;
      const distancia = Math.hypot(actualX - objetivoPx.x, actualY - objetivoPx.y);

      if (distancia < RADIO_CAPTURA) {
        setPelotaEnCanasta(true);
        setArrastrando(false);
        playExito();
      }
    };

    const manejarFin = () => setArrastrando(false);
    window.addEventListener('pointermove', manejarMovimiento);
    window.addEventListener('pointerup', manejarFin);
    window.addEventListener('pointercancel', manejarFin);
    return () => {
      window.removeEventListener('pointermove', manejarMovimiento);
      window.removeEventListener('pointerup', manejarFin);
      window.removeEventListener('pointercancel', manejarFin);
    };
  }, [arrastrando, inicioPx.x, inicioPx.y, objetivoPx.x, objetivoPx.y]);

  const clicCanasta = useCallback(() => {
    if (!pelotaEnCanasta || clicEnCanasta) return;
    setClicEnCanasta(true);
    playClic();
    setTimeout(() => {
      setCompletado(true);
      playExito();
      setTimeout(() => onCompletado(), 1500);
    }, 400);
  }, [pelotaEnCanasta, clicEnCanasta, onCompletado]);

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        🏀 Arrastra la pelota y luego haz clic
      </p>

      <div
        ref={contenedorRef}
        className="relative w-full max-w-2xl h-80 bg-gradient-to-b from-green-900/40 to-emerald-900/40 rounded-2xl border border-white/10 overflow-hidden touch-none"
      >
        {/* Canasta objetivo */}
        <motion.div
          className="absolute select-none cursor-pointer"
          style={{
            left: objetivoPx.x,
            top: objetivoPx.y,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={clicCanasta}
          animate={pelotaEnCanasta && !clicEnCanasta ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] } : {}}
          transition={{ repeat: pelotaEnCanasta && !clicEnCanasta ? Infinity : 0, duration: 1 }}
        >
          <span className="text-7xl block">🧺</span>
        </motion.div>

        {/* Pelota arrastrable */}
        {!pelotaEnCanasta && (
          <motion.div
            className="absolute cursor-grab active:cursor-grabbing select-none touch-none"
            style={{
              left: posActual.x,
              top: posActual.y,
              transform: 'translate(-50%, -50%)',
            }}
            onPointerDown={manejarInicio}
            animate={{ scale: arrastrando ? 1.2 : 1 }}
          >
            <span className="text-5xl block">🏀</span>
          </motion.div>
        )}

        {/* Pelota dentro de la canasta */}
        {pelotaEnCanasta && !clicEnCanasta && (
          <motion.div
            className="absolute select-none pointer-events-none"
            style={{
              left: objetivoPx.x,
              top: objetivoPx.y + 25,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.6 }}
          >
            <span className="text-3xl block">🏀</span>
          </motion.div>
        )}

        {/* Indicador "clic aquí" */}
        {pelotaEnCanasta && !clicEnCanasta && (
          <motion.div
            className="absolute text-3xl select-none pointer-events-none"
            style={{ left: objetivoPx.x - 30, top: objetivoPx.y - 60 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            👆
          </motion.div>
        )}

        {/* Línea guía */}
        {tamano.w > 0 && !pelotaEnCanasta && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={inicioPx.x} y1={inicioPx.y}
              x2={objetivoPx.x} y2={objetivoPx.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="3" strokeDasharray="8 8"
            />
          </svg>
        )}

        {/* Éxito */}
        <AnimatePresence>
          {completado && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
            >
              <motion.div
                initial={{ scale: 0.3 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center"
              >
                <div className="text-6xl mb-2">🎯</div>
                <div className="text-3xl text-white font-bold game-title">¡Arrastraste y hiciste clic!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-slate-400 text-sm">
        {!pelotaEnCanasta ? '1️⃣ Arrastra la pelota a la canasta' : '2️⃣ Ahora haz clic en la canasta'}
      </p>
    </div>
  );
}

// ============================================
// NIVEL 4: CLIC IZQUIERDO
// ============================================

interface NivelClicIzquierdoProps {
  objetivos: number;
  onCompletado: () => void;
}

export function NivelClicIzquierdo({ objetivos, onCompletado }: NivelClicIzquierdoProps) {
  const [clicadas, setClicadas] = useState<number[]>([]);
  const [completado, setCompletado] = useState(false);

  const posiciones = Array.from({ length: objetivos }).map((_, i) => ({
    x: 20 + (i % 3) * 30 + Math.sin(i * 1.5) * 8,
    y: 25 + Math.floor(i / 3) * 30 + Math.cos(i * 1.5) * 8,
  }));

  const manejarClic = (id: number) => {
    if (clicadas.includes(id) || completado) return;
    setClicadas(prev => [...prev, id]);
    playClic();
    playExito();

    if (clicadas.length + 1 >= objetivos) {
      setTimeout(() => {
        setCompletado(true);
        setTimeout(() => onCompletado(), 1800);
      }, 500);
    }
  };

  const restantes = objetivos - clicadas.length;

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        🖱️ Haz clic en las {objetivos} estrellas
      </p>

      <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
        <MouseSVG size={36} resaltarIzquierdo />
        <span className="text-white/80 text-sm">
          Usa el <span className="text-cyan-400 font-bold">botón izquierdo</span>
        </span>
      </div>

      <div className="relative w-full max-w-2xl h-72 bg-gradient-to-b from-purple-900/40 to-indigo-900/40 rounded-2xl border border-white/10 overflow-hidden">
        {posiciones.map((pos, i) => {
          const clicada = clicadas.includes(i);
          return (
            <motion.div
              key={i}
              className="absolute text-5xl select-none cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => manejarClic(i)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={clicada ? { scale: [1, 1.6, 0], opacity: [1, 1, 0], rotate: [0, 20, 45] } : {}}
              transition={{ duration: 0.5 }}
            >
              ⭐
            </motion.div>
          );
        })}

        <div className="absolute bottom-3 right-3 bg-black/40 rounded-full px-3 py-1 text-white text-sm">
          {completado ? `¡${objetivos}/${objetivos}!` : `Faltan ${restantes}`}
        </div>

        <AnimatePresence>
          {completado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
            >
              <motion.div
                initial={{ scale: 0.3 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center px-4"
              >
                <div className="text-6xl mb-2">🎉</div>
                <div className="text-2xl sm:text-3xl text-white font-bold game-title">
                  ¡Ya sabes usar el botón izquierdo!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// NIVEL 5: CLIC DERECHO (nuevo)
// ============================================

interface NivelClicDerechoProps {
  objetivos: number;
  onCompletado: () => void;
}

export function NivelClicDerecho({ objetivos, onCompletado }: NivelClicDerechoProps) {
  const [abiertos, setAbiertos] = useState<number[]>([]);
  const [completado, setCompletado] = useState(false);

  const posiciones = Array.from({ length: objetivos }).map((_, i) => ({
    x: 22 + (i % 3) * 28 + Math.sin(i * 2) * 6,
    y: 30 + Math.floor(i / 3) * 32 + Math.cos(i * 2) * 6,
  }));

  const manejarClicDerecho = (id: number, e: React.MouseEvent) => {
    e.preventDefault(); // Suprimir menú del navegador
    if (abiertos.includes(id) || completado) return;
    setAbiertos(prev => [...prev, id]);
    playClic();
    playExito();

    if (abiertos.length + 1 >= objetivos) {
      setTimeout(() => {
        setCompletado(true);
        setTimeout(() => onCompletado(), 1800);
      }, 500);
    }
  };

  // Prevenir menú contextual en todo el contenedor
  const prevenirMenu = (e: React.MouseEvent) => e.preventDefault();

  const restantes = objetivos - abiertos.length;

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        🎁 Haz clic derecho en los regalos
      </p>

      <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
        <MouseSVG size={36} resaltarDerecho />
        <span className="text-white/80 text-sm">
          Usa el <span className="text-pink-400 font-bold">botón derecho</span> 🖱️
        </span>
      </div>

      <div
        className="relative w-full max-w-2xl h-72 bg-gradient-to-b from-pink-900/40 to-rose-900/40 rounded-2xl border border-white/10 overflow-hidden"
        onContextMenu={prevenirMenu}
      >
        {posiciones.map((pos, i) => {
          const abierto = abiertos.includes(i);
          return (
            <motion.div
              key={i}
              className="absolute text-5xl select-none cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onContextMenu={(e) => manejarClicDerecho(i, e)}
              whileHover={{ scale: 1.15 }}
              animate={abierto ? { scale: [1, 1.4, 0.9], rotate: [0, 15, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {abierto ? '🎉' : '🎁'}
            </motion.div>
          );
        })}

        <div className="absolute bottom-3 right-3 bg-black/40 rounded-full px-3 py-1 text-white text-sm">
          {completado ? `¡${objetivos}/${objetivos}!` : `Faltan ${restantes}`}
        </div>

        <AnimatePresence>
          {completado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
            >
              <motion.div
                initial={{ scale: 0.3 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center px-4"
              >
                <div className="text-6xl mb-2">🎊</div>
                <div className="text-2xl sm:text-3xl text-white font-bold game-title">
                  ¡Clic derecho perfecto!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-slate-400 text-sm">
        👉 Presiona el <span className="text-pink-400 font-bold">botón derecho</span> del mouse
      </p>
    </div>
  );
}

// ============================================
// NIVEL 6: DOBLE CLIC (nuevo)
// ============================================

interface NivelDobleClicProps {
  objetivos: number;
  onCompletado: () => void;
}

export function NivelDobleClic({ objetivos, onCompletado }: NivelDobleClicProps) {
  const [eclosionados, setEclosionados] = useState<number[]>([]);
  const [completado, setCompletado] = useState(false);

  const animales = ['🐣', '🐥', '🦆', '🐸'];

  const posiciones = Array.from({ length: objetivos }).map((_, i) => ({
    x: 22 + (i % 3) * 28 + Math.sin(i * 2.5) * 7,
    y: 28 + Math.floor(i / 3) * 32 + Math.cos(i * 2.5) * 7,
  }));

  const manejarDobleClic = (id: number) => {
    if (eclosionados.includes(id) || completado) return;
    setEclosionados(prev => [...prev, id]);
    playClic();
    playExito();

    if (eclosionados.length + 1 >= objetivos) {
      setTimeout(() => {
        setCompletado(true);
        setTimeout(() => onCompletado(), 1800);
      }, 600);
    }
  };

  const restantes = objetivos - eclosionados.length;

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        🥚 Haz doble clic en los huevos
      </p>

      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-white/80 text-sm">
        <span className="text-lg">👆👆</span>
        <span>Haz clic <span className="text-yellow-400 font-bold">dos veces rápido</span></span>
      </div>

      <div className="relative w-full max-w-2xl h-72 bg-gradient-to-b from-amber-900/40 to-yellow-900/40 rounded-2xl border border-white/10 overflow-hidden">
        {posiciones.map((pos, i) => {
          const eclosionado = eclosionados.includes(i);
          return (
            <motion.div
              key={i}
              className="absolute text-5xl select-none cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onDoubleClick={() => manejarDobleClic(i)}
              whileHover={{ scale: 1.15 }}
              animate={eclosionado ? { scale: [1, 0.6, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {eclosionado ? animales[i % animales.length] : '🥚'}
            </motion.div>
          );
        })}

        <div className="absolute bottom-3 right-3 bg-black/40 rounded-full px-3 py-1 text-white text-sm">
          {completado ? `¡${objetivos}/${objetivos}!` : `Faltan ${restantes}`}
        </div>

        <AnimatePresence>
          {completado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
            >
              <motion.div
                initial={{ scale: 0.3 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center px-4"
              >
                <div className="text-6xl mb-2">🐥</div>
                <div className="text-2xl sm:text-3xl text-white font-bold game-title">
                  ¡Todos eclosionaron!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-slate-400 text-sm">
        👆👆 Haz clic <span className="text-yellow-400 font-bold">dos veces</span> rápido en cada huevo
      </p>
    </div>
  );
}

// ============================================
// NIVEL 7: MOVER / HOVER (nuevo)
// El niño mueve el mouse sin hacer clic
// ============================================

interface NivelMoverProps {
  objetivos: number;
  onCompletado: () => void;
}

export function NivelMover({ objetivos, onCompletado }: NivelMoverProps) {
  const [tocadas, setTocadas] = useState<number[]>([]);
  const [completado, setCompletado] = useState(false);

  const flores = ['🌸', '🌻', '🌷', '🌹', '💮', '🌺', '🏵️', '🌼', '🍀'];

  const posiciones = Array.from({ length: objetivos }).map((_, i) => ({
    x: 15 + (i % 4) * 24 + Math.sin(i * 3) * 6,
    y: 22 + Math.floor(i / 4) * 28 + Math.cos(i * 3) * 6,
  }));

  const manejarHover = (id: number) => {
    if (tocadas.includes(id) || completado) return;
    setTocadas(prev => [...prev, id]);
    playExito();

    if (tocadas.length + 1 >= objetivos) {
      setTimeout(() => {
        setCompletado(true);
        setTimeout(() => onCompletado(), 1800);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <p className="text-white text-xl sm:text-2xl font-semibold text-center game-title">
        🌸 Pasa el mouse sobre las flores
      </p>

      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-white/80 text-sm">
        <span className="text-lg">🖱️</span>
        <span>Mueve el mouse <span className="text-green-400 font-bold">sin hacer clic</span></span>
      </div>

      <div className="relative w-full max-w-2xl h-72 bg-gradient-to-b from-green-900/40 to-emerald-900/40 rounded-2xl border border-white/10 overflow-hidden">
        {posiciones.map((pos, i) => {
          const tocada = tocadas.includes(i);
          return (
            <motion.div
              key={i}
              className="absolute text-4xl sm:text-5xl select-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => manejarHover(i)}
              animate={
                tocada
                  ? { scale: [1, 1.5, 1.2], opacity: [1, 1, 0.7] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
            >
              {flores[i % flores.length]}
            </motion.div>
          );
        })}

        <div className="absolute bottom-3 right-3 bg-black/40 rounded-full px-3 py-1 text-white text-sm">
          {completado ? `¡${objetivos}/${objetivos}!` : `${tocadas.length} / ${objetivos}`}
        </div>

        <AnimatePresence>
          {completado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
            >
              <motion.div
                initial={{ scale: 0.3 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center px-4"
              >
                <div className="text-6xl mb-2">🦋</div>
                <div className="text-2xl sm:text-3xl text-white font-bold game-title">
                  ¡Hiciste un hermoso jardín!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-slate-400 text-sm">
        🖱️ Mueve el mouse sobre cada flor para hacerla florecer
      </p>
    </div>
  );
}

// ============================================
// RENDERIZAR NIVEL (universal)
// ============================================

interface RenderizarNivelProps {
  mecanica: Mecanica;
  objetivos: number;
  dificultad?: number;
  onCompletado: () => void;
}

export function RenderizarNivel({ mecanica, objetivos, dificultad, onCompletado }: RenderizarNivelProps) {
  switch (mecanica) {
    case 'clic':
      return <NivelClic objetivos={objetivos} onCompletado={onCompletado} />;
    case 'arrastrar':
      return <NivelArrastrar dificultad={dificultad} onCompletado={onCompletado} />;
    case 'arrastrar-clic':
      return <NivelArrastrarClic onCompletado={onCompletado} />;
    case 'clic-izquierdo':
      return <NivelClicIzquierdo objetivos={objetivos} onCompletado={onCompletado} />;
    case 'clic-derecho':
      return <NivelClicDerecho objetivos={objetivos} onCompletado={onCompletado} />;
    case 'doble-clic':
      return <NivelDobleClic objetivos={objetivos} onCompletado={onCompletado} />;
    case 'mover':
      return <NivelMover objetivos={objetivos} onCompletado={onCompletado} />;
    default:
      return null;
  }
}
