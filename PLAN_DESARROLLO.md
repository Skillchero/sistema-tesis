# 📋 PLAN DE DESARROLLO - Plataforma Web Interactiva con IA para Educación Inicial

## Resumen del Sistema

Plataforma web adaptativa para niños de 4-5 años que enseña uso progresivo de computadoras, con IA basada en reglas heurísticas, panel docente y diseño responsive (computadoras + tablets).

---

## 1. STACK TECNOLÓGICO PROPUESTO

### Frontend (Interfaz del niño y Panel docente)
- **Framework**: React 18 + TypeScript
- **Estilos**: Tailwind CSS (rápido, ligero, fácil de mantener)
- **Animaciones**: Framer Motion (transiciones suaves, sin saturación visual)
- **Iconos**: Lucide React (iconos claros para niños)
- **Estado global**: Zustand (ligero y simple)
- **Responsive**: Tailwind breakpoints (móvil/tablet/desktop)

### Backend (API y lógica de negocio)
- **Runtime**: Node.js + Express
- **Base de datos**: PostgreSQL
- **ORM**: Prisma (tipado, migraciones fáciles)
- **Autenticación**: JWT + bcrypt
- **API**: RESTful

### IA Adaptativa (Heurísticas)
- Motor de reglas simple en TypeScript
- Basado en: aciertos/errores, tiempo de respuesta, patrones de interacción
- Ajusta dificultad, tipo de actividad y retroalimentación

### Infraestructura
- **Despliegue**: Vercel (frontend) + Railway/Supabase (backend + DB)
- **Monitoreo**: Logs de actividad por niño

---

## 2. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                     NAVEGADOR WEB                       │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │   INTERFAZ NIÑO  │      │    PANEL DOCENTE         │ │
│  │  - Actividades   │      │  - Dashboard             │ │
│  │  - Niveles       │      │  - Progreso por niño     │ │
│  │  - Retroaliment. │      │  - Métricas y reportes   │ │
│  └──────────────────┘      └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API REST (Express)                   │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Auth       │ │ Actividades  │ │ IA Adaptativa    │  │
│  │ JWT+bcrypt │ │ CRUD + Lógica│ │ Heurísticas      │  │
│  └────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Estudiantes│ │ Progreso     │ │ Configuración    │  │
│  │ Gestión    │ │ Registro     │ │ IA/Reglas        │  │
│  └────────────┘ └──────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                 │
│  - Usuarios (docentes, niños)                           │
│  - Actividades (por nivel y dimensión)                  │
│  - Sesiones de aprendizaje                              │
│  - Intentos y resultados                                │
│  - Progreso histórico                                   │
│  - Configuración IA                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. MÓDELLO DE DATOS (Esquema de Base de Datos)

### Tabla: `usuarios`
```sql
- id (PK, UUID)
- nombre (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- rol (ENUM: 'docente', 'admin')
- creado_en (TIMESTAMP)
```

### Tabla: `ninos`
```sql
- id (PK, UUID)
- docente_id (FK → usuarios)
- nombre_completo (VARCHAR)
- codigo_alumno (VARCHAR) -- "Alumno 1", "Alumno 2", etc.
- edad (INT) -- 4 o 5
- fecha_nacimiento (DATE, nullable)
- activo (BOOLEAN)
- nivel_actual (INT) -- 1-6 (progresión)
- created_at, updated_at
```

### Tabla: `actividades`
```sql
- id (PK, UUID)
- titulo (VARCHAR)
- descripcion (TEXT)
- dimension (ENUM: 'reconocimiento', 'interaccion', 'autonomia')
- tipo_actividad (ENUM: 
    'reconocer_componente', -- Seleccionar monitor/teclado/etc
    'hacer_clic', -- Clic en el elemento correcto
    'mover_cursor', -- Mover mouse a destino
    'arrastrar_soltar', -- Drag and drop
    'seguir_instruccion', -- Siga la instrucción visual
    'secuencia_paso' -- Ordenar pasos
  )
- nivel_dificultad (INT) -- 1-6
- configuracion (JSONB) -- Config específica: tiempos, pistas, retroalimentación
- instrucciones (JSONB) -- Texto + audio + imagen
- es_pregunta (BOOLEAN)
- opciones (JSONB) -- Para actividades de selección
- respuesta_correcta (VARCHAR/JSONB)
- pista (TEXT)
- tiempo_limite_segundos (INT, nullable)
- imagen_url (VARCHAR, nullable)
- audio_url (VARCHAR, nullable)
- created_at, updated_at
```

