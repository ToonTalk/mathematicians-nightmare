"""Record the voices for the film with OpenAI text-to-speech.

Reads src/script.json, records every line in its role's voice (a role with
"voices" is a chorus: each voice is recorded and the takes are mixed), shapes
the sound with ffmpeg, saves narration/<id>.mp4 and writes src/lengths.json.

Raw takes are cached in narration-raw/ by a hash of voice, instructions and
text, so editing one line re-records only that line.

    python tools/narrate.py        # needs OPENAI_API_KEY in the environment
"""
import concurrent.futures as cf
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, 'src', 'script.json')
LENGTHS = os.path.join(ROOT, 'src', 'lengths.json')
OUT = os.path.join(ROOT, 'narration')
RAW = os.path.join(ROOT, 'narration-raw')
FFDIR = os.environ.get('FFMPEG_DIR', r'C:\Program Files\CEWE Creator\CEWE Creator')
FFMPEG, FFPROBE = os.path.join(FFDIR, 'ffmpeg.exe'), os.path.join(FFDIR, 'ffprobe.exe')
MODEL = 'gpt-4o-mini-tts'
RATE = 24000


def speak(voice, text, instructions):
    body = json.dumps({'model': MODEL, 'voice': voice, 'input': text,
                       'instructions': instructions, 'response_format': 'wav'}).encode()
    req = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=body, headers={
        'Authorization': 'Bearer ' + os.environ['OPENAI_API_KEY'], 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()


def take(line, role, voice):
    """One raw recording of a line in one voice; returns its path."""
    key = hashlib.sha1(json.dumps([MODEL, voice, role['instructions'], line['text']]).encode()).hexdigest()[:10]
    raw = os.path.join(RAW, f"{line['id']}-{voice}-{key}.wav")
    if not os.path.exists(raw):
        try:
            data = speak(voice, line['text'], role['instructions'])
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')
            if e.code == 400 and role.get('fallback') and voice != role['fallback']:
                print(f"  {line['id']}: voice {voice} refused; using {role['fallback']}")
                return take(line, role, role['fallback'])
            raise SystemExit(f"{line['id']}: HTTP {e.code}: {msg[:400]}")
        with open(raw, 'wb') as f:
            f.write(data)
    return raw


def duration(path):
    return float(subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                capture_output=True, text=True, check=True).stdout.strip())


def record(line, role):
    voices = role.get('voices') or [role['voice']]
    raws = [take(line, role, v) for v in voices]
    pitch = role.get('pitch', 1)
    out = os.path.join(OUT, line['id'] + '.mp4')
    cmd = [FFMPEG, '-y', '-loglevel', 'error']
    for r in raws:
        cmd += ['-i', r]
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    if len(raws) > 1:
        # A chorus: stretch every take to the length of the first so the voices stay together.
        target = duration(raws[0])
        parts = []
        for i, r in enumerate(raws):
            tempo = max(0.8, min(1.25, duration(r) / target))
            parts.append(f'[{i}:a]{trim},atempo={tempo:.4f},adelay={i * 35}[v{i}]')
        mix = ''.join(f'[v{i}]' for i in range(len(raws)))
        graph = ';'.join(parts) + f';{mix}amix=inputs={len(raws)},aecho=0.8:0.6:45|90:0.25|0.15,loudnorm=I=-17:TP=-1.5:LRA=11[o]'
        cmd += ['-filter_complex', graph, '-map', '[o]']
    else:
        chain = [trim]
        if pitch != 1:
            chain.append(f'asetrate={RATE * pitch:.0f},aresample={RATE},atempo={1 / pitch:.4f}')
        if role.get('echo'):
            chain.append('aecho=0.8:0.75:70|160|320:0.35|0.22|0.12')
        chain.append('loudnorm=I=-17:TP=-1.5:LRA=11')
        cmd += ['-af', ','.join(chain)]
    cmd += ['-ar', str(RATE), '-ac', '1', '-c:a', 'aac', '-b:a', '56k', out]
    subprocess.run(cmd, check=True)
    return line['id'], round(duration(out), 2)


def main():
    if not os.environ.get('OPENAI_API_KEY'):
        raise SystemExit('Set OPENAI_API_KEY first.')
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(RAW, exist_ok=True)
    script = json.load(open(SCRIPT, encoding='utf-8'))
    lines = script['lines']
    lengths = {}
    with cf.ThreadPoolExecutor(6) as pool:
        jobs = [pool.submit(record, l, script['roles'][l.get('who', 'narrator')]) for l in lines]
        for j in cf.as_completed(jobs):
            lid, dur = j.result()
            lengths[lid] = dur
            print(f'  {lid}  {dur:5.2f}s')
    keep = {l['id'] + '.mp4' for l in lines}
    for f in os.listdir(OUT):
        if f not in keep:
            os.remove(os.path.join(OUT, f))
    ordered = {l['id']: lengths[l['id']] for l in lines}
    json.dump(ordered, open(LENGTHS, 'w', encoding='utf-8'), separators=(',', ':'))
    print(f'{len(lines)} clips, {sum(ordered.values()):.0f} s in all')


if __name__ == '__main__':
    sys.exit(main())
