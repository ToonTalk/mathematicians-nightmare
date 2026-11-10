// ── the script, laid out in time ────────────────────────────────────────────
const SCRIPT = JSON.parse($('script').textContent), LENGTHS = JSON.parse($('lengths').textContent || '{}');
const LINE = {}; SCRIPT.lines.forEach(l => LINE[l.id] = l);
const HAVE_CLIPS = SCRIPT.lines.every(l => LENGTHS[l.id] > 0);
const SEQ = [
  ['mark', 'study'], ['wait', 2.4], 'n01', 'n02', ['wait', 0.5], 'n03', ['wait', 1.4],
  ['mark', 'fall'], ['wait', 7.2], 'n04', 'n05', 'n06', ['mark', 'pi'], 'n07', ['mark', 'dress'], 'n08', 'n09', 'n10',
  ['mark', 'ballet'], ['wait', 1.2], 'n11', ['wait', 5.5], 'n12', ['wait', 1.4], 'c01', ['wait', 2.4], 'c02', ['wait', 2.4], 'c03', ['wait', 5.5],
  ['mark', 'intro'], 'n13', ['wait', 0.9], 'i01', 'i02', 'i03', 'i04', 'i05', 'i06', 'i07', 'i08', 'i09', 'i10', ['wait', 0.5],
  ['mark', 'bored'], 'n14', 'p01', ['wait', 0.3], ['mark', 'outcry'], 'n15', ['wait', 0.6], 'i11', 'i12', 'i13', ['wait', 0.4], 'n16', ['wait', 0.2], 'q01', ['wait', 2.2], 'n17', ['wait', 1.8],
  ['mark', 'rebel'], 'n18', 'n19', 'k01', ['wait', 0.4], 'n20', ['mark', 'trial'], 'r01', ['wait', 0.3], 'n21', 'p02', 'n22', 'p03', 'r02', 'r03', 'r04', ['wait', 1.4],
  ['mark', 'swarm'], 'n23', 'n24', 'p04', ['wait', 1.6], 'n25', ['wait', 3.2],
  ['mark', 'wake'], ['wait', 3.4], 'n26', 'p05', ['wait', 5.5], ['mark', 'end'],
];
const MK = {}; let TOTAL = 0;
{
  let t = 0;
  for (const s of SEQ) {
    if (Array.isArray(s)) { if (s[0] === 'mark') MK[s[1]] = t; else t += s[1]; continue; }
    const l = LINE[s]; l.t0 = t; l.len = LENGTHS[s] > 0 ? LENGTHS[s] : 0.8 + l.text.length * 0.064; l.t1 = t + l.len; t = l.t1 + 0.45;
  }
  TOTAL = t;
}
const ORDER = SEQ.filter(s => typeof s === 'string').map(s => LINE[s]);
const Ln = id => LINE[id], fr = (id, f) => lerp(LINE[id].t0, LINE[id].t1, f), within = (t, id, a = 0, b = 1) => t >= fr(id, a) && t < fr(id, b);
const CHAPTERS = [['study', 'The study'], ['fall', 'The dream'], ['dress', 'The uniforms'], ['ballet', 'The ballet'], ['intro', 'The introductions'], ['outcry', 'The outcry'], ['rebel', 'One hundred and thirty-seven'], ['swarm', 'The swarm'], ['wake', 'Waking']].map(([m, name]) => ({ t: MK[m], name }));
const SPEAKERS = [['i01', 1], ['i02', 2], ['i03', 3], ['i04', 4], ['i05', 5], ['i06', 6], ['i07', 7], ['i08', 8], ['i09', 9], ['i10', 10], ['i11', 11], ['i12', 12], ['i13', 13]];
const T_DANCE_END = Ln('n13').t0 + 0.5, T_SILENCE = Ln('q01').t0 + 0.2, T_SWARM = fr('n23', 0.6), T_BLOW = fr('p04', 0.42), T_GONE = T_BLOW + 5.2;
const A137 = 0.6, REBEL_SPOT = polar(3.75, A137), ROAM_T = Ln('n05').t1 + 0.1;
const ringPos = (n, r) => polar(r ?? byN[n].r, byN[n].a);

