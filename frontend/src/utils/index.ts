// ============================================
// UTILIDADES GENERALES
// ============================================

import type { NivelDominio, Dimension } from '../types';
import { NIVEL_DOMINIO } from '../constants';

// ============================================
// FORMATEO
// ============================================

/**
 * Formatea una fecha a formato local legible
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea un tiempo en segundos a mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Formatea un número con decimales
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

// ============================================
// CÁLCULOS
// ============================================

/**
 * Calcula el promedio de un array de números
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Calcula la desviación estándar
 */
export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = average(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calcula la mediana
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Limita un valor entre min y max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================
// CLASIFICACIÓN
// ============================================

/**
 * Determina el nivel de dominio basado en un puntaje (1-5)
 */
export function getNivelDominio(puntaje: number): NivelDominio {
  if (puntaje >= NIVEL_DOMINIO.alto.min) return 'alto';
  if (puntaje >= NIVEL_DOMINIO.regular.min) return 'regular';
  return 'bajo';
}

/**
 * Calcula la tasa de aciertos (0-1)
 */
export function tasaAciertos(correctos: number, total: number): number {
  if (total === 0) return 0;
  return correctos / total;
}

// ============================================
// VALIDACIÓN
// ============================================

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Valida longitud de contraseña
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128;
}

// ============================================
// ID Y CODIFICACIÓN
// ============================================

/**
 * Genera un ID único simple
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Genera un código de alumno secuencial
 */
export function generateCodigoAlumno(numero: number): string {
  return `Alumno ${numero}`;
}

// ============================================
// UTILIDADES DE ARREGLO
// ============================================

/**
 * Mezcla un array de forma aleatoria (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Agrupa un array por una propiedad
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// ============================================
// DIMENSIONES
// ============================================

/**
 * Obtiene el color de una dimensión
 */
export function getDimensionColor(dimension: Dimension): string {
  const colors: Record<Dimension, string> = {
    reconocimiento: 'bg-blue-100 text-blue-700',
    interaccion: 'bg-green-100 text-green-700',
    autonomia: 'bg-purple-100 text-purple-700',
  };
  return colors[dimension];
}

/**
 * Obtiene el nombre legible de una dimensión
 */
export function getDimensionName(dimension: Dimension): string {
  const names: Record<Dimension, string> = {
    reconocimiento: 'Reconocimiento',
    interaccion: 'Interacción',
    autonomia: 'Autonomía',
  };
  return names[dimension];
}

// ============================================
// RETROALIMENTACIÓN
// ============================================

/**
 * Obtiene un mensaje de retroalimentación aleatorio
 */
export function getRandomMessage(messages: readonly string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

// ============================================
// DEPURACIÓN
// ============================================

/**
 * Log de desarrollo (solo en modo development)
 */
export function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log('[DEBUG]', ...args);
  }
}
