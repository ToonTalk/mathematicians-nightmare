// ── light ───────────────────────────────────────────────────────────────────
const hemi = new THREE.HemisphereLight(0x6f78d8, 0x241a3a, 1.0); scene.add(hemi);
const moon = new THREE.DirectionalLight(0xbfd0ff, 2.3); moon.position.set(-30, 60, 25); scene.add(moon);
const rim = new THREE.DirectionalLight(0xff8fd0, 0.9); rim.position.set(25, 18, -40); scene.add(rim);
const hearth = new THREE.PointLight(0xffc98a, 0, 50, 1.5); hearth.position.set(0.4, 6.5, 1.2); scene.add(hearth);
const spot = new THREE.PointLight(0xfff0d0, 0, 9, 1.4); scene.add(spot);

// ── sky ─────────────────────────────────────────────────────────────────────
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uT: G.uT, uDream: G.uDream, uMist: { value: 0 }, uAnger: { value: 0 } },
  vertexShader: `varying vec3 vD; void main(){ vD = position; vec4 p = modelViewMatrix * vec4(position, 0.0); gl_Position = projectionMatrix * vec4(p.xyz, 1.0); gl_Position.z = gl_Position.w * 0.9999; }`,
  fragmentShader: `
    varying vec3 vD; uniform float uT,uDream,uMist,uAnger;
    float h3(vec3 p){ p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
      float a = h3(vec3(i,1.)), b = h3(vec3(i+vec2(1,0),1.)), c = h3(vec3(i+vec2(0,1),1.)), d = h3(vec3(i+1.,1.));
      return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
    void main(){
      vec3 d = normalize(vD);
      float e = clamp(d.y, -0.2, 1.0);
      vec3 c = mix(vec3(0.055,0.038,0.125), vec3(0.004,0.006,0.026), pow(clamp(e,0.,1.), 0.5));
      // a low aurora, slowly breathing
      float az = atan(d.x, d.z);
      float au = n2(vec2(az*3.0 + uT*0.02, e*9.0 - uT*0.03)) * n2(vec2(az*7.0 - uT*0.015, 3.0));
      c += mix(vec3(0.05,0.32,0.34), vec3(0.42,0.10,0.40), n2(vec2(az*1.5, uT*0.01))) * au * exp(-pow((e-0.15)/0.11, 2.0)) * 0.8;
      c = mix(c, vec3(0.34,0.03,0.05), uAnger * exp(-e*3.0) * 0.8);
      // stars
      vec3 q = d * 210.0; vec3 id = floor(q); float h = h3(id);
      if (h > 0.986 && e > 0.0) { float tw = 0.65 + 0.35 * sin(uT*(1.0+h*3.0) + h*90.0);
        float s = smoothstep(0.42, 0.0, length(fract(q) - 0.5)); c += vec3(0.9,0.92,1.0) * s * tw * (h - 0.986) * 190.0 * smoothstep(0.0, 0.2, e); }
      c = mix(c, vec3(0.80,0.82,0.92), uMist);
      gl_FragColor = vec4(c * uDream, 1.0);
    }`,
});
const sky = M(new THREE.SphereGeometry(3000, 48, 24), skyMat, scene); sky.frustumCulled = false; sky.renderOrder = -10;

