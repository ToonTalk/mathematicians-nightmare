// ── the player ──────────────────────────────────────────────────────────────
let filmT = 0, clock = 0, playing = false, started = false, ended = false, needSnap = true, lastNow = 0;
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const who = $('who'), lineEl = $('line'), prog = $('prog'), seek = $('seek'), timeEl = $('time'), chapEl = $('chap'), tip = $('tip'), tipText = $('tipText'), bDir = $('bDir'), fact = $('fact');
for (const c of CHAPTERS.slice(1)) { const i = document.createElement('i'); i.style.left = (c.t / TOTAL * 100) + '%'; seek.appendChild(i); }
$('runlen').textContent = `About ${Math.round(TOTAL / 60)} minutes.`;
seek.setAttribute('aria-valuemax', Math.round(TOTAL));
let shownLine = null, shownChap = '';
function showWords(t) {
  const l = roam.on ? null : lineAt(t);
  if (l !== shownLine) {
    shownLine = l;
    if (l) { const role = SCRIPT.roles[l.who || 'narrator']; who.textContent = role.label || ''; lineEl.textContent = l.text; lineEl.className = l.who ? 'said' : ''; }
    else { who.textContent = ''; lineEl.textContent = ''; }
  }
  prog.style.width = (clamp(t / TOTAL) * 100) + '%';
  timeEl.textContent = `${fmt(t)} / ${fmt(TOTAL)}`;
  let ch = ''; for (const c of CHAPTERS) if (t >= c.t) ch = c.name;
  if (ch !== shownChap) { shownChap = ch; chapEl.textContent = ch; }
  seek.setAttribute('aria-valuenow', Math.round(t)); seek.setAttribute('aria-valuetext', `${fmt(t)}, ${ch}`);
}
function hint(text, withDirector) { tipText.textContent = text || ''; bDir.hidden = !withDirector; tip.hidden = !text; }
function setPlaying(p) {
  playing = p; $('bPlay').textContent = p ? 'Pause' : 'Play';
  if (!p) sndStopVoices();
  if (p && snd.ctx && snd.ctx.state === 'suspended') snd.ctx.resume();
  wake();
}
const vol = $('vol');
function setVolume(v, remember = true) {
  snd.vol = clamp(v); vol.value = Math.round(snd.vol * 100); vol.setAttribute('aria-valuetext', vol.value + ' percent');
  for (const id in snd.els) snd.els[id].volume = loudness();
  if (remember) try { localStorage.setItem('nightmare.volume', String(snd.vol)); } catch (e) { /* not remembered, that is all */ }
}
try { const v = parseFloat(localStorage.getItem('nightmare.volume')); if (v >= 0.1 && v <= 1) setVolume(v, false); } catch (e) { }
vol.addEventListener('input', () => { setVolume(vol.value / 100); if (snd.vol > 0 && !snd.on && started) setSound(true); });
function setSound(on) {
  snd.on = on; $('bSound').setAttribute('aria-pressed', on); $('bSound').textContent = on ? 'Sound on' : 'Sound off';
  if (on) { sndInit(); if (snd.ctx.state === 'suspended') snd.ctx.resume(); } else sndStopVoices();
}
function seekTo(t) {
  filmT = clamp(t, 0, TOTAL - 0.05); needSnap = true; ended = false; $('end').hidden = true; snd.done = -1; sndStopVoices(); hideFact();
  if (roam.on) setRoam(false);
}
function begin(withSound) {
  started = true; $('start').hidden = true; $('bar').hidden = false; setSound(withSound); filmT = 0; needSnap = true; setPlaying(true);
}
$('goSound').onclick = () => begin(true);
$('goQuiet').onclick = () => begin(false);
$('bPlay').onclick = () => { if (roam.on) setRoam(false); if (ended) seekTo(0); setPlaying(!playing); };
$('bSound').onclick = () => setSound(!snd.on);
$('bWords').onclick = () => { const off = document.body.classList.toggle('nocap'); $('bWords').setAttribute('aria-pressed', !off); };
$('again').onclick = () => { giveBack(); seekTo(0); setPlaying(true); };
const seekAt = e => { const r = seek.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * TOTAL); };
seek.addEventListener('pointerdown', e => { seek.setPointerCapture(e.pointerId); seekAt(e); });
seek.addEventListener('pointermove', e => { if (e.buttons) seekAt(e); });
seek.addEventListener('keydown', e => { const step = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : e.key === 'PageDown' ? 30 : e.key === 'PageUp' ? -30 : 0; if (step) { e.preventDefault(); seekTo(filmT + step); } });
addEventListener('keydown', e => {
  if (!started) return;
  if (e.key === 'Escape') { hideFact(); giveBack(); return; }
  if (e.target.closest && e.target.closest('button,a,input,#seek')) return;
  if (e.key === ' ') { e.preventDefault(); $('bPlay').click(); }
  else if (e.key === 'ArrowRight') seekTo(filmT + 5); else if (e.key === 'ArrowLeft') seekTo(filmT - 5);
  else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setVolume(snd.vol + (e.key === 'ArrowUp' ? 0.1 : -0.1)); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) sndStopVoices(); });
