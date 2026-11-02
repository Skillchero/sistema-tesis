// ============================================
// CHILD MENU PAGE - "Mis Juegos"
// Interfaz principal del niño con cuadrícula de juegos
// ============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChildHeader from '../../components/child/ChildHeader';
import GameCard from '../../components/child/GameCard';
import { getJuegosOrdenados } from '../../constants/games';
import { useChildStore } from '../../stores/childStore';
import { getNinoActivo } from '../../services/api';

const CLASE_FONDO: Record<string, string> = {
  'azul-oscuro': 'bg-fondo-azul',
  'rosa': 'bg-fondo-rosa',
  'verde': 'bg-fondo-verde',
  'naranja': 'bg-fondo-naranja',
  'morado': 'bg-fondo-morado',
};

export default function ChildMenuPage() {
  const navigate = useNavigate();
  const { sesionIniciada, fondoActivo } = useChildStore();
  const juegos = getJuegosOrdenados();
  const claseFondo = CLASE_FONDO[fondoActivo] || 'bg-fondo-azul';

  // Verificar que haya un niño seleccionado
  useEffect(() => {
    const ninoId = getNinoActivo();
    if (!ninoId && !sesionIniciada) {
      navigate('/nino/seleccionar');
    }
  }, [sesionIniciada, navigate]);

  // Contar juegos disponibles
  const juegosDisponibles = juegos.filter(j => j.disponible).length;

  return (
    <div className={`game-bg ${claseFondo}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header del niño */}
        <ChildHeader titulo="Mis Juegos" />

        {/* Separador sutil */}
        <div className="mt-6 mb-6 border-t border-white/5" />

        {/* Cuadrícula de juegos: 5 columnas en desktop, responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {juegos.map((juego) => (
            <GameCard key={juego.id} juego={juego} />
          ))}
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {juegosDisponibles === 1
              ? '1 juego disponible · Más juegos próximamente 🎮'
              : `${juegosDisponibles} juegos disponibles · Más juegos próximamente 🎮`}
          </p>

          {/* Enlace para docentes (discreto) */}
          <button
            onClick={() => navigate('/login')}
            className="mt-4 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            👩‍🏫 ¿Eres docente? Entra aquí
          </button>
        </div>
      </div>
    </div>
  );
}
