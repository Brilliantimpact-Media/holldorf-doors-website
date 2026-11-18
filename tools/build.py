#!/usr/bin/env python3
"""Build the Holldorf Garage Doors pages from shared pieces.

    python3 tools/build.py

Sources (edit these, then rebuild):
  data/work.json          photos, captions, tags, and the SEO copy for each work page
  partials/estimate.html  the estimate form + Door Planner (homepage and /free-estimate/)
  tools/hero_drawing.py   the hero's shop-drawing SVG
  header / footer / gallery markup below

Writes:
  work/index.html                 all work
  work/<slug>/index.html          Homes, Modern, Shops & Commercial landing pages
  free-estimate/index.html        standalone estimate page
  sitemap.xml, robots.txt
and refreshes the blocks in index.html between <!-- BUILD:name --> markers.

SITE / BASE_PATH are the public address. Change both when the site moves to its own domain
(and the <base href> in 404.html).
"""
import html, json, re, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from hero_drawing import build as hero_svg  # noqa: E402
from logo import lockup, plate  # noqa: E402

SITE = 'https://brilliantimpact-media.github.io/holldorf-doors-website/'
VERSION = time.strftime('%Y%m%d%H%M')
PHONE, TEL = '715-928-3002', '+17159283002'
EMAIL = 'holldorfgaragedoors@gmail.com'
FACEBOOK = 'https://www.facebook.com/p/Holldorf-Garage-Doors-LLC-61573275539430/'

data = json.loads((ROOT / 'data/work.json').read_text())
PHOTOS, CATS, ALL = data['photos'], data['categories'], data['all']
esc = lambda t: html.escape(t, quote=True)
amp = lambda t: t.replace('&', '&amp;')
OG_TAGS = '''<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Holldorf Garage Doors: garage doors, hung right. Sales, installation, repairs and openers. Baldwin, WI. 715-928-3002">
<meta name="twitter:image" content="'''+SITE+'''assets/img/og-image.jpg">'''
ON, ON_PAGE = ' class="is-on"', ' class="is-on" aria-current="page"'

BUSINESS = {
    '@type': 'HomeAndConstructionBusiness', 'name': 'Holldorf Garage Doors LLC', 'telephone': '+1-' + PHONE,
    'email': EMAIL, 'url': SITE, 'logo': SITE + 'assets/img/logo-800.webp',
    'address': {'@type': 'PostalAddress', 'addressLocality': 'Baldwin', 'addressRegion': 'WI', 'postalCode': '54002', 'addressCountry': 'US'},
}


# ---------------------------------------------------------------- shared pieces
SPRITE = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-phone" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" d="M4 12h15m-6-6 6 6-6 6"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" d="m4 12.5 5 5L20 6.5"/></symbol>
</svg>'''


def kicker(text):
    return ('<p class="kicker"><span class="kick"><svg class="kick__roof" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">'
            '<path d="M1 19 50 1.5 99 19"/></svg><span class="kick__bay"><span class="kick__text">' + text +
            '</span><span class="kick__door" aria-hidden="true"></span></span></span></p>')


def header(root, home, current=''):
    """home = '' on the homepage (in-page #links), otherwise a relative path to it."""
    cur = lambda k: ' aria-current="page" class="is-active"' if current == k else ''
    work = '#work' if home == '' else f'{root}work/'
    est = '#estimate' if home == '' else f'{root}free-estimate/'
    return f'''<div class="topbar">
  <div class="wrap topbar__in">
    <span><b>Free estimates</b> &middot; Residential &amp; commercial &middot; Baldwin, WI</span>
    <a href="tel:{TEL}"><svg><use href="#i-phone"/></svg> {PHONE}</a>
  </div>
</div>

<header class="site-header" id="top">
  <div class="wrap site-header__in">
    <a class="brand" href="{home or '#top'}" aria-label="Holldorf Garage Doors, home">{lockup()}</a>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="{home}#services">Services</a>
      <a href="{home}#builder">Door Builder</a>
      <a href="{work}"{cur('work')}>Our Work</a>
      <a href="{home}#trouble">Repairs</a>
      <a href="{est}"{cur('estimate')}>Free Estimate</a>
    </nav>
    <a class="btn btn--red btn--sm header-cta" href="tel:{TEL}"><svg><use href="#i-phone"/></svg><span>Call now</span></a>
    <button class="nav-toggle" type="button" aria-controls="nav" aria-expanded="false" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</header>'''


def footer(root, home):
    cats = ''.join(f'<li><a href="{root}work/{c["slug"]}/">{amp(c["name"])}</a></li>' for c in CATS)
    return f'''<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a class="footer__logo" href="{home or '#top'}" aria-label="Holldorf Garage Doors, home">{lockup()}</a>
      <p class="footer__blurb">Garage door sales, installation and repairs. Baldwin, WI.</p>
    </div>
    <ul class="footer__list">
      <li><a href="tel:{TEL}">{PHONE}</a></li>
      <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
      <li><a href="{FACEBOOK}">Facebook</a></li>
    </ul>
    <ul class="footer__list footer__list--2">
      <li><a href="{root}work/">Our work</a></li>{cats}
      <li><a href="{home}#trouble">Repairs</a></li>
      <li><a href="{root}free-estimate/">Free estimate</a></li>
    </ul>
  </div>
  <div class="wrap footer__base">
    <span>&copy; <span id="yr">2026</span> Holldorf Garage Doors LLC</span>
    <a href="{home or './'}?intro" class="replay">Open the door again &uarr;</a>
  </div>
