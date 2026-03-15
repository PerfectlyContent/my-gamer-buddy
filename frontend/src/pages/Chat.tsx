import { useState } from 'react';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useGameStore } from '../store/gameStore';
import { useChatStore } from '../store/chatStore';
import type { Game } from '../types';
import { History, Plus } from 'lucide-react';

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { games, selectedGame, selectGame } = useGameStore();
  const { currentConversation, clearCurrent } = useChatStore();

  const handleGameChange = (game: Game | null) => {
    selectGame(game);
    if (game && game.id !== selectedGame?.id) {
      clearCurrent();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Mobile header: game tabs + action row ── */}
      <header className="shrink-0 border-b border-white/[0.06] glass-strong z-10 lg:hidden">
        {/* Row 1: horizontal game selector pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide px-3 pt-3 pb-1">
          {/* All games pill */}
          <button
            onClick={() => handleGameChange(null)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              !selectedGame
                ? 'bg-gaming-blue/20 border-gaming-blue/50 ring-1 ring-gaming-blue/20'
                : 'bg-white/[0.05] border-white/10 grayscale hover:grayscale-0'
            }`}
          >
            <span className="text-xl">🎮</span>
            <span
              className={`text-[10px] font-display uppercase tracking-widest font-bold pr-1 ${
                !selectedGame ? 'text-gaming-blue' : 'text-gaming-muted'
              }`}
            >
              All
            </span>
          </button>

          {games.map((game) => {
            const isActive = selectedGame?.id === game.id;
            return (
              <button
                key={game.id}
                onClick={() => handleGameChange(game)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                  isActive ? 'ring-1' : 'bg-white/[0.05] border-white/10 grayscale hover:grayscale-0'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${game.color_accent}20`,
                        borderColor: `${game.color_accent}60`,
                        boxShadow: `0 0 0 1px ${game.color_accent}20`,
                      }
                    : undefined
                }
              >
                <span className="text-xl">{game.icon}</span>
                <span
                  className={`text-[10px] font-display uppercase tracking-widest font-bold pr-1`}
                  style={isActive ? { color: game.color_accent } : undefined}
                >
                  {game.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: history button + context label + action */}
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-gaming-muted hover:text-gaming-blue transition-colors"
              title="Chat history"
            >
              <History className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10" />
            {currentConversation ? (
              /* Active chat — show status indicator */
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gaming-green shadow-[0_0_6px_rgba(57,255,20,0.8)] animate-pulse" />
                <h2 className="font-display text-[11px] tracking-[0.2em] uppercase text-gaming-green">
                  Buddy Active
                </h2>
              </div>
            ) : (
              /* Home screen — show friendly prompt */
              <h2 className="font-display text-[11px] tracking-[0.2em] uppercase text-gaming-muted">
                {selectedGame ? `${selectedGame.name} mode` : 'Choose a game'}
              </h2>
            )}
          </div>

          {/* Only show New Chat when a conversation is open */}
          {currentConversation && (
            <button
              onClick={clearCurrent}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gaming-blue text-gaming-bg font-display text-[10px] font-bold uppercase tracking-widest shadow-glow-teal-sm active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </button>
          )}
        </div>
      </header>

      {/* Drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[80vw] max-w-xs transform transition-transform duration-300 ease-in-out shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ConversationSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        <ChatWindow />
      </main>
    </div>
  );
}
