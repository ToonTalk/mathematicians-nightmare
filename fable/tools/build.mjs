// Builds the film from src/: nightmare.html (the artifact page, no doctype) and index.html (stand-alone).
//   node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const parts = fs.readdirSync(path.join(root, 'src')).filter(f => /^\d\d-.*\.js$/.test(f)).sort();
const js = parts.map(f => `// ───── ${f} ─────\n` + src(f)).join('\n');
const lengths = fs.existsSync(path.join(root, 'src', 'lengths.json')) ? src('lengths.json') : '{}';

// Fail fast on a syntax error: check the module as .mjs so node parses it strictly.
const check = path.join(root, 'build-check.mjs');
fs.writeFileSync(check, js);
try { execFileSync(process.execPath, ['--check', check], { stdio: 'inherit' }); } finally { fs.rmSync(check, { force: true }); }

const page = `${src('head.html')}
<script type="application/json" id="script">${JSON.stringify(JSON.parse(src('script.json')))}</script>
<script type="application/json" id="lengths">${lengths.trim()}</script>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module">
${js}
</script>
`;
fs.writeFileSync(path.join(root, 'nightmare.html'), page);
fs.writeFileSync(path.join(root, 'index.html'),
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>[hidden]{display:none!important}body{margin:0}</style>\n</head>\n<body>\n${page}</body>\n</html>\n`);
console.log(`built: ${parts.length} parts, ${(page.length / 1024).toFixed(0)} KB`);
