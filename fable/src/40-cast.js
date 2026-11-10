// ── Pi, Master of Ceremonies ────────────────────────────────────────────────
const pi = Grp(scene, PI_POS.x, 0, PI_POS.z);
const piJ = {};
{
  const robe = std(0x0e0b26, 0.62, 0.05), velvet = std(0x1a1040, 0.7), gold = std(0xe8c060, 0.3, 0.85, { emissive: 0x7a5510, emissiveIntensity: 0.9 });
  piJ.body = Grp(pi);
  M(lathe([[0, 0], [1.0, 0], [0.98, 0.07], [0.7, 0.9], [0.5, 1.8], [0.43, 2.4], [0.52, 2.58], [0.3, 2.74], [0, 2.78]], 32), robe, piJ.body);
  M(new THREE.TorusGeometry(0.985, 0.03, 8, 48), gold, piJ.body, 0, 0.06, 0).rotation.x = PI / 2;
  M(lathe([[0.66, 2.12], [0.6, 2.42], [0.42, 2.7], [0.2, 2.8], [0, 2.8]], 28), velvet, piJ.body);
  M(new THREE.TorusGeometry(0.655, 0.022, 8, 40), gold, piJ.body, 0, 2.13, 0).rotation.x = PI / 2;
  const emblem = M(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: canvasTex(256, 256, (g) => { g.fillStyle = '#ffd772'; g.font = 'bold 230px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('π', 128, 118); }) }), piJ.body, 0, 1.6, 0.575);
  emblem.rotation.x = -0.2; emblem.material.color.setRGB(1.5, 1.2, 0.6);
  piJ.head = Grp(piJ.body, 0, 3.02, 0);
  const hood = M(new THREE.SphereGeometry(0.37, 24, 18), velvet, piJ.head, 0, 0.02, -0.1); hood.scale.set(1, 1.18, 1.0);
  const cowl = M(new THREE.TorusGeometry(0.3, 0.07, 10, 32), velvet, piJ.head, 0, 0.0, 0.2); cowl.scale.set(0.95, 1.22, 0.9);
  const mask = M(new THREE.SphereGeometry(0.3, 28, 20), std(0x6e6552, 0.45, 0.3), piJ.head, 0, -0.02, 0.26); mask.scale.set(0.8, 1.08, 0.55);
  M(new THREE.BoxGeometry(0.018, 0.2, 0.02), std(0xb9a880, 0.3, 0.6), piJ.head, 0, -0.08, 0.418);
  piJ.eyeMat = glow(1.0, 1.4, 2.0);
  piJ.eyes = []; piJ.brows = [];
  for (const s of [-1, 1]) {
    const e = M(new THREE.SphereGeometry(1, 12, 8), piJ.eyeMat, piJ.head, s * 0.098, 0.035, 0.408); e.scale.set(0.066, 0.02, 0.02); e.rotation.z = -s * 0.2; piJ.eyes.push(e);
    const br = M(new THREE.BoxGeometry(0.13, 0.022, 0.03), std(0x2a2038, 0.5), piJ.head, s * 0.1, 0.105, 0.4); br.userData.s = s; piJ.brows.push(br);
  }
  // arms: shoulder → elbow → gloved hand; the right hand holds the conductor's baton
  for (const s of [-1, 1]) {
    const sh = Grp(piJ.body, s * 0.5, 2.5, 0.02);
    const up = M(new THREE.CylinderGeometry(0.11, 0.15, 0.6, 12), robe, sh, 0, -0.3, 0);
    const el = Grp(sh, 0, -0.6, 0);
    M(new THREE.CylinderGeometry(0.15, 0.21, 0.55, 12), robe, el, 0, -0.27, 0);
    M(new THREE.SphereGeometry(0.095, 12, 10), std(0xf2efe6, 0.5), el, 0, -0.6, 0);
    piJ[s > 0 ? 'R' : 'L'] = { sh, el };
    if (s > 0) {
      piJ.baton = Grp(el, 0, -0.62, 0);
      M(new THREE.CylinderGeometry(0.008, 0.016, 0.95, 8), glow(1.6, 1.55, 1.4), piJ.baton, 0, -0.42, 0);
      piJ.tip = M(new THREE.SphereGeometry(0.03, 10, 8), glow(4, 3.6, 2.4), piJ.baton, 0, -0.9, 0);
    }
  }
}
// The digits of pi climb out of him in a helix and never stop.
const HELIX_N = 230;
const helix = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), patch(new THREE.MeshBasicMaterial({ map: canvasTex(704, 64, (g) => { g.fillStyle = '#fff'; g.font = 'bold 52px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < 10; i++) g.fillText(String(i), i * 64 + 32, 35); g.fillText('.', 672, 30); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }), { cell: true }), HELIX_N);
{
  helix.geometry.setAttribute('aUvR', new THREE.InstancedBufferAttribute(new Float32Array(HELIX_N * 4), 4));
  helix.geometry.setAttribute('aBend', new THREE.InstancedBufferAttribute(new Float32Array(HELIX_N), 1));
  helix.frustumCulled = false; helix.renderOrder = 4; helix.material.color.setRGB(1.9, 1.45, 0.6); scene.add(helix);
}
let helixK = -1;
const PI_STREAM = '3.' + PI_DIGITS.slice(1);
function updateHelix(tSince, vis) {
  helix.visible = vis > 0.01 && tSince > 0;
  if (!helix.visible) return;
  const u = tSince * 1.5, K = Math.floor(u), fr = u - K, uv = helix.geometry.attributes.aUvR, arr = helix.instanceMatrix.array;
  if (K !== helixK) {
    helixK = K;
    for (let j = 0; j < HELIX_N; j++) { const d = K - j; const ch = d >= 0 ? PI_STREAM[d % PI_STREAM.length] : null; const cell = ch === '.' ? 10 : +ch; uv.setXYZW(j, ch === null ? 0 : cell / 11, 0, ch === null ? 0 : 1 / 11, 1); }
    uv.needsUpdate = true;
  }
  for (let j = 0; j < HELIX_N; j++) {
    const f = j + fr, y = 3.55 + f * 0.1, ang = -f * 0.42, r = 0.5 + (y - 3.55) * 0.1;
    const sc = (K - j < 0 ? 0 : 1) * vis * sstep(0, 3, f) * (1 - sstep(HELIX_N - 60, HELIX_N - 2, f)) * (0.2 + (y - 3.55) * 0.016);
    _e.set(0, ang, 0); _q.setFromEuler(_e);
    _m.compose(_p.set(PI_POS.x + Math.sin(ang) * r, y, PI_POS.z + Math.cos(ang) * r), _q, _s.set(sc, sc * 1.25, 1)); _m.toArray(arr, j * 16);
  }
  helix.instanceMatrix.needsUpdate = true;
}
// pose: {armR:[swing, raise, elbow], armL:[…], baton, headYaw, headPitch, frown, eyes, yaw, lift}
const piPose = { rs: 0, rr: 0.15, re: -0.2, ls: 0, lr: 0.15, le: -0.2, bt: 0.3, hy: 0, hp: 0, frown: 0, eyes: 1, yaw: 0.25, vis: 0, lean: 0 };
function applyPi(t, dt, snap) {
  const k = snap ? 1 : Math.min(1, dt * 7);
  for (const key in t) piPose[key] += (t[key] - piPose[key]) * k;
  const p = piPose;
  pi.visible = p.vis > 0.01; pi.scale.setScalar(Math.max(0.001, p.vis)); pi.rotation.y = p.yaw; piJ.body.rotation.x = p.lean;
  piJ.R.sh.rotation.set(p.rs, 0, p.rr); piJ.R.el.rotation.x = p.re; piJ.L.sh.rotation.set(p.ls, 0, -p.lr); piJ.L.el.rotation.x = p.le;
  piJ.baton.rotation.x = p.bt; piJ.head.rotation.set(p.hp, p.hy, 0);
  for (const b of piJ.brows) { b.rotation.z = -b.userData.s * (0.1 + p.frown * 0.5); b.position.y = 0.105 - p.frown * 0.028; }
  for (const e of piJ.eyes) e.scale.y = 0.02 * (1 - p.frown * 0.45);
  piJ.eyeMat.color.setRGB(1.0 * p.eyes + p.frown * 1.5, 1.4 * p.eyes * (1 - p.frown * 0.6), 2.0 * p.eyes * (1 - p.frown * 0.75));
}

// ── Professor Squarepunt ────────────────────────────────────────────────────
const prof = Grp(scene);
const pJ = {};
{
  const gownC = 0x2c6a56, gown = std(gownC, 0.75), trim = std(0x6d1f2a, 0.6), skin = std(0xe9c3a4, 0.6), hair = std(0xb9b7b2, 0.9), dark = std(0x1a1622, 0.5);
  pJ.body = Grp(prof);
  M(lathe([[0, 0], [0.36, 0], [0.34, 0.05], [0.27, 0.6], [0.24, 0.95], [0.27, 1.2], [0.23, 1.36], [0.1, 1.43], [0, 1.44]], 24), gown, pJ.body);
  M(new THREE.TorusGeometry(0.247, 0.028, 8, 24), trim, pJ.body, 0, 0.96, 0).rotation.x = PI / 2;
  M(new THREE.TorusGeometry(0.345, 0.02, 8, 28), trim, pJ.body, 0, 0.05, 0).rotation.x = PI / 2;
  for (const s of [-1, 1]) { const lp = M(new THREE.BoxGeometry(0.07, 0.44, 0.02), trim, pJ.body, s * 0.07, 1.2, 0.235); lp.rotation.set(-0.12, 0, s * 0.3); }
  pJ.lap = Grp(pJ.body, 0, 0.92, 0);   // only shown seated
  M(new THREE.BoxGeometry(0.5, 0.2, 0.52), gown, pJ.lap, 0, -0.02, 0.3);
  M(new THREE.BoxGeometry(0.46, 0.5, 0.2), gown, pJ.lap, 0, -0.3, 0.5);
  for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.11, 0.07, 0.24), trim, pJ.lap, s * 0.11, -0.55, 0.62);
  pJ.feet = Grp(pJ.body); for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.11, 0.07, 0.24), trim, pJ.feet, s * 0.11, 0.035, 0.12);
  pJ.head = Grp(pJ.body, 0, 1.58, 0);
  M(new THREE.SphereGeometry(0.17, 24, 18), skin, pJ.head);
  M(new THREE.SphereGeometry(0.034, 10, 8), skin, pJ.head, 0, -0.025, 0.172);
  for (const s of [-1, 1]) {
    M(new THREE.SphereGeometry(0.085, 10, 8), hair, pJ.head, s * 0.155, 0.03, -0.03).scale.set(0.9, 1.1, 1.1);
    M(new THREE.SphereGeometry(0.06, 10, 8), hair, pJ.head, s * 0.11, 0.1, -0.11);
    M(new THREE.TorusGeometry(0.052, 0.008, 6, 20), std(0xc9a44a, 0.3, 0.8), pJ.head, s * 0.066, 0.02, 0.158);
    const e = M(new THREE.SphereGeometry(0.02, 8, 6), dark, pJ.head, s * 0.066, 0.02, 0.15); (pJ.eyes ||= []).push(e);
    const b = M(new THREE.BoxGeometry(0.07, 0.016, 0.02), hair, pJ.head, s * 0.066, 0.088, 0.15); b.userData.s = s; (pJ.brows ||= []).push(b);
    const mo = M(new THREE.CapsuleGeometry(0.02, 0.06, 4, 8), hair, pJ.head, s * 0.045, -0.072, 0.158); mo.rotation.z = PI / 2 + s * 0.35; (pJ.mo ||= []).push(mo);
    const ear = M(new THREE.SphereGeometry(0.03, 8, 6), skin, pJ.head, s * 0.168, 0, 0);
  }
  M(new THREE.SphereGeometry(0.09, 10, 8), hair, pJ.head, 0, 0.02, -0.14);
  M(new THREE.BoxGeometry(0.03, 0.008, 0.008), std(0xc9a44a, 0.3, 0.8), pJ.head, 0, 0.025, 0.166);
  pJ.mouth = M(new THREE.SphereGeometry(0.022, 8, 6), std(0x4a1420, 0.6), pJ.head, 0, -0.1, 0.155); pJ.mouth.scale.set(1.2, 0.2, 0.5);
  for (const s of [-1, 1]) {
    const sh = Grp(pJ.body, s * 0.265, 1.32, 0);
    M(new THREE.CylinderGeometry(0.062, 0.07, 0.32, 10), gown, sh, 0, -0.16, 0);
    const el = Grp(sh, 0, -0.32, 0);
    M(new THREE.CylinderGeometry(0.07, 0.085, 0.3, 10), gown, el, 0, -0.15, 0);
    M(new THREE.SphereGeometry(0.062, 10, 8), skin, el, 0, -0.34, 0);
    pJ[s > 0 ? 'R' : 'L'] = { sh, el };
  }
  pJ.book = M(new THREE.BoxGeometry(0.34, 0.05, 0.26), std(0x7a2a1c, 0.6), prof, 0, 0.6, 0.38);
  const pages = M(new THREE.BoxGeometry(0.31, 0.03, 0.23), std(0xe8dfc8, 0.9), pJ.book, 0, 0.03, 0);
}
const POSES = {
  //            y     lean  hy   hp    rs    rr    re     ls    lr    le    crouch eyes
  stand:   { y: 0, lean: 0, hy: 0, hp: 0, rs: 0, rr: 0.12, re: -0.15, ls: 0, lr: 0.12, le: -0.15, cr: 1, eyes: 1 },
  asleep:  { y: -0.42, lean: -0.22, hy: 0.25, hp: 0.5, rs: -0.7, rr: 0.25, re: -0.9, ls: -0.7, lr: 0.25, le: -0.9, cr: 1, eyes: 0.08 },
  reading: { y: -0.42, lean: -0.1, hy: 0, hp: 0.38, rs: -0.75, rr: 0.2, re: -0.95, ls: -0.75, lr: 0.2, le: -0.95, cr: 1, eyes: 0.8 },
  awake:   { y: -0.42, lean: 0.06, hy: 0, hp: -0.1, rs: -0.5, rr: 0.5, re: -1.3, ls: -0.5, lr: 0.5, le: -1.3, cr: 1, eyes: 1.25 },
  wonder:  { y: 0, lean: -0.05, hy: 0, hp: -0.18, rs: -0.2, rr: 0.35, re: -0.5, ls: -0.2, lr: 0.35, le: -0.5, cr: 1, eyes: 1.2 },
  bored:   { y: 0, lean: 0.03, hy: 0.5, hp: 0.08, rs: -1.1, rr: 0.05, re: -2.0, ls: 0, lr: 0.1, le: -0.15, cr: 1, eyes: 0.5 },
  ears:    { y: -0.05, lean: 0.1, hy: 0, hp: 0.14, rs: -1.7, rr: 0.3, re: -2.36, ls: -1.7, lr: 0.3, le: -2.36, cr: 0.96, eyes: 0.15 },   // elbows up and out, palms on the ears
  speak:   { y: 0, lean: 0.03, hy: 0, hp: -0.05, rs: -0.7, rr: 0.35, re: -0.9, ls: -0.15, lr: 0.15, le: -0.4, cr: 1, eyes: 1 },
  plead:   { y: 0, lean: 0.05, hy: 0.7, hp: -0.3, rs: -1.0, rr: 0.5, re: -0.5, ls: -0.3, lr: 0.3, le: -0.6, cr: 1, eyes: 1.1 },
  cower:   { y: -0.3, lean: 0.38, hy: 0, hp: 0.4, rs: -2.5, rr: 0.5, re: -1.5, ls: -2.5, lr: 0.5, le: -1.5, cr: 0.8, eyes: 0.1 },
  shout:   { y: 0.03, lean: -0.1, hy: 0, hp: -0.3, rs: -2.9, rr: 0.25, re: -0.1, ls: -0.3, lr: 0.9, le: -0.3, cr: 1.03, eyes: 1.3 },
};
const pPose = { ...POSES.asleep, yaw: 0, talk: 0, seated: 1 };
function applyProf(name, extra, T, dt, snap) {
  const t = POSES[name], k = snap ? 1 : Math.min(1, dt * (extra.rate || 6));
  for (const key in t) pPose[key] += ((extra[key] ?? t[key]) - pPose[key]) * k;
  pPose.yaw += angDiff(pPose.yaw, extra.yaw || 0) * k; pPose.talk += ((extra.talk ? 1 : 0) - pPose.talk) * Math.min(1, k * 2);
  const p = pPose, seated = extra.seated ? 1 : 0, br = Math.sin(T * 1.4) * 0.012, g = p.talk * Math.sin(T * 3.3);
  prof.position.set(PROF.x, 0, PROF.z); prof.rotation.y = p.yaw;
  pJ.body.position.y = p.y; pJ.body.rotation.x = p.lean; pJ.body.scale.set(1, p.cr * (1 + br), 1);
  pJ.lap.visible = !!seated; pJ.feet.visible = !seated;
  pJ.head.rotation.set(p.hp + p.talk * Math.sin(T * 6.1) * 0.05, p.hy + (extra.scan ? Math.sin(T * 0.8) * 0.7 : 0) + (extra.shake ? Math.sin(T * 17) * 0.12 * extra.shake : 0), seated && p.eyes < 0.3 ? 0.2 : 0);
  pJ.R.sh.rotation.set(p.rs + g * 0.18, 0, p.rr + p.talk * 0.1 * Math.sin(T * 2.1)); pJ.R.el.rotation.x = p.re + g * 0.25;
  pJ.L.sh.rotation.set(p.ls, 0, -p.lr); pJ.L.el.rotation.x = p.le;
  for (const e of pJ.eyes) e.scale.y = clamp(p.eyes, 0.08, 1.4);
  for (const b of pJ.brows) b.position.y = 0.088 + (p.eyes - 1) * 0.03;
  pJ.mouth.scale.y = 0.2 + p.talk * (0.5 + 0.5 * Math.sin(T * 15)) * (name === 'shout' ? 1.6 : 0.8);
  for (const m of pJ.mo) m.position.y = -0.072 + p.talk * Math.sin(T * 15) * 0.006;
  pJ.book.visible = !!seated;
}

// ── the specter of Sir Arthur, as a knight of the Round Table ───────────────
const knight = Grp(scene);
const kMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5); gl_FragColor = vec4(vec3(0.45, 0.7, 1.25) * (0.05 + rim * 0.85) * uA, 1.0); }` });
const kJ = {};
{
  M(lathe([[0.02, 0.1], [0.16, 0.5], [0.3, 0.95], [0.27, 1.25], [0.34, 1.55], [0.2, 1.7], [0, 1.72]], 16), kMat, knight);        // a body that trails away to a wisp
  M(new THREE.CylinderGeometry(0.17, 0.19, 0.3, 14), kMat, knight, 0, 1.9, 0);                                                     // helm
  M(new THREE.ConeGeometry(0.17, 0.16, 14), kMat, knight, 0, 2.13, 0);
  M(new THREE.BoxGeometry(0.22, 0.03, 0.02), glow(1.2, 1.8, 2.6, { transparent: true, opacity: 0.9 }), knight, 0, 1.93, 0.185);    // the visor slit
  const plume = M(new THREE.ConeGeometry(0.07, 0.5, 8), kMat, knight, 0, 2.3, -0.12); plume.rotation.x = -0.9;
  for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.13, 10, 8), kMat, knight, s * 0.36, 1.55, 0);
  const shield = M(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 20), kMat, knight, -0.45, 1.2, 0.14); shield.rotation.x = PI / 2; shield.scale.set(1, 1, 1.25);
  kJ.arm = Grp(knight, 0.38, 1.5, 0);
  M(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), kMat, kJ.arm, 0, -0.25, 0);
  const lance = M(new THREE.CylinderGeometry(0.012, 0.03, 2.6, 6), kMat, kJ.arm, 0, -0.5, 0.6); lance.rotation.x = PI / 2;
  const pennon = M(new THREE.ConeGeometry(0.1, 0.4, 3), kMat, kJ.arm, 0, -0.42, 1.7); pennon.rotation.x = PI / 2;
  knight.visible = false;
}
let kSide = 1;
function applyKnight(vis, at, T, urge) {
  knight.visible = vis > 0.01; if (!knight.visible) return;
  const a = byN[137], sx = Math.sin(a.yaw + PI / 2), sz = Math.cos(a.yaw + PI / 2);
  const far = Math.hypot(camP.x - at.x - sx, camP.z - at.z - sz) > Math.hypot(camP.x - at.x + sx, camP.z - at.z + sz) ? 1 : -1;   // hover on the side away from the camera
  kSide += (far - kSide) * 0.08;
  knight.position.set(at.x + sx * 0.85 * kSide - Math.sin(a.yaw) * 0.4, 0.25 + Math.sin(T * 1.7) * 0.08, at.z + sz * 0.85 * kSide - Math.cos(a.yaw) * 0.4);
  knight.scale.setScalar(0.9);
  knight.rotation.set(0, a.yaw - 0.5 * kSide, (-0.22 - urge * 0.12 * Math.sin(T * 6)) * kSide);
  kJ.arm.rotation.x = -1.2 - urge * (0.5 + 0.25 * Math.sin(T * 6));
  kMat.uniforms.uA.value = vis * (0.85 + 0.15 * Math.sin(T * 3.1));
}

// ── a pool of light for whoever is speaking ─────────────────────────────────
const beam = M(new THREE.CylinderGeometry(0.2, 1.25, 14, 24, 1, true), new THREE.ShaderMaterial({
  uniforms: { uA: { value: 0 }, uC: { value: new THREE.Color(1, 0.9, 0.7) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
  vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float uA; uniform vec3 uC; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.0); gl_FragColor = vec4(uC * uA * f * (0.01 + 0.05 * pow(1.0 - vY, 2.0)), 1.0); }`,
}), scene, 0, 7, 0);
beam.renderOrder = 6;
const pool = M(flatGeo, new THREE.MeshBasicMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0.9, 0.75, 0.45), opacity: 0 }), scene);
pool.scale.set(4.2, 1, 4.2); pool.renderOrder = 2;
function lightOn(pos, amt, color) {
  beam.visible = pool.visible = amt > 0.01; spot.intensity = amt * 5;
  if (!beam.visible) return;
  beam.position.set(pos.x, 7, pos.z); pool.position.set(pos.x, 0.03, pos.z); spot.position.set(pos.x * 0.86, 2.3, pos.z * 0.86);
  beam.material.uniforms.uA.value = amt; pool.material.opacity = amt * 0.5;
  if (color) { beam.material.uniforms.uC.value.copy(color); }
}

