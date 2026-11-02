// ============================================
// HOOK: useGameProgress
// Registra progreso, errores, intentos y aciertos en la BD
// Al completar nivel → guarda recompensas (monedas, estrellas, puntos)
// ============================================

import { useCallback } from 'react';
import { registrarIntentoJuego, guardarRecompensaActiva, getNinoActivo } from '../services/api';
import { useChildStore } from '../stores/childStore';

interface UseGameProgressOptions {
  juegoId: string;
}

export function useGameProgress({ juegoId }: UseGameProgressOptions) {
  // Registrar acierto (nivel completado) + guardar recompensas en BD
  const registrarAcierto = useCallback(
    (nivel: number, tiempoMs?: number, errores?: number) => {
      const ninoId = getNinoActivo();
      if (!ninoId) return;

      // Registrar el intento como CORRECTO
      registrarIntentoJuego(juegoId, nivel, 'CORRECTO', {
        tiempoMs: tiempoMs || 0,
        errores: errores || 0,
        aciertos: 1,
      });

      // Guardar recompensas en BD (monedas +15, puntos +30, estrellas +1)
      guardarRecompensaActiva({
        monedasGanadas: 15,
        puntosGanados: 30,
        estrellasGanadas: 1,
        nivelAlcanzado: nivel,
      }).then((perfil) => {
        if (perfil) {
          // Sincronizar store local con BD
          useChildStore.setState({
            monedas: perfil.monedas,
            puntos: perfil.puntos,
            estrellas: perfil.estrellas,
          });
        }
      });
    },
    [juegoId]
  );

  // Registrar error (respuesta incorrecta) — solo incrementa desaciertos
  const registrarError = useCallback(
    (nivel: number, tiempoMs?: number) => {
      const ninoId = getNinoActivo();
      if (!ninoId) return;

      registrarIntentoJuego(juegoId, nivel, 'INCORRECTO', {
        tiempoMs: tiempoMs || 0,
        errores: 1,
        aciertos: 0,
      });
    },
    [juegoId]
  );

  // Registrar abandono (el niño salió sin completar)
  const registrarAbandono = useCallback(
    (nivel: number) => {
      const ninoId = getNinoActivo();
      if (!ninoId) return;

      registrarIntentoJuego(juegoId, nivel, 'ABANDONADO', {
        errores: 0,
        aciertos: 0,
      });
    },
    [juegoId]
  );

  return { registrarAcierto, registrarError, registrarAbandono };
}
