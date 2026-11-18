#!/usr/bin/env python3
"""Render the social share image (the preview when the link is posted) to assets/img/share-card.jpg.

    python3 tools/share_card.py

Builds a 1200x630 card from the site's own pieces (logo mark, shop drawing, fonts, colors)
and screenshots it with headless Chrome. Needs Google Chrome installed and an internet
connection (for the Google Fonts).
"""
import subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from hero_drawing import build as drawing  # noqa: E402
from logo import mark  # noqa: E402

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
W, H = 1200, 630

HTML = '''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: %(W)dpx; height: %(H)dpx; overflow: hidden; }
  body { position: relative; color: #fff; font-family: Barlow, sans-serif; background-color: #15181b;
    background-image: radial-gradient(ellipse 90%% 90%% at 70%% 45%%, transparent 0%%, rgba(10,11,13,.8) 100%%),
      linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
    background-size: 100%% 100%%, 64px 64px, 64px 64px, 16px 16px, 16px 16px; }
  .top { position: absolute; left: 0; right: 0; top: 0; height: 12px; background: #d7191f; }
  .left { position: absolute; left: 64px; top: 70px; width: 560px; }
  .lockup { display: flex; align-items: center; gap: 16px; }
  .lockup svg { width: 74px; height: 65px; --mark-door: #15181b; }
  .hd-mark__house, .hd-mark__panels { fill: #d7191f; } .hd-mark__door { fill: #15181b; } .hd-mark__trim { fill: rgba(0,0,0,.18); }
  .name { font: 800 58px/.82 "Barlow Condensed"; text-transform: uppercase; letter-spacing: .02em; }
  .sub { margin-top: 7px; font: 700 15px/1 Barlow; letter-spacing: .26em; text-transform: uppercase; color: #ff4a4f; }
  h1 { margin-top: 54px; font: 800 96px/.88 "Barlow Condensed"; text-transform: uppercase; }
  h1 span { color: #ff3b40; }
  .what { margin-top: 22px; font: 600 22px/1.2 Barlow; color: #d9dcde; }
  .row { margin-top: 30px; display: flex; align-items: center; gap: 18px; }
  .phone { display: inline-flex; align-items: center; gap: 12px; background: #d7191f; padding: 14px 22px 12px; border-radius: 4px; box-shadow: 0 5px 0 #8e0d12; font: 800 34px/1 "Barlow Condensed"; letter-spacing: .04em; }
  .phone svg { width: 26px; height: 26px; }
  .town { font: 700 15px/1.35 Barlow; letter-spacing: .18em; text-transform: uppercase; color: #9aa2a7; }
  .art { position: absolute; right: -70px; top: 150px; width: 690px; }
  .plan { width: 100%%; height: auto; overflow: visible; }
  .plan .ln { fill: none; stroke: #eceae4; stroke-width: 2.4; stroke-linecap: square; }
  .plan .ln--thin { stroke-width: 1.6; } .plan .ln--hair { stroke-width: .9; stroke: #8d959a; }
  .plan .ln--glass { fill: rgba(255,255,255,.07); } .plan .ln--glint { stroke-width: 1; stroke: #8d959a; }
  .plan .ln--dim { stroke: #ff4a4f; stroke-width: 1.6; } .plan .ln--ext { stroke: #ff4a4f; stroke-width: 1; stroke-opacity: .6; }
  .plan .dim-t { font: 700 18px "Barlow Condensed"; letter-spacing: .06em; fill: #ff4a4f; text-anchor: middle; }
  .plan .callouts { display: none; }
  .tape { position: absolute; left: -20px; right: -20px; bottom: 22px; height: 34px; transform: rotate(-1.2deg); border-block: 4px solid #16191c;
    background: repeating-linear-gradient(-45deg, #f6c300 0 20px, #16191c 20px 40px); box-shadow: 0 6px 14px rgba(0,0,0,.35); }
</style></head><body>
<div class="top"></div>
<div class="left">
  <div class="lockup">%(mark)s<div><div class="name">Holldorf</div><div class="sub">Garage Doors LLC</div></div></div>
  <h1>Garage doors,<br><span>hung right.</span></h1>
  <p class="what">Sales &middot; Installation &middot; Repairs &middot; Openers</p>
  <div class="row">
    <div class="phone"><svg viewBox="0 0 24 24"><path fill="#fff" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>715-928-3002</div>
    <div class="town">Baldwin, WI<br>Free estimates</div>
  </div>
</div>
<div class="art">%(drawing)s</div>
<div class="tape"></div>
</body></html>'''


def main():
    html = HTML % {'W': W, 'H': H, 'mark': mark('m'), 'drawing': drawing()}
    with tempfile.TemporaryDirectory() as tmp:
        page, shot = Path(tmp) / 'card.html', Path(tmp) / 'card.png'
        page.write_text(html)
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', f'--window-size={W},{H}',
                        '--virtual-time-budget=6000', f'--screenshot={shot}', page.as_uri()],
                       check=True, capture_output=True)
        im = Image.open(shot).convert('RGB').crop((0, 0, W, H))
        im.save(ROOT / 'assets/img/share-card.jpg', 'JPEG', quality=88, optimize=True, progressive=True)
    print('wrote assets/img/share-card.jpg', im.size)


if __name__ == '__main__':
    main()