// ── stage directions: everything about the dream at story time t ────────────
const S = { look: null, cross: null, pair: null, rebel: null, fume: null, rebelAt: REBEL_SPOT };
function stage(t) {
  S.reveal = keys(t, [[MK.fall + 1.2, 0], [MK.fall + 4.4, 13.6], [MK.fall + 7, 33], [Ln('n04').t0 + 3.5, 82], [Ln('n05').t0 + 1, 100], [Ln('n05').t0 + 7, 250], [Ln('n05').t1, 3000]]);
  S.dream = sstep(MK.fall + 0.8, MK.fall + 4, t) * (t < MK.wake - 0.4 ? 1 : 0);
  S.gone = t >= T_GONE;
  S.dance = sstep(MK.ballet, MK.ballet + 1.2, t) * (1 - sstep(T_DANCE_END - 0.8, T_DANCE_END, t)); S.du = t - MK.ballet;
  S.sing = t >= Ln('c01').t0 && t < Ln('c03').t1 && (within(t, 'c01') || within(t, 'c02') || within(t, 'c03'));
  S.sneak = pulse(S.du, 17, 27, 2.5);
  // who has the floor
  S.speaker = 0; S.talk = false; S.fwd = 0; S.look = null; S.cross = null; S.angrySpeaker = false;
  for (const [id, n] of SPEAKERS) { const l = Ln(id); if (t >= l.t0 - 0.6 && t < l.t1 + 0.4) { S.speaker = n; S.talk = t >= l.t0 && t < l.t1; S.fwd = pulse(t, l.t0 - 0.6, l.t1 + 0.4, 0.5); S.look = ringPos(n); S.angrySpeaker = n >= 11; S.line = id; } }
  if (within(t, 'i02', 0.45, 1.15) || within(t, 'i08', 0.5, 1.15)) S.cross = [1];
  if (within(t, 'i06', 0.3, 0.95)) S.cross = [28, 496];
  if (within(t, 'i10', 0, 0.45)) S.cross = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (within(t, 'i12', 0.45, 1.1)) S.cross = [10];
  S.pairK = pulse(t, Ln('n06').t0, Ln('n06').t1 + 0.5, 0.5); S.pair = S.pairK > 0 ? [7, 8] : null;
  S.outcry = sstep(fr('n15', 0.55), fr('n15', 0.9), t) * (1 - sstep(T_SILENCE - 0.1, T_SILENCE + 0.15, t));
  S.bowR = t > T_SILENCE ? (t - T_SILENCE) * 60 : 0;
  S.bow = sstep(T_SILENCE, T_SILENCE + 0.3, t) * (1 - sstep(Ln('n17').t1, Ln('n17').t1 + 1.5, t));
  S.pale = sstep(T_SILENCE, T_SILENCE + 0.7, t) * (1 - sstep(Ln('n18').t0, Ln('n18').t0 + 5, t));
  S.waveR = t > T_SILENCE && t < T_SILENCE + 9 ? (t - T_SILENCE) * 60 : -1;
  // one hundred and thirty-seven
  const tPush = fr('n18', 0.48);
  S.rebel = null; S.fume = null;
  if (t >= tPush && t < T_GONE) {
    S.rebel = { x: REBEL_SPOT.x, z: REBEL_SPOT.z, spd: 3.1, push: t < Ln('n18').t1 + 0.3, talk: within(t, 'r01') || within(t, 'r02') || within(t, 'r03') || within(t, 'r04'), fist: within(t, 'r01'), face: t > Ln('n19').t0 ? PROF : null };
    if (t > fr('n18', 0.78) && t < Ln('r01').t0) S.fume = REBEL_SPOT;
  }
  S.knight = sstep(Ln('n19').t0 - 0.3, Ln('n19').t0 + 1.6, t) * (1 - sstep(T_BLOW, T_BLOW + 0.8, t));
  S.urge = within(t, 'k01') ? 1 : 0;
  S.love = pulse(t, fr('r03', 0.6), Ln('r03').t1 + 0.4, 0.7);
  S.angry = sstep(fr('n23', 0.22), fr('n23', 0.4), t) * (t < T_GONE ? 1 : 0);
  S.swarm = t >= T_SWARM ? (t < T_BLOW ? t - T_SWARM : T_BLOW - T_SWARM + (t - T_BLOW) * 0.2) : -1;
  S.blow = t >= T_BLOW ? t - T_BLOW : -1;
  S.mist = sstep(T_BLOW + 3.2, T_BLOW + 6.6, t) * (1 - sstep(MK.wake + 0.8, MK.wake + 3.2, t));
  S.flash = Math.max(pulse(t, T_SILENCE - 0.05, T_SILENCE + 0.5, 0.08) * 0.75 * (1 - sstep(T_SILENCE, T_SILENCE + 0.5, t)), pulse(t, T_BLOW - 0.05, T_BLOW + 0.7, 0.08) * 0.85 * (1 - sstep(T_BLOW, T_BLOW + 0.7, t)));
  S.shake = Math.max(S.outcry * 0.012, sstep(T_SILENCE, T_SILENCE + 0.1, t) * (1 - sstep(T_SILENCE, T_SILENCE + 1.4, t)) * 0.09, S.swarm >= 0 && S.blow < 0 ? 0.035 * sstep(0, 3, S.swarm) : 0, S.blow >= 0 ? 0.08 * (1 - sstep(0, 1.2, S.blow)) : 0);
  // the study
  S.wake = t >= MK.wake - 0.4;
  S.studyK = S.wake ? 1 : 1 - sstep(MK.fall + 2.4, MK.fall + 5.6, t);
  S.fall = S.wake ? 0 : sstep(MK.fall + 0.5, MK.fall + 4.4, t);
  S.hi = -1;
  if (within(t, 'n05', 0.27, 0.92)) S.hi = t < fr('n05', 0.47) ? 0 : t < fr('n05', 0.62) ? 1 : t < fr('n05', 0.8) ? 2 : 3 + (t - fr('n05', 0.8)) / (Ln('n05').len * 0.12) * 4;
  if (within(t, 'n09', 0.05, 0.42)) S.hi = (t - fr('n09', 0.05)) / (Ln('n09').len * 0.37) * 7 - 0.5;
  if (within(t, 'i10', 0.42, 1.05)) S.hi = 1 + (t - fr('i10', 0.42)) / (Ln('i10').len * 0.5) * 6;
  return S;
}
function profAct(t, T) {
  const sp = S.speaker ? ringPos(S.speaker) : null, to = (v) => Math.atan2(v.x - PROF.x, v.z - PROF.z), toPi = to(PI_POS), toR = A137;
  if (t >= MK.wake - 0.4) {
    if (t < Ln('n26').t0 + 0.5) return ['asleep', { seated: 1, rate: 30 }];
    if (t < Ln('p05').t1 + 0.6) return ['awake', { seated: 1, rate: 13, talk: within(t, 'p05'), hy: t > Ln('p05').t0 ? -0.5 : 0 }];
    return ['reading', { seated: 1, rate: 2.5, hp: 0.05, hy: -0.75, eyes: 1 }];
  }
  if (t < Ln('n03').t0 + 0.6) return ['reading', { seated: 1, hp: 0.38 + Math.sin(T * 0.7) * 0.03 }];
  if (t < MK.fall + 2.7) return ['asleep', { seated: 1, rate: 1.3, hp: 0.5 + Math.sin(T * 1.2) * 0.03 }];
  if (t < Ln('n06').t0) return ['wonder', { scan: 1, rate: 2.2 }];
  if (t < MK.pi) return ['stand', { yaw: 4.4 - TAU }];
  if (t < MK.dress) return ['wonder', { yaw: toPi * 0.6, hy: 0.7, hp: -0.42 }];
  if (t < MK.ballet) return ['stand', { scan: 1 }];
  if (t < T_DANCE_END) return ['wonder', { scan: 1, yaw: Math.sin(T * 0.25) * 1.2 }];
  if (t < MK.bored) return ['stand', { yaw: sp ? to(sp) : 0.3, rate: 3 }];
  if (t < Ln('p01').t0) return ['bored', { yaw: 0.6 }];
  if (t < Ln('p01').t1 + 0.3) return ['speak', { yaw: toPi * 0.55, hy: 0.75, hp: -0.3, talk: within(t, 'p01') }];
  if (t < fr('n16', 0.16)) return ['stand', { yaw: sp ? to(sp) : 0.3, rate: 4 }];
  if (t < T_SILENCE + 0.6) return ['ears', { rate: 9, shake: t < T_SILENCE ? 0.5 : 0, yaw: t < fr('n16', 0.42) ? 0.3 : toPi * 0.55 }];
  if (t < Ln('n18').t0) return ['stand', { yaw: 0.2 }];
  if (t < fr('n21', 0.4)) return ['stand', { yaw: toR, hp: within(t, 'n20') ? -0.05 + Math.sin(T * 3) * 0.05 : 0 }];
  if (t < Ln('p02').t1 + 0.2) return ['plead', { yaw: toPi * 0.55, talk: within(t, 'p02') }];
  if (t < Ln('p03').t0) return ['stand', { yaw: toPi * 0.5, hy: 0.6, hp: -0.3 }];
  if (t < Ln('p03').t1 + 0.2) return ['speak', { yaw: toR, talk: within(t, 'p03') }];
  if (t < T_SWARM - 0.4) return ['stand', { yaw: toR, hp: Math.sin(T * 2.6) * 0.07 + 0.03 }];
  if (t < fr('n24', 0.5)) return ['cower', { rate: 9, yaw: 0.2 }];
  if (t < Ln('p04').t0 - 0.15) return ['stand', { rate: 3.5, yaw: 0.15, hp: -0.1 }];
  return ['shout', { rate: 12, yaw: 0.15, talk: within(t, 'p04') }];
}
const PI_IDLE = { rs: 0, rr: 0.15, re: -0.2, ls: 0, lr: 0.15, le: -0.2, bt: 0.3, hy: 0, hp: 0, frown: 0, eyes: 1, yaw: 0.25, vis: 1, lean: 0 };
function piAct(t, T) {
  const p = { ...PI_IDLE };
  p.vis = sstep(MK.fall + 5.0, MK.fall + 7.2, t) * (1 - sstep(T_BLOW + 0.1, T_BLOW + 1.0, t)) * (t < MK.wake - 0.4 ? 1 : 0);
  p.hy = Math.sin(T * 0.4) * 0.12;
  if (within(t, 'n07')) { p.eyes = 1 + 1.3 * pulse(t, fr('n07', 0.6), Ln('n07').t1, 0.6); p.hy = 0; p.yaw = 0.12; }
  if (S.dance > 0.3) { const b = S.du * 2.8 * PI / 3 * 2; p.rs = -1.25 + 0.3 * Math.sin(b); p.rr = 0.55 + 0.3 * Math.cos(b); p.re = -0.7 + 0.25 * Math.sin(b + 1); p.bt = -0.5 + 0.5 * Math.cos(b); p.ls = -0.7; p.lr = 0.8 + 0.15 * Math.sin(b * 0.5); p.le = -0.4; p.yaw = 0.25 + Math.sin(S.du * 0.3) * 0.5; }
  if (t >= T_DANCE_END - 1.0 && t < T_DANCE_END + 1.3) { p.rs = -2.75; p.rr = 0.2; p.re = -0.1; p.bt = -0.2; p.ls = 0; p.lr = 0.15; }
  if (S.speaker && t > MK.intro) { const v = ringPos(S.speaker); p.yaw = Math.atan2(v.x - PI_POS.x, v.z - PI_POS.z) * 0.55; }
  if (t >= Ln('p01').t0 && t < Ln('n15').t0 + 1) { p.yaw = -0.9; p.hy = -0.5; p.hp = 0.3; }
  if (t >= fr('n16', 0.55) && t < T_SILENCE) { p.rs = -2.8; p.rr = 0.3; p.re = -0.1; p.bt = -0.15; p.yaw = 0.1; }
  if (t >= T_SILENCE && t < T_SILENCE + 2.6) { const d = sstep(T_SILENCE, T_SILENCE + 0.25, t); p.rs = lerp(-2.8, -1.0, d); p.re = -0.15; p.bt = lerp(-0.15, 0.9, d); p.ls = -1.0; p.lr = 1.0; p.eyes = 2.6; p.yaw = 0.1; p.frown = 0.6; }
  if (t >= fr('n18', 0.75) && t < T_GONE) { p.yaw = 0.75; p.hp = 0.22; p.frown = Math.max(p.frown, 0.35); }
  if (t >= Ln('n21').t0 && t < Ln('n22').t0) p.frown = 1;
  if (within(t, 'n22')) { p.frown = 0.3; p.hp = 0.22 + 0.16 * Math.sin((t - Ln('n22').t0) * 4.2); }
  if (S.angry > 0) { p.frown = 1; p.yaw = -1.3; p.hp = 0.35; p.rs = -1.2 * S.angry; p.rr = 0.2; p.re = -0.3; p.bt = 1.1; p.eyes = 1.6; p.lean = 0.12 * S.angry; }
  return p;
}

