/* Holldorf Garage Doors: page behavior */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Garage door intro ---------- */
  function heroIn() { root.classList.add('hero-in'); }
  var intro = $('#door-intro');
  if (root.classList.contains('intro') && intro) {
    var finished = false, started = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      intro.classList.add('is-done');
      try { sessionStorage.setItem('hd-intro', '1'); } catch (e) {}
      setTimeout(function () {
        root.classList.remove('intro');
        intro.remove();
        if (location.search.indexOf('intro') > -1) history.replaceState(null, '', location.pathname + location.hash);
      }, 600);
    };
    var lift = function () {
      if (started) return;
      started = true;
      intro.classList.add('is-running');
      setTimeout(heroIn, reduced ? 0 : 900);
      setTimeout(finish, reduced ? 50 : 2650);
    };
    var skip = function () { if (!started) lift(); heroIn(); finish(); };
    intro.addEventListener('click', skip);
    document.addEventListener('keydown', function k(e) {
      if (finished) return document.removeEventListener('keydown', k);
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
    });
    // Wait for the hero photo (max 1.2s) so the door opens onto a finished page.
    var heroImg = $('.hero__bg img');
    var go = function () { setTimeout(lift, reduced ? 0 : 450); };
    if (heroImg && !heroImg.complete) {
      var t = setTimeout(go, 1200);
      heroImg.addEventListener('load', function () { clearTimeout(t); go(); }, { once: true });
    } else go();
  } else {
    heroIn();
  }

  /* ---------- Header + nav ---------- */
  var header = $('.site-header'), nav = $('#nav'), toggle = $('.nav-toggle');
  var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });
  });

  // Highlight the section you're in
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('a', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !links[en.target.id]) return;
        $$('a', nav).forEach(function (a) { a.classList.remove('is-active'); });
        links[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); rev.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) { rev.observe(el); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Gallery: filter + lightbox ---------- */
  var figs = $$('#gallery .g');
  $$('.filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.filters button').forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      var f = btn.dataset.filter;
      figs.forEach(function (fig) {
        var show = f === 'all' || fig.dataset.tags.split(' ').indexOf(f) > -1;
        fig.hidden = !show;
        if (show) { fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = ''; }
      });
    });
  });

  var lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), cur = 0, lastFocus = null;
  var visible = function () { return figs.filter(function (f) { return !f.hidden; }); };
  var show = function (i) {
    var list = visible();
    cur = (i + list.length) % list.length;
    var img = $('img', list[cur]);
    lbImg.src = img.dataset.full;
    lbImg.alt = img.alt;
    lbCap.textContent = $('figcaption', list[cur]).textContent;
  };
  var openLb = function (fig) {
    lastFocus = document.activeElement;
    show(visible().indexOf(fig));
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  };
  var closeLb = function () {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  figs.forEach(function (fig) { $('button', fig).addEventListener('click', function () { openLb(fig); }); });
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
  $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });

  /* ---------- Troubleshooter ---------- */
  var SYM = {
    bang: {
      level: ['call', 'Call us'], title: 'Broken spring',
      cause: 'A torsion spring snapped. That bang is the spring letting go, and without it the door weighs 150 to 300+ pounds dead.',
      check: 'Look above the door for a spring with a gap in the coils. Unplug the opener so it doesn’t strain trying to lift.',
      dont: 'Don’t run the opener, lift the door by hand, or touch the spring, cables or bottom brackets. They’re still under load.'
    },
    hum: {
      level: ['check', 'Check first'], title: 'Opener can’t lift the door',
      cause: 'Most often a broken spring (the opener isn’t built to lift the door’s full weight). Sometimes a stripped gear or the manual lock is engaged.',
      check: 'Make sure the slide lock on the inside of the door is open. Look for a broken spring above the door.',
      dont: 'Don’t keep pressing the button. Holding the opener on a door it can’t lift burns out the motor and gears.'
    },
    track: {
      level: ['call', 'Call us'], title: 'Off track or a slipped cable',
      cause: 'A roller came out of the track, a cable came off its drum, or a track got bumped out of line (often by a car or snow).',
      check: 'Pull the opener’s red release only if the door is fully down. Keep cars, kids and pets clear of the door.',
      dont: 'Don’t try to force it back with the opener or a pry bar. A crooked door can drop or fold a section.'
    },
    reverse: {
      level: ['check', 'Check first'], title: 'Safety eyes or close limit',
      cause: 'The photo-eye sensors near the floor are blocked, dirty, or knocked out of line, or the close-force setting needs adjusting.',
      check: 'Clear anything in the door’s path, wipe the sensor lenses, and make sure both sensor lights are solid (not blinking).',
      dont: 'Don’t tape over, bypass or remove the sensors. They’re what keeps the door from coming down on someone.'
    },
    noise: {
      level: ['check', 'Check first'], title: 'Worn rollers, hinges or loose hardware',
      cause: 'Dry or worn rollers, loose hinges, a bent track, or springs near the end of their life. Noise usually comes before a failure.',
      check: 'Spray a garage-door lubricant on the hinges, roller bearings and spring coils (not on the track). Snug loose hinge bolts.',
      dont: 'Don’t loosen anything on the spring assembly or the bottom brackets where the cables attach.'
    },
    remote: {
      level: ['check', 'Check first'], title: 'Remote, keypad or wall button',
      cause: 'Dead battery, lost programming, the lock or vacation mode on the wall button, or a failing logic board.',
      check: 'Swap the battery, check that the wall button isn’t set to lock, and re-pair the remote using the opener’s learn button.',
      dont: 'If the wall button doesn’t work either, don’t keep resetting it. Give us a call and we’ll diagnose the opener.'
    }
  };
  var card = $('#diag-card');
  var setSym = function (key) {
    var d = SYM[key];
    $$('.diag__list button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.sym === key); });
    var lvl = $('#diag-level');
    lvl.className = 'lvl lvl--' + d.level[0];
    lvl.textContent = d.level[1];
    $('#diag-title').textContent = d.title;
    $('#diag-cause').textContent = d.cause;
    $('#diag-check').textContent = d.check;
    $('#diag-dont').textContent = d.dont;
    card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
  };
  $$('.diag__list button').forEach(function (b) { b.addEventListener('click', function () { setSym(b.dataset.sym); }); });
  setSym('bang');

  /* ---------- Estimate form ---------- */
  var form = $('#estimate-form'), msg = $('#form-msg');
  var pick = $('#build-pick');
  window.hdSetBuild = function (text) {
    pick.hidden = false;
    $('p', pick).textContent = text;
    $('input', pick).value = text;
    var svc = form.elements.service;
    if (!svc.value) svc.value = 'New door installation';
  };
  $('#build-clear').addEventListener('click', function () { pick.hidden = true; $('input', pick).value = ''; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form-msg'; msg.textContent = '';
    var bad = null;
    ['name', 'phone', 'service'].forEach(function (n) {
      var el = form.elements[n], ok = el.value.trim() !== '';
      el.setAttribute('aria-invalid', !ok);
      if (!ok && !bad) bad = el;
    });
    var em = form.elements.email;
    if (em.value && !/^\S+@\S+\.\S+$/.test(em.value)) { em.setAttribute('aria-invalid', 'true'); bad = bad || em; }
    else em.removeAttribute('aria-invalid');
    if (bad) { msg.className = 'form-msg is-err'; msg.textContent = 'Please fill in the highlighted fields.'; bad.focus(); return; }
    if (form.elements._gotcha.value) return;

    var endpoint = ($('meta[name="hd-form-endpoint"]') || {}).content;
    var btn = $('button[type="submit"]', form);
    if (endpoint) {
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); location.href = 'thank-you.html'; })
        .catch(function () {
          btn.disabled = false;
          msg.className = 'form-msg is-err';
          msg.textContent = 'That didn’t go through. Please call 715-928-3002 or email holldorfgaragedoors@gmail.com.';
        });
      return;
    }
    // No form service yet: hand the request to the visitor's email app.
    var f = form.elements, lines = [
      'Name: ' + f.name.value, 'Phone: ' + f.phone.value, 'Email: ' + f.email.value,
      'Town: ' + f.town.value, 'Service: ' + f.service.value
    ];
    if (f.door_builder.value) lines.push('Door Builder pick: ' + f.door_builder.value);
    if (f.details.value) lines.push('', f.details.value);
    location.href = 'mailto:holldorfgaragedoors@gmail.com?subject=' +
      encodeURIComponent('Estimate request: ' + f.service.value) + '&body=' + encodeURIComponent(lines.join('\n'));
    msg.className = 'form-msg is-ok';
    msg.textContent = 'Your email app should open with the request filled in. Just hit send.';
  });
  $$('input, select', form).forEach(function (el) {
    el.addEventListener('input', function () { if (el.value.trim()) el.removeAttribute('aria-invalid'); });
  });

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
