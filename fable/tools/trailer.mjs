// Cuts a 30-second trailer from the film itself.
//   node tools/trailer.mjs [workDir] [--frames-only | --audio-only | --encode-only]
// It opens index.html in headless Chrome with a hand-cranked clock, steps the film one frame at a
// time through the shots below and saves each frame; renders the music and effects with the film's
// own synthesizer in an offline audio context; lays the recorded voices over that; and encodes
// trailer/trailer.mp4 with ffmpeg (H.264 + AAC).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2), only = args.find(a => a.startsWith('--')), work = args.find(a => !a.startsWith('--')) || path.join(os.tmpdir(), 'nightmare-trailer');
const FFMPEG = path.join(process.env.FFMPEG_DIR || 'C:/Program Files/CEWE Creator/CEWE Creator', 'ffmpeg.exe');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = 1280, H = 720, FPS = 30, LEN = 30, RATE = 44100, WALTZ_AT = 4.2;
const framesDir = path.join(work, 'frames'), outDir = path.join(root, 'trailer');
fs.mkdirSync(framesDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });

// ── the cut: [starts at, lasts, film time it shows (evaluated in the page), speed] ──
// `beat(x)` moves a film time forward to where the dancers are in step with the trailer's waltz.
const CLIPS = [
  { a: 0.0, d: 4.2, f: 'MK.fall + 0.8' },                           // the study walls fall away
  { a: 4.2, d: 2.2, f: 'LINE.n05.t0 + 8.6', speed: 3 },             // the circles without end
  { a: 6.4, d: 4.0, f: 'LINE.n06.t0 - 0.1' },                       // gentlemen and ladies
  { a: 10.4, d: 2.1, f: 'beat(MK.ballet + 4.2)' },                  // the ballet from above
  { a: 12.5, d: 2.1, f: 'beat(MK.ballet + 10.6)' },                 // … and among the dancers
  { a: 14.6, d: 5.4, f: 'LINE.q01.t0 - 0.15' },                     // SILENCE!
  { a: 20.0, d: 1.7, f: 'LINE.n23.t1 - 1.3' },      // the swarm
  { a: 21.7, d: 3.4, f: 'LINE.p04.t0 - 0.1' },                      // Avaunt!
  { a: 25.1, d: 4.9, f: 'LINE.p05.t0 - 0.75' },                     // waking; the title comes up over the study
];
// voices: [starts at, clip, words shown, where to stop]: 0 = the whole clip; a number = at the first pause after that many seconds;
// [from, to] = at the quietest moment between those seconds (for the chorus, whose echo leaves no real pause)
const VOICES = [
  [1.5, 'n04', 'And in his sleep, the numbers came.', 1.7],
  [6.5, 'n06', 'The odd numbers were gentlemen, and the even numbers ladies.', 0],
  [10.7, 'c01', 'We are the finite numbers!', [1.4, 3.2]],
  [14.75, 'q01', 'SILENCE! One word more, and I shall make you all incommensurable.', 0],
  [21.8, 'p04', 'Avaunt! You are nothing but convenient symbols!', 0],
  [25.85, 'p05', 'So much for Plato!', 0],
];

