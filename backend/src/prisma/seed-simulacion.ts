// ============================================
// INYECCIÓN DE DATOS DE SIMULACIÓN v2
// • 45-55 intentos por alumno (pasa 20)
// • 20+ horas de sesiones por alumno
// • Progresión: inicio 50/50 → final 90/10
// • Estado final: "Bien" con desaciertos realistas
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JUEGOS = [
  'aprende-usar',
  'pinta-la-compu',
  'laberinto',
  'clasifica',
  'carrera',
  'pizarra-magica',
  'apunta-y-gana',
  'copia-y-juega',
  'colores-del-mundo',
];

// Mapeo Likert: Likert = 1 + 4 × precisión
function calcularLikert(precision: number): number {
  return Math.round((1 + 4 * precision) * 100) / 100;
}

async function main() {
  console.log('💉 Inyección de datos v2 - Simulación realista...\n');

  // ============================================
  // LIMPIAR DATOS ANTERIORES
  // ============================================
  await prisma.intentoActividad.deleteMany();
  await prisma.sesionAprendizaje.deleteMany();
  await prisma.progresoNino.deleteMany();
  await prisma.actividad.deleteMany();
  console.log('🗑️  Datos anteriores limpiados\n');

  // ============================================
  // CREAR ACTIVIDADES (9 juegos × 20 niveles)
  // ============================================
  const actividades = new Map<string, string>();

  for (const juego of JUEGOS) {
    for (let nivel = 1; nivel <= 20; nivel++) {
      const act = await prisma.actividad.create({
        data: {
          titulo: `${juego}-nivel-${nivel}`,
          descripcion: `Actividad de ${juego} nivel ${nivel}`,
          dimension: 'INTERACCION',
          tipoActividad: 'HACER_CLIC',
          nivelDificultad: nivel,
          instrucciones: { juego, nivel },
        },
      });
      actividades.set(`${juego}-${nivel}`, act.id);
    }
  }
  console.log(`📚 ${actividades.size} actividades creadas\n`);

  // ============================================
  // OBTENER NIÑOS
  // ============================================
  const ninos = await prisma.nino.findMany({
    orderBy: [{ docenteId: 'asc' }, { codigoAlumno: 'asc' }],
  });
  console.log(`👧👦 ${ninos.length} niños encontrados\n`);

  // ============================================
  // PLAN POR ALUMNO
  //
  // Total intentos: 45-55 (varía por alumno)
  // Distribución de errores (90/10 general):
  //   • Primeros ~10 intentos: 50% errores (fase de aprendizaje)
  //   • Siguientes ~15 intentos: ~13% errores (mejora)
  //   • Resto: ~2% errores (dominio)
  //
  // Horas: 12-16 sesiones × 60-100 min = 20+ horas
  // ============================================

  const resultados: Array<{
    codigo: string;
    totalIntentos: number;
    aciertos: number;
    errores: number;
    precision: number;
    likert: number;
    horas: number;
    sesiones: number;
    monedas: number;
    estado: string;
  }> = [];

  let sumaLikert = 0;

  for (let idx = 0; idx < ninos.length; idx++) {
    const nino = ninos[idx];

    // ============================================
    // DETERMINAR CANTIDADES
    // ============================================
    const totalIntentos = 45 + (idx % 11); // 45-55 intentos

    // Distribución de errores para 90/10:
    // Fase 1 (primeros ~20%): 50% errores
    // Fase 2 (siguientes ~30%): ~15% errores
    // Fase 3 (resto ~50%): ~2% errores
    const fase1Len = Math.round(totalIntentos * 0.20); // ~10 intentos
    const fase2Len = Math.round(totalIntentos * 0.30); // ~15 intentos
    const fase3Len = totalIntentos - fase1Len - fase2Len; // ~20+ intentos

    // Fase 1: 50% errores (aprendizaje inicial)
    const erroresFase1 = Math.floor(fase1Len * 0.5);
    const aciertosFase1 = fase1Len - erroresFase1;

    // Fase 2: ~13% errores (mejora gradual)
    const erroresFase2 = Math.floor(fase2Len * 0.13);
    const aciertosFase2 = fase2Len - erroresFase2;

    // Fase 3: ~3% errores (dominio)
    const erroresFase3 = Math.floor(fase3Len * 0.03);
    const aciertosFase3 = fase3Len - erroresFase3;

    const totalAciertos = aciertosFase1 + aciertosFase2 + aciertosFase3;
    const totalErrores = erroresFase1 + erroresFase2 + erroresFase3;
    const precision = totalAciertos / totalIntentos;
    const likert = calcularLikert(precision);
    sumaLikert += likert;

    // ============================================
    // CREAR SESIONES (12-16 sesiones, 20+ horas total)
    // ============================================
    const numSesiones = 12 + (idx % 5); // 12-16 sesiones
    const minutosPorSesion = 75 + (idx % 4) * 10; // 75-105 min
    const horasTotales = (numSesiones * minutosPorSesion) / 60;

    // Distribuir intentos en sesiones
    const intentosPorSesion = Math.ceil(totalIntentos / numSesiones);

    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() - 30); // empezar hace 30 días

    const sesionIds: string[] = [];
    let intentoGlobal = 0;

    for (let s = 0; s < numSesiones; s++) {
      const fechaSesion = new Date(fechaBase);
      fechaSesion.setDate(fechaSesion.getDate() + Math.floor(s * 30 / numSesiones));
      fechaSesion.setHours(8 + (s % 8), (s * 13) % 60, 0, 0);

      const fechaFin = new Date(fechaSesion.getTime() + minutosPorSesion * 60000);

      const sesion = await prisma.sesionAprendizaje.create({
        data: {
          ninoId: nino.id,
          fechaInicio: fechaSesion,
          fechaFin,
          estado: 'COMPLETADA',
          nivelInicial: Math.max(1, Math.floor(intentoGlobal / 5)),
          nivelFinal: Math.min(20, Math.ceil((intentoGlobal + intentosPorSesion) / 5)),
        },
      });
      sesionIds.push(sesion.id);

      // Crear intentos de esta sesión
      const intentosEstaSesion = Math.min(intentosPorSesion, totalIntentos - intentoGlobal);

      for (let i = 0; i < intentosEstaSesion; i++) {
        const esError = determinarSiError(intentoGlobal, erroresFase1, erroresFase2, erroresFase3, fase1Len, fase2Len);
        intentoGlobal++;

        const juego = JUEGOS[(intentoGlobal + idx) % JUEGOS.length];
        const nivel = ((intentoGlobal - 1) % 20) + 1;
        const actId = actividades.get(`${juego}-${nivel}`);
        if (!actId) continue;

        const tiempoMs = esError
          ? 20000 + Math.floor(Math.random() * 30000) // 20-50 seg (más lento en errores)
          : 4000 + Math.floor(Math.random() * 12000); // 4-16 seg

        const fechaIntento = new Date(
          fechaSesion.getTime() + i * (minutosPorSesion * 60000 / intentosEstaSesion)
        );

        await prisma.intentoActividad.create({
          data: {
            sesionId: sesion.id,
            actividadId: actId,
            ninoId: nino.id,
            resultado: esError ? 'INCORRECTO' : 'CORRECTO',
            tiempoRespuestaMs: tiempoMs,
            pistasUtilizadas: esError ? 1 + Math.floor(Math.random() * 2) : (intentoGlobal % 4 === 0 ? 1 : 0),
            intentosTotales: 1,
            nivelDificultad: nivel,
            creadoEn: fechaIntento,
          },
        });
      }
    }

    // ============================================
    // ACTUALIZAR CONTADORES DEL NIÑO
    // ============================================
    const monedas = 50 + totalAciertos * 15;
    const puntos = totalAciertos * 30;
    const estrellas = totalAciertos;
    const nivelActual = Math.min(Math.floor(totalAciertos / 3) + 1, 20);

    await prisma.nino.update({
      where: { id: nino.id },
      data: {
        monedas,
        puntos,
        estrellas,
        nivelActual,
        actividadesCompletadas: totalAciertos,
        desaciertos: totalErrores,
        intentosTotales: totalIntentos,
        actualizadoEn: new Date(),
      },
    });

    // ============================================
    // CREAR REGISTRO DE PROGRESO
    // ============================================
    const nivelDominio = precision >= 0.8 ? 'ALTO' : precision >= 0.5 ? 'REGULAR' : 'BAJO';

    await prisma.progresoNino.create({
      data: {
        ninoId: nino.id,
        dimension: 'INTERACCION',
        puntajeAcumulado: precision * 100,
        totalActividades: totalIntentos,
        actividadesCorrectas: totalAciertos,
        nivelDominio,
        ultimaActividad: fechaBase,
      },
    });

    const estado = precision >= 0.5 ? 'Bien' : 'Necesita ayuda';

    resultados.push({
      codigo: nino.codigoAlumno,
      totalIntentos,
      aciertos: totalAciertos,
      errores: totalErrores,
      precision: Math.round(precision * 1000) / 10,
      likert,
      horas: Math.round(horasTotales * 10) / 10,
      sesiones: numSesiones,
      monedas,
      estado,
    });
  }

  // ============================================
  // MOSTRAR RESULTADOS
  // ============================================
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   RESULTADOS DE LA SIMULACIÓN v2');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log('Código  | Intentos | Aciertos | Errores | Precisión | Likert | Horas | Sesiones | Estado');
  console.log('--------|----------|----------|---------|-----------|--------|-------|----------|-------');
  for (const r of resultados) {
    console.log(
      `${r.codigo.padEnd(7)} | ${String(r.totalIntentos).padEnd(8)} | ${String(r.aciertos).padEnd(8)} | ${String(r.errores).padEnd(7)} | ${String(r.precision + '%').padEnd(9)} | ${String(r.likert).padEnd(6)} | ${String(r.horas).padEnd(5)} | ${String(r.sesiones).padEnd(8)} | ${r.estado}`
    );
  }

  const promedioLikert = sumaLikert / ninos.length;
  const totalIntentosG = resultados.reduce((a, r) => a + r.totalIntentos, 0);
  const totalAciertosG = resultados.reduce((a, r) => a + r.aciertos, 0);
  const totalErroresG = resultados.reduce((a, r) => a + r.errores, 0);
  const totalHorasG = resultados.reduce((a, r) => a + r.horas, 0);
  const precisionGlobal = (totalAciertosG / totalIntentosG) * 100;

  // Porcentaje de mejora
  const alumnosBien = resultados.filter(r => r.estado === 'Bien').length;

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('   RESUMEN GENERAL');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  📊 Promedio Likert (1-5):  ${promedioLikert.toFixed(2)}`);
  console.log(`  📈 Precisión global:       ${precisionGlobal.toFixed(1)}%`);
  console.log(`  ✅ Aciertos totales:       ${totalAciertosG}`);
  console.log(`  ❌ Desaciertos totales:    ${totalErroresG}`);
  console.log(`  ⚖️  Ratio aciertos/errores: ${Math.round(precisionGlobal)}/${100 - Math.round(precisionGlobal)}`);
  console.log(`  🎮 Intentos promedio/alumno: ${(totalIntentosG / 30).toFixed(1)}`);
  console.log(`  ⏱️  Horas totales:          ${totalHorasG.toFixed(0)}h`);
  console.log(`  ⏱️  Horas promedio/alumno:  ${(totalHorasG / 30).toFixed(1)}h`);
  console.log(`  👧👦 Alumnos en estado "Bien": ${alumnosBien}/30`);
  console.log(`  🪙 Monedas totales:        ${resultados.reduce((a, r) => a + r.monedas, 0)}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Verificar progresión
  console.log('📈 PROGRESIÓN PROMEDIO (primeros vs últimos intentos):');
  const muestraEstudiantes = [0, 7, 15, 22, 29];
  for (const i of muestraEstudiantes) {
    const r = resultados[i];
    const fase1Pct = 50; // Primeros ~10 intentos: 50% aciertos
    const faseFinal = r.precision;
    console.log(`   ${r.codigo}: Inicio ~50% → Final ${faseFinal}% (mejora +${(faseFinal - 50).toFixed(1)}%)`);
  }

  console.log('\n✅ Inyección de datos v2 completada!');
}

// Determinar si un intento es error, basado en la posición global
function determinarSiError(
  posicion: number,
  erroresFase1: number,
  erroresFase2: number,
  erroresFase3: number,
  fase1Len: number,
  fase2Len: number
): boolean {
  if (posicion < fase1Len) {
    // Fase 1: distribuir errores uniformemente
    return posicion % 2 === 1 && posicion < erroresFase1 * 2;
  } else if (posicion < fase1Len + fase2Len) {
    // Fase 2: menos errores
    const posEnFase = posicion - fase1Len;
    return posEnFase % Math.max(1, Math.floor(fase2Len / Math.max(1, erroresFase2))) === 0 && erroresFase2 > 0;
  } else {
    // Fase 3: muy pocos errores
    const posEnFase = posicion - fase1Len - fase2Len;
    return erroresFase3 > 0 && posEnFase % Math.max(1, Math.floor((fase1Len + fase2Len + 20) / Math.max(1, erroresFase3))) === 0;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
