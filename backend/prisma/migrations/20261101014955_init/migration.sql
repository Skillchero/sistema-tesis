-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DOCENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Dimension" AS ENUM ('RECONOCIMIENTO', 'INTERACCION', 'AUTONOMIA');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('RECONOCER_COMPONENTE', 'HACER_CLIC', 'MOVER_CURSOR', 'ARRASTRAR_SOLTAR', 'SEGUIR_INSTRUCCION', 'SECUENCIA_PASO');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('ACTIVA', 'COMPLETADA', 'PAUSADA');

-- CreateEnum
CREATE TYPE "ResultadoIntento" AS ENUM ('CORRECTO', 'INCORRECTO', 'ABANDONADO');

-- CreateEnum
CREATE TYPE "NivelDominio" AS ENUM ('BAJO', 'REGULAR', 'ALTO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'DOCENTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ninos" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "codigo_alumno" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "nivel_actual" INTEGER NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ninos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "dimension" "Dimension" NOT NULL,
    "tipo_actividad" "TipoActividad" NOT NULL,
    "nivel_dificultad" INTEGER NOT NULL,
    "configuracion" JSONB NOT NULL DEFAULT '{}',
    "instrucciones" JSONB NOT NULL,
    "es_pregunta" BOOLEAN NOT NULL DEFAULT false,
    "opciones" JSONB,
    "respuesta_correcta" TEXT,
    "pista" TEXT,
    "tiempo_limite_seg" INTEGER,
    "imagen_url" TEXT,
    "audio_url" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_aprendizaje" (
    "id" TEXT NOT NULL,
    "nino_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "estado" "EstadoSesion" NOT NULL DEFAULT 'ACTIVA',
    "nivel_inicial" INTEGER NOT NULL,
    "nivel_final" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_aprendizaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_actividad" (
    "id" TEXT NOT NULL,
    "sesion_id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "nino_id" TEXT NOT NULL,
    "resultado" "ResultadoIntento" NOT NULL,
    "tiempo_respuesta_ms" INTEGER NOT NULL,
    "pistas_utilizadas" INTEGER NOT NULL DEFAULT 0,
    "intentos_totales" INTEGER NOT NULL DEFAULT 1,
    "nivel_dificultad" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_nino" (
    "id" TEXT NOT NULL,
    "nino_id" TEXT NOT NULL,
    "dimension" "Dimension" NOT NULL,
    "puntaje_acumulado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_actividades" INTEGER NOT NULL DEFAULT 0,
    "actividades_correctas" INTEGER NOT NULL DEFAULT 0,
    "nivel_dominio" "NivelDominio" NOT NULL DEFAULT 'BAJO',
    "ultima_actividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progreso_nino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_ia" (
    "id" TEXT NOT NULL,
    "nombre_regla" TEXT NOT NULL,
    "condicion" JSONB NOT NULL,
    "accion" JSONB NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ninos_docente_id_codigo_alumno_key" ON "ninos"("docente_id", "codigo_alumno");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_nino_nino_id_dimension_key" ON "progreso_nino"("nino_id", "dimension");

-- AddForeignKey
ALTER TABLE "ninos" ADD CONSTRAINT "ninos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_aprendizaje" ADD CONSTRAINT "sesiones_aprendizaje_nino_id_fkey" FOREIGN KEY ("nino_id") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_actividad" ADD CONSTRAINT "intentos_actividad_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesiones_aprendizaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_actividad" ADD CONSTRAINT "intentos_actividad_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_actividad" ADD CONSTRAINT "intentos_actividad_nino_id_fkey" FOREIGN KEY ("nino_id") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_nino" ADD CONSTRAINT "progreso_nino_nino_id_fkey" FOREIGN KEY ("nino_id") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