// ── line art: sky diagrams and the apparitions that illustrate speeches ─────
function lineArt(segs, color, opacity = 1) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(segs.flat(), 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  return new THREE.LineSegments(g, m);
}
const poly = (pts, close = true) => { const s = []; for (let i = 0; i < pts.length - (close ? 0 : 1); i++) s.push([...pts[i], ...pts[(i + 1) % pts.length]]); return s; };
const circle2 = (cx, cy, r, n = 28) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r, 0]);
const starTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(255,255,255,.75)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
function starPts(pts, size, color) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ map: starTex, size, color, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, sizeAttenuation: true }));
}
// Chalk diagrams drawn faintly across the sky, as if the heavens were a geometer's blackboard.
const skyArt = Grp(scene);
function skyFigure(az, el, scale, segs2d) {
  const C = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  const R = new THREE.Vector3(0, 1, 0).cross(C).normalize(), U = C.clone().cross(R);
  const map = (x, y) => { const v = C.clone().addScaledVector(R, x * scale).addScaledVector(U, y * scale).normalize().multiplyScalar(2600); return [v.x, v.y, v.z]; };
  const segs = segs2d.map(s => [...map(s[0], s[1]), ...map(s[3], s[4])]);
  skyArt.add(lineArt(segs, new THREE.Color(0.42, 0.5, 1.0), 0.0));
}
{
  // the theorem of Pythagoras: a 3-4-5 triangle wearing its three squares
  const A = [0, 0, 0], B = [4, 0, 0], Cc = [0, 3, 0];
  skyFigure(-0.75, 0.52, 0.055, [...poly([A, B, Cc]), ...poly([[0, 0, 0], [4, 0, 0], [4, -4, 0], [0, -4, 0]]), ...poly([[0, 0, 0], [0, 3, 0], [-3, 3, 0], [-3, 0, 0]]), ...poly([[4, 0, 0], [7, 4, 0], [3, 7, 0], [0, 3, 0]])]);
  // the tetractys
  const tet = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) tet.push(...poly(circle2((i - r / 2) * 1.6, -r * 1.4 + 2, 0.32, 10)));
  skyFigure(0.9, 0.62, 0.06, [...tet, ...poly([[0, 3.2, 0], [3.4, -2.9, 0], [-3.4, -2.9, 0]])]);
  // pentagram in a circle
  const pent = Array.from({ length: 5 }, (_, i) => [Math.sin(i * TAU / 5) * 3, Math.cos(i * TAU / 5) * 3, 0]);
  skyFigure(2.5, 0.48, 0.06, [...poly(circle2(0, 0, 3, 40)), ...poly([0, 2, 4, 1, 3].map(i => pent[i])), ...poly(pent)]);
  // squaring the circle: a circle between an inscribed and a circumscribed polygon
  skyFigure(-2.3, 0.6, 0.06, [...poly(circle2(0, 0, 3, 48)), ...poly(circle2(0, 0, 3, 6)), ...poly(circle2(0, 0, 3 / Math.cos(PI / 6), 6).map(p => { const a = Math.atan2(p[1], p[0]) + PI / 6, r = 3 / Math.cos(PI / 6); return [Math.cos(a) * r, Math.sin(a) * r, 0]; }))]);
  // the golden rectangle and its spiral
  const spiral = Array.from({ length: 60 }, (_, i) => { const th = i / 59 * 4.2 * PI, r = 0.22 * Math.exp(0.3063 * th); return [Math.cos(th) * r, Math.sin(th) * r, 0]; });
  skyFigure(0.05, 0.95, 0.045, [...poly(spiral, false), ...poly([[-4.6, -3.2, 0], [5.4, -3.2, 0], [5.4, 3.0, 0], [-4.6, 3.0, 0]]), [-0.8, -3.2, 0, -0.8, 3.0, 0]]);
}

// ── ground: the boundless plain ─────────────────────────────────────────────
const groundMat = new THREE.ShaderMaterial({
  uniforms: {
    ...G, uCol: { value: RAINBOW.map(h => col(h)) },
    uIn: { value: [RINGS[0].in, RINGS[1].in, RINGS[2].in, RINGS[3].in, RINGS[4].in, R6_IN, R7_IN] },
    uOut: { value: [RINGS[0].out, RINGS[1].out, RINGS[2].out, RINGS[3].out, RINGS[4].out, R6_OUT, R7_OUT] },
    uRug: { value: 0 },
  },
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `
    varying vec3 vW;
    uniform float uT,uReveal,uDream,uPale,uWaveR,uHi,uFogD,uSwarm,uBlow,uRug; uniform vec3 uFogC,uCtr; uniform vec3 uCol[7]; uniform float uIn[7]; uniform float uOut[7];
    float dots(float r, float a, float s, out float vis){
      float ri = floor(r / s); float n = max(6.0, floor(6.2832 * (ri + 0.5))); float ai = a / 6.2832 * n + ri * 0.37;
      vec2 d = vec2((fract(ai) - 0.5) * 6.2832 * r / n, (fract(r / s) - 0.5) * s);
      float px = fwidth(r) + 0.0001; vis = clamp(1.3 - px / (s * 0.42), 0.0, 1.0);
      return 1.0 - smoothstep(0.16 * s, 0.34 * s, length(d));
    }
    void main(){
      float r = length(vW.xz), a = atan(vW.x, vW.z);
      float px = fwidth(r) + 0.0001;
      vec3 c = vec3(0.020, 0.018, 0.045) + vec3(0.085, 0.06, 0.13) * exp(-r * r / 90.0);
      float rev = 1.0 - smoothstep(uReveal - 5.0, uReveal, r);
      float vis; float dd = dots(r, a, 1.25, vis);
      float emptied = uSwarm < 0. ? 1.0 : 1.0 - smoothstep(0.0, 3.5, uSwarm - r * 0.012);
      for (int k = 0; k < 7; k++) {
        float m = smoothstep(uIn[k] - 0.25, uIn[k] + 0.25, r) - smoothstep(uOut[k] - 0.25, uOut[k] + 0.25, r);
        float hi = 1.0 - clamp(abs(uHi - float(k)), 0.0, 1.0);
        vec3 kc = mix(uCol[k], vec3(0.8, 0.86, 1.0), uPale * 0.55);
        c += kc * m * rev * (0.085 + 0.42 * hi * (0.75 + 0.25 * sin(uT * 4.0)));
        float w = max(0.07, px * 1.3);
        float ln = (1.0 - smoothstep(0.0, w, abs(r - uIn[k]))) + (1.0 - smoothstep(0.0, w, abs(r - uOut[k])));
        c += kc * ln * rev * 1.25 * clamp(0.5 / px, 0.12, 1.0);
        if (k >= 5) c += kc * m * rev * emptied * (dd * vis * 0.95 + (1.0 - vis) * 0.16);
      }
      // past the seventh circle the numbers go on, silver, as far as there is plain
      { float m = smoothstep(2020.0, 2030.0, r); c += vec3(0.5, 0.52, 0.62) * m * rev * 0.14; }
      // Pi's command crossing the plain
      if (uWaveR > 0.0) c += vec3(0.75, 0.88, 1.0) * exp(-pow((r - uWaveR) / (1.0 + uWaveR * 0.03), 2.0)) * 2.6 * exp(-uWaveR / 160.0);
      c += vec3(0.6,0.5,0.3) * uRug * (1.0 - smoothstep(2.6, 3.3, r)) * (0.06 + 0.10 * step(0.5, fract(r * 1.25)));
      float dist = length(vW - cameraPosition);
      c = mix(c, uFogC, 1.0 - exp(-uFogD * uFogD * dist * dist * 0.55));
      gl_FragColor = vec4(c * uDream, 1.0);
    }`,
});
const ground = M(new THREE.CircleGeometry(6500, 96), groundMat, scene); ground.rotation.x = -PI / 2; ground.frustumCulled = false; ground.renderOrder = -5;

