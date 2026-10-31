"""Write index.html, the standalone page GitHub Pages serves, from nightmare.html.

nightmare.html is written for claude.ai artifacts, which wrap a page in their own
<!doctype>, <head> and <body>. This adds them: everything before the <canvas> goes
in the head, the rest in the body.

    python tools/build-site.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'nightmare.html'), encoding='utf-8').read()
cut = src.index('<canvas')
head, body = src[:cut].rstrip(), src[cut:].rstrip()
page = f"""<!doctype html>
<!-- Generated from nightmare.html by tools/build-site.py. Edit that file, not this one. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="A narrated 3D animation of Bertrand Russell's story “The Mathematician's Nightmare”: living numbers in rainbow circles around the masked Pi.">
<style>[hidden]{{display:none!important}}</style>
{head}
</head>
<body>
{body}
</body>
</html>
"""
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8', newline='\n').write(page)
print(f'index.html written ({len(page) // 1024} KB)')
