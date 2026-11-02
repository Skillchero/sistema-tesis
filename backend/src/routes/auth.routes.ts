// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();

// Esquemas de validación
const registerSchema = z.object({
  nombre: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ============================================
// POST /api/auth/register
// ============================================
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado',
      });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Crear usuario
    const user = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        passwordHash,
      },
    });

    // Generar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.issues,
      });
    }
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.issues,
      });
    }
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

export default router;
