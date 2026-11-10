import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ── small tools ─────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const PI = Math.PI, TAU = PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOutBack = t => { t = clamp(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const frand = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const angDiff = (a, b) => ((b - a + PI) % TAU + TAU) % TAU - PI;
const pulse = (t, a, b, f = 0.4) => sstep(a, a + f, t) * (1 - sstep(b - f, b, t));   // 0→1→0 over [a,b]
function keys(T, k) {
  if (T <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (T < k[i][0]) return lerp(k[i - 1][1], k[i][1], ease((T - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
}
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── the numbers themselves ──────────────────────────────────────────────────
const NMAX = 10000;
const COMPOSITE = new Uint8Array(NMAX + 1); COMPOSITE[0] = COMPOSITE[1] = 1;
for (let i = 2; i * i <= NMAX; i++) if (!COMPOSITE[i]) for (let j = i * i; j <= NMAX; j += i) COMPOSITE[j] = 1;
const isPrime = n => !COMPOSITE[n];
const isSquare = n => { const r = Math.round(Math.sqrt(n)); return r * r === n; };
const isCube = n => { const r = Math.round(Math.cbrt(n)); return r * r * r === n; };
const PERFECT = new Set([6, 28, 496, 8128]);
const PYRAMIDAL = new Set(); for (let k = 1, s = 0; ; k++) { s += k * k; if (s > NMAX) break; PYRAMIDAL.add(s); }
const isPow10 = n => n === 10 || n === 100 || n === 1000 || n === 10000 || n === 100000;
// A number with two claims wears the rarer uniform (rarer among the first million).
const dressOf = n => isCube(n) ? 'die' : isSquare(n) ? 'tile' : isPrime(n) ? 'cyl' : n % 10 === 0 ? 'ball' : (n & 1) ? 'tunic' : 'skirt';
const familyOf = n => PERFECT.has(n) ? 'perfect' : isCube(n) ? 'cube' : PYRAMIDAL.has(n) ? 'pyr' : isSquare(n) ? 'square' : isPrime(n) ? 'prime' : n % 10 === 0 ? 'round' : '';
const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {
  if (n < 20) return SMALL[n];
  if (n < 100) return TENS[n / 10 | 0] + (n % 10 ? '-' + SMALL[n % 10] : '');
  if (n < 1000) return SMALL[n / 100 | 0] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  return words(n / 1000 | 0) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : '');
}
// Digits of pi by Machin's formula, for the stream that rises from Pi.
function piDigits(count) {
  const one = 10n ** BigInt(count + 10);
  const atanInv = x => { let sum = 0n, term = one / x, n = 1n, sign = 1n; const x2 = x * x; while (term > 0n) { sum += sign * term / n; term /= x2; n += 2n; sign = -sign; } return sum; };
  return (4n * (4n * atanInv(5n) - atanInv(239n))).toString().slice(0, count);
}
const PI_DIGITS = piDigits(1200);

// ── where everyone stands ───────────────────────────────────────────────────
const RAINBOW = ['#e0362c', '#f08419', '#f0c820', '#35a84a', '#2c7ddc', '#4b3fc0', '#9a4cd4'];
const WHITE = '#cbc9c4', BLACK = '#19171f';
function rowsFor(count, r0, along, gap) {
  const rows = []; let cap = 0;
  for (let r = r0; cap < count; r += gap) { const n = Math.floor(TAU * r / along); rows.push({ r, n }); cap += n; }
  let left = count;
  rows.forEach((row, i) => { row.n = i === rows.length - 1 ? left : Math.round(row.n * count / cap); left -= row.n; });
  return rows;
}
const RINGS = [
  { lo: 1, rows: [{ r: 5, n: 10 }], in: 3.9, out: 6.3 },
  { lo: 11, rows: rowsFor(90, 8.5, 2.0, 1.7), in: 7.5, out: 12.9 },
  { lo: 101, rows: rowsFor(900, 16, 1.55, 1.6), in: 15, out: 31.4 },
  { lo: 1001, rows: rowsFor(9000, 35, 1.25, 1.3), in: 34, out: 0 },
  { lo: 10001, rows: [], in: 0, out: 0 },
];
RINGS[3].out = RINGS[3].rows.at(-1).r + 1;
RINGS[4].in = RINGS[3].out + 3;
RINGS[4].rows = rowsFor(90000, RINGS[4].in + 1, 1.15, 1.2);
RINGS[4].out = RINGS[4].rows.at(-1).r + 1;
const R6_IN = RINGS[4].out + 4, R6_OUT = 640, R7_IN = 660, R7_OUT = 2000;
RINGS[0].a0 = PI - 4.5 * TAU / 10;                           // 1 just right of front, 10 just left
RINGS[1].a0 = -TAU / RINGS[1].rows[0].n;                     // 11, 12, 13 face the front
RINGS[2].a0 = 0.6 - 36 / RINGS[2].rows[0].n * TAU;           // 137 stands front right, beyond One and Two
RINGS[3].a0 = 0.3; RINGS[4].a0 = 0.1;
// Home of number n in ring g: {r, a, row}
function homeOf(n) {
  const g = n <= 10 ? 0 : n <= 100 ? 1 : n <= 1000 ? 2 : n <= 10000 ? 3 : 4, R = RINGS[g];
  let j = n - R.lo;
  for (let i = 0; i < R.rows.length; i++) {
    const row = R.rows[i];
    if (j < row.n) return { g, row: i, r: row.r, a: R.a0 + j / row.n * TAU + (g ? i * 0.37 : 0) };
    j -= row.n;
  }
}
const polar = (r, a, y = 0) => new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);

// ── renderer ────────────────────────────────────────────────────────────────
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
const scene = new THREE.Scene();
const FOG_NIGHT = new THREE.Color(0.055, 0.038, 0.125), FOG_MIST = new THREE.Color(0.80, 0.82, 0.92);
scene.fog = new THREE.FogExp2(FOG_NIGHT.clone(), 0.0042);
scene.background = new THREE.Color(0, 0, 0);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 7000);
let composer, bloom, quality = 0;
const DPRS = [Math.min(devicePixelRatio || 1, 1.5), 1, 0.75];
function buildComposer() {
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: quality === 0 ? 4 : 0 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), 0.55, 0.55, 1.0);
  if (quality < 2) composer.addPass(bloom);
  composer.addPass(new OutputPass());
  resize();
}
function resize() {
  const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
  renderer.setPixelRatio(DPRS[quality]);
  renderer.setSize(w, h, false);
  if (composer) { composer.setPixelRatio(DPRS[quality]); composer.setSize(w, h); }
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

// Uniforms shared by every shader in the dream.
const G = {
  uT: { value: 0 }, uReveal: { value: 0 }, uDream: { value: 0 }, uPale: { value: 0 },
  uDance: { value: 0 }, uDu: { value: 0 }, uBow: { value: 0 }, uOutcry: { value: 0 },
  uSwarm: { value: -1 }, uBlow: { value: -1 }, uCtr: { value: new THREE.Vector3() },
  uFlat: { value: 1 }, uWaveR: { value: -1 }, uHi: { value: -1 }, uBowR: { value: 1e9 },
  uFogC: { value: scene.fog.color }, uFogD: { value: 0.0042 }, uPx: { value: 1 },
};
const GLSL_COMMON = `
uniform float uT,uReveal,uDream,uPale,uDance,uDu,uBow,uOutcry,uSwarm,uBlow,uBowR;
uniform vec3 uCtr;
vec3 rotY(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(v.x*c+v.z*s,v.y,-v.x*s+v.z*c);}
// Where a member of the far crowd stands at this moment. pol = (radius, angle, row direction, seed)
void crowdPose(vec4 pol,out vec3 p,out float yaw,out float scl,out float lean,out float fade){
  float r=pol.x,th=pol.y,seed=pol.w;
  th+=pol.z*uDance*(4.0/r)*sin(uDu*0.5236);
  float k=uSwarm<0.?0.:smoothstep(0.,1.,clamp((uSwarm-r*0.012-seed*0.9)/2.8,0.,1.));
  float rb=4.5+seed*17.0;
  th+=k*(2.2+seed*2.0)+k*max(uSwarm,0.)*(0.8+fract(seed*5.7)*1.5);
  float rr=mix(r,rb,k);
  float h=k*(0.6+fract(seed*7.31)*12.0)+k*sin(uT*5.0+seed*50.)*0.4;
  p=vec3(sin(th)*rr,h,cos(th)*rr); p.xz+=uCtr.xz*k;
  yaw=th+3.14159+k*1.2;
  scl=smoothstep(0.,2.5,uReveal-r);
  fade=0.;
  if(uBlow>=0.){float d=length(p-uCtr);fade=smoothstep(0.,0.45,uBlow-d/45.0-seed*0.25);p+=normalize(p-uCtr+vec3(0.,.3,0.))*fade*uBlow*(4.+seed*9.);}
  lean=uBow*0.8*step(r,uBowR)+k*0.9;
  p.y+=abs(sin(uT*8.+seed*40.))*0.28*uOutcry+uDance*0.09*abs(sin(uDu*2.932+seed*6.28));
}`;
// Patches a built-in material: shared uniforms plus optional per-instance tricks.
function patch(mat, o = {}) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, G);
    let vs = sh.vertexShader, fs = sh.fragmentShader;
    if (o.cell) {
      vs = 'attribute vec4 aUvR; attribute float aBend; uniform float uFlat;\n' + vs
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv = aUvR.xy + uv * aUvR.zw;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.z -= aBend * uFlat * position.x * position.x;');
    }
    if (o.face) {
      vs = 'attribute vec2 aFace;\n' + vs.replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv = (uv + aFace) / vec2(6.0, 2.0);');
    }
    if (o.crowd) {
      vs = 'attribute vec4 aPol;\n' + GLSL_COMMON + '\n' + vs
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n vec3 cP; float cYaw,cS,cLean,cFade; crowdPose(aPol,cP,cYaw,cS,cLean,cFade); objectNormal = rotY(objectNormal, cYaw);')
        .replace('#include <begin_vertex>', `vec3 transformed = position * cS * (1.0 - cFade);
          { float c = cos(cLean), s = sin(cLean); transformed.yz = vec2(transformed.y * c - transformed.z * s, transformed.y * s + transformed.z * c); }
          transformed = rotY(transformed, cYaw) + cP;`);
    }
    if (o.pale) fs = 'uniform float uPale;\n' + fs.replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.80,0.86,1.0), uPale * ${o.pale.toFixed(2)});`);
    sh.vertexShader = vs; sh.fragmentShader = fs;
  };
  mat.customProgramCacheKey = () => JSON.stringify(o);
  return mat;
}

// ── drawing helpers ─────────────────────────────────────────────────────────
function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
const col = h => new THREE.Color(h);
const M = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; };
const Grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; };
const lathe = (pts, segs = 20) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), segs);
const std = (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
const glow = (r, g, b, extra = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false, ...extra });
