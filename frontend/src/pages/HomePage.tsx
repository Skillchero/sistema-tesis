import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Título */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full shadow-soft flex items-center justify-center">
            <span className="text-5xl">🎓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Aprendo con la Computadora
          </h1>
          <p className="text-lg text-gray-600 text-balance">
            Plataforma web interactiva con inteligencia artificial para el aprendizaje progresivo de computadoras en educación inicial
          </p>
        </div>

        {/* Tarjetas de acceso */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Acceso Docente */}
          <Link
            to={ROUTES.LOGIN}
            className="card-activity text-left hover:shadow-medium transform hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">👩‍🏫</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Soy Docente
                </h2>
                <p className="text-sm text-gray-500">
                  Accede al panel de control y monitorea el progreso
                </p>
              </div>
            </div>
          </Link>

          {/* Acceso Niño */}
          <Link
            to="/nino/seleccionar"
            className="card-activity text-left hover:shadow-medium transform hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">👧</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Soy Niño/Niña
                </h2>
                <p className="text-sm text-gray-500">
                  ¡Ven a jugar y aprender con las computadoras!
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-500">
          <p>Desarrollado como parte de la investigación de tesis</p>
          <p className="mt-1">Piura, Perú - 2026</p>
        </div>
      </div>
    </div>
  );
}
