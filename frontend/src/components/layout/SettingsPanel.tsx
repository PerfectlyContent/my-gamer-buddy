import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { GamingToggle } from '@/components/ui';
import { isSoundEnabled, setSoundEnabled, playSound } from '@/lib/sounds';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
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
        <div className="absolute bottom-full left-0 mb-2 lg:left-full lg:bottom-auto lg:top-0 lg:ml-2 lg:mb-0 w-56 glass-strong rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 animate-fade-in">
          <h3 className="text-sm font-bold text-gaming-text mb-3 gaming-heading">Settings</h3>
          <GamingToggle
            label="Sound Effects"
            checked={soundOn}
            onCheckedChange={(checked) => {
              setSoundOn(checked);
              setSoundEnabled(checked);
              if (checked) playSound('click');
            }}
          />
        </div>
      )}
    </div>
  );
}
