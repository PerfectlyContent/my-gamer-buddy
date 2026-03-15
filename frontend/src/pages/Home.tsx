import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useGameStore } from '../store/gameStore';
import {
  MessageSquare,
  Code2,
  ListChecks,
  Swords,
  ChevronRight,
  Zap,
  Gamepad2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FEATURES = [
  {
    icon: MessageSquare,
    label: 'AI Chat',
    sub: 'Ask anything',
    path: '/chat',
    colorClass: 'text-gaming-blue',
    borderColor: 'rgba(0,212,255,0.2)',
    glowColor: 'rgba(0,212,255,0.08)',
  },
  {
    icon: Code2,
    label: 'Cheats',
    sub: 'Codes & secrets',
    path: '/cheat-codes',
    colorClass: 'text-gaming-purple',
    borderColor: 'rgba(139,92,246,0.2)',
    glowColor: 'rgba(139,92,246,0.08)',
  },
  {
    icon: Swords,
    label: 'Loadout',
    sub: 'Build your setup',
    path: '/loadout',
    colorClass: 'text-gaming-green',
    borderColor: 'rgba(57,255,20,0.15)',
    glowColor: 'rgba(57,255,20,0.05)',
  },
  {
    icon: ListChecks,
    label: 'Quests',
    sub: 'Track progress',
    path: '/quests',
    colorClass: 'text-gaming-orange',
    borderColor: 'rgba(255,107,0,0.2)',
    glowColor: 'rgba(255,107,0,0.08)',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { conversations, selectConversation, fetchConversations } = useChatStore();
  const { games, selectedGame, selectGame } = useGameStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleResumeChat = async (conv: typeof conversations[0]) => {
    await selectConversation(conv);
    navigate('/chat');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mobile-only branding header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] glass-strong shrink-0 lg:hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gaming-blue to-gaming-purple flex items-center justify-center shadow-glow-teal-sm">
          <Gamepad2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-display text-sm tracking-wider text-gaming-blue uppercase">
          My Gamer Buddy
        </span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Game selector pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide px-4 pt-4 pb-1">
          <button
            onClick={() => selectGame(null)}
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
                onClick={() => selectGame(game)}
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
                  className="text-[10px] font-display uppercase tracking-widest font-bold pr-1"
                  style={isActive ? { color: game.color_accent } : undefined}
                >
                  {game.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Greeting */}
          <div>
            <p className="text-[10px] text-gaming-muted uppercase tracking-[2px] mb-1">
              Welcome back
            </p>
            <h1 className="text-2xl font-bold font-display gaming-heading text-gaming-blue leading-tight">
              {selectedGame ? selectedGame.name : 'My Gamer Buddy'}
            </h1>
            <p className="text-xs text-gaming-muted mt-1">
              {selectedGame
                ? `Ask anything about ${selectedGame.name}`
                : "Pick a game above and let's get started"}
            </p>
          </div>

          {/* Primary CTA — Ask Buddy */}
          <button
            onClick={() => navigate('/chat')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gaming-blue/10 border border-gaming-blue/30 hover:bg-gaming-blue/15 hover:border-gaming-blue/50 transition-all active:scale-[0.98] shadow-[0_0_24px_rgba(0,212,255,0.08)] group"
          >
            <div className="w-10 h-10 rounded-xl bg-gaming-blue flex items-center justify-center shadow-glow-teal-sm group-hover:shadow-glow-teal flex-shrink-0 transition-all">
              <Zap className="w-5 h-5 text-gaming-bg" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-gaming-blue font-display tracking-wide">
                Ask Buddy AI
              </p>
              <p className="text-[11px] text-gaming-muted">
                {selectedGame
                  ? `Get ${selectedGame.name} tips instantly`
                  : 'Get gaming tips instantly'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gaming-blue flex-shrink-0" />
          </button>

          {/* Feature grid */}
          <div>
            <p className="text-[10px] font-bold text-gaming-muted uppercase tracking-[2px] mb-3">
              Explore
            </p>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, label, sub, path, colorClass, borderColor, glowColor }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="glass-card rounded-2xl p-4 text-left hover:bg-white/[0.06] active:scale-[0.97] transition-all duration-200"
                  style={{ border: `1px solid ${borderColor}`, boxShadow: `0 0 20px ${glowColor}` }}
                >
                  <Icon className={`w-5 h-5 mb-3 ${colorClass}`} />
                  <p className={`text-sm font-semibold ${colorClass}`}>{label}</p>
                  <p className="text-[11px] text-gaming-muted mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent chats */}
          {conversations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-bold text-gaming-muted uppercase tracking-[2px]">
                  Recent chats
                </p>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-[10px] text-gaming-blue font-display uppercase tracking-wider hover:text-gaming-blue/70 transition"
                >
                  See all →
                </button>
              </div>
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleResumeChat(conv)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all active:scale-[0.98] text-left"
                  >
                    <span className="text-lg flex-shrink-0">{conv.game_icon || '🎮'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gaming-text truncate">{conv.title}</p>
                      <p className="text-[10px] text-gaming-muted mt-0.5">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gaming-muted flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
