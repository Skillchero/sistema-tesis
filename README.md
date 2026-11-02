# 🎓 Aprendo con la Computadora

## Plataforma Web Interactiva con IA para Educación Inicial

Plataforma educativa desarrollada como parte de la investigación de tesis para enseñar a niños de 4-5 años el uso progresivo de computadoras, con adaptación mediante inteligencia artificial basada en reglas heurísticas.

**Piura, Perú - 2026**

---

## 📋 Índice

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Funcionalidades](#funcionalidades)
- [Estado del Proyecto](#estado-del-proyecto)
- [Despliegue](#despliegue)

---

## 📖 Descripción del Proyecto

Esta plataforma está diseñada para apoyar el aprendizaje progresivo sobre computadoras en niños de nivel inicial (4-5 años), con un enfoque en:

- **Reconocimiento de componentes** (monitor, teclado, mouse, CPU)
- **Interacción con la computadora** (clic, arrastrar, mover cursor)
- **Autonomía digital inicial** (completar actividades independientemente)

### Objetivos de la Investigación

1. **Objetivo General**: Determinar la influencia de una web interactiva con IA en el aprendizaje progresivo sobre computadoras en niños de nivel inicial de Piura, 2026.

2. **Objetivos Específicos**:
   - Diseñar y desarrollar una plataforma web interactiva con componentes de IA
   - Evaluar la funcionalidad y usabilidad de la plataforma
   - Medir el nivel de aprendizaje progresivo antes y después de la implementación
   - Determinar si existe diferencia estadísticamente significativa

---

## ✨ Características

### Para el Niño/Niña
- ✅ **Interfaz amigable** - Colores suaves, iconos grandes, poca saturación visual
- ✅ **Una actividad por pantalla** - Sin distracciones
- ✅ **Retroalimentación inmediata** - Sonidos + animaciones
- ✅ **Progresión adaptativa** - La IA ajusta la dificultad
- ✅ **Responsive** - Funciona en computadora y tablet
- ✅ **Sin dependencia de lectura** - Todo visual

### Para el Docente
- ✅ **Dashboard intuitivo** - Estadísticas claras
- ✅ **Gestión de niños** - Registrar, editar, monitorear
- ✅ **Reportes de progreso** - Por niño y por dimensión
- ✅ **Métricas detalladas** - Intentos, tiempo, errores
- ✅ **Configuración de IA** - Ajustar reglas adaptativas

### Motor de IA Adaptativa
- ✅ **Reglas heurísticas** - Basado en rendimiento
- ✅ **Ajuste automático de dificultad** - Sube/baja niveles
- ✅ **Retroalimentación adaptativa** - Personalizada
- ✅ **Detección de patrones** - Identifica áreas débiles

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| React 18 + TypeScript | Framework UI moderno y tipado |
| Vite | Build tool rápido |
| Tailwind CSS | Estilos utility-first, responsive |
| Framer Motion | Animaciones suaves |
| Lucide React | Iconos consistentes |
| Zustand | Gestión de estado ligera |
| React Router | Enrutamiento SPA |
| Howler.js | Efectos de sonido |
| Recharts | Gráficos para dashboard |
| Zod | Validación de datos |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| Node.js + Express | API REST |
| TypeScript | Tipado estático |
| Prisma ORM | Acceso a base de datos |
| PostgreSQL | Base de datos robusta |
| JWT + bcrypt | Autenticación segura |
| Zod | Validación de esquemas |

### Infraestructura
| Servicio | Propósito |
|----------|-----------|
| Vercel | Hosting frontend (gratis) |
| Railway / Supabase | Hosting backend + DB (gratis) |

---

## 📁 Estructura del Proyecto

```
sistema tesis/
├── 📄 PLAN_DESARROLLO.md        # Documento de planeación
├── 📄 README.md                  # Este archivo
│
├── 📁 frontend/                  # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes reutilizables
│   │   │   ├── 📁 child/         # Componentes para el niño
│   │   │   ├── 📁 teacher/       # Componentes para el docente
│   │   │   ├── 📁 common/        # Componentes comunes
│   │   │   └── 📁 layout/        # Layouts de página
│   │   │
│   │   ├── 📁 pages/             # Páginas/rutas
│   │   │   ├── 📁 auth/          # Login/registro
│   │   │   ├── 📁 child/         # Páginas del niño
│   │   │   └── 📁 teacher/       # Páginas del docente
│   │   │
│   │   ├── 📁 services/          # Servicios API
│   │   │   ├── 📁 api/           # Llamadas HTTP
│   │   │   ├── 📁 ai/            # Lógica IA cliente
│   │   │   └── 📁 audio/         # Sistema de sonidos
│   │   │
│   │   ├── 📁 stores/            # Estado global (Zustand)
│   │   ├── 📁 hooks/             # Custom hooks
│   │   ├── 📁 types/             # Definiciones TypeScript
│   │   ├── 📁 constants/         # Constantes del sistema
│   │   └── 📁 utils/             # Funciones utilitarias
│   │
│   ├── 📄 vite.config.ts         # Configuración Vite
│   ├── 📄 tsconfig.json          # Configuración TypeScript
│   └── 📄 package.json           # Dependencias frontend
│
└── 📁 backend/                   # API Express
    ├── 📁 prisma/                # Esquema de base de datos
    │   └── 📄 schema.prisma      # Modelo de datos
    │
    ├── 📁 src/
    │   ├── 📁 config/            # Configuración
    │   ├── 📁 controllers/       # Lógica de negocio
    │   ├── 📁 middleware/        # Middlewares (auth, etc)
    │   ├── 📁 routes/            # Definición de rutas API
    │   ├── 📁 services/          # Servicios
    │   │   └── 📁 ai/            # Motor de IA
    │   ├── 📁 types/             # Tipos TypeScript
    │   └── 📄 index.ts           # Servidor principal
    │
    ├── 📄 .env                   # Variables de entorno
    ├── 📄 tsconfig.json          # Configuración TypeScript
    └── 📄 package.json           # Dependencias backend
```

---

## 📋 Requisitos Previos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** 9+ (viene con Node.js)
- **PostgreSQL** 14+ ([Descargar](https://www.postgresql.org/)) - O usar Supabase
- **Git** (opcional) ([Descargar](https://git-scm.com/))

---

## 🚀 Instalación

### 1. Clonar el repositorio (si usas Git)

```bash
git clone <URL_DEL_REPOSITORIO>
cd "sistema tesis"
```

### 2. Instalar dependencias del Frontend

```bash
cd frontend
npm install
```

### 3. Instalar dependencias del Backend

```bash
cd ../backend
npm install
```

---

## ⚙️ Configuración

### 1. Base de Datos

**Opción A: Supabase (Recomendado - Gratis)**
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Copia la "Connection string" de Settings → Database
4. Actualiza `backend/.env` con esa URL

**Opción B: PostgreSQL local**
1. Instala PostgreSQL localmente
2. Crea una base de datos: `CREATE DATABASE tesis_plataforma;`
3. Actualiza `backend/.env` con tus credenciales

### 2. Variables de Entorno (Backend)

Edita `backend/.env`:

```env
PORT=3001
DATABASE_URL="postgresql://usuario:password@localhost:5432/tesis_plataforma"
JWT_SECRET="tu-clave-secreta-super-segura"
FRONTEND_URL="http://localhost:5173"
```

### 3. Inicializar Base de Datos

```bash
cd backend
npm run prisma:generate    # Generar cliente de Prisma
npm run prisma:migrate     # Crear tablas en la BD
```

---

## ▶️ Ejecución

### Desarrollo (ambos al mismo tiempo)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
→ API corriendo en `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
→ App corriendo en `http://localhost:5173`

### Abrir en el navegador

Ve a **[http://localhost:5173](http://localhost:5173)**

---

## 🎯 Funcionalidades

### 1. Autenticación
- Registro de docentes
- Login seguro con JWT
- Protección de rutas

### 2. Panel del Docente
- Dashboard con estadísticas
- Lista de niños registrados
- Detalle individual de cada niño
- Reportes de progreso
- Gráficos de rendimiento

### 3. Interfaz del Niño
- Login por código de alumno
- Menú de actividades por dimensión
- Pantalla de actividad (una por vez)
- Retroalimentación inmediata (sonido + visual)
- Sistema de estrellas y puntuación
- Barra de progreso

### 4. Motor de IA Adaptativa
- Evalúa rendimiento continuamente
- Ajusta dificultad (sube/baja niveles)
- Selecciona próxima actividad óptima
- Genera retroalimentación personalizada

### 5. Tipos de Actividades

**Dimensión 1: Reconocimiento**
- ¿Cuál es el monitor?
- ¿Cuál es el teclado?
- ¿Cuál es el mouse?
- Relacionar componente con función

**Dimensión 2: Interacción**
- Hacer clic en el elemento correcto
- Mover el cursor al objetivo
- Arrastrar y soltar
- Seguir instrucciones visuales

**Dimensión 3: Autonomía**
- Completar secuencia de pasos
- Resolver puzzle de componentes
- Actividad combinada

---

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Estructura base del proyecto
- [x] Configuración de TypeScript
- [x] Configuración de Tailwind CSS
- [x] Tipos principales del sistema
- [x] Constantes del sistema
- [x] Funciones utilitarias
- [x] Páginas básicas (Home, Login, Dashboard, Menú Niño)
- [x] Esquema de base de datos (Prisma)
- [x] Rutas API base
- [x] Sistema de autenticación (register/login)

### 🔄 En Progreso
- [ ] Fase 1: Completar autenticación + protección de rutas
- [ ] Fase 2: CRUD de niños

### ⏳ Pendiente
- [ ] Fase 3: Motor de IA adaptativa
- [ ] Fase 4: Biblioteca de actividades
- [ ] Fase 5: Interfaz completa del niño
- [ ] Fase 6: Integración y reportes
- [ ] Fase 7: Pulido y despliegue

---

## 🌐 Despliegue

### Frontend (Vercel - Gratis)

1. Sube el código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa el repositorio
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Deploy

### Backend (Railway - Gratis)

1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto desde GitHub
3. Agrega PostgreSQL como plugin
4. Configura variables de entorno
5. Deploy

**Alternativa: Render.com** (también gratis)

---

## 📚 Documentación Adicional

- **[PLAN_DESARROLLO.md](./PLAN_DESARROLLO.md)** - Plan detallado de desarrollo
- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios (próximamente)

---

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run build  # Verificar que compila

# Backend
cd backend
npm run build  # Verificar TypeScript
```

---

## 🤝 Contribución

Este es un proyecto de investigación de tesis. Para contribuir:

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-actividad`
3. Commit tus cambios: `git commit -m 'Agrega nueva actividad'`
4. Push a la rama: `git push origin feature/nueva-actividad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte de una investigación de tesis académica.

**Institución**: [Universidad - Piura, Perú]
**Año**: 2026
**Autores**: García Bereche, Levi Gabriel / Chero Villarreal, William Eduardo

---

## 📧 Contacto

Para preguntas sobre este proyecto, contacta a los autores de la tesis.

---

## 🙏 Agradecimientos

- A Dios por la vida y la salud
- A nuestras familias por el apoyo incondicional
- A nuestros docentes y asesores por la orientación
- A los niños y docentes de nivel inicial por inspirar este trabajo

---

**Hecho con ❤️ para la educación inicial en Perú** 🇵🇪
