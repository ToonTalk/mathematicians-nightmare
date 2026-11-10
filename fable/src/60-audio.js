// ── sound: a waltz, the weather of the dream, and voices ────────────────────
const snd = { vol: 1, ctx: null, on: false, master: null, music: null, fx: null, voiceBus: null, done: -1, els: {}, cur: null, drones: null, speechOK: 'speechSynthesis' in window };
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const loudness = () => snd.vol * snd.vol;   // the slider is squared, so that halfway sounds about half as loud
function sndInit() {
  if (snd.ctx) return;
  const C = snd.ctx = new (window.AudioContext || window.webkitAudioContext)();
  snd.master = C.createGain(); snd.master.gain.value = 0.9;
  const comp = C.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3.5; snd.master.connect(comp).connect(C.destination);
  snd.music = C.createGain(); snd.music.gain.value = 0.5; snd.music.connect(snd.master);
  snd.fx = C.createGain(); snd.fx.gain.value = 0.7; snd.fx.connect(snd.master);
  snd.voiceBus = C.createGain(); snd.voiceBus.gain.value = 1.0; snd.voiceBus.connect(snd.master);
  // a little hall for the music box
  const len = C.sampleRate * 2.2, ir = C.createBuffer(2, len, C.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  snd.hall = C.createConvolver(); snd.hall.buffer = ir; const wet = C.createGain(); wet.gain.value = 0.32; snd.hall.connect(wet).connect(snd.master);
  snd.music.connect(snd.hall); snd.fx.connect(snd.hall);
  const nb = C.createBuffer(1, C.sampleRate * 2, C.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; snd.noise = nb;
  // standing layers whose loudness follows the story
  const layer = (build) => { const g = C.createGain(); g.gain.value = 0; build(g); return g; };
  const osc = (type, f, dest, det = 0) => { const o = C.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; o.connect(dest); o.start(); return o; };
  const noiseSrc = (dest) => { const s = C.createBufferSource(); s.buffer = nb; s.loop = true; s.connect(dest); s.start(); return s; };
  snd.drones = {
    dream: layer(g => { const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.connect(g); osc('sawtooth', midi(38), f, -6); osc('sawtooth', midi(45), f, 5); osc('sine', midi(26), g); osc('sine', midi(57), f, 9); g.connect(snd.music); }),
    wind: layer(g => { const f = C.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 0.7; const l = osc('sine', 0.13, C.createGain()); const lg = C.createGain(); lg.gain.value = 260; l.connect(lg).connect(f.frequency); noiseSrc(f); f.connect(g); g.connect(snd.fx); }),
    dread: layer(g => { const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; f.connect(g); osc('sawtooth', midi(34), f, 0); osc('sawtooth', midi(40), f, 12); osc('sawtooth', midi(41), f, -9); g.connect(snd.music); }),
    crowd: layer(g => { const f = C.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.1; const am = C.createGain(); am.gain.value = 0.5; const l = osc('sawtooth', 6.3, C.createGain()); const lg = C.createGain(); lg.gain.value = 0.5; l.connect(lg).connect(am.gain); const l2 = osc('triangle', 9.7, C.createGain()); const lg2 = C.createGain(); lg2.gain.value = 300; l2.connect(lg2).connect(f.frequency); noiseSrc(f); f.connect(am).connect(g); g.connect(snd.fx); }),
    buzz: layer(g => { const f = C.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 1.4; const am = C.createGain(); am.gain.value = 0.6; const l = osc('sine', 31, C.createGain()); const lg = C.createGain(); lg.gain.value = 0.4; l.connect(lg).connect(am.gain); snd.buzzOsc = [osc('sawtooth', 110, f, 0), osc('sawtooth', 117, f, 0), osc('sawtooth', 147, f, 0), osc('square', 98, f, 0)]; f.connect(am).connect(g); g.connect(snd.fx); }),
  };
}
// one plucked or struck note
function note(when, freq, dur, type, gain, dest, opt = {}) {
  const C = snd.ctx, o = C.createOscillator(), g = C.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, when); if (opt.glide) o.frequency.exponentialRampToValueAtTime(opt.glide, when + dur);
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(gain, when + (opt.attack || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g).connect(dest || snd.music); o.start(when); o.stop(when + dur + 0.05);
  if (opt.vib) { const l = C.createOscillator(), lg = C.createGain(); l.frequency.value = opt.vib; lg.gain.value = freq * 0.03; l.connect(lg).connect(o.frequency); l.start(when); l.stop(when + dur + 0.05); }
}
const box = (when, m, gain = 0.2, dur = 1.3) => { note(when, midi(m), dur, 'sine', gain); note(when, midi(m) * 3.01, dur * 0.35, 'sine', gain * 0.22); note(when, midi(m) * 5.4, 0.08, 'sine', gain * 0.12); };
function burstNoise(when, dur, f0, f1, gain, q = 0.8) {
  const C = snd.ctx, s = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain();
  s.buffer = snd.noise; s.loop = true; f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, when); f.frequency.exponentialRampToValueAtTime(f1, when + dur);
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(gain, when + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  s.connect(f).connect(g).connect(snd.fx); s.start(when); s.stop(when + dur + 0.1);
}
// The waltz: sixteen bars in D minor, three beats to the bar, played on a music box.
const BEAT = 1 / 2.8, BAR = BEAT * 3;
const CH = { Dm: [38, 62, 65, 69], Gm: [43, 62, 67, 70], A: [45, 61, 64, 69], Bb: [46, 62, 65, 70] };
const PROG = ['Dm', 'Dm', 'Gm', 'Gm', 'A', 'A', 'Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'A', 'A', 'Dm', 'A'];
const PAT = [[[0, 0], [1, 1], [2, 2]], [[3, 0]], [[2, 0], [1, 1], [0, 2]], [[1, 0], [2, 2]], [[0, 0], [1, 0.5], [2, 1], [3, 1.5], [2, 2], [1, 2.5]], [[0, 0]]];
const TUNE = [0, 1, 2, 3, 4, 1, 2, 5, 4, 3, 0, 1, 2, 4, 0, 1];
function waltzBar(b, when, soft) {
  const ch = CH[PROG[b % 16]], tones = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 24], v = soft ? 0.6 : 1;
  note(when, midi(ch[0]), 0.7, 'triangle', 0.3 * v); note(when, midi(ch[0] + 12), 0.5, 'sine', 0.1 * v);
  for (const k of [1, 2]) for (const m of ch.slice(1)) note(when + k * BEAT, midi(m), 0.22, 'triangle', 0.055 * v);
  for (const [i, at] of PAT[TUNE[b % 16]]) box(when + at * BEAT, tones[i], 0.17 * v, at === 0 && PAT[TUNE[b % 16]].length === 1 ? 2.2 : 1.2);
  if (b % 8 === 7) box(when + 2 * BEAT, tones[3] + 5, 0.07 * v, 1.6);
}
// One-off sounds, pinned to story time.
const CUES = [];
{
  const cue = (t, fn) => CUES.push({ t, fn });
  for (let i = 0; i < 12; i++) cue(MK.study + 0.6 + i * 1.0, w => burstNoise(w, 0.03, i % 2 ? 2600 : 2100, 1800, 0.12, 8));       // the study clock
  for (let i = 0; i < 4; i++) cue(Ln('n03').t0 + 1 + i * 1.0, w => burstNoise(w, 0.03, i % 2 ? 2600 : 2100, 1800, 0.08, 8));
  [62, 65, 69, 72, 74, 77, 81].forEach((m, i) => cue(MK.fall + 1.6 + i * 0.62, w => { box(w, m, 0.26, 3); box(w + 0.09, m + 12, 0.1, 3); }));  // the circles light, one by one
  cue(MK.fall + 0.5, w => burstNoise(w, 3.2, 180, 60, 0.5, 0.5));                                                                 // the walls go over
  cue(Ln('n07').t0 + Ln('n07').len * 0.58, w => { note(w, midi(26), 4, 'sine', 0.5, snd.fx); note(w, midi(33), 4, 'sawtooth', 0.05, snd.fx); });
  cue(T_DANCE_END - 0.3, w => { for (const m of [86, 81, 77, 74]) box(w, m, 0.12, 2.5); });                                         // the baton stops the dance
  cue(T_SILENCE, w => { burstNoise(w, 2.6, 900, 50, 1.0, 0.4); note(w, 70, 2.8, 'sine', 0.9, snd.fx, { glide: 28 }); burstNoise(w + 0.05, 0.4, 5000, 800, 0.5, 0.6); });   // thunder
  cue(Ln('n19').t0 + 0.4, w => { note(w, midi(79), 3.5, 'sine', 0.06, snd.fx, { vib: 5 }); note(w, midi(86), 3.5, 'sine', 0.03, snd.fx, { vib: 5.5 }); });  // the specter
  cue(Ln('r04').t1 - 0.25, w => { note(w, 900, 0.09, 'sine', 0.35, snd.fx, { glide: 120 }); burstNoise(w, 0.07, 3000, 600, 0.3, 1); });        // pop
  cue(T_BLOW, w => { burstNoise(w, 1.8, 300, 5000, 0.9, 0.5); note(w, 55, 2.2, 'sine', 0.9, snd.fx, { glide: 30 }); });
  cue(T_BLOW + 0.7, w => { const C = snd.ctx; for (const [f, g] of [[620, 0.22], [935, 0.1], [1250, 0.05]]) { const o = C.createOscillator(), gg = C.createGain(), l = C.createOscillator(), lg = C.createGain();   // the banshee wail
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f, w); o.frequency.exponentialRampToValueAtTime(f * 2.1, w + 1.3); o.frequency.exponentialRampToValueAtTime(f * 0.45, w + 4.4);
      l.frequency.value = 6.5; lg.gain.value = f * 0.05; l.connect(lg).connect(o.frequency);
      const fl = C.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 1500; fl.Q.value = 2;
      gg.gain.setValueAtTime(0.0001, w); gg.gain.exponentialRampToValueAtTime(g, w + 0.5); gg.gain.exponentialRampToValueAtTime(0.0001, w + 4.5);
      o.connect(fl).connect(gg).connect(snd.fx); o.start(w); l.start(w); o.stop(w + 4.6); l.stop(w + 4.6); } });
  for (let i = 0; i < 9; i++) cue(MK.wake + 1.2 + i * 0.9 + frand(i) * 0.5, w => { const f = 2300 + frand(i + 3) * 1500; for (let k = 0; k < 3; k++) note(w + k * 0.11, f * (1 + k * 0.06), 0.09, 'sine', 0.07, snd.fx, { glide: f * 1.25 }); });   // morning birds
  for (let i = 0; i < 12; i++) cue(MK.wake + 0.8 + i * 1.0, w => burstNoise(w, 0.03, i % 2 ? 2600 : 2100, 1800, 0.1, 8));
  CUES.sort((a, b) => a.t - b.t);
}
// Called every frame while playing: schedules what falls in the next quarter second.
function sndTick(t, playing) {
  if (!snd.ctx) return;
  const C = snd.ctx, now = C.currentTime, set = (g, v, tc = 0.4) => g.gain.setTargetAtTime(v, now, tc);
  const live = snd.on && playing;
  set(snd.master, live ? 0.9 * loudness() : 0, 0.08);
  if (!live) { snd.done = -1; return; }
  const D = snd.drones, speaking = !!lineAt(t);
  set(D.dream, S.dream * (S.dance > 0 ? 0.05 : 0.16) * (1 - S.mist), 0.8); set(D.wind, S.dream * 0.05 + S.mist * 0.12 + (S.swarm >= 0 ? 0.1 : 0), 0.6);
  set(D.dread, (S.angry * 0.22 + (S.rebel ? 0.05 : 0) + S.pale * 0.1) * (S.blow < 0 ? 1 : 0), 0.5);
  set(D.crowd, S.outcry * 0.5 + (S.swarm >= 0 && S.blow < 0 ? 0.25 : 0), 0.15);
  const sw = S.swarm >= 0 && S.blow < 0 ? sstep(0, 5, S.swarm) : 0; set(D.buzz, sw * 0.4, 0.2);
  snd.buzzOsc.forEach((o, i) => o.frequency.setTargetAtTime([110, 117, 147, 98][i] * (1 + sw * 0.9), now, 0.3));
  set(snd.music, speaking ? 0.36 : 0.55, 0.25);
  const from = Math.max(snd.done, t - 0.02), to = t + 0.25;
  for (const c of CUES) if (c.t > from && c.t <= to) c.fn(now + Math.max(0, c.t - t));
  const w0 = MK.ballet + 0.9, w1 = T_DANCE_END - 0.4;
  if (to > w0 && from < w1) for (let b = Math.max(0, Math.ceil((from - w0) / BAR)); w0 + b * BAR <= Math.min(to, w1); b++) { const bt = w0 + b * BAR; if (bt > from) waltzBar(b, now + Math.max(0, bt - t), false); }
  snd.done = to;
}
// ── voices: recorded clips when they exist, otherwise the browser's own voice ─
function clip(l) {
  let el = snd.els[l.id];
  if (!el) { el = snd.els[l.id] = new Audio(`narration/${l.id}.mp4`); el.preload = 'auto'; el.volume = loudness(); el.addEventListener('error', () => { el.bad = true; }); }
  return el;
}
function voiceTick(t, playing) {
  const l = playing && snd.on ? lineAt(t) : null;
  if (HAVE_CLIPS && !(l && clip(l).bad)) {
    if (snd.cur && snd.cur !== l) { const el = snd.els[snd.cur.id]; if (el) el.pause(); snd.cur = null; }
    if (l && t < l.t1 - 0.05) {
      const el = clip(l), pos = t - l.t0;
      if (!el.bad && (snd.cur !== l || (el.paused && !(el.ended && pos > l.len - 0.6)))) { snd.cur = l; if (Math.abs(el.currentTime - pos) > 0.3) el.currentTime = Math.max(0, pos); el.play().catch(e => { if (e && /NotAllowed|NotSupported/.test(e.name)) el.bad = true; }); }
    }
    const i = l ? ORDER.indexOf(l) + 1 : ORDER.findIndex(x => x.t0 > t), nx = ORDER[i]; if (nx && nx.t0 - t < 8) clip(nx);
    return;
  }
  if (!snd.speechOK) return;
  if (snd.cur !== l) {
    snd.cur = l; snd.said = !l; try { speechSynthesis.cancel(); } catch (e) { }
    if (l && t - l.t0 < 0.6) {
      const who = l.who || 'narrator', u = new SpeechSynthesisUtterance(l.text), vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
      const pick = (re) => vs.find(v => re.test(v.name) && /GB|UK|Brit/i.test(v.name + v.lang)) || vs.find(v => re.test(v.name));
      const n = parseInt(who, 10), lady = !isNaN(n) && n % 2 === 0;
      const voice = (lady ? pick(/female|Sonia|Libby|Hazel|Susan|Zira|Samantha|Google UK English Female/i) : pick(/male|Ryan|Thomas|George|David|Daniel|Google UK English Male/i)) || vs.find(v => /GB/i.test(v.lang)) || vs[0];
      if (voice) u.voice = voice;
      u.rate = 1.04; u.pitch = who === 'pi' ? 0.1 : who === 'narrator' ? 0.95 : who === 'knight' ? 0.6 : who.startsWith('prof') ? 0.8 : who === 'chorus' ? 1.5 : lady ? 1.35 + (n % 5) * 0.08 : 0.55 + (n % 7) * 0.09;
      u.volume = loudness(); u.onend = u.onerror = () => { if (snd.cur === l) snd.said = true; }; try { speechSynthesis.speak(u); } catch (e) { snd.said = true; }
    } else snd.said = true;
  }
}
// The film waits for a voice that is running behind, so no line is ever cut off by the next one.
let heldFor = 0;
function voiceHold(t, dt) {
  const l = snd.cur; let wait = false;
  if (snd.on && l && heldFor < (HAVE_CLIPS ? 6 : 14)) {
    const el = HAVE_CLIPS ? snd.els[l.id] : null;
    if (el && !el.bad) wait = !el.ended && (el.readyState < 3 || t >= l.t1 + 0.15);   // still loading, or still speaking at the end
    else wait = !snd.said && t >= l.t1 + 0.15;                                        // the browser's own voice, which says when it is done
  }
  heldFor = wait ? heldFor + dt : l && t >= l.t1 + 0.15 ? heldFor : 0;
  return wait;
}
function sndStopVoices() { for (const id in snd.els) snd.els[id].pause(); snd.cur = null; if (snd.speechOK) try { speechSynthesis.cancel(); } catch (e) { } }