// ── the fourth circle: nine thousand figures, posed in the vertex shader ────
const crowdUniformMat = patch(new THREE.MeshLambertMaterial({ color: 0xffffff }), { crowd: true, pale: 0.7 });
const CROWD_GEO = {};
function lowBody(kind) {
  const head = new THREE.SphereGeometry(0.2, 8, 6);
  let body, hy;
  if (kind === 'tile') { body = new THREE.BoxGeometry(0.84, 0.84, 0.13); body.translate(0, 0.74, 0); hy = 1.36; }
  else if (kind === 'die') { body = new THREE.BoxGeometry(0.7, 0.7, 0.7); body.translate(0, 0.67, 0); hy = 1.22; }
  else if (kind === 'ball') { body = new THREE.SphereGeometry(0.44, 10, 8); body.translate(0, 0.74, 0); hy = 1.36; }
  else if (kind === 'cyl') { body = new THREE.CylinderGeometry(0.3, 0.3, 0.84, 10); body.translate(0, 0.74, 0); hy = 1.36; }
  else if (kind === 'tunic') { body = lathe([[0.3, 0.2], [0.27, 0.7], [0.3, 0.98], [0.1, 1.12]], 8); hy = 1.32; }
  else { body = lathe([[0.46, 0.1], [0.24, 0.6], [0.27, 0.84], [0.1, 0.96]], 8); hy = 1.17; }
  head.translate(0, hy, 0);
  return mergeGeometries([body.toNonIndexed(), head.toNonIndexed()].map(g => { g.deleteAttribute('uv'); return g; }));
}
const crowd = Grp(scene);
{
  const R = RINGS[3], by = {};
  for (let n = R.lo; n <= 10000; n++) (by[dressOf(n)] ||= []).push(n);
  const ringCol = col(RAINBOW[3]), c = new THREE.Color(), id = new THREE.Matrix4();
  for (const kind in by) {
    const list = by[kind], mesh = new THREE.InstancedMesh(CROWD_GEO[kind] = lowBody(kind), crowdUniformMat, list.length);
    const pol = new Float32Array(list.length * 4);
    list.forEach((n, i) => {
      const h = homeOf(n);
      pol.set([h.r, h.a, h.row & 1 ? 1 : -1, frand(n)], i * 4);
      mesh.setMatrixAt(i, id);
      c.copy(isPow10(n) ? col(WHITE) : PERFECT.has(n) ? col('#f3c84a') : ringCol).multiplyScalar(0.82 + 0.3 * frand(n + 7));
      mesh.setColorAt(i, c);
    });
    mesh.geometry.setAttribute('aPol', new THREE.InstancedBufferAttribute(pol, 4));
    mesh.frustumCulled = false; crowd.add(mesh);
  }
}

