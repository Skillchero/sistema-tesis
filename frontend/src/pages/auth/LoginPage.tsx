// ============================================
// LOGIN DOCENTE - Valida contra PostgreSQL
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { DOCENTES } from '../../data/docentes-mock';
import { loginDocente } from '../../services/api';

export default function LoginPage() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const docenteSeleccionado = DOCENTES.find(d => d.id === seleccionado);

  // Mapear docente mock → email en BD
  const emailMap: Record<string, string> = {
    doc1: 'docente1@colegio.edu',
    doc2: 'docente2@colegio.edu',
    doc3: 'docente3@colegio.edu',
    doc4: 'docente4@colegio.edu',
    doc5: 'docente5@colegio.edu',
    doc6: 'docente6@colegio.edu',
  };

  const seleccionarPerfil = (docenteId: string) => {
    setSeleccionado(docenteId);
    setPassword('');
    setError('');
  };

  const entrar = async () => {
    if (!seleccionado) return;
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }

    setCargando(true);
    setError('');

    const email = emailMap[seleccionado];
    const resultado = await loginDocente(email, password);

    setCargando(false);

    if (resultado) {
      // Guardar docente activo (ID y token)
      localStorage.setItem('docente-activo', seleccionado);
      localStorage.setItem('docente-token', resultado.token);
      localStorage.setItem('docente-nombre', resultado.user.nombre);
      navigate(ROUTES.DASHBOARD);
    } else {
      setError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-soft flex items-center justify-center mb-4">
            <span className="text-5xl">🎓</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Panel del Docente
          </h1>
          <p className="text-gray-600 mt-2 sm:mt-4">
            Selecciona tu perfil e ingresa tu contraseña
          </p>
        </div>

        {/* Tarjetas de docentes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {DOCENTES.map((docente) => {
            const estaSeleccionado = seleccionado === docente.id;
            return (
              <button
                key={docente.id}
                onClick={() => seleccionarPerfil(docente.id)}
                className={`group card-activity relative transition-all duration-200 ${
                  estaSeleccionado
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-200/50">
                    <span className="text-3xl">👩‍🏫</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-lg">
                      {docente.nombre}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {docente.curso}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      {docente.alumnos.length} alumnos
                    </div>
                  </div>
                  <ChevronIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                {estaSeleccionado && (
                  <div className="absolute inset-0 bg-blue-500/10 rounded-2xl flex items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-xl">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Formulario de contraseña (aparece al seleccionar) */}
        {seleccionado && docenteSeleccionado && (
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🔐</div>
                <h2 className="font-semibold text-gray-800 text-lg">
                  {docenteSeleccionado.nombre}
                </h2>
                <p className="text-sm text-gray-500">{docenteSeleccionado.curso}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && entrar()}
                    placeholder="••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-center text-lg tracking-widest"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={entrar}
                  disabled={cargando}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Verificando...' : 'Entrar al panel'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Contraseña: 123456
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error general */}
        {error && !seleccionado && (
          <div className="mt-6 text-center bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <span>←</span> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
