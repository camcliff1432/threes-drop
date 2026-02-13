/**
 * SoundManager - Procedural sound effects using Web Audio API
 * No audio files needed - all sounds synthesized from oscillators and noise.
 * AudioContext created lazily on first user interaction (browser autoplay policy).
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = localStorage.getItem('threes_sound_muted') === 'true';
    this.masterVolume = GameConfig.SOUND ? GameConfig.SOUND.MASTER_VOLUME : 0.3;
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('threes_sound_muted', this.muted);
    return this.muted;
  }

  /**
   * Play a named sound effect
   * @param {string} name - Sound name
   * @param {number} [param] - Optional parameter (e.g. tile value for merge pitch)
   */
  play(name, param) {
    if (this.muted || !this.ctx) return;
    // Resume context if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    try {
      switch (name) {
        case 'drop': this._playDrop(); break;
        case 'merge': this._playMerge(param); break;
        case 'combo': this._playCombo(param); break;
        case 'frenzy': this._playFrenzy(); break;
        case 'gameOver': this._playGameOver(); break;
        case 'click': this._playClick(); break;
        case 'swipe': this._playSwipe(); break;
        case 'swap': this._playSwap(); break;
        case 'merger': this._playMerger(); break;
        case 'wildcard': this._playWildcard(); break;
        case 'explosion': this._playExplosion(); break;
      }
    } catch (e) {
      // Silently fail - audio is non-critical
    }
  }

  /**
   * Trigger haptic feedback if available
   * @param {number|number[]} pattern - Vibration pattern in ms
   */
  haptic(pattern) {
    if (this.muted) return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Haptics not supported
    }
  }

  // ---- Sound implementations ----

  /**
   * Drop sound - sine sweep 200Hz -> 100Hz, 80ms
   */
  _playDrop() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
    gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Merge sound - sine tone pitched by tile value, 150ms
   * @param {number} value - Tile value (higher = higher pitch)
   */
  _playMerge(value) {
    const t = this.ctx.currentTime;
    // Map tile value to frequency: 3->330, 6->370, 12->415, 24->466, 48->523, 96->587, 192->659
    const baseFreq = 330;
    const semitones = value ? Math.log2(value / 3) * 2 : 0;
    const freq = baseFreq * Math.pow(2, semitones / 12);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.15);
    gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    this.haptic(15);
  }

  /**
   * Combo sound - ascending tones, pitch offset by combo count
   * @param {number} count - Combo count (2, 3, 4, ...)
   */
  _playCombo(count) {
    const t = this.ctx.currentTime;
    const baseFreq = 440 + (count || 2) * 60;
    const notes = Math.min(count || 2, 5);

    for (let i = 0; i < notes; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const noteFreq = baseFreq * Math.pow(2, i * 3 / 12);
      const noteTime = t + i * 0.06;
      osc.frequency.setValueAtTime(noteFreq, noteTime);
      gain.gain.setValueAtTime(this.masterVolume * 0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.1);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    }
  }

  /**
   * Frenzy sound - sawtooth sweep 200Hz -> 800Hz, 400ms
   */
  _playFrenzy() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
    gain.gain.setValueAtTime(this.masterVolume * 0.25, t);
    gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    this.haptic([20, 10, 20, 10, 40]);
  }

  /**
   * Game over sound - triangle 400Hz -> 100Hz, 500ms
   */
  _playGameOver() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  /**
   * Click sound - white noise burst, 30ms
   */
  _playClick() {
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);
    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start(t);
  }

  /**
   * Swipe sound - bandpass-filtered noise whoosh, 200ms
   */
  _playSwipe() {
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
    filter.Q.setValueAtTime(5, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start(t);
  }

  /**
   * Swap sound - two quick alternating tones (tile exchange), 180ms
   */
  _playSwap() {
    const t = this.ctx.currentTime;
    // First tone (descending)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, t);
    osc1.frequency.exponentialRampToValueAtTime(340, t + 0.08);
    gain1.gain.setValueAtTime(this.masterVolume * 0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc1.connect(gain1).connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.08);

    // Second tone (ascending) - offset by 90ms
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(340, t + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(520, t + 0.18);
    gain2.gain.setValueAtTime(0.01, t);
    gain2.gain.setValueAtTime(this.masterVolume * 0.3, t + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(t + 0.09);
    osc2.stop(t + 0.18);
  }

  /**
   * Merger sound - rising chord (two simultaneous tones converging), 200ms
   */
  _playMerger() {
    const t = this.ctx.currentTime;
    // Low tone rising
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(280, t);
    osc1.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain1.gain.setValueAtTime(this.masterVolume * 0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc1.connect(gain1).connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.2);

    // High tone falling to meet it
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(600, t);
    osc2.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain2.gain.setValueAtTime(this.masterVolume * 0.25, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.2);
  }

  /**
   * Wildcard sound - sparkly descending arpeggio, 250ms
   */
  _playWildcard() {
    const t = this.ctx.currentTime;
    const notes = [880, 660, 550, 440];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const noteTime = t + i * 0.06;
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(this.masterVolume * 0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.1);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    });
  }

  /**
   * Explosion sound - noise burst + low sine thud 60Hz
   */
  _playExplosion() {
    const t = this.ctx.currentTime;
    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.masterVolume * 0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noiseSource.connect(noiseGain).connect(this.ctx.destination);
    noiseSource.start(t);

    // Low thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
    oscGain.gain.setValueAtTime(this.masterVolume * 0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(oscGain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    this.haptic([30, 20, 50]);
  }
}

// Global singleton
const soundManager = new SoundManager();
