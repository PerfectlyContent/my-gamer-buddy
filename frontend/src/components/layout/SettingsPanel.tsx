import { useState, useRef, useEffect } from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { GamingToggle } from '@/components/ui';
import {
  isSoundEnabled,
  setSoundEnabled,
  playSound,
  isHapticEnabled,
  setHapticEnabled,
  triggerHaptic,
  getVolume,
  setVolume,
} from '@/lib/sounds';

const supportsHaptic =
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [hapticOn, setHapticOn] = useState(isHapticEnabled());
  const [volume, setVolumeState] = useState(getVolume());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 w-16 text-gaming-muted hover:text-gaming-text hover:bg-white/[0.05] active:scale-[0.95]"
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-wide">Settings</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 lg:left-full lg:bottom-auto lg:top-0 lg:ml-2 lg:mb-0 w-64 glass-strong rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 animate-fade-in space-y-4">
          <h3 className="text-sm font-bold text-gaming-text gaming-heading">Settings</h3>

          {/* Sound Effects toggle */}
          <GamingToggle
            label="Sound Effects"
            checked={soundOn}
            onCheckedChange={(checked) => {
              setSoundOn(checked);
              setSoundEnabled(checked);
              if (checked) playSound('click');
            }}
          />

          {/* Volume + preview — only when sound is on */}
          {soundOn && (
            <div className="space-y-3 pl-0.5">
              {/* Volume slider */}
              <div className="flex items-center gap-3">
                {volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-gaming-muted shrink-0" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-gaming-muted shrink-0" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-gaming-blue bg-white/10"
                  aria-label="Volume"
                />
                <span className="text-[10px] text-gaming-muted w-7 text-right tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Test sounds row */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gaming-muted font-medium uppercase tracking-wider">
                  Preview
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { name: 'click' as const, label: 'Click' },
                      { name: 'send' as const, label: 'Send' },
                      { name: 'complete' as const, label: 'Complete' },
                      { name: 'copy' as const, label: 'Copy' },
                      { name: 'nav' as const, label: 'Nav' },
                      { name: 'marker' as const, label: 'Marker' },
                    ] as const
                  ).map(({ name, label }) => (
                    <button
                      key={name}
                      onClick={() => playSound(name)}
                      className="py-1 px-1.5 text-[10px] font-medium text-gaming-muted hover:text-gaming-text rounded-lg border border-white/[0.08] hover:border-gaming-blue/40 hover:bg-gaming-blue/10 transition-all duration-150 active:scale-[0.95]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Haptic feedback toggle — only on supporting devices */}
          {supportsHaptic && (
            <GamingToggle
              label="Haptic Feedback"
              checked={hapticOn}
              onCheckedChange={(checked) => {
                setHapticOn(checked);
                setHapticEnabled(checked);
                if (checked) triggerHaptic('double');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