// ── the fifth circle: ninety thousand, each a small soft figure ─────────────
const hostMat = new THREE.ShaderMaterial({
  uniforms: { ...G, uColA: { value: col(RAINBOW[4]) } },
  vertexShader: `attribute vec4 aPol; ${GLSL_COMMON}
    uniform float uPx; varying float vSeed; varying float vFade; varying float vFog; uniform float uFogD;
    void main(){ vec3 p; float yaw,scl,lean,fade; crowdPose(aPol,p,yaw,scl,lean,fade);
      p.y += 0.62 * scl; vSeed = aPol.w; vFade = fade;
      vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      float d = -mv.z; vFog = 1.0 - exp(-uFogD * uFogD * d * d);
      gl_PointSize = clamp(uPx * 1.5 * scl * (1.0 - fade * 0.6) / d, 0.0, 90.0); }`,
  fragmentShader: `uniform vec3 uColA,uFogC; uniform float uDream,uPale; varying float vSeed; varying float vFade; varying float vFog;
    void main(){ vec2 q = gl_PointCoord * 2.0 - 1.0; q.y = -q.y;
      float body = length((q - vec2(0.0, -0.3)) / vec2(0.62, 0.7)); float head = length(q - vec2(0.0, 0.62)) / 0.34;
      float a = max(1.0 - smoothstep(0.8, 1.0, body), 1.0 - smoothstep(0.8, 1.0, head)); if (a < 0.05) discard;
      vec3 c = uColA * (0.55 + 0.6 * fract(vSeed * 13.7)) * (0.55 + 0.45 * (q.y * 0.5 + 0.5));
      c = mix(c, vec3(0.8, 0.86, 1.0), uPale * 0.6); c = mix(c, vec3(1.6), vFade);
      c = mix(c, uFogC, vFog);
      gl_FragColor = vec4(c * uDream, a * (1.0 - vFade)); }`,
  transparent: true, depthWrite: false,
});
let host;
{
  const R = RINGS[4], N = 90000, pol = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { const h = homeOf(R.lo + i); pol.set([h.r, h.a, h.row & 1 ? 1 : -1, frand(i + 0.5)], i * 4); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute('aPol', new THREE.BufferAttribute(pol, 4));
  host = new THREE.Points(g, hostMat); host.frustumCulled = false; host.renderOrder = 2; scene.add(host);
}

// ── what the numbers turn into at the end: loose chalk digits ───────────────
const digitTex = canvasTex(640, 64, (g) => { g.fillStyle = '#fff'; g.font = 'bold 50px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < 10; i++) g.fillText(String(i), i * 64 + 32, 35); });
const burstMat = new THREE.ShaderMaterial({
  uniforms: { ...G, uMap: { value: digitTex } },
  vertexShader: `attribute vec4 aDir; uniform float uBlow,uPx; uniform vec3 uCtr; varying float vDig; varying float vA;
    void main(){ float t = max(uBlow, 0.0), seed = aDir.w;
      float tt = max(t - seed * 0.35, 0.0);
      vec3 p = uCtr + vec3(0.0, 1.3, 0.0) + aDir.xyz * (1.2 + (1.0 - exp(-tt * 0.9)) * (10.0 + seed * 60.0));
      p.y = abs(p.y) + tt * (0.6 + fract(seed * 9.1) * 1.8) + sin(tt * 2.0 + seed * 30.0) * 0.3;
      vDig = floor(fract(seed * 77.7) * 10.0); vA = step(0.0001, tt) * (1.0 - smoothstep(2.2, 6.5, t));
      vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(uPx * (0.7 + fract(seed * 3.3) * 0.9) / -mv.z, 0.0, 64.0) * step(0.0, uBlow); }`,
  fragmentShader: `uniform sampler2D uMap; varying float vDig; varying float vA;
    void main(){ vec2 uv = vec2((gl_PointCoord.x + vDig) / 10.0, 1.0 - gl_PointCoord.y); float a = texture2D(uMap, uv).a * vA * 0.8; if (a < 0.03) discard; gl_FragColor = vec4(vec3(0.98, 0.98, 1.05), a); }`,
  transparent: true, depthWrite: false,
});
let burst;
{
  const N = 3600, d = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { const u = frand(i) * 2 - 1, a = frand(i + 0.3) * TAU, s = Math.sqrt(1 - u * u); d.set([Math.cos(a) * s, u * 0.55 + 0.1, Math.sin(a) * s, frand(i + 0.7)], i * 4); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute('aDir', new THREE.BufferAttribute(d, 4));
  burst = new THREE.Points(g, burstMat); burst.frustumCulled = false; burst.renderOrder = 5; burst.visible = false; scene.add(burst);
}
