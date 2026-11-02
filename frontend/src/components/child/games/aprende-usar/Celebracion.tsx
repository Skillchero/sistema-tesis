// ============================================
// PANTALLA DE CELEBRACIÓN
// "¡Nivel Completado!" + recompensa + Siguiente Nivel
// ============================================

import { motion } from 'framer-motion';

interface CelebracionProps {
  /** Número del nivel completado */
  nivelCompletado: number;
  /** Número del siguiente nivel (null si era el último) */
  siguienteNivel: number | null;
  /** Monedas ganadas en este nivel */
  monedasGanadas: number;
  /** Continuar al siguiente nivel */
  onSiguiente: () => void;
  /** Volver al mapa de niveles */
  onVolverAlMapa: () => void;
}

// Confeti simple con partículas
function Confeti() {
  const colores = ['#a855f7', '#06b6d4', '#facc15', '#f472b6', '#22c55e'];
  const particulas = Array.from({ length: 24 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particulas.map((_, i) => {
        const color = colores[i % colores.length];
        const izquierda = (i / particulas.length) * 100;
        const retraso = Math.random() * 0.6;
        const duracion = 1.5 + Math.random() * 1.5;
        const tamano = 6 + Math.random() * 8;

        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${izquierda}%`,
              top: '-5%',
              width: tamano,
              height: tamano * (Math.random() > 0.5 ? 1 : 1.6),
              backgroundColor: color,
            }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0],
              rotate: Math.random() * 720 - 360,
              x: Math.random() * 100 - 50,
            }}
            transition={{
              duration: duracion,
              delay: retraso,
              ease: 'easeIn',
            }}
          />
        );
      })}
    </div>
  );
}

export default function Celebracion({
  nivelCompletado,
  siguienteNivel,
  monedasGanadas,
  onSiguiente,
  onVolverAlMapa,
}: CelebracionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <Confeti />

      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="relative text-center px-6 py-10 max-w-sm w-full"
      >
        {/* Icono de fiesta */}
        <motion.div
          className="text-8xl mb-4 inline-block"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: [0, -10, 10, 0], scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
        >
          🎉
        </motion.div>

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-title text-3xl sm:text-4xl mb-4 text-purple-300"
          style={{ textShadow: '0 0 30px rgba(168,85,247,0.5)' }}
        >
          ¡Nivel Completado!
        </motion.h2>

        {/* Nivel */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-400 mb-5"
        >
          Nivel {nivelCompletado}
        </motion.p>

        {/* Recompensa */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', bounce: 0.6 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-full px-6 py-2.5 mb-8 shadow-lg shadow-orange-500/30"
        >
          <span>+{monedasGanadas}</span>
          <span className="coin-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
        </motion.div>

        {/* Botón Siguiente Nivel (o Volver al mapa si era el último) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {siguienteNivel !== null ? (
            <button
              onClick={onSiguiente}
              className="btn-inicial text-lg px-10 py-3 animate-glow"
            >
              Siguiente Nivel
            </button>
          ) : (
            <button
              onClick={onVolverAlMapa}
              className="btn-inicial text-lg px-10 py-3 animate-glow"
            >
              🏆 ¡Juego Completado!
            </button>
          )}
        </motion.div>

        {/* Link secundario: volver al mapa */}
        {siguienteNivel !== null && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onVolverAlMapa}
            className="block mx-auto mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Ver mapa de niveles
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
