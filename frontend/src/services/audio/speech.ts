// ============================================
// SERVICIO DE AUDIO / VOZ
// Usa la Web Speech API del navegador (sin archivos externos)
// Ideal para la tesis: funciona offline y en español
// ============================================

let vozActiva = true;

/**
 * Activa o desactiva el sonido globalmente
 */
export function setVozActiva(activa: boolean): void {
  vozActiva = activa;
  if (!activa) {
    detenerVoz();
  }
}

/**
 * Detiene cualquier voz que se esté reproduciendo
 */
export function detenerVoz(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Busca una voz en español disponible en el navegador
 */
function obtenerVozEspanol(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voces = window.speechSynthesis.getVoices();
  if (voces.length === 0) return null;

  // Prioridad: español de Latinoamérica, luego español general
  const preferidas = [
    'es-MX', 'es-419', 'es-PE', 'es-US', 'es-AR', 'es-ES', 'es',
  ];

  for (const codigo of preferidas) {
    const voz = voces.find(v => v.lang.toLowerCase().startsWith(codigo.toLowerCase()));
    if (voz) return voz;
  }

  // Cualquier voz que contenga "es" en el idioma
  return voces.find(v => v.lang.toLowerCase().includes('es')) || null;
}

/**
 * Habla un texto en español (instrucciones para el niño)
 *
 * @param texto Texto a pronunciar
 * @param opciones Configuración extra
 */
export function hablar(
  texto: string,
  opciones?: {
    /** Velocidad: 0.1 (muy lento) a 1.5 (rápido). Niños: ~0.85 */
    velocidad?: number;
    /** Tono/pitch */
    tono?: number;
    /** Callback al terminar de hablar */
    alTerminar?: () => void;
    /** Silenciar (no reproducir) */
    silenciar?: boolean;
  }
): void {
  // Si el sonido está desactivado globalmente o se pide silenciar
  if (!vozActiva || opciones?.silenciar) {
    opciones?.alTerminar?.();
    return;
  }

  // Verificar soporte
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('SpeechSynthesis no disponible en este navegador');
    opciones?.alTerminar?.();
    return;
  }

  // Cancelar voz anterior
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);

  // Configuración
  utterance.lang = 'es-PE'; // Español Perú
  utterance.rate = opciones?.velocidad ?? 0.85; // Lento para niños
  utterance.pitch = opciones?.tono ?? 1.1; // Un poco agudo, amigable
  utterance.volume = 1;

  // Asignar voz en español si existe
  const voz = obtenerVozEspanol();
  if (voz) {
    utterance.voice = voz;
    utterance.lang = voz.lang;
  }

  // Eventos
  utterance.onend = () => {
    opciones?.alTerminar?.();
  };

  utterance.onerror = (event) => {
    // Error "interrupted" es normal cuando se cancela
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      console.warn('Error al sintetizar voz:', event.error);
    }
    opciones?.alTerminar?.();
  };

  // Reproducir
  window.speechSynthesis.speak(utterance);
}

/**
 * Pre-carga las voces del navegador (necesario en Chrome)
 * Llamar al iniciar la aplicación
 */
export function inicializarVoces(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Chrome carga voces de forma asíncrona
  window.speechSynthesis.getVoices();

  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ============================================
// SONIDOS EFECTO (con Web Audio API - sin archivos)
// ============================================

let audioContext: AudioContext | null = null;

function obtenerAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const ContextoAudio = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (ContextoAudio) {
      audioContext = new ContextoAudio();
    }
  }
  return audioContext;
}

/**
 * Reproduce un tono/efecto de sonido generado
 */
export function playTono(
  frecuencia: number,
  duracion: number = 0.15,
  tipo: OscillatorType = 'sine',
  volumen: number = 0.3
): void {
  if (!vozActiva) return;

  const ctx = obtenerAudioContext();
  if (!ctx) return;

  // Reanudar contexto si está suspendido (política de autoplay)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscilador = ctx.createOscillator();
  const ganancia = ctx.createGain();

  oscilador.type = tipo;
  oscilador.frequency.value = frecuencia;

  ganancia.gain.setValueAtTime(volumen, ctx.currentTime);
  ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);

  oscilador.connect(ganancia);
  ganancia.connect(ctx.destination);

  oscilador.start(ctx.currentTime);
  oscilador.stop(ctx.currentTime + duracion);
}

/**
 * Sonido de éxito (arpegio alegre)
 */
export function playExito(): void {
  if (!vozActiva) return;
  const notas = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notas.forEach((freq, i) => {
    setTimeout(() => playTono(freq, 0.18, 'sine', 0.25), i * 90);
  });
}

/**
 * Sonido de error suave (nunca penalizante para el niño)
 */
export function playError(): void {
  if (!vozActiva) return;
  playTono(311.13, 0.2, 'sine', 0.2); // Eb4
  setTimeout(() => playTono(261.63, 0.3, 'sine', 0.2), 180); // C4
}

/**
 * Sonido de clic
 */
export function playClic(): void {
  playTono(880, 0.06, 'square', 0.1);
}

/**
 * Sonido de pop (para apariciones)
 */
export function playPop(): void {
  playTono(660, 0.08, 'sine', 0.15);
}

/**
 * Sonido de nivel completado (fanfarria)
 */
export function playNivelCompleto(): void {
  if (!vozActiva) return;
  const notas = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // Escala ascendente
  notas.forEach((freq, i) => {
    setTimeout(() => playTono(freq, 0.22, 'triangle', 0.25), i * 110);
  });
}
