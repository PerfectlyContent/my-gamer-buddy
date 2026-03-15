import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, ChevronDown, ChevronUp, Send, Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, triggerHaptic } from '@/lib/sounds';
import { useToast } from '@/components/ui/GamingToast';
import { GamingButton } from '@/components/ui/GamingButton';
import { GamingProgressBar } from '@/components/ui/GamingProgressBar';
import GameHeader from '@/components/layout/GameHeader';
import { useGameStore } from '@/store/gameStore';
import { useChatStore } from '@/store/chatStore';
import { LOADOUT_DATA, Weapon } from '@/data/loadouts';
import { conversationsApi, messagesApi } from '@/lib/api';

export default function Loadout() {
  const { selectedGame } = useGameStore();
  const { createConversation } = useChatStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activePlaystyle, setActivePlaystyle] = useState<string | null>(null);
  const [selectedWeapons, setSelectedWeapons] = useState<Set<number>>(new Set([0, 1]));

  // Custom AI tip state (change #3)
  const [customAiTip, setCustomAiTip] = useState<string | null>(null);

  // Inline AI chat state (change #4)
  const [inlineChatOpen, setInlineChatOpen] = useState(false);
  const [inlineQuestion, setInlineQuestion] = useState('');
  const [inlineAnswer, setInlineAnswer] = useState<string | null>(null);
  const [inlineSending, setInlineSending] = useState(false);

  // Custom weapons state (change #5)
  const [customWeapons, setCustomWeapons] = useState<Weapon[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('Rifle');
  const [customPower, setCustomPower] = useState(50);

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

  // Combined weapons: preset + custom
  const allWeapons = useMemo(() => {
    if (!loadout) return [];
    return [...loadout.weapons, ...customWeapons];
  }, [loadout, customWeapons]);

  const handlePlaystyleChange = useCallback((ps: string) => {
    playSound('filter');
    triggerHaptic('tap');
    setActivePlaystyle(ps);
    setSelectedWeapons(new Set([0, 1]));
    // Reset custom AI tip when playstyle changes (change #3)
    setCustomAiTip(null);
    // Reset custom weapons when playstyle changes
    setCustomWeapons([]);
    // Reset inline chat
    setInlineAnswer(null);
    setInlineQuestion('');
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

  // Update custom AI tip when weapon selection changes (change #3)
  useEffect(() => {
    if (!loadout || !playstyle) return;
    const selected = allWeapons.filter((_, i) => selectedWeapons.has(i));
    if (selected.length === 0) {
      setCustomAiTip(null);
      return;
    }
    const weaponNames = selected.map((w) => w.name).join(', ');
    const weaponTypes = [...new Set(selected.map((w) => w.type))].join(', ');
    setCustomAiTip(
      `You've selected ${weaponNames}. This ${playstyle} setup focuses on ${weaponTypes}.`
    );
  }, [selectedWeapons, allWeapons, playstyle, loadout]);

  const handleSave = useCallback(() => {
    if (!selectedGame || !playstyle || !loadout) return;
    const saved = {
      game: selectedGame.slug,
      playstyle,
      weapons: allWeapons.filter((_, i) => selectedWeapons.has(i)).map((w) => w.name),
      savedAt: new Date().toISOString(),
    };
    const key = `loadout-${selectedGame.slug}`;
    localStorage.setItem(key, JSON.stringify(saved));
    playSound('complete');
    triggerHaptic('achievement');
    toast({ title: 'Loadout saved \u2713', variant: 'success' });
  }, [selectedGame, playstyle, loadout, allWeapons, selectedWeapons, toast]);

  // Change #1: Navigate with draft param instead of auto-sending
  const handleAskAI = useCallback(async () => {
    if (!selectedGame || !playstyle || !loadout) return;
    const selected = allWeapons.filter((_, i) => selectedWeapons.has(i));
    const weaponNames = selected.map((w) => w.name).join(' + ') || 'my loadout';
    const message = `I'm running ${weaponNames} as a ${playstyle} player. Give me 3 tips to win more with this loadout.`;

    await createConversation(selectedGame.id);
    navigate('/chat?draft=' + encodeURIComponent(message));
  }, [selectedGame, playstyle, loadout, allWeapons, selectedWeapons, createConversation, navigate]);

  // Change #4: Inline AI chat send handler
  const handleInlineSend = useCallback(async () => {
    if (!inlineQuestion.trim() || !selectedGame || !playstyle || !loadout) return;
    setInlineSending(true);
    setInlineAnswer(null);

    const selected = allWeapons.filter((_, i) => selectedWeapons.has(i));
    const weaponNames = selected.map((w) => w.name).join(', ') || 'none selected';
    const contextMessage = `[Game: ${selectedGame.name}, Playstyle: ${playstyle}, Loadout: ${weaponNames}] ${inlineQuestion.trim()}`;

    try {
      const conversation = await conversationsApi.create(selectedGame.id);
      const response = await messagesApi.send(conversation.id, contextMessage);
      setInlineAnswer(response.content);
    } catch (error) {
      console.error('Inline AI chat error:', error);
      setInlineAnswer('Sorry, something went wrong. Please try again.');
    } finally {
      setInlineSending(false);
    }
  }, [inlineQuestion, selectedGame, playstyle, loadout, allWeapons, selectedWeapons]);

  // Change #5: Add custom weapon handler
  const handleAddCustomWeapon = useCallback(() => {
    if (!customName.trim()) return;
    const newWeapon: Weapon = {
      name: customName.trim(),
      icon: '🔧',
      type: customType,
      damage: customPower,
    };
    setCustomWeapons((prev) => [...prev, newWeapon]);
    setCustomName('');
    setCustomType('Rifle');
    setCustomPower(50);
    setShowCustomForm(false);
    playSound('complete');
    triggerHaptic('tap');
  }, [customName, customType, customPower]);

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
                    {allWeapons.map((weapon, idx) => {
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
                              {/* Change #2: DMG label */}
                              <span className="text-[9px] text-gaming-muted uppercase tracking-wider">DMG</span>
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

                  {/* Change #5: Add Custom Weapon button + form */}
                  <div>
                    {!showCustomForm ? (
                      <button
                        onClick={() => setShowCustomForm(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-white/[0.12] text-gaming-muted text-xs hover:text-gaming-blue hover:border-gaming-blue/30 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Custom Weapon
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gaming-blue font-bold">
                            Add Custom Weapon
                          </span>
                          <button
                            onClick={() => setShowCustomForm(false)}
                            className="text-gaming-muted hover:text-gaming-text transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-[10px] text-gaming-muted uppercase tracking-wider mb-1">
                            Weapon Name
                          </label>
                          <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g. Rail Gun"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-gaming-text placeholder-gaming-muted outline-none focus:border-gaming-blue/40 transition-colors"
                          />
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-[10px] text-gaming-muted uppercase tracking-wider mb-1">
                            Type
                          </label>
                          <select
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-gaming-text outline-none focus:border-gaming-blue/40 transition-colors appearance-none"
                          >
                            <option value="Rifle">Rifle</option>
                            <option value="SMG">SMG</option>
                            <option value="Shotgun">Shotgun</option>
                            <option value="Pistol">Pistol</option>
                            <option value="Melee">Melee</option>
                            <option value="Utility">Utility</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Power slider */}
                        <div>
                          <label className="block text-[10px] text-gaming-muted uppercase tracking-wider mb-1">
                            Estimated Power: {customPower}
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={customPower}
                            onChange={(e) => setCustomPower(Number(e.target.value))}
                            className="w-full accent-gaming-blue"
                          />
                        </div>

                        {/* Submit */}
                        <GamingButton
                          variant="primary"
                          size="sm"
                          className="w-full min-h-[40px]"
                          onClick={handleAddCustomWeapon}
                          disabled={!customName.trim()}
                        >
                          Add Weapon
                        </GamingButton>
                      </div>
                    )}
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

                    {/* Tip text — change #3: dynamic based on selection */}
                    <p className="text-xs text-gaming-muted leading-relaxed">
                      {customAiTip || loadout.aiTip}
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

                  {/* Change #4: Inline AI chat area */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                    <button
                      onClick={() => setInlineChatOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gaming-muted font-bold">
                        Ask about this loadout
                      </span>
                      {inlineChatOpen ? (
                        <ChevronUp className="w-4 h-4 text-gaming-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gaming-muted" />
                      )}
                    </button>

                    {inlineChatOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        {/* Input row */}
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
                            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-gaming-text placeholder-gaming-muted outline-none focus:border-gaming-blue/40 transition-colors"
                            disabled={inlineSending}
                          />
                          <button
                            onClick={handleInlineSend}
                            disabled={inlineSending || !inlineQuestion.trim()}
                            className="flex-shrink-0 w-9 h-9 rounded-xl bg-gaming-blue flex items-center justify-center text-gaming-bg shadow-glow-teal-sm active:scale-95 transition-all disabled:opacity-40 disabled:shadow-none disabled:scale-100"
                          >
                            {inlineSending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Answer display */}
                        {inlineAnswer && (
                          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                            <p className="text-xs text-gaming-text leading-relaxed whitespace-pre-wrap">
                              {inlineAnswer}
                            </p>
                          </div>
                        )}
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
