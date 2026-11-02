// ============================================
// GAME PAGE - Contenedor de juegos
// Aquí se monta cada juego según su ID
// ============================================

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { getJuegoById } from '../../constants/games';
import { useChildStore } from '../../stores/childStore';

// Importar juegos (se irán agregando uno por uno)
import AprendeUsarGame from '../../components/child/games/AprendeUsarGame';
import PintaLaCompuGame from '../../components/child/games/PintaLaCompuGame';
import LaberintoGame from '../../components/child/games/LaberintoGame';
import ClasificaGame from '../../components/child/games/ClasificaGame';
import CarreraGame from '../../components/child/games/CarreraGame';
import PizarraMagicaGame from '../../components/child/games/PizarraMagicaGame';
import ApuntaYGanaGame from '../../components/child/games/ApuntaYGanaGame';
import CopiaYJuegaGame from '../../components/child/games/CopiaYJuegaGame';
import ColoresDelMundoGame from '../../components/child/games/ColoresDelMundoGame';

export default function GamePage() {
  const { juegoId } = useParams<{ juegoId: string }>();
  const navigate = useNavigate();
  const { monedas, nivel, sonidoActivo, alternarSonido, fondoActivo } = useChildStore();

  const juego = juegoId ? getJuegoById(juegoId) : undefined;

  const CLASE_FONDO: Record<string, string> = {
    'azul-oscuro': 'bg-fondo-azul',
    'rosa': 'bg-fondo-rosa',
    'verde': 'bg-fondo-verde',
    'naranja': 'bg-fondo-naranja',
    'morado': 'bg-fondo-morado',
  };
  const claseFondo = CLASE_FONDO[fondoActivo] || 'bg-fondo-azul';

  // Si el juego no existe
  if (!juego) {
    return (
      <div className={`game-bg ${claseFondo} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-6xl">❓</span>
          <h1 className="game-title text-3xl mt-4">Juego no encontrado</h1>
          <p className="text-slate-400 mt-2">Este juego no existe.</p>
          <button
            className="btn-inicial mt-6"
            onClick={() => navigate('/nino/menu')}
          >
            VOLVER
          </button>
        </div>
      </div>
    );
  }

  // Si el juego aún no está desarrollado
  if (!juego.disponible) {
    return (
      <div className={`game-bg ${claseFondo} min-h-screen flex flex-col`}>
        {/* Header compacto del juego */}
        <GameHeader
          titulo={juego.nombre}
          monedas={monedas}
          nivel={nivel.nombre}
          sonidoActivo={sonidoActivo}
          alternarSonido={alternarSonido}
          onVolver={() => navigate('/nino/menu')}
        />

        {/* Contenido: juego no disponible */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <span className="text-7xl">{juego.icono}</span>
            <h2 className="game-title text-3xl mt-6">{juego.nombre}</h2>
            <p className="text-slate-400 mt-4 text-lg">
              Este juego está en preparación 🚧
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              Tu maestro lo habilitará muy pronto. ¡Mientras tanto, prueba los demás juegos!
            </p>
            <button
              className="btn-inicial mt-8"
              onClick={() => navigate('/nino/menu')}
            >
              VOLVER A MIS JUEGOS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // JUEGO DISPONIBLE - Montar componente
  // ============================================
  // Cuando cada juego se desarrolle, se importa arriba y se renderiza aquí.

  if (juego.id === 'aprende-usar') {
    return <AprendeUsarGame />;
  }

  if (juego.id === 'pinta-la-compu') {
    return <PintaLaCompuGame />;
  }

  if (juego.id === 'laberinto') {
    return <LaberintoGame />;
  }

  if (juego.id === 'clasifica') {
    return <ClasificaGame />;
  }

  if (juego.id === 'carrera') {
    return <CarreraGame />;
  }

  if (juego.id === 'pizarra-magica') {
    return <PizarraMagicaGame />;
  }

  if (juego.id === 'apunta-y-gana') {
    return <ApuntaYGanaGame />;
  }

  if (juego.id === 'copia-y-juega') {
    return <CopiaYJuegaGame />;
  }

  if (juego.id === 'colores-del-mundo') {
    return <ColoresDelMundoGame />;
  }

  return (
    <div className={`game-bg ${claseFondo} min-h-screen flex flex-col`}>
      <GameHeader
        titulo={juego.nombre}
        monedas={monedas}
        nivel={nivel.nombre}
        sonidoActivo={sonidoActivo}
        alternarSonido={alternarSonido}
        onVolver={() => navigate('/nino/menu')}
      />

      {/* Placeholder mientras se desarrolla el juego */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <Gamepad2 size={64} className="text-game-purple mx-auto" />
          <h2 className="game-title text-2xl mt-4">¡{juego.nombre}!</h2>
          <p className="text-slate-400 mt-2">
            El juego se cargará aquí. 🎮
          </p>
          <p className="text-slate-500 mt-1 text-sm">
            (Componente pendiente de montar)
          </p>
          <button
            className="btn-inicial mt-6"
            onClick={() => navigate('/nino/menu')}
          >
            VOLVER
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HEADER COMPACTO PARA PANTALLA DE JUEGO
// ============================================

interface GameHeaderProps {
  titulo: string;
  monedas: number;
  nivel: string;
  sonidoActivo: boolean;
  alternarSonido: () => void;
  onVolver: () => void;
}

function GameHeader({
  titulo,
  monedas,
  nivel,
  sonidoActivo,
  alternarSonido,
  onVolver,
}: GameHeaderProps) {
  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Izquierda: Volver + Título */}
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={onVolver} title="Volver">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="game-title text-xl sm:text-2xl">{titulo}</h1>
            <span className="level-badge text-xs">
              🌱 {nivel}
            </span>
          </div>
        </div>

        {/* Derecha: Monedas + Sonido */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="coin-pill">
            <span className="coin-icon" aria-hidden="true" />
            <span>{monedas}</span>
          </div>
          <button className="icon-btn" onClick={alternarSonido} title="Sonido">
            {sonidoActivo ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
}
