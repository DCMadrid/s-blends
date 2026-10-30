/* ===================== Blend Buddies – DATA TALLY (trial add-on) =====================
   Logs each child answer on the listen slides: { pair, target (the word said), tapped, correct }.
   The target comes from "Play a word", or the adult marks what they said with the small "I said:" chips.
   No target = nothing logged.

   PRIVACY: everything lives in this one in-memory array for the current page only. No cookies, no
   localStorage / sessionStorage / IndexedDB, no network, no names or other identifying fields.
   Reloading or closing the page clears it.

   TO REMOVE: delete this file, its <script src="tally.js"> line in index.html, and the
   "TALLY" block at the end of style.css. app.js keeps working (its hook() calls become no-ops).
   Off by default; a small switch on the listen slides turns it on, or link with ?tally=on.
   ===================================================================================== */
(function () {
  'use strict';
  var on = /(?:^|[?&])tally=on(?:&|$)/i.test(location.search);
  var trials = [];      // in memory only
  var ctx = null, open = null, target = null, ui = null;

  function h(tag, cls, text, parent) {
    var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; if (parent) parent.appendChild(n); return n;
  }
  function counts(set) {
    var t = trials.filter(function (x) { return x.set === set; }), ok = t.filter(function (x) { return x.correct; }).length;
    return { list: t, tried: t.length, correct: ok, missed: t.length - ok };
  }
  function build(c) {
    var slot = c.slot; slot.textContent = '';
    ui = { box: h('div', 'tally', '', slot) };
    ui.sw = h('button', 'tally-switch', '', ui.box); ui.sw.type = 'button'; ui.sw.setAttribute('role', 'switch'); ui.sw.id = 'tallySwitch';
    h('span', 'tally-knob', '', ui.sw); h('span', 'tally-sw-label', 'Tally', ui.sw);
    ui.sw.addEventListener('click', function () { on = !on; if (!on) hideSummary(); render(); c.refreshURL && c.refreshURL(); });
    ui.said = h('div', 'tally-said', '', ui.box); ui.said.id = 'tallySaid';
    h('span', 'tally-said-q', 'I said:', ui.said);
    ui.chips = c.words.map(function (w) {
      var b = h('button', 'tally-chip', w, ui.said); b.type = 'button'; b.dataset.word = w;
      b.addEventListener('click', function () { c.setTarget(target === w ? null : w); });
      return b;
    });
    ui.count = h('span', 'tally-count', '', ui.box); ui.count.id = 'tallyCount';
    render();
  }
  function render() {
    if (!ui) return;
    ui.sw.setAttribute('aria-checked', String(on)); ui.sw.setAttribute('aria-label', 'Tally ' + (on ? 'on' : 'off'));
    ui.box.classList.toggle('is-on', on);
    ui.said.hidden = !on; ui.count.hidden = !on;
    ui.chips.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.word === target)); });
    if (ctx) { var k = counts(ctx.set); ui.count.textContent = k.tried + ' tried · ' + k.correct + ' correct'; }
    document.documentElement.dataset.tally = on ? 'on' : 'off';
  }
  function hideSummary() { if (open) { open.parentNode && open.parentNode.removeChild(open); open = null; } }
  function showSummary(c) {
    hideSummary();
    var k = counts(c.set), card = h('div', 'tally-summary', '', c.overlayHost); card.id = 'tallySummary'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Tally for ' + c.setName);
    h('h3', 'tally-title', c.setName + ' · listening', card);
    var line = h('p', 'tally-line', '', card); line.id = 'tallyLine';
    line.textContent = k.tried + ' tried · ' + k.correct + ' correct · ' + k.missed + ' missed';
    var d = h('details', 'tally-misses', '', card); d.id = 'tallyMisses';
    h('summary', '', 'Misses (' + k.missed + ')', d);
    var ul = h('ul', '', '', d);
    k.list.filter(function (x) { return !x.correct; }).forEach(function (x) {
      var li = h('li', '', x.pair + ' · said “' + x.target + '” · tapped “' + x.tapped + '”', ul); li.dataset.pair = x.pair;
    });
    if (!k.missed) h('li', 'tally-none', 'No misses.', ul);
    var row = h('div', 'tally-actions', '', card);
    var clr = h('button', 'btn tally-clear', 'Clear tally', row); clr.type = 'button'; clr.id = 'tallyClear';
    clr.addEventListener('click', function () { trials = trials.filter(function (x) { return x.set !== c.set; }); showSummary(c); render(); });
    var go = h('button', 'btn tally-go', 'Keep going', row); go.type = 'button'; go.id = 'tallyGo';
    go.addEventListener('click', function () { hideSummary(); c.next(); });
    h('p', 'tally-note', 'Not saved. Write it down before closing.', card);
    open = card; open.dataset.set = c.set;
  }

  window.BBTally = {   // read-only view, for the tests
    isOn: function () { return on; },
    snapshot: function () { return trials.map(function (x) { return { pair: x.pair, set: x.set, target: x.target, tapped: x.tapped, correct: x.correct, source: x.source }; }); }
  };
  window.BlendBuddiesHooks = {
    slide: function (c) { hideSummary(); ctx = c; target = null; build(c); },
    target: function (d) { target = d.word || null; render(); },
    answer: function (d) {
      if (!on || !d.target) return;
      trials.push({ pair: d.pair, set: d.set, target: d.target, tapped: d.tapped, correct: !!d.correct, source: d.source });
      render();
    },
    setEnd: function (d) {
      if (!on) return false;
      if (open) { hideSummary(); return false; }   // pressing Next again moves on
      showSummary(d.ctx); return true;
    },
    leave: function () { hideSummary(); ctx = null; target = null; if (ui && ui.box.parentNode) ui.box.parentNode.removeChild(ui.box); ui = null; },
    urlExtra: function () { return on ? 'tally=on' : ''; }
  };
})();
