// ============================================
// DIBUJOS SVG PARA "PINTA LA COMPÚ"
// Cada dibujo tiene partes clicables que se pintan
// ============================================

interface DibujoProps {
  /** Colores actuales de cada parte (id → color o null) */
  colores: Record<string, string | null>;
  /** Callback al hacer clic en una parte */
  onClicParte: (id: string) => void;
}

// Estilo común para partes clicables
const estiloParte = {
  cursor: 'pointer',
  transition: 'fill 0.3s ease, stroke 0.3s ease',
};

// ============================================
// DIBUJO 1: MONITOR
// Partes: marco, pantalla, base, pie
// ============================================

export function DibujoMonitor({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Marco */}
      <rect
        x="40" y="15" width="320" height="220" rx="16"
        fill={c('marco')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('marco')}
      />
      {/* Pantalla */}
      <rect
        x="65" y="38" width="270" height="174" rx="6"
        fill={c('pantalla')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('pantalla')}
      />
      {/* Base (tija) */}
      <rect
        x="168" y="235" width="64" height="42"
        fill={c('base')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('base')}
      />
      {/* Pie */}
      <rect
        x="125" y="277" width="150" height="22" rx="11"
        fill={c('pie')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('pie')}
      />
      {/* Detalle: brillo en pantalla */}
      <rect
        x="80" y="52" width="80" height="50" rx="4"
        fill="rgba(255,255,255,0.15)" pointerEvents="none"
      />
    </svg>
  );
}

// ============================================
// DIBUJO 2: TECLADO
// Partes: base, teclas, espacio, borde
// ============================================

export function DibujoTeclado({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';

  // Generar teclas decorativas
  const teclas = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 12; col++) {
      teclas.push(
        <rect
          key={`${row}-${col}`}
          x={42 + col * 28} y={42 + row * 28}
          width="22" height="22" rx="4"
          fill={c('teclas')} stroke="#1e1b4b" strokeWidth="2"
          style={estiloParte}
          onClick={() => onClicParte('teclas')}
        />
      );
    }
  }

  return (
    <svg viewBox="0 0 400 200" className="w-full h-full max-h-60">
      {/* Base del teclado */}
      <rect
        x="15" y="15" width="370" height="170" rx="14"
        fill={c('base')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('base')}
      />
      {/* Área de teclas (fondo) */}
      <rect
        x="32" y="32" width="348" height="100" rx="8"
        fill={c('teclas')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('teclas')}
      />
      {/* Teclas decorativas (solo visual, no clic) */}
      {teclas}
      {/* Barra espaciadora */}
      <rect
        x="90" y="145" width="220" height="24" rx="12"
        fill={c('espacio')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('espacio')}
      />
    </svg>
  );
}

// ============================================
// DIBUJO 3: MOUSE
// Partes: cuerpo, botones, rueda
// ============================================

export function DibujoMouse({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Cuerpo */}
      <ellipse
        cx="200" cy="190" rx="110" ry="140"
        fill={c('cuerpo')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('cuerpo')}
      />
      {/* Botón izquierdo */}
      <path
        d="M 95 130 Q 95 55 200 50 L 200 160 Q 130 160 95 130 Z"
        fill={c('botones')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('botones')}
      />
      {/* Botón derecho */}
      <path
        d="M 305 130 Q 305 55 200 50 L 200 160 Q 270 160 305 130 Z"
        fill={c('botones')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('botones')}
      />
      {/* Rueda */}
      <rect
        x="188" y="80" width="24" height="44" rx="12"
        fill={c('rueda')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('rueda')}
      />
      {/* Líneas de la rueda */}
      <line x1="194" y1="92" x2="206" y2="92" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" pointerEvents="none" />
      <line x1="194" y1="102" x2="206" y2="102" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" pointerEvents="none" />
      <line x1="194" y1="112" x2="206" y2="112" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" pointerEvents="none" />
    </svg>
  );
}

