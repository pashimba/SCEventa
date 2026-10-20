// Romantic Web Audio Synthesizer & Music Player
// Generates a soft, warm romantic acoustic piano & music box chord progression
class RomanticAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.customAudio = null;
    this.usingCustom = false;
    this.volume = 0.6;
    this.masterGain = null;
    this.reverbNode = null;
    this.step = 0;

    // Romantic chord progression in C major / A minor (Canon in D inspired romance)
    // Chords: Cmaj9 -> G/B -> Am9 -> Em/G -> Fmaj7 -> C/E -> Dm7 -> G7sus4
    this.progression = [
      // Chord 1: Cmaj9
      { bass: 36, notes: [48, 52, 55, 59, 64], melody: [64, 67, 71, 67] },
      // Chord 2: G/B
      { bass: 35, notes: [47, 55, 59, 62], melody: [62, 67, 71, 74] },
      // Chord 3: Am9
      { bass: 33, notes: [45, 52, 57, 60, 64], melody: [64, 69, 72, 69] },
      // Chord 4: Em/G
      { bass: 31, notes: [43, 52, 55, 59], melody: [64, 67, 71, 67] },
      // Chord 5: Fmaj7
      { bass: 29, notes: [41, 48, 52, 57, 60], melody: [60, 65, 69, 72] },
      // Chord 6: C/E
      { bass: 28, notes: [40, 48, 52, 55], melody: [60, 64, 67, 72] },
      // Chord 7: Dm7
      { bass: 26, notes: [38, 45, 50, 53, 57], melody: [57, 62, 65, 69] },
      // Chord 8: Gsus4 -> G
      { bass: 31, notes: [43, 50, 55, 60, 62], melody: [62, 65, 62, 59] }
    ];
  }

  initContext() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Create algorithmic warm reverb
    this.reverbNode = this.createReverb();
    this.masterGain.connect(this.reverbNode);
    this.reverbNode.connect(this.ctx.destination);
    this.masterGain.connect(this.ctx.destination);
  }

  createReverb() {
    // Generate synthetic impulse response for warm room ambiance
    const rate = this.ctx.sampleRate;
    const length = rate * 2.5;
    const decay = 2.0;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay * 3);
      left[i] = (Math.random() * 2 - 1) * factor * 0.4;
      right[i] = (Math.random() * 2 - 1) * factor * 0.4;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;

    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.35;
    convolver.connect(wetGain);
    return wetGain;
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a soft piano / music box tone
  playNote(midi, time, duration = 2.0, isMusicBox = false, vel = 0.5) {
    if (!this.ctx) return;
    const freq = this.midiToFreq(midi);

    // Oscillator 1: Fundamental warm sine
    const osc1 = this.ctx.createOscillator();
    osc1.type = isMusicBox ? 'sine' : 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    // Oscillator 2: Overtone chime / harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * (isMusicBox ? 2 : 2.003), time);

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isMusicBox ? 3000 : 1800, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + duration);

    // Gain envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vel * (isMusicBox ? 0.3 : 0.6), time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  scheduleBar() {
    if (!this.isPlaying || this.usingCustom) return;

    const now = this.ctx.currentTime;
    const chordIndex = this.step % this.progression.length;
    const item = this.progression[chordIndex];
    const barDuration = 4.0; // 4 seconds per chord, slow and romantic (60 bpm)

    // Bass note
    this.playNote(item.bass, now, 3.8, false, 0.45);

    // Arpeggiated chord notes
    item.notes.forEach((note, idx) => {
      const delay = idx * 0.22;
      this.playNote(note, now + delay, 3.2, false, 0.35);
    });

    // Twinkling music-box melody notes
    item.melody.forEach((note, idx) => {
      const delay = idx * 0.9 + (Math.random() * 0.05);
      this.playNote(note + 12, now + delay, 2.0, true, 0.4);
    });

    this.step++;
    this.timer = setTimeout(() => {
      this.scheduleBar();
    }, (barDuration - 0.2) * 1000);
  }

  play() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.usingCustom && this.customAudio) {
      this.customAudio.play();
      this.isPlaying = true;
      return;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.scheduleBar();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  loadCustomAudioFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.src = '';
    }
    this.customAudio = new Audio(url);
    this.customAudio.loop = true;
    this.customAudio.volume = this.volume;
    this.usingCustom = true;

    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  playCelebrationChime() {
    this.initContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    const notes = [60, 64, 67, 72, 76, 79, 84]; // C major glissando arpeggio
    notes.forEach((n, i) => {
      this.playNote(n, now + i * 0.08, 2.5, true, 0.6);
    });
  }
}

window.romanticAudio = new RomanticAudio();
