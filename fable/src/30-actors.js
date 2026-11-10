// ── the first thousand numbers: card-soldier figures with heads, arms and legs ─────────
const LEG = 0.32;
const KIND = {
  //        shoulder x,y   head y   label: y, z, w, h, bend radius   leg x
  tile:  { sh: [0.45, 0.98], head: 1.37, lab: [0.74, 0.070, 0.56, 0.42, 0],    legX: 0.20, c: 0.74 },
  die:   { sh: [0.38, 0.82], head: 1.23, lab: [0.67, 0.356, 0.46, 0.36, 0],    legX: 0.18, c: 0.67 },
  ball:  { sh: [0.42, 0.86], head: 1.37, lab: [0.74, 0.448, 0.40, 0.30, 0.44], legX: 0.15, c: 0.74 },
  cyl:   { sh: [0.32, 0.98], head: 1.37, lab: [0.76, 0.306, 0.36, 0.30, 0.30], legX: 0.13, c: 0.74 },
  tunic: { sh: [0.31, 0.96], head: 1.31, lab: [0.62, 0.292, 0.30, 0.26, 0.28], legX: 0.12, c: 0.65 },
  skirt: { sh: [0.28, 0.82], head: 1.16, lab: [0.72, 0.268, 0.27, 0.21, 0.26], legX: 0.10, c: 0.55 },
};
const F_NEUTRAL = 0, F_TALK = 1, F_SING = 2, F_ANGRY = 3, F_SCARED = 4, F_BLINK = 5;

