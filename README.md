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
| `assets/img/original/` | Photos exactly as the client sent them |
| `assets/img/photos/` | Cropped, color-corrected WebP versions (800 and 1600 wide) |
| `tools/polish_photos.py` | Regenerates `photos/` and `og-image.jpg` from `original/` (needs Pillow) |

## Garage-door intro

Plays the first time someone opens the site in a browser session, then is skipped
until the tab is closed. Click, Esc, Enter or Space skips it. Add `?intro` to the URL to
replay it (the footer has an "Open the door again" link). Visitors with reduced motion
turned on get an instant open.

## Estimate form

Until a form service is connected the form opens the visitor's email app, addressed to
holldorfgaragedoors@gmail.com and pre-filled. To send submissions straight to the inbox,
create a Formspree/Web3Forms form and paste its URL into
`<meta name="hd-form-endpoint" content="">` in `index.html`. Successful submits go to
`thank-you.html`.

## Info from the Google listing

- Holldorf Garage Doors LLC, 1200 200th St, Baldwin, WI 54002 (site shows the town only)
- (715) 928-3002 · holldorfgaragedoors@gmail.com
- Residential and commercial installs, spring/cable/off-track repair, openers and
  manual-to-automatic conversions, maintenance, emergency service, free estimates
- Google rating 5.0 from 1 review (not shown on the site yet)

## Confirm with the client before launch

- Service area town list (written as Baldwin + nearby towns; adjust to where they really go)
- Facebook page URL to link in the footer
- Whether to show the street address and hours
- Real domain: add `sitemap.xml`, canonical URL and absolute `og:image` once it's known
