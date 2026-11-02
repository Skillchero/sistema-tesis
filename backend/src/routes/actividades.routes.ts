// ============================================
// RUTAS DE ACTIVIDADES
// ============================================

import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// ============================================
// GET /api/actividades
// Listar todas las actividades
// ============================================
router.get('/', async (req, res) => {
  try {
    const actividades = await prisma.actividad.findMany({
      orderBy: [{ tipoActividad: 'asc' }, { nivelDificultad: 'asc' }],
    });

    res.json({ success: true, data: actividades });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// GET /api/actividades/juego/:juegoId
// Obtener niveles de un juego específico
// ============================================
router.get('/juego/:juegoId', async (req, res) => {
  try {
    const { juegoId } = req.params;

    const actividades = await prisma.actividad.findMany({
      where: { titulo: { startsWith: juegoId } },
      orderBy: { nivelDificultad: 'asc' },
    });

    res.json({ success: true, data: actividades });
  } catch (error) {
    console.error('Error al obtener actividades del juego:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ============================================
// POST /api/actividades
// Crear una actividad
// ============================================
router.post('/', async (req, res) => {
  try {
    const actividad = await prisma.actividad.create({ data: req.body });
    res.status(201).json({ success: true, data: actividad });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

export default router;