// Six expressions, two rows (gentlemen above, ladies below). White ground so the head's own color shows through.
const faceTex = canvasTex(1536, 256, (g) => {
  g.fillStyle = '#fff'; g.fillRect(0, 0, 1536, 256);
  const U = 194;   // pixels per unit of head surface
  for (let row = 0; row < 2; row++) for (let f = 0; f < 6; f++) {
    const lady = row === 1, x0 = f * 256, y0 = row * 128;
    g.fillStyle = lady ? '#3a2430' : '#2b2530';
    g.fillRect(x0, y0, 60, 98); g.fillRect(x0 + 196, y0, 60, 98); g.fillRect(x0, y0, 256, lady ? 30 : 22);
    g.beginPath(); for (let k = 0; k <= 8; k++) g.arc(x0 + 60 + k * 17, y0 + (lady ? 30 : 22), 9, 0, PI); g.fill();
    if (lady) { g.beginPath(); g.ellipse(x0 + 64, y0 + 60, 12, 40, 0, 0, TAU); g.ellipse(x0 + 192, y0 + 60, 12, 40, 0, 0, TAU); g.fill(); }
    g.save(); g.translate(f * 256 + 128, row * 128 + 64); g.scale(U, -U);   // y up
    g.fillStyle = 'rgba(214,92,92,.42)'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 0.118, -0.045, lady ? 0.04 : 0.034, 0, TAU); g.fill(); }
    g.fillStyle = '#17131f'; g.strokeStyle = '#17131f'; g.lineWidth = 0.014; g.lineCap = 'round';
    const eye = (s) => {
      const ex = s * 0.072, ey = 0.035;
      if (f === F_BLINK || f === F_SING) { g.beginPath(); g.arc(ex, ey + (f === F_SING ? -0.018 : 0.012), 0.028, f === F_SING ? 0.15 * PI : 1.15 * PI, f === F_SING ? 0.85 * PI : 1.85 * PI); g.stroke(); }
      else {
        const r = f === F_SCARED ? 0.036 : 0.027;
        if (f === F_SCARED) { g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, r + 0.012, 0, TAU); g.fill(); g.lineWidth = 0.008; g.stroke(); g.lineWidth = 0.014; g.fillStyle = '#17131f'; g.beginPath(); g.arc(ex, ey, 0.016, 0, TAU); g.fill(); }
        else { g.beginPath(); g.ellipse(ex, ey, r * 0.82, r, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + 0.009, ey + 0.011, 0.008, 0, TAU); g.fill(); g.fillStyle = '#17131f'; }
      }
      // brows
      g.beginPath();
      if (f === F_ANGRY) { g.moveTo(ex - s * 0.04, ey + 0.085); g.lineTo(ex + s * 0.035, ey + 0.045); g.lineWidth = 0.02; }
      else if (f === F_SCARED) { g.moveTo(ex - s * 0.03, ey + 0.065); g.lineTo(ex + s * 0.03, ey + 0.085); }
      else { g.moveTo(ex - 0.03, ey + 0.062); g.quadraticCurveTo(ex, ey + 0.075, ex + 0.03, ey + 0.062); }
      g.stroke(); g.lineWidth = 0.014;
      if (lady && f !== F_BLINK && f !== F_SING) for (const k of [0, 1]) { g.beginPath(); g.moveTo(ex + s * (0.02 + k * 0.012), ey + 0.02 - k * 0.012); g.lineTo(ex + s * (0.04 + k * 0.01), ey + 0.034 - k * 0.018); g.lineWidth = 0.008; g.stroke(); g.lineWidth = 0.014; }
    };
    eye(-1); eye(1);
    // mouth
    g.beginPath();
    if (f === F_TALK) { g.fillStyle = '#4a1420'; g.ellipse(0, -0.085, 0.034, 0.03, 0, 0, TAU); g.fill(); }
    else if (f === F_SING) { g.fillStyle = '#4a1420'; g.ellipse(0, -0.088, 0.03, 0.042, 0, 0, TAU); g.fill(); }
    else if (f === F_ANGRY) { g.fillStyle = '#4a1420'; g.moveTo(-0.05, -0.105); g.quadraticCurveTo(0, -0.03, 0.05, -0.105); g.quadraticCurveTo(0, -0.085, -0.05, -0.105); g.fill(); g.stroke(); }
    else if (f === F_SCARED) { g.moveTo(-0.045, -0.09); g.bezierCurveTo(-0.03, -0.07, -0.015, -0.11, 0, -0.09); g.bezierCurveTo(0.015, -0.07, 0.03, -0.11, 0.045, -0.09); g.stroke(); }
    else { g.moveTo(-0.034, -0.075); g.quadraticCurveTo(0, -0.105, 0.034, -0.075); g.stroke(); }
    if (!lady && f !== F_SCARED) { g.lineWidth = 0.012; g.beginPath(); g.moveTo(-0.004, -0.02); g.quadraticCurveTo(0.012, -0.04, -0.004, -0.045); g.stroke(); }
    g.restore();
  }
});
const pipTex = canvasTex(384, 256, (g) => {
  g.fillStyle = '#fff'; g.fillRect(0, 0, 384, 256);
  const P = { 1: [], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, 1], [-1, 1], [1, -1]], 5: [[-1, -1], [1, 1], [-1, 1], [1, -1], [0, 0]], 6: [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0]] };
  [1, 2, 3, 4, 5, 6].forEach((n, i) => { const cx = (i % 3) * 128 + 64, cy = (i / 3 | 0) * 128 + 64;
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 6; g.strokeRect(cx - 61, cy - 61, 122, 122);
    g.fillStyle = 'rgba(20,14,30,.85)'; for (const p of P[n]) { g.beginPath(); g.arc(cx + p[0] * 32, cy + p[1] * 32, 12, 0, TAU); g.fill(); } });
});
// Number atlases: white numerals, tinted per figure. Small numbers get big cells for the close-ups.
const HI_MAX = 144, HI_C = 12, LO_C = 32;
function numberAtlas(first, count, cells, px) {
  return canvasTex(cells * px, cells * px, (g) => {
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < count; i++) {
      const s = String(first + i), fs = px * (s.length <= 2 ? 0.62 : s.length === 3 ? 0.47 : 0.37);
      g.font = `bold ${fs}px Georgia, "Times New Roman", serif`;
      g.fillText(s, (i % cells) * px + px / 2, (i / cells | 0) * px + px / 2 + fs * 0.06);
    }
  });
}
const atlasHi = numberAtlas(1, HI_MAX, HI_C, 170), atlasLo = numberAtlas(HI_MAX + 1, 1000 - HI_MAX, LO_C, 64);
const cellRect = (i, cells) => [(i % cells) / cells, 1 - ((i / cells | 0) + 1) / cells, 1 / cells, 1 / cells];

