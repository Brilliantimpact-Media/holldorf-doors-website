# Holldorf Doors Website

Website for Holldorf Garage Doors LLC (Baldwin, WI). Built by Brilliant Impact.
Static HTML/CSS/JS, no build step. One page plus `thank-you.html` and `404.html`.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole site: intro, hero, services, Door Builder, gallery, repairs troubleshooter, service area, estimate form |
| `assets/css/site.css` | All styles (colors and fonts are the variables at the top) |
| `assets/js/main.js` | Garage-door intro, nav, gallery filter + lightbox, troubleshooter text, estimate form |
| `assets/js/builder.js` | Door Builder: draws the door preview as SVG |
| `assets/img/original/` | Photos and logo exactly as received (logo from their Facebook page) |
| `assets/img/logo-*.webp` | Logo with the white background cut out |
| `assets/img/photos/` | Cropped, color-corrected WebP versions (800 and 1600 wide) |
| `tools/polish_photos.py` | Regenerates `photos/` and `og-image.jpg` from `original/` (needs Pillow) |

## Garage-door intro

Plays the first time someone opens the site in a browser session, then is skipped
until the tab is closed. Click, Esc, Enter or Space skips it. Add `?intro` to the URL to
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
