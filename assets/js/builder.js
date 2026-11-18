/* Holldorf Garage Doors: Door Builder (draws the door as SVG) */
(function () {
  'use strict';
  var svg = document.getElementById('door-preview');
  var form = document.getElementById('builder-form');
  if (!svg || !form) return;

  var W = 400, H = 260, GROUND = 232, FT = 13; // 13 px per foot
  var FINISH = {
    white:    { base: '#f3f2ee', dark: '#c9c7bf', light: '#ffffff', label: 'White' },
    almond:   { base: '#e6dcc6', dark: '#bfb398', light: '#f6f0e2', label: 'Almond' },
    walnut:   { base: 'url(#wood)', flat: '#6b3f25', dark: '#3a2011', light: '#a46a42', label: 'Walnut wood-look' },
    charcoal: { base: '#45494d', dark: '#2a2d30', light: '#62676c', label: 'Charcoal' },
    black:    { base: '#202225', dark: '#0e0f11', light: '#3a3d41', label: 'Black' }
  };
  var SIDING = {
    gray:  { fill: 'url(#lap-gray)', trim: '#f1f0ec', soffit: '#ecebe6', label: 'gray lap siding' },
    white: { fill: 'url(#lap-white)', trim: '#2a2d30', soffit: '#f6f5f1', label: 'white lap siding' },
    red:   { fill: 'url(#rib-red)', trim: '#f1f0ec', soffit: '#f1f0ec', label: 'red steel' },
    black: { fill: 'url(#rib-black)', trim: '#151719', soffit: '#2a2d30', label: 'black steel' }
  };
  var STYLE = { raised: 'Raised panel', carriage: 'Carriage house', flush: 'Flush modern', ribbed: 'Commercial ribbed' };
  var WIN = { none: 'no windows', top: 'top-row windows', side: 'side-stack windows', full: 'full-view glass' };
  var SIZE = { '9x7': '9×7 single', '16x7': '16×7 double', '10x10': '10×10 shop', '12x12': '12×12 barn' };

  var DEFS =
    '<defs>' +
    '<pattern id="lap-gray" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="#5d666e"/><rect y="7.4" width="10" height="1.6" fill="#454c53"/><rect y="0" width="10" height="1" fill="#6c757d"/></pattern>' +
    '<pattern id="lap-white" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="#e7e5df"/><rect y="7.4" width="10" height="1.6" fill="#c9c6bd"/></pattern>' +
    '<pattern id="rib-red" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#9c2b22"/><rect x="0" width="2.2" height="10" fill="#7a1f18"/><rect x="2.2" width="1" height="10" fill="#b5392e"/><rect x="9" width="1" height="10" fill="#8b251d"/></pattern>' +
    '<pattern id="rib-black" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#25292d"/><rect x="0" width="2.2" height="10" fill="#141618"/><rect x="2.2" width="1" height="10" fill="#3a3f44"/><rect x="9" width="1" height="10" fill="#1c1f22"/></pattern>' +
    '<pattern id="wood" width="60" height="14" patternUnits="userSpaceOnUse">' +
      '<rect width="60" height="14" fill="#6b3f25"/><rect width="34" height="7" fill="#7a4a2c"/><rect x="34" width="26" height="7" fill="#5e3620"/>' +
      '<rect y="7" width="18" height="7" fill="#5a331e"/><rect x="18" y="7" width="42" height="7" fill="#734429"/>' +
      '<path d="M0 3.5q15-1.5 30 0t30 0M0 10.5q20 1.5 40 0t20 0" stroke="#4a2a17" stroke-width=".5" fill="none" opacity=".6"/>' +
      '<rect y="6.6" width="60" height=".6" fill="#3e2213" opacity=".55"/></pattern>' +
    '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3740"/><stop offset=".42" stop-color="#55697a"/><stop offset=".44" stop-color="#26313a"/><stop offset="1" stop-color="#151b20"/></linearGradient>' +
    '<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="slab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b6ad"/><stop offset="1" stop-color="#8f8c84"/></linearGradient>' +
    '</defs>';

  function r(x, y, w, h, fill, extra) {
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function glass(x, y, w, h, frame) {
    return r(x - 1.6, y - 1.6, w + 3.2, h + 3.2, frame) + r(x, y, w, h, 'url(#glass)');
  }
  function panel(x, y, w, h, f) {
    // raised panel: dark bevel bottom/right, light bevel top/left
    return r(x, y, w, h, f.dark) + r(x, y, w - 1.4, h - 1.4, f.light) + r(x + 1.4, y + 1.4, w - 2.8, h - 2.8, f.base);
  }

  function draw() {
    var o = {};
    ['style', 'finish', 'windows', 'size', 'siding'].forEach(function (k) { o[k] = form.elements[k].value; });
    var f = FINISH[o.finish], s = SIDING[o.siding];
    var dims = o.size.split('x').map(Number);
    var dw = dims[0] * FT, dh = dims[1] * FT;
    var dx = (W - dw) / 2, dy = GROUND - dh;
    var sections = dims[1] <= 7 ? 4 : dims[1] <= 10 ? 5 : 6;
    var cols = dims[0] >= 16 ? 8 : dims[0] >= 12 ? 6 : dims[0] >= 10 ? 5 : 4;
    var secH = dh / sections;
    var frameColor = f.dark;
    var out = DEFS;

    // wall, soffit, ground
    out += r(0, 0, W, H, s.fill);
    out += r(0, 0, W, 20, s.soffit) + r(0, 20, W, 3, 'rgba(0,0,0,.25)') + r(0, 23, W, 24, 'url(#shade)');
    out += r(0, GROUND, W, H - GROUND, '#a7a49b') + r(dx - 14, GROUND, dw + 28, H - GROUND, 'url(#slab)') + r(0, GROUND, W, 1.5, 'rgba(0,0,0,.25)');

    // lights beside the door
    [dx - 30, dx + dw + 22].forEach(function (lx) {
      if (lx < 6 || lx > W - 14) return;
      var ly = Math.max(40, dy - 4);
      out += r(lx + 2, ly, 4, 4, '#111') + '<path d="M' + lx + ' ' + (ly + 4) + 'h8l-1 12h-6z" fill="#1b1b1b"/>' + r(lx + 2, ly + 6, 4, 8, '#ffd88a', ' opacity=".9"');
    });

    // trim + door
    out += r(dx - 7, dy - 7, dw + 14, dh + 7, s.trim) + r(dx - 1.5, dy - 1.5, dw + 3, dh + 1.5, 'rgba(0,0,0,.35)');
    out += r(dx, dy, dw, dh, f.base);

    var padX = Math.min(6, dw / cols * 0.12), padY = Math.min(5, secH * 0.16);
    var colW = (dw - padX) / cols;

    for (var i = 0; i < sections; i++) {
      var sy = dy + i * secH;
      var isTop = i === 0, isBottom = i === sections - 1;

      if (o.style === 'raised' || o.style === 'carriage') {
        for (var c = 0; c < cols; c++) {
          var px = dx + padX + c * colW, py = sy + padY, pw = colW - padX, ph = secH - padY * 2;
          var useGlass = (o.windows === 'top' && isTop) ||
                         (o.windows === 'side' && c === cols - 1) ||
                         (o.windows === 'full' && !isBottom);
          out += useGlass ? glass(px + 1.5, py + 1.5, pw - 3, ph - 3, f.light) : panel(px, py, pw, ph, f);
        }
      } else {
        // flush / ribbed slabs
        if (o.style === 'ribbed') {
          out += r(dx, sy + secH * 0.33, dw, 0.8, f.dark, ' opacity=".7"') + r(dx, sy + secH * 0.66, dw, 0.8, f.dark, ' opacity=".7"');
        }
        var lw, lh = secH * 0.52, ly2 = sy + (secH - lh) / 2;
        if (o.windows === 'top' && (o.style === 'ribbed' ? i === 1 : isTop)) {
          var n = Math.max(2, Math.round(cols / 2));
          lw = dw / n * 0.62;
          for (var k = 0; k < n; k++) {
            var cx = dx + (k + 0.5) * dw / n;
            out += glass(cx - lw / 2, ly2, lw, lh, f.dark);
          }
        } else if (o.windows === 'side') {
          lw = Math.min(dw * 0.2, 40);
          out += glass(dx + dw - lw - 7, ly2, lw, lh, f.dark);
        } else if (o.windows === 'full' && !isBottom) {
          lw = dw / 2 - 12;
          out += glass(dx + 8, ly2 - lh * 0.2, lw, lh * 1.4, f.dark) + glass(dx + dw / 2 + 4, ly2 - lh * 0.2, lw, lh * 1.4, f.dark);
        }
      }
      // section seam
      if (!isTop) out += r(dx, sy - 0.6, dw, 1.6, f.dark) + r(dx, sy + 1, dw, 0.7, f.light, ' opacity=".6"');
    }

    if (o.style === 'carriage') {
      out += r(dx + dw / 2 - 0.6, dy, 1.2, dh, f.dark);
      var hw = Math.min(26, dw * 0.16), hy = [dy + secH * 1.2, dy + dh - secH * 0.8];
      hy.forEach(function (y) {
        out += r(dx + 4, y, hw, 2.2, '#111') + '<circle cx="' + (dx + 4 + hw) + '" cy="' + (y + 1.1) + '" r="1.8" fill="#111"/>';
        out += r(dx + dw - 4 - hw, y, hw, 2.2, '#111') + '<circle cx="' + (dx + dw - 4 - hw) + '" cy="' + (y + 1.1) + '" r="1.8" fill="#111"/>';
      });
      var hcY = dy + dh * 0.55;
      out += r(dx + dw / 2 - 6, hcY, 2.2, 12, '#111') + r(dx + dw / 2 + 3.8, hcY, 2.2, 12, '#111');
    }

    // bottom seal + shadow under the header
    out += r(dx, GROUND - 2, dw, 2, '#151515') + r(dx, dy, dw, 4, 'rgba(0,0,0,.18)');
    svg.innerHTML = out;

    var summary = SIZE[o.size] + ' · ' + STYLE[o.style] + ' · ' + f.label + ' · ' + WIN[o.windows];
    document.getElementById('build-summary').textContent = summary + ' · on ' + s.label;
    var h = 0, key = JSON.stringify(o);
    for (var j = 0; j < key.length; j++) h = (h * 31 + key.charCodeAt(j)) % 9000;
    document.getElementById('ticket-no').textContent = '#HD-' + (1000 + h);
    svg.setAttribute('aria-label', 'Preview: ' + summary + ' on ' + s.label);
    form.dataset.summary = summary;
  }

  form.addEventListener('change', draw);
  draw();

  document.getElementById('quote-build').addEventListener('click', function () {
    if (window.hdSetBuild) window.hdSetBuild(form.dataset.summary);
  });
})();
