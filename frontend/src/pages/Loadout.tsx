import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, triggerHaptic } from '@/lib/sounds';
import { useToast } from '@/components/ui/GamingToast';
import { GamingButton } from '@/components/ui/GamingButton';
import GameHeader from '@/components/layout/GameHeader';
import { useGameStore } from '@/store/gameStore';
import { useChatStore } from '@/store/chatStore';
import { LOADOUT_DATA } from '@/data/loadouts';
import { conversationsApi, messagesApi } from '@/lib/api';

export default function Loadout() {
  const { selectedGame } = useGameStore();
  const { createConversation } = useChatStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activePlaystyle, setActivePlaystyle] = useState<string | null>(null);
  const [selectedWeapons, setSelectedWeapons] = useState<Set<string>>(new Set());

  // AI analysis state — regenerates when loadout changes
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  // Inline AI chat state — default open
  const [inlineQuestion, setInlineQuestion] = useState('');
  const [inlineAnswer, setInlineAnswer] = useState<string | null>(null);
  const [inlineSending, setInlineSending] = useState(false);

  const gameData = useMemo(() => {
    if (!selectedGame) return null;
    return LOADOUT_DATA[selectedGame.slug] ?? null;
  }, [selectedGame]);

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

  // Pre-select recommended weapons when playstyle changes
  useEffect(() => {
    if (!loadout) return;
    setSelectedWeapons(new Set(loadout.recommended));
    setAiAnalysis(null);
    setInlineAnswer(null);
    setInlineQuestion('');
  }, [loadout]);

  const handlePlaystyleChange = useCallback((ps: string) => {
    playSound('filter');
    triggerHaptic('tap');
    setActivePlaystyle(ps);
  }, []);

  const toggleWeapon = useCallback((weaponName: string) => {
    playSound('click');
    triggerHaptic('tap');
    setSelectedWeapons((prev) => {
      const next = new Set(prev);
      if (next.has(weaponName)) next.delete(weaponName);
      else next.add(weaponName);
      return next;
    });
  }, []);

  // Regenerate AI analysis whenever weapon selection changes
  useEffect(() => {
    if (!selectedGame || !playstyle || !loadout || selectedWeapons.size === 0) {
      setAiAnalysis(null);
      return;
    }

    const weaponNames = [...selectedWeapons].join(', ');
    const recommended = loadout.recommended;
    const isDefault = selectedWeapons.size === recommended.length &&
      recommended.every((w) => selectedWeapons.has(w));

    if (isDefault) {
      setAiAnalysis(loadout.aiTip);
      return;
    }

    // Generate custom analysis for non-default selection
    const customWeapons = [...selectedWeapons].filter((w) => !recommended.includes(w));
    const droppedWeapons = recommended.filter((w) => !selectedWeapons.has(w));

    let tip = loadout.aiTip;
    if (customWeapons.length > 0 || droppedWeapons.length > 0) {
      tip = `Custom loadout: ${weaponNames}. `;
      if (customWeapons.length > 0) {
        tip += `You've added ${customWeapons.join(', ')} beyond the recommended picks. `;
      }
      if (droppedWeapons.length > 0) {
        tip += `You dropped ${droppedWeapons.join(', ')} from the meta build. `;
      }
      tip += loadout.aiTip;
    }
    setAiAnalysis(tip);
  }, [selectedWeapons, selectedGame, playstyle, loadout]);

  const handleSave = useCallback(() => {
    if (!selectedGame || !playstyle) return;
    const saved = {
      game: selectedGame.slug,
      playstyle,
      weapons: [...selectedWeapons],
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`loadout-${selectedGame.slug}`, JSON.stringify(saved));
    playSound('complete');
    triggerHaptic('achievement');
    toast({ title: 'Loadout saved \u2713', variant: 'success' });
  }, [selectedGame, playstyle, selectedWeapons, toast]);

  const handleAskAI = useCallback(async () => {
    if (!selectedGame || !playstyle) return;
    const weaponNames = [...selectedWeapons].join(' + ') || 'my loadout';
    const message = `I'm running ${weaponNames} as a ${playstyle} player. Give me 3 tips to win more with this loadout.`;

    await createConversation(selectedGame.id);
    navigate('/chat?draft=' + encodeURIComponent(message));
  }, [selectedGame, playstyle, selectedWeapons, createConversation, navigate]);

  const handleInlineSend = useCallback(async () => {
    if (!inlineQuestion.trim() || !selectedGame || !playstyle || inlineSending) return;
    setInlineSending(true);
    setInlineAnswer(null);

    const weaponNames = [...selectedWeapons].join(', ') || 'none selected';
    const contextMessage = `[Game: ${selectedGame.name}, Playstyle: ${playstyle}, Loadout: ${weaponNames}] ${inlineQuestion.trim()}`;

    try {
      const conversation = await conversationsApi.create(selectedGame.id);
      const response = await messagesApi.send(conversation.id, contextMessage);
      setInlineAnswer(response.content);
    } catch {
      setInlineAnswer('Sorry, something went wrong. Please try again.');
    } finally {
      setInlineSending(false);
    }
  }, [inlineQuestion, selectedGame, playstyle, selectedWeapons, inlineSending]);

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

            {/* Weapon grid — ALL weapons from the game */}
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
                  <div>
                    <p className="text-[10px] text-gaming-muted uppercase tracking-wider mb-2">
                      Tap to select weapons &bull; Recommended are pre-selected
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {gameData.allWeapons.map((weapon) => {
                        const isSelected = selectedWeapons.has(weapon.name);
                        const isRecommended = loadout.recommended.includes(weapon.name);
                        return (
                          <button
                            key={weapon.name}
                            onClick={() => toggleWeapon(weapon.name)}
                            className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.97] min-h-[44px] ${
                              isSelected
                                ? 'bg-gaming-blue/[0.08] border-gaming-blue/40 shadow-[0_0_16px_rgba(0,212,255,0.15)]'
                                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gaming-blue shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                            )}
                            {isRecommended && (
                              <span className="absolute top-2 left-2 text-[8px] text-gaming-green font-bold uppercase tracking-wider">Meta</span>
                            )}
                            <span className="text-2xl block mb-2">{weapon.icon}</span>
                            <p className="text-sm font-semibold text-gaming-text leading-tight">
                              {weapon.name}
                            </p>
                            <p className="text-[10px] text-gaming-muted mt-0.5">{weapon.type}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Analysis panel — resets when loadout changes */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gaming-blue opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gaming-blue" />
                      </span>
                      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gaming-blue font-bold">
                        AI Analysis
                      </span>
                    </div>

                    <p className="text-xs text-gaming-muted leading-relaxed">
                      {aiAnalysis || loadout.aiTip}
                    </p>

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

                  {/* Inline AI chat — always visible */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                    <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gaming-purple font-bold">
                      Ask About This Loadout
                    </span>
                    <p className="text-[10px] text-gaming-muted">
                      Tell the AI about your playstyle, modes, and preferences for personalized tips.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inlineQuestion}
                        onChange={(e) => setInlineQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleInlineSend();
                          }
                        }}
                        placeholder="What's your playstyle? What modes do you play?"
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-gaming-text placeholder-gaming-muted outline-none focus:border-gaming-purple/40 transition-colors"
                        disabled={inlineSending}
                      />
                      <button
                        onClick={handleInlineSend}
                        disabled={inlineSending || !inlineQuestion.trim()}
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-gaming-purple flex items-center justify-center text-white shadow-sm active:scale-95 transition-all disabled:opacity-40"
                      >
                        {inlineSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {inlineAnswer && (
                      <div className="rounded-xl bg-gaming-purple/[0.08] border border-gaming-purple/20 p-3">
                        <p className="text-xs text-gaming-text leading-relaxed whitespace-pre-wrap">{inlineAnswer}</p>
                      </div>
                    )}
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
