"""Generate the hero's shop-drawing SVG (a garage front with dimensions and callouts).

    python3 tools/hero_drawing.py   -> prints the <svg>; build.py pastes it into index.html

Every stroke is a <path pathLength="1"> so CSS can "draw" it in with stroke-dashoffset.
Groups carry --d (animation delay) so the drawing builds up in order.
"""


def p(d, cls='ln'):
    return f'<path class="{cls}" pathLength="1" d="{d}"/>'


def rect(x, y, w, h, cls='ln'):
    return p(f'M{x} {y}h{w}v{h}h{-w}z', cls)


def g(delay, *items, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<g{c} style="--d:{delay}s">' + ''.join(items) + '</g>'


def build():
    GROUND = 330
    out = []
    # ground + building
    out.append(g(0, p(f'M30 {GROUND}H930', 'ln ln--ground')))
    out.append(g(.15, p(f'M210 {GROUND}V158M750 {GROUND}V158'),
                 p('M172 166 480 42 788 166'), p('M196 166 480 56 764 166'),
                 p('M172 166h24M764 166h24'), p('M210 158H750', 'ln ln--thin')))
    # door trim + opening
    dx, dy, dw, dh = 304, 176, 352, 154
    out.append(g(.45, rect(dx - 12, dy - 12, dw + 24, dh + 12), rect(dx, dy, dw, dh)))
    # sections, panels, windows
    sec = dh / 4
    items = [p(f'M{dx} {dy + sec * i:.1f}h{dw}', 'ln ln--thin') for i in (1, 2, 3)]
    pw, gap, pad = 35, 8, 8
    for r in range(4):
        y = dy + sec * r + 7
        for c in range(8):
            x = dx + pad + c * (pw + gap)
            if r == 0:
                items.append(rect(x, y, pw, sec - 14, 'ln ln--thin ln--glass'))
                items.append(p(f'M{x + 6} {y + sec - 18}l{pw - 14} {-(sec - 22)}', 'ln ln--glint'))
            else:
                items.append(rect(x, y, pw, sec - 14, 'ln ln--thin'))
                items.append(rect(x + 4, y + 4, pw - 8, sec - 22, 'ln ln--hair'))
    out.append(g(.75, *items))
    # wall lights + handle hardware
    lights = []
    for lx in (222, 726):
        lights.append(rect(lx, 192, 14, 22, 'ln ln--thin'))
        lights.append(p(f'M{lx + 4} 188h6M{lx + 7} 186v6', 'ln ln--thin'))
    out.append(g(1.2, *lights))
    # dimensions (red)
    dims = [
        p(f'M{dx} {GROUND + 6}V{GROUND + 34}M{dx + dw} {GROUND + 6}V{GROUND + 34}', 'ln ln--ext'),
        p(f'M{dx} {GROUND + 26}H{dx + dw / 2 - 40}M{dx + dw / 2 + 40} {GROUND + 26}H{dx + dw}', 'ln ln--dim'),
        p(f'M{dx - 5} {GROUND + 31}l10 -10M{dx + dw - 5} {GROUND + 31}l10 -10', 'ln ln--dim'),
        p(f'M{dx - 18} {dy}H{dx - 44}M{dx - 18} {GROUND}H{dx - 44}', 'ln ln--ext'),
        p(f'M{dx - 34} {dy}V{dy + dh / 2 - 26}M{dx - 34} {dy + dh / 2 + 26}V{GROUND}', 'ln ln--dim'),
        p(f'M{dx - 39} {dy + 5}l10 -10M{dx - 39} {GROUND + 5}l10 -10', 'ln ln--dim'),
    ]
    out.append(g(1.45, *dims))
    out.append(g(1.9, f'<text class="dim-t" x="{dx + dw / 2}" y="{GROUND + 31}">16\'-0"</text>',
                 f'<text class="dim-t" x="{dx - 34}" y="{dy + dh / 2 + 5}" transform="rotate(-90 {dx - 34} {dy + dh / 2})">7\'-0"</text>',
                 cls='fade'))
    # callouts
    calls = [
        ((300, 168), (230, 110), (222, 114), 'end', 'Trim + weather seal'),
        ((540, 172), (700, 90), (708, 95), 'start', 'Torsion springs + cables'),
        ((646, 262), (770, 250), (778, 255), 'start', 'Insulated steel sections'),
        ((646, 324), (770, 312), (778, 317), 'start', 'Opener + safety eyes'),
    ]
    leaders, labels = [], []
    for (ax, ay), (bx, by), (tx, ty), anchor, label in calls:
        leaders.append(p(f'M{ax} {ay}L{bx} {by}', 'ln ln--lead'))
        leaders.append(f'<circle class="dotc" cx="{ax}" cy="{ay}" r="3"/>')
        labels.append(f'<text class="call-t" x="{tx}" y="{ty}" text-anchor="{anchor}">{label}</text>')
    out.append(g(2.0, *leaders, cls='callouts'))
    out.append(g(2.35, *labels, cls='callouts fade'))
    return ('<svg class="plan" viewBox="0 30 960 345" role="img" aria-label="Line drawing of a garage with a 16 by 7 foot '
            'sectional door, labeled with torsion springs, insulated steel sections, opener, and weather seal">'
            + ''.join(out) + '</svg>')


if __name__ == '__main__':
    print(build())