// controls fade while the film runs
let idleTimer = 0;
function wake() { document.body.classList.remove('idle'); clearTimeout(idleTimer); if (playing && !roam.on) idleTimer = setTimeout(() => document.body.classList.add('idle'), 2800); }
addEventListener('pointermove', wake); addEventListener('pointerdown', wake); addEventListener('keydown', wake);

// ── the viewer's camera: drag while the film plays and it goes on from your side ──
function grab() {
  if (roam.on || free.on || !started || ended) return;
  takeCamera(); hint('You have the camera: drag to look around, scroll or pinch to zoom.', true);
}
function giveBack() { if (!free.on) return; free.on = false; hint(''); }
bDir.onclick = giveBack;

// ── meeting the numbers: stop the film and walk through the assembled dream ─
let roamT = 0, savedT = 0;
function setRoam(on, fromEnd) {
  if (on === roam.on) return;
  free.on = false; hideFact();
  roam.on = on; $('bRoam').textContent = on ? 'Back to the film' : 'Meet the numbers'; $('end').hidden = true;
  if (on) {
    savedT = filmT; setPlaying(false);
    if (fromEnd || S.dream < 0.5 || S.gone || S.mist > 0.1) { roamT = ROAM_T; roam.az = 0.5; roam.el = 0.3; roam.d = 15; roam.c.set(0, 1, 0); needSnap = true; }
    else { roamT = filmT; const v = camP.clone().sub(roam.c.set(0, 1, 0)); roam.d = clamp(v.length(), 3, 400); roam.el = clamp(Math.asin(v.y / v.length()), 0.03, 1.5); roam.az = Math.atan2(v.x, v.z); }
    hint('Drag to turn, scroll or pinch to move in and out. Click any number and it will tell you something about itself.');
  } else { hint(''); filmT = Math.min(savedT, TOTAL - 0.05); needSnap = true; if (filmT >= TOTAL - 0.2) seekTo(0); setPlaying(true); }
  wake();
}
$('bRoam').onclick = () => setRoam(!roam.on);
$('roam2').onclick = () => setRoam(true, true);

