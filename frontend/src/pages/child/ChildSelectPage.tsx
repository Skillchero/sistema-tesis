// ============================================
// CHILD SELECT PAGE - Selección de perfil infantil
// El niño elige su avatar sin necesidad de leer
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useChildStore } from '../../stores/childStore';
import { setNinoActivo, obtenerNinos, cargarPerfilNino } from '../../services/api';

const AVATARES = ['👦', '👧', '🧒', '👶', '😇', '🤠', '🥳', '😎', '🤗', '😊'];
const COLORES_AVATAR = [
  'from-blue-500 to-blue-700',
  'from-pink-500 to-pink-700',
  'from-green-500 to-green-700',
  'from-yellow-500 to-orange-600',
  'from-purple-500 to-purple-700',
  'from-red-500 to-red-700',
  'from-teal-500 to-teal-700',
  'from-indigo-500 to-indigo-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
];

interface NinoData {
  id: string;
  codigoAlumno: string;
  nombreCompleto: string;
  edad: number;
}

export default function ChildSelectPage() {
  const navigate = useNavigate();
  const { iniciarSesion } = useChildStore();
  const [ninos, setNinos] = useState<NinoData[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarNinos();
  }, []);

  async function cargarNinos() {
    try {
      // Obtener todos los niños (sin filtro de docente)
      const todos: NinoData[] = [];
      for (let i = 1; i <= 6; i++) {
        const lista = await obtenerNinos(`doc${i}`);
        todos.push(...lista);
      }
      setNinos(todos);
    } catch {
      // Fallback: datos locales
      setNinos(generarNinosLocal());
    } finally {
      setCargando(false);
    }
  }

  function generarNinosLocal(): NinoData[] {
    const lista: NinoData[] = [];
    const secciones = [
      { prefijo: 'A', edad: 4 },
      { prefijo: 'B', edad: 4 },
      { prefijo: 'C', edad: 5 },
      { prefijo: 'D', edad: 5 },
      { prefijo: 'E', edad: 4 },
      { prefijo: 'F', edad: 5 },
    ];
    secciones.forEach((sec, di) => {
      for (let i = 1; i <= 5; i++) {
        lista.push({
          id: `a${di + 1}-${i}`,
          codigoAlumno: `${sec.prefijo}00${i}`,
          nombreCompleto: `Alumno ${i}`,
          edad: sec.edad,
        });
      }
    });
    return lista;
  }

  async function seleccionarNino(nino: NinoData) {
    // Guardar ID en API
    setNinoActivo(nino.id);
    // Iniciar sesión en store
    iniciarSesion(nino.codigoAlumno, nino.nombreCompleto);

    // Cargar perfil desde la base de datos
    try {
      const perfil = await cargarPerfilNino(nino.id);
      if (perfil) {
        // Actualizar store con datos reales de BD
        useChildStore.setState({
          monedas: perfil.monedas,
          puntos: perfil.puntos,
          estrellas: perfil.estrellas,
        });
      }
    } catch {
      // Si falla, mantener valores por defecto
    }

    // Navegar al menú
    navigate('/nino/menu');
  }

  return (
    <div className="game-bg bg-fondo-azul min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <h1 className="game-title text-2xl sm:text-3xl">¿Quién eres?</h1>
            <p className="text-slate-400 text-sm">Toca tu foto para empezar a jugar</p>
          </div>
        </div>

        {/* Cuadrícula de avatares */}
        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {ninos.map((nino, idx) => (
              <motion.button
                key={nino.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => seleccionarNino(nino)}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
              >
                {/* Avatar */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${COLORES_AVATAR[idx % COLORES_AVATAR.length]} flex items-center justify-center text-3xl sm:text-4xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                  {AVATARES[idx % AVATARES.length]}
                </div>
                {/* Código */}
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  {nino.codigoAlumno}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            👧👦 Toca tu foto para comenzar
          </p>
        </div>
      </div>
    </div>
  );
}
