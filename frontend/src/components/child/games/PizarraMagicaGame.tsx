// ============================================
// JUEGO: PIZARRA MÁGICA (20 niveles)
// Dibujo libre con canvas + tareas guía
// Enseña control fino del mouse y creatividad
// Paleta de colores + borrador + grosor
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
} from '../../../services/audio/speech';
import { useChildStore } from '../../../stores/childStore';
import { useGameProgress } from '../../../hooks/useGameProgress';

// ============================================
// TAREAS DE DIBUJO (20 niveles)
// ============================================

interface TareaDibujo {
  nombre: string;
  emoji: string;
  pista: string; // Descripción hablada para niños
}

const TAREAS: TareaDibujo[] = [
  { nombre: 'Un Sol', emoji: '☀️', pista: 'Dibuja un sol grande y amarillo. ¡Con rayos por todos lados!' },
  { nombre: 'Una Casa', emoji: '🏠', pista: 'Dibuja una casa. Un cuadrado con un triángulo arriba.' },
  { nombre: 'Un Árbol', emoji: '🌳', pista: 'Dibuja un árbol. Un tronco marrón y hojas verdes arriba.' },
  { nombre: 'Una Flor', emoji: '🌸', pista: 'Dibuja una flor. Pétalos de colores y un tallo verde.' },
  { nombre: 'Un Gato', emoji: '🐱', pista: 'Dibuja un gatito. Redondo, con orejas y bigotes.' },
  { nombre: 'Un Perro', emoji: '🐶', pista: 'Dibuja un perrito. Tiene orejas largas y una cola.' },
  { nombre: 'Una Pelota', emoji: '⚽', pista: 'Dibuja una pelota redonda. ¡Píntala de colores!' },
  { nombre: 'Un Avión', emoji: '✈️', pista: 'Dibuja un avión que vuela por las nubes.' },
  { nombre: 'Un Barco', emoji: '⛵', pista: 'Dibuja un barquito en el mar. Tiene una vela.' },
  { nombre: 'Una Montaña', emoji: '⛰️', pista: 'Dibuja montañas altas. Como triángones muy grandes.' },
  { nombre: 'La Luna', emoji: '🌙', pista: 'Dibuja la luna. Como una media luna en el cielo.' },
  { nombre: 'Una Estrella', emoji: '⭐', pista: 'Dibuja una estrella. Tiene 5 puntas.' },
  { nombre: 'Una Manzana', emoji: '🍎', pista: 'Dibuja una manzana. Redonda y de color rojo.' },
  { nombre: 'Un Plátano', emoji: '🍌', pista: 'Dibuja un plátano. Es amarillo y curvado.' },
  { nombre: 'Un Coche', emoji: '🚗', pista: 'Dibuja un coche. Tiene 4 ruedas.' },
  { nombre: 'Un Televisor', emoji: '📺', pista: 'Dibuja un televisor. Un rectángulo grande.' },
  { nombre: 'Un Libro', emoji: '📖', pista: 'Dibuja un libro abierto. Como dos páginas.' },
  { nombre: 'Un Lápiz', emoji: '✏️', pista: 'Dibuja un lápiz largo y amarillo.' },
  { nombre: 'Una Nube', emoji: '☁️', pista: 'Dibuja una nube. ¡Blanda y esponjosa!' },
  { nombre: 'Un Corazón', emoji: '❤️', pista: 'Dibuja un corazón de color rojo. ¡Mándale amor!' },
];

// Paleta de colores (español, kid-friendly)
const PALETA: { color: string; nombre: string }[] = [
  { color: '#000000', nombre: 'Negro' },
  { color: '#FF6B6B', nombre: 'Rojo' },
  { color: '#48DBFB', nombre: 'Azul' },
  { color: '#6BCB77', nombre: 'Verde' },
  { color: '#FFD93D', nombre: 'Amarillo' },
  { color: '#FF9F43', nombre: 'Naranja' },
  { color: '#A29BFE', nombre: 'Morado' },
  { color: '#FF6BAA', nombre: 'Rosa' },
  { color: '#8B5E3C', nombre: 'Marrón' },
  { color: '#95A5A6', nombre: 'Gris' },
  { color: '#1ABC9C', nombre: 'Turquesa' },
  { color: '#FFFFFF', nombre: 'Blanco' }, // Borrador
];

// ============================================
// PERSISTENCIA
// ============================================