// ── the camera ──────────────────────────────────────────────────────────────
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const camP = new THREE.Vector3(0, 2, 8), camL = new THREE.Vector3(0, 1, 0); let camFov = 42;
const soft = u => lerp(u, ease(u), 0.4);
const orbitAt = (c, d, az, el) => { camL.copy(c); camP.set(c.x + d * Math.sin(az) * Math.cos(el), c.y + d * Math.sin(el), c.z + d * Math.cos(az) * Math.cos(el)); };
const om = (c0, d0, az0, el0, c1, d1, az1, el1, f0 = 42, f1 = f0) => (u) => { const k = soft(u); orbitAt(_p.lerpVectors(c0, c1 || c0, k).clone(), lerp(d0, d1, k), lerp(az0, az1, k), lerp(el0, el1, k)); camFov = lerp(f0, f1, k); };
const mv = (p0, l0, p1, l1, f0 = 42, f1 = f0) => (u) => { const k = soft(u); camP.lerpVectors(p0, p1, k); camL.lerpVectors(l0, l1, k); camFov = lerp(f0, f1, k); };
// A portrait of number n in three-quarter view. It picks the side that keeps clear of Pi and the Professor.
const port = (n, o = {}) => {
  let sel = 0, lastU = 2;
  return (u) => {
    const a = byN[n], r = Math.hypot(a.x, a.z) || 1, tier = r < 7.2 ? 0 : r < 14 ? 1 : 2, ix = -a.x / r, iz = -a.z / r;
    const P = o.low ? { d: 3.2, side: 2.6, h: 0.5, up: 2.15, fov: 54 } : o.close ? { d: 1.8, side: 1.5, h: 1.1, up: 0.95, fov: 40 } : [{ d: 2.5, side: 2.0, h: 1.05, up: 0.86, fov: 40 }, { d: 2.7, side: 1.0, h: 2.1, up: 0.85, fov: 38 }, { d: 4.4, side: 0.8, h: 3.0, up: 0.75, fov: 36 }][tier];
    const d = (o.d ?? P.d) - (o.push ?? 0.3) * u, side = Math.abs(o.side ?? P.side), want = Math.sign(o.side ?? 1);
    if (u < lastU || !sel) { const sc = s => { const x = a.x + ix * d + iz * s * side, z = a.z + iz * d - ix * s * side; return Math.min(Math.hypot(x - PI_POS.x, z - PI_POS.z) - 1.25, Math.hypot(x - PROF.x, z - PROF.z) - 0.7, 0.6); }; sel = sc(want) >= 0.5 || sc(want) >= sc(-want) ? want : -want; }
    lastU = u;
    camP.set(a.x + ix * d + iz * sel * side, o.h ?? P.h, a.z + iz * d - ix * sel * side); camL.set(a.x, o.up ?? P.up, a.z); camFov = o.fov ?? P.fov;
  };
};
const SHOTS = [];
const shot = (t0, t1, fn) => SHOTS.push({ t0, t1, fn });
const cuts = (id, parts, tEnd) => { const l = Ln(id); parts.forEach(([f, fn], i) => shot(fr(id, f), i + 1 < parts.length ? fr(id, parts[i + 1][0]) : tEnd ?? l.t1 + 0.45, fn)); };
{
  const O = V(0, 1.1, 0), PIH = V(PI_POS.x, 3.03, PI_POS.z), a = n => byN[n].a;
  const maskShot = (dx = 0.3, d0 = 2.4, d1 = 1.75) => mv(V(PI_POS.x + dx + 0.2, 3.0, PI_POS.z + d0), PIH, V(PI_POS.x + dx, 3.03, PI_POS.z + d1), PIH, 30, 26);
  // the study
  shot(0, Ln('n02').t0, om(O, 7.2, 0.5, 0.2, O, 5.6, 0.22, 0.16));
  shot(Ln('n02').t0, Ln('n03').t0, mv(V(0.9, 1.75, 1.5), V(-3.5, 1.85, -0.3), V(-0.2, 1.8, 0.75), V(-3.5, 1.72, -0.5), 40, 31));
  shot(Ln('n03').t0, MK.fall + 0.8, om(V(0, 1.05, 0.1), 3.0, -0.6, 0.12, V(0, 1.05, 0.1), 2.3, -0.32, 0.1, 36));
  // the walls fall away and the plain opens
  shot(MK.fall + 0.8, Ln('n04').t0 + 1.4, om(V(0, 1.0, 0), 3.2, -0.32, 0.12, V(0, 1.6, 0), 22, 0.3, 0.44));
  shot(Ln('n04').t0 + 1.4, Ln('n05').t0, (u) => { const th = lerp(5.55, 3.05, soft(u)); camP.copy(polar(1.2, th, 1.2)); camL.copy(polar(5, th - 0.1, 0.95)); camFov = 44; });
  shot(Ln('n05').t0, Ln('n06').t0, om(V(0, 0.5, 0), 15, 0.55, 0.28, V(0, 0, 0), 150, 1.2, 0.6));
  shot(Ln('n06').t0, Ln('n07').t0, (u) => { camP.copy(polar(lerp(0.75, 1.15, u), 4.4, 1.5)); camL.copy(polar(5, 4.4, 0.62)); camFov = 40; });
  cuts('n07', [[0, mv(V(PI_POS.x + 0.9, 0.55, PI_POS.z + 5.0), V(PI_POS.x - 0.3, 1.1, PI_POS.z), V(PI_POS.x + 0.5, 1.0, PI_POS.z + 4.3), V(PI_POS.x - 0.2, 2.75, PI_POS.z), 42)], [0.56, maskShot()]]);
  cuts('n08', [[0, port(9, { close: true })], [0.2, port(4, { side: -1 })], [0.35, port(8)], [0.47, port(10, { side: -1 })], [0.6, port(7)], [0.83, port(6, { side: -1 })]]);
  cuts('n09', [[0, om(V(0, 0, 0), 64, -0.7, 0.5, V(0, 0, 0), 105, -0.3, 0.78)], [0.43, port(100)], [0.63, port(13, { side: -1 })], [0.8, port(666)]]);
  shot(Ln('n10').t0, MK.ballet + 1.2, port(1000));
  // the ballet
  shot(MK.ballet + 1.2, fr('n11', 0.52), om(V(0, 0, 0), 25, 0.2, 1.02, V(0, 0, 0), 33, 0.75, 0.86));
  shot(fr('n11', 0.52), Ln('n11').t1 + 2.2, om(V(0, 1, 0), 12.5, -0.9, 0.2, V(0, 1, 0), 11.5, -0.15, 0.25));
  shot(Ln('n11').t1 + 2.2, Ln('c01').t0, mv(V(-6.4, 0.7, 6.8), V(0.8, 1.9, -0.4), V(-4.2, 0.85, 7.8), V(0.8, 2.0, -0.4), 44));
  shot(Ln('c01').t0, Ln('c02').t0, (u) => { const th = lerp(-0.7, 0.05, u); camP.copy(polar(18.8, th, 2.3)); camL.copy(polar(13.6, th + 0.26, 0.9)); camFov = 40; });
  shot(Ln('c02').t0, Ln('c03').t0, om(V(0, 0, 0), 40, 0, 1.5, V(0, 0, 0), 62, 0.6, 1.5));
  shot(Ln('c03').t0, Ln('c03').t1 + 1.4, mv(polar(35.2, 2.2, 1.5), V(0, 3, 0), polar(36.4, 2.6, 2.6), V(0, 3.6, 0), 46));
  shot(Ln('c03').t1 + 1.4, MK.intro, om(V(0, 0, 0), 62, 2.6, 0.3, V(0, 0, 0), 150, 3.0, 0.52));
  // the introductions
  shot(MK.intro, Ln('i01').t0 - 0.25, om(V(0.6, 1.4, 0), 12.5, 0.12, 0.36, V(0.6, 1.4, 0), 9.6, 0.0, 0.27));
  shot(Ln('i01').t0 - 0.25, Ln('i02').t0, port(1, { low: true }));
  cuts('i02', [[0, port(2, { side: -1 })], [0.62, port(1, { close: true, side: -1 })]]);
  cuts('i03', [[0, port(3)], [0.52, port(3, { low: true })]]);
  shot(Ln('i04').t0, Ln('i05').t0, port(4, { low: true, side: -1 }));
  cuts('i05', [[0, port(5, { low: true })], [0.52, mv(polar(4.2, a(5) + PI, 2.1), polar(9.5, a(5), 5.4), polar(5.4, a(5) + PI, 2.3), polar(9.5, a(5), 6.0), 46)]]);
  cuts('i06', [[0, port(6, { low: true, side: -1 })], [0.32, port(28)], [0.56, port(496, { side: -1 })], [0.78, port(6, { close: true })]]);
  shot(Ln('i07').t0, Ln('i08').t0, port(7, { low: true }));
  cuts('i08', [[0, port(8, { low: true, side: -1 })], [0.55, port(1, { close: true })]]);
  shot(Ln('i09').t0, Ln('i10').t0, port(9, { low: true, side: -1 }));
  cuts('i10', [[0, port(10)], [0.4, (u) => { camP.copy(polar(lerp(1.6, 0.4, u), a(10), lerp(3.0, 7.5, soft(u)))); camL.copy(polar(lerp(22, 60, u), a(10), 0)); camFov = 50; }]], MK.bored);
  shot(MK.bored, Ln('p01').t0, om(V(0.7, 1.9, 0), 7.2, 0.18, 0.1, V(0.7, 1.9, 0), 6.3, 0.06, 0.08));
  shot(Ln('p01').t0, Ln('n15').t0, om(V(0, 1.5, 0), 2.8, 1.28, 0.05, V(0, 1.5, 0), 2.5, 1.18, 0.05, 36));
  // the outcry and the silence
  shot(Ln('n15').t0, Ln('i11').t0, om(V(0, 1, 0), 12.5, -0.4, 0.42, V(0, 1, 0), 17, -0.15, 0.35));
  shot(Ln('i11').t0, Ln('i12').t0, port(11));
  cuts('i12', [[0, port(12, { side: -1 })], [0.6, port(10, { close: true })]]);
  shot(Ln('i13').t0, Ln('n16').t0, port(13, { close: true }));
  cuts('n16', [[0, om(V(0, 1.5, 0), 2.5, 0.12, 0.05, V(0, 1.52, 0), 2.0, 0.38, 0.05, 36)], [0.56, mv(V(PI_POS.x - 1.3, 0.9, PI_POS.z + 4.4), V(PI_POS.x, 2.7, PI_POS.z), V(PI_POS.x - 1.0, 1.0, PI_POS.z + 3.7), V(PI_POS.x, 3.0, PI_POS.z), 44)]], Ln('q01').t0);
  shot(Ln('q01').t0, T_SILENCE + 0.9, mv(V(PI_POS.x + 0.25, 3.0, PI_POS.z + 2.0), PIH, V(PI_POS.x + 0.15, 3.03, PI_POS.z + 1.45), PIH, 26, 22));
  shot(T_SILENCE + 0.9, Ln('n17').t0, om(V(0, 0, 0), 44, 0.6, 0.66, V(0, 0, 0), 64, 0.85, 0.6));
  shot(Ln('n17').t0, MK.rebel, (u) => { const th = lerp(0.95, 1.5, soft(u)); camP.copy(polar(6.5, th, 1.25)); camL.copy(polar(11, th + 0.5, 0.6)); camFov = 42; });
  // one hundred and thirty-seven
  cuts('n18', [[0, port(137)],
    [0.47, (u) => { const b = byN[137], r = Math.hypot(b.x, b.z) || 1, ox = b.x / r, oz = b.z / r; camP.set(b.x + ox * 3.4 + oz * 1.3, 2.3, b.z + oz * 3.4 - ox * 1.3); camL.set(b.x - ox * 2.5, 0.9, b.z - oz * 2.5); camFov = 44; }],
    [0.8, mv(polar(2.3, 0.94 + PI, 2.3), polar(4.3, 0.75, 0.9), polar(2.0, 0.94 + PI, 2.15), polar(4.3, 0.75, 0.9), 44)]]);
  shot(Ln('n19').t0, Ln('k01').t0, port(137, { side: -1, d: 2.9, h: 1.3, up: 1.15 }));
  shot(Ln('k01').t0, Ln('n20').t0, port(137, { close: true, side: -1, h: 1.45, up: 1.4 }));
  cuts('n20', [[0, om(V(0, 1.55, 0), 2.1, 0.78, 0.02, V(0, 1.55, 0), 1.85, 0.7, 0.02, 32)], [0.5, mv(polar(5.6, 0.42, 1.5), V(0.8, 2.2, -0.2), polar(5.2, 0.5, 1.5), V(0.8, 2.25, -0.2), 40)]], MK.trial);
  shot(MK.trial, Ln('n21').t0, port(137, { h: 0.75, up: 1.15, d: 2.3 }));
  cuts('n21', [[0, maskShot(0.3, 1.8, 1.25)], [0.46, om(V(0, 1.45, 0), 2.8, 1.2, 0.05, V(0, 1.45, 0), 2.5, 1.12, 0.05, 36)]]);
  cuts('p02', [[0, mv(polar(6.5, A137 + 0.14, 1.75), V(0.7, 1.85, -0.2), polar(6.1, A137 + 0.1, 1.7), V(0.7, 1.9, -0.2), 40)], [0.5, om(V(0, 1.5, 0), 2.3, 1.05, 0.03, V(0, 1.5, 0), 2.05, 0.95, 0.03, 34)]]);
  shot(Ln('n22').t0, Ln('p03').t0, mv(V(PI_POS.x - 0.1, 2.9, PI_POS.z + 2.3), PIH, V(PI_POS.x + 0.1, 2.95, PI_POS.z + 2.0), PIH, 28));
  cuts('p03', [[0, om(V(0, 1.5, 0), 2.6, 0.32, 0.04, V(0, 1.5, 0), 2.2, 0.45, 0.04, 34)], [0.46, port(137, { side: -1 })], [0.74, om(V(0, 1.52, 0), 2.0, 0.5, 0.03, V(0, 1.52, 0), 1.8, 0.55, 0.03, 32)]]);
  shot(Ln('r02').t0, Ln('r03').t0, port(137, { close: true }));
  cuts('r03', [[0, port(137, { side: -1 })], [0.55, (u) => { camP.copy(polar(lerp(0.9, 1.3, u), 4.4, 1.5)); camL.copy(polar(5, 4.4, 0.7)); camFov = 40; }]]);
  shot(Ln('r04').t0, MK.swarm, port(137, { close: true }));
  // the swarm
  cuts('n23', [[0, om(V(0, 1.5, 0), 2.5, 0.5, 0.04, V(0, 1.5, 0), 2.25, 0.42, 0.04, 34)], [0.2, mv(polar(7.6, 0.2, 0.7), V(0.9, 2.4, -0.3), polar(6.6, 0.05, 0.8), V(0.9, 2.5, -0.3), 46)], [0.52, om(V(0, 4, 0), 150, 0.9, 0.3, V(0, 5, 0), 44, 1.5, 0.42, 46)]]);
  cuts('n24', [[0, om(V(0, 1.0, 0), 2.3, 2.6, 0.45, V(0, 1.0, 0), 2.0, 3.6, 0.3, 52)], [0.5, om(V(0, 1.35, 0), 2.15, 0.3, -0.02, V(0, 1.4, 0), 1.9, 0.15, -0.08, 46)]], Ln('p04').t0);
  shot(Ln('p04').t0, T_BLOW + 0.3, mv(V(0.5, 0.5, 2.15), V(0, 1.7, 0), V(0.3, 0.45, 1.85), V(0, 1.9, 0), 46, 50));
  shot(T_BLOW + 0.3, Ln('n25').t0, om(V(0, 2, 0), 24, 0.5, 0.52, V(0, 2.4, 0), 31, 0.7, 0.46));
  shot(Ln('n25').t0, MK.wake, om(V(0, 2.4, 0), 31, 0.7, 0.46, V(0, 4, 0), 46, 1.0, 0.36));
  // waking
  shot(MK.wake, Ln('n26').t0 + 0.35, om(O, 6.4, 0.28, 0.18, O, 5.7, 0.16, 0.16));
  shot(Ln('n26').t0 + 0.35, Ln('p05').t1 + 1.0, om(V(0, 1.12, 0.1), 2.6, -0.4, 0.1, V(0, 1.12, 0.1), 2.25, -0.25, 0.08, 34));
  shot(Ln('p05').t1 + 1.0, TOTAL + 60, mv(V(1.7, 1.5, 2.7), V(-1.0, 1.3, -0.2), V(2.6, 1.75, 3.9), V(-1.6, 1.5, -0.45), 40));
  SHOTS.sort((x, y) => x.t0 - y.t0);
}
let shotIdx = 0;
function filmCamera(t) {
  if (SHOTS[shotIdx].t0 > t) shotIdx = 0;
  while (shotIdx + 1 < SHOTS.length && SHOTS[shotIdx + 1].t0 <= t) shotIdx++;
  const s = SHOTS[shotIdx]; s.fn(clamp((t - s.t0) / (s.t1 - s.t0)));
}

