// ============================================
// DASHBOARD DEL DOCENTE
// Muestra datos reales de la base de datos
// ============================================

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { obtenerDocentePorId, type Docente } from '../../data/docentes-mock';
import { obtenerProgresoDocente } from '../../services/api';

// Formatear tiempo relativo
function formatearTiempo(fecha: string): string {
  const ahora = new Date();
  const pasada = new Date(fecha);
  const diffMs = ahora.getTime() - pasada.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs} hora${diffHrs > 1 ? 's' : ''}`;
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;
  return pasada.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

interface AlumnoBD {
  id: string;
  nombre: string;
  codigo: string;
  edad: number;
  nivelActual: number;
  monedas: number;
  puntos: number;
  estrellas: number;
  actividadesCompletadas: number;
  estadisticas: {
    totalIntentos: number;
    aciertos: number;
    errores: number;
    precision: number;
  };
  ultimaSesion: string | null;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [docente, setDocente] = useState<Docente | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoBD[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('docente-activo');
    if (id) {
      const d = obtenerDocentePorId(id);
      setDocente(d ?? null);
      cargarDatosBD(id);
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  async function cargarDatosBD(docenteId: string) {
    try {
      const datos = await obtenerProgresoDocente(docenteId);
      setAlumnos(datos);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  }

  if (!docente || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  // Estadísticas calculadas SOLO desde la BD
  const stats = {
    totalAlumnos: alumnos.length,
    promedioGeneral:
      alumnos.length > 0
        ? alumnos.reduce((acc, a) => acc + a.estadisticas.precision, 0) / alumnos.length
        : 0,
    nivelAlto:
      alumnos.length > 0
        ? Math.round((alumnos.filter(a => a.nivelActual >= 5).length / alumnos.length) * 100)
        : 0,
    necesitanAyuda: alumnos.filter(a => a.estadisticas.precision < 50 && a.estadisticas.totalIntentos > 0).length,
    estrellasTotales: alumnos.reduce((acc, a) => acc + a.estrellas, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={ROUTES.HOME}
              className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              🏠
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Bienvenido, {docente.nombre}
              </h1>
              <p className="text-sm text-gray-500">
                {docente.curso} · {alumnos.length} alumnos
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
              🟢 BD Conectada
            </span>
            <button
              onClick={() => {
                localStorage.removeItem('docente-activo');
                navigate(ROUTES.LOGIN);
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Total Alumnos</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalAlumnos}</div>
            <div className="text-xs text-gray-400 mt-1">de tu curso</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Promedio General</div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.promedioGeneral.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">de aciertos</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Nivel Alto</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.nivelAlto}%
            </div>
            <div className="text-xs text-gray-400 mt-1">nivel 5 o más</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Necesitan Ayuda</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.necesitanAyuda}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {stats.necesitanAyuda === 1 ? 'alumno' : 'alumnos'}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Estrellas Totales</div>
            <div className="text-3xl font-bold text-amber-500">
              {stats.estrellasTotales}
            </div>
            <div className="text-xs text-gray-400 mt-1">ganadas por tus alumnos</div>
          </div>
        </div>

        {/* Lista de Alumnos del Docente */}
        <div className="card-activity">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Tus Alumnos
              </h2>
              <p className="text-sm text-gray-500">
                {alumnos.length} estudiantes de
                {docente.curso.toLowerCase()} · datos de PostgreSQL
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Actividades
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Aciertos
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Desaciertos
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Monedas
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Estrellas
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Última Sesión
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-gray-50/50">
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      Cargando datos de la base de datos...
                    </td>
                  </tr>
                ) : (
                  alumnos.map((alumno) => {
                    const precision = alumno.estadisticas.precision;
                    const tieneDatos = alumno.estadisticas.totalIntentos > 0;
                    const necesitaAyuda = tieneDatos && precision < 50;

                    return (
                      <tr key={alumno.id} className="hover:bg-white transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                              👦
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {alumno.nombre}
                              </div>
                              <div className="text-xs text-gray-500">
                                {alumno.edad} años
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                          {alumno.codigo}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alumno.nivelActual >= 5
                              ? 'bg-green-100 text-green-700'
                              : alumno.nivelActual >= 3
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            Nivel {alumno.nivelActual}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <span className="font-mono">{alumno.actividadesCompletadas}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <span className="font-mono text-green-600">{alumno.estadisticas.aciertos}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <span className="font-mono text-red-500">{alumno.estadisticas.errores}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                          🪙 {alumno.monedas}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <span className="text-amber-400">⭐</span> {alumno.estrellas}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {!tieneDatos ? (
                            <span className="flex items-center gap-1 text-gray-400">
                              <span>⏳</span> Sin datos
                            </span>
                          ) : necesitaAyuda ? (
                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                              <span>⚠️</span> Necesita ayuda
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <span>✅</span> Bien
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 text-right">
                          {alumno.ultimaSesion
                            ? formatearTiempo(alumno.ultimaSesion)
                            : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Necesita atención (&lt;50% aciertos)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Progreso normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Sin datos aún
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-green-50 border border-green-100 rounded-lg p-4">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <span>🗄️</span>
            <strong>Datos en tiempo real:</strong>
            Los datos se actualizan automáticamente desde PostgreSQL cada vez que un niño completa
            o falla una actividad. Actividades completadas = monedas ganadas; fallos = desaciertos.
          </p>
        </div>
      </main>
    </div>
  );
}
