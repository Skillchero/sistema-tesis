// ============================================
// RUTAS DE PROGRESO
// Guarda: progreso, errores, intentos, aciertos
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';

const router = Router();

// ============================================
// Esquemas de validación
// ============================================
const registrarIntentoSchema = z.object({
  ninoId: z.string(),
  juegoId: z.string(),         // "aprende-usar", "pinta-compu", etc.
  nivel: z.number().int().min(1),
  resultado: z.enum(['CORRECTO', 'INCORRECTO', 'ABANDONADO']),
  tiempoRespuestaMs: z.number().int().min(0).default(0),
  errores: z.number().int().min(0).default(0),   // errores en este intento
  aciertos: z.number().int().min(0).default(1),  // aciertos en este intento
  pistasUtilizadas: z.number().int().min(0).default(0),
});

const guardarProgresoSchema = z.object({
  ninoId: z.string(),
  juegoId: z.string(),
  nivelAlcanzado: z.number().int().min(1),
  porcentajeProgreso: z.number().min(0).max(100),
  estrellas: z.number().int().min(0).default(0),
  monedas: z.number().int().min(0).default(0),
});

// ============================================
// POST /api/progreso/intento
// Registrar un intento (correcto o incorrecto)
// ============================================
router.post('/intento', async (req, res) => {
  try {
    const data = registrarIntentoSchema.parse(req.body);

    // Verificar que el niño existe
    const nino = await prisma.nino.findUnique({ where: { id: data.ninoId } });
    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    // Buscar o crear sesión activa
    let sesion = await prisma.sesionAprendizaje.findFirst({
      where: {
        ninoId: data.ninoId,
        estado: 'ACTIVA',
      },
    });

    if (!sesion) {
      sesion = await prisma.sesionAprendizaje.create({
        data: {
          ninoId: data.ninoId,
          nivelInicial: data.nivel,
        },
      });
    }

    // Buscar o crear actividad para este juego+nivel
    let actividad = await prisma.actividad.findFirst({
      where: {
        titulo: `${data.juegoId}-nivel-${data.nivel}`,
      },
    });

    if (!actividad) {
      actividad = await prisma.actividad.create({
        data: {
          titulo: `${data.juegoId}-nivel-${data.nivel}`,
          descripcion: `Actividad ${data.juegoId} nivel ${data.nivel}`,
          dimension: 'INTERACCION',
          tipoActividad: 'HACER_CLIC',
          nivelDificultad: data.nivel,
          instrucciones: { juego: data.juegoId, nivel: data.nivel },
        },
      });
    }

    // Registrar el intento
    const intento = await prisma.intentoActividad.create({
      data: {
        sesionId: sesion.id,
        actividadId: actividad.id,
        ninoId: data.ninoId,
        resultado: data.resultado,
        tiempoRespuestaMs: data.tiempoRespuestaMs,
        pistasUtilizadas: data.pistasUtilizadas,
        intentosTotales: data.errores + data.aciertos,
        nivelDificultad: data.nivel,
      },
    });

    // Actualizar contadores del niño
    const updateData: Record<string, { increment: number }> = {
      intentosTotales: { increment: 1 },
    };
    if (data.resultado === 'INCORRECTO') {
      updateData.desaciertos = { increment: 1 };
    }
    await prisma.nino.update({
      where: { id: data.ninoId },
      data: updateData,
    });

    // Actualizar progreso del niño
    await actualizarProgreso(data.ninoId);

    res.status(201).json({ success: true, data: intento });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error al registrar intento:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// POST /api/progreso/guardar
// Guardar progreso de un juego (nivel alcanzado)
// ============================================
router.post('/guardar', async (req, res) => {
  try {
    const data = guardarProgresoSchema.parse(req.body);

    // Verificar que el niño existe
    const nino = await prisma.nino.findUnique({ where: { id: data.ninoId } });
    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    // Actualizar nivel actual del niño si es mayor
    if (data.nivelAlcanzado > nino.nivelActual) {
      await prisma.nino.update({
        where: { id: data.ninoId },
        data: { nivelActual: data.nivelAlcanzado },
      });
    }

    res.json({ success: true, message: 'Progreso guardado correctamente' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error al guardar progreso:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// GET /api/progreso/:ninoId
// Obtener todo el progreso de un niño
// ============================================
router.get('/:ninoId', async (req, res) => {
  try {
    const { ninoId } = req.params;

    const nino = await prisma.nino.findUnique({
      where: { id: ninoId },
      include: {
        progreso: true,
        intentos: {
          orderBy: { creadoEn: 'desc' },
          take: 100,
        },
        sesiones: {
          orderBy: { fechaInicio: 'desc' },
          take: 20,
        },
      },
    });

    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    // Calcular estadísticas
    const totalIntentos = nino.intentos.length;
    const aciertos = nino.intentos.filter((i) => i.resultado === 'CORRECTO').length;
    const errores = nino.intentos.filter((i) => i.resultado === 'INCORRECTO').length;
    const abandono = nino.intentos.filter((i) => i.resultado === 'ABANDONADO').length;

    res.json({
      success: true,
      data: {
        nino: {
          id: nino.id,
          nombre: nino.nombreCompleto,
          codigo: nino.codigoAlumno,
          edad: nino.edad,
          nivelActual: nino.nivelActual,
        },
        estadisticas: {
          totalIntentos,
          aciertos,
          errores,
          abandono,
          precision: totalIntentos > 0 ? Math.round((aciertos / totalIntentos) * 100) : 0,
        },
        progreso: nino.progreso,
        sesiones: nino.sesiones,
        intentosRecientes: nino.intentos.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// GET /api/progreso/docente/:docenteId
// Obtener progreso de todos los alumnos de un docente
// ============================================
router.get('/docente/:docenteId', async (req, res) => {
  try {
    const { docenteId } = req.params;

    const ninos = await prisma.nino.findMany({
      where: { docenteId },
      orderBy: { codigoAlumno: 'asc' },
      select: {
        id: true,
        nombreCompleto: true,
        codigoAlumno: true,
        edad: true,
        nivelActual: true,
        monedas: true,
        puntos: true,
        estrellas: true,
        actividadesCompletadas: true,
        desaciertos: true,
        intentosTotales: true,
        sesiones: { orderBy: { fechaInicio: 'desc' }, take: 1, select: { fechaInicio: true } },
        progreso: { select: { puntajeAcumulado: true, nivelDominio: true } },
      },
    });

    const resultados = ninos.map((nino) => {
      const totalIntentos = nino.intentosTotales;
      const errores = nino.desaciertos;
      const aciertos = Math.max(0, totalIntentos - errores);

      return {
        id: nino.id,
        nombre: nino.nombreCompleto,
        codigo: nino.codigoAlumno,
        edad: nino.edad,
        nivelActual: nino.nivelActual,
        monedas: nino.monedas,
        puntos: nino.puntos,
        estrellas: nino.estrellas,
        actividadesCompletadas: nino.actividadesCompletadas,
        estadisticas: {
          totalIntentos,
          aciertos,
          errores,
          precision: totalIntentos > 0 ? Math.round((aciertos / totalIntentos) * 100) : 0,
        },
        ultimaSesion: nino.sesiones[0]?.fechaInicio || null,
        progreso: nino.progreso,
      };
    });

    res.json({ success: true, data: resultados });
  } catch (error) {
    console.error('Error al obtener progreso del docente:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// Función auxiliar: actualizar progreso agregado
// ============================================
async function actualizarProgreso(ninoId: string) {
  try {
    // Obtener todos los intentos del niño
    const intentos = await prisma.intentoActividad.findMany({
      where: { ninoId },
    });

    const total = intentos.length;
    const correctos = intentos.filter((i) => i.resultado === 'CORRECTO').length;
    const porcentaje = total > 0 ? (correctos / total) * 100 : 0;

    // Determinar nivel de dominio
    let nivelDominio: 'BAJO' | 'REGULAR' | 'ALTO' = 'BAJO';
    if (porcentaje >= 80) nivelDominio = 'ALTO';
    else if (porcentaje >= 50) nivelDominio = 'REGULAR';

    // Upsert del progreso por dimensión
    await prisma.progresoNino.upsert({
      where: {
        ninoId_dimension: { ninoId, dimension: 'INTERACCION' },
      },
      update: {
        puntajeAcumulado: porcentaje,
        totalActividades: total,
        actividadesCorrectas: correctos,
        nivelDominio,
        ultimaActividad: new Date(),
      },
      create: {
        ninoId,
        dimension: 'INTERACCION',
        puntajeAcumulado: porcentaje,
        totalActividades: total,
        actividadesCorrectas: correctos,
        nivelDominio,
      },
    });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
  }
}

export default router;
