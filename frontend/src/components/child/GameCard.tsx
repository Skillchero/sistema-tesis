// ============================================
// GAMECARD - Tarjeta de juego individual
// ============================================

import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { Juego } from '../../constants/games';

interface GameCardProps {
  juego: Juego;
}

export default function GameCard({ juego }: GameCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (juego.disponible) {
      navigate(`/nino/juego/${juego.id}`);
    } else {
      // Juego aún no desarrollado - mostrar aviso amigable
      alert(`🚧 "${juego.nombre}" estará disponible pronto. ¡Pregunta a tu maestro!`);
    }
  };

  return (
    <button
      className={`game-card ${!juego.disponible ? 'opacity-70' : ''}`}
      onClick={handleClick}
      title={juego.disponible ? `Jugar: ${juego.nombre}` : `${juego.nombre} (próximamente)`}
    >
      {/* Icono/Imagen del juego */}
      <div className="game-card-icon relative">
        {juego.imagenUrl ? (
          <img
            src={juego.imagenUrl}
            alt={juego.nombre}
            className="w-20 h-20 object-contain"
          />
        ) : (
          <span>{juego.icono}</span>
        )}

        {/* Candado si no está disponible */}
        {!juego.disponible && (
          <span className="absolute -bottom-1 -right-1 bg-slate-800/90 rounded-full p-1 border border-slate-600">
            <Lock size={14} className="text-slate-400" />
          </span>
        )}
      </div>

      {/* Nombre del juego */}
      <span className="game-card-name">{juego.nombre}</span>
    </button>
  );
}
