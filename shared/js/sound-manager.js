/* =========================================
 *  SOUND MANAGER — Web Audio API
 *  Exposes: window.SoundManager class
 * ========================================= */
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggle() {
    this.enabled = !this.enabled;
    const btn = document.getElementById('soundToggle');
    if (btn) {
      var icon = btn.querySelector('img');
      if (icon) {
        icon.src = icon.src.replace(/[^/\\]+$/, this.enabled ? 'volume-2.png' : 'volume-x.png');
      }
    }
  }

  _tone(freq, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  click() { this._tone(800, 0.08, 'sine', 0.2); }

  correct() {
    this._tone(523, 0.12, 'sine', 0.25);
    setTimeout(() => this._tone(659, 0.15, 'sine', 0.25), 100);
  }

  wrong() { this._tone(200, 0.25, 'sawtooth', 0.15); }

  unlock() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this._tone(f, 0.2, 'sine', 0.2), i * 120);
    });
  }

  victory() {
    const notes = [523, 523, 587, 659, 659, 587, 523, 494, 440, 440, 494, 523, 523, 494, 494];
    notes.forEach((f, i) => {
      setTimeout(() => this._tone(f, 0.18, 'sine', 0.2), i * 140);
    });
  }
}
