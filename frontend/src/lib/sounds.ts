export type SoundName =
  | 'click'
  | 'send'
  | 'complete'
  | 'notification'
  | 'nav'
  | 'filter'
  | 'copy'
  | 'error'
  | 'toggle'
  | 'marker';

export type HapticPattern = 'tap' | 'double' | 'achievement' | 'copy' | 'error';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function getVolume(): number {
  const v = parseFloat(localStorage.getItem('gamer-buddy-volume') || '1');
  return isNaN(v) ? 1 : Math.max(0, Math.min(1, v));
}

export function setVolume(v: number) {
  localStorage.setItem('gamer-buddy-volume', String(Math.max(0, Math.min(1, v))));
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15
) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const masterVol = getVolume();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume * masterVol, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

const soundGenerators: Record<SoundName, () => void> = {
  click: () => {
    // Short mechanical click - two quick high-frequency taps
    playTone(800, 0.05, 'square', 0.08);
    setTimeout(() => playTone(600, 0.03, 'square', 0.05), 30);
  },

  send: () => {
    // Ascending whoosh - rising tone
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterVol = getVolume();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12 * masterVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },

  complete: () => {
    // Achievement chime - ascending three-note arpeggio
    playTone(523, 0.15, 'sine', 0.12); // C5
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100); // E5
    setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 200); // G5
  },

  notification: () => {
    // Soft two-tone ding
    playTone(880, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.08), 80);
  },

  nav: () => {
    // Soft navigation swipe - quick descending tone pair
    playTone(600, 0.06, 'sine', 0.07);
    setTimeout(() => playTone(480, 0.09, 'sine', 0.05), 45);
  },

  filter: () => {
    // Light filter tap - single soft tick
    playTone(700, 0.04, 'triangle', 0.06);
  },

  copy: () => {
    // Satisfying copy blip - two ascending tones
    playTone(900, 0.06, 'sine', 0.1);
    setTimeout(() => playTone(1200, 0.1, 'sine', 0.08), 50);
  },

  error: () => {
    // Low buzz error
    playTone(200, 0.1, 'square', 0.1);
    setTimeout(() => playTone(150, 0.15, 'square', 0.08), 80);
  },

  toggle: () => {
    // Crisp toggle - slight pitch change
    playTone(650, 0.04, 'square', 0.07);
    setTimeout(() => playTone(850, 0.06, 'square', 0.05), 35);
  },

  marker: () => {
    // Map ping / sonar blip - descending sine
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterVol = getVolume();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  },
};

export function playSound(name: SoundName) {
  const enabled = localStorage.getItem('gamer-buddy-sound') !== 'false';
  if (!enabled) return;

  try {
    soundGenerators[name]();
  } catch {
    // Audio context may not be available
  }
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem('gamer-buddy-sound') !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem('gamer-buddy-sound', String(enabled));
}

// ── Haptic feedback ──────────────────────────────────────────────────────────

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  tap: 10,
  double: [10, 50, 10],
  achievement: [30, 50, 30, 50, 80],
  copy: [20, 30, 20],
  error: [50, 30, 50],
};

export function isHapticEnabled(): boolean {
  return localStorage.getItem('gamer-buddy-haptic') !== 'false';
}

export function setHapticEnabled(enabled: boolean) {
  localStorage.setItem('gamer-buddy-haptic', String(enabled));
}

export function triggerHaptic(pattern: HapticPattern = 'tap') {
  if (!isHapticEnabled()) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(hapticPatterns[pattern]);
  } catch {
    // Vibration not supported
  }
}