function cargarProgreso(): number[] {
  try {
    const d = localStorage.getItem('pizarra-progreso');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarProgreso(c: number[]): void {
  try { localStorage.setItem('pizarra-progreso', JSON.stringify(c)); } catch { /* */ }
}

function cargarGaleria(): string[] {
  try {
    const d = localStorage.getItem('pizarra-galeria');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function guardarGaleria(imgs: string[]): void {
  try { localStorage.setItem('pizarra-galeria', JSON.stringify(imgs.slice(-8))); } catch { /* */ }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

type Pantalla = 'inicio' | 'mapa' | 'dibujo';

export default function PizarraMagicaGame() {
  const navigate = useNavigate();
  const { agregarMonedas, agregarPuntos, agregarEstrellas, sonidoActivo, alternarSonido } = useChildStore();
  const { registrarAcierto } = useGameProgress({ juegoId: 'pizarra-magica' });

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [nivelActual, setNivelActual] = useState(1);
  const [completados, setCompletados] = useState<number[]>(() => cargarProgreso());
  const [galeria, setGaleria] = useState<string[]>(() => cargarGaleria());
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  // Canvas state
  const [colorActual, setColorActual] = useState('#000000');
  const [grosor, setGrosor] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const paintingRef = useRef(false);

  useEffect(() => { setVozActiva(sonidoActivo); }, [sonidoActivo]);
  useEffect(() => () => detenerVoz(), []);
  useEffect(() => { guardarProgreso(completados); }, [completados]);
  useEffect(() => { guardarGaleria(galeria); }, [galeria]);

  const config = TAREAS[nivelActual - 1];

  // ============================================
  // CANVAS SETUP (cuando entramos a dibujar)
  // ============================================

  useEffect(() => {
    if (pantalla !== 'dibujo') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configurar tamaño interno (800x400 logical)
    canvas.width = 800;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    // Helpers
    const getPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return { x: 0, y: 0 };
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      paintingRef.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = colorActual;
      ctx.lineWidth = grosor;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!paintingRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.strokeStyle = colorActual;
      ctx.lineWidth = grosor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDraw = () => {
      paintingRef.current = false;
      ctx.beginPath();
    };

    // Mouse listeners
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);

    // Touch listeners (mobile)
    canvas.addEventListener('touchstart', startDraw, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('mouseout', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', endDraw);
    };
  }, [pantalla, nivelActual, colorActual, grosor]);

  // ============================================
  // CANVAS ACTIONS
  // ============================================

  const seleccionarColor = useCallback((color: string) => {
    playClic();
    setColorActual(color);
    const p = PALETA.find(c => c.color === color);
    if (p) hablar(p.nombre, { velocidad: 0.9 });
  }, []);

  const borrarTodo = useCallback(() => {
    playClic();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      hablar('Lienzo limpio. ¡Empieza de nuevo!', { velocidad: 0.85 });
    }
  }, []);

  const guardarDibujo = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setGaleria(prev => [...prev, dataUrl]);
      playExito();
      hablar('¡Dibujo guardado! Mira tu galería.', { velocidad: 0.85 });
    }
  }, []);

  const borrarGaleriaItem = useCallback((index: number) => {
    setGaleria(prev => prev.filter((_, i) => i !== index));
    playClic();
  }, []);

  const terminarDibujo = useCallback(() => {
    playNivelCompleto();
    agregarMonedas(15);
    agregarPuntos(30);
    agregarEstrellas(1);
    registrarAcierto(nivelActual);
    setCompletados(prev => prev.includes(nivelActual) ? prev : [...prev, nivelActual]);
    setMostrarCelebracion(true);
    hablar(`¡Nivel ${nivelActual} completado! ¡Tu dibujo de ${config.nombre} está genial!`, { velocidad: 0.85 });
  }, [nivelActual, config, agregarMonedas, agregarPuntos, agregarEstrellas, registrarAcierto]);

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const iniciarNivel = useCallback((numero: number) => {
    const tarea = TAREAS[numero - 1];
    if (!tarea) return;
    playClic();
    setNivelActual(numero);
    setColorActual('#000000');
    setGrosor(8);
    setPantalla('dibujo');
    setMostrarCelebracion(false);

    hablar(`Nivel ${numero}. Dibuja ${tarea.nombre}. ${tarea.pista}`, { velocidad: 0.82 });
  }, []);

  const irSiguienteNivel = useCallback(() => {
    const sig = nivelActual + 1;
    if (sig <= TAREAS.length) iniciarNivel(sig);
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
    return TAREAS.map((_, idx) => {
      const numero = idx + 1;
      let estado: 'completado' | 'actual' | 'bloqueado' = 'bloqueado';
      if (completados.includes(numero)) estado = 'completado';
      else {
        const sig = TAREAS.findIndex((_, i) => !completados.includes(i + 1));
        if (sig + 1 === numero) estado = 'actual';
      }
      return { numero, estado };
    });
  }, [completados]);

  const siguienteDisponible = useMemo(() => {
    const sig = TAREAS.findIndex((_, i) => !completados.includes(i + 1));
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
                if (pantalla === 'dibujo') volverAlMapa();
                else salir();
              }}
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="game-title text-xl sm:text-2xl flex items-center gap-2">
                <span className="text-2xl">🖌️</span> Pizarra Mágica
              </h1>
              {pantalla === 'dibujo' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-purple-500/20 text-purple-300 rounded-full px-2.5 py-0.5 text-xs font-bold border border-purple-500/30">
                    Nivel {nivelActual}
                  </span>
                  <span className="text-white/60 text-xs">{config?.nombre}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300 text-sm">
              {completados.length}/{TAREAS.length}
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
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-8xl">🖌️</span>
              </motion.div>
              <h2 className="game-title text-3xl sm:text-4xl mb-3">¡Pizarra Mágica!</h2>
              <p className="text-slate-300 text-lg mb-2">
                Dibuja y pinta lo que quieras
              </p>
              <p className="text-slate-400 text-sm mb-8">
                {TAREAS.length} tareas · Aprende a usar el mouse ✏️
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

          {/* ===== MAPA DE TAREAS ===== */}
          {pantalla === 'mapa' && (
            <motion.div
              key="mapa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="game-title text-2xl sm:text-3xl mb-2 text-center">Elige qué dibujar</h2>
              <p className="text-slate-400 text-sm mb-6 text-center">Cada tarea tiene un dibujo diferente</p>

              {/* Grilla de tareas */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 max-w-3xl w-full mb-8">
                {nivelesMapa.map((nivel, idx) => {
                  const tarea = TAREAS[idx];
                  return (
                    <motion.button
                      key={nivel.numero}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03, type: 'spring', bounce: 0.4 }}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                        nivel.estado === 'completado'
                          ? 'bg-game-surface border-2 border-transparent hover:border-purple-400/50'
                          : nivel.estado === 'actual'
                          ? 'bg-game-surface border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                          : 'bg-game-surface/40 border-2 border-transparent opacity-50'
                      }`}
                      onClick={() => { if (nivel.estado !== 'bloqueado') iniciarNivel(nivel.numero); }}
                      whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
                      whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
                      disabled={nivel.estado === 'bloqueado'}
                    >
                      <span className="text-3xl sm:text-4xl">{tarea.emoji}</span>
                      <span className="text-white/80 text-xs font-bold">{tarea.nombre}</span>
                      <div className="h-4 flex items-center justify-center text-xs">
                        {nivel.estado === 'completado' ? '✅' : nivel.estado === 'actual' ? '▶️' : '🔒'}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {siguienteDisponible && (
                <motion.button
                  className="btn-inicial text-lg px-8 py-3"
                  onClick={() => iniciarNivel(siguienteDisponible)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶ Siguiente: {TAREAS[siguienteDisponible - 1].nombre}
                </motion.button>
              )}

              {/* Galería */}
              {galeria.length > 0 && (
                <div className="w-full max-w-3xl mt-10">
                  <h3 className="text-white text-lg font-bold text-center mb-4">🖼️ Mis Últimos Dibujos</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {galeria.slice(-6).reverse().map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={img}
                          alt={`Dibujo ${i + 1}`}
                          className="w-24 h-16 object-cover rounded-lg border border-white/20"
                        />
                        <button
                          onClick={() => borrarGaleriaItem(galeria.length - 1 - i)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== DIBUJO ===== */}
          {pantalla === 'dibujo' && config && (
            <motion.div
              key={`dibujo-${nivelActual}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              {/* Banner de tarea */}
              <div className="bg-purple-500/20 border-2 border-purple-400/40 rounded-2xl p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl">{config.emoji}</span>
                  <div>
                    <p className="text-white text-xl font-bold game-title">{config.nombre}</p>
                    <p className="text-slate-300 text-sm mt-1">{config.pista}</p>
                  </div>
                </div>
              </div>

              {/* Paleta de colores */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-3 mb-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {PALETA.map((p) => (
                    <button
                      key={p.color}
                      onClick={() => seleccionarColor(p.color)}
                      className={`w-10 h-10 rounded-xl border-4 transition-all ${
                        colorActual === p.color
                          ? 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-110'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: p.color }}
                      title={p.nombre}
                    />
                  ))}
                </div>
              </div>

              {/* Grosor */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-white/70 text-sm font-bold">✏️ Grosor:</span>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={grosor}
                  onChange={(e) => setGrosor(parseInt(e.target.value))}
                  className="w-40"
                />
                <span className="text-white/70 text-sm font-mono">{grosor}px</span>
              </div>

              {/* Canvas */}
              <div className="bg-white rounded-2xl border-4 border-white/20 overflow-hidden shadow-2xl">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto block cursor-crosshair"
                  style={{ aspectRatio: '2/1' }}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                <motion.button
                  onClick={borrarTodo}
                  className="px-5 py-3 rounded-xl bg-slate-600/60 hover:bg-slate-600 text-white font-bold flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗑️ Borrar Todo
                </motion.button>
                <motion.button
                  onClick={guardarDibujo}
                  className="px-5 py-3 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-bold flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💾 Guardar
                </motion.button>
                <motion.button
                  onClick={terminarDibujo}
                  className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✅ Terminar
                </motion.button>
                <motion.button
                  onClick={() => { playClic(); setPantalla('mapa'); }}
                  className="px-5 py-3 rounded-xl bg-slate-600/40 hover:bg-slate-600/60 text-slate-300 font-bold flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📋 Otras Tareas
                </motion.button>
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
            total={TAREAS.length}
            onSiguiente={irSiguienteNivel}
            onMapa={volverAlMapa}
          />
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
              backgroundColor: ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#eab308'][i % 5],
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
          🖌️
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-purple-300"
          style={{ textShadow: '0 0 30px rgba(168,85,247,0.5)' }}
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
            Ver otras tareas
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