// ============================================
// DIBUJO 4: COMPUTADORA COMPLETA
// Partes: monitor_marco, monitor_pantalla, monitor_base, teclado, teclas, mouse_cuerpo, mouse_botones
// ============================================

export function DibujoCompleta({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 500 360" className="w-full h-full max-h-80">
      {/* === MONITOR === */}
      {/* Marco del monitor */}
      <rect
        x="100" y="10" width="300" height="190" rx="14"
        fill={c('monitor_marco')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('monitor_marco')}
      />
      {/* Pantalla */}
      <rect
        x="120" y="30" width="260" height="150" rx="5"
        fill={c('monitor_pantalla')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('monitor_pantalla')}
      />
      {/* Tija del monitor */}
      <rect
        x="225" y="200" width="50" height="28"
        fill={c('monitor_base')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('monitor_base')}
      />
      {/* === TECLADO === */}
      <rect
        x="60" y="260" width="280" height="70" rx="10"
        fill={c('teclado')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('teclado')}
      />
      {/* Teclas decorativas */}
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <rect
            key={`t-${row}-${col}`}
            x={75 + col * 26} y={268 + row * 20}
            width="20" height="15" rx="3"
            fill={c('teclas')} stroke="#1e1b4b" strokeWidth="1.5"
            style={estiloParte}
            onClick={() => onClicParte('teclas')}
          />
        ))
      )}
      {/* === MOUSE === */}
      <ellipse
        cx="430" cy="285" rx="35" ry="48"
        fill={c('mouse_cuerpo')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('mouse_cuerpo')}
      />
      {/* Botones del mouse */}
      <path
        d="M 400 260 Q 400 240 430 238 L 430 275 Q 412 275 400 260 Z"
        fill={c('mouse_botones')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('mouse_botones')}
      />
      <path
        d="M 460 260 Q 460 240 430 238 L 430 275 Q 448 275 460 260 Z"
        fill={c('mouse_botones')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('mouse_botones')}
      />
      {/* Rueda del mouse */}
      <rect
        x="426" y="248" width="8" height="16" rx="4"
        fill={c('mouse_rueda')} stroke="#1e1b4b" strokeWidth="1.5"
        style={estiloParte}
        onClick={() => onClicParte('mouse_rueda')}
      />
    </svg>
  );
}

// ============================================
// DIBUJO 5: MONITOR CON IMAGEN
// Partes: marco, pantalla, imagen, base, pie
// ============================================

export function DibujoMonitorImagen({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Marco */}
      <rect
        x="40" y="15" width="320" height="220" rx="16"
        fill={c('marco')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('marco')}
      />
      {/* Pantalla (fondo) */}
      <rect
        x="65" y="38" width="270" height="174" rx="6"
        fill={c('pantalla')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('pantalla')}
      />
      {/* Imagen en pantalla (sol) */}
      <circle
        cx="200" cy="100" r="40"
        fill={c('imagen')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('imagen')}
      />
      {/* Rayos del sol (decorativo) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x1 = 200 + Math.cos(angle) * 48;
        const y1 = 100 + Math.sin(angle) * 48;
        const x2 = 200 + Math.cos(angle) * 60;
        const y2 = 100 + Math.sin(angle) * 60;
        return (
          <line
            key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={c('imagen')} strokeWidth="4" strokeLinecap="round"
            pointerEvents="none"
          />
        );
      })}
      {/* Nube decorativa */}
      <ellipse cx="130" cy="170" rx="30" ry="15" fill="rgba(255,255,255,0.3)" pointerEvents="none" />
      <ellipse cx="155" cy="165" rx="22" ry="12" fill="rgba(255,255,255,0.3)" pointerEvents="none" />
      {/* Base */}
      <rect
        x="168" y="235" width="64" height="42"
        fill={c('base')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('base')}
      />
      {/* Pie */}
      <rect
        x="125" y="277" width="150" height="22" rx="11"
        fill={c('pie')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('pie')}
      />
    </svg>
  );
}

