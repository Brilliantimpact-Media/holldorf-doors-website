# Holldorf Doors Website

Website for Holldorf Garage Doors LLC (Baldwin, WI). Built by Brilliant Impact.
Static HTML/CSS/JS, no build step. One page plus `thank-you.html` and `404.html`.

## Pages

| URL | Source |
|---|---|
| `/` | `index.html` (hand-written; shared blocks injected by the build) |
| `/work/` and `/work/<homes, modern, shops-commercial>/` | generated landing pages (SEO title, meta, FAQ + schema) |
| `/free-estimate/` | generated; the estimate form + Door Planner |
| `/thank-you.html`, `/404.html` | hand-written |

## Editing

Shared content lives in one place, then rebuild:

- `data/work.json`: photos, captions, tags, and each work page's SEO copy and FAQs
- `partials/estimate.html`: the estimate form (homepage and `/free-estimate/`)
- `tools/hero_drawing.py`: the hero's shop-drawing SVG
- `tools/build.py`: header, footer, gallery and page templates

```bash
python3 tools/build.py
```

The build rewrites the generated pages and refreshes the blocks in `index.html` between
`<!-- BUILD:name -->` markers. Edit the rest of `index.html` directly.

Scripts: `main.js` (every page: intro, nav, section doors, gallery, troubleshooter),
`builder.js` (Door Builder), `estimate.js` (estimate form + Door Planner).
Photos: `tools/polish_photos.py` regenerates `assets/img/photos/` from `assets/img/original/`.

## Garage-door intro

Plays every time the homepage loads, refreshes included. It's skipped when someone
follows a section link like `/#services` from another page. Click, Esc, Enter or Space skips it. Add `?intro` to the URL to
replay it (the footer has an "Open the door again" link). Visitors with reduced motion
turned on get an instant open.

## Hosting

GitHub Pages: https://brilliantimpact-media.github.io/holldorf-doors-website/
(published from `main`). If the site moves to its own domain, change the `<base href>`
in `404.html` to `/`.

## Estimate form

Until a form service is connected the form opens the visitor's email app, addressed to
holldorfgaragedoors@gmail.com and pre-filled. To send submissions straight to the inbox,
create a Formspree/Web3Forms form and paste its URL into
`<meta name="hd-form-endpoint" content="">` in `index.html`. Successful submits go to
`thank-you.html`.
