// ============================================
// RUTAS DE NIÑOS
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';

const router = Router();

// ============================================
// GET /api/ninos?docenteId=doc1
// Obtener niños de un docente
// ============================================
router.get('/', async (req, res) => {
  try {
    const { docenteId } = req.query;

    const where = docenteId ? { docenteId: docenteId as string } : {};

    const ninos = await prisma.nino.findMany({
      where,
      orderBy: [{ docenteId: 'asc' }, { codigoAlumno: 'asc' }],
      select: {
        id: true,
        docenteId: true,
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
      },
    });

    res.json({ success: true, data: ninos });
  } catch (error) {
    console.error('Error al obtener niños:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// GET /api/ninos/perfil/:id
// Perfil ligero del niño (para cargar al iniciar sesión)
// ============================================
router.get('/perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const nino = await prisma.nino.findUnique({
      where: { id },
      select: {
        id: true,
        docenteId: true,
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
        docente: { select: { nombre: true } },
      },
    });

    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    res.json({ success: true, data: nino });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// POST /api/ninos/recompensa/:id
// Guardar recompensas tras completar un nivel
// ============================================
const recompensaSchema = z.object({
  monedasGanadas: z.number().int().min(0).default(15),
  puntosGanados: z.number().int().min(0).default(30),
  estrellasGanadas: z.number().int().min(0).default(1),
  nivelAlcanzado: z.number().int().min(1).optional(),
});

router.post('/recompensa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = recompensaSchema.parse(req.body);

    const nino = await prisma.nino.findUnique({ where: { id } });
    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    const actualizado = await prisma.nino.update({
      where: { id },
      data: {
        monedas: { increment: data.monedasGanadas },
        puntos: { increment: data.puntosGanados },
        estrellas: { increment: data.estrellasGanadas },
        actividadesCompletadas: { increment: 1 },
        ...(data.nivelAlcanzado && data.nivelAlcanzado > nino.nivelActual
          ? { nivelActual: data.nivelAlcanzado }
          : {}),
      },
      select: {
        id: true,
        monedas: true,
        puntos: true,
        estrellas: true,
        nivelActual: true,
        actividadesCompletadas: true,
      },
    });

    res.json({ success: true, data: actualizado });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error al guardar recompensa:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// GET /api/ninos/:id
// Obtener un niño por ID con todo su progreso
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const nino = await prisma.nino.findUnique({
      where: { id },
      include: {
        docente: { select: { id: true, nombre: true, email: true } },
        progreso: true,
        sesiones: {
          orderBy: { fechaInicio: 'desc' },
          take: 10,
        },
        intentos: {
          orderBy: { creadoEn: 'desc' },
          take: 50,
          include: {
            actividad: { select: { titulo: true, tipoActividad: true } },
          },
        },
      },
    });

    if (!nino) {
      return res.status(404).json({ success: false, error: 'Niño no encontrado' });
    }

    res.json({ success: true, data: nino });
  } catch (error) {
    console.error('Error al obtener niño:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// POST /api/ninos
// Crear un nuevo niño
// ============================================
router.post('/', async (req, res) => {
  try {
    const { docenteId, nombreCompleto, codigoAlumno, edad } = req.body;

    const nino = await prisma.nino.create({
      data: {
        docenteId,
        nombreCompleto,
        codigoAlumno,
        edad,
      },
    });

    res.status(201).json({ success: true, data: nino });
  } catch (error) {
    console.error('Error al crear niño:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

export default router;