// ============================================
// DIBUJO 6: GABINETE / TORRE
// Partes: cuerpo, frente, botones, ventilacion
// ============================================

export function DibujoGabinete({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Cuerpo */}
      <rect
        x="110" y="10" width="180" height="310" rx="12"
        fill={c('cuerpo')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('cuerpo')}
      />
      {/* Frente (placa frontal) */}
      <rect
        x="125" y="25" width="150" height="280" rx="8"
        fill={c('frente')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('frente')}
      />
      {/* Botón de encendido */}
      <circle
        cx="200" cy="55" r="16"
        fill={c('boton')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('boton')}
      />
      {/* Línea de poder */}
      <line x1="200" y1="48" x2="200" y2="62" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" pointerEvents="none" />
      <line x1="194" y1="55" x2="206" y2="55" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" pointerEvents="none" />
      {/* Ranura de CD/DVD */}
      <rect
        x="145" y="90" width="110" height="12" rx="6"
        fill={c('ranura')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('ranura')}
      />
      {/* Ventilación (círculos decorativos) */}
      {[0, 1, 2, 3, 4].map(i => (
        <circle
          key={i}
          cx="170" cy={140 + i * 30} r="10"
          fill={c('ventilacion')} stroke="#1e1b4b" strokeWidth="2"
          style={estiloParte}
          onClick={() => onClicParte('ventilacion')}
        />
      ))}
      {/* Puertos USB (decorativos) */}
      <rect x="155" y="290" width="20" height="8" rx="2" fill="#1e1b4b" pointerEvents="none" />
      <rect x="185" y="290" width="20" height="8" rx="2" fill="#1e1b4b" pointerEvents="none" />
      <rect x="215" y="290" width="20" height="8" rx="2" fill="#1e1b4b" pointerEvents="none" />
    </svg>
  );
}

// ============================================
// DIBUJO 7: PARLA / PANTALLA TABLET
// Partes: marco, pantalla, camara, boton
// ============================================

export function DibujoTablet({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Marco */}
      <rect
        x="80" y="10" width="240" height="310" rx="24"
        fill={c('marco')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('marco')}
      />
      {/* Pantalla */}
      <rect
        x="100" y="40" width="200" height="240" rx="8"
        fill={c('pantalla')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('pantalla')}
      />
      {/* Cámara */}
      <circle
        cx="200" cy="26" r="6"
        fill={c('camara')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('camara')}
      />
      {/* Botón central */}
      <circle
        cx="200" cy="300" r="12"
        fill={c('boton')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('boton')}
      />
    </svg>
  );
}

// ============================================
// DIBUJO 8: AUDÍFONOS
// Partes: banda, auricular_izq, auricular_der, almohadillas
// ============================================

export function DibujoAudifonos({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Banda superior */}
      <path
        d="M 80 180 Q 80 50 200 50 Q 320 50 320 180"
        fill="none"
        stroke={c('banda')} strokeWidth="20" strokeLinecap="round"
        style={estiloParte}
        onClick={() => onClicParte('banda')}
      />
      {/* Auricular izquierdo */}
      <rect
        x="50" y="160" width="60" height="100" rx="20"
        fill={c('auricular_izq')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('auricular_izq')}
      />
      {/* Almohadilla izquierda */}
      <ellipse
        cx="62" cy="210" rx="14" ry="35"
        fill={c('almohadillas')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('almohadillas')}
      />
      {/* Auricular derecho */}
      <rect
        x="290" y="160" width="60" height="100" rx="20"
        fill={c('auricular_der')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('auricular_der')}
      />
      {/* Almohadilla derecha */}
      <ellipse
        cx="338" cy="210" rx="14" ry="35"
        fill={c('almohadillas')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('almohadillas')}
      />
    </svg>
  );
}

// ============================================
// DIBUJO 9: IMPRESORA
// Partes: cuerpo, bandeja, papel, boton
// ============================================

