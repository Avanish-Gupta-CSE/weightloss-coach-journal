import { Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import Layout from './components/layout/Layout';
import DashboardPage from './components/pages/DashboardPage';
import DailyLogPage from './components/pages/DailyLogPage';
import WorkoutsPage from './components/pages/WorkoutsPage';
import NutritionPage from './components/pages/NutritionPage';
import BrainStatePage from './components/pages/BrainStatePage';
import ProtocolPage from './components/pages/ProtocolPage';
import ScoreboardPage from './components/pages/ScoreboardPage';

function App() {
  return (
    <DashboardProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/daily" element={<DailyLogPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/scoreboard" element={<ScoreboardPage />} />
          <Route path="/brain" element={<BrainStatePage />} />
          <Route path="/protocol" element={<ProtocolPage />} />
        </Routes>
      </Layout>
    </DashboardProvider>
  );
}

export default App;
