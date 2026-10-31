# The Mathematician's Nightmare

A narrated 3D animation of Bertrand Russell's story "The Mathematician's Nightmare: The Vision of Professor Squarepunt" (in *Nightmares of Eminent Persons*, 1954).

**Watch it:** https://toontalk.github.io/mathematicians-nightmare/

Professor Squarepunt dreams that numbers are living beings, standing in endless concentric circles around Pi, the masked Master of Ceremonies. The tour follows the story: the circles and their uniforms, the ballet and the numbers' ode, their quarrelsome introductions, and the revolt of the prime 137. Afterwards you can explore the plain, click any number to meet it, or find any number up to ten billion.

## How the dream follows the text

- Circles: 1–10, 11–100, 101–1000, and so on. The first seven wear the rainbow; powers of ten wear white; 13 and 666 wear black.
- Uniforms: squares are tiles, cubes are dice, round numbers (multiples of 10) are balls, primes are cylinders, perfect numbers wear crowns. A number in two categories wears the rarer uniform, counted below a million (perfect 4, cubes 100, squares 1,000, primes 78,498, round 100,000).
- Odd numbers are male (straight coats), even numbers female (flared skirts).
- Guesses where Russell is silent: ordinary numbers are plain figures, and circles beyond the seventh are silver.

The narration and the numbers' speeches paraphrase Russell's text rather than quote it.

## Files

- `nightmare.html` is the source: one page, with three.js from jsDelivr. It is written for claude.ai artifacts, which supply the `<head>`.
- `index.html` is generated from it for GitHub Pages: `python tools/build-site.py`.
- `narration/` holds the recorded voices. **The voices are AI-generated** (OpenAI `gpt-4o-mini-tts`), one character per speaker.

## Changing the narration

The script is the `<script id="narration">` JSON block near the top of `nightmare.html`: each line has an id, a speaker and its text, and each speaker has a voice, a pitch and acting instructions. To re-record after editing:

```bash
OPENAI_API_KEY=... python tools/narrate.py   # records changed lines only, writes their lengths into the page
python tools/build-site.py
```

`narrate.py` uses ffmpeg (set `FFMPEG_DIR` if it isn't in the default place). The tour times itself from the clip lengths, so a longer line simply holds its shot longer.
