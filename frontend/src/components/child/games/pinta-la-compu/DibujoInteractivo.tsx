// ============================================
// DIBUJO INTERACTIVO - Renderiza SVGs de niveles
// Maneja clics y pista al pasar el mouse (hover)
// Usa event delegation en React (confiable)
// ============================================

import { useEffect, useRef, useCallback } from 'react';

interface Props {
  /** Contenido SVG interno (sin tags <svg>) */
  svg: string;
  /** Si es la referencia META (todos los colores pre-cargados, sin interacción) */
  esReferencia?: boolean;
  /** Colores actuales: índice de parte → hex o null */
  coloresPartes: (string | null)[];
  /** Callback al hacer clic en una parte */
  onClicParte: (idx: number) => void;
  /** Callback al hacer hover sobre una parte (idx o null al salir) */
  onHoverParte?: (idx: number | null) => void;
}

/**
 * Renderiza un SVG de nivel con manejo de eventos via delegation.
 * Los elementos con class="ps" son partes pintables.
 * El atributo data-c indica el índice de color objetivo.
 */
export default function DibujoInteractivo({
  svg,
  esReferencia = false,
  coloresPartes,
  onClicParte,
  onHoverParte,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Asignar índices a las partes después de renderizar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const partes = container.querySelectorAll<SVGElement>('.ps');
    partes.forEach((parte, idx) => {
      parte.dataset.partIdx = String(idx);
      // Estilos base
      if (esReferencia) {
        parte.style.stroke = '#555';
        parte.style.strokeWidth = '2';
        parte.style.pointerEvents = 'none';
        // El fill viene del SVG via aplicarColoresMeta
      } else {
        parte.style.stroke = '#333333';
        parte.style.strokeWidth = '3';
        parte.style.cursor = 'pointer';
        parte.style.transition = 'fill 0.3s, stroke 0.2s, filter 0.2s';
        // Aplicar color actual
        const colorActual = coloresPartes[idx];
        parte.style.fill = colorActual || '#ffffff';
      }
    });
  }, [svg, coloresPartes, esReferencia]);

  // Handlers via React event delegation en el container
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    if (!target.classList?.contains('ps')) return;
    const idx = Number(target.dataset.partIdx);
    if (!Number.isNaN(idx)) onClicParte(idx);
  }, [onClicParte]);

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (esReferencia) return;
    const target = e.target as SVGElement;
    if (!target.classList?.contains('ps')) return;
    // Efecto hover visual
    target.style.filter = 'brightness(0.96)';
    target.style.stroke = '#e84393';
    target.style.strokeWidth = '4';
    const idx = Number(target.dataset.partIdx);
    if (!Number.isNaN(idx)) onHoverParte?.(idx);
  }, [esReferencia, onHoverParte]);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (esReferencia) return;
    const target = e.target as SVGElement;
    if (!target.classList?.contains('ps')) return;
    // Quitar efecto hover
    target.style.filter = '';
    target.style.stroke = '#333333';
    target.style.strokeWidth = '3';
    onHoverParte?.(null);
  }, [esReferencia, onHoverParte]);

  // Renderizar SVG con colores META pre-cargados para referencia
  const contenidoSvg = esReferencia
    ? aplicarColoresMeta(svg)
    : svg;

  return (
    <div
      ref={containerRef}
      className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
      onClick={esReferencia ? undefined : handleClick}
      onMouseOver={esReferencia ? undefined : handleMouseOver}
      onMouseOut={esReferencia ? undefined : handleMouseOut}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">${contenidoSvg}</svg>`,
      }}
    />
  );
}

/**
 * Aplica los colores objetivo a todas las partes .ps del SVG (para referencia META)
 */
function aplicarColoresMeta(svg: string): string {
  return svg.replace(
    /class="ps"\s+data-c="(\d+)"/g,
    (_match, colorIdx) => {
      const hex = PALETA_META[Number(colorIdx)] || '#ffffff';
      return `class="ps" data-c="${colorIdx}" style="fill:${hex}"`;
    }
  );
}

// Paleta para la referencia META (mismo orden que PALETA_PINTA)
const PALETA_META = [
  '#FF6B6B', // 0 Rojo
  '#48DBFB', // 1 Azul
  '#FFD93D', // 2 Amarillo
  '#6BCB77', // 3 Verde
  '#A29BFE', // 4 Morado
  '#636e72', // 5 Gris
];