### Tabla: `sesiones_aprendizaje`
```sql
- id (PK, UUID)
- nino_id (FK → ninos)
- fecha_inicio (TIMESTAMP)
- fecha_fin (TIMESTAMP, nullable)
- estado (ENUM: 'activa', 'completada', 'pausada')
- nivel_inicial (INT)
- nivel_final (INT, nullable)
- created_at
```

### Tabla: `intentos_actividad`
```sql
- id (PK, UUID)
- sesion_id (FK → sesiones_aprendizaje)
- actividad_id (FK → actividades)
- nino_id (FK → ninos)
- resultado (ENUM: 'correcto', 'incorrecto', 'abandonado')
- tiempo_respuesta_ms (INT)
- pistas_utilizadas (INT)
- intentos_totales (INT)
- nivel_dificultad (INT)
- created_at
```

### Tabla: `progreso_nino`
```sql
- id (PK, UUID)
- nino_id (FK → ninos)
- dimension (ENUM: 'reconocimiento', 'interaccion', 'autonomia')
- puntaje_acumulado (DECIMAL)
- total_actividades (INT)
- actividades_correctas (INT)
- nivel_dominio (ENUM: 'bajo', 'regular', 'alto')
- ultima_actividad (TIMESTAMP)
- updated_at
```

### Tabla: `configuracion_ia`
```sql
- id (PK, UUID)
- nombre_regla (VARCHAR)
- condicion (JSONB) -- {"metrica": "tasa_aciertos", "operador": ">=", "valor": 0.8}
- accion (JSONB) -- {"tipo": "subir_nivel", "cantidad": 1}
- prioridad (INT)
- activa (BOOLEAN)
- created_at, updated_at
```

---

## 4. MOTOR DE IA ADAPTATIVA (Heurísticas)

### Métricas que se registran:
1. **Tasa de aciertos**: correctos / total intentos
2. **Tiempo promedio de respuesta**: por actividad
3. **Pistas utilizadas**: cuántas ayudas necesitó
4. **Consistencia**: si mantiene el rendimiento o decae
5. **Patrones de error**: qué tipos de actividades falla más

### Reglas de adaptación:

```javascript
// EJEMPLO: Reglas del motor de IA
const reglasIA = [
  {
    nombre: "Subir de nivel",
    condicion: { tasa_aciertos: ">= 0.8", tiempo_promedio: "< 5000" },
    accion: { tipo: "subir_nivel", cantidad: 1 },
    prioridad: 1
  },
  {
    nombre: "Mantener nivel",
    condicion: { tasa_aciertos: ">= 0.6", tasa_aciertos: "< 0.8" },
    accion: { tipo: "mantener_nivel" },
    prioridad: 2
  },
  {
    nombre: "Bajar de nivel (repetir)",
    condicion: { tasa_aciertos: "< 0.6" },
    accion: { tipo: "bajar_nivel", cantidad: 1 },
    prioridad: 3
  },
  {
    nombre: "Dar pista automática",
    condicion: { tiempo_respuesta: "> 15000", pistas_utilizadas: "== 0" },
    accion: { tipo: "mostrar_pista" },
    prioridad: 4
  },
  {
    nombre: "Reforzar dimensión débil",
    condicion: { dimension_con_mayor_error: "reconocimiento" },
    accion: { tipo: "aumentar_peso_dimension", dimension: "reconocimiento" },
    prioridad: 5
  }
];
```

### Niveles de dificultad:
- **Nivel 1**: Reconocer componentes con nombres (facilidad máxima)
- **Nivel 2**: Reconocer componentes sin nombres, solo imagen
- **Nivel 3**: Hacer clic en componentes específicos
- **Nivel 4**: Mover cursor a ubicaciones específicas
- **Nivel 5**: Arrastrar y soltar elementos
- **Nivel 6**: Seguir instrucciones complejas (combinación)

### Retroalimentación adaptativa:
- **Correcto rápido**: Elogio entusiasta + sonido + animación
- **Correcto lento**: Elogio calmado + mensaje
- **Incorrecto**: Sonido suave + pista visual (nunca error penalizante)
- **3 errores seguidos**: Mostrar respuesta + explicación + repetir similar

---

## 5. MÓDULOS DEL SISTEMA