// ── the study where it begins and ends ──────────────────────────────────────
const study = Grp(scene);
const sJ = { walls: [] };
{
  const wood = std(0x3a2418, 0.7), leather = std(0x5c1f1c, 0.45), plaster = std(0x39424a, 0.9), brass = std(0xc9a44a, 0.3, 0.8);
  sJ.floor = M(new THREE.CircleGeometry(7, 48), std(0x2a1a12, 0.8, 0, { transparent: true }), study, 0, 0.012, 0); sJ.floor.rotation.x = -PI / 2;
  sJ.rug = M(new THREE.CircleGeometry(3.3, 48), new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.95, map: canvasTex(512, 512, (g) => {
    g.fillStyle = '#3a1418'; g.fillRect(0, 0, 512, 512);
    const cols = ['#7d2a20', '#8a5a1e', '#8a7a2a', '#2f5a36', '#2a4a78', '#3a3470', '#5a3478'];
    for (let i = 6; i >= 0; i--) { g.strokeStyle = cols[i]; g.lineWidth = 15; g.beginPath(); g.arc(256, 256, 44 + i * 30, 0, TAU); g.stroke(); }
    g.strokeStyle = '#c9a44a'; g.lineWidth = 3; for (const r of [250, 24]) { g.beginPath(); g.arc(256, 256, r, 0, TAU); g.stroke(); }
  }) }), study, 0, 0.022, 0); sJ.rug.rotation.x = -PI / 2;
  // armchair
  sJ.chair = Grp(study);
  M(new THREE.BoxGeometry(0.86, 0.46, 0.8), leather, sJ.chair, 0, 0.23, -0.02);
  const back = M(new THREE.BoxGeometry(0.86, 1.15, 0.18), leather, sJ.chair, 0, 0.95, -0.45); back.rotation.x = -0.13;
  for (const s of [-1, 1]) { M(new THREE.BoxGeometry(0.16, 0.3, 0.8), leather, sJ.chair, s * 0.5, 0.6, -0.02); M(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 10), leather, sJ.chair, s * 0.5, 0.76, -0.02).rotation.x = PI / 2; M(new THREE.BoxGeometry(0.14, 0.5, 0.16), leather, sJ.chair, s * 0.42, 1.35, -0.42).rotation.x = -0.13; }
  // side table, lamp, books, tea
  sJ.table = Grp(study, 0.98, 0, 0.1);
  M(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 20), wood, sJ.table, 0, 0.66, 0); M(new THREE.CylinderGeometry(0.04, 0.06, 0.66, 8), wood, sJ.table, 0, 0.33, 0); M(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 12), wood, sJ.table, 0, 0.015, 0);
  M(new THREE.CylinderGeometry(0.02, 0.07, 0.42, 8), brass, sJ.table, 0.08, 0.89, -0.1);
  sJ.shade = M(new THREE.CylinderGeometry(0.1, 0.2, 0.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.6, 0.7), side: THREE.DoubleSide }), sJ.table, 0.08, 1.16, -0.1);
  sJ.lamp = new THREE.PointLight(0xffb060, 14, 12, 1.7); sJ.lamp.position.set(1.06, 1.2, 0.0); study.add(sJ.lamp);
  [[0x24405a, 0.3, 0.05], [0x6a5a22, 0.27, -0.12], [0x4a2238, 0.25, 0.1]].forEach(([c, w, r], i) => { const b = M(new THREE.BoxGeometry(w, 0.05, 0.2), std(c, 0.7), sJ.table, -0.1, 0.705 + i * 0.05, 0.1); b.rotation.y = r; });
  M(new THREE.CylinderGeometry(0.04, 0.03, 0.06, 10), std(0xe8e4da, 0.4), sJ.table, 0.18, 0.71, 0.16);
  // three walls that fall away like stage flats
  const shelfTex = canvasTex(1024, 512, (g) => {
    g.fillStyle = '#1c120c'; g.fillRect(0, 0, 1024, 512);
    const spines = ['#5a1f1c', '#24405a', '#2f4a30', '#6a5a22', '#3a2a50', '#70401c', '#1f3a40', '#4a2238', '#8a7a5a'];
    for (let row = 0; row < 4; row++) { let x = 14; const y = 14 + row * 124;
      while (x < 1000) { const w = 14 + frand(x * 3.1 + row) * 26, h = 78 + frand(x + row * 7) * 30; g.fillStyle = spines[Math.floor(frand(x * 1.7 + row * 3) * spines.length)]; g.fillRect(x, y + 108 - h, w - 2, h);
        if (frand(x + 0.5) > 0.5) { g.fillStyle = 'rgba(220,190,110,.7)'; g.fillRect(x + 2, y + 108 - h + 10, w - 6, 3); g.fillRect(x + 2, y + 108 - h + 18, w - 6, 2); } x += w; }
      g.fillStyle = '#3a2418'; g.fillRect(0, y + 108, 1024, 12); }
  });
  const boardTex = canvasTex(1024, 640, (g) => {
    g.fillStyle = '#16241f'; g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = g.fillStyle = 'rgba(236,236,226,.92)'; g.lineWidth = 4; g.lineCap = 'round';
    // Pythagoras: 3-4-5 with its squares
    g.save(); g.translate(250, 400); g.scale(42, -42); g.lineWidth = 0.09;
    const P = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke(); };
    P([[0, 0], [4, 0], [0, 3]]); P([[0, 0], [4, 0], [4, -4], [0, -4]]); P([[0, 0], [0, 3], [-3, 3], [-3, 0]]); P([[4, 0], [7, 4], [3, 7], [0, 3]]); g.restore();
    g.font = 'italic 54px Georgia, serif'; g.fillText('a² + b² = c²', 560, 110);
    g.font = '46px Georgia, serif'; g.fillText('1  2  3  4  5  6 …', 560, 210);
    g.font = 'italic 50px Georgia, serif'; g.fillText('π = 3·14159…', 560, 310);
    g.font = 'bold 110px Georgia, serif'; g.fillText('137', 600, 470); g.font = '120px Georgia, serif'; g.fillText('?', 810, 474);
    g.lineWidth = 5; g.beginPath(); g.ellipse(705, 430, 150, 78, -0.05, 0, TAU); g.stroke();
    g.font = 'italic 34px Georgia, serif'; g.fillText('— Eddington', 700, 570);
  });
  const mkWall = (w, x, z, ry, deco) => {
    const pivot = Grp(study, x, 0, z); pivot.rotation.y = ry; const tilt = Grp(pivot);
    const mat = std(0x39424a, 0.9, 0, { transparent: true, side: THREE.DoubleSide });
    M(new THREE.BoxGeometry(w, 3.6, 0.1), mat, tilt, 0, 1.8, 0);
    const mats = [mat]; deco(tilt, mats); sJ.walls.push({ tilt, mats }); return tilt;
  };
  mkWall(7.2, 0, -3.3, 0, (t, mats) => { const m = new THREE.MeshStandardMaterial({ map: shelfTex, roughness: 0.8, transparent: true }); M(new THREE.PlaneGeometry(6.6, 3.1), m, t, 0, 1.75, 0.06); mats.push(m); });
  mkWall(6.6, -3.6, 0, PI / 2, (t, mats) => {
    const fr = std(0x4a3020, 0.7, 0, { transparent: true }); M(new THREE.BoxGeometry(3.5, 2.3, 0.06), fr, t, 0.2, 1.85, 0.07); mats.push(fr);
    const m = new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.95, transparent: true, emissive: 0xffffff, emissiveMap: boardTex, emissiveIntensity: 0.25 }); sJ.board = M(new THREE.PlaneGeometry(3.3, 2.06), m, t, 0.2, 1.85, 0.105); mats.push(m);
  });
  mkWall(6.6, 3.6, 0, -PI / 2, (t, mats) => {
    const fr = std(0x4a3020, 0.7, 0, { transparent: true }); M(new THREE.BoxGeometry(1.7, 2.3, 0.06), fr, t, -0.3, 1.9, 0.07); mats.push(fr);
    sJ.window = new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(256, 384, (g) => { const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#cfd6ee'); g.fillStyle = gr; g.fillRect(0, 0, 256, 384); g.fillStyle = 'rgba(40,26,16,.95)'; g.fillRect(122, 0, 12, 384); g.fillRect(0, 186, 256, 12); }) });
    M(new THREE.PlaneGeometry(1.5, 2.1), sJ.window, t, -0.3, 1.9, 0.105); mats.push(sJ.window);
    sJ.winLight = new THREE.PointLight(0x9fb6ff, 5, 9, 1.6); sJ.winLight.position.set(-0.3, 2.0, 0.9); t.add(sJ.winLight);
  });
}
// k: 1 = the room stands, 0 = gone. morning: 0 night, 1 dawn.
function applyStudy(k, fall, morning) {
  study.visible = k > 0.005;
  if (!study.visible) { sJ.lamp.intensity = 0; return; }
  for (const w of sJ.walls) { w.tilt.rotation.x = -fall * 1.5; w.tilt.position.y = -fall * 0.5; for (const m of w.mats) m.opacity = k; }
  sJ.floor.material.opacity = k; sJ.rug.material.opacity = k;
  sJ.chair.visible = sJ.table.visible = k > 0.5; sJ.chair.position.y = sJ.table.position.y = -(1 - k) * 0.8;
  sJ.lamp.intensity = 14 * k * (1 - morning) * (1 - fall); sJ.shade.material.color.setRGB(lerp(0.25, 2.4, (1 - morning) * (1 - fall)), lerp(0.2, 1.6, (1 - morning) * (1 - fall)), lerp(0.15, 0.7, (1 - morning) * (1 - fall)));
  sJ.window.color.setRGB(lerp(0.16, 3.2, morning), lerp(0.2, 2.5, morning), lerp(0.42, 1.5, morning));
  sJ.winLight.color.setRGB(lerp(0.6, 1.0, morning), lerp(0.7, 0.82, morning), lerp(1.0, 0.55, morning)); sJ.winLight.intensity = k * lerp(5, 16, morning) * (1 - fall);
}

// ── apparitions: what the numbers boast of, drawn in light above them ───────
const APP = {};
function apparition(name, build) { const g = Grp(scene); g.visible = false; build(g); APP[name] = g; g.userData.mats = []; g.traverse(o => { if (o.material) { g.userData.mats.push(o.material); o.material.userData.base = o.material.opacity; } }); }
function showApp(name, k, at, T) {
  const g = APP[name]; g.visible = k > 0.01; if (!g.visible) return;
  if (at) g.position.copy(at); for (const m of g.userData.mats) m.opacity = m.userData.base * k;
  if (g.userData.tick) g.userData.tick(g, T, k);
}
const GOLD = new THREE.Color(1.6, 1.2, 0.5), ICE = new THREE.Color(0.8, 1.2, 2.0), ROSE = new THREE.Color(1.8, 0.7, 1.0);
const textSprite = (txt, color, size = 1) => { const t = canvasTex(512, 128, (g) => { g.fillStyle = '#fff'; g.font = 'bold 92px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 256, 68); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.set(4 * size, size, 1); return s; };
apparition('one', (g) => {   // an endless progeny pouring out of One
  const N = 90, pos = new Float32Array(N * 3); const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ map: starTex, size: 0.32, color: GOLD, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); pts.frustumCulled = false; g.add(pts);
  g.userData.tick = (g, T) => { for (let i = 0; i < N; i++) { const u = (T * 0.33 + i / N) % 1, a = i * 2.399, r = u * (1.2 + frand(i) * 2.6); pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = 1.7 + u * 3.4 - u * u * 1.9; pos[i * 3 + 2] = Math.sin(a) * r; } pts.geometry.attributes.position.needsUpdate = true; };
});
apparition('orion', (g) => {
  const S = [[-1.4, 4.8, 0], [1.2, 4.65, 0], [-0.5, 3.5, 0], [0, 3.37, 0], [0.5, 3.24, 0], [-1.1, 2.0, 0], [1.45, 2.15, 0]];
  g.add(starPts(S, 0.5, ICE)); g.add(starPts([S[2], S[3], S[4]], 1.1, new THREE.Color(1.6, 1.8, 2.6)));
  g.add(lineArt([[...S[0], ...S[2]], [...S[1], ...S[4]], [...S[2], ...S[3]], [...S[3], ...S[4]], [...S[2], ...S[5]], [...S[4], ...S[6]], [...S[0], ...S[1]], [...S[5], ...S[6]]], ICE, 0.5));
});
apparition('square', (g) => { g.add(lineArt(poly([[-1.1, 2.0, 0], [1.1, 2.0, 0], [1.1, 4.2, 0], [-1.1, 4.2, 0]]), GOLD, 1)); g.add(lineArt(poly([[-0.95, 2.15, 0], [0.95, 2.15, 0], [0.95, 4.05, 0], [-0.95, 4.05, 0]]), GOLD, 0.5)); g.add(starPts([[-1.1, 2.0, 0], [1.1, 2.0, 0], [1.1, 4.2, 0], [-1.1, 4.2, 0]], 0.5, GOLD)); });
apparition('penta', (g) => { const p = Array.from({ length: 5 }, (_, i) => [Math.sin(i * TAU / 5) * 1.35, 3.4 + Math.cos(i * TAU / 5) * 1.35, 0]); g.add(lineArt([...poly(p), ...poly([0, 2, 4, 1, 3].map(i => p[i]))], ROSE, 1)); g.add(starPts(p, 0.45, ROSE)); g.userData.tick = (g, T) => { g.children[0].rotation.z = 0; }; });
apparition('dodeca', (g) => {
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(1, 0)), new THREE.LineBasicMaterial({ color: ROSE, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); g.add(e);
  const st = []; for (let i = 0; i < 70; i++) { const u = frand(i) * 2 - 1, a = frand(i + 0.5) * TAU, r = Math.cbrt(frand(i + 0.9)) * 0.75, s = Math.sqrt(1 - u * u); st.push([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r]); }
  const p = starPts(st, 0.035, new THREE.Color(1.5, 1.5, 2)); p.material.sizeAttenuation = true; e.add(p);
  g.userData.tick = (g, T, k) => { e.rotation.set(T * 0.21, T * 0.33, 0); e.scale.setScalar(g.userData.size * (0.3 + 0.7 * ease(k))); p.material.size = 0.05 * e.scale.x; };
  g.userData.size = 3;
});
apparition('sum6', (g) => { const s = textSprite('1 + 2 + 3', GOLD, 0.9); s.position.y = 2.75; g.add(s); const s2 = textSprite('1 × 2 × 3', GOLD, 0.55); s2.position.y = 3.6; s2.material.opacity = 0.6; g.add(s2); });
apparition('seven', (g) => {   // the Pleiades above, the seven-branched candlestick below
  const P = [[-0.5, 4.75, 0], [0.1, 5.0, 0], [0.55, 4.65, 0], [0.2, 4.4, 0], [-0.25, 4.35, 0], [0.75, 4.2, 0], [-0.75, 4.45, 0]]; g.add(starPts(P, 0.5, ICE));
  const segs = [[0, 1.9, 0, 0, 3.6, 0], [-0.4, 1.9, 0, 0.4, 1.9, 0]], fl = [[0, 3.72, 0]];
  for (let i = 1; i <= 3; i++) { const r = i * 0.42, arc = Array.from({ length: 13 }, (_, j) => [Math.cos(PI + j / 12 * PI) * r, 2.75 + Math.sin(PI + j / 12 * PI) * r * 0.8, 0]);
    segs.push(...poly(arc, false), [-r, 2.75, 0, -r, 3.6, 0], [r, 2.75, 0, r, 3.6, 0]); fl.push([-r, 3.72, 0], [r, 3.72, 0]); }
  g.add(lineArt(segs, GOLD, 1)); const f = starPts(fl, 0.5, new THREE.Color(2.2, 1.5, 0.5)); g.add(f); g.userData.tick = (g, T) => { f.material.size = 0.5 + Math.sin(T * 11) * 0.06; };
});
apparition('cube8', (g) => {
  const grp = Grp(g, 0, 3.2, 0), box = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.62, 0.62, 0.62));
  for (let i = 0; i < 8; i++) { const c = new THREE.LineSegments(box, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); c.userData.d = [(i & 1) - 0.5, ((i >> 1) & 1) - 0.5, ((i >> 2) & 1) - 0.5]; grp.add(c);
    c.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 0.9, 0.3), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }))); }
  g.userData.tick = (g, T, k) => { grp.rotation.set(0.5, T * 0.5, 0); const sp = 0.66 + (1 - ease(k)) * 1.6; for (const c of grp.children) c.position.set(c.userData.d[0] * sp, c.userData.d[1] * sp, c.userData.d[2] * sp); };
});
apparition('muses', (g) => { for (let i = 0; i < 9; i++) { const s = textSprite(i % 3 === 1 ? '♫' : '♪', i % 2 ? ROSE : GOLD, 0.6); s.userData.i = i; g.add(s); } g.userData.tick = (g, T) => { for (const s of g.children) { const i = s.userData.i, a = i / 9 * TAU + T * 0.5; s.position.set(Math.cos(a) * 1.5, 2.9 + Math.sin(T * 1.6 + i * 1.3) * 0.35 + (i % 3) * 0.3, Math.sin(a) * 1.5); } }; });
apparition('heart', (g) => { const s = textSprite('♥', ROSE, 0.55); g.add(s); g.userData.tick = (g, T) => { s.position.y = 1.9 + Math.sin(T * 2.4) * 0.08; s.scale.set(2.2 * (1 + 0.12 * Math.sin(T * 5)), 0.55 * (1 + 0.12 * Math.sin(T * 5)), 1); }; });
