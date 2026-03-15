import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import { useGameStore } from './store/gameStore';

const Chat = lazy(() => import('./pages/Chat'));
const CheatCodes = lazy(() => import('./pages/CheatCodes'));
const Loadout = lazy(() => import('./pages/Loadout'));
const Quests = lazy(() => import('./pages/Quests'));

export default function App() {
  const { fetchGames } = useGameStore();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Suspense fallback={null}><Chat /></Suspense>} />
          <Route path="/cheat-codes" element={<Suspense fallback={null}><CheatCodes /></Suspense>} />
          <Route path="/loadout" element={<Suspense fallback={null}><Loadout /></Suspense>} />
          <Route path="/quests" element={<Suspense fallback={null}><Quests /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