// one set of gestures drives whichever camera the viewer holds
const ptrs = new Map(); let dragMoved = 0, pinchD = 0;
const spread = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; };
function zoomBy(f) {
  grab();
  if (roam.on) roam.d = clamp(roam.d * f, 3, 600); else if (free.on) free.zoom = clamp(free.zoom * f, 0.12, 14);
}
canvas.addEventListener('pointerdown', e => { if (!started) return; canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 1) dragMoved = 0; else if (ptrs.size === 2) { pinchD = spread(); dragMoved = 99; } });
canvas.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return;
  const p = ptrs.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; ptrs.set(e.pointerId, [e.clientX, e.clientY]); dragMoved += Math.abs(dx) + Math.abs(dy);
  if (ptrs.size === 1) {
    if (dragMoved <= 6) return;
    grab(); const o = roam.on ? roam : free.on ? free : null; if (!o) return;
    o.az -= dx * 0.006; o.el = clamp(o.el + dy * 0.005, roam.on ? 0.03 : -0.3, 1.5);
  } else if (ptrs.size === 2) { const d = spread(); zoomBy(pinchD / d); pinchD = d; }
});
const KINDS = { die: 'a cube, so it comes as a die', tile: 'a square, so it comes as a tile', cyl: 'a prime, so it comes as a cylinder that nothing can divide', ball: 'a round number, so it comes as a ball', tunic: 'in a plain coat', skirt: 'in a plain gown' };
const ORD = ['first', 'second', 'third'];
let factTimer = 0;
function hideFact() { fact.hidden = true; clearTimeout(factTimer); }
function showFact(a) {
  const n = a.n, extra = [];
  if (a.crown) extra.push('a perfect number, so it wears a crown');
  if (PYRAMIDAL.has(n) && n > 1) extra.push('a pyramidal number');
  if (isPow10(n)) extra.push('a power of ten, so it wears white');
  if (n === 13 || n === 666) extra.push('dressed in black');
  if (n === 137) extra.push('and not at all content with its place');
  $('factN').textContent = n.toLocaleString('en-US'); $('factW').textContent = words(n);
  const f = factFor(n), more = $('factM'), wiki = f.more.every(t => !t.includes('|'));
  $('factT').textContent = f.text;
  more.textContent = wiki ? 'Find out more on Wikipedia: ' : 'Find out more: ';
  f.more.forEach((t, i) => {
    const [label, url] = t.includes('|') ? t.split('|') : [t, wikiUrl(t)], a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; if (i) more.append(' · '); more.append(a);
  });
  $('factD').textContent = `${a.male ? 'A gentleman' : 'A lady'} of the ${ORD[a.g]} circle, ${[KINDS[a.kind], ...extra].join('; ')}.`;
  fact.hidden = false; clearTimeout(factTimer); if (playing && !roam.on) factTimer = setTimeout(hideFact, 16000);
}
$('factX').onclick = hideFact;
fact.addEventListener('pointerenter', () => clearTimeout(factTimer));   // it stays while you read it
fact.addEventListener('pointerleave', () => { clearTimeout(factTimer); if (playing && !roam.on) factTimer = setTimeout(hideFact, 8000); });
function numberAt(e) {
  if (S.dream < 0.5 || S.gone || S.blow >= 0) return null;
  const r = canvas.getBoundingClientRect(), ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  // the first figure the line of sight passes through, each figure being an upright rod with a little slack that grows with distance
  let best = null, bd = 1e9; const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), at = new THREE.Vector3();
  for (const a of A) {
    const d2 = ray.ray.distanceSqToSegment(p0.set(a.x, 0.15, a.z), p1.set(a.x, 1.75, a.z), at), d = at.distanceTo(camera.position), slack = 0.36 + d * 0.01;
    if (d2 < slack * slack && d < bd) { bd = d; best = a; }
  }
  return best;
}
canvas.addEventListener('pointerup', e => {
  if (!ptrs.delete(e.pointerId) || dragMoved > 6 || ptrs.size) return;
  const a = numberAt(e);
  if (!a) { hideFact(); return; }
  showFact(a);
  if (roam.on) { roam.c.set(a.x, 1, a.z); roam.d = Math.min(roam.d, 7); }
});
canvas.addEventListener('pointercancel', e => ptrs.delete(e.pointerId));
canvas.addEventListener('wheel', e => { if (!started) return; e.preventDefault(); zoomBy(Math.exp(e.deltaY * 0.0012)); }, { passive: false });

// ── the loop ────────────────────────────────────────────────────────────────
let slow = 0, frames = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - lastNow) / 1000 || 0.016); lastNow = now;
  clock += dt;
  if (playing && !roam.on) {
    if (!voiceHold(filmT, dt)) filmT += dt;     // the pictures wait for a voice that is running behind
    if (filmT >= TOTAL) { filmT = TOTAL - 0.01; ended = true; setPlaying(false); $('end').hidden = false; document.body.classList.remove('idle'); }
  }
  const t = roam.on ? roamT : filmT;
  direct(t, roam.on ? clock + 1000 : filmT, dt, needSnap); needSnap = false;
  sndTick(filmT, playing && !roam.on); voiceTick(filmT, playing && !roam.on);
  showWords(filmT);
  if (!fact.hidden && !roam.on && (S.dream < 0.5 || S.blow >= 0)) hideFact();   // the numbers have gone
  composer.render();
  // if the machine is struggling, trade sharpness for smoothness
  if (started && ++frames > 90) { slow = slow * 0.95 + (dt > 0.034 ? 1 : 0) * 0.05; if (slow > 0.6 && quality < 2) { quality++; slow = 0; frames = 0; buildComposer(); } }
}
window.__film = { APP, camera, seekTo, setPlaying, begin, setRoam, grab, giveBack, free, factFor, showFact, byN, get T() { return filmT; }, TOTAL, MK, LINE, S, roam, snd, setVolume,
  T_SILENCE, T_SWARM, T_BLOW, audio: { sndInit, note, box, burstNoise, waltzBar, midi, BAR, CUES } };   // the last line is for tools/trailer.mjs
buildComposer();
direct(0, 0, 0.016, true); composer.render();
$('veil').classList.add('gone'); setTimeout(() => $('veil').remove(), 900);
$('start').hidden = false;
requestAnimationFrame(frame);
