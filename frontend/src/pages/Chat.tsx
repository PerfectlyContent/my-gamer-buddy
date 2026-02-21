import { useState } from 'react';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import SettingsPanel from '../components/layout/SettingsPanel';
import { useGameStore } from '../store/gameStore';
import { useChatStore } from '../store/chatStore';
import { Menu } from 'lucide-react';

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedGame } = useGameStore();
  const { currentConversation } = useChatStore();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mobile header */}
      <header className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.10] glass-strong lg:hidden shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gaming-muted hover:text-gaming-blue transition p-1.5 rounded-lg hover:bg-white/[0.08] shrink-0"
          title="Conversation history"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {currentConversation ? (
            <>
              <span className="text-base shrink-0">{currentConversation.game_icon || '🎮'}</span>
              <span className="text-sm font-medium truncate text-gaming-text">{currentConversation.title}</span>
            </>
          ) : selectedGame ? (
            <>
              <span className="text-base shrink-0">{selectedGame.icon}</span>
              <span className="text-sm font-semibold truncate" style={{ color: selectedGame.color_accent }}>
                {selectedGame.name}
              </span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gaming-blue to-gaming-purple flex items-center justify-center shrink-0">
                <span className="text-[10px]">🎮</span>
              </div>
              <h1 className="text-sm font-bold gaming-heading text-gaming-blue truncate">My Gamer Buddy</h1>
            </>
          )}
        </div>
        <SettingsPanel />
      </header>

      {/* Sidebar drawer — overlay only, never inline */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[280px] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ConversationSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Full-width chat — always takes all space */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        <ChatWindow />
      </main>
    </div>
  );
}
