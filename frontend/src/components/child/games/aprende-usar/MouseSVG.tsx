// ============================================
// ILUSTRACIÓN SVG DEL MOUSE
// Vectorial = se ve nítida en cualquier tamaño
// ============================================

interface MouseSVGProps {
  /** Tamaño en píxeles */
  size?: number;
  /** Resaltar botón izquierdo (para nivel 4) */
  resaltarIzquierdo?: boolean;
  /** Resaltar botón derecho */
  resaltarDerecho?: boolean;
  /** Estado de clic (para animación) */
  clicando?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export default function MouseSVG({
  size = 200,
  resaltarIzquierdo = false,
  resaltarDerecho = false,
  clicando = false,
  className = '',
}: MouseSVGProps) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 140 196"
      className={className}
      style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
    >
      {/* Cuerpo del mouse */}
      <rect
        x="10" y="10" width="120" height="176" rx="60"
        fill="#e8eaf0"
        stroke="#2d2d4a"
        strokeWidth="6"
      />

      {/* Sombra interna superior */}
      <rect
        x="22" y="22" width="96" height="70" rx="48"
        fill="#f5f6fa"
      />

      {/* Línea divisoria central (botones) */}
      <line
        x1="70" y1="14" x2="70" y2="88"
        stroke="#2d2d4a"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Botón IZQUIERDO */}
      <path
        d="M 16 65 Q 16 16 70 14 L 70 88 Q 30 88 16 65 Z"
        fill={resaltarIzquierdo ? '#4dd0ff' : '#ffffff'}
        stroke={resaltarIzquierdo ? '#2ba8d8' : '#d0d3de'}
        strokeWidth="3"
        style={{
          transition: 'fill 0.3s ease',
          filter: clicando && resaltarIzquierdo
            ? 'brightness(0.85)'
            : 'none',
        }}
      />

      {/* Botón DERECHO */}
      <path
        d="M 124 65 Q 124 16 70 14 L 70 88 Q 110 88 124 65 Z"
        fill={resaltarDerecho ? '#4dd0ff' : '#ffffff'}
        stroke={resaltarDerecho ? '#2ba8d8' : '#d0d3de'}
        strokeWidth="3"
        style={{
          transition: 'fill 0.3s ease',
          filter: clicando && resaltarDerecho
            ? 'brightness(0.85)'
            : 'none',
        }}
      />

      {/* Rueda (scroll) */}
      <rect
        x="60" y="34" width="20" height="34" rx="10"
        fill="#a0a4b8"
        stroke="#2d2d4a"
        strokeWidth="4"
      />
      {/* Líneas de la rueda */}
      <line x1="64" y1="44" x2="76" y2="44" stroke="#7a7d90" strokeWidth="2" strokeLinecap="round" />
      <line x1="64" y1="51" x2="76" y2="51" stroke="#7a7d90" strokeWidth="2" strokeLinecap="round" />
      <line x1="64" y1="58" x2="76" y2="58" stroke="#7a7d90" strokeWidth="2" strokeLinecap="round" />

      {/* Parte inferior (base) */}
      <rect
        x="22" y="100" width="96" height="70" rx="48"
        fill="#d5d8e3"
      />

      {/* Cable arriba (opcional, parte superior) */}
      <path
        d="M 70 10 Q 70 -10 90 -10"
        fill="none"
        stroke="#2d2d4a"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Indicador de luz LED (verde cuando activo) */}
      <circle
        cx="70" cy="130" r="6"
        fill={resaltarIzquierdo || resaltarDerecho ? '#22c55e' : '#c4c7d4'}
        style={{ transition: 'fill 0.3s ease' }}
      />
    </svg>
  );
}
