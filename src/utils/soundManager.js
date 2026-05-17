// ── Sound Manager (Web Audio API + BGM) ──

let ctx = null;
let masterGain = null;
let _sfxMuted = false;

// BGM
let bgmAudio = null;
let _bgmEnabled = true;
let _bgmLoaded = false;
const BGM_VOLUME = 0.3;

const STORAGE_KEY = 'tile-game-sound';
const DEFAULT_VOLUME = 0.35;

function loadPref() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const pref = JSON.parse(raw);
      // Backwards compat: old key 'muted' → new key 'sfxMuted'
      _sfxMuted = pref.sfxMuted ?? pref.muted ?? false;
      _bgmEnabled = pref.bgmEnabled ?? true;
      if (bgmAudio && !_bgmEnabled) {
        bgmAudio.pause();
      }
    }
  } catch { /* ignore */ }
}

function savePref() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    sfxMuted: _sfxMuted,
    bgmEnabled: _bgmEnabled,
  }));
}
loadPref();

export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = DEFAULT_VOLUME;
    masterGain.connect(ctx.destination);
  } catch { /* Web Audio not supported */ }
}

export function isMuted() {
  return _sfxMuted;
}

export function setMuted(m) {
  _sfxMuted = m;
  savePref();
}

export function toggleMute() {
  _sfxMuted = !_sfxMuted;
  savePref();
  return _sfxMuted;
}

export function setVolume(v) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

// ── BGM (Background Music via HTMLAudioElement) ──

const bgmModules = import.meta.glob('/public/sounds/*.{aac,m4a,mp3,AAC,M4A,MP3}', { eager: true });
const bgmUrls = Object.values(bgmModules).map((m) => m.default);

function createBgmAudio() {
  if (_bgmLoaded) return;
  _bgmLoaded = true;

  if (bgmUrls.length === 0) {
    console.warn('[BGM] No audio files found in public/sounds/ (expected .aac, .m4a, .mp3)');
    return;
  }

  const url = bgmUrls[0];
  console.log('[BGM] Loading:', url);

  const audio = new Audio(url);
  audio.loop = true;
  audio.volume = BGM_VOLUME;
  audio.preload = 'auto';

  audio.addEventListener('error', (e) => {
    console.warn('[BGM] Failed to load/play audio. AAC format may not be supported in this browser.', e);
  });

  audio.addEventListener('canplaythrough', () => {
    console.log('[BGM] Ready');
    if (_bgmEnabled) {
      audio.play().catch(() => { /* autoplay blocked, will retry on interaction */ });
    }
  });

  return audio;
}

export function initBGM() {
  if (bgmAudio) return;
  bgmAudio = createBgmAudio();
}

export function startBGM() {
  initBGM();
  if (!bgmAudio || !_bgmEnabled) return;
  if (bgmAudio.paused) {
    bgmAudio.play().catch(() => {});
  }
}

export function toggleBGM() {
  _bgmEnabled = !_bgmEnabled;
  savePref();

  if (bgmAudio) {
    if (_bgmEnabled) {
      bgmAudio.play().catch(() => {});
    } else {
      bgmAudio.pause();
    }
  } else if (_bgmEnabled) {
    initBGM();
  }

  return _bgmEnabled;
}

export function isBgmEnabled() {
  return _bgmEnabled;
}

export function setBgmEnabled(enabled) {
  _bgmEnabled = enabled;
  savePref();

  if (bgmAudio) {
    if (_bgmEnabled) {
      bgmAudio.play().catch(() => {});
    } else {
      bgmAudio.pause();
    }
  } else if (_bgmEnabled) {
    initBGM();
  }
}

// ── helpers ──

function now() {
  return ctx ? ctx.currentTime : 0;
}

function resume() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function master() {
  return masterGain || (ctx ? ctx.destination : null);
}

/** Single tone with envelope */
function tone(freq, duration, opts = {}) {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();
  const { type = 'sine', vol = 0.3, fadeOut = true, freqEnd, detune = 0 } = opts;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, t + duration);
  if (detune) osc.detune.setValueAtTime(detune, t);

  gain.gain.setValueAtTime(vol, t);
  if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.connect(gain);
  gain.connect(master());
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

