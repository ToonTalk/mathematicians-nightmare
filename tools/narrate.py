"""Record the narration for nightmare.html with OpenAI text-to-speech.

Reads the <script id="narration"> block in nightmare.html, records every line
that is not marked "silent" in its role's voice, shapes it with ffmpeg
(pitch, Pi's thunder echo, loudness), saves narration/<id>.mp4, and writes
the clip lengths into the <script id="narration-lengths"> block.

Raw recordings are cached in narration-raw/ by a hash of voice, instructions
and text, so editing one line re-records only that line.

    python tools/narrate.py            # needs OPENAI_API_KEY in the environment
"""
import concurrent.futures as cf
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'nightmare.html')
OUT = os.path.join(ROOT, 'narration')
RAW = os.path.join(ROOT, 'narration-raw')
FFDIR = os.environ.get('FFMPEG_DIR', r'C:\Program Files\CEWE Creator\CEWE Creator')
FFMPEG, FFPROBE = os.path.join(FFDIR, 'ffmpeg.exe'), os.path.join(FFDIR, 'ffprobe.exe')
MODEL = 'gpt-4o-mini-tts'
RATE = 24000

SCRIPT_RE = re.compile(r'(<script type="application/json" id="narration">)(.*?)(</script>)', re.S)
LENGTHS_RE = re.compile(r'(<script type="application/json" id="narration-lengths">)(.*?)(</script>)', re.S)


def speak(voice, text, instructions):
    body = json.dumps({'model': MODEL, 'voice': voice, 'input': text,
                       'instructions': instructions, 'response_format': 'wav'}).encode()
    req = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=body, headers={
        'Authorization': 'Bearer ' + os.environ['OPENAI_API_KEY'], 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()


def record(line, role):
    voice, pitch = role['voice'], role.get('pitch', 1)
    key = hashlib.sha1(json.dumps([MODEL, voice, role['instructions'], line['text']]).encode()).hexdigest()[:10]
    raw = os.path.join(RAW, f"{line['id']}-{key}.wav")
    if not os.path.exists(raw):
        try:
            data = speak(voice, line['text'], role['instructions'])
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')
            if e.code == 400 and role.get('fallback'):
                print(f"  {line['id']}: voice {voice} refused ({msg[:120]}); using {role['fallback']}")
                return record(line, {**role, 'voice': role['fallback'], 'pitch': role.get('fallbackPitch', 1), 'fallback': None})
            raise SystemExit(f"{line['id']}: HTTP {e.code}: {msg[:400]}")
        with open(raw, 'wb') as f:
            f.write(data)
    chain = []
    if pitch != 1:
        chain.append(f'asetrate={RATE * pitch:.0f},aresample={RATE},atempo={1 / pitch:.4f}')
    if role.get('echo'):
        chain.append('aecho=0.8:0.75:70|160|320:0.35|0.22|0.12')
    chain.append('loudnorm=I=-17:TP=-1.5:LRA=11')
    out = os.path.join(OUT, line['id'] + '.mp4')
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-i', raw, '-af', ','.join(chain),
                    '-ar', str(RATE), '-ac', '1', '-c:a', 'aac', '-b:a', '48k', out], check=True)
    dur = float(subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out],
                               capture_output=True, text=True, check=True).stdout.strip())
    return line['id'], round(dur, 2), voice


def main():
    if not os.environ.get('OPENAI_API_KEY'):
        raise SystemExit('Set OPENAI_API_KEY first.')
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(RAW, exist_ok=True)
    html = open(HTML, encoding='utf-8').read()
    script = json.loads(SCRIPT_RE.search(html).group(2))
    lines = [l for l in script['lines'] if not l.get('silent')]
    lengths = {}
    with cf.ThreadPoolExecutor(6) as pool:
        jobs = [pool.submit(record, l, script['roles'][l.get('who', 'narrator')]) for l in lines]
        for j in cf.as_completed(jobs):
            lid, dur, voice = j.result()
            lengths[lid] = dur
            print(f'  {lid}  {dur:5.2f}s  {voice}')
    keep = {l['id'] + '.mp4' for l in lines}
    for f in os.listdir(OUT):
        if f not in keep:
            os.remove(os.path.join(OUT, f))
    ordered = {l['id']: lengths[l['id']] for l in lines}
    html = LENGTHS_RE.sub(lambda m: m.group(1) + json.dumps(ordered, separators=(',', ':')) + m.group(3), html)
    open(HTML, 'w', encoding='utf-8').write(html)
    print(f'{len(lines)} clips, {sum(ordered.values()):.0f} s in all')


if __name__ == '__main__':
    sys.exit(main())
