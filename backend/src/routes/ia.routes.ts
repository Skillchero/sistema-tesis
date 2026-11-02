// ============================================
// RUTAS DE IA ADAPTATIVA
// Sistema de reglas/heurísticas (no ML)
// ============================================

import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// ============================================
// GET /api/ia/siguiente-actividad?ninoId=xxx
// IA decide la siguiente actividad según reglas
// ============================================
router.get('/siguiente-actividad', async (req, res) => {
  try {
    const { ninoId } = req.query;

    if (!ninoId) {
      return res.status(400).json({ success: false, error: 'Se requiere ninoId' });
    }

    // Obtener datos del niño
    const nino = await prisma.nino.findUnique({
      where: { id: ninoId as string },
      include: {
        intentos: {
          orderBy: { creadoEn: 'desc' },
          take: 20,
        },
        progreso: true,
        sesiones: {
          orderBy: { fechaInicio: 'desc' },
          take: 1,
        },
      },
    });

    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    // ============================================
    // REGLAS DE IA ADAPTATIVA (heurísticas)
    // ============================================
    const reglas: string[] = [];
    let dificultadRecomendada = 'normal';
    let apoyoAdicional = false;
    let mensajeIA = '';

    // Obtener estadísticas recientes
    const intentosRecientes = nino.intentos;
    const totalRecientes = intentosRecientes.length;
    const correctosRecientes = intentosRecientes.filter((i) => i.resultado === 'CORRECTO').length;
    const precisionReciente = totalRecientes > 0 ? (correctosRecientes / totalRecientes) * 100 : 0;

    // REGLA 1: Si la precisión es baja (< 50%), reducir dificultad
    if (totalRecientes >= 3 && precisionReciente < 50) {
      dificultadRecomendada = 'facil';
      apoyoAdicional = true;
      reglas.push('precision-baja');
      mensajeIA = 'Reducir dificultad: el niño tiene menos del 50% de aciertos recientes.';
    }

    // REGLA 2: Si la precisión es alta (> 80%), aumentar dificultad
    if (totalRecientes >= 3 && precisionReciente > 80) {
      dificultadRecomendada = 'dificil';
      reglas.push('precision-alta');
      mensajeIA = 'Aumentar dificultad: el niño muestra dominio con más del 80% de aciertos.';
    }

    // REGLA 3: Si hay muchos errores seguidos (3+), ofrecer pista
    const erroresSeguidos = intentosRecientes.slice(0, 3).filter((i) => i.resultado === 'INCORRECTO').length;
    if (erroresSeguidos >= 3) {
      apoyoAdicional = true;
      reglas.push('errores-consecutivos');
      if (!mensajeIA) mensajeIA = 'Activar pistas: 3 errores consecutivos detectados.';
    }

    // REGLA 4: Si no ha jugado en más de 3 días, nivel fácil de reintegración
    if (nino.sesiones && nino.sesiones.length > 0) {
      const ultimaSesion = nino.sesiones[0];
      const diasSinJugar = (Date.now() - new Date(ultimaSesion.fechaInicio).getTime()) / (1000 * 60 * 60 * 24);
      if (diasSinJugar > 3) {
        dificultadRecomendada = 'facil';
        reglas.push('inactividad');
        if (!mensajeIA) mensajeIA = 'Reintegración suave: el niño estuvo más de 3 días sin jugar.';
      }
    }

    // REGLA 5: Si el nivel actual es alto, variar tipo de actividad
    if (nino.nivelActual >= 15) {
      reglas.push('nivel-avanzado');
      if (!mensajeIA) mensajeIA = 'Nivel avanzado: ofrecer variedad de tipos de actividad.';
    }

    // Si no se activó ninguna regla, modo normal
    if (reglas.length === 0) {
      mensajeIA = 'Modo normal: progreso dentro de parámetros esperados.';
    }

    res.json({
      success: true,
      data: {
        ninoId: nino.id,
        nivelActual: nino.nivelActual,
        recomendacion: {
          dificultad: dificultadRecomendada,
          apoyoAdicional,
          mensaje: mensajeIA,
          reglasActivadas: reglas,
        },
        estadisticas: {
          precisionReciente: Math.round(precisionReciente),
          totalIntentosRecientes: totalRecientes,
          erroresConsecutivos: erroresSeguidos,
        },
      },
    });
  } catch (error) {
    console.error('Error en IA:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// GET /api/ia/reglas
// Listar todas las reglas de IA configuradas
// ============================================
router.get('/reglas', async (req, res) => {
  try {
    const reglas = await prisma.configuracionIA.findMany({
      orderBy: { prioridad: 'asc' },
    });

    res.json({ success: true, data: reglas });
  } catch (error) {
    console.error('Error al obtener reglas:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// POST /api/ia/reglas
// Crear una regla de IA
// ============================================
router.post('/reglas', async (req, res) => {
  try {
    const { nombreRegla, condicion, accion, prioridad } = req.body;

    const regla = await prisma.configuracionIA.create({
      data: {
        nombreRegla,
        condicion,
        accion,
        prioridad: prioridad || 1,
      },
    });

    res.status(201).json({ success: true, data: regla });
  } catch (error) {
    console.error('Error al crear regla:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

export default router;
