export type SoundName = 'step' | 'select' | 'impact' | 'win' | 'error';
type ContextFactory = () => AudioContext;
const tones: Record<SoundName, [number, number]> = { step: [262, .05], select: [392, .08], impact: [147, .11], win: [523, .2], error: [110, .16] };
export class SoundEngine {
  private context: AudioContext | null = null;
  private enabled = false;
  constructor(private readonly makeContext: ContextFactory = () => new AudioContext()) {}
  setEnabled(enabled: boolean): void { this.enabled = enabled; if (!enabled) return; this.context ??= this.makeContext(); void this.context.resume?.(); }
  isEnabled(): boolean { return this.enabled; }
  play(name: SoundName): void {
    if (!this.enabled) return;
    this.context ??= this.makeContext();
    const [frequency, duration] = tones[name]; const oscillator = this.context.createOscillator(); const gain = this.context.createGain(); const now = this.context.currentTime;
    oscillator.type = name === 'impact' || name === 'error' ? 'square' : 'triangle'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain); gain.connect(this.context.destination); oscillator.start(); oscillator.stop(now + duration);
  }
}