const bodyMat = patch(std(0xffffff, 0.48, 0.02), { pale: 0.72 });
const dieMat = patch(std(0xffffff, 0.4, 0.02, { map: pipTex }), { pale: 0.72 });
const headMat = patch(std(0xffffff, 0.55, 0, { map: faceTex }), { face: true, pale: 0.5 });
const limbMat = patch(std(0xffffff, 0.6), { pale: 0.6 });
const legMat = std(0x1d1930, 0.7);
const crownMat = std(0xf2c84a, 0.25, 0.9, { emissive: 0xb07a10, emissiveIntensity: 0.7 });
const labelMat = (map) => patch(new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: true }), { cell: true });
const shadowMat = new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 4, 32, 32, 32); r.addColorStop(0, 'rgba(0,0,0,.62)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false });

function bodyGeo(kind) {
  if (kind === 'tile') { const g = new THREE.BoxGeometry(0.84, 0.84, 0.13); g.translate(0, 0.74, 0); return g; }
  if (kind === 'die') {
    const g = new THREE.BoxGeometry(0.7, 0.7, 0.7), uv = g.attributes.uv, cellOf = [2, 3, 4, 1, 0, 5];   // +x −x +y −y +z −z → pips 3,4,5,2,1(hidden by number),6
    for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v, c = cellOf[f]; uv.setXY(i, ((c % 3) + uv.getX(i)) / 3, 1 - ((c / 3 | 0) + 1 - uv.getY(i)) / 2); }
    g.translate(0, 0.67, 0); return g;
  }
  if (kind === 'ball') { const g = new THREE.SphereGeometry(0.44, 24, 16); g.translate(0, 0.74, 0); return g; }
  if (kind === 'cyl') { const g = lathe([[0, 0.32], [0.28, 0.32], [0.3, 0.34], [0.3, 1.14], [0.28, 1.16], [0, 1.16]], 22); return g; }
  if (kind === 'tunic') return lathe([[0, 0.2], [0.31, 0.2], [0.33, 0.25], [0.27, 0.72], [0.3, 0.98], [0.2, 1.08], [0, 1.1]], 18);
  return lathe([[0, 0.08], [0.46, 0.08], [0.45, 0.13], [0.25, 0.62], [0.27, 0.84], [0.19, 0.93], [0, 0.95]], 20);
}
const headGeo = new THREE.SphereGeometry(0.21, 20, 14); headGeo.rotateY(-PI / 2);
const hatGeo = (() => { const b = new THREE.CylinderGeometry(0.2, 0.2, 0.025, 16), c = new THREE.CylinderGeometry(0.125, 0.135, 0.18, 16); c.translate(0, 0.1, 0); return mergeGeometries([b, c]); })();
const bowGeo = (() => { const l = new THREE.ConeGeometry(0.095, 0.17, 8); l.rotateZ(-PI / 2); l.translate(-0.09, 0, 0); const r = new THREE.ConeGeometry(0.095, 0.17, 8); r.rotateZ(PI / 2); r.translate(0.09, 0, 0); const k = new THREE.SphereGeometry(0.05, 8, 6); return mergeGeometries([l, r, k]); })();
const crownGeo = (() => { const parts = [new THREE.CylinderGeometry(0.16, 0.14, 0.09, 12, 1, true)]; for (let i = 0; i < 6; i++) { const s = new THREE.ConeGeometry(0.04, 0.11, 4); s.translate(Math.sin(i / 6 * TAU) * 0.15, 0.09, Math.cos(i / 6 * TAU) * 0.15); parts.push(s); } return mergeGeometries(parts); })();
const armGeo = (() => { const a = new THREE.CylinderGeometry(0.05, 0.042, 0.4, 8); a.translate(0, -0.2, 0); const h = new THREE.SphereGeometry(0.066, 10, 8); h.translate(0, -0.44, 0); return mergeGeometries([a, h]); })();
const legGeo = (() => { const a = new THREE.CylinderGeometry(0.05, 0.05, LEG, 8); a.translate(0, -LEG / 2, 0); const s = new THREE.BoxGeometry(0.12, 0.07, 0.21); s.translate(0, -LEG + 0.035, 0.05); return mergeGeometries([a, s]); })();
const quadGeo = new THREE.PlaneGeometry(1, 1, 6, 1);
const flatGeo = new THREE.PlaneGeometry(1, 1); flatGeo.rotateX(-PI / 2);

