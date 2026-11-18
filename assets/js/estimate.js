/* Holldorf Garage Doors: estimate form with the built-in Door Planner.
   Shared by the homepage (#estimate) and /free-estimate/.
   Contact details come first (they can send right there). Then the job type, follow-up
   questions for that job, timing and priorities, and a summary with notes.
   Sending: if <meta name="hd-form-endpoint"> has a form-service URL the request posts there
   and goes to the thank-you page; until then it opens the visitor's email app, pre-filled. */
(function () {
  'use strict';
  var form = document.querySelector('.planner');
  if (!form) return;
  var $ = function (s, c) { return (c || form).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || form).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var typeStep = $('.q[data-key="type"]'), finalStep = $('.q-final');
  var meter = $('.meter-door'), mLabel = $('.meter-label');
  var pNext = $('.p-next'), pBack = $('.p-back');
  var msg = document.getElementById('form-msg');
  var finalLabel = $('.final-label');
  var pick = document.getElementById('build-pick');

  var o = function (v, sub) { return { v: v, sub: sub || '' }; };
  var OTHER = o('Other', 'Tell us at the end');
  var SIZE = { key: 'size', label: 'Size', q: 'About how big is the opening?', opts: [o('Single', '8 or 9 ft wide'), o('Double', '16 ft wide'), o('Tall or oversized', 'RV, trailer or shop height'), o('Not sure', 'We’ll measure')] };
  var FLOW = {
    'New door': [
      { key: 'building', label: 'Building', q: 'What’s it going on?', opts: [o('Attached garage', 'Part of the house'), o('Detached garage', 'Stand-alone'), o('New construction', 'Still being built'), o('Shop or pole building', 'Steel or post-frame')] },
      { key: 'count', label: 'Doors', q: 'How many doors?', opts: [o('One'), o('Two'), o('Three or more')] },
      SIZE,
      { key: 'style', label: 'Style', q: 'Any style in mind?', opts: [o('Raised panel', 'Classic panels'), o('Carriage house', 'Barn-door look, hardware'), o('Flush modern', 'Smooth, clean lines'), o('Full-view glass', 'Lots of light'), o('Help me pick', 'Show me options')] }
    ],
    'Replace my door': [
      { key: 'why', label: 'Reason', multi: true, q: 'Why replace it?', hint: 'Pick as many as you like.', opts: [o('Dented or damaged'), o('Drafty or not insulated'), o('Old and worn out'), o('Want a new look'), o('Noisy or hard to run')] },
      { key: 'count', label: 'Doors', q: 'How many doors?', opts: [o('One'), o('Two'), o('Three or more')] },
      SIZE,
      { key: 'style', label: 'Style', q: 'What would you like instead?', opts: [o('Raised panel', 'Classic panels'), o('Carriage house', 'Barn-door look, hardware'), o('Flush modern', 'Smooth, clean lines'), o('Full-view glass', 'Lots of light'), o('Help me pick', 'Show me options')] }
    ],
    'Repair': [
      { key: 'problem', label: 'Problem', multi: true, q: 'What’s going on?', hint: 'Pick as many as you like.', opts: [o('Broken spring', 'Heard a loud bang'), o('Cable off or snapped'), o('Off track or crooked'), o('Dented or cracked panel'), o('Noisy or shaking'), o('Won’t close all the way')] },
      { key: 'state', label: 'Door is', q: 'Right now the door is…', opts: [o('Stuck closed', 'Car is inside'), o('Stuck open', 'Can’t lock up'), o('Works, but needs fixing'), o('Not sure')] }
    ],
    'Opener': [
      { key: 'need', label: 'Opener', q: 'What do you need?', opts: [o('New opener', 'Door has none yet'), o('Replace my opener', 'Old or loud'), o('Repair my opener', 'Not working right'), o('Manual to automatic', 'Stop lifting by hand'), o('Keypad or remotes', 'Add or re-program')] },
      SIZE
    ],
    'Commercial or pole building': [
      { key: 'building', label: 'Building', q: 'What kind of building?', opts: [o('Pole or post-frame', 'Ag, storage, hobby shop'), o('Steel shop', 'Work or equipment'), o('Business or warehouse', 'Commercial use')] },
      { key: 'csize', label: 'Size', q: 'Door size?', opts: [o('10 × 10'), o('12 × 12'), o('14 × 14 or bigger'), o('Not sure', 'We’ll measure')] },
      { key: 'cneed', label: 'Work', q: 'What’s the job?', opts: [o('New install'), o('Replace a door'), o('Repair'), o('Add an opener')] }
    ]
  };
  var COMMON = [
    { key: 'when', label: 'Timing', q: 'How soon?', opts: [o('Emergency', 'Stuck or unsafe now'), o('Next couple weeks'), o('In 1–3 months'), o('Just planning', 'Pricing it out')] },
    { key: 'care', label: 'Priorities', multi: true, q: 'What matters most to you?', hint: 'Pick as many as you like.', opts: [o('Insulated, warmer garage'), o('Quiet operation'), o('Curb appeal'), o('Low maintenance'), o('Windows and natural light'), o('Keeping the cost down')] }
  ];
  var EXPECT = {
    'New door': 'We measure the opening, headroom and side room so the door and track fit right the first time.',
    'Replace my door': 'We pull the old door, check the framing and seal, hang the new one and haul the old one away.',
    'Repair': 'We find what failed and why, and check the springs, cables and rollers that tend to go next.',
    'Opener': 'We match the opener to your door’s size and weight and set the safety eyes and force limits.',
    'Commercial or pole building': 'We size the door, track and spring setup for the building and how often it opens.'
  };
  var CARE = {
    'Insulated, warmer garage': 'Insulated door options with R-values side by side.',
    'Quiet operation': 'Belt-drive and quiet-roller options.',
    'Curb appeal': 'Style, color and window choices that suit the house.',
    'Low maintenance': 'Steel finishes and hardware that hold up to Wisconsin winters.',
    'Windows and natural light': 'Window layouts and glass options.',
    'Keeping the cost down': 'A straight quote with a good, better and best option where it makes sense.'
  };

  var answers = {};
  var steps = [typeStep, finalStep];
  var stepI = 0;

  function makeStep(def) {
    var fs = document.createElement('fieldset');
    fs.className = 'q q-gen';
    fs.dataset.key = def.key;
    fs.dataset.label = def.label;
    if (!def.multi) fs.setAttribute('data-single', '');
    var opts = def.opts.concat([OTHER]);
    fs.innerHTML = '<legend>' + def.q + '</legend>' + (def.hint ? '<p class="q-hint">' + def.hint + '</p>' : '') +
      '<div class="opts">' + opts.map(function (x) {
        return '<button type="button" class="opt" data-v="' + x.v + '"><strong>' + x.v + '</strong>' + (x.sub ? '<span>' + x.sub + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    wire(fs);
    return fs;
  }
  function buildFlow(type) {
    $$('.q-gen').forEach(function (q) { q.remove(); });
    Object.keys(answers).forEach(function (k) { if (k !== 'type') delete answers[k]; });
    var gen = (FLOW[type] || []).concat(COMMON).map(makeStep);
    gen.forEach(function (g) { finalStep.parentNode.insertBefore(g, finalStep); });
    steps = [typeStep].concat(gen, [finalStep]);
  }
  function summary() {
    return steps.filter(function (q) { var a = answers[q.dataset.key]; return a && [].concat(a).length; })
      .map(function (q) { return [q.dataset.label, [].concat(answers[q.dataset.key]).join(', ')]; });
  }
  function pickedOther() {
    return Object.keys(answers).some(function (k) { return [].concat(answers[k]).indexOf('Other') > -1; });
  }
  function buildPlan() {
    var rows = summary();
    var build = form.elements.door_builder.value;
    if (build) rows.push(['Door Builder', build]);
    $('.plan-list').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
    var care = [].concat(answers.care || []);
    var items = [
      answers.when === 'Emergency' ? 'Taden calls you back as soon as he can. If it’s urgent, calling 715-928-3002 is fastest.' : 'Taden calls to set up a time for a free look and measure.',
      EXPECT[answers.type]
    ].concat(care.map(function (c) { return CARE[c]; }), ['A written quote before any work starts.']).filter(Boolean);
    $('.plan-expect').innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    form.elements.door_plan.value = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join(' | ');
    var other = pickedOther();
    finalLabel.textContent = other ? 'You picked “Other.” Tell us a little more:' : 'Anything else we should know?';
    finalStep.classList.toggle('needs-note', other);
  }
  function render() {
    steps.forEach(function (q, i) { q.classList.toggle('on', i === stepI); });
    meter.style.transform = 'translateY(' + (-100 * stepI / Math.max(1, steps.length - 1)) + '%)';
    mLabel.textContent = answers.type ? 'Step ' + (stepI + 1) + ' of ' + steps.length : 'Step 1';
    pBack.disabled = stepI === 0;
    var cur = steps[stepI], last = cur === finalStep, a = answers[cur.dataset.key];
    pNext.hidden = last;
    pNext.disabled = !last && !(a && [].concat(a).length);
    if (last) buildPlan();
  }
  function go(d) { stepI = Math.min(steps.length - 1, Math.max(0, stepI + d)); render(); }
  function wire(q) {
    var single = q.hasAttribute('data-single');
    $$('.opt:not(.opt-send)', q).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = q.dataset.key;
        if (single) {
          $$('.opt', q).forEach(function (x) { x.classList.toggle('sel', x === btn); });
          var changed = answers[key] !== btn.dataset.v;
          answers[key] = btn.dataset.v;
          if (key === 'type' && (changed || steps.length === 2)) buildFlow(btn.dataset.v);
          render();
          setTimeout(function () { if (steps[stepI] === q) go(1); }, 320);
        } else {
          btn.classList.toggle('sel');
          answers[key] = $$('.opt.sel', q).map(function (x) { return x.dataset.v; });
          render();
        }
      });
    });
  }
  wire(typeStep);
  pNext.addEventListener('click', function () { go(1); });
  pBack.addEventListener('click', function () { go(-1); });

  /* Door Builder hand-off (homepage) */
  window.hdSetBuild = function (text) {
    pick.hidden = false;
    $('p', pick).textContent = text;
    form.elements.door_builder.value = text;
    if (!answers.type) $('.opt[data-v="New door"]', typeStep).click();
  };
  document.getElementById('build-clear').addEventListener('click', function () { pick.hidden = true; form.elements.door_builder.value = ''; });

  /* Contact checks */
  var checks = {
    name: function (v) { return v.trim() ? '' : 'Please enter your name.'; },
    phone: function (v) {
      if (!v.trim()) return 'Please enter a phone number so we can reach you.';
      return v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter a 10-digit phone number.';
    },
    email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.'; }
  };
  function showErr(field, text) {
    form.elements[field].setAttribute('aria-invalid', text ? 'true' : 'false');
    document.getElementById('err-' + field).textContent = text;
  }
  function firstBad() {
    var bad = null;
    Object.keys(checks).forEach(function (f) {
      var t = checks[f](form.elements[f].value);
      showErr(f, t);
      if (t && !bad) bad = f;
    });
    return bad;
  }
  Object.keys(checks).forEach(function (f) {
    form.elements[f].addEventListener('input', function () {
      if (form.elements[f].getAttribute('aria-invalid') === 'true' && !checks[f](form.elements[f].value)) showErr(f, '');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = e.submitter;
    if (!btn || !(btn.classList.contains('send-now') || btn.classList.contains('send-plan'))) return;
    msg.className = 'form-msg'; msg.textContent = '';
    var bad = firstBad();
    if (bad) {
      msg.className = 'form-msg is-err';
      msg.textContent = 'Please fix the highlighted field above.';
      form.elements[bad].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      form.elements[bad].focus({ preventScroll: true });
      return;
    }
    if (form.elements._gotcha.value) return;
    if (btn.classList.contains('send-now')) form.elements.door_plan.value = summary().map(function (r) { return r[0] + ': ' + r[1]; }).join(' | ');

    var endpoint = (document.querySelector('meta[name="hd-form-endpoint"]') || {}).content;
    if (endpoint) {
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); location.href = form.dataset.thanks; })
        .catch(function () {
          btn.disabled = false;
          msg.className = 'form-msg is-err';
          msg.textContent = 'That didn’t go through. Please call 715-928-3002 or email holldorfgaragedoors@gmail.com.';
        });
      return;
    }
    // No form service yet: hand the request to the visitor's email app.
    var f = form.elements, lines = ['Name: ' + f.name.value, 'Phone: ' + f.phone.value, 'Email: ' + f.email.value, 'Town: ' + f.town.value];
    if (f.door_plan.value) lines.push('', 'Door plan: ' + f.door_plan.value.split(' | ').join('\n  '));
    if (f.door_builder.value) lines.push('Door Builder pick: ' + f.door_builder.value);
    if (f.details.value) lines.push('', f.details.value);
    location.href = 'mailto:holldorfgaragedoors@gmail.com?subject=' +
      encodeURIComponent('Estimate request: ' + (answers.type || 'garage door')) + '&body=' + encodeURIComponent(lines.join('\n'));
    msg.className = 'form-msg is-ok';
    msg.textContent = 'Your email app should open with everything filled in. Just hit send.';
  });

  render();
})();
