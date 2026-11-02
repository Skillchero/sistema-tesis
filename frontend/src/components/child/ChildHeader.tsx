// ============================================
// HEADER DEL NIÑO - "Mis Juegos"
// Avatar + Título + Nivel + Monedas + Botones
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useChildStore } from '../../stores/childStore';
import TiendaFondos from './TiendaFondos';

interface ChildHeaderProps {
  /** Título principal (ej: "Mis Juegos") */
  titulo?: string;
  /** Mostrar botón de volver */
  mostrarVolver?: boolean;
  /** Ruta de retorno */
  rutaVolver?: string;
}

export default function ChildHeader({
  titulo = 'Mis Juegos',
  mostrarVolver = false,
  rutaVolver = '/nino/menu',
}: ChildHeaderProps) {
  const navigate = useNavigate();
  const [abrirTienda, setAbrirTienda] = useState(false);
  const { monedas, nivel, sonidoActivo, alternarSonido, nombreNino } = useChildStore();

  return (<>
    <header className="w-full">
      {/* Fila principal: Avatar + Título/Nivel ... Monedas + Botones */}
      <div className="flex items-center justify-between gap-4">
        {/* Izquierda: Avatar + Título + Nivel */}
        <div className="flex items-center gap-4">
          {/* Avatar con anillo */}
          <div className="avatar-ring shrink-0">
            <div className="avatar-inner">
              <span>👦</span>
            </div>
            {/* Gorrito de graduación superpuesto */}
            <span
              className="absolute -top-1 -right-1 text-xl"
              title="Nivel actual"
            >
              🎓
            </span>
          </div>

          {/* Texto: Título + badge de nivel */}
          <div className="flex flex-col gap-1">
            <h1 className="game-title text-2xl sm:text-3xl md:text-4xl leading-none">
              {titulo}
            </h1>
            <div className="level-badge">
              <span>{nivel.icono}</span>
              <span>{nivel.nombre}</span>
            </div>
          </div>
        </div>

        {/* Derecha: Monedas + Carrito + Sonido + Botón INICIAL */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Píldora de monedas */}
          <div className="coin-pill" title="Tus monedas">
            <span className="coin-icon" aria-hidden="true" />
            <span>{monedas}</span>
          </div>

          {/* Botón carrito (tienda) */}
          <button
            className="icon-btn"
            title="Tienda de fondos"
            onClick={() => setAbrirTienda(true)}
          >
            <ShoppingCart size={20} />
          </button>

          {/* Botón sonido on/off */}
          <button
            className="icon-btn"
            title={sonidoActivo ? 'Silenciar' : 'Activar sonido'}
            onClick={alternarSonido}
          >
            {sonidoActivo ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* Botón INICIAL (nivel actual) */}
          <button
            className="btn-inicial hidden sm:inline-flex"
            title={`Nivel: ${nivel.nombre}`}
            onClick={() => navigate('/nino/menu')}
          >
            INICIAL
          </button>
        </div>
      </div>

      {/* Opcional: botón volver (para pantallas de juego) */}
      {mostrarVolver && (
        <div className="mt-4">
          <button
            className="back-btn"
            onClick={() => navigate(rutaVolver)}
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      )}

      {/* Nombre del niño (debajo del header, sutil) */}
      {nombreNino && (
        <p className="mt-2 text-xs text-slate-400 ml-1">
          Hola, <span className="text-slate-300 font-semibold">{nombreNino}</span> 👋
        </p>
      )}
    </header>

      {/* Tienda de Fondos (carrito de compras) */}
      {abrirTienda && (
        <TiendaFondos onClose={() => setAbrirTienda(false)} />
      )}
    </>
  );
}