### Módulo 1: Autenticación
- [ ] Login de docente
- [ ] Registro de docente
- [ ] Recuperar contraseña
- [ ] Gestión de sesión (JWT)
- [ ] Protección de rutas

### Módulo 2: Panel Docente - Dashboard
- [ ] Lista de niños registrados
- [ ] Estadísticas generales (promedio general, nivel actual)
- [ ] Gráfico de progreso por dimensión
- [ ] Última actividad de cada niño
- [ ] Filtros y búsqueda

### Módulo 3: Panel Docente - Gestión de Niños
- [ ] Registrar niño (nombre, edad, código)
- [ ] Editar información del niño
- [ ] Activar/desactivar niño
- [ ] Ver detalle individual de cada niño
- [ ] Ver historial de sesiones

### Módulo 4: Panel Docente - Reportes
- [ ] Reporte de progreso por niño (pretest/posttest simulado)
- [ ] Reporte por dimensión (reconocimiento, interacción, autonomía)
- [ ] Métricas de uso (tiempo, sesiones, actividades)
- [ ] Exportar datos (CSV/PDF)

### Módulo 5: Motor de IA Adaptativa
- [ ] Evaluación continua del rendimiento
- [ ] Ajuste de nivel de dificultad
- [ ] Selección de próxima actividad
- [ ] Generación de retroalimentación
- [ ] Registro de métricas para IA

### Módulo 6: Biblioteca de Actividades (para el niño)
- [ ] Actividades de **Reconocimiento** (Dimension 1):
  - [ ] ¿Cuál es el monitor?
  - [ ] ¿Cuál es el teclado?
  - [ ] ¿Cuál es el mouse?
  - [ ] ¿Cuál es la CPU?
  - [ ] Relacionar componente con función

- [ ] Actividades de **Interacción** (Dimensión 2):
  - [ ] Hacer clic en el elemento correcto
  - [ ] Mover el cursor al objetivo
  - [ ] Arrastrar elemento a destino
  - [ ] Seleccionar opción múltiple (con imagen)
  - [ ] Seguir flechas/instrucciones visuales

- [ ] Actividades de **Autonomía** (Dimensión 3):
  - [ ] Completar secuencia de pasos
  - [ ] Resolver puzzle de componentes
  - [ ] Actividad combinada (reconocer + hacer clic)

### Módulo 7: Interfaz del Niño
- [ ] Pantalla de inicio de sesión simplificada (código de alumno)
- [ ] Menú de actividades por nivel/dimensión
- [ ] Pantalla de actividad (una por vez)
- [ ] Retroalimentación visual/auditiva inmediata
- [ ] Pantalla de "¡Muy bien!" / "¡Inténtalo de nuevo!"
- [ ] Pantalla de progreso ("Has completado 3/5")
- [ ] Animaciones y sonidos de recompensa
- [ ] Diseño responsive (tablet + computadora)

### Módulo 8: Sistema de Puntuación y Progresión
- [ ] Puntos por actividad correcta
- [ ] Sistema de estrellas (1-3 por actividad)
- [ ] Desbloqueo de niveles
- [ ] Insignias/logros por hitos
- [ ] Ranking opcional (entre niños del mismo docente)

---

## 6. DISEÑO UX/UI PRINCIPIOS (según tesis)

### Para el niño:
- ✅ **Una actividad por pantalla** - sin distracciones
- ✅ **Poca saturación visual** - colores suaves, espacios amplios
- ✅ **Iconos grandes y claros** - mínimo texto
- ✅ **Retroalimentación inmediata** - < 1 segundo respuesta
- ✅ **Animaciones suaves** - no sobreestimulantes
- ✅ **Audio + visual** - doble codificación
- ✅ **Diseño táctil** - botones grandes (> 48px)
- ✅ **Progresión visible** - barra de avance, estrellas

### Para el docente:
- ✅ **Dashboard limpio** - información jerárquica
- ✅ **Accesos rápidos** - menos de 3 clics a cualquier dato
- ✅ **Visualización clara** - gráficos simples
- ✅ **Responsive** - usable en tablet también

---

## 7. FASES DE DESARROLLO

### 📌 Fase 0: Estructura Base (Día 1)
- [ ] Inicializar proyecto React + TypeScript
- [ ] Configurar Tailwind CSS + Framer Motion
- [ ] Estructura de carpetas
- [ ] Inicializar backend Express + Prisma
- [ ] Configurar PostgreSQL
- [ ] Configurar variables de entorno

