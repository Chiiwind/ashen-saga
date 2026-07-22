// ============================================================
//  Ashen Saga — synthesized audio (Web Audio API)
//  No sound files: every SFX and the music loop is generated
//  in code, so the whole game stays asset-free and portable.
// ============================================================

const Audio = {
  ctx: null,
  master: null,
  musicGain: null,
  enabled: true,
  _noise: null,
  _musicTimer: null,
  _musicNodes: [],

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.0;
    this.musicGain.connect(this.master);
    // cached white-noise buffer
    const len = this.ctx.sampleRate * 1.0;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this._noise = buf;
  },

  // resume after a real user gesture (browser autoplay policy)
  unlock() {
    this.ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.stopMusic();
  },

  // -- low-level voices ---------------------------------------
  tone({ freq = 440, type = 'sine', dur = 0.2, gain = 0.2, attack = 0.005, glideTo = null, dest = null }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest || this.master);
    osc.start(t); osc.stop(t + dur + 0.02);
  },

  noise({ dur = 0.2, gain = 0.3, filter = 'lowpass', freqStart = 2000, freqEnd = 400, q = 1 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise;
    const bq = this.ctx.createBiquadFilter();
    bq.type = filter; bq.Q.value = q;
    bq.frequency.setValueAtTime(freqStart, t);
    bq.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bq); bq.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
  },

  // -- named SFX ----------------------------------------------
  sfx(name) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    switch (name) {
      case 'cursor':
        this.tone({ freq: 520, type: 'square', dur: 0.05, gain: 0.06 }); break;
      case 'confirm':
        this.tone({ freq: 480, type: 'square', dur: 0.06, gain: 0.07 });
        this.tone({ freq: 720, type: 'square', dur: 0.09, gain: 0.06, attack: 0.03 }); break;
      case 'cancel':
        this.tone({ freq: 300, type: 'square', dur: 0.09, gain: 0.07, glideTo: 180 }); break;
      case 'attack': // sword: thud + metal shing
        this.tone({ freq: 140, type: 'triangle', dur: 0.12, gain: 0.22, glideTo: 70 });
        this.noise({ dur: 0.14, gain: 0.18, filter: 'bandpass', freqStart: 2600, freqEnd: 1400, q: 1.4 }); break;
      case 'fire': // whoosh + crackle
        this.noise({ dur: 0.5, gain: 0.28, filter: 'lowpass', freqStart: 1800, freqEnd: 300 });
        this.tone({ freq: 90, type: 'sawtooth', dur: 0.4, gain: 0.12, glideTo: 40 }); break;
      case 'heal': // gentle ascending chime
        [523, 659, 784, 1046].forEach((f, i) =>
          setTimeout(() => this.tone({ freq: f, type: 'sine', dur: 0.3, gain: 0.12, attack: 0.02 }), i * 70)); break;
      case 'buff':
        this.tone({ freq: 200, type: 'sawtooth', dur: 0.3, gain: 0.12, glideTo: 500 }); break;
      case 'hurt': // party takes a hit
        this.tone({ freq: 200, type: 'square', dur: 0.14, gain: 0.14, glideTo: 90 });
        this.noise({ dur: 0.12, gain: 0.12, filter: 'lowpass', freqStart: 900, freqEnd: 200 }); break;
      case 'ko': // a combatant falls
        this.tone({ freq: 300, type: 'sawtooth', dur: 0.5, gain: 0.16, glideTo: 60 }); break;
      case 'victory': // major fanfare
        [523, 659, 784, 1046, 1318].forEach((f, i) =>
          setTimeout(() => this.tone({ freq: f, type: 'square', dur: 0.35, gain: 0.14, attack: 0.01 }), i * 110)); break;
      case 'defeat': // minor descent
        [440, 392, 349, 262].forEach((f, i) =>
          setTimeout(() => this.tone({ freq: f, type: 'sawtooth', dur: 0.5, gain: 0.14 }), i * 200)); break;
    }
  },

  // -- moody battle loop --------------------------------------
  // A slow minor progression: bass pulse + sparse arpeggio.
  startMusic() {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx || this._musicTimer) return;
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);

    const BPM = 96, eighth = 60 / BPM / 2;
    // i – VI – III – V in A minor, roots (Hz) and arpeggio triads
    const bars = [
      { bass: 110.00, arp: [220.00, 261.63, 329.63] }, // Am
      { bass: 87.31,  arp: [174.61, 220.00, 261.63] }, // F
      { bass: 130.81, arp: [261.63, 329.63, 392.00] }, // C
      { bass: 82.41,  arp: [164.81, 207.65, 246.94] }, // E
    ];
    let step = 0;
    let nextTime = this.ctx.currentTime + 0.1;

    const schedule = () => {
      if (!this.ctx) return;
      while (nextTime < this.ctx.currentTime + 0.2) {
        const bar = bars[Math.floor(step / 8) % bars.length];
        const beat = step % 8;
        const dest = this.musicGain;
        // bass on beats 0 and 4
        if (beat === 0 || beat === 4) {
          this.at(bar.bass, 'triangle', nextTime, eighth * 3.2, 0.16, dest);
        }
        // arpeggio on off-beats
        if (beat % 2 === 1) {
          const n = bar.arp[(beat >> 1) % bar.arp.length];
          this.at(n, 'square', nextTime, eighth * 1.4, 0.05, dest);
        }
        // a soft high pad note at bar start
        if (beat === 0) this.at(bar.arp[0] * 2, 'sine', nextTime, eighth * 6, 0.03, dest);
        nextTime += eighth;
        step++;
      }
    };
    this._musicTimer = setInterval(schedule, 40);
  },

  at(freq, type, when, dur, gain, dest) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1400;
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(lp); lp.connect(g); g.connect(dest);
    osc.start(when); osc.stop(when + dur + 0.02);
    this._musicNodes.push(osc);
    if (this._musicNodes.length > 40) this._musicNodes.splice(0, 20);
  },

  stopMusic() {
    if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
    }
  },
};

export default Audio;
