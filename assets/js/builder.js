/* Holldorf Garage Doors: Door Builder (draws the door on a garage front as SVG) */
(function () {
  'use strict';
  var svg = document.getElementById('door-preview');
  var form = document.getElementById('builder-form');
  if (!svg || !form) return;

  var W = 400, H = 270, GROUND = 244, FT = 12.5; // px per foot
  var FINISH = {
    white:    { base: '#f3f2ee', dark: '#c6c4bc', light: '#ffffff', label: 'White' },
    almond:   { base: '#e6dcc6', dark: '#bdb196', light: '#f6f0e2', label: 'Almond' },
    sandtone: { base: '#c9b590', dark: '#a08c68', light: '#ddcba8', label: 'Sandtone' },
    oak:      { base: 'url(#wood-oak)', dark: '#7a4f27', light: '#d9a46c', glassFrame: '#5c3a1c', label: 'Light oak wood-look' },
    walnut:   { base: 'url(#wood-walnut)', dark: '#3a2011', light: '#a46a42', glassFrame: '#2c180c', label: 'Walnut wood-look' },
    bronze:   { base: '#4b3b2f', dark: '#2f241b', light: '#6a5646', label: 'Bronze' },
    charcoal: { base: '#45494d', dark: '#2a2d30', light: '#62676c', label: 'Charcoal' },
    black:    { base: '#202225', dark: '#0e0f11', light: '#3a3d41', label: 'Black' }
  };
  var SIDING = {
    gray:   { fill: 'url(#lap-gray)',   trim: '#f1f0ec', fascia: '#f1f0ec', label: 'gray lap siding' },
    white:  { fill: 'url(#lap-white)',  trim: '#2a2d30', fascia: '#2a2d30', label: 'white lap siding' },
    tan:    { fill: 'url(#lap-tan)',    trim: '#f4f1ea', fascia: '#f4f1ea', label: 'tan lap siding' },
    blue:   { fill: 'url(#lap-blue)',   trim: '#f1f0ec', fascia: '#f1f0ec', label: 'blue lap siding' },
    sage:   { fill: 'url(#lap-sage)',   trim: '#f1f0ec', fascia: '#f1f0ec', label: 'sage lap siding' },
    batten: { fill: 'url(#batten)',     trim: '#e9e3d6', fascia: '#2b211a', label: 'brown board-and-batten' },
    red:    { fill: 'url(#rib-red)',    trim: '#f1f0ec', fascia: '#f1f0ec', label: 'red steel' },
    steel:  { fill: 'url(#rib-steel)',  trim: '#f1f0ec', fascia: '#3a3f44', label: 'gray steel' },
    black:  { fill: 'url(#rib-black)',  trim: '#151719', fascia: '#151719', label: 'black steel' }
  };
  var STYLE = { raised: 'Raised panel', long: 'Long panel', carriage: 'Carriage house', flush: 'Flush modern', ribbed: 'Commercial ribbed' };
  var WIN = { none: 'no windows', top: 'top-row windows', side: 'side-stack windows', full: 'full-view glass' };
  var SIZE = { '9x7': '9×7 single', '16x7': '16×7 double', '10x10': '10×10 shop', '12x12': '12×12 barn' };

  function lap(id, base, shadow, hi) {
    return '<pattern id="' + id + '" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="' + base + '"/><rect y="7.3" width="10" height="1.7" fill="' + shadow + '"/><rect width="10" height=".8" fill="' + hi + '"/></pattern>';
  }
  function rib(id, base, deep, hi, mid) {
    return '<pattern id="' + id + '" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="' + base + '"/><rect width="2.2" height="10" fill="' + deep + '"/><rect x="2.2" width="1" height="10" fill="' + hi + '"/><rect x="9" width="1" height="10" fill="' + mid + '"/></pattern>';
  }
  function wood(id, a, b, c, d, line) {
    return '<pattern id="' + id + '" width="70" height="12" patternUnits="userSpaceOnUse">' +
      '<rect width="70" height="12" fill="' + a + '"/><rect width="40" height="6" fill="' + b + '"/><rect x="40" width="30" height="6" fill="' + c + '"/>' +
      '<rect y="6" width="22" height="6" fill="' + c + '"/><rect x="22" y="6" width="48" height="6" fill="' + d + '"/>' +
      '<path d="M0 3q17-1.4 35 0t35 0M0 9q24 1.4 46 0t24 0" stroke="' + line + '" stroke-width=".45" fill="none" opacity=".55"/>' +
      '<rect y="5.7" width="70" height=".5" fill="' + line + '" opacity=".5"/></pattern>';
  }

  var DEFS = '<defs>' +
    lap('lap-gray', '#5d666e', '#454c53', '#6c757d') +
    lap('lap-white', '#e7e5df', '#c9c6bd', '#f3f2ee') +
    lap('lap-tan', '#c8b48e', '#a8946f', '#d6c4a0') +
    lap('lap-blue', '#3e5169', '#2d3c4f', '#4c6080') +
    lap('lap-sage', '#7b876c', '#626d55', '#8a967b') +
    '<pattern id="batten" width="18" height="10" patternUnits="userSpaceOnUse"><rect width="18" height="10" fill="#5a4434"/><rect width="3.2" height="10" fill="#6c5442"/><rect x="3.2" width="1" height="10" fill="#3e2e22"/></pattern>' +
    rib('rib-red', '#9c2b22', '#7a1f18', '#b5392e', '#8b251d') +
    rib('rib-steel', '#7c848b', '#5f666c', '#949ca2', '#6f777d') +
    rib('rib-black', '#25292d', '#141618', '#3a3f44', '#1c1f22') +
    wood('wood-walnut', '#6b3f25', '#7a4a2c', '#5e3620', '#734429', '#3e2213') +
    wood('wood-oak', '#b57c45', '#c58c52', '#a86f3b', '#bd8449', '#7a4f27') +
    '<pattern id="stone" width="36" height="16" patternUnits="userSpaceOnUse"><rect width="36" height="16" fill="#8d887f"/>' +
      '<rect x="1" y="1" width="14" height="6" fill="#a9a398"/><rect x="16" y="1" width="19" height="6" fill="#9a958b"/>' +
      '<rect x="1" y="9" width="21" height="6" fill="#b3ada2"/><rect x="23" y="9" width="12" height="6" fill="#a19b90"/></pattern>' +
    '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3740"/><stop offset=".42" stop-color="#5b7083"/><stop offset=".44" stop-color="#26313a"/><stop offset="1" stop-color="#151b20"/></linearGradient>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc0d9"/><stop offset="1" stop-color="#dfe9f0"/></linearGradient>' +
    '<linearGradient id="slab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2bfb6"/><stop offset="1" stop-color="#94918a"/></linearGradient>' +
    '<linearGradient id="eave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
    '</defs>';

  function r(x, y, w, h, fill, extra) {
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function glass(x, y, w, h, frame, lites) {
    var out = r(x - 1.8, y - 1.8, w + 3.6, h + 3.6, frame) + r(x, y, w, h, 'url(#glass)');
    for (var i = 1; i < (lites || 1); i++) out += r(x + w * i / lites - 0.8, y, 1.6, h, frame);
    return out;
  }
  function raisedPanel(x, y, w, h, f) {
    return r(x, y, w, h, f.dark) + r(x, y, w - 1.3, h - 1.3, f.light) + r(x + 1.3, y + 1.3, w - 2.6, h - 2.6, f.base) +
      r(x + 3, y + 3, w - 6, h - 6, f.light, ' opacity=".25"');
  }

  function draw() {
    var o = {};
    ['style', 'finish', 'windows', 'size', 'siding'].forEach(function (k) { o[k] = form.elements[k].value; });
    o.stone = form.elements.stone.checked;
    var f = FINISH[o.finish], s = SIDING[o.siding];
    var frame = f.glassFrame || f.dark;
    var dims = o.size.split('x').map(Number);
    var dw = dims[0] * FT, dh = dims[1] * FT;
    var dx = (W - dw) / 2, dy = GROUND - dh;
    var sections = dims[1] <= 7 ? 4 : dims[1] <= 10 ? 5 : 6;
    var cols = dims[0] >= 16 ? 8 : dims[0] >= 12 ? 6 : dims[0] >= 10 ? 5 : 4;
    if (o.style === 'long') cols = Math.max(2, Math.round(cols / 2));
    var secH = dh / sections;
    var out = DEFS;

    // sky, gable wall, roof edge
    out += r(0, 0, W, H, 'url(#sky)');
    var eaveY = 70, peakY = 10;
    out += '<polygon points="0,' + eaveY + ' 200,' + peakY + ' 400,' + eaveY + ' 400,' + GROUND + ' 0,' + GROUND + '" fill="' + s.fill + '"/>';
    out += '<polygon points="0,' + eaveY + ' 200,' + peakY + ' 400,' + eaveY + ' 400,' + (eaveY + 26) + ' 200,' + (peakY + 26) + ' 0,' + (eaveY + 26) + '" fill="url(#eave)"/>';
    out += '<polyline points="-6,' + (eaveY + 3) + ' 200,' + (peakY - 1) + ' 406,' + (eaveY + 3) + '" fill="none" stroke="' + s.fascia + '" stroke-width="9" stroke-linejoin="miter"/>';
    out += '<polyline points="-6,' + (eaveY + 9) + ' 200,' + (peakY + 5) + ' 406,' + (eaveY + 9) + '" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>';

    // stone wainscot
    if (o.stone) {
      var sh = 30;
      out += r(0, GROUND - sh, W, sh, 'url(#stone)') + r(0, GROUND - sh - 3, W, 3, '#d8d3c8');
    }
    // driveway
    out += r(0, GROUND, W, H - GROUND, '#a7a49b') + r(dx - 16, GROUND, dw + 32, H - GROUND, 'url(#slab)') + r(0, GROUND, W, 1.5, 'rgba(0,0,0,.28)');

    // lanterns
    [dx - 30, dx + dw + 22].forEach(function (lx) {
      if (lx < 6 || lx > W - 14) return;
      var ly = Math.max(eaveY + 30, dy + 4);
      out += r(lx + 2, ly, 4, 3, '#111') + '<path d="M' + lx + ' ' + (ly + 3) + 'h8l-1 13h-6z" fill="#1b1b1b"/>' + r(lx + 2.2, ly + 5, 3.6, 9, '#ffd88a', ' opacity=".95"');
    });

    // trim + door slab
    out += r(dx - 7, dy - 7, dw + 14, dh + 7, s.trim) + r(dx - 1.5, dy - 1.5, dw + 3, dh + 1.5, 'rgba(0,0,0,.4)');
    out += r(dx, dy, dw, dh, f.base);

    var padX = Math.min(6, dw / cols * 0.1), padY = Math.min(5, secH * 0.15);
    var colW = (dw - padX) / cols;
    var half = dw / 2;

    for (var i = 0; i < sections; i++) {
      var sy = dy + i * secH, isTop = i === 0;
      var allGlass = o.windows === 'full';

      if (o.style === 'raised' || o.style === 'long') {
        for (var c = 0; c < cols; c++) {
          var px = dx + padX + c * colW, py = sy + padY, pw = colW - padX, ph = secH - padY * 2;
          var g = allGlass || (o.windows === 'top' && isTop) || (o.windows === 'side' && c === cols - 1);
          out += g ? glass(px + 1.5, py + 1.5, pw - 3, ph - 3, frame) : raisedPanel(px, py, pw, ph, f);
        }
      } else if (o.style === 'carriage') {
        for (var hlf = 0; hlf < 2; hlf++) {
          var hx = dx + hlf * half + padX, hw = half - padX * 2, hy = sy + padY * 0.8, hh = secH - padY * 1.6;
          var cg = allGlass || (o.windows === 'top' && isTop) || (o.windows === 'side' && hlf === 1);
          if (cg) {
            var n = o.windows === 'side' ? 1 : 2, gw = (hw - 4 * (n + 1)) / n;
            for (var k = 0; k < n; k++) out += glass(hx + 4 + k * (gw + 4) + (o.windows === 'side' ? hw * 0.45 : 0), hy + 2, o.windows === 'side' ? hw * 0.5 : gw, hh - 4, frame, 3);
          } else {
            out += r(hx, hy, hw, hh, f.dark, ' opacity=".55"') + r(hx + 1.2, hy + 1.2, hw - 2.4, hh - 2.4, f.base);
            for (var gx = hx + 8; gx < hx + hw - 4; gx += 8) out += r(gx, hy + 1.2, 0.8, hh - 2.4, f.dark, ' opacity=".35"');
          }
        }
      } else {
        // flush / ribbed slabs
        if (o.style === 'ribbed') out += r(dx, sy + secH * 0.33, dw, 0.8, f.dark, ' opacity=".7"') + r(dx, sy + secH * 0.66, dw, 0.8, f.dark, ' opacity=".7"');
        else out += r(dx, sy + secH * 0.5, dw, 0.5, f.dark, ' opacity=".35"');
        var lh = secH * 0.5, ly = sy + (secH - lh) / 2, lw;
        if (o.windows === 'top' && (o.style === 'ribbed' ? i === Math.floor(sections / 2) - 1 : isTop)) {
          var nl = Math.max(2, Math.round(dims[0] / 4));
          lw = dw / nl * 0.62;
          for (var q = 0; q < nl; q++) out += glass(dx + (q + 0.5) * dw / nl - lw / 2, ly, lw, lh, frame);
        } else if (o.windows === 'side') {
          lw = Math.min(dw * 0.2, 40);
          out += glass(dx + dw - lw - 8, ly, lw, lh, frame);
        } else if (allGlass) {
          lw = dw / 2 - 12;
          out += glass(dx + 8, sy + secH * 0.14, lw, secH * 0.72, frame) + glass(dx + dw / 2 + 4, sy + secH * 0.14, lw, secH * 0.72, frame);
        }
      }
      // section seam (lighter on carriage doors so they read as one piece)
      if (!isTop) out += r(dx, sy - 0.6, dw, o.style === 'carriage' ? 0.9 : 1.6, f.dark, o.style === 'carriage' ? ' opacity=".6"' : '') + r(dx, sy + 1, dw, 0.7, f.light, ' opacity=".5"');
    }

    if (o.style === 'carriage') {
      out += r(dx + half - 0.7, dy, 1.4, dh, f.dark);
      var sw = Math.min(30, half * 0.36), hingeY = [dy + secH * 0.55, dy + dh - secH * 0.6];
      hingeY.forEach(function (y) {
        out += '<path d="M' + (dx + 3) + ' ' + y + 'h' + sw + 'l4 1.3-4 1.3h-' + sw + 'z" fill="#111"/>';
        out += '<path d="M' + (dx + dw - 3) + ' ' + y + 'h-' + sw + 'l-4 1.3 4 1.3h' + sw + 'z" fill="#111"/>';
      });
      var hcY = dy + dh * 0.5;
      out += r(dx + half - 7, hcY, 2.4, 13, '#111') + r(dx + half + 4.6, hcY, 2.4, 13, '#111');
    }

    out += r(dx, GROUND - 2, dw, 2, '#151515') + r(dx, dy, dw, 4, 'rgba(0,0,0,.2)');
    svg.innerHTML = out;

    var summary = SIZE[o.size] + ' · ' + STYLE[o.style] + ' · ' + f.label + ' · ' + WIN[o.windows];
    var wall = s.label + (o.stone ? ' with stone' : '');
    document.getElementById('build-summary').textContent = summary + ' · on ' + wall;
    var h = 0, key = JSON.stringify(o);
    for (var j = 0; j < key.length; j++) h = (h * 31 + key.charCodeAt(j)) % 9000;
    document.getElementById('ticket-no').textContent = '#HD-' + (1000 + h);
    svg.setAttribute('aria-label', 'Preview: ' + summary + ' on ' + wall);
    form.dataset.summary = summary;
  }

  form.addEventListener('change', draw);
  draw();

  document.getElementById('quote-build').addEventListener('click', function () {
    if (window.hdSetBuild) window.hdSetBuild(form.dataset.summary);
  });
})();