</footer>

<a class="call-bar" href="tel:{TEL}"><svg><use href="#i-phone"/></svg> Call for a free estimate</a>

<div class="lightbox" id="lightbox" hidden>
  <button class="lb-close" type="button" aria-label="Close">&times;</button>
  <button class="lb-nav lb-prev" type="button" aria-label="Previous photo">&lsaquo;</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-nav lb-next" type="button" aria-label="Next photo">&rsaquo;</button>
</div>'''


def figures(root, photos):
    out = []
    for p in photos:
        size = ' g--wide' if p.get('wide') else ' g--tall' if p.get('tall') else ''
        src = f'{root}assets/img/photos/{p["file"]}'
        out.append(f'        <figure class="g{size}" data-tags="{" ".join(p["tags"])}"><button type="button" aria-label="Open photo: {esc(p["caption"])}">'
                   f'<img loading="lazy" decoding="async" src="{src}-800.webp" data-full="{src}-1600.webp" alt="{esc(p["alt"])}" width="{p["w"]}" height="{p["h"]}">'
                   f'</button><figcaption>{esc(p["caption"])}</figcaption></figure>')
    return '\n'.join(out)


def home_work():
    """Homepage: one photo tile per category, each linking to its landing page (like StoneBrook)."""
    tiles = []
    for i, c in enumerate(CATS):
        n = sum(1 for p in PHOTOS if c['tag'] in p['tags'])
        cover = next(p for p in PHOTOS if p['file'] == c['cover'])
        tiles.append(f'''        <a class="mtile mtile--{i + 1}" href="work/{c["slug"]}/">
          <img src="assets/img/photos/{c["cover"]}-1600.webp" alt="{esc(cover["alt"])}" loading="lazy" width="1600" height="{cover["h"] * 2}">
          <span class="mtile__text"><strong>{amp(c["name"])}</strong><span class="mtile__link">View projects <svg><use href="#i-arrow"/></svg></span></span>
        </a>''')
    return f'''  <!-- ============ Work ============ -->
  <section class="section work" id="work">
    <div class="wrap">
      <header class="section-head section-head--center section-head--tight" data-reveal>
        {kicker('Our work')}
        <h2>Doors we've hung.</h2>
        <p>Real doors on homes, shops and pole buildings around Baldwin. Pick a type to see the full set.</p>
      </header>
      <div class="mosaic" data-reveal>
{chr(10).join(tiles)}
      </div>
      <p class="work-ctas" data-reveal><a class="btn btn--dark" href="work/">View all projects <svg><use href="#i-arrow"/></svg></a><a class="btn btn--red" href="#estimate">Get a free estimate</a></p>
    </div>
  </section>
'''


def head(root, title, desc, path, ld=(), noindex=False):
    url = SITE + path
    robots = '\n<meta name="robots" content="noindex, follow">' if noindex else f'\n<link rel="canonical" href="{url}">'
    lds = ''.join('\n<script type="application/ld+json">\n' + json.dumps(x, indent=1) + '\n</script>' for x in ld)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">{robots}
<meta name="theme-color" content="#d7191f">
<!-- Form service address (Formspree, Web3Forms, etc.). Leave empty and the form opens an email instead. -->
<meta name="hd-form-endpoint" content="">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{root}favicon-48.png" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="{root}apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Holldorf Garage Doors: garage doors, hung right. Sales, installation, repairs and openers. Baldwin, WI. 715-928-3002">
<meta name="twitter:image" content="{SITE}assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/site.css?v={VERSION}">
<script>document.documentElement.classList.add('js');</script>{lds}
</head>'''


def page(root, home, *, title, desc, path, body, current='', js=('main',), ld=(), noindex=False):
    scripts = ''.join(f'\n<script src="{root}assets/js/{n}.js?v={VERSION}" defer></script>' for n in js)
    return f'''{head(root, title, desc, path, ld, noindex)}
<body class="inner">
{SPRITE}

<a class="skip-link" href="#main">Skip to content</a>

{header(root, home, current)}

<main id="main">
{body}
</main>

{footer(root, home)}
{scripts}
</body>
</html>
'''


