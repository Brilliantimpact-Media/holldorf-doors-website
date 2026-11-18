"""Holldorf logo, redrawn as clean vector art from the client's sign-style logo.

badge()   the full sign: black/red outline, garage drawing, stars, HOLLDORF / GARAGE DOORS
          (used on the intro garage door)
icon()    the sign shape with just the garage drawing (navbar + favicon)
lockup()  icon + wordmark side by side, sized for the navbar and footer

Text uses the page's Barlow Condensed, so these are meant to be inlined in HTML.
"""

RED, BLACK, WHITE = '#d7191f', '#16191c', '#ffffff'

# The sign outline: a house peak with squared shoulders, like the original logo
SIGN = 'M150 6 262 48V72L294 84V238Q150 252 6 238V84L38 72V48Z'


def _sign_layers(cx=150, cy=130):
    inset = lambda k: f'transform="translate({cx} {cy}) scale({k}) translate({-cx} {-cy})"'
    return (f'<path d="{SIGN}" fill="{BLACK}"/>'
            f'<path d="{SIGN}" fill="{RED}" {inset(.955)}/>'
            f'<path d="{SIGN}" fill="{WHITE}" {inset(.925)}/>')


def _garage(x=150, y=40, s=1.0):
    """Garage drawing: roof, siding on the sides, sectional door with a window row."""
    def T(px, py):
        return f'{x + (px - 150) * s:.1f} {y + (py - 40) * s:.1f}'
    parts = [
        # roof + fascia
        f'<path d="M{T(52, 82)}L{T(150, 40)}L{T(248, 82)}" fill="none" stroke="{BLACK}" stroke-width="{10 * s:.1f}" stroke-linejoin="miter"/>',
        f'<path d="M{T(70, 84)}L{T(150, 52)}L{T(230, 84)}" fill="none" stroke="{BLACK}" stroke-width="{4 * s:.1f}"/>',
        # side walls with siding lines
        f'<path d="M{T(74, 86)}V{T(74, 132).split()[1]}M{T(226, 86)}V{T(226, 132).split()[1]}" stroke="{BLACK}" stroke-width="{4 * s:.1f}"/>',
    ]
    for i in range(5):
        yy = 92 + i * 8
        parts.append(f'<path d="M{T(80, yy)}H{T(100, yy).split()[0]}M{T(200, yy)}H{T(220, yy).split()[0]}" stroke="{BLACK}" stroke-width="{4 * s:.1f}"/>')
    # door frame + door
    parts.append(f'<path d="M{T(104, 132)}V{T(104, 78).split()[1]}H{T(196, 78).split()[0]}V{T(196, 132).split()[1]}" fill="none" stroke="{BLACK}" stroke-width="{4 * s:.1f}"/>')
    parts.append(f'<rect x="{T(110, 84).split()[0]}" y="{T(110, 84).split()[1]}" width="{80 * s:.1f}" height="{48 * s:.1f}" fill="{BLACK}"/>')
    # window row + panel rows (white cut-outs)
    for c in range(4):
        wx = 114 + c * 19
        parts.append(f'<rect x="{T(wx, 88).split()[0]}" y="{T(wx, 88).split()[1]}" width="{15 * s:.1f}" height="{8 * s:.1f}" fill="{WHITE}"/>')
    for r in range(2):
        for c in range(4):
            px, py = 114 + c * 19, 101 + r * 14
            parts.append(f'<rect x="{T(px, py).split()[0]}" y="{T(px, py).split()[1]}" width="{15 * s:.1f}" height="{9 * s:.1f}" fill="none" stroke="{WHITE}" stroke-width="{1.6 * s:.1f}"/>')
    return ''.join(parts)


def _stars():
    star = lambda cx, cy, r: ('<path fill="' + BLACK + '" d="M' + ' '.join(
        f'{cx + (r if i % 2 == 0 else r * .42) * __import__("math").sin(i * 3.14159 / 5):.1f},'
        f'{cy - (r if i % 2 == 0 else r * .42) * __import__("math").cos(i * 3.14159 / 5):.1f}' for i in range(10)) + 'Z"/>')
    return star(46, 112, 9) + star(254, 112, 9)


def badge(cls='hd-badge', title='Holldorf Garage Doors'):
    return (f'<svg class="{cls}" viewBox="0 0 300 256" role="img" aria-label="{title}">'
            + _sign_layers() + _garage() + _stars() +
            f'<text x="150" y="190" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" '
            f'font-size="60" fill="{RED}" textLength="236" lengthAdjust="spacingAndGlyphs">HOLLDORF</text>'
            f'<path d="M34 216h38l4 -5h-42zM228 211h42v5h-38z" fill="{BLACK}"/>'
            f'<text x="150" y="225" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" '
            f'font-size="26" fill="{BLACK}" letter-spacing="3">GARAGE DOORS</text>'
            '</svg>')


def icon(cls='hd-icon'):
    return (f'<svg class="{cls}" viewBox="0 0 300 256" aria-hidden="true">' + _sign_layers()
            + _garage(150, 66, 1.38) + '</svg>')


def mark(cls='hd-mark'):
    """Simple garage mark: gable roof and walls in red, a dark opening with a sectional door.
    Fill colors come from CSS (--mark-fg / --mark-door) so it works on dark and light."""
    door = ''.join(f'<rect x="17" y="{33 + i * 5}" width="30" height="3.2"/>' for i in range(4))
    return (f'<svg class="{cls}" viewBox="0 0 64 56" aria-hidden="true">'
            '<path class="hd-mark__house" d="M32 2.5 1.5 22.5V29H6v25h52V29h4.5v-6.5Z"/>'
            '<path class="hd-mark__trim" d="M32 9.5 8.5 25h47Z"/>'
            '<rect class="hd-mark__door" x="14" y="30" width="36" height="24"/>'
            f'<g class="hd-mark__panels">{door}</g>'
            '</svg>')


def lockup(cls='hd-lockup'):
    """Navbar/footer logo: garage mark on the side, HOLLDORF big, GARAGE DOORS LLC under it."""
    return (f'<span class="{cls}">{mark("hd-lockup__icon")}'
            '<span class="hd-lockup__words"><span class="hd-lockup__name">Holldorf</span>'
            '<span class="hd-lockup__sub">Garage Doors LLC</span></span></span>')


def plate(cls='di-plate'):
    """Steel plate bolted to the intro garage door: mark, wordmark, rule, town."""
    rivets = ''.join(f'<i class="di-plate__rivet di-plate__rivet--{p}"></i>' for p in ('tl', 'tr', 'bl', 'br'))
    return (f'<div class="{cls}" aria-hidden="true">{rivets}'
            f'{mark("di-plate__mark")}'
            '<span class="di-plate__name">Holldorf</span>'
            '<span class="di-plate__sub">Garage Doors LLC</span>'
            '<span class="di-plate__rule"></span>'
            '<span class="di-plate__town">Baldwin, Wisconsin</span>'
            '</div>')


if __name__ == '__main__':
    print(badge())
