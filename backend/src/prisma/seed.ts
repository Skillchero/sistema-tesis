// ============================================
// SEED: Datos iniciales para la base de datos
// 6 docentes x 5 alumnos = 30 estudiantes
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

  // Limpiar datos existentes (en orden por dependencias)
  await prisma.intentoActividad.deleteMany();
  await prisma.sesionAprendizaje.deleteMany();
  await prisma.progresoNino.deleteMany();
  await prisma.actividad.deleteMany();
  await prisma.nino.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.configuracionIA.deleteMany();

  // ============================================
  // DOCENTES (6)
  // ============================================
  const passwordHash = await bcrypt.hash('123456', 10);

  const docentesData = [
    { id: 'doc1', nombre: 'Docente 1', email: 'docente1@colegio.edu', curso: '4 años - Sección A' },
    { id: 'doc2', nombre: 'Docente 2', email: 'docente2@colegio.edu', curso: '4 años - Sección B' },
    { id: 'doc3', nombre: 'Docente 3', email: 'docente3@colegio.edu', curso: '5 años - Sección A' },
    { id: 'doc4', nombre: 'Docente 4', email: 'docente4@colegio.edu', curso: '5 años - Sección B' },
    { id: 'doc5', nombre: 'Docente 5', email: 'docente5@colegio.edu', curso: '4 años - Sección C' },
    { id: 'doc6', nombre: 'Docente 6', email: 'docente6@colegio.edu', curso: '5 años - Sección C' },
  ];

  const docentes: Record<string, any> = {};

  for (const d of docentesData) {
    const docente = await prisma.usuario.create({
      data: {
        id: d.id,
        nombre: d.nombre,
        email: d.email,
        passwordHash,
        rol: 'DOCENTE',
      },
    });
    docentes[d.id] = docente;
    console.log(`  ✅ ${d.nombre} (${d.email}) - ${d.curso}`);
  }

  // ============================================
  // NIÑOS (30) - 5 por docente
  // ============================================
  const secciones: Record<string, { curso: string; edad: number; prefijo: string }> = {
    doc1: { curso: '4 años - Sección A', edad: 4, prefijo: 'A' },
    doc2: { curso: '4 años - Sección B', edad: 4, prefijo: 'B' },
    doc3: { curso: '5 años - Sección A', edad: 5, prefijo: 'C' },
    doc4: { curso: '5 años - Sección B', edad: 5, prefijo: 'D' },
    doc5: { curso: '4 años - Sección C', edad: 4, prefijo: 'E' },
    doc6: { curso: '5 años - Sección C', edad: 5, prefijo: 'F' },
  };

  let totalAlumnos = 0;

  for (const docId of Object.keys(secciones)) {
    const { edad, prefijo } = secciones[docId];
    const docenteNum = docId.replace('doc', '');

    for (let i = 1; i <= 5; i++) {
      const codigo = `${prefijo}00${i}`;
      const id = `a${docenteNum}-${i}`;

      await prisma.nino.create({
        data: {
          id,
          docenteId: docId,
          nombreCompleto: `Alumno ${i}`,
          codigoAlumno: codigo,
          edad,
          nivelActual: 1,
        },
      });
      totalAlumnos++;
    }
    console.log(`  ✅ 5 alumnos creados para ${secciones[docId].curso} (Docente ${docenteNum})`);
  }

  console.log(`\n📊 Resumen:`);
  console.log(`  👨‍🏫 Docentes: ${docentesData.length}`);
  console.log(`  👧👦 Alumnos: ${totalAlumnos}`);
  console.log(`  🔑 Contraseña de todos: 123456`);
  console.log('\n✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
