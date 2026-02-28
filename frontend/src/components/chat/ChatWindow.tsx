import { useEffect, useRef, useMemo } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useGameStore } from '../../store/gameStore';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Loader2, AlertTriangle, X, Home, ChevronRight } from 'lucide-react';

// Contextual suggestions per game slug
const GAME_SUGGESTIONS: Record<string, string[]> = {
  fortnite: ['🏗️ Best build techniques?', '🎯 Win more solos?', '💎 Best drop spots?', '🔫 Top weapon?'],
  cod: ['🎯 Best Warzone loadout?', '🏆 Rank up fast?', '🔫 Top SMG right now?', '🗺️ Best routes?'],
  gta: ['💰 Money glitch?', '🚗 Fastest car?', '🏠 Best business to buy?', '🎮 Fun cheat codes?'],
  valorant: ['🎯 Best agent for solo?', '🔫 How to aim better?', '🗺️ Bind callouts?', '🏆 Rank up tips?'],
  minecraft: ['🏠 Starter base design?', '⛏️ Find diamonds fast?', '🐉 Beat the Ender Dragon?', '🎨 Redstone basics?'],
  apex: ['🎯 Best legend pick?', '🔫 R-301 vs Flatline?', '🗺️ Best landing spots?', '🏆 Rank up tips?'],
  'elden-ring': ['🗡️ Beat Malenia?', '⚔️ Best starter build?', '🗺️ Where to go first?', '💎 Best weapons early?'],
  lol: ['🏆 Best champs to climb?', '🗺️ How to jungle?', '🎯 Improve CS?', '⚔️ Counter picks?'],
  zelda: ['🗺️ All shrine locations?', '⚔️ Best weapons?', '💎 Hidden secrets?', '🐴 Find a horse?'],
};
const DEFAULT_SUGGESTIONS = ['🎯 Best loadout tips?', '🏗️ Build strategies?', '💰 Money making guide?', '🗡️ Beat this boss?'];

export default function ChatWindow() {
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    createConversation,
    selectConversation,
    clearCurrent,
    clearError,
  } = useChatStore();

  const { selectedGame, fetchGames } = useGameStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Auto-create conversation if needed, then send
  const handleSend = async (message: string, image?: File) => {
    if (!currentConversation) {
      const conv = await createConversation(selectedGame?.id);
      if (conv) sendMessage(message, image);
    } else {
      sendMessage(message, image);
    }
  };

  const suggestions = useMemo(() => {
    if (!selectedGame) return DEFAULT_SUGGESTIONS;
    return GAME_SUGGESTIONS[selectedGame.slug] || DEFAULT_SUGGESTIONS;
  }, [selectedGame]);

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* ── WELCOME / HOME STATE: no conversation active ── */}
      {!currentConversation && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

            {/* Game context — adapts to header selection */}
            {selectedGame ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl glass-card border-l-2 border-l-gaming-blue">
                <span className="text-3xl">{selectedGame.icon}</span>
                <div>
                  <p className="text-[10px] font-display uppercase tracking-widest text-gaming-muted mb-0.5">
                    Playing
                  </p>
                  <p
                    className="text-base font-bold font-display"
                    style={{ color: selectedGame.color_accent }}
                  >
                    {selectedGame.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-white/10 text-gaming-muted text-xs">
                <span>👆</span>
                <span>Select a game above to get tailored tips</span>
              </div>
            )}

            {/* Quick suggestions */}
            <div>
              <p className="text-[10px] font-bold text-gaming-muted uppercase tracking-[2px] mb-2.5">
                Quick questions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s.replace(/^[^\s]+\s/, ''))}
                    className="glass-card rounded-xl p-3 text-xs text-gaming-muted hover:text-gaming-text hover:border-gaming-blue/30 hover:shadow-[0_0_10px_rgba(0,212,255,0.10)] transition-all duration-200 active:scale-[0.97] text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent sessions — quick resume */}
            {conversations.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gaming-muted uppercase tracking-[2px] mb-2.5">
                  Resume recent
                </p>
                <div className="space-y-2">
                  {conversations.slice(0, 3).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all active:scale-[0.98] text-left"
                    >
                      <span className="text-lg flex-shrink-0">{conv.game_icon || '🎮'}</span>
                      <span className="flex-1 text-xs font-medium text-gaming-text truncate">
                        {conv.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gaming-muted flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ChatInput onSend={handleSend} disabled={sending} />
        </div>
      )}

      {/* ── CHAT STATE: conversation active ── */}
      {currentConversation && (
        <>
          {/* Slim game context bar */}
          <div className="flex items-center gap-2 px-3 py-2 glass-surface border-b border-white/[0.06] shrink-0">
            <button
              onClick={clearCurrent}
              title="Back to home"
              className="p-1.5 rounded-lg text-gaming-muted hover:text-gaming-blue hover:bg-white/[0.08] transition-all duration-200 shrink-0"
            >
              <Home className="w-4 h-4" />
            </button>
            <span className="text-sm shrink-0">{currentConversation.game_icon || '🎮'}</span>
            <p className="text-sm font-medium truncate flex-1">{currentConversation.title}</p>
            {currentConversation.game_name && (
              <span className="text-xs text-gaming-muted shrink-0 hidden sm:block">{currentConversation.game_name}</span>
            )}
          </div>

          {/* Error toast */}
          {error && (
            <div className="mx-3 mt-2 flex items-center gap-2 bg-gaming-red/15 border border-gaming-red/30 rounded-lg px-3 py-2 text-sm text-gaming-red shrink-0">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="flex-shrink-0 hover:text-white transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 lg:px-5 lg:py-5 flex flex-col">
            <div className="flex-1" />
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-gaming-blue animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gaming-muted py-12">
                <p className="text-sm">Ask anything about {currentConversation.game_name || 'gaming'}!</p>
              </div>
            ) : (
              <>
                {/* Date divider */}
                <div className="flex justify-center">
                  <div className="px-4 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[9px] text-gaming-muted uppercase tracking-widest font-medium">
                    Today
                  </div>
                </div>
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              </>
            )}

            {/* Typing indicator */}
            {sending && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gaming-green/80 to-gaming-blue/80 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
                <div className="glass-card rounded-2xl px-3 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gaming-blue shadow-[0_0_6px_rgba(0,212,255,0.8)] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gaming-blue shadow-[0_0_6px_rgba(0,212,255,0.8)] rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gaming-blue shadow-[0_0_6px_rgba(0,212,255,0.8)] rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={sending} />
        </>
      )}
    </div>
  );
}