// ── direct one frame: t is story time, T the running clock ──────────────────
const roam = { on: false, az: 0.4, el: 0.35, d: 16, c: new THREE.Vector3(0, 1, 0) };
// The viewer's own camera while the film runs. It circles whatever the director is looking at,
// from the side and height the viewer chose, at the director's distance times the viewer's zoom.
const free = { on: false, az: 0, el: 0.2, zoom: 1, d: 5, fov: 42, c: new THREE.Vector3(0, 1, 0) };
let dirFov = 42;
function takeCamera() {
  if (free.on) return;
  const v = camP.clone().sub(camL), d = v.length() || 1;
  free.on = true; free.c.copy(camL); free.d = d; free.fov = dirFov; free.zoom = 1; free.az = Math.atan2(v.x, v.z); free.el = Math.asin(clamp(v.y / d, -1, 1));
}
const white = $('white'), black = $('black');
let lastShot = -1;
function direct(t, T, dt, snap) {
  stage(t);
  const d = S.dream;
  G.uT.value = T; G.uReveal.value = S.reveal; G.uDream.value = d; G.uPale.value = S.pale; G.uDance.value = S.dance; G.uDu.value = S.du; G.uBow.value = S.bow; G.uBowR.value = S.bowR; G.uOutcry.value = S.outcry;
  G.uSwarm.value = S.swarm; G.uBlow.value = S.blow; G.uCtr.value.copy(PROF); G.uWaveR.value = S.waveR; G.uHi.value = S.hi;
  groundMat.uniforms.uRug.value = 0;
  skyMat.uniforms.uMist.value = S.mist; skyMat.uniforms.uAnger.value = S.angry * (S.blow < 0 ? 1 : 1 - sstep(0, 1, S.blow));
  for (const l of skyArt.children) l.material.opacity = 0.3 * d * (1 - S.mist) * sstep(100, 260, S.reveal);
  skyArt.rotation.y = T * 0.004;
  // light
  const morning = S.wake ? 1 : 0;
  hemi.intensity = lerp(morning ? 1.5 : 0.22, 1.0, d); rim.intensity = 0.9 * d;
  if (morning) { moon.color.setRGB(1.0, 0.86, 0.66); moon.position.set(30, 20, 10); moon.intensity = 1.7; hemi.color.setRGB(1.0, 0.93, 0.82); }
  else { moon.color.setRGB(0.75, 0.82, 1.0); moon.position.set(-30, 60, 25); moon.intensity = 2.3 * d; hemi.color.setRGB(0.44, 0.47, 0.85); }
  hearth.intensity = 44 * d * sstep(2, 14, S.reveal) * (1 + 0.5 * S.dance);
  scene.fog.color.lerpColors(FOG_NIGHT, FOG_MIST, S.mist); scene.fog.density = lerp(0.0042, 0.045, S.mist * S.mist) * (d > 0 ? 1 : 0); G.uFogD.value = scene.fog.density;
  const wo = Math.max(S.flash, sstep(0.35, 1, S.mist)); white.style.opacity = wo.toFixed(3); document.body.classList.toggle('onwhite', wo > 0.45);
  black.style.opacity = (started ? Math.max(1 - sstep(0.2, 2.2, t), 0) : 0.62).toFixed(3);
  // players
  crowd.visible = host.visible = d > 0 && !S.gone;
  burst.visible = S.blow >= 0 && S.blow < 7 && !S.wake;
  applyStudy(S.studyK, S.fall, morning);
  const [pn, px] = roam.on && t === ROAM_T ? ['wonder', { scan: 1 }] : profAct(t, T); applyProf(pn, px, T, dt, snap);
  applyPi(piAct(t, T), dt, snap);
  updateHelix(t - MK.pi + 1.5, piPose.vis * d * (S.blow < 0 ? 1 : 1 - sstep(0, 0.8, S.blow)));
  updateActors(dt, S, T, snap);
  applyKnight(S.knight, byN[137], T, S.urge);
  // a light for the speaker; apparitions for the boasts
  if (S.speaker) lightOn(byN[S.speaker], S.fwd); else if (S.rebel && t > Ln('n19').t0 && S.swarm < 0) lightOn(byN[137], 0.7 * sstep(Ln('n19').t0, Ln('n19').t0 + 1, t)); else lightOn(PROF, 0);
  const ap = (name, id, f0, f1, n, r, extra = 0) => { const k = pulse(t, fr(id, f0), fr(id, f1) + extra, 0.6); const p = r ? ringPos(n, r) : V(byN[n].x, 0, byN[n].z); showApp(name, k, p, T); if (k > 0.01) APP[name].rotation.y = Math.atan2(camP.x - p.x, camP.z - p.z); };
  ap('one', 'i01', 0.25, 1.05, 1, 0); ap('orion', 'i03', 0.5, 1.0, 3, 0, 0.6); ap('square', 'i04', 0.02, 0.62, 4, 0);
  ap('penta', 'i05', 0.2, 0.52, 5, 0); ap('dodeca', 'i05', 0.5, 1.0, 5, 11, 0.8); APP.dodeca.position.y = 6.2;
  ap('sum6', 'i06', 0.0, 0.32, 6, 0); ap('seven', 'i07', 0.16, 0.9, 7, 0); ap('cube8', 'i08', 0.03, 0.62, 8, 0); ap('muses', 'i09', 0.08, 1.0, 9, 0, 0.3);
  { const k = pulse(t, fr('r03', 0.62), Ln('r03').t1 + 0.4, 0.5); showApp('heart', k, polar(5, 4.4), T); }
  // camera
  if (roam.on) { orbitAt(roam.c, roam.d, roam.az, roam.el); camFov = 42; }
  else {
    filmCamera(t); dirFov = camFov;
    if (free.on) {
      const dd = camP.distanceTo(camL) || 1, k = snap ? 1 : 1 - Math.exp(-dt / 0.38);
      free.c.lerp(camL, k); free.d *= Math.pow(dd / free.d, k); free.fov += (camFov - free.fov) * k;
      orbitAt(free.c, clamp(free.d * free.zoom, 0.7, 900), free.az, free.el); camFov = free.fov;
    }
  }
  if (S.shake > 0 && !REDUCED && !roam.on && !free.on) { camL.x += Math.sin(T * 47) * S.shake; camL.y += Math.sin(T * 53 + 1) * S.shake; camP.x += Math.sin(T * 41 + 2) * S.shake * 0.5; }
  camP.y = Math.max(camP.y, 0.25);
  camera.position.copy(camP); camera.lookAt(camL);
  // on a tall screen, widen the lens so the shot keeps what a 4:3 frame would show
  if (camera.aspect < 1.33) camFov = Math.min(105, 2 * Math.atan(Math.tan(camFov * PI / 360) * Math.min(2.4, 1.33 / camera.aspect)) * 180 / PI);
  if (Math.abs(camera.fov - camFov) > 0.01) { camera.fov = camFov; camera.updateProjectionMatrix(); }
  sky.position.copy(camP);
  G.uPx.value = renderer.domElement.height / (2 * Math.tan(camera.fov * PI / 360));
}
function lineAt(t) { for (const l of ORDER) if (t >= l.t0 && t < l.t1 + 0.25) return l; return null; }
