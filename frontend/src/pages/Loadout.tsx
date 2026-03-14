import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, triggerHaptic } from '@/lib/sounds';
import { useToast } from '@/components/ui/GamingToast';
import { GamingButton } from '@/components/ui/GamingButton';
import { GamingProgressBar } from '@/components/ui/GamingProgressBar';
import GameHeader from '@/components/layout/GameHeader';
import { useGameStore } from '@/store/gameStore';
import { useChatStore } from '@/store/chatStore';
import { LOADOUT_DATA } from '@/data/loadouts';

export default function Loadout() {
  const { selectedGame } = useGameStore();
  const { createConversation } = useChatStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activePlaystyle, setActivePlaystyle] = useState<string | null>(null);
  const [selectedWeapons, setSelectedWeapons] = useState<Set<number>>(new Set([0, 1]));

  const gameData = useMemo(() => {
    if (!selectedGame) return null;
    return LOADOUT_DATA[selectedGame.slug] ?? null;
  }, [selectedGame]);

  // Reset playstyle when game changes
  const playstyle = useMemo(() => {
    if (!gameData) return null;
    if (activePlaystyle && gameData.playstyles.includes(activePlaystyle)) {
      return activePlaystyle;
    }
    return gameData.playstyles[0];
  }, [gameData, activePlaystyle]);

  const loadout = useMemo(() => {
    if (!gameData || !playstyle) return null;
    return gameData.loadouts[playstyle] ?? null;
  }, [gameData, playstyle]);

  const handlePlaystyleChange = useCallback((ps: string) => {
    playSound('filter');
    triggerHaptic('tap');
    setActivePlaystyle(ps);
    setSelectedWeapons(new Set([0, 1]));
  }, []);

  const toggleWeapon = useCallback((idx: number) => {
    playSound('click');
    triggerHaptic('tap');
    setSelectedWeapons((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedGame || !playstyle || !loadout) return;
    const saved = {
      game: selectedGame.slug,
      playstyle,
      weapons: loadout.weapons.filter((_, i) => selectedWeapons.has(i)).map((w) => w.name),
      savedAt: new Date().toISOString(),
    };
    const key = `loadout-${selectedGame.slug}`;
    localStorage.setItem(key, JSON.stringify(saved));
    playSound('complete');
    triggerHaptic('achievement');
    toast({ title: 'Loadout saved \u2713', variant: 'success' });
  }, [selectedGame, playstyle, loadout, selectedWeapons, toast]);

  const handleAskAI = useCallback(async () => {
    if (!selectedGame || !playstyle || !loadout) return;
    const selected = loadout.weapons.filter((_, i) => selectedWeapons.has(i));
    const weaponNames = selected.map((w) => w.name).join(' + ') || 'my loadout';
    const message = `I'm running ${weaponNames} as a ${playstyle} player. Give me 3 tips to win more with this loadout.`;

    await createConversation(selectedGame.id);
    // Navigate to chat — the message will appear in chat input context
    navigate('/chat');
    // Use a small delay to let the chat page mount, then send the message
    setTimeout(() => {
      useChatStore.getState().sendMessage(message);
    }, 300);
  }, [selectedGame, playstyle, loadout, selectedWeapons, createConversation, navigate]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <GameHeader
        title="Loadout Builder"
        subtitle="Build your perfect loadout for any playstyle"
        icon={<Swords className="w-3.5 h-3.5" />}
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-white/10 text-gaming-muted text-xs">
            <span>👆</span>
            <span>Select a game above to build a loadout</span>
          </div>
        </div>
      ) : !gameData ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="text-lg font-semibold text-gaming-text mb-1">No loadouts yet</h3>
            <p className="text-gaming-muted text-sm">Loadout data for this game coming soon</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 lg:px-6 space-y-5 max-w-[480px] mx-auto w-full">
            {/* Game mode label + heading */}
            <div>
              <p className="text-[10px] font-display uppercase tracking-[0.2em] text-gaming-muted mb-1">
                {selectedGame.name} Mode
              </p>
              <h2 className="text-xl font-bold text-gaming-text">
                <span className="text-gaming-blue">Loadout</span> Builder
              </h2>
              <p className="text-[10px] text-gaming-muted mt-1">{gameData.patchLabel}</p>
            </div>

            {/* Playstyle chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {gameData.playstyles.map((ps) => (
                <button
                  key={ps}
                  onClick={() => handlePlaystyleChange(ps)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-display uppercase tracking-widest font-bold transition-all whitespace-nowrap min-h-[44px] ${
                    playstyle === ps
                      ? 'bg-gaming-blue/20 border-gaming-blue/50 ring-1 ring-gaming-blue/20 text-gaming-blue shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                      : 'bg-white/[0.04] border-white/[0.08] text-gaming-muted hover:bg-white/[0.08] hover:text-gaming-text'
                  }`}
                >
                  {ps}
                </button>
              ))}
            </div>

            {/* Weapon grid */}
            {loadout && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={playstyle}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {loadout.weapons.map((weapon, idx) => {
                      const isSelected = selectedWeapons.has(idx);
                      return (
                        <button
                          key={`${playstyle}-${idx}`}
                          onClick={() => toggleWeapon(idx)}
                          className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.97] min-h-[44px] ${
                            isSelected
                              ? 'bg-gaming-blue/[0.08] border-gaming-blue/40 shadow-[0_0_16px_rgba(0,212,255,0.15)]'
                              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gaming-blue shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                          )}
                          <span className="text-2xl block mb-2">{weapon.icon}</span>
                          <p className="text-sm font-semibold text-gaming-text leading-tight">
                            {weapon.name}
                          </p>
                          <p className="text-[10px] text-gaming-muted mt-0.5">{weapon.type}</p>
                          {weapon.damage > 0 && (
                            <div className="mt-2.5 flex items-center gap-2">
                              <GamingProgressBar value={weapon.damage} size="sm" className="flex-1" />
                              <span className="text-[10px] text-gaming-muted tabular-nums font-medium">
                                {weapon.damage}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* AI Analysis panel */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gaming-blue opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gaming-blue" />
                      </span>
                      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gaming-blue font-bold">
                        AI Analysis
                      </span>
                    </div>

                    {/* Tip text */}
                    <p className="text-xs text-gaming-muted leading-relaxed">
                      {loadout.aiTip}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {loadout.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-white/[0.04] border-white/[0.08] text-gaming-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta stat pills */}
                    <div className="flex gap-2">
                      <div className="flex-1 text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-sm font-bold text-gaming-blue">#{loadout.metaRank}</p>
                        <p className="text-[9px] text-gaming-muted uppercase tracking-wider mt-0.5">Meta Rank</p>
                      </div>
                      <div className="flex-1 text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-sm font-bold text-gaming-green">{loadout.matchPercent}%</p>
                        <p className="text-[9px] text-gaming-muted uppercase tracking-wider mt-0.5">Match</p>
                      </div>
                      <div className="flex-1 text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-sm font-bold text-gaming-purple">{loadout.proUsage}</p>
                        <p className="text-[9px] text-gaming-muted uppercase tracking-wider mt-0.5">Pro Use</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-3 pb-4">
                    <GamingButton
                      variant="primary"
                      glow
                      size="md"
                      className="flex-1 min-h-[44px]"
                      onClick={handleSave}
                    >
                      Save Loadout
                    </GamingButton>
                    <GamingButton
                      variant="ghost"
                      size="md"
                      className="flex-1 min-h-[44px] border border-white/[0.08]"
                      onClick={handleAskAI}
                    >
                      Ask AI ↗
                    </GamingButton>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
