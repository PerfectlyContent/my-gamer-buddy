import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Code2, Map, ListChecks, Gamepad2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SettingsPanel from './SettingsPanel';
import { playSound, triggerHaptic } from '@/lib/sounds';

const navItems = [
  { path: '/', label: 'Chat', icon: MessageSquare },
  { path: '/cheat-codes', label: 'Cheats', icon: Code2 },
  { path: '/maps', label: 'Maps', icon: Map },
  { path: '/quests', label: 'Quests', icon: ListChecks },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex flex-1 min-h-0">
        {/* Desktop side navigation — wider w-24, more spacing */}
        <nav className="hidden lg:flex flex-col w-24 glass-surface border-r border-white/[0.06] items-center py-6 gap-2 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gaming-blue to-gaming-purple flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(0,212,255,0.35)]">
            <Gamepad2 className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
          </div>
          <div className="gradient-sep w-12 mb-2" />
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { playSound('nav'); triggerHaptic('tap'); navigate(item.path); }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 w-[72px] active:scale-[0.95] ${
                  isActive
                    ? 'bg-white/[0.08] text-gaming-blue shadow-[0_0_16px_rgba(0,212,255,0.2)]'
                    : 'text-gaming-muted hover:text-gaming-text hover:bg-white/[0.05]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gaming-blue shadow-[0_0_10px_rgba(0,212,255,1),0_0_20px_rgba(0,212,255,0.5)]" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]' : ''}`} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
          <div className="mt-auto" />
          <SettingsPanel />
        </nav>

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom tab bar — icons + labels, active bar indicator */}
      <div className="lg:hidden shrink-0">
        <div className="gradient-sep" />
        <nav className="flex items-center justify-around glass-strong py-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { playSound('nav'); triggerHaptic('tap'); navigate(item.path); }}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-[0.90] ${
                  isActive
                    ? 'text-gaming-blue'
                    : 'text-gaming-muted hover:text-gaming-text'
                }`}
              >
                {/* Active bar above icon */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavBar"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gaming-blue shadow-[0_0_8px_rgba(0,212,255,0.8)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-gaming-blue' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