### 📌 Fase 1: Autenticación + Estructura (Día 2-3)
- [ ] Tablas de base de datos (migración inicial)
- [ ] Endpoints de auth (register, login, logout)
- [ ] Login UI (docente)
- [ ] Protección de rutas (frontend + backend)
- [ ] Layout del panel docente (sidebar + header)

### 📌 Fase 2: Panel Docente - Niños (Día 4-5)
- [ ] CRUD de niños (crear, leer, editar, desactivar)
- [ ] Lista de niños con búsqueda y filtros
- [ ] Vista individual de niño con estadísticas básicas
- [ ] Asignación de actividades a niño

### 📌 Fase 3: Motor de IA Adaptativa (Día 6-7)
- [ ] Tabla de configuración IA
- [ ] Servicio de evaluación de rendimiento
- [ ] Motor de reglas (evaluar → decidir → ejecutar)
- [ ] Endpoints para obtener siguiente actividad
- [ ] Endpoints para registrar intentos

### 📌 Fase 4: Biblioteca de Actividades (Día 8-10)
- [ ] Seed de actividades de Reconocimiento (10+)
- [ ] Seed de actividades de Interacción (10+)
- [ ] Seed de actividades de Autonomía (5+)
- [ ] Sistema de carga de actividades por nivel
- [ ] Configuración de dificultad por actividad

### 📌 Fase 5: Interfaz del Niño (Día 11-14)
- [ ] Pantalla de inicio de sesión por código
- [ ] Menú de actividades
- [ ] Componente de actividad: Reconocimiento
- [ ] Componente de actividad: Interacción
- [ ] Componente de actividad: Autonomía
- [ ] Sistema de retroalimentación (sonido + visual)
- [ ] Pantalla de progreso y resultados
- [ ] Animaciones y transiciones

### 📌 Fase 6: Integración y Reportes (Día 15-17)
- [ ] Conectar interfaz del niño con motor IA
- [ ] Dashboard docente con datos reales
- [ ] Gráficos de progreso (Chart.js / Recharts)
- [ ] Sistema de reportes básicos
- [ ] Exportar datos (CSV)

### 📌 Fase 7: Pulido y Despliegue (Día 18-20)
- [ ] Testing completo (flujos principales)
- [ ] Optimización de rendimiento
- [ ] Responsive final (tablet + desktop)
- [ ] Sonidos y animaciones finales
- [ ] Despliegue en Vercel + Railway/Supabase
- [ ] Documentación de uso

---

## 8. TECNOLOGÍAS Y LIBRERÍAS A USAR

| Categoría | Tecnología | Propósito |
|-----------|-----------|-----------|
| Frontend | React 18 + TypeScript | Interfaz moderna y tipada |
| Estilos | Tailwind CSS | Estilos rápidos, responsive |
| Animaciones | Framer Motion | Transiciones suaves |
| Iconos | Lucide React | Iconos claros y consistentes |
| Sonidos | Howler.js | Efectos de sonido |
| Gráficos | Recharts | Dashboard del docente |
| Estado | Zustand | Gestión de estado ligera |
| Backend | Node.js + Express | API REST |
| ORM | Prisma | Acceso a base de datos |
| DB | PostgreSQL | Base de datos robusta |
| Auth | JWT + bcrypt | Autenticación segura |
| Validación | Zod | Validación de datos |
| Hosting FE | Vercel | Despliegue frontend |
| Hosting BE | Railway | Despliegue backend + DB |

---

## 9. PENDIENTES DEL USUARIO

- [ ] **Bocetos/diseños** que mencionaste (para adaptar la UI)
- [ ] **Logo o branding** específico del proyecto
- [ ] **Colores corporativos** (si tienen identidad visual)
- [ ] **Contenido de actividades específico** (preguntas exactas)
- [ ] **Sonidos** preferidos (o los proporciono yo)
- [ ] **Acceso a hosting/base de datos** (o los creo yo)

---

## 10. COSTOS ESTIMADOS (si usas servicios gratuitos)

| Servicio | Tier Gratis | Límites |
|----------|------------|---------|
| Vercel | Hobby | 100GB bandwidth/mes |
| Railway | Hobby | $5 crédito/mes |
| Supabase | Free | 500MB DB, 50K usuarios activos |
| **Total** | **$0** | **Suficiente para MVP** |

---

*Plan actualizado: 26 octubre 2026*