const NA = 1000, A = [], byN = [];
const FAM = { perfect: [], cube: [], pyr: [], square: [], prime: [], round: [] };
const inst = (geo, mat, n, order = 0) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.renderOrder = order; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };
const troupe = {};
{
  const counts = {};
  for (let n = 1; n <= NA; n++) {
    const h = homeOf(n), kind = dressOf(n), fam = familyOf(n);
    const a = { n, kind, K: KIND[kind], g: h.g, row: h.row, r: h.r, a: h.a, dir: h.row & 1 ? 1 : -1, hx: Math.sin(h.a) * h.r, hz: Math.cos(h.a) * h.r, hyaw: h.a + PI,
      male: n & 1, crown: PERFECT.has(n), fam, fi: fam ? FAM[fam].length : 0, seed: frand(n), bi: counts[kind] = (counts[kind] || 0),
      x: 0, y: 0, z: 0, yaw: 0, v: 0, walk: frand(n + 2) * 6, armL: 0.1, armR: 0.1, swL: 0, swR: 0, lean: 0, face: -1, hidden: false, lit: false, scale: 0.94 + frand(n + 4) * 0.12 };
    counts[kind]++; if (fam) FAM[fam].push(a);
    a.x = a.hx; a.z = a.hz; a.yaw = a.hyaw;
    A.push(a); byN[n] = a;
  }
  for (const kind in counts) troupe[kind] = inst(bodyGeo(kind), kind === 'die' ? dieMat : bodyMat, counts[kind]);
  troupe.head = inst(headGeo, headMat, NA);
  const nMale = A.filter(a => a.male).length, nCrown = A.filter(a => a.crown).length;
  troupe.hat = inst(hatGeo, limbMat, nMale); troupe.bow = inst(bowGeo, limbMat, NA - nMale - nCrown); troupe.crown = inst(crownGeo, crownMat, nCrown);
  troupe.arm = inst(armGeo, limbMat, NA * 2); troupe.leg = inst(legGeo, legMat, NA * 2);
  troupe.labHi = inst(quadGeo, labelMat(atlasHi), HI_MAX, 3); troupe.labLo = inst(quadGeo, labelMat(atlasLo), NA - HI_MAX, 3);
  troupe.shadow = inst(flatGeo, shadowMat, NA, 1);
  const faces = new Float32Array(NA * 2), uvHi = new Float32Array(HI_MAX * 4), uvLo = new Float32Array((NA - HI_MAX) * 4), bHi = new Float32Array(HI_MAX), bLo = new Float32Array(NA - HI_MAX);
  let iHat = 0, iBow = 0, iCrown = 0; const c = new THREE.Color(), cream = col('#fff2d2'), ink = col('#1c1830');
  for (const a of A) {
    const n = a.n, base = isPow10(n) ? col(WHITE) : (n === 13 || n === 666) ? col(BLACK) : col(RAINBOW[a.g]).offsetHSL((frand(n + 1) - 0.5) * 0.03, 0, (frand(n + 6) - 0.5) * 0.08);
    a.color = base;
    troupe[a.kind].setColorAt(a.bi, base);
    troupe.head.setColorAt(n - 1, c.set('#e6c8b0').lerp(base, 0.08));
    faces[(n - 1) * 2 + 1] = a.male ? 1 : 0;
    if (a.crown) a.top = [troupe.crown, iCrown++]; else if (a.male) { a.top = [troupe.hat, iHat++]; troupe.hat.setColorAt(a.top[1], c.copy(base).multiplyScalar(0.34)); } else { a.top = [troupe.bow, iBow++]; troupe.bow.setColorAt(a.top[1], c.copy(base).lerp(col('#ffffff'), 0.25)); }
    for (const k of [0, 1]) troupe.arm.setColorAt((n - 1) * 2 + k, c.copy(base).multiplyScalar(0.8));
    const light = isPow10(n);
    a.inkColor = light ? ink : cream;
    if (n <= HI_MAX) { a.lab = [troupe.labHi, n - 1]; uvHi.set(cellRect(n - 1, HI_C), (n - 1) * 4); bHi[n - 1] = a.K.lab[4] ? a.K.lab[2] ** 2 / (2 * a.K.lab[4]) : 0; }
    else { const i = n - HI_MAX - 1; a.lab = [troupe.labLo, i]; uvLo.set(cellRect(i, LO_C), i * 4); bLo[i] = a.K.lab[4] ? a.K.lab[2] ** 2 / (2 * a.K.lab[4]) : 0; }
    a.lab[0].setColorAt(a.lab[1], a.inkColor);
  }
  troupe.faceAttr = new THREE.InstancedBufferAttribute(faces, 2); troupe.faceAttr.setUsage(THREE.DynamicDrawUsage);
  troupe.head.geometry.setAttribute('aFace', troupe.faceAttr);
  const gHi = quadGeo.clone(), gLo = quadGeo.clone();
  gHi.setAttribute('aUvR', new THREE.InstancedBufferAttribute(uvHi, 4)); gHi.setAttribute('aBend', new THREE.InstancedBufferAttribute(bHi, 1));
  gLo.setAttribute('aUvR', new THREE.InstancedBufferAttribute(uvLo, 4)); gLo.setAttribute('aBend', new THREE.InstancedBufferAttribute(bLo, 1));
  troupe.labHi.geometry = gHi; troupe.labLo.geometry = gLo;
}
const PRIME_M = Math.ceil(FAM.prime.length / 2);

// Point s (0..1) on a regular k-gon of circumradius R turned by rot.
function polyPath(k, R, rot, s, out) {
  s = ((s % 1) + 1) % 1 * k; const i = Math.floor(s), f = s - i, a0 = rot + i * TAU / k, a1 = a0 + TAU / k;
  out.x = lerp(Math.sin(a0), Math.sin(a1), f) * R; out.z = lerp(Math.cos(a0), Math.cos(a1), f) * R;
}

