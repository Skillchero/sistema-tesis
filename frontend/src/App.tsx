import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants';

// Páginas (las crearemos en las siguientes fases)
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/teacher/DashboardPage';
import ChildMenuPage from './pages/child/ChildMenuPage';
import ChildSelectPage from './pages/child/ChildSelectPage';
import GamePage from './pages/child/GamePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        
        {/* Auth */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        
        {/* Docente */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.STUDENTS} element={<div>Lista de Niños (Fase 2)</div>} />
        <Route path={ROUTES.STUDENT_DETAIL} element={<div>Detalle de Niño (Fase 2)</div>} />
        <Route path={ROUTES.REPORTS} element={<div>Reportes (Fase 6)</div>} />
        
        {/* Niño */}
        <Route path="/nino/seleccionar" element={<ChildSelectPage />} />
        <Route path={ROUTES.CHILD_MENU} element={<ChildMenuPage />} />
        <Route path="/nino/juego/:juegoId" element={<GamePage />} />
        
        {/* Redirecciones */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