def write(rel, text):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text)
    print('wrote', rel)


def crumbs_ld(items):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList',
            'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + u} for i, (n, u) in enumerate(items)]}


def crumbs_nav(items):
    parts = []
    for i, (name, href) in enumerate(items):
        last = i == len(items) - 1
        parts.append(f'<span aria-current="page">{amp(name)}</span>' if last else f'<a href="{href}">{amp(name)}</a>')
    return '<nav class="crumbs" aria-label="Breadcrumb">' + '<span aria-hidden="true">/</span>'.join(parts) + '</nav>'


def pg_hero(crumbs, kick, h1, intro, root):
    return f'''  <section class="pg-hero">
    <div class="wrap pg-hero__in">
      {crumbs}
      {kicker(kick)}
      <h1>{h1}</h1>
      <p>{intro}</p>
      <div class="hero__ctas">
        <a class="btn btn--red" href="tel:{TEL}"><svg><use href="#i-phone"/></svg> {PHONE}</a>
        <a class="btn btn--ghost" href="{root}free-estimate/">Free estimate <svg><use href="#i-arrow"/></svg></a>
      </div>
    </div>
  </section>
  <div class="tape" aria-hidden="true"></div>'''


def tabs(root, current):
    items = [('all', 'All', f'{root}work/')] + [(c['slug'], amp(c['name']), f'{root}work/{c["slug"]}/') for c in CATS]
    a = ''.join(f'<a href="{u}"{ON_PAGE if k == current else ""}>{n}</a>' for k, n, u in items)
    return f'''  <nav class="work-tabs" aria-label="Project types">
    <div class="wrap"><div class="filters">{a}</div></div>
  </nav>'''


def cta(root, heading):
    return f'''  <section class="cta-band">
    <div class="wrap cta-band__in">
      <h2>{heading}</h2>
      <p>Free estimates around Baldwin and western Wisconsin. Call, or tell us about the door online.</p>
      <div class="hero__ctas">
        <a class="btn btn--red" href="tel:{TEL}"><svg><use href="#i-phone"/></svg> {PHONE}</a>
        <a class="btn btn--ghost" href="{root}free-estimate/">Get a free estimate <svg><use href="#i-arrow"/></svg></a>
      </div>
    </div>
  </section>'''


# ---------------------------------------------------------------- pages
def build_work():
    root = home = '../'
    sections = []
    for c in CATS:
        photos = [p for p in PHOTOS if c['tag'] in p['tags']]
        sections.append(f'''  <section class="section work-cat" id="{c["slug"]}">
    <div class="wrap">
      <header class="work-cat__head" data-reveal>
        <h2><a href="{c["slug"]}/">{amp(c["name"])}</a></h2>
        <p>{esc(c["intro"])}</p>
        <a class="work-bar__more" href="{c["slug"]}/">See {c["label"]} doors <svg><use href="#i-arrow"/></svg></a>
      </header>
      <div class="gallery gallery--sm">
{figures(root, photos)}
      </div>
    </div>
  </section>''')
    body = '\n\n'.join([
        pg_hero(crumbs_nav([('Home', home), ('Our Work', '')]), 'Our work', ALL['h1'], esc(ALL['intro']), root),
        tabs(root, 'all'), '<div id="gallery">', *sections, '</div>', cta(root, 'Like what you see?')])
    write('work/index.html', page(root, home, title=ALL['title'], desc=ALL['meta'], path='work/', body=body, current='work',
                                  ld=[crumbs_ld([('Home', ''), ('Our Work', 'work/')])]))

    for c in CATS:
        root = home = '../../'
        photos = [p for p in PHOTOS if c['tag'] in p['tags']]
        points = ''.join(f'<li><svg><use href="#i-check"/></svg>{esc(t)}</li>' for t in c['points'])
        paras = ''.join(f'<p>{esc(t)}</p>' for t in c['body'])
        faqs = ''.join(f'<details><summary>{esc(f["q"])}</summary><p>{esc(f["a"])}</p></details>' for f in c['faqs'])
        others = ''.join(f'<a href="../{o["slug"]}/">{amp(o["name"])} <svg><use href="#i-arrow"/></svg></a>' for o in CATS if o is not c)
        body = '\n\n'.join([
            pg_hero(crumbs_nav([('Home', home), ('Our Work', '../'), (c['name'], '')]), 'Our work', c['h1'], esc(c['intro']), root),
            tabs(root, c['slug']),
            f'''  <section class="section work-page">
    <div class="wrap">
      <div class="gallery" id="gallery">
{figures(root, photos)}
      </div>
    </div>
  </section>''',
            f'''  <section class="section work-copy">
    <div class="wrap work-copy__grid">
      <div data-reveal>
        {kicker('How we do it')}
        <h2>{amp(c["label"][0].upper() + c["label"][1:])} doors, done right the first time.</h2>
        {paras}
      </div>
      <aside class="work-copy__side" data-reveal>
        <h3>What we install</h3>
        <ul class="checks checks--sm">{points}</ul>
        <p class="work-copy__more">More of our work</p>
        <div class="work-copy__links">{others}</div>
      </aside>
    </div>
  </section>''',
            f'''  <section class="section faq">
    <div class="wrap faq__in" data-reveal>
      {kicker('Questions')}
      <h2>Common questions</h2>
      <div class="faq__list">{faqs}</div>
    </div>
  </section>''',
            cta(root, esc(c['cta']))])
        ld = [
            crumbs_ld([('Home', ''), ('Our Work', 'work/'), (c['name'], f'work/{c["slug"]}/')]),
            {'@context': 'https://schema.org', '@type': 'Service', 'name': c['h1'].replace('&amp;', '&'),
             'serviceType': 'Garage door installation', 'description': c['meta'], 'url': SITE + f'work/{c["slug"]}/',
             'areaServed': 'Baldwin, WI and western Wisconsin', 'provider': BUSINESS,
             'image': [SITE + f'assets/img/photos/{p["file"]}-1600.webp' for p in photos]},
            {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
                {'@type': 'Question', 'name': f['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': f['a']}} for f in c['faqs']]},
        ]
        write(f'work/{c["slug"]}/index.html', page(root, home, title=c['title'], desc=c['meta'], path=f'work/{c["slug"]}/',
                                                    body=body, current='work', ld=ld))


