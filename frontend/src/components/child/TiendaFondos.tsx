// ============================================
// COMPONENTE: Tienda de Fondos (Carrito de Recompensas)
// El niño gasta monedas para desbloquear fondos
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useChildStore } from '../../stores/childStore';

const FONDOS: Array<{ id: string; nombre: string; preview: string; precio: number; clase: string }> = [
  { id: 'azul-oscuro', nombre: 'Noche Azul', preview: '🌙', precio: 0, clase: 'bg-fondo-azul' },
  { id: 'rosa', nombre: 'Amanecer Rosa', preview: '🌸', precio: 100, clase: 'bg-fondo-rosa' },
  { id: 'verde', nombre: 'Bosque Verde', preview: '🌲', precio: 150, clase: 'bg-fondo-verde' },
  { id: 'naranja', nombre: 'Atardecer Naranja', preview: '🍊', precio: 200, clase: 'bg-fondo-naranja' },
  { id: 'morado', nombre: 'Galaxia Morada', preview: '🌌', precio: 250, clase: 'bg-fondo-morado' },
];

export default function TiendaFondos({ onClose }: { onClose: () => void }) {
  const [abierta, setAbierta] = useState(true);
  const { monedas, fondosDesbloqueados, fondoActivo, comprarFondo, cambiarFondo } = useChildStore();

  const manejarFondo = (id: string) => {
    const yaDesbloqueado = fondosDesbloqueados.includes(id);
    if (yaDesbloqueado) {
      cambiarFondo(id);
      setAbierta(false);
      setTimeout(() => setAbierta(true), 100);
    } else {
      const ok = comprarFondo(id);
      if (ok) {
        cambiarFondo(id);
        setAbierta(false);
        setTimeout(() => setAbierta(true), 100);
      }
    }
  };

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-game-surface border-2 border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="game-title text-2xl sm:text-3xl">🛒 Tienda de Fondos</h2>
              <button onClick={onClose} className="icon-btn">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="coin-pill mb-2">
                <span className="coin-icon" />
                <span>{monedas}</span>
              </div>
              <p className="text-slate-400 text-xs text-center">Tus monedas para comprar fondos</p>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {FONDOS.map((fondo) => {
                const yaDesbloqueado = fondosDesbloqueados.includes(fondo.id);
                const esActivo = fondoActivo === fondo.id;
                const puedeComprar = monedas >= fondo.precio && !yaDesbloqueado;

                return (
                  <motion.div
                    key={fondo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: FONDOS.indexOf(fondo) * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      esActivo
                        ? 'bg-white/10 border-amber-500/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                    onClick={() => manejarFondo(fondo.id)}
                  >
                    <span className="text-3xl">{fondo.preview}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium truncate">{fondo.nombre}</span>
                        <span className={esActivo ? 'text-amber-400 font-bold' : yaDesbloqueado ? 'text-green-400' : 'text-slate-400'}>
                          {esActivo ? '✅ En uso' : yaDesbloqueado ? 'Desbloqueado' : `${fondo.precio} monedas`}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: yaDesbloqueado || esActivo ? '100%' : Math.min((monedas / fondo.precio) * 100, 100),
                            backgroundColor: esActivo ? '#fbbf24' : yaDesbloqueado ? '#22c55e' : puedeComprar ? '#3b82f6' : '#475569',
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); manejarFondo(fondo.id); }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        esActivo
                          ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                          : yaDesbloqueado
                            ? 'bg-green-500 text-white'
                            : puedeComprar
                              ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!puedeComprar && !yaDesbloqueado && !esActivo}
                    >
                      {esActivo ? 'ACTIVO' : yaDesbloqueado ? 'Usar' : puedeComprar ? 'Comprar' : 'Bloqueado'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center">
                ¡Gasta tus monedas y personaliza tu plataforma! 🎨
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