// ── what each figure is trying to do this instant ───────────────────────────
const o = { x: 0, z: 0, y: 0, yaw: 0, armL: 0, armR: 0, swL: 0, swR: 0, lean: 0, roll: 0, face: 0, tumble: 0, spd: 3.4, direct: false, turn: true, sym: 0, fade: 1, headYaw: 0 };
const PROF = new THREE.Vector3(0, 0, 0), PI_POS = new THREE.Vector3(1.55, 0, -0.45);
function aim(a, S, T) {
  const n = a.n, sd = a.seed;
  o.x = a.hx; o.z = a.hz; o.y = 0; o.yaw = a.hyaw; o.armL = o.armR = 0.13 + 0.05 * Math.sin(T * 1.1 + sd * 9); o.swL = o.swR = 0;
  o.lean = 0; o.roll = Math.sin(T * 0.9 + sd * 20) * 0.03; o.tumble = 0; o.spd = 3.6; o.direct = false; o.turn = true; o.sym = 0; o.fade = 1; o.headYaw = 0;
  const bl = T * 0.31 + sd * 17; o.face = (bl % 1 < 0.035 && frand(n + Math.floor(bl)) > 0.4) ? F_BLINK : F_NEUTRAL;

  if (S.dance > 0.02) {
    const du = S.du, beat = du * 2.8, on = S.dance > 0.5, fam = a.fam;
    o.spd = 5.2;
    o.y = 0.1 * Math.abs(Math.sin(beat * PI / 3 + sd * 3)) * S.dance;
    if (S.sing) o.face = (Math.floor(du * 5.6 + sd * 2) & 1) ? F_SING : F_TALK;
    if (!on) { /* walking home or setting out */ }
    else if (n === 137 && S.sneak > 0) { const s = S.sneak; o.x = Math.sin(0.6) * lerp(14, 6.2, s); o.z = Math.cos(0.6) * lerp(14, 6.2, s); o.armL = o.armR = 0.5; }
    else if (fam === 'perfect') { const s = a.fi / 3 * TAU + du * 0.3; o.x = Math.sin(s) * 3.15; o.z = Math.cos(s) * 3.15; o.armL = o.armR = 1.35; o.turn = false; o.yaw = s + PI + du * 1.4; }
    else if (fam === 'cube') { const s = a.fi / FAM.cube.length * TAU - du * 0.34; o.x = Math.sin(s) * 4.5; o.z = Math.cos(s) * 4.5; const hop = (beat / 3 + a.fi * 0.5) % 1; o.y = Math.sin(hop * PI) * 0.55; o.tumble = -Math.floor(beat / 3 + a.fi * 0.5) * PI / 2 - ease(hop) * PI / 2; o.armL = o.armR = 1.0; }
    else if (fam === 'pyr') { polyPath(3, 7.5, du * 0.05, a.fi / FAM.pyr.length + du * 0.04, o); o.armL = 2.6; o.armR = 2.6; }
    else if (fam === 'square') { polyPath(4, 7.4, PI / 4 - du * 0.03, a.fi / FAM.square.length - du * 0.034, o); o.armL = 0.1 + 0.9 * (Math.floor(beat / 3) & 1); o.armR = 1.0 - o.armL + 0.1; }
    else if (fam === 'prime') { const i = a.fi >> 1, D = TAU / PRIME_M, w = 0.5 / 14.3, A1 = !(a.fi & 1);
      const th = A1 ? i * D + w * du : i * D + D / 2 - w * du, rr = 14.3 + (A1 ? 0.62 : -0.62) * Math.sin(PRIME_M * th);
      o.x = Math.sin(th) * rr; o.z = Math.cos(th) * rr; o.armL = o.armR = 0.55 + 0.25 * Math.sin(beat * PI / 3); }
    else if (fam === 'round') { const th = a.fi / FAM.round.length * TAU + du * 1.4 / 32.7; o.x = Math.sin(th) * 32.7; o.z = Math.cos(th) * 32.7; o.y = Math.abs(Math.sin(du * 2.932 + a.fi * 0.9)) * 0.7; o.armL = o.armR = 2.2; }
    else { const ang = a.a + a.dir * S.dance * (4.0 / a.r) * Math.sin(du * 0.5236); o.x = Math.sin(ang) * a.r; o.z = Math.cos(ang) * a.r; o.turn = false; o.yaw = ang + PI + Math.sin(du * 0.5236 + 1.57) * a.dir * 0.5;
      const sw = Math.sin(beat * PI / 3 + a.row * PI); o.armL = 1.5 + sw * 0.9; o.armR = 1.5 - sw * 0.9; o.roll = sw * 0.12; }
  }

  // someone has the floor
  if (S.speaker) {
    if (n === S.speaker) {
      const f = S.fwd, r = a.r - (a.g === 0 ? 1.25 : 1.6) * f;
      o.x = Math.sin(a.a) * r; o.z = Math.cos(a.a) * r;
      if (S.talk) { o.face = (Math.floor(T * 7.5) & 1) ? F_TALK : (S.angrySpeaker ? F_ANGRY : F_NEUTRAL); const gsl = Math.sin(T * 2.7), g2 = Math.sin(T * 4.1 + 1);
        o.armR = 1.25 + 0.55 * gsl; o.armL = 0.5 + 0.35 * g2; o.swR = -0.5 - 0.3 * g2; o.y = Math.abs(Math.sin(T * 5.2)) * 0.035; o.lean = 0.06 * gsl; }
    } else if (a.g < 2 && S.look) { o.yaw = Math.atan2(S.look.x - a.x, S.look.z - a.z); if (a.g === 1) o.yaw = a.hyaw + angDiff(a.hyaw, o.yaw) * 0.5; }
    if (S.cross && S.cross.includes(n)) { o.face = F_ANGRY; o.y = Math.abs(Math.sin(T * 9 + n)) * 0.07; o.armL = o.armR = 0.9 + 0.3 * Math.sin(T * 13 + n); }
  }
  if (S.pair) {   // a gentleman and his lady, by way of example
    if (n === S.pair[0]) { o.yaw = a.hyaw - 0.75 * S.pairK; o.lean = 0.5 * S.pairK * (0.6 + 0.4 * Math.sin(T * 2.2)); o.armR = 0.9 * S.pairK; o.swR = -0.9 * S.pairK; }
    if (n === S.pair[1]) { o.yaw = a.hyaw + 0.75 * S.pairK; o.y = -0.07 * S.pairK * (0.6 + 0.4 * Math.sin(T * 2.2)); o.armL = o.armR = 0.85 * S.pairK; }
  }
  if (S.love > 0) {   // every Odd and its attendant Even
    const p = byN[a.male ? Math.min(n + 1, NA) : n - 1]; if (p && p !== a) { const want = Math.atan2(p.hx - a.hx, p.hz - a.hz); o.yaw = a.hyaw + angDiff(a.hyaw, want) * S.love; o.lean = 0.12 * S.love; if (a.male) { o.armR = 0.8 * S.love; o.swR = -0.7 * S.love; } else o.roll += 0.1 * S.love * Math.sin(T * 2 + sd * 6); }
  }
  if (S.outcry > 0) {
    const k = S.outcry; o.y = Math.abs(Math.sin(T * 8 + sd * 40)) * 0.3 * k; o.armL = lerp(o.armL, 2.5 + 0.5 * Math.sin(T * 11 + sd * 9), k); o.armR = lerp(o.armR, 2.5 + 0.5 * Math.sin(T * 12 + sd * 5), k);
    if (k > 0.3) o.face = (Math.floor(T * 8 + sd * 4) & 1) ? F_ANGRY : F_TALK;
    if (n >= 11 && n <= 13) { const r = a.r - 1.5 * k; o.x = Math.sin(a.a) * r; o.z = Math.cos(a.a) * r; }
  }
  if (S.bow > 0 && a.r < S.bowR) { o.lean = 0.85 * S.bow; o.armL = o.armR = 0.1; o.y = 0; o.face = F_SCARED; o.roll = 0; }
  else if (S.pale > 0.35 && !S.speaker) o.face = F_SCARED;
  if (S.fume && n <= 3) { o.face = F_ANGRY; o.lean = -0.14; o.armL = o.armR = 1.0 + 0.4 * Math.sin(T * 12 + n * 2); o.y = Math.abs(Math.sin(T * 7 + n)) * 0.06; o.yaw = Math.atan2(S.fume.x - a.x, S.fume.z - a.z); }
  if (S.angry > 0 && S.swarm < 0) { o.face = F_ANGRY; o.lean = 0.2 * S.angry; o.armR = lerp(o.armR, 2.0 + 0.3 * Math.sin(T * 9 + sd * 7), S.angry); o.swR = -0.6 * S.angry; if (a.g < 2) o.yaw = Math.atan2(S.rebelAt.x - a.x, S.rebelAt.z - a.z); }

  if (n === 137 && S.rebel) {
    o.x = S.rebel.x; o.z = S.rebel.z; o.spd = S.rebel.spd; o.lean = 0; o.roll = 0; o.y = 0; o.armL = o.armR = 0.15;
    o.face = S.rebel.talk ? ((Math.floor(T * 7.5) & 1) ? F_TALK : F_NEUTRAL) : S.rebel.push ? F_ANGRY : F_NEUTRAL;
    if (S.rebel.push) { o.armL = o.armR = 1.1; o.swL = o.swR = -0.9; o.lean = 0.22; }
    if (S.rebel.talk) { const g1 = Math.sin(T * 3.1), fist = S.rebel.fist; o.armR = fist ? 2.7 + 0.2 * g1 : 1.1 + 0.5 * g1; o.armL = 0.5 + 0.3 * Math.sin(T * 2.3); o.swL = -0.4; o.y = Math.abs(Math.sin(T * 5)) * 0.04; }
    if (S.rebel.face) { o.turn = a.v > 1.2; o.yaw = Math.atan2(S.rebel.face.x - a.x, S.rebel.face.z - a.z); }
  }

  if (S.swarm >= 0 && n === 137) { o.face = F_SCARED; o.armL = o.armR = 2.4; if (S.blow >= 0) { o.sym = sstep(0.1, 0.5, S.blow); o.fade = 1 - sstep(1.6, 4.0, S.blow); o.direct = true; o.x = REBEL_SPOT.x; o.z = REBEL_SPOT.z; o.y = S.blow * 0.5; } }
  else if (S.swarm >= 0) {   // the whole host hurls itself at the Professor
    const t = S.swarm, k = ease((t - a.r * 0.03 - sd * 0.5) / 2.4), rb = 2.9 + frand(n + 3) * 3.3;
    const ang = a.a + k * (2.5 + sd * 2) + k * t * (1.5 + frand(n + 5) * 2.4), rr = lerp(a.r, rb, k);
    o.x = lerp(a.hx, PROF.x + Math.sin(ang) * rr, Math.min(1, k * 4 + (k > 0 ? 0.05 : 0))); o.z = lerp(a.hz, PROF.z + Math.cos(ang) * rr, Math.min(1, k * 4 + (k > 0 ? 0.05 : 0)));
    o.x = PROF.x * k + Math.sin(ang) * rr; o.z = PROF.z * k + Math.cos(ang) * rr;
    o.y = k * (0.3 + frand(n + 9) * 3.1) + k * Math.sin(T * 9 + sd * 40) * 0.25;
    o.yaw = Math.atan2(PROF.x - o.x, PROF.z - o.z); o.lean = k * 0.75; o.swL = o.swR = -1.35 * k; o.armL = o.armR = 0.35; o.face = F_ANGRY; o.direct = k > 0; o.tumble = a.kind === 'die' ? t * 5 * k : 0;
    if (S.blow >= 0) {
      const tb = S.blow, dx = o.x - PROF.x, dz = o.z - PROF.z, dy = o.y - 1.0, dl = Math.hypot(dx, dy, dz) || 1, dist = (1 - Math.exp(-tb * 1.5)) * (4 + frand(n + 13) * 15);
      o.x += dx / dl * dist; o.z += dz / dl * dist; o.y = Math.max(0.2, o.y + dy / dl * dist * 0.6 + tb * 0.5);
      o.sym = sstep(0, 0.3, tb - frand(n + 11) * 0.25); o.fade = 1 - sstep(1.4, 4.0, tb + frand(n + 15)); o.direct = true;
    }
  }
}

