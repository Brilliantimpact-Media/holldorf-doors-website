"""Polish the job-site photos for the web.

Reads assets/img/original/*.jpg, crops away most of the bare dirt / house-wrap,
lifts contrast and color a touch, sharpens, and writes WebP at two widths.

    python3 tools/polish_photos.py
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/img/original"
OUT = ROOT / "assets/img/photos"

# original file -> (web name, crop box as (top, bottom) in source pixels)
PHOTOS = {
    "8.jpg":  ("wood-look-modern-doors",    (0, 1360)),
    "2.jpg":  ("almond-carriage-gable",     (60, 1180)),
    "5.jpg":  ("walnut-raised-panel-pair",  (300, 1400)),
    "10.jpg": ("black-glass-modern",        (230, 1300)),
    "6.jpg":  ("charcoal-flush-side-lites", (250, 1290)),
    "1.jpg":  ("white-carriage-detached",   (230, 1260)),
    "9.jpg":  ("black-shop-walnut-doors",   (0, 1240)),
    "7.jpg":  ("pole-building-white-door",  (300, 1360)),
    "4.jpg":  ("red-barn-commercial",       (250, 1760)),
    "3.jpg":  ("red-barn-door-and-entry",   (0, 1700)),
    # from the Facebook page (Sept 20 post)
    "fb-wood-triple.jpg": ("wood-look-triple-garage", (190, 1250)),
}


def polish(im: Image.Image) -> Image.Image:
    im = ImageOps.autocontrast(im, cutoff=0.4, preserve_tone=True)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Color(im).enhance(1.08)
    return im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=3))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for src, (name, (top, bottom)) in PHOTOS.items():
        im = ImageOps.exif_transpose(Image.open(SRC / src)).convert("RGB")
        im = polish(im.crop((0, top, im.width, min(bottom, im.height))))
        for w in (1600, 800):
            r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            r.save(OUT / f"{name}-{w}.webp", "WEBP", quality=80, method=6)
        print(f"{src:7} -> {name}  {im.width}x{im.height}")
    before_after()
    # The social share image is made by tools/share_card.py


def before_after():
    """Aug 2 Facebook before/after (phone story frames): crop the photo band below his
    BEFORE/After label boxes. Shown with a Before/After toggle, so no alignment needed."""
    box = (0, 800, 1152, 1290)
    for name, src in (("before-after-before", "fb-ba-b.jpg"), ("before-after-after", "fb-ba-a.jpg")):
        im = polish(Image.open(SRC / src).convert("RGB").crop(box))
        for w in (1152, 700):
            r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            r.save(OUT / f"{name}-{w}.webp", "WEBP", quality=82, method=6)
        print("before/after ->", name, im.size)


if __name__ == "__main__":
    main()