// ── a little web server and a headless Chrome on the DevTools protocol ──────
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mp4': 'video/mp4', '.json': 'application/json' };
const server = http.createServer((req, res) => req.method === 'POST' ? (() => { const parts = []; req.on('data', d => parts.push(d)); req.on('end', () => { fs.writeFileSync(path.join(work, 'music.raw'), Buffer.concat(parts)); res.writeHead(200); res.end('ok'); }); })() : fs.readFile(path.join(root, decodeURIComponent(req.url.split('?')[0])), (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': TYPES[path.extname(req.url.split('?')[0])] || 'application/octet-stream' }); res.end(d); } }));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function browser(fn) {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'trailer-chrome-')), dbg = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${dbg}`, `--user-data-dir=${prof}`, `--window-size=${W},${H}`, '--hide-scrollbars', '--mute-audio', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
  try {
    let wsUrl; for (let i = 0; i < 60 && !wsUrl; i++) { await sleep(200); try { wsUrl = (await (await fetch(`http://127.0.0.1:${dbg}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch { } }
    const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
    let id = 0; const pending = new Map();
    ws.onclose = () => console.log('(devtools connection closed)'); ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } if (d.method === 'Runtime.exceptionThrown') console.log('PAGE ERROR', d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); };
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const run = async js => { const r = await Promise.race([send('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true }), sleep(90000).then(() => { throw new Error('the page did not answer within 90 s: ' + js.slice(0, 80)); })]); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result.result.value; };
    await send('Runtime.enable'); await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    // the page's clock is cranked by hand, and its sound goes to an offline context that can be rendered to a file
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { let cb = null, now = 0; window.requestAnimationFrame = f => { cb = f; return 1; };
      window.__tick = ms => { now += ms; const f = cb; cb = null; if (f) f(now); };
      window.AudioContext = class extends OfflineAudioContext { constructor() { super(2, ${RATE * LEN}, ${RATE}); } }; })();` });
    await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/index.html` });
    await sleep(3000); console.log('page open'); await run('Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]).then(() => 1)'); console.log('fonts ready');
    return await fn(run, send);
  } finally { chrome.kill(); server.close(); await sleep(400); try { fs.rmSync(prof, { recursive: true, force: true }); } catch { } }
}
const clipTimes = run => run(`(() => { const F = window.__film, { MK, LINE } = F, A = F.audio, W0 = MK.ballet + 0.9;
  return ${JSON.stringify(CLIPS)}.map(c => { const beat = x => W0 + c.a - ${WALTZ_AT} + Math.ceil((x - W0 - c.a + ${WALTZ_AT}) / A.BAR - 1e-6) * A.BAR; return eval(c.f); }); })()`);

// ── pictures ────────────────────────────────────────────────────────────────
async function frames() {
  await browser(async (run, send) => {
    const f0 = await clipTimes(run);
    await run(`(() => {
      const st = document.createElement('style'); st.textContent = \`
        #bar,#cap,#top,#start,#end,#veil{display:none!important} body{cursor:none}
        #tr{position:fixed;inset:0;pointer-events:none;font-family:"Libre Caslon Text",Georgia,serif;color:#f3ead6;text-align:center}
        #trBlack{position:absolute;inset:0;background:#05040c;opacity:0}
        #trTop{position:absolute;left:0;right:0;top:46px;font:600 15px ui-sans-serif,system-ui,"Segoe UI",sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#e8c877;text-shadow:0 1px 8px #000;opacity:0}
        #trSub{position:absolute;left:0;right:0;bottom:56px;margin:0 auto;max-width:30em;font-size:30px;line-height:1.35;font-style:italic;text-wrap:balance;text-shadow:0 0 3px #000,0 1px 10px #000,0 0 26px rgba(0,0,0,.9);opacity:0}
        #trTitle{position:absolute;inset:0;display:grid;place-content:center;opacity:0}
        #trTitle h1{font:400 84px/1.05 "Libre Caslon Display","Libre Caslon Text",Georgia,serif;margin:0;text-shadow:0 2px 30px #000}
        #trTitle i{display:block;width:120px;height:1px;background:#e8c877;margin:26px auto 22px}
        #trTitle p{font-size:28px;font-style:italic;margin:0;text-shadow:0 1px 10px #000}
        #trTitle small{display:block;margin-top:26px;font:600 14px ui-sans-serif,system-ui,"Segoe UI",sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#e8c877}\`;
      document.head.appendChild(st);
      const d = document.createElement('div'); d.id = 'tr';
      d.innerHTML = '<div id="trBlack"></div><div id="trTop">From the story by Bertrand Russell</div><div id="trSub"></div><div id="trTitle"><h1>The Mathematician\\u2019s Nightmare</h1><i></i><p>The vision of Professor Squarepunt</p><small>A film in three dimensions</small></div>';
      document.body.appendChild(d);
      window.__film.begin(false);
      window.__show = (black, top, sub, subText, title) => { const $ = id => document.getElementById(id); $('trBlack').style.opacity = black; $('trTop').style.opacity = top; if (subText !== null) $('trSub').textContent = subText; $('trSub').style.opacity = sub; $('trSub').style.color = document.body.classList.contains('onwhite') ? '#1b1724' : ''; $('trSub').style.textShadow = document.body.classList.contains('onwhite') ? '0 0 12px #fff, 0 0 4px #fff' : ''; $('trTitle').style.opacity = title; };
      return 1; })()`);
    const ramp = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))), win = (t, a, b, e = 0.3) => Math.min(ramp(t, a, a + e), 1 - ramp(t, b - e, b));
    const lens = JSON.parse(fs.readFileSync(path.join(work, 'voices.json'), 'utf8'));   // how long each voice really runs, from the audio pass
    let clip = -1; const t0 = Date.now();
    for (let i = 0; i < LEN * FPS; i++) {
      const t = i / FPS; let js = '';
      while (clip + 1 < CLIPS.length && t >= CLIPS[clip + 1].a - 1e-6) { clip++; js += `__film.seekTo(${f0[clip]});`; }
      const v = VOICES.findIndex(([a, id]) => t >= a - 0.1 && t < a + lens[id] + 0.05);
      const black = Math.max(1 - ramp(t, 0.1, 1.1), 0.74 * ramp(t, 27.0, 27.9), ramp(t, 29.6, 30.0));
      js += `__tick(${1000 / FPS * (CLIPS[clip].speed || 1)}); __show(${black.toFixed(3)}, ${win(t, 0.7, 3.9, 0.6).toFixed(3)}, ${v < 0 || t > 27 ? 0 : win(t, VOICES[v][0] - 0.1, VOICES[v][0] + lens[VOICES[v][1]] + 0.05, 0.15).toFixed(3)}, ${v < 0 ? 'null' : JSON.stringify(VOICES[v][2])}, ${(ramp(t, 27.3, 28.1) * (1 - ramp(t, 29.7, 30.0))).toFixed(3)}); 1`;
      await run(js);
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 93 });
      fs.writeFileSync(path.join(framesDir, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(shot.result.data, 'base64'));
      if (i % 90 === 0) console.log(`frame ${i}/${LEN * FPS}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  });
}

// ── sound ───────────────────────────────────────────────────────────────────
const decode = file => { const b = execFileSync(FFMPEG, ['-loglevel', 'error', '-i', file, '-f', 's16le', '-ac', '1', '-ar', String(RATE), 'pipe:1'], { maxBuffer: 1 << 28 }); return Float32Array.from(new Int16Array(b.buffer, b.byteOffset, b.length >> 1), s => s / 32768); };
function firstPause(x, from) {   // the sample at which the first real silence after `from` seconds begins
  const win = Math.round(RATE * 0.02); let quiet = 0;
  for (let i = Math.round(from * RATE); i + win < x.length; i += win) { let e = 0; for (let j = 0; j < win; j++) e += x[i + j] * x[i + j]; if (Math.sqrt(e / win) < 0.012) { if (++quiet >= 9) return i - 7 * win; } else quiet = 0; }
  return x.length;
}
function quietest(x, from, to) {   // the end of the quietest tenth of a second between two times
  const win = Math.round(RATE * 0.1); let best = 1e9, at = 0;
  for (let i = Math.round(from * RATE); i + win < Math.min(x.length, to * RATE); i += win >> 2) { let e = 0; for (let j = 0; j < win; j++) e += x[i + j] * x[i + j]; if (e < best) { best = e; at = i + win; } }
  return at;
}
async function audio() {
  // 1. music and effects, played by the film's own instruments into an offline context
  const note = await browser(async run => {
    const f0 = await clipTimes(run); console.log('shots at', f0.map(x => +x.toFixed(2)).join(' '));
    return run(`(async () => { const F = window.__film, { MK, LINE } = F, A = F.audio; A.sndInit(); const C = F.snd.ctx, D = F.snd.drones, t0 = performance.now();
      const clips = ${JSON.stringify(CLIPS)}, f0 = ${JSON.stringify(f0)};
      // every sound the film makes inside a shot, at the moment the shot shows it
      clips.forEach((c, i) => { const s = c.speed || 1; for (const q of A.CUES) if (q.t >= f0[i] && q.t < f0[i] + c.d * s) q.fn(c.a + (q.t - f0[i]) / s); });
      A.burstNoise(0.05, 3.0, 180, 60, 0.45, 0.5);                                  // the walls go over
      for (let k = 0; ${WALTZ_AT} + k * A.BAR < 14.3; k++) A.waltzBar(k, ${WALTZ_AT} + k * A.BAR, ${WALTZ_AT} + k * A.BAR < 6.3);
      for (const m of [86, 81, 77, 74]) A.box(14.45, m, 0.12, 2.0);                 // the baton stops the dance
      [[27.3, 50, 0.24], [27.3, 62, 0.2], [27.55, 69, 0.18], [27.8, 74, 0.18], [28.05, 77, 0.17], [28.3, 81, 0.16], [28.65, 86, 0.2]].forEach(([w, m, g]) => A.box(w, m, g, 3.2));
      const env = (g, pts) => { g.gain.setValueAtTime(0, 0); for (const [t, v] of pts) g.gain.linearRampToValueAtTime(v, t); };
      env(D.dream, [[0.6, 0.17], [4.2, 0.15], [5, 0.05], [14.4, 0.05], [14.9, 0], [25.1, 0], [27.2, 0.06], [29.5, 0.06], [30, 0]]);
      env(D.wind, [[0.5, 0.06], [14.6, 0.05], [20, 0.06], [21, 0.13], [24.6, 0.13], [25.1, 0]]);
      env(D.dread, [[14.9, 0], [15.4, 0.12], [19.8, 0.1], [20.2, 0.22], [23.0, 0.22], [23.4, 0]]);
      env(D.crowd, [[19.95, 0], [20.1, 0.26], [23.0, 0.3], [23.2, 0]]);
      env(D.buzz, [[19.95, 0], [20.2, 0.3], [23.0, 0.42], [23.15, 0]]);
      F.snd.buzzOsc.forEach((o, i) => { o.frequency.setValueAtTime([110, 117, 147, 98][i], 20); o.frequency.linearRampToValueAtTime([110, 117, 147, 98][i] * 1.9, 23); });
      F.snd.master.gain.setValueAtTime(0.9, 29.3); F.snd.master.gain.linearRampToValueAtTime(0, 30);
      const buf = await C.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), out = new Int16Array(L.length * 2);
      for (let i = 0; i < L.length; i++) { out[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; out[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
      const r = await fetch('/music', { method: 'POST', body: out.buffer }); return 'rendered ' + L.length + ' samples in ' + Math.round(performance.now() - t0) + ' ms, upload ' + r.status; })()`);
  });
  console.log(note); const mb = fs.readFileSync(path.join(work, 'music.raw')), music = new Int16Array(mb.buffer, mb.byteOffset, mb.length >> 1), N = RATE * LEN;
  // 2. the voices, each at its place; the music steps back a little while anyone speaks
  const voice = new Float32Array(N), lens = {};
  for (const [at, id, , cutAfter] of VOICES) {
    const x = decode(path.join(root, 'narration', id + '.mp4')), end = Array.isArray(cutAfter) ? quietest(x, ...cutAfter) : cutAfter ? firstPause(x, cutAfter) : x.length, fade = Math.round(RATE * (Array.isArray(cutAfter) ? 0.22 : 0.06));
    lens[id] = end / RATE;
    for (let i = 0; i < end && Math.round(at * RATE) + i < N; i++) voice[Math.round(at * RATE) + i] += x[i] * (cutAfter ? Math.min(1, (end - i) / fade) : 1);
  }
  fs.writeFileSync(path.join(work, 'voices.json'), JSON.stringify(lens));
  const out = new Int16Array(N * 2); let envl = 0, peak = 0;
  for (let i = 0; i < N; i++) {
    const a = Math.abs(voice[Math.min(N - 1, i + 2000)]); envl = a > envl ? envl + (a - envl) * 0.002 : envl * 0.99994;       // look a little ahead; let go slowly
    const duck = 1 - 0.45 * Math.min(1, envl * 9);
    for (let c = 0; c < 2; c++) { const v = Math.tanh((music[2 * i + c] / 32768 * 1.3 * duck + voice[i] * 1.05) * 1.1) / 1.1 * 1.05; peak = Math.max(peak, Math.abs(v)); out[2 * i + c] = Math.max(-1, Math.min(1, v)) * 32767; }
  }
  const head = Buffer.alloc(44); head.write('RIFF', 0); head.writeUInt32LE(36 + out.byteLength, 4); head.write('WAVEfmt ', 8); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22);
  head.writeUInt32LE(RATE, 24); head.writeUInt32LE(RATE * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(out.byteLength, 40);
  fs.writeFileSync(path.join(work, 'trailer.wav'), Buffer.concat([head, Buffer.from(out.buffer)]));
  let mp = 0; for (let i = 0; i < music.length; i++) mp = Math.max(mp, Math.abs(music[i]));
  console.log('sound: music peak', (mp / 32768).toFixed(2), 'mix peak', peak.toFixed(2), 'voices', JSON.stringify(lens));
}
function encode() {
  const out = path.join(outDir, 'trailer.mp4');
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.jpg'), '-i', path.join(work, 'trailer.wav'),
    '-c:v', 'libopenh264', '-b:v', '6M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
}
if (!only || only === '--audio-only') await audio();
if (!only || only === '--frames-only') await frames();
if (!only || only === '--encode-only') encode();
process.exit(0);
