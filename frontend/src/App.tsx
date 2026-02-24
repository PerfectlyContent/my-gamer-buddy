import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import CheatCodes from './pages/CheatCodes';
import Maps from './pages/Maps';
import Quests from './pages/Quests';
import { useGameStore } from './store/gameStore';

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
          <Route path="/chat" element={<Chat />} />
          <Route path="/cheat-codes" element={<CheatCodes />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/quests" element={<Quests />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
