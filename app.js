/* Blend Buddies – S blends. A friendly S slides along its buddy's arm, they link arms and make the word.
   Original code, characters and sounds. No dependencies, no cookies, no storage, no tracking.
   The only request is for words.json (same site). Sounds are synthesized at run time with the Web Audio API. */
(function () {
  'use strict';

  /* ================= sound (Web Audio, generated; never throws) ================= */
  var Sound = (function () {
    var AC = window.AudioContext || window.webkitAudioContext || null;
    var ctx = null, master = null, on = true, noise = null, wh = null, dead = !AC;
    function safe(f) { return function () { try { return f.apply(null, arguments); } catch (e) { return null; } }; }
    var ensure = safe(function () {
      if (dead) return null;
      if (!ctx) {
        try { ctx = new AC(); } catch (e) { dead = true; ctx = null; return null; }
        master = ctx.createGain(); master.gain.value = on ? 0.9 : 0; master.connect(ctx.destination);
      }
      return ctx;
    });
    var unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    var unlock = safe(function () {
      var c = ensure(); if (!c) { stopListening(); return; }
      if (c.state !== 'running' && c.resume) { var p = c.resume(); if (p && p.catch) p.catch(function () {}); }
      // iOS Safari: play one silent sample inside the gesture to open the audio route
      var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
      if (c.state === 'running') stopListening();
    });
    function stopListening() { unlockEvents.forEach(function (t) { document.removeEventListener(t, unlock, true); }); }
    unlockEvents.forEach(function (t) { document.addEventListener(t, unlock, true); });

    function ready() { return on && ensure() && ctx.state !== 'closed' ? ctx : null; }
    function noiseBuf(c) {
      if (noise) return noise;
      var n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return (noise = b);
    }
    function env(g, t, a, peak, dec) {
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    }
    function tone(type, f0, f1, t, a, peak, dec) {
      var c = ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + a + dec);
      env(g, t, a, peak, dec); o.connect(g); g.connect(master); o.start(t); o.stop(t + a + dec + 0.05);
    }
    return {
      available: function () { return !dead; },
      isOn: function () { return on; },
      setOn: safe(function (v) {
        on = !!v;
        if (master && ctx) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.02);
        if (!on) this.whooshStop();
      }),
      /* soft airy whoosh while S travels; louder and brighter when moving faster */
      whoosh: safe(function (speed) {
        var c = ready(); if (!c) return;
        var now = c.currentTime, sp = Math.min(3, Math.max(0, speed || 0));
        if (!wh) {
          var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
          src.buffer = noiseBuf(c); src.loop = true; f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.value = 900;
          g.gain.value = 0.0001; src.connect(f); f.connect(g); g.connect(master); src.start(now);
          wh = { src: src, f: f, g: g };
        }
        wh.g.gain.setTargetAtTime(0.03 + sp * 0.07, now, 0.04);
        wh.f.frequency.setTargetAtTime(800 + sp * 1300, now, 0.05);
      }),
      whooshStop: safe(function () {
        if (!wh || !ctx) return;
        var w = wh, now = ctx.currentTime; wh = null;
        w.g.gain.cancelScheduledValues(now); w.g.gain.setTargetAtTime(0.0001, now, 0.05);
        w.src.stop(now + 0.3);
      }),
      /* pop when the arms link */
      pop: safe(function () {
        var c = ready(); if (!c) return; var t = c.currentTime + 0.01;
        tone('sine', 620, 190, t, 0.005, 0.45, 0.14); tone('triangle', 1240, 400, t, 0.003, 0.12, 0.08);
      }),
      /* tap at the "wrist" = the second sound */
      tap: safe(function () {
        var c = ready(); if (!c) return; var t = c.currentTime + 0.01;
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = noiseBuf(c); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 2.2;
        env(g, t, 0.002, 0.5, 0.05); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.09);
        tone('triangle', 980, 700, t, 0.002, 0.22, 0.06);
      }),
      /* bright little chime when the word is complete */
      chime: safe(function () {
        var c = ready(); if (!c) return; var t = c.currentTime + 0.02;
        [784, 988, 1175, 1568].forEach(function (f, i) {
          tone('sine', f, f, t + i * 0.09, 0.008, 0.22, 0.9); tone('sine', f * 2, f * 2, t + i * 0.09, 0.005, 0.05, 0.4);
        });
      })
    };
  })();

  /* ================= data + elements ================= */
  var DATA, WORDS, GROUPS = {}, LET = {}, FR;
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  var app = $('app'), stage = $('stage'), wrap = $('stageWrap'), mover = $('mover'), track = $('track'), handle = $('handle');
  var el = {
    buddies: $('buddies'), armLayer: $('armLayer'), ribbon: $('ribbon'), clip: $('ribbonClipRect'), right: $('rightChain'),
    tapRing: $('tapRing'), tapCircle: $('tapCircle'), wordRow: $('wordRow'), burst: $('burst'), blendG: $('blendG'), restG: $('restG'),
    without: $('withoutText'), caption: $('caption'), say: $('sayIt'), secLabel: $('secLabel'), fill2: $('trackFill'),
    leave: $('btnLeave'), leaveLabel: $('leaveLabel')
  };
  var H = 440;
  var st = { idx: -1, mode: 'drag', pos: 0, link: 0, done: false, locking: false, lonely: false, say: false, G: null, timers: [], raf: 0 };

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function norm(s) { return String(s || '').toLowerCase().trim().replace(/[\s_+\-]+/g, '-').replace(/[^a-z-]/g, ''); }
  function findWord(w) {
    var k = norm(w), k2 = k.replace(/-/g, '');
    for (var i = 0; i < WORDS.length; i++) if (WORDS[i].id === k || norm(WORDS[i].word) === k) return i;
    for (var j = 0; j < WORDS.length; j++) if (norm(WORDS[j].word).replace(/-/g, '') === k2) return j;   // "skate board" -> skateboard
    return -1;
  }
  function mk(tag, attrs, parent, cls) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (cls) n.setAttribute('class', cls);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function shade(hex, amt) {   // amt < 0 darker, > 0 lighter
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = amt < 0 ? 0 : 255, a = Math.abs(amt);
    var f = function (c) { return Math.round(c + (t - c) * a); };
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function letterStyle(ch) { return LET[ch] || { color: '#7A7F99', ink: '#FFFFFF' }; }
  function later(fn, ms) { st.timers.push(setTimeout(fn, ms)); }
  function clearTimers() { st.timers.forEach(clearTimeout); st.timers = []; stopTween(); }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stopTween() { st.tok = (st.tok || 0) + 1; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; if (st.tweenFallback) clearTimeout(st.tweenFallback); }
  function tween(from, to, ms, apply, then) {
    stopTween();
    var tok = st.tok, t0 = null, fin = false;
    ms = reduced ? 1 : ms;
    function finish() { if (fin || tok !== st.tok) return; fin = true; st.raf = 0; clearTimeout(st.tweenFallback); apply(to); if (then && tok === st.tok) then(); }
    function f(now) {
      if (fin || tok !== st.tok) return;
      if (t0 === null) t0 = now;
      var t = clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - t, 3);
      if (t >= 1) { finish(); return; }
      apply(lerp(from, to, e));
      if (tok === st.tok) st.raf = requestAnimationFrame(f);
    }
    st.raf = requestAnimationFrame(f);
    st.tweenFallback = setTimeout(finish, ms + 250);   // still finishes if animation frames are paused
  }
  // which letters are on which side; the friendly letter (S) can be configured to the right for future L-/R-blend pages
  function sides(w) {
    var friendLeft = !FR || FR.side !== 'right';
    return { left: (friendLeft ? w.s : w.partner).split(''), right: (friendLeft ? w.partner : w.s).split('') };
  }
  function measure(node, txt, size) { node.textContent = txt; node.style.fontSize = size + 'px'; return txt ? node.getComputedTextLength() : 0; }

  /* ---------- characters ---------- */
  function buildBuddy(parent, ch, cx, CY, R) {
    var c = letterStyle(ch), g = mk('g', { 'data-letter': ch }, parent, 'buddy');
    var bodyG = mk('g', {}, g, 'buddy-body');
    mk('circle', { cx: cx, cy: CY, r: R, fill: c.color, filter: 'url(#soft)' }, bodyG, 'body');
    mk('ellipse', { cx: cx - R * 0.38, cy: CY - R * 0.52, rx: R * 0.22, ry: R * 0.13, transform: 'rotate(-30 ' + (cx - R * 0.38) + ' ' + (CY - R * 0.52) + ')' }, bodyG, 'shine');
    [-1, 1].forEach(function (s) {
      mk('ellipse', { cx: cx + s * R * 0.58, cy: CY + R * 0.42, rx: R * 0.14, ry: R * 0.09 }, bodyG, 'cheek');
      mk('circle', { cx: cx + s * R * 0.3, cy: CY - R * 0.5, r: R * 0.165 }, bodyG, 'eye-white');
      mk('circle', { cx: cx + s * R * 0.3 + R * 0.03, cy: CY - R * 0.47, r: R * 0.085 }, bodyG, 'pupil');
      mk('circle', { cx: cx + s * R * 0.3 + R * 0.06, cy: CY - R * 0.52, r: R * 0.03 }, bodyG, 'glint');
    });
    var t = mk('text', { x: cx, y: CY + R * 0.1, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: c.ink }, bodyG, 'letter');
    t.textContent = ch; t.style.fontSize = (R * 0.98) + 'px';
    var mouth = mk('path', { d: '' }, bodyG, 'mouth');
    return { g: g, cx: cx, mouth: mouth, color: c.color, dark: shade(c.color, -0.28) };
  }
  function arm(parent, color) {
    var g = mk('g', {}, parent, 'arm');
    var p = mk('path', { d: '', stroke: color }, g, 'arm-line');
    var h = mk('circle', { cx: 0, cy: 0, r: 0, fill: color }, g, 'hand');
    return { g: g, p: p, h: h };
  }
  function setArm(a, A, B, bulge, R) {
    var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var cx = mx - dy / L * bulge, cy = my + dx / L * bulge;
    a.p.setAttribute('d', 'M' + A[0].toFixed(1) + ' ' + A[1].toFixed(1) + 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + B[0].toFixed(1) + ' ' + B[1].toFixed(1));
    a.p.style.strokeWidth = (R * 0.17).toFixed(1) + 'px';
    a.h.setAttribute('cx', B[0].toFixed(1)); a.h.setAttribute('cy', B[1].toFixed(1)); a.h.setAttribute('r', (R * 0.15).toFixed(1));
  }
  function setMouth(b, CY, R, m) {   // m: -1 frown, 1 smile, 2 big open smile
    var hw = R * (m > 0 ? 0.2 + 0.07 * m : 0.18), y = CY + R * (m < 0 ? 0.7 : 0.58), d = R * 0.12 * m, x = b.cx;
    var open = m > 1.05;
    b.mouth.setAttribute('d', 'M' + (x - hw).toFixed(1) + ' ' + y.toFixed(1) + 'Q' + x.toFixed(1) + ' ' + (y + 2 * d).toFixed(1) + ' ' + (x + hw).toFixed(1) + ' ' + y.toFixed(1) + (open ? 'Z' : ''));
    b.mouth.classList.toggle('open', open);
  }

  /* ---------- layout (SVG units; recomputed on resize) ---------- */
  function layout() {
    var w = WORDS[st.idx]; if (!w) return;
    var r0 = wrap.getBoundingClientRect();
    var aspect = r0.height > 0 ? r0.width / r0.height : 2;
    var W = Math.round(clamp(H * aspect, 640, 1200));
    stage.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var sd = sides(w), nL = sd.left.length, nR = sd.right.length;
    var M = 16, R = W >= 900 ? 64 : 56, CY = 200, HOLD = 2 * R + 46, LINK = 2 * R + 66, LIFT = 54, WY = 362;
    // right chain (the buddy whose arm is the "road"), then the mover (S) on the left
    var rx = []; rx[nR - 1] = W - M - R * 1.25;
    for (var i = nR - 2; i >= 0; i--) rx[i] = rx[i + 1] - HOLD;
    var lead0 = M + R * 1.3 + (nL - 1) * HOLD;                 // start x of the mover's leading (rightmost) letter
    var leadEnd = rx[0] - LINK, snapPos = leadEnd - lead0;
    var yA = CY + R * 0.42;                                     // the outstretched arm runs along here
    clear(el.armLayer); clear(el.ribbon); clear(el.right); clear(mover); clear(el.blendG); clear(el.restG); clear(el.burst);
    var G = { W: W, R: R, CY: CY, yA: yA, lead0: lead0, snapPos: snapPos, rx: rx, nL: nL, nR: nR, LIFT: LIFT };
    // the long arm (drawn under the ribbon)
    var first = buildBuddyPlaceholder(sd.right[0]);
    G.longArm = arm(el.armLayer, first.dark);
    G.longA = [rx[0] - R * 0.84, CY + R * 0.28];
    G.longB = [lead0 + R * 1.28, yA];
    G.meet = [(leadEnd + rx[0]) / 2, CY + R * 0.02];
    // ribbon: a wavy "sssss" band that grows behind S
    var hold = (FR && FR.hold) || 's', rc = letterStyle(sd.left[nL - 1]).color, xs = lead0 - R * 0.2, xe = leadEnd + R * 0.4, amp = R * 0.1, dd = '';
    for (var k = 0; k <= 80; k++) { var x = lerp(xs, xe, k / 80); dd += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (yA + amp * Math.sin((x - xs) / (R * 0.55))).toFixed(1); }
    var e1 = mk('path', { d: dd, stroke: rc }, el.ribbon, 'ribbon-edge'); e1.style.strokeWidth = (R * 0.56) + 'px';
    var e2 = mk('path', { d: dd, stroke: shade(rc, 0.72) }, el.ribbon, 'ribbon-fill'); e2.style.strokeWidth = (R * 0.56 - 8) + 'px';
    for (var xx = xs + R * 0.25; xx < xe; xx += R * 0.4) {
      var tt = mk('text', { x: xx.toFixed(1), y: (yA + amp * Math.sin((xx - xs) / (R * 0.55))).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: shade(rc, -0.15) }, el.ribbon, 'ribbon-s');
      tt.textContent = hold; tt.style.fontSize = (R * 0.42) + 'px';
    }
    el.clip.setAttribute('x', lead0.toFixed(1)); el.clip.setAttribute('y', 0); el.clip.setAttribute('height', H);
    // characters
    G.rightB = sd.right.map(function (ch, j) { return buildBuddy(el.right, ch, rx[j], CY, R); });
    G.rightB[0].g.classList.add('tap-target');
    G.rightArms = [];
    // hand-holding inside the right chain (e.g. T holding R in "str")
    for (var j = 0; j + 1 < nR; j++) {
      var a1 = arm(el.right, G.rightB[j].dark), a2 = arm(el.right, G.rightB[j + 1].dark);
      el.right.insertBefore(a1.g, el.right.firstChild); el.right.insertBefore(a2.g, el.right.firstChild);
      var mid = (rx[j] + rx[j + 1]) / 2;
      setArm(a1, [rx[j] + R * 0.84, CY + R * 0.28], [mid - 5, CY + R * 0.5], 7, R);
      setArm(a2, [rx[j + 1] - R * 0.84, CY + R * 0.28], [mid + 5, CY + R * 0.5], -7, R);
    }
    G.rightOuter = arm(el.right, G.rightB[nR - 1].dark); el.right.insertBefore(G.rightOuter.g, el.right.firstChild);
    // mover (S); local coords = start position, moved with a transform
    mk('rect', { x: lead0 - (nL - 1) * HOLD - R * 1.3, y: CY - R * 1.35, width: (nL - 1) * HOLD + R * 2.7, height: R * 2.7, rx: R }, mover, 'hit');
    var lx = []; for (var q = 0; q < nL; q++) lx[q] = lead0 - (nL - 1 - q) * HOLD;
    G.leftB = sd.left.map(function (ch, q2) { return buildBuddy(mover, ch, lx[q2], CY, R); });
    G.leadArm = arm(mover, G.leftB[nL - 1].dark); mover.insertBefore(G.leadArm.g, mover.firstChild);
    G.leftOuter = arm(mover, G.leftB[0].dark); mover.insertBefore(G.leftOuter.g, mover.firstChild);
    for (var q3 = 0; q3 + 1 < nL; q3++) {
      var b1 = arm(mover, G.leftB[q3].dark), b2 = arm(mover, G.leftB[q3 + 1].dark), m2 = (lx[q3] + lx[q3 + 1]) / 2;
      mover.insertBefore(b1.g, mover.firstChild); mover.insertBefore(b2.g, mover.firstChild);
      setArm(b1, [lx[q3] + R * 0.84, CY + R * 0.28], [m2 - 5, CY + R * 0.5], 7, R);
      setArm(b2, [lx[q3 + 1] - R * 0.84, CY + R * 0.28], [m2 + 5, CY + R * 0.5], -7, R);
    }
    G.lx = lx;
    // little heart where the hands link
    G.heart = mk('path', { d: heartPath(G.meet[0], G.meet[1] - R * 0.62, R * 0.2) }, el.armLayer, 'heart');
    el.tapCircle.setAttribute('cx', rx[0]); el.tapCircle.setAttribute('cy', CY); el.tapCircle.setAttribute('r', R + 8);
    el.tapCircle.setAttribute('stroke', letterStyle(sd.right[0]).color);
    // where everything sits when done (centered and lifted) or when S is left out (only the buddy, centered)
    var leftEdge = lx[0] + snapPos - R * 1.3, rightEdge = rx[nR - 1] + R * 1.3;
    G.shiftDone = W / 2 - (leftEdge + rightEdge) / 2;
    G.shiftLonely = W / 2 - ((rx[0] - R * 1.3) + rightEdge) / 2;
    // the word row: friend letters + partner letters (in their colours) + rest (dark ink)
    var F = W >= 900 ? 116 : 104, segs = sd.left.concat(sd.right).map(function (ch) { return { t: ch, color: letterStyle(ch).color }; });
    segs.push({ t: w.rest, color: null });
    var nodes = segs.map(function (s) {
      var n = mk('text', { x: 0, y: WY, 'dominant-baseline': 'central' }, s.color ? el.blendG : el.restG, 'word-text seg' + (s.color ? ' blend' : ' rest'));
      if (s.color) n.setAttribute('fill', shade(s.color, -0.12));
      return n;
    });
    var widths, total, tries = 0;
    for (;;) {
      widths = segs.map(function (s, i2) { return measure(nodes[i2], s.t, F); });
      total = widths.reduce(function (a, b) { return a + b; }, 0);
      if (total <= W - 2 * M - 40 || tries++ > 6) break;
      F = Math.floor(F * (W - 2 * M - 40) / total);
    }
    var x0 = W / 2 - total / 2, xcur = x0;
    nodes.forEach(function (n, i3) { n.setAttribute('x', xcur.toFixed(1)); xcur += widths[i3]; });
    G.restShift = Math.min(220, W - (x0 + total) + 40);
    el.restG.style.setProperty('--rest-shift', G.restShift + 'px');
    measure(el.without, w.without || '', F); el.without.setAttribute('x', W / 2); el.without.setAttribute('y', WY);
    // star burst around the finished word
    var rxB = total / 2 + 46, ryB = F * 0.58 + 6, cxB = W / 2;
    for (var b = 0; b < 10; b++) {
      var ang = -Math.PI / 2 + b * Math.PI * 2 / 10 + 0.3, fx = clamp(cxB + rxB * Math.cos(ang), 24, W - 24), fy = clamp(WY + ryB * Math.sin(ang), WY - ryB, H - 18);
      var sp = mk('path', { d: starPath(cxB, WY, b % 2 ? 11 : 16) }, el.burst, 'burst-star' + (b % 3 === 0 ? ' alt' : ''));
      sp.style.setProperty('--dx', (fx - cxB).toFixed(1) + 'px'); sp.style.setProperty('--dy', (fy - WY).toFixed(1) + 'px');
      sp.style.animationDelay = (b * 0.03).toFixed(2) + 's';
    }
    el.caption.setAttribute('x', W / 2); el.caption.setAttribute('y', 34);
    G.F = F;
    st.G = G;
    render();
  }
  function buildBuddyPlaceholder(ch) { var c = letterStyle(ch); return { dark: shade(c.color, -0.28) }; }
  function starPath(cx, cy, R1) {
    var R2 = R1 * 0.45, s = '';
    for (var j = 0; j < 10; j++) { var a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? R2 : R1; s += (j ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
    return s + 'Z';
  }
  function heartPath(x, y, s) {
    return 'M' + x + ' ' + (y + s * 0.9) + 'C' + (x - s * 1.6) + ' ' + (y - s * 0.2) + ' ' + (x - s * 0.7) + ' ' + (y - s * 1.3) + ' ' + x + ' ' + (y - s * 0.45) +
      'C' + (x + s * 0.7) + ' ' + (y - s * 1.3) + ' ' + (x + s * 1.6) + ' ' + (y - s * 0.2) + ' ' + x + ' ' + (y + s * 0.9) + 'Z';
  }

  /* ---------- state -> view ---------- */
  function render() {
    var G = st.G, w = WORDS[st.idx]; if (!G || !w) return;
    var R = G.R, CY = G.CY, pos = st.pos, L = st.link, p = G.snapPos > 0 ? pos / G.snapPos : 1;
    mover.style.transform = 'translate(' + pos.toFixed(1) + 'px,0px)';
    el.clip.setAttribute('width', Math.max(0, pos).toFixed(1));
    // the buddy's long arm: reaches out to S, then curls in to link arms
    if (st.lonely) setArm(G.longArm, G.longA, [G.longA[0] - R * 0.3, CY + R * 0.95], -6, R);   // droopy, nobody to hold
    else setArm(G.longArm, G.longA, [lerp(G.longB[0], G.meet[0] - 7, L), lerp(G.longB[1], G.meet[1], L)], lerp(8, -24, L), R);
    // S's leading hand slides along that arm, then hooks on
    var lead = G.lx[G.nL - 1], sh = [lead + R * 0.84, CY + R * 0.28];
    var handPlay = [lead + R * 1.22, G.yA - 2], handLink = [G.meet[0] + 7 - G.snapPos, G.meet[1]];
    setArm(G.leadArm, sh, [lerp(handPlay[0], handLink[0], L), lerp(handPlay[1], handLink[1], L)], lerp(-6, 24, L), R);
    // outer arms rest low, then cheer up
    var c0 = G.lx[0], cN = G.rx[G.nR - 1];
    setArm(G.leftOuter, [c0 - R * 0.84, CY + R * 0.28], [c0 - R * lerp(1.18, 1.2, L), CY + R * lerp(0.78, -0.5, L)], lerp(-8, 10, L), R);
    var cheer = st.done ? 1 : 0;
    setArm(G.rightOuter, [cN + R * 0.84, CY + R * 0.28], [cN + R * lerp(1.18, 1.2, cheer || L), CY + R * lerp(0.78, -0.5, cheer || L)], lerp(8, -10, cheer || L), R);
    var smile = st.lonely ? -1 : 1 + L;
    G.leftB.forEach(function (b) { setMouth(b, CY, R, 1 + L); });
    G.rightB.forEach(function (b) { setMouth(b, CY, R, smile); });
    stage.classList.toggle('done', st.done);
    stage.classList.toggle('lonely', st.lonely);
    stage.classList.toggle('linked', L > 0.98);
    var shift = st.done ? G.shiftDone : st.lonely ? G.shiftLonely : 0, lift = st.done || st.lonely ? -G.LIFT : 0;
    el.buddies.style.transform = 'translate(' + shift.toFixed(1) + 'px,' + lift + 'px)';
    var pct = Math.round(clamp(st.done ? 1 : p, 0, 1) * 100);
    handle.style.left = pct + '%'; el.fill2.style.width = pct + '%';
    mover.setAttribute('aria-valuenow', pct); track.setAttribute('aria-valuenow', pct);
    el.caption.textContent = st.lonely ? 'Without ' + FR.name + ', it says:' : (st.done && st.fromLonely ? 'With ' + FR.name + ', it says:' : '');
    app.dataset.progress = pct; app.dataset.done = st.done ? '1' : '0'; app.dataset.word = w.id;
    app.dataset.view = st.lonely ? 'lonely' : st.done ? 'done' : 'play';
    app.dataset.link = L.toFixed(2);
    var hasWithout = !!w.without;
    el.leave.hidden = !hasWithout;
    el.leave.setAttribute('aria-pressed', String(st.lonely));
    el.leaveLabel.textContent = st.lonely ? 'Bring ' + FR.name + ' back' : 'Leave ' + FR.name + ' out?';
    renderSay();
  }
  function renderSay() {
    var w = WORDS[st.idx];
    if (!st.say || !w) { el.say.hidden = true; return; }
    el.say.hidden = false; el.say.textContent = '';
    var b = document.createElement('b');
    if (st.lonely) { el.say.appendChild(document.createTextNode('Without ' + FR.name + ': ')); b.textContent = w.without; el.say.appendChild(b); }
    else if (st.done) { el.say.appendChild(document.createTextNode('Say it! ')); b.textContent = w.word; el.say.appendChild(b); }
    else el.say.textContent = 'Hold “' + new Array(6).join(FR.hold || 's') + '” as ' + FR.name + ' slides, then “' + w.partner + '”';
  }
  function setPos(pos) {
    var G = st.G; if (!G || st.done || st.locking || st.lonely) return;
    st.pos = clamp(pos, 0, G.snapPos);
    render();
    if (st.pos >= G.snapPos * 0.985) complete();
  }
  function complete() {
    if (st.done || st.locking || !st.G || st.lonely) return;
    st.locking = true; Sound.whooshStop(); app.classList.add('anim');
    var G = st.G, from = st.pos;
    tween(from, G.snapPos, 120 + 260 * (1 - from / G.snapPos), function (v) { st.pos = v; render(); }, function () {   // 1) S slides the last bit
      tween(0, 1, 460, function (v) { st.link = v; render(); }, function () {                                     // 2) arms swing in and link
        Sound.pop(); stage.classList.add('popped');
        later(function () { stage.classList.add('tapped'); Sound.tap(); }, 140);                                      // 3) tap-pop on the second sound
        later(function () {                                                                                            // 4) the word slides together
          st.locking = false; st.done = true; render();
          mover.setAttribute('aria-label', 'Done: ' + WORDS[st.idx].word);
          later(function () { Sound.chime(); }, 300);
        }, 420);
      });
    });
  }
  function resetView() {
    clearTimers(); Sound.whooshStop();
    stage.classList.remove('popped', 'tapped');
    st.locking = false; st.done = false; st.link = 0; st.lonely = false; st.fromLonely = false;
    mover.setAttribute('aria-label', FR.name + '. Drag along the arm.');
  }
  function reset() {
    var from = st.pos; resetView(); render();
    tween(from, 0, 320, function (v) { st.pos = v; render(); });
  }
  function toggleLonely() {
    var w = WORDS[st.idx]; if (!w || !w.without) return;
    if (!st.lonely) { resetView(); st.pos = 0; st.lonely = true; render(); }
    else {
      resetView(); st.pos = 0; st.fromLonely = true; render();
      later(function () { st.fromLonely = true; complete(); }, 260);
    }
  }

  /* ---------- word / mode / picker ---------- */
  function setURL(q) { try { history.replaceState(null, '', location.pathname + q); } catch (e) { /* ignore */ } }
  function updateURL() {
    var w = WORDS[st.idx], q = w ? '?w=' + encodeURIComponent(w.word) : '';
    if (st.mode === 'slide') q += (q ? '&' : '?') + 'm=slider';
    setURL(q);
  }
  function loadWord(i) {
    st.idx = (i + WORDS.length) % WORDS.length;
    var w = WORDS[st.idx], g = GROUPS[w.group];
    var list = WORDS.filter(function (x) { return x.group === w.group; }), within = list.indexOf(w) + 1;
    el.secLabel.textContent = '';
    var chip = document.createElement('b'); chip.textContent = g.name; chip.style.background = g.color; chip.style.color = g.ink;
    el.secLabel.appendChild(chip); el.secLabel.appendChild(document.createTextNode('  word ' + within + ' of ' + list.length));
    app.style.setProperty('--gbg', g.bg); app.style.setProperty('--gc', g.color);
    stage.setAttribute('aria-label', FR.name + ' and ' + w.partner.toUpperCase() + ' make ' + w.blend);
    $('picker').hidden = true; $('play').hidden = false;
    resetView(); st.pos = 0; app.classList.remove('anim');
    layout(); updateURL();
    requestAnimationFrame(function () { requestAnimationFrame(function () { app.classList.add('anim'); }); });
  }
  function setMode(m) {
    st.mode = m === 'slide' ? 'slide' : 'drag';
    var slide = st.mode === 'slide';
    $('modeDrag').setAttribute('aria-checked', String(!slide)); $('modeSlide').setAttribute('aria-checked', String(slide));
    document.querySelector('.mode').classList.toggle('slide', slide);
    $('sliderRow').hidden = !slide; mover.classList.toggle('no-drag', slide);
    mover.setAttribute('tabindex', slide ? '-1' : '0');
    app.dataset.mode = st.mode;
    if (st.idx >= 0) { resetView(); st.pos = 0; layout(); updateURL(); }
  }
  function blendSpan(parent, w) {
    var sd = sides(w);
    sd.left.concat(sd.right).forEach(function (ch) { var s = document.createElement('span'); s.className = 'bl'; s.textContent = ch; s.style.color = shade(letterStyle(ch).color, -0.12); parent.appendChild(s); });
    parent.appendChild(document.createTextNode(w.rest));
  }
  function buildPicker() {
    var groups = $('groups');
    DATA.groups.forEach(function (g) {
      var box = document.createElement('div'); box.className = 'group'; box.id = 'grp-' + g.id;
      box.style.setProperty('--gbg', g.bg); box.style.setProperty('--gc', g.color);
      var h = document.createElement('h2'), chip = document.createElement('span');
      chip.className = 'chip'; chip.textContent = g.name; chip.style.background = g.color; chip.style.color = g.ink; h.appendChild(chip);
      if (g.sub) { var sm = document.createElement('small'); sm.textContent = g.sub; h.appendChild(sm); }
      box.appendChild(h);
      var grid = document.createElement('div'); grid.className = 'word-grid';
      WORDS.forEach(function (w, i) {
        if (w.group !== g.id) return;
        var a = document.createElement('a'); a.className = 'word-btn'; a.href = '?w=' + encodeURIComponent(w.word);
        a.dataset.w = w.id; blendSpan(a, w);
        a.addEventListener('click', function (e) { e.preventDefault(); loadWord(i); });
        grid.appendChild(a);
      });
      box.appendChild(grid); groups.appendChild(box);
    });
  }
  function showPicker(gid, missing) {
    resetView();
    $('play').hidden = true; $('picker').hidden = false;
    var nf = $('notFound');
    if (missing) { nf.hidden = false; nf.textContent = 'Couldn’t find the word “' + missing + '”. Pick one below.'; } else nf.hidden = true;
    document.querySelectorAll('.group').forEach(function (g) { g.classList.toggle('hl', g.id === 'grp-' + gid); });
    var target = gid && $('grp-' + gid);
    if (target) target.scrollIntoView({ block: 'start' }); else $('picker').scrollTop = 0;
    st.idx = -1; app.dataset.word = ''; app.dataset.view = 'picker';
    var q = gid && GROUPS[gid] ? '?g=' + gid : '';
    if (st.mode === 'slide') q += (q ? '&' : '?') + 'm=slider';
    setURL(q);
  }

  /* ---------- input: drag mode (Pointer Events on S) ---------- */
  var drag = null;
  function svgScale() { var m = stage.getScreenCTM(); return m ? m.a : 1; }
  mover.addEventListener('pointerdown', function (e) {
    if (st.mode !== 'drag' || st.done || st.locking || st.lonely || drag) return;
    e.preventDefault();
    try { mover.setPointerCapture(e.pointerId); } catch (x) {}
    stopTween();
    drag = { id: e.pointerId, x: e.clientX, pos: st.pos, k: svgScale(), lx: e.clientX, lt: performance.now() };
    app.classList.remove('anim'); mover.classList.add('dragging');
  });
  function speedOf(o, x) {   // screen px per ms, smoothed
    var now = performance.now(), dt = Math.max(8, now - o.lt), v = Math.abs(x - o.lx) / dt;
    o.v = o.v === undefined ? v : o.v * 0.6 + v * 0.4; o.lx = x; o.lt = now; return o.v;
  }
  mover.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    e.preventDefault();
    var before = st.pos;
    setPos(drag.pos + (e.clientX - drag.x) / drag.k);
    if (drag && st.pos !== before) Sound.whoosh(speedOf(drag, e.clientX));
    if (st.done || st.locking) endDrag(e);
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    try { mover.releasePointerCapture(drag.id); } catch (x) {}
    drag = null; mover.classList.remove('dragging'); Sound.whooshStop();
    if (!st.done && !st.locking && st.G && st.pos >= st.G.snapPos * 0.93) complete();   // nearly there: snap in
    // otherwise S stays exactly where it was let go (no snapping back)
  }
  mover.addEventListener('pointerup', endDrag);
  mover.addEventListener('pointercancel', endDrag);
  mover.addEventListener('lostpointercapture', endDrag);

  /* ---------- input: slider mode ---------- */
  var sl = null;
  function slideTo(clientX) {
    var r = track.getBoundingClientRect(); if (!r.width || !st.G) return;
    setPos(clamp((clientX - r.left) / r.width, 0, 1) * st.G.snapPos);
  }
  track.addEventListener('pointerdown', function (e) {
    if (st.done || st.locking || st.lonely || sl) return;
    e.preventDefault();
    try { track.setPointerCapture(e.pointerId); } catch (x) {}
    stopTween();
    app.classList.remove('anim'); track.classList.add('dragging');
    var hr = handle.getBoundingClientRect(), onHandle = e.clientX >= hr.left && e.clientX <= hr.right;
    sl = { id: e.pointerId, off: onHandle ? e.clientX - (hr.left + hr.width / 2) : 0, lx: e.clientX, lt: performance.now() };
    if (!onHandle) slideTo(e.clientX);
  });
  track.addEventListener('pointermove', function (e) {
    if (!sl || e.pointerId !== sl.id) return;
    e.preventDefault(); var before = st.pos; slideTo(e.clientX - sl.off);
    if (sl && st.pos !== before) Sound.whoosh(speedOf(sl, e.clientX));
    if (st.done || st.locking) endSlide(e);
  });
  function endSlide(e) {
    if (!sl || (e && e.pointerId !== sl.id)) return;
    try { track.releasePointerCapture(sl.id); } catch (x) {}
    sl = null; track.classList.remove('dragging'); Sound.whooshStop();
    if (!st.done && !st.locking && st.G && st.pos >= st.G.snapPos * 0.95) complete();
  }
  track.addEventListener('pointerup', endSlide);
  track.addEventListener('pointercancel', endSlide);
  track.addEventListener('lostpointercapture', endSlide);

  /* keyboard: arrows move S / the handle, End finishes, PageDown/PageUp = next/prev (presentation clickers) */
  function keyStep(e) {
    if (!st.G || st.done || st.locking || st.lonely) return;
    var step = st.G.snapPos / 20, target = null;
    if (e.key === 'ArrowRight') target = st.pos + step;
    else if (e.key === 'ArrowLeft') target = st.pos - step;
    else if (e.key === 'End') { e.preventDefault(); complete(); return; }
    else if (e.key === 'Home') target = 0;
    if (target === null) return;
    e.preventDefault();
    var from = st.pos, to = clamp(target, 0, st.G.snapPos);
    if (to >= st.G.snapPos * 0.985) { complete(); return; }
    tween(from, to, 160, function (v) { setPos(v); });
  }
  mover.addEventListener('keydown', keyStep); track.addEventListener('keydown', keyStep);
  document.addEventListener('keydown', function (e) {
    if ($('play').hidden || st.idx < 0) return;
    if (e.key === 'PageDown') { e.preventDefault(); loadWord(st.idx + 1); }
    else if (e.key === 'PageUp') { e.preventDefault(); loadWord(st.idx - 1); }
  });

  /* stop page scroll, bounce and pinch-zoom while touching the play area (iOS Safari) */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (t) { document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false }); });
  $('play').addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { if (!$('play').hidden) e.preventDefault(); });

  /* ---------- buttons ---------- */
  $('btnPrev').addEventListener('click', function () { loadWord(st.idx - 1); });
  $('btnNext').addEventListener('click', function () { loadWord(st.idx + 1); });
  $('btnReset').addEventListener('click', reset);
  el.leave.addEventListener('click', toggleLonely);
  $('btnWords').addEventListener('click', function () { var w = WORDS[st.idx]; showPicker(w ? w.group : null); });
  $('btnSay').addEventListener('click', function () { st.say = !st.say; $('btnSay').setAttribute('aria-pressed', String(st.say)); renderSay(); });
  $('modeDrag').addEventListener('click', function () { setMode('drag'); });
  $('modeSlide').addEventListener('click', function () { setMode('slide'); });
  function renderSound() {
    var on = Sound.isOn(), b = $('btnSound');
    b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    b.classList.toggle('muted', !on); app.dataset.sound = on ? 'on' : 'off';
  }
  $('btnSound').addEventListener('click', function () { Sound.setOn(!Sound.isOn()); renderSound(); });   // not remembered: always starts ON

  /* ---------- start ---------- */
  function start(data) {
    DATA = data; WORDS = DATA.words; FR = DATA.friend || { letters: 's', side: 'left', name: 'S', hold: 's' };
    DATA.groups.forEach(function (g) { GROUPS[g.id] = g; });
    LET = DATA.letters || {};
    document.title = (DATA.title || 'Blend Buddies') + ' – ' + (DATA.subtitle || '');
    buildPicker(); renderSound();
    var relayout = function () { if (st.idx >= 0) layout(); };
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(wrap); else window.addEventListener('resize', relayout);
    var q = new URLSearchParams(location.search);
    var m = norm(q.get('m') || q.get('mode'));
    setMode(m === 'slider' || m === 'slide' || m === 'b' ? 'slide' : 'drag');
    if (q.get('say') === '1') { st.say = true; $('btnSay').setAttribute('aria-pressed', 'true'); }
    var w = q.get('w'), g = norm(q.get('g')).replace(/-/g, '');
    if (w) { var i = findWord(w); if (i >= 0) loadWord(i); else showPicker(GROUPS[g] ? g : null, w); }
    else showPicker(GROUPS[g] ? g : null);
    app.dataset.ready = '1';
  }
  var fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('600 100px Fredoka'), document.fonts.load('700 30px Fredoka')]).catch(function () {})
    : Promise.resolve();
  var wordsReady = fetch('words.json', { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('words.json ' + r.status); return r.json(); });
  Promise.all([wordsReady, fontsReady]).then(function (v) { start(v[0]); }, function () {
    app.textContent = '';
    var p = document.createElement('p'); p.className = 'load-error';
    p.textContent = 'The word list (words.json) could not load. Open this page from its web address (it does not work as a file opened straight from a folder).';
    app.appendChild(p); app.dataset.ready = 'error';
  });
})();
