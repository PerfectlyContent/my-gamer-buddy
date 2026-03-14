import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useGameStore } from '../../store/gameStore';
import { Trash2, MessageSquare, X } from 'lucide-react';
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

  const { selectedGame } = useGameStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(to right, #0a0c10, #131720)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-sm tracking-wider uppercase text-gaming-blue">
            Chat History
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/[0.05] rounded-full transition-colors text-gaming-muted hover:text-gaming-text"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Section title */}
        <div>
          <h3 className="text-[10px] font-bold text-gaming-muted uppercase tracking-[2px] mb-3">
            Recent Sessions
          </h3>

          {filteredConversations.length === 0 ? (
            <div className="text-center text-gaming-muted py-10 px-4">
              <MessageSquare className="w-7 h-7 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No conversations yet</p>
              <p className="text-[11px] mt-1 opacity-60">Tap New Chat to start</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredConversations.map((conv, index) => {
                const isActive = currentConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelect(conv)}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className={`stagger-item group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? 'border-l-[3px] border-l-gaming-blue glass-card border-t border-r border-b border-white/10'
                        : 'border border-white/[0.05] bg-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`text-xl flex-shrink-0 ${!isActive ? 'opacity-50' : ''}`}>
                      {conv.game_icon || '🎮'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          isActive ? 'text-slate-200' : 'text-gaming-muted'
                        }`}
                      >
                        {conv.title}
                      </p>
                      <p className="text-[10px] text-gaming-muted mt-0.5">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="text-gaming-muted hover:text-gaming-red transition p-1.5 rounded-lg hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New chat button at bottom of list */}
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gaming-blue/30 text-gaming-blue text-xs font-display uppercase tracking-widest hover:bg-gaming-blue/10 transition-colors"
        >
          + New Chat
        </button>
      </div>
    </div>
  );
}
