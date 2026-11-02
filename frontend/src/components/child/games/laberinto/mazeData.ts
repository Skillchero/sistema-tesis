// ============================================
// DATOS DEL LABERINTO - 30 niveles
// Basados en sistema CompuMundos de referencia
// 0=camino, 1=pared, 2=queso(meta), 3=gato
// ============================================

export interface NivelLaberinto {
  numero: number;
  /** Filas del laberinto como strings de dígitos */
  filas: string[];
  /** Si los gatos se mueven (níveles 21+) */
  gatosMoviles: boolean;
  /** Nombre del nivel para mostrar */
  nombre: string;
}

export const NIVELES_LABERINTO: NivelLaberinto[] = [
  // ===== NIVELES 1-10: Simples, sin gatos o 1 gato estático =====
  {
    numero: 1, nombre: 'Primer Paso', gatosMoviles: false,
    filas: [
      '00010',
      '11010',
      '00000',
      '01110',
      '00002',
    ],
  },
  {
    numero: 2, nombre: 'Camino Simple', gatosMoviles: false,
    filas: [
      '001000',
      '001010',
      '000010',
      '011100',
      '000001',
      '110302',
    ],
  },
  {
    numero: 3, nombre: 'Curvas', gatosMoviles: false,
    filas: [
      '0000111',
      '1110000',
      '0001110',
      '0100000',
      '0111110',
      '0000000',
      '1111032',
    ],
  },
  {
    numero: 4, nombre: 'Caminos Cruzados', gatosMoviles: false,
    filas: [
      '00010000',
      '11010110',
      '00000000',
      '01111110',
      '00000000',
      '11011101',
      '00000000',
      '01113032',
    ],
  },
  {
    numero: 5, nombre: 'El Bosque', gatosMoviles: false,
    filas: [
      '001000100',
      '001010001',
      '000011100',
      '111000001',
      '000011100',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 6, nombre: 'Túneles', gatosMoviles: false,
    filas: [
      '011000100',
      '001010001',
      '100011100',
      '111000001',
      '000011100',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 7, nombre: 'Zigzag', gatosMoviles: false,
    filas: [
      '001100100',
      '101010001',
      '000011100',
      '111000001',
      '000111000',
      '010000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 8, nombre: 'Pasillos', gatosMoviles: false,
    filas: [
      '001001100',
      '011010001',
      '000011100',
      '111000001',
      '000011100',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 9, nombre: 'Escondite', gatosMoviles: false,
    filas: [
      '011000100',
      '001010001',
      '000011100',
      '111000001',
      '000111000',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 10, nombre: 'Gran Aventura', gatosMoviles: false,
    filas: [
      '001000100',
      '001010001',
      '000011100',
      '111000001',
      '000011100',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },

  // ===== NIVELES 11-20: Más complejos, gatos estáticos =====
  {
    numero: 11, nombre: 'Caminos Secretos', gatosMoviles: false,
    filas: [
      '011000100',
      '001010001',
      '000011100',
      '111000001',
      '000111000',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 12, nombre: 'La Guarida', gatosMoviles: false,
    filas: [
      '001000100',
      '011010001',
      '000011100',
      '111000101',
      '000011100',
      '011000011',
      '000113000',
      '110000110',
      '000110032',
    ],
  },
  {
    numero: 13, nombre: 'Cuevas', gatosMoviles: false,
    filas: [
      '011000100',
      '001010001',
      '000011100',
      '111000001',
      '000011300',
      '011000010',
      '000110000',
      '110000113',
      '000130002',
    ],
  },
  {
    numero: 14, nombre: 'El Desvío', gatosMoviles: false,
    filas: [
      '011100100',
      '001010001',
      '100011100',
      '111000001',
      '000111030',
      '011000011',
      '000110000',
      '110000110',
      '200130030',
    ],
  },
  {
    numero: 15, nombre: 'Túnel Largo', gatosMoviles: false,
    filas: [
      '011000100',
      '001010001',
      '300011100',
      '111000001',
      '000111100',
      '011003001',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 16, nombre: 'Rincones', gatosMoviles: false,
    filas: [
      '011000100',
      '011010001',
      '000311100',
      '110000001',
      '000301110',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 17, nombre: 'Callejón', gatosMoviles: false,
    filas: [
      '011100100',
      '001010001',
      '000011100',
      '111000001',
      '000101100',
      '011030001',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 18, nombre: 'Mazmorra', gatosMoviles: false,
    filas: [
      '011000100',
      '011010001',
      '000011100',
      '111000001',
      '000110100',
      '011000011',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 19, nombre: 'El Paso', gatosMoviles: false,
    filas: [
      '011000100',
      '001010001',
      '300011100',
      '111000001',
      '000111100',
      '011003001',
      '000110000',
      '110000110',
      '000130032',
    ],
  },
  {
    numero: 20, nombre: 'La Fortaleza', gatosMoviles: false,
    filas: [
      '011100100',
      '001010001',
      '100011100',
      '111000001',
      '000111030',
      '011000011',
      '000110000',
      '110000110',
      '200130030',
    ],
  },

  // ===== NIVELES 21-30: GATOS MÓVILES =====
  {
    numero: 21, nombre: '¡Gatos Móviles!', gatosMoviles: true,
    filas: [
      '00010001000',
      '11010101010',
      '00000100000',
      '01101011110',
      '00000001000',
      '01101111011',
      '01001000000',
      '11010101010',
      '00000301002',
    ],
  },
  {
    numero: 22, nombre: 'Persecución', gatosMoviles: true,
    filas: [
      '01100000110',
      '00001110000',
      '11100000110',
      '00101010000',
      '01111000111',
      '00001101000',
      '11100000110',
      '00001310000',
      '01100000112',
    ],
  },
  {
    numero: 23, nombre: 'Dos Gatos', gatosMoviles: true,
    filas: [
      '00001110000',
      '11100000110',
      '00001110000',
      '01100000110',
      '00001110000',
      '01100001111',
      '00001110000',
      '01300000310',
      '00001110002',
    ],
  },
  {
    numero: 24, nombre: 'Cuidado', gatosMoviles: true,
    filas: [
      '01000101010',
      '00010000001',
      '01111011011',
      '11000000010',
      '01010101010',
      '11010111011',
      '00000000100',
      '01030103010',
      '00100000002',
    ],
  },
  {
    numero: 25, nombre: 'Estrategia', gatosMoviles: true,
    filas: [
      '0000111100000',
      '1110000001110',
      '0000111100000',
      '0110000001100',
      '0010111100001',
      '1010010001110',
      '0000110100000',
      '1100033000110',
      '0000111100002',
    ],
  },
  {
    numero: 26, nombre: 'Velocidad', gatosMoviles: true,
    filas: [
      '0101010101000',
      '0000100000001',
      '1110101111110',
      '0000001000000',
      '0111010101010',
      '0101101101111',
      '0001000000001',
      '1101030301010',
      '0000000101002',
    ],
  },
  {
    numero: 27, nombre: 'Tres Gatos', gatosMoviles: true,
    filas: [
      '0000111100000',
      '1110000001110',
      '0000111100000',
      '1110011001110',
      '0000100100000',
      '0110011001100',
      '0000100100000',
      '3110010001103',
      '0000111100002',
    ],
  },
  {
    numero: 28, nombre: 'Caos', gatosMoviles: true,
    filas: [
      '0111000001110',
      '0000001100000',
      '1111000001111',
      '0000011100000',
      '0111000001110',
      '0000011100000',
      '1111000001111',
      '0000030300000',
      '0111000301112',
    ],
  },
  {
    numero: 29, nombre: 'El Laberinto', gatosMoviles: true,
    filas: [
      '0001000000000',
      '0101111111110',
      '0100000010010',
      '1101110111011',
      '0100100000010',
      '0110101101110',
      '0010001000000',
      '1111031311011',
      '0000003000002',
    ],
  },
  {
    numero: 30, nombre: '¡FINAL!', gatosMoviles: true,
    filas: [
      '000011111100000',
      '111000000001110',
      '000011111100000',
      '011100000001101',
      '000011101100000',
      '011001303001101',
      '000010030110002',
    ],
  },
];

/**
 * Convierte las filas string a una matriz 2D de números
 */
export function parseMapa(filas: string[]): number[][] {
  return filas.map(f => f.split('').map(Number));
}

/**
 * Encuentra la posición inicial del jugador (primera celda con 0 en la esquina superior izquierda)
 */
export function encontrarInicio(mapa: number[][]): { r: number; c: number } {
  for (let r = 0; r < mapa.length; r++) {
    for (let c = 0; c < mapa[r].length; c++) {
      if (mapa[r][c] === 0) return { r, c };
    }
  }
  return { r: 0, c: 0 };
}

/**
 * Encuentra la posición de la meta (2)
 */
export function encontrarMeta(mapa: number[][]): { r: number; c: number } {
  for (let r = 0; r < mapa.length; r++) {
    for (let c = 0; c < mapa[r].length; c++) {
      if (mapa[r][c] === 2) return { r, c };
    }
  }
  return { r: mapa.length - 1, c: mapa[0].length - 1 };
}

/**
 * Encuentra las posiciones de los gatos (3)
 */
export function encontrarGatos(mapa: number[][]): Array<{ r: number; c: number }> {
  const gatos: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < mapa.length; r++) {
    for (let c = 0; c < mapa[r].length; c++) {
      if (mapa[r][c] === 3) gatos.push({ r, c });
    }
  }
  return gatos;
}