// ── move, pose and write every figure into the instance buffers ─────────────
const _b = new THREE.Matrix4(), _l = new THREE.Matrix4(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
function put(mesh, idx, px, py, pz, rx, ry, rz, sx = 1, sy = 1, sz = 1) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _l.compose(_p.set(px, py, pz), _q, _s.set(sx, sy, sz));
  _m.multiplyMatrices(_b, _l); _m.toArray(mesh.instanceMatrix.array, idx * 16);
}
const zero = (mesh, idx) => ZERO.toArray(mesh.instanceMatrix.array, idx * 16);
let facesDirty = false, colorsDirty = false;
const HDR_CHALK = new THREE.Color(1.1, 1.1, 1.2);
function updateActors(dt, S, T, snap) {
  const faces = troupe.faceAttr.array, kS = Math.min(1, dt * 12), kL = Math.min(1, dt * 7), kY = Math.min(1, dt * 9);
  const shadowArr = troupe.shadow.instanceMatrix.array;
  for (let i = 0; i < NA; i++) {
    const a = A[i], K = a.K, n = a.n;
    const grow = S.gone ? 0 : easeOutBack(clamp((S.reveal - a.r) / 2.2));
    if (grow <= 0.001) {
      if (!a.hidden) { a.hidden = true; zero(troupe[a.kind], a.bi); zero(troupe.head, i); zero(a.top[0], a.top[1]); zero(troupe.arm, i * 2); zero(troupe.arm, i * 2 + 1); zero(troupe.leg, i * 2); zero(troupe.leg, i * 2 + 1); zero(a.lab[0], a.lab[1]); zero(troupe.shadow, i); a.x = a.hx; a.z = a.hz; a.yaw = a.hyaw; a.y = 0; }
      continue;
    }
    a.hidden = false;
    aim(a, S, T);
    if (snap || o.direct) { a.v = snap ? 0 : 6; a.x = o.x; a.z = o.z; a.yaw = o.yaw; a.lean = o.lean; a.armL = o.armL; a.armR = o.armR; a.swL = o.swL; a.swR = o.swR; }
    else {
      const dx = o.x - a.x, dz = o.z - a.z, d = Math.hypot(dx, dz);
      if (d > 1e-4) { const step = Math.min(d, Math.min(d * 6, o.spd) * dt); a.x += dx / d * step; a.z += dz / d * step; a.v = lerp(a.v, step / Math.max(dt, 1e-3), 0.3); } else a.v *= 0.7;
      const yawT = (o.turn && a.v > 0.7 && d > 0.25) ? Math.atan2(dx, dz) : o.yaw;
      a.yaw += angDiff(a.yaw, yawT) * kY;
      a.lean += (o.lean - a.lean) * kL; a.armL += (o.armL - a.armL) * kS; a.armR += (o.armR - a.armR) * kS; a.swL += (o.swL - a.swL) * kS; a.swR += (o.swR - a.swR) * kS;
    }
    a.y = o.y;
    a.walk += a.v * dt * 4.2;
    const wk = Math.min(1, a.v / 1.6), stride = Math.sin(a.walk) * 0.7 * wk, sym = o.sym, s = a.scale * grow * (1 - sym);
    if (o.face !== a.face) { a.face = o.face; faces[i * 2] = o.face; facesDirty = true; }
    _e.set(a.lean, a.yaw, o.roll, 'YXZ'); _q.setFromEuler(_e); _b.compose(_p.set(a.x, a.y + Math.abs(Math.cos(a.walk)) * 0.04 * wk, a.z), _q, _s.set(s, s * (0.6 + 0.4 * Math.min(1, grow)), s));
    if (sym >= 0.999) { zero(troupe[a.kind], a.bi); zero(troupe.head, i); zero(a.top[0], a.top[1]); zero(troupe.arm, i * 2); zero(troupe.arm, i * 2 + 1); zero(troupe.leg, i * 2); zero(troupe.leg, i * 2 + 1); }
    else {
      const tum = o.tumble;
      if (tum) put(troupe[a.kind], a.bi, 0, K.c * (1 - Math.cos(tum)), -K.c * Math.sin(tum), tum, 0, 0); else put(troupe[a.kind], a.bi, 0, 0, 0, 0, 0, 0);
      put(troupe.head, i, 0, K.head, 0, 0, o.headYaw, 0);
      put(a.top[0], a.top[1], 0, K.head + (a.crown ? 0.17 : a.male ? 0.185 : 0.2), a.male ? -0.02 : 0, a.male ? -0.12 : 0, 0, a.male ? 0 : 0.25);
      put(troupe.arm, i * 2, K.sh[0], K.sh[1], 0, a.swR + stride * 0.6, 0, a.armR);
      put(troupe.arm, i * 2 + 1, -K.sh[0], K.sh[1], 0, a.swL - stride * 0.6, 0, -a.armL);
      put(troupe.leg, i * 2, K.legX, LEG, 0, -stride, 0, 0);
      put(troupe.leg, i * 2 + 1, -K.legX, LEG, 0, stride, 0, 0);
    }
    // the name on the uniform — and, at the very end, all that is left
    const L = K.lab, lm = a.lab[0], li = a.lab[1];
    if (sym > 0) {
      if (!a.lit) { a.lit = true; lm.setColorAt(li, HDR_CHALK); colorsDirty = true; }
      const gs = (0.5 + 0.7 * sym) * o.fade * grow;
      _m.compose(_p.set(a.x, a.y + 0.8, a.z), camera.quaternion, _s.set(gs * 1.25, gs, 1)); _m.toArray(lm.instanceMatrix.array, li * 16);
    } else {
      if (a.lit) { a.lit = false; lm.setColorAt(li, a.inkColor); colorsDirty = true; }
      const tum = o.tumble;
      if (tum) { _e.set(tum, 0, 0); _q.setFromEuler(_e); _l.compose(_p.set(0, K.c + (L[0] - K.c) * Math.cos(tum) - L[1] * Math.sin(tum), (L[0] - K.c) * Math.sin(tum) + L[1] * Math.cos(tum) + 0.004), _q, _s.set(L[2], L[3], 1)); _m.multiplyMatrices(_b, _l); _m.toArray(lm.instanceMatrix.array, li * 16); }
      else put(lm, li, 0, L[0], L[1] + 0.006, a.kind === 'tunic' ? -0.07 : a.kind === 'skirt' ? 0.05 : 0, 0, 0, L[2], L[3], 1);
    }
    const j = i * 16, ss = sym >= 0.999 ? 0 : 1.15 * s / (1 + a.y * 0.9);
    shadowArr[j] = ss; shadowArr[j + 5] = 1; shadowArr[j + 10] = ss; shadowArr[j + 15] = 1; shadowArr[j + 12] = a.x; shadowArr[j + 13] = 0.02; shadowArr[j + 14] = a.z;
    shadowArr[j + 1] = shadowArr[j + 2] = shadowArr[j + 3] = shadowArr[j + 4] = shadowArr[j + 6] = shadowArr[j + 7] = shadowArr[j + 8] = shadowArr[j + 9] = shadowArr[j + 11] = 0;
  }
  for (const k in troupe) if (troupe[k].isInstancedMesh) troupe[k].instanceMatrix.needsUpdate = true;
  if (facesDirty) { troupe.faceAttr.needsUpdate = true; facesDirty = false; }
  if (colorsDirty) { troupe.labHi.instanceColor.needsUpdate = true; troupe.labLo.instanceColor.needsUpdate = true; colorsDirty = false; }
  G.uFlat.value = S.blow >= 0 ? 0 : 1;
}
const actorPos = (n, y = 0) => new THREE.Vector3(byN[n].x, y, byN[n].z);
