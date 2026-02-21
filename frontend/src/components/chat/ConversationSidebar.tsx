import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useGameStore } from '../../store/gameStore';
import GameSelector from '../games/GameSelector';
import { Plus, Trash2, MessageSquare, X, Gamepad2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationSidebarProps {
  onClose?: () => void;
}

export default function ConversationSidebar({ onClose }: ConversationSidebarProps) {
  const {
    conversations,
    currentConversation,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useChatStore();

  const { selectedGame, fetchGames } = useGameStore();

  useEffect(() => {
    fetchGames();
    fetchConversations();
  }, [fetchGames, fetchConversations]);

  const handleNewConversation = async () => {
    await createConversation(selectedGame?.id);
    onClose?.();
  };

  const handleSelect = async (conv: typeof conversations[0]) => {
    await selectConversation(conv);
    onClose?.();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
  };

  const filteredConversations = selectedGame
    ? conversations.filter((c) => c.game_slug === selectedGame.slug)
    : conversations;

  return (
    <div className="w-full h-full glass-surface border-r border-white/[0.06] flex flex-col">
      {/* Compact header — logo left, + button and X right */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.10]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gaming-blue to-gaming-purple flex items-center justify-center shadow-glow-teal-sm shrink-0">
          <Gamepad2 className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xs font-bold gaming-heading text-gaming-blue flex-1 truncate">My Gamer Buddy</h1>
        <button
          onClick={handleNewConversation}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-gaming-blue/90 to-[#0099cc]/90 text-white transition-all active:scale-[0.90] shadow-glow-teal-sm hover:shadow-glow-teal shrink-0"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gaming-muted hover:text-gaming-blue hover:bg-white/[0.06] transition lg:hidden shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Game selector — compact horizontal scroll */}
      <div className="border-b border-white/[0.08] shrink-0">
        <GameSelector compact />
      </div>

      {/* Conversations list — more breathing room */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-gaming-muted py-12 px-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1 opacity-70">Tap + to start chatting</p>
          </div>
        ) : (
          filteredConversations.map((conv, index) => (
            <div
              key={conv.id}
              onClick={() => handleSelect(conv)}
              style={{ animationDelay: `${index * 40}ms` }}
              className={`stagger-item group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                currentConversation?.id === conv.id
                  ? 'glass-strong border border-gaming-blue/40 shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                  : 'hover:bg-white/[0.06] border border-transparent hover:border-white/[0.10]'
              }`}
            >
              {currentConversation?.id === conv.id && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-gaming-blue shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
              )}
              <span className="text-lg flex-shrink-0">
                {conv.game_icon || '🎮'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-[11px] text-gaming-muted mt-0.5">
                  {formatDistanceToNow(new Date(conv.updated_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="text-gaming-muted hover:text-gaming-red transition p-1.5 rounded-lg hover:bg-white/[0.06] opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
