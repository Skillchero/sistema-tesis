// ============================================
// MAPA DE NIVELES
// 25 niveles únicos, 7 mecánicas del mouse
// ============================================

import { motion } from 'framer-motion';
import { Lock, Check, Play } from 'lucide-react';

export interface NivelInfo {
  numero: number;
  estado: 'completado' | 'actual' | 'bloqueado';
}

interface NivelMapProps {
  niveles: NivelInfo[];
  totalCompletados: number;
  totalNiveles: number;
  onSeleccionarNivel: (numero: number) => void;
}

export default function NivelMap({
  niveles,
  totalCompletados,
  totalNiveles,
  onSeleccionarNivel,
}: NivelMapProps) {
  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-center mb-6">
        <span className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-slate-300 text-sm">
          {totalCompletados}/{totalNiveles} completados
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4">
        {niveles.map((nivel, index) => (
          <motion.button
            key={nivel.numero}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, type: 'spring', bounce: 0.4 }}
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              nivel.estado === 'completado'
                ? 'bg-game-surface border-2 border-transparent hover:border-green-400/50'
                : nivel.estado === 'actual'
                ? 'bg-game-surface border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'bg-game-surface/40 border-2 border-transparent opacity-50'
            }`}
            onClick={() => {
              if (nivel.estado !== 'bloqueado') {
                onSeleccionarNivel(nivel.numero);
              }
            }}
            whileHover={nivel.estado !== 'bloqueado' ? { scale: 1.05 } : {}}
            whileTap={nivel.estado !== 'bloqueado' ? { scale: 0.95 } : {}}
            disabled={nivel.estado === 'bloqueado'}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-lg sm:text-xl ${
                nivel.estado === 'completado'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : nivel.estado === 'actual'
                  ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500'
                  : 'bg-slate-700/60'
              }`}
            >
              {nivel.numero}
            </div>

            <div className="h-5 flex items-center justify-center">
              {nivel.estado === 'completado' && (
                <span className="bg-green-500 rounded-md p-0.5">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
              )}
              {nivel.estado === 'actual' && (
                <Play size={16} className="text-white" fill="white" />
              )}
              {nivel.estado === 'bloqueado' && (
                <Lock size={14} className="text-yellow-500/70" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CONFIGURACIÓN DE 25 NIVELES ÚNICOS
// 7 mecánicas × dificultad creciente
// Sin actividades repetidas
// ============================================

import type { Mecanica } from './Niveles';

export interface ConfigNivel {
  numero: number;
  mecanica: Mecanica;
  objetivos: number;
  dificultad: number;
}

export function generarConfigNiveles(): ConfigNivel[] {
  return [
    // ─── FASE 1: APRENDIZAJE (1-7) ───
    // Cada mecánica una vez, dificultad mínima
    { numero: 1,  mecanica: 'clic',           objetivos: 1, dificultad: 1 },
    { numero: 2,  mecanica: 'arrastrar',      objetivos: 1, dificultad: 1 },
    { numero: 3,  mecanica: 'arrastrar-clic', objetivos: 1, dificultad: 1 },
    { numero: 4,  mecanica: 'clic-izquierdo', objetivos: 3, dificultad: 1 },
    { numero: 5,  mecanica: 'clic-derecho',   objetivos: 1, dificultad: 1 },
    { numero: 6,  mecanica: 'doble-clic',     objetivos: 1, dificultad: 1 },
    { numero: 7,  mecanica: 'mover',          objetivos: 3, dificultad: 1 },

    // ─── FASE 2: PRÁCTICA (8-14) ───
    // Más objetos, algo más de dificultad
    { numero: 8,  mecanica: 'clic',           objetivos: 2, dificultad: 2 },
    { numero: 9,  mecanica: 'arrastrar',      objetivos: 1, dificultad: 2 },
    { numero: 10, mecanica: 'clic-derecho',   objetivos: 2, dificultad: 2 },
    { numero: 11, mecanica: 'doble-clic',     objetivos: 2, dificultad: 2 },
    { numero: 12, mecanica: 'clic-izquierdo', objetivos: 5, dificultad: 2 },
    { numero: 13, mecanica: 'mover',          objetivos: 5, dificultad: 2 },
    { numero: 14, mecanica: 'arrastrar-clic', objetivos: 1, dificultad: 2 },

    // ─── FASE 3: RETO (15-20) ───
    // Más objetos, distancia mayor, más precisión
    { numero: 15, mecanica: 'clic',           objetivos: 3, dificultad: 3 },
    { numero: 16, mecanica: 'clic-derecho',   objetivos: 3, dificultad: 3 },
    { numero: 17, mecanica: 'arrastrar',      objetivos: 1, dificultad: 3 },
    { numero: 18, mecanica: 'doble-clic',     objetivos: 3, dificultad: 3 },
    { numero: 19, mecanica: 'clic-izquierdo', objetivos: 6, dificultad: 3 },
    { numero: 20, mecanica: 'mover',          objetivos: 7, dificultad: 3 },

    // ─── FASE 4: MAESTRÍA (21-25) ───
    // Máxima dificultad
    { numero: 21, mecanica: 'arrastrar',      objetivos: 1, dificultad: 4 },
    { numero: 22, mecanica: 'arrastrar-clic', objetivos: 1, dificultad: 4 },
    { numero: 23, mecanica: 'clic-derecho',   objetivos: 4, dificultad: 4 },
    { numero: 24, mecanica: 'doble-clic',     objetivos: 4, dificultad: 4 },
    { numero: 25, mecanica: 'mover',          objetivos: 9, dificultad: 4 },
  ];
}