def estimate_block(root, h):
    return (ROOT / 'partials/estimate.html').read_text().replace('{{root}}', root).replace('{{h}}', h)


def build_estimate():
    root = home = '../'
    body = estimate_block(root, 'h1').replace('class="section estimate"', 'class="section estimate estimate--page"', 1)
    write('free-estimate/index.html', page(
        root, home, title='Free Garage Door Estimate | Holldorf Garage Doors, Baldwin WI',
        desc='Get a free garage door estimate from Holldorf Garage Doors in Baldwin, WI. Answer a few quick questions about your new door, repair or opener and we’ll call you back.',
        path='free-estimate/', body=body, current='estimate', js=('main', 'estimate'),
        ld=[crumbs_ld([('Home', ''), ('Free Estimate', 'free-estimate/')])]))


def build_index():
    p = ROOT / 'index.html'
    s = p.read_text()
    blocks = {
        'sprite': SPRITE, 'header': header('', ''), 'work': home_work(), 'estimate': estimate_block('', 'h2'),
        'footer': footer('', '') + f'\n\n<script src="assets/js/builder.js?v={VERSION}" defer></script>\n<script src="assets/js/main.js?v={VERSION}" defer></script>\n<script src="assets/js/estimate.js?v={VERSION}" defer></script>',
        'hero-drawing': hero_svg(),
        'intro-badge': plate(),
    }
    for name, content in blocks.items():
        pat = re.compile(r'(<!-- BUILD:%s -->).*?(<!-- /BUILD:%s -->)' % (re.escape(name), re.escape(name)), re.S)
        assert pat.search(s), name
        sep = '' if name in ('hero-drawing', 'intro-badge') else '\n'
        s = pat.sub(lambda m: m.group(1) + sep + content + sep + m.group(2), s)
    s = re.sub(r'href="assets/css/site\.css(\?v=\d+)?"', f'href="assets/css/site.css?v={VERSION}"', s)
    if '<link rel="canonical"' not in s:
        s = s.replace('<meta name="theme-color"', f'<link rel="canonical" href="{SITE}">\n<meta property="og:url" content="{SITE}">\n<meta name="theme-color"', 1)
    s = s.replace('<meta property="og:image" content="assets/img/og-image.jpg">', f'<meta property="og:image" content="{SITE}assets/img/og-image.jpg">')
    if 'og:image:width' not in s:
        s = s.replace(f'<meta property="og:image" content="{SITE}assets/img/og-image.jpg">', f'<meta property="og:image" content="{SITE}assets/img/og-image.jpg">\n' + OG_TAGS, 1)
    p.write_text(s)
    print('wrote index.html')


def build_seo():
    urls = [''] + ['work/'] + [f'work/{c["slug"]}/' for c in CATS] + ['free-estimate/']
    today = time.strftime('%Y-%m-%d')
    body = ''.join(f'\n  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>' for u in urls)
    write('sitemap.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}\n</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /thank-you.html\n\nSitemap: {SITE}sitemap.xml\n')


if __name__ == '__main__':
    build_index()
    build_work()
    build_estimate()
    build_seo()