/** Noise buffer generator */
function noiseNode(duration) {
  if (!ctx) return null;
  const len = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

// ── Sound Effects ──

/** 1. Click / Pop — short crisp tick */
export function playClick() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();

  // Quick high-frequency pop with pitch drop
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(500, t + 0.06);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(gain);
  gain.connect(master());
  osc.start(t);
  osc.stop(t + 0.09);
}

/** 2. Match — rising chime arpeggio */
export function playMatch() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();
  const notes = [523, 659, 784]; // C5, E5, G5
  const noteDur = 0.12;
  const gap = 0.07;

  notes.forEach((freq, i) => {
    const start = t + i * gap;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    // Soft attack
    gain.gain.setValueAtTime(0.01, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
    gain.gain.setValueAtTime(0.22, start + noteDur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDur);

    osc.connect(gain);
    gain.connect(master());
    osc.start(start);
    osc.stop(start + noteDur + 0.01);
  });

  // Add a soft shimmer with high harmonics
  const shimmerNotes = [1046, 1318, 1568]; // octave up
  shimmerNotes.forEach((freq, i) => {
    const start = t + i * gap + 0.03;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.01, start);
    gain.gain.exponentialRampToValueAtTime(0.06, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDur);
    osc.connect(gain);
    gain.connect(master());
    osc.start(start);
    osc.stop(start + noteDur + 0.01);
  });
}

/** 3. Victory — happy jingle ~1.5s */
export function playVictory() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();
  // Cheerful ascending melody
  const melody = [
    { freq: 523, dur: 0.15, delay: 0 },     // C5
    { freq: 659, dur: 0.15, delay: 0.1 },    // E5
    { freq: 784, dur: 0.15, delay: 0.2 },    // G5
    { freq: 1047, dur: 0.22, delay: 0.3 },   // C6
    { freq: 1319, dur: 0.22, delay: 0.5 },   // E6
    { freq: 1568, dur: 0.35, delay: 0.7 },   // G6
  ];

  melody.forEach(({ freq, dur, delay }) => {
    const start = t + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.01, start);
    gain.gain.exponentialRampToValueAtTime(0.2, start + 0.03);
    gain.gain.setValueAtTime(0.2, start + dur * 0.55);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(master());
    osc.start(start);
    osc.stop(start + dur + 0.01);
  });

  // Final chord
  [523, 659, 784, 1047].forEach((freq) => {
    const start = t + 1.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.01, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain);
    gain.connect(master());
    osc.start(start);
    osc.stop(start + 0.51);
  });
}

/** 4. Defeat — low descending */
export function playDefeat() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();
  const notes = [
    { freq: 330, delay: 0, dur: 0.3 },   // E4
    { freq: 277, delay: 0.2, dur: 0.3 },  // C#4
    { freq: 220, delay: 0.4, dur: 0.45 }, // A3
  ];

  notes.forEach(({ freq, delay, dur }) => {
    const start = t + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Use a filtered sawtooth-like feel via detuned sines
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.01, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

    // Lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, start);
    filter.Q.setValueAtTime(0.7, start);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master());
    osc.start(start);
    osc.stop(start + dur + 0.01);
  });
}

/** 5. Shuffle — whoosh sweep */
export function playShuffle() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();
  const dur = 0.45;

  const src = noiseNode(dur);
  if (!src) return;

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.exponentialRampToValueAtTime(180, t + dur);
  filter.Q.setValueAtTime(1.2, t);

  gain.gain.setValueAtTime(0.01, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.06);
  gain.gain.setValueAtTime(0.2, t + dur * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(master());
  src.start(t);
  src.stop(t + dur + 0.01);
}

/** 6. Undo — rewind sweep */
export function playUndo() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();
  const dur = 0.22;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(700, t + dur);

  // Add vibrato via oscillator on detune
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(14, t);
  lfoGain.gain.setValueAtTime(25, t);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.detune);
  lfo.start(t);
  lfo.stop(t + dur + 0.01);

  gain.gain.setValueAtTime(0.01, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  osc.connect(gain);
  gain.connect(master());
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

/** 7. Error — double beep */
export function playError() {
  if (!ctx || _sfxMuted) return;
  resume();
  const t = now();

  [0, 0.1].forEach((offset) => {
    const start = t + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(380, start);
    // Slight detune on second beep
    if (offset > 0) osc.frequency.setValueAtTime(420, start);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, start);

    gain.gain.setValueAtTime(0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master());
    osc.start(start);
    osc.stop(start + 0.09);
  });
}
