// ============================================
// SERVIDOR PRINCIPAL - API
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth.routes';
import ninoRoutes from './routes/ninos.routes';
import actividadRoutes from './routes/actividades.routes';
import progresoRoutes from './routes/progreso.routes';
import iaRoutes from './routes/ia.routes';

// Configurar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Prisma
export const prisma = new PrismaClient();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/ninos', ninoRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/ia', iaRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
async function main() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');

    // Solo escuchar en local (en Vercel no se necesita app.listen)
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      });
    }
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    // No salir en Vercel para que el error se vea en logs
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Desconectado de PostgreSQL');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Solo ejecutar main en local, en Vercel solo exportar la app
if (process.env.VERCEL !== '1') {
  main();
}

// Exportar la app para Vercel serverless
export default app;
