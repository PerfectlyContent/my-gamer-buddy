type SoundName = 'click' | 'send' | 'complete' | 'notification';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
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
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
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
};

export function playSound(name: SoundName) {
  const enabled = localStorage.getItem('gamer-buddy-sound') !== 'false';
  if (!enabled) return;

  try {
    soundGenerators[name]();
  } catch (e) {
    // Audio context may not be available
  }
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem('gamer-buddy-sound') !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem('gamer-buddy-sound', String(enabled));
}
