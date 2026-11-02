// ============================================
// STORE: Estado del Niño (Zustand)
// ============================================

import { create } from 'zustand';
import { getNivelPorPuntos, type NivelInfo } from '../constants/games';

interface Fondo {
  id: string;
  nombre: string;
  preview: string;
  precio: number;
}

const FONDOS_DISPONIBLES: Fondo[] = [
  { id: 'azul-oscuro', nombre: 'Noche Azul', preview: '🌙', precio: 0 },
  { id: 'rosa', nombre: 'Amanecer Rosa', preview: '🌸', precio: 100 },
  { id: 'verde', nombre: 'Bosque Verde', preview: '🌲', precio: 150 },
  { id: 'naranja', nombre: 'Atardecer Naranja', preview: '🍊', precio: 200 },
  { id: 'morado', nombre: 'Galaxia Morada', preview: '🌌', precio: 250 },
];

interface ChildState {
  // Datos del niño
  codigoAlumno: string | null;
  nombreNino: string | null;

  // Recompensas
  monedas: number;
  puntos: number;
  estrellas: number;

  // Nivel
  nivel: NivelInfo;

  // Fondos (recompensas del carrito)
  fondosDesbloqueados: string[];
  fondoActivo: string;

  // Preferencias
  sonidoActivo: boolean;

  // Sesión iniciada
  sesionIniciada: boolean;

  // Acciones
  iniciarSesion: (codigo: string, nombre?: string) => void;
  cerrarSesion: () => void;
  agregarMonedas: (cantidad: number) => void;
  gastarMonedas: (cantidad: number) => boolean;
  comprarFondo: (id: string) => boolean;
  cambiarFondo: (id: string) => void;
  agregarPuntos: (cantidad: number) => void;
  agregarEstrellas: (cantidad: number) => void;
  alternarSonido: () => void;
  actualizarNivel: () => void;
}

export const useChildStore = create<ChildState>((set, get) => ({
  // Estado inicial
  codigoAlumno: null,
  nombreNino: null,
  monedas: 50, // Monedas iniciales
  puntos: 0,
  estrellas: 0,
  nivel: getNivelPorPuntos(0),
  fondosDesbloqueados: (() => {
    try { return JSON.parse(localStorage.getItem('fondos-desbloqueados') || '["azul-oscuro"]'); } catch { return ['azul-oscuro']; }
  })(),
  fondoActivo: (() => {
    try { return localStorage.getItem('fondo-activo') || 'azul-oscuro'; } catch { return 'azul-oscuro'; }
  })(),
  sonidoActivo: true,
  sesionIniciada: false,

  // Acciones
  iniciarSesion: (codigo: string, nombre?: string) => {
    set({
      codigoAlumno: codigo,
      nombreNino: nombre || codigo,
      sesionIniciada: true,
    });
  },

  cerrarSesion: () => {
    set({
      codigoAlumno: null,
      nombreNino: null,
      sesionIniciada: false,
    });
  },

  agregarMonedas: (cantidad: number) => {
    set((state) => ({ monedas: state.monedas + cantidad }));
  },

  gastarMonedas: (cantidad: number): boolean => {
    const { monedas } = get();
    if (monedas >= cantidad) {
      set({ monedas: monedas - cantidad });
      return true;
    }
    return false;
  },

  comprarFondo: (id: string): boolean => {
    const { monedas, fondosDesbloqueados } = get();
    const fondo = FONDOS_DISPONIBLES.find(f => f.id === id);
    if (!fondo) return false;
    if (fondosDesbloqueados.includes(id)) return false; // ya desbloqueado
    if (monedas < fondo.precio) return false; // no alcanza
    const nuevos = [...fondosDesbloqueados, id];
    set({
      monedas: monedas - fondo.precio,
      fondosDesbloqueados: nuevos,
    });
    localStorage.setItem('fondos-desbloqueados', JSON.stringify(nuevos));
    return true;
  },

  cambiarFondo: (id: string) => {
    set({ fondoActivo: id });
    localStorage.setItem('fondo-activo', id);
  },

  agregarPuntos: (cantidad: number) => {
    set((state) => {
      const nuevosPuntos = state.puntos + cantidad;
      const nuevoNivel = getNivelPorPuntos(nuevosPuntos);
      return {
        puntos: nuevosPuntos,
        nivel: nuevoNivel,
      };
    });
  },

  agregarEstrellas: (cantidad: number) => {
    set((state) => ({ estrellas: state.estrellas + cantidad }));
  },

  alternarSonido: () => {
    set((state) => ({ sonidoActivo: !state.sonidoActivo }));
  },

  actualizarNivel: () => {
    const { puntos } = get();
    set({ nivel: getNivelPorPuntos(puntos) });
  },
}));