export function DibujoImpresora({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full max-h-80">
      {/* Cuerpo */}
      <rect
        x="60" y="120" width="280" height="140" rx="14"
        fill={c('cuerpo')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('cuerpo')}
      />
      {/* Bandeja superior (entrada) */}
      <rect
        x="90" y="80" width="220" height="45" rx="8"
        fill={c('bandeja')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('bandeja')}
      />
      {/* Papel saliendo */}
      <rect
        x="120" y="50" width="160" height="40" rx="4"
        fill={c('papel')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('papel')}
      />
      {/* Líneas en el papel */}
      <line x1="135" y1="62" x2="265" y2="62" stroke="#1e1b4b" strokeWidth="1.5" pointerEvents="none" />
      <line x1="135" y1="72" x2="245" y2="72" stroke="#1e1b4b" strokeWidth="1.5" pointerEvents="none" />
      <line x1="135" y1="82" x2="255" y2="82" stroke="#1e1b4b" strokeWidth="1.5" pointerEvents="none" />
      {/* Bandeja inferior (salida) */}
      <rect
        x="90" y="262" width="220" height="35" rx="8"
        fill={c('bandeja_inf')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('bandeja_inf')}
      />
      {/* Botón */}
      <circle
        cx="310" cy="140" r="12"
        fill={c('boton')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte}
        onClick={() => onClicParte('boton')}
      />
      {/* Luz LED */}
      <circle cx="280" cy="140" r="5" fill="#22c55e" pointerEvents="none" />
    </svg>
  );
}

// ============================================
// DIBUJO 10: ESCRITORIO COMPLETO
// Partes: monitor, teclado, mouse, gabinete, escritorio, silla
// ============================================

export function DibujoEscritorio({ colores, onClicParte }: DibujoProps) {
  const c = (id: string) => colores[id] || '#d4d4d8';
  return (
    <svg viewBox="0 0 500 360" className="w-full h-full max-h-80">
      {/* Escritorio (mesa) */}
      <rect
        x="20" y="230" width="460" height="18" rx="6"
        fill={c('escritorio')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('escritorio')}
      />
      {/* Patas del escritorio */}
      <rect x="50" y="248" width="16" height="80" fill={c('escritorio')} stroke="#1e1b4b" strokeWidth="2" pointerEvents="none" />
      <rect x="434" y="248" width="16" height="80" fill={c('escritorio')} stroke="#1e1b4b" strokeWidth="2" pointerEvents="none" />

      {/* Monitor */}
      <rect
        x="130" y="30" width="200" height="130" rx="10"
        fill={c('monitor')} stroke="#1e1b4b" strokeWidth="4"
        style={estiloParte}
        onClick={() => onClicParte('monitor')}
      />
      <rect x="145" y="42" width="170" height="106" rx="4" fill={c('pantalla')} stroke="#1e1b4b" strokeWidth="2"
        style={estiloParte} onClick={() => onClicParte('pantalla')} />
      {/* Tija */}
      <rect x="212" y="160" width="36" height="20" fill={c('monitor')} stroke="#1e1b4b" strokeWidth="2" pointerEvents="none" />

      {/* Teclado */}
      <rect
        x="120" y="195" width="180" height="30" rx="8"
        fill={c('teclado')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('teclado')}
      />

      {/* Mouse */}
      <ellipse
        cx="350" cy="210" rx="22" ry="30"
        fill={c('mouse')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('mouse')}
      />
      <line x1="350" y1="185" x2="350" y2="205" stroke="#1e1b4b" strokeWidth="2" pointerEvents="none" />

      {/* Gabinete debajo del escritorio */}
      <rect
        x="380" y="250" width="80" height="90" rx="8"
        fill={c('gabinete')} stroke="#1e1b4b" strokeWidth="3"
        style={estiloParte}
        onClick={() => onClicParte('gabinete')}
      />
      <circle cx="420" cy="270" r="6" fill={c('gabinete')} stroke="#1e1b4b" strokeWidth="1.5" pointerEvents="none" />
    </svg>
  );
}
