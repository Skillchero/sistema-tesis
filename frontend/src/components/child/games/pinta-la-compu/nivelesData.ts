// ============================================
// 30 NIVELES DE "PINTA LA COMPÚ"
// Basados en el sistema CompuMundos de referencia
// SVGs con class="ps" (parte pintable) y data-c (índice de color)
// ============================================

export interface NivelPintaData {
  numero: number;
  nombre: string;
  /** Contenido interno del SVG (sin tags <svg>) */
  svg: string;
}

/** Paleta de 6 colores - índices usados en data-c */
export const PALETA_PINTA = [
  { nombre: 'Rojo', hex: '#FF6B6B' },
  { nombre: 'Azul', hex: '#48DBFB' },
  { nombre: 'Amarillo', hex: '#FFD93D' },
  { nombre: 'Verde', hex: '#6BCB77' },
  { nombre: 'Morado', hex: '#A29BFE' },
  { nombre: 'Gris', hex: '#636e72' },
];

export const NIVELES_PINTA: NivelPintaData[] = [
  {
    numero: 1, nombre: 'Monitor', svg: `
    <rect x="30" y="10" width="140" height="100" rx="8" class="ps" data-c="5"/>
    <rect x="40" y="20" width="120" height="70" class="ps" data-c="1"/>
    <rect x="85" y="110" width="30" height="25" class="ps" data-c="5"/>
    <polygon points="100,135 60,150 140,150" class="ps" data-c="5"/>
    <circle cx="160" cy="105" r="3" class="ps" data-c="3"/>
  ` },
  {
    numero: 2, nombre: 'Teclado', svg: `
    <rect x="20" y="40" width="160" height="80" rx="8" class="ps" data-c="5"/>
    <rect x="30" y="50" width="20" height="15" rx="2" class="ps" data-c="0"/>
    <rect x="55" y="50" width="20" height="15" rx="2" class="ps" data-c="1"/>
    <rect x="80" y="50" width="20" height="15" rx="2" class="ps" data-c="0"/>
    <rect x="40" y="75" width="120" height="15" rx="2" class="ps" data-c="4"/>
  ` },
  {
    numero: 3, nombre: 'Mouse', svg: `
    <ellipse cx="100" cy="90" rx="45" ry="50" class="ps" data-c="5"/>
    <rect x="90" y="50" width="20" height="25" rx="10" class="ps" data-c="0"/>
    <line x1="100" y1="30" x2="100" y2="50" stroke="#333" stroke-width="2"/>
    <rect x="70" y="95" width="15" height="5" rx="2" class="ps" data-c="1"/>
    <rect x="115" y="95" width="15" height="5" rx="2" class="ps" data-c="3"/>
  ` },
  {
    numero: 4, nombre: 'Laptop', svg: `
    <rect x="35" y="15" width="130" height="85" rx="5" class="ps" data-c="5"/>
    <rect x="45" y="25" width="110" height="60" class="ps" data-c="1"/>
    <path d="M25 100 L175 100 L185 135 L15 135 Z" class="ps" data-c="4"/>
    <rect x="40" y="105" width="120" height="18" rx="2" class="ps" data-c="0"/>
    <rect x="80" y="125" width="40" height="8" rx="2" class="ps" data-c="2"/>
  ` },
  {
    numero: 5, nombre: 'Celular', svg: `
    <rect x="55" y="10" width="90" height="140" rx="12" class="ps" data-c="0"/>
    <rect x="65" y="30" width="70" height="100" class="ps" data-c="1"/>
    <circle cx="100" cy="15" r="3" class="ps" data-c="5"/>
    <rect x="85" y="135" width="30" height="5" rx="2" class="ps" data-c="5"/>
    <circle cx="100" cy="125" r="8" class="ps" data-c="4"/>
  ` },
  {
    numero: 6, nombre: 'Tablet', svg: `
    <rect x="35" y="15" width="130" height="110" rx="8" class="ps" data-c="4"/>
    <rect x="45" y="25" width="110" height="85" class="ps" data-c="2"/>
    <circle cx="100" cy="118" r="8" class="ps" data-c="0"/>
    <circle cx="100" cy="22" r="4" class="ps" data-c="5"/>
  ` },
  {
    numero: 7, nombre: 'Impresora', svg: `
    <rect x="25" y="50" width="150" height="70" rx="8" class="ps" data-c="5"/>
    <rect x="35" y="35" width="130" height="20" rx="3" class="ps" data-c="1"/>
    <rect x="50" y="120" width="100" height="15" rx="2" class="ps" data-c="4"/>
    <rect x="35" y="65" width="40" height="20" rx="2" class="ps" data-c="0"/>
    <rect x="60" y="125" width="80" height="10" class="ps" data-c="5"/>
  ` },
  {
    numero: 8, nombre: 'Router WiFi', svg: `
    <rect x="45" y="70" width="110" height="50" rx="6" class="ps" data-c="0"/>
    <rect x="55" y="20" width="10" height="55" rx="2" class="ps" data-c="5"/>
    <rect x="135" y="20" width="10" height="55" rx="2" class="ps" data-c="5"/>
    <circle cx="70" cy="90" r="5" class="ps" data-c="1"/>
    <circle cx="90" cy="90" r="5" class="ps" data-c="3"/>
    <rect x="100" y="85" width="40" height="10" rx="2" class="ps" data-c="4"/>
  ` },
  {
    numero: 9, nombre: 'Cámara Web', svg: `
    <circle cx="100" cy="60" r="45" class="ps" data-c="5"/>
    <circle cx="100" cy="60" r="30" class="ps" data-c="1"/>
    <circle cx="100" cy="60" r="12" class="ps" data-c="0"/>
    <rect x="85" y="105" width="30" height="20" rx="3" class="ps" data-c="5"/>
    <rect x="93" y="125" width="14" height="10" class="ps" data-c="4"/>
  ` },
  {
    numero: 10, nombre: 'Audífonos', svg: `
    <path d="M40 90 Q40 20 100 20 Q160 20 160 90" stroke="#333" stroke-width="12" fill="none" class="ps" data-c="0"/>
    <rect x="25" y="75" width="30" height="60" rx="8" class="ps" data-c="5"/>
    <rect x="145" y="75" width="30" height="60" rx="8" class="ps" data-c="5"/>
    <rect x="30" y="85" width="20" height="30" rx="4" class="ps" data-c="1"/>
    <rect x="150" y="85" width="20" height="30" rx="4" class="ps" data-c="1"/>
  ` },
  {
    numero: 11, nombre: 'Memoria USB', svg: `
    <rect x="65" y="30" width="70" height="100" rx="6" class="ps" data-c="1"/>
    <rect x="80" y="130" width="40" height="15" class="ps" data-c="5"/>
    <rect x="90" y="50" width="20" height="30" rx="2" class="ps" data-c="3"/>
    <rect x="95" y="90" width="10" height="10" class="ps" data-c="0"/>
    <rect x="85" y="45" width="30" height="5" class="ps" data-c="4"/>
  ` },
  {
    numero: 12, nombre: 'Chip CPU', svg: `
    <rect x="40" y="25" width="120" height="100" rx="4" class="ps" data-c="3"/>
    <rect x="60" y="45" width="80" height="60" class="ps" data-c="5"/>
    <rect x="45" y="35" width="10" height="5" class="ps" data-c="2"/>
    <rect x="45" y="55" width="10" height="5" class="ps" data-c="2"/>
    <rect x="145" y="35" width="10" height="5" class="ps" data-c="2"/>
    <rect x="145" y="55" width="10" height="5" class="ps" data-c="2"/>
  ` },
  {
    numero: 13, nombre: 'Disco CD', svg: `
    <circle cx="100" cy="80" r="65" class="ps" data-c="4"/>
    <circle cx="100" cy="80" r="25" fill="#fff" stroke="#ccc" stroke-width="1"/>
    <circle cx="100" cy="80" r="55" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/>
    <path d="M100 15 L100 40" stroke="#fff" stroke-width="3"/>
    <path d="M165 80 L140 80" stroke="#fff" stroke-width="3"/>
    <circle cx="100" cy="80" r="8" class="ps" data-c="0"/>
  ` },
  {
    numero: 14, nombre: 'Disquette', svg: `
    <rect x="30" y="15" width="140" height="130" rx="6" class="ps" data-c="0"/>
    <rect x="60" y="15" width="80" height="45" fill="#fff"/>
    <rect x="40" y="80" width="120" height="55" rx="3" class="ps" data-c="5"/>
    <rect x="50" y="90" width="80" height="10" class="ps" data-c="1"/>
    <rect x="80" y="30" width="25" height="20" rx="2" class="ps" data-c="4"/>
  ` },
  {
    numero: 15, nombre: 'Batería', svg: `
    <rect x="40" y="30" width="120" height="90" rx="12" class="ps" data-c="3"/>
    <rect x="160" y="55" width="20" height="40" rx="4" class="ps" data-c="2"/>
    <rect x="55" y="50" width="15" height="25" class="ps" data-c="2"/>
    <rect x="80" y="50" width="15" height="25" class="ps" data-c="2"/>
    <rect x="105" y="50" width="15" height="25" class="ps" data-c="2"/>
    <rect x="130" y="50" width="15" height="25" class="ps" data-c="1"/>
  ` },
  {
    numero: 16, nombre: 'Smartwatch', svg: `
    <rect x="50" y="25" width="100" height="100" rx="15" class="ps" data-c="0"/>
    <rect x="60" y="35" width="80" height="80" rx="10" class="ps" data-c="1"/>
    <rect x="150" y="60" width="10" height="20" rx="3" class="ps" data-c="5"/>
    <rect x="75" y="5" width="50" height="25" rx="5" class="ps" data-c="4"/>
    <rect x="75" y="120" width="50" height="25" rx="5" class="ps" data-c="4"/>
  ` },
  {
    numero: 17, nombre: 'Servidor', svg: `
    <rect x="30" y="15" width="140" height="50" rx="3" class="ps" data-c="5"/>
    <rect x="30" y="75" width="140" height="50" rx="3" class="ps" data-c="5"/>
    <circle cx="155" cy="35" r="6" class="ps" data-c="3"/>
    <circle cx="155" cy="95" r="6" class="ps" data-c="2"/>
    <rect x="40" y="35" width="60" height="10" class="ps" data-c="0"/>
    <rect x="40" y="95" width="60" height="10" class="ps" data-c="0"/>
    <rect x="110" y="30" width="30" height="20" class="ps" data-c="4"/>
    <rect x="110" y="90" width="30" height="20" class="ps" data-c="4"/>
  ` },
  {
    numero: 18, nombre: 'Cámara', svg: `
    <rect x="25" y="45" width="150" height="90" rx="20" class="ps" data-c="5"/>
    <circle cx="100" cy="90" r="40" class="ps" data-c="0"/>
    <circle cx="100" cy="90" r="25" class="ps" data-c="1"/>
    <circle cx="100" cy="90" r="10" class="ps" data-c="5"/>
    <rect x="55" y="55" width="25" height="15" rx="4" class="ps" data-c="3"/>
    <circle cx="160" cy="60" r="8" class="ps" data-c="0"/>
  ` },
  {
    numero: 19, nombre: 'Altavoz', svg: `
    <rect x="50" y="15" width="100" height="130" rx="12" class="ps" data-c="4"/>
    <circle cx="100" cy="60" r="30" class="ps" data-c="5"/>
    <circle cx="100" cy="60" r="15" class="ps" data-c="0"/>
    <circle cx="100" cy="115" r="15" class="ps" data-c="1"/>
    <rect x="80" y="135" width="40" height="5" rx="2" class="ps" data-c="5"/>
  ` },
  {
    numero: 20, nombre: 'Robot PC', svg: `
    <rect x="55" y="5" width="90" height="85" rx="12" class="ps" data-c="1"/>
    <circle cx="80" cy="35" r="15" class="ps" data-c="0"/>
    <circle cx="120" cy="35" r="15" class="ps" data-c="0"/>
    <circle cx="80" cy="35" r="6" class="ps" data-c="5"/>
    <circle cx="120" cy="35" r="6" class="ps" data-c="5"/>
    <rect x="65" y="95" width="70" height="50" rx="5" class="ps" data-c="4"/>
    <rect x="50" y="145" width="100" height="10" rx="3" class="ps" data-c="5"/>
    <polygon points="100,75 85,85 115,85" class="ps" data-c="2"/>
  ` },
  {
    numero: 21, nombre: 'Joystick', svg: `
    <rect x="35" y="90" width="130" height="50" rx="10" class="ps" data-c="5"/>
    <rect x="85" y="45" width="30" height="55" rx="5" class="ps" data-c="4"/>
    <circle cx="100" cy="35" r="25" class="ps" data-c="0"/>
    <path d="M60 110 L50 100 L50 120 Z" class="ps" data-c="1"/>
    <path d="M140 110 L150 100 L150 120 Z" class="ps" data-c="3"/>
  ` },
  {
    numero: 22, nombre: 'Proyector', svg: `
    <rect x="25" y="45" width="150" height="90" rx="10" class="ps" data-c="5"/>
    <circle cx="70" cy="90" r="35" class="ps" data-c="0"/>
    <circle cx="70" cy="90" r="15" class="ps" data-c="1"/>
    <rect x="120" y="65" width="35" height="45" class="ps" data-c="3"/>
    <rect x="35" y="55" width="10" height="5" class="ps" data-c="4"/>
  ` },
  {
    numero: 23, nombre: 'Disco Duro', svg: `
    <rect x="35" y="25" width="130" height="100" rx="5" class="ps" data-c="4"/>
    <circle cx="100" cy="75" r="40" class="ps" data-c="1"/>
    <circle cx="100" cy="75" r="15" class="ps" data-c="5"/>
    <rect x="135" y="55" width="15" height="50" class="ps" data-c="0"/>
    <rect x="45" y="90" width="30" height="10" class="ps" data-c="3"/>
  ` },
  {
    numero: 24, nombre: 'Ventilador PC', svg: `
    <rect x="25" y="20" width="150" height="110" rx="8" class="ps" data-c="5"/>
    <circle cx="38" cy="33" r="6" class="ps" data-c="4"/>
    <circle cx="162" cy="33" r="6" class="ps" data-c="4"/>
    <circle cx="38" cy="117" r="6" class="ps" data-c="4"/>
    <circle cx="162" cy="117" r="6" class="ps" data-c="4"/>
    <circle cx="100" cy="75" r="40" class="ps" data-c="1"/>
    <circle cx="100" cy="75" r="12" class="ps" data-c="0"/>
  ` },
  {
    numero: 25, nombre: 'Fuente de Poder', svg: `
    <rect x="25" y="25" width="150" height="110" rx="3" class="ps" data-c="5"/>
    <circle cx="60" cy="80" r="35" class="ps" data-c="0"/>
    <circle cx="60" cy="80" r="12" class="ps" data-c="4"/>
    <path d="M60 45 L55 80 L65 80 Z M95 80 L60 75 L60 85 Z M60 115 L55 80 L65 80 Z M25 80 L60 75 L60 85 Z" fill="#fff" opacity="0.4"/>
    <rect x="110" y="35" width="40" height="20" rx="3" class="ps" data-c="3"/>
    <rect x="110" y="60" width="40" height="20" rx="3" class="ps" data-c="2"/>
    <rect x="110" y="95" width="40" height="25" rx="3" class="ps" data-c="1"/>
    <circle cx="120" cy="108" r="3" fill="#fff"/>
    <circle cx="130" cy="108" r="3" fill="#fff"/>
    <circle cx="140" cy="108" r="3" fill="#fff"/>
    <path d="M70 25 Q100 0 130 25" stroke-width="6" fill="none" class="ps" data-c="4"/>
  ` },
  {
    numero: 26, nombre: 'Tarjeta Gráfica', svg: `
    <rect x="25" y="25" width="150" height="95" rx="2" class="ps" data-c="3"/>
    <rect x="30" y="30" width="140" height="55" rx="3" class="ps" data-c="5"/>
    <circle cx="70" cy="55" r="22" class="ps" data-c="0"/>
    <circle cx="140" cy="55" r="22" class="ps" data-c="0"/>
    <rect x="45" y="120" width="45" height="20" rx="2" class="ps" data-c="2"/>
    <rect x="110" y="120" width="45" height="20" rx="2" class="ps" data-c="2"/>
  ` },
  {
    numero: 27, nombre: 'Game Boy', svg: `
    <rect x="45" y="10" width="110" height="140" rx="12" class="ps" data-c="5"/>
    <rect x="55" y="20" width="90" height="60" rx="3" class="ps" data-c="2"/>
    <rect x="65" y="30" width="70" height="40" class="ps" data-c="4"/>
    <rect x="55" y="95" width="10" height="25" rx="2" class="ps" data-c="0"/>
    <rect x="45" y="102" width="30" height="10" rx="2" class="ps" data-c="0"/>
    <circle cx="120" cy="100" r="10" class="ps" data-c="0"/>
    <circle cx="140" cy="110" r="10" class="ps" data-c="0"/>
    <rect x="85" y="125" width="25" height="6" rx="3" class="ps" data-c="4"/>
    <rect x="115" y="125" width="25" height="6" rx="3" class="ps" data-c="4"/>
  ` },
  {
    numero: 28, nombre: 'Reloj Digital', svg: `
    <rect x="35" y="35" width="130" height="80" rx="8" class="ps" data-c="1"/>
    <rect x="45" y="45" width="110" height="50" rx="4" class="ps" data-c="5"/>
    <rect x="55" y="55" width="20" height="30" class="ps" data-c="0"/>
    <rect x="85" y="55" width="20" height="30" class="ps" data-c="0"/>
    <rect x="105" y="55" width="20" height="30" class="ps" data-c="0"/>
    <rect x="125" y="55" width="20" height="30" class="ps" data-c="0"/>
    <rect x="50" y="100" width="20" height="8" rx="2" class="ps" data-c="2"/>
    <rect x="130" y="100" width="20" height="8" rx="2" class="ps" data-c="2"/>
  ` },
  {
    numero: 29, nombre: 'Bombilla', svg: `
    <path d="M75 25 Q75 10 100 10 Q125 10 125 25 L125 65 Q125 85 100 95 Q75 85 75 65 Z" class="ps" data-c="0"/>
    <path d="M85 95 L115 95 L110 105 L90 105 Z" class="ps" data-c="5"/>
    <path d="M90 105 L110 105 L105 115 L95 115 Z" class="ps" data-c="5"/>
    <rect x="92" y="115" width="16" height="10" class="ps" data-c="3"/>
    <path d="M100 25 L100 55" stroke="#f1c40f" stroke-width="3"/>
    <path d="M85 40 L115 40" stroke="#f1c40f" stroke-width="2"/>
  ` },
  {
    numero: 30, nombre: 'Timbre', svg: `
    <circle cx="100" cy="70" r="50" class="ps" data-c="5"/>
    <circle cx="100" cy="70" r="35" class="ps" data-c="4"/>
    <circle cx="100" cy="70" r="15" class="ps" data-c="0"/>
    <rect x="85" y="115" width="30" height="20" rx="3" class="ps" data-c="5"/>
    <circle cx="90" cy="125" r="3" class="ps" data-c="2"/>
    <circle cx="110" cy="125" r="3" class="ps" data-c="2"/>
  ` },
];
