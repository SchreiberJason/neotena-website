/*
 * Interaktiver Ablauf im Stil der Startseite von reactflow.dev — ohne
 * Abhängigkeiten, ohne CDN (ein fremdes Skript schickte die IP jedes
 * Besuchers an einen Dritten).
 *
 * Wie dort: Eingabe-Knoten führen über gestrichelte, animierte Kanten in einen
 * Ausgabe-Knoten, der das Ergebnis live zeigt. Knoten lassen sich ziehen, die
 * Kanten folgen. Maße und Farben sind auf reactflow.dev gemessen (Karte mit
 * 16 px Rundung, Kopf in Mono 12 px, Griffe 10 px, Kanten 2 px gestrichelt,
 * Punktraster 20 px).
 *
 * Der Ablauf ist absichtlich abstrakt: eine Eingabe, eine Vorlage, zwei
 * Automatiken — kein echter Ablauf eines Kunden.
 */
(function () {
  'use strict';

  var root = document.getElementById('nf-flow');
  if (!root) return;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var GAP = 20;

  var CSS = [
    '#nf-flow{position:relative;min-height:460px;touch-action:pan-y}',
    '.nf-bg{position:absolute;left:-10%;top:-10%;width:120%;height:120%;pointer-events:none;' +
      '-webkit-mask-image:radial-gradient(ellipse at center,#000 45%,transparent 75%);mask-image:radial-gradient(ellipse at center,#000 45%,transparent 75%)}',
    '.nf-vp{position:absolute;left:0;top:0;transform-origin:0 0}',
    '.nf-glow{position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none}',
    '.nf-edges{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}',
    '.nf-edge{fill:none;stroke:#c2c2bc;stroke-width:2;stroke-dasharray:5;animation:nf-dash .5s linear infinite;transition:stroke .3s}',
    '.nf-edge.is-hot{stroke:#135A3F}',
    '@keyframes nf-dash{from{stroke-dashoffset:10}to{stroke-dashoffset:0}}',
    '.nf-node{position:absolute;left:0;top:0;display:flex;flex-direction:column;box-sizing:border-box;border:1px solid #e4e4e7;border-radius:16px;' +
      'background:rgba(255,255,255,.7);box-shadow:0 7px 9px 0 rgba(0,0,0,.02);color:#18181b;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:box-shadow .2s}',
    '.nf-node:hover{box-shadow:0 7px 18px 0 rgba(0,0,0,.06)}',
    '.nf-node.is-dragging{cursor:grabbing;box-shadow:0 12px 28px 0 rgba(0,0,0,.08)}',
    '.nf-head{padding:8px 12px;border-bottom:1px solid #e4e4e7;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:12px;font-weight:600;line-height:16px}',
    '.nf-body{position:relative;padding:12px;border-radius:0 0 16px 16px;background:#fff;font-size:12px;line-height:1.4}',
    '.nf-handle{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:100%;background:#9ca3af;pointer-events:none}',
    '.nf-nodrag{cursor:auto}',
    '.nf-input{width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #e4e4e7;border-radius:6px;background:#fff;font:inherit;font-size:12px;color:#18181b;outline:none}',
    '.nf-input:focus{border-color:#135A3F;box-shadow:0 0 0 3px rgba(19,90,63,.12)}',
    '.nf-radio{display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;color:#52525b}',
    '.nf-radio input{appearance:none;-webkit-appearance:none;width:14px;height:14px;margin:0;border:1px solid #a1a1aa;border-radius:50%;display:grid;place-items:center;cursor:pointer}',
    '.nf-radio input:checked{border-color:#135A3F}',
    '.nf-radio input:checked::after{content:"";width:8px;height:8px;border-radius:50%;background:#135A3F}',
    '.nf-radio input:focus-visible,.nf-switch input:focus-visible{outline:2px solid #135A3F;outline-offset:2px}',
    '.nf-switch{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 0;cursor:pointer;color:#52525b}',
    '.nf-switch input{appearance:none;-webkit-appearance:none;position:relative;flex:none;width:28px;height:16px;margin:0;border-radius:999px;background:#d4d4d8;cursor:pointer;transition:background .2s}',
    '.nf-switch input::after{content:"";position:absolute;left:2px;top:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:transform .2s}',
    '.nf-switch input:checked{background:#135A3F}',
    '.nf-switch input:checked::after{transform:translateX(12px)}',
    '.nf-doc{display:grid;gap:8px;padding:14px;border:1px solid #f0f0f0;border-radius:8px;background:#fcfcfb}',
    '.nf-doc-kicker{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#71717a}',
    '.nf-doc-title{font-size:15px;font-weight:600;letter-spacing:-.01em}',
    '.nf-doc-name{color:#135A3F;font-weight:600}',
    '.nf-doc-meta{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10px;color:#71717a}',
    '.nf-bar{height:6px;border-radius:999px;background:#e9e9e6;transform-origin:left;animation:nf-type .6s cubic-bezier(.2,.7,.2,1) both}',
    '.nf-bar:nth-child(2){animation-delay:.08s}.nf-bar:nth-child(3){animation-delay:.16s}.nf-bar:nth-child(4){animation-delay:.24s}',
    '@keyframes nf-type{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    '.nf-bars{display:grid;gap:6px;margin-top:2px}',
    '.nf-sign{display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px;padding-top:8px;border-top:1px dashed #e4e4e7}',
    '.nf-sign span:first-child{width:40%;height:1px;background:#a1a1aa}',
    '.nf-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;min-height:22px}',
    '.nf-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;background:rgba(19,90,63,.09);color:#135A3F;' +
      'font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10px;animation:nf-pop .3s ease both}',
    '@keyframes nf-pop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
    '.nf-fresh{animation:nf-fresh .5s ease}',
    '@keyframes nf-fresh{from{opacity:.35}to{opacity:1}}',
    '@media (prefers-reduced-motion:reduce){.nf-edge,.nf-bar,.nf-chip,.nf-fresh{animation:none}}'
  ].join('\n');

  // ----------------------------------------------------------------- Knoten
  var VORLAGEN = {
    vereinbarung: { label: 'Vereinbarung', titel: 'Vereinbarung', bars: [92, 78, 85, 40] },
    bestaetigung: { label: 'Bestätigung', titel: 'Bestätigung', bars: [80, 88, 52] },
    meldung: { label: 'Meldung', titel: 'Meldung', bars: [70, 90, 64, 82] }
  };
  var state = { name: 'Alex Beispiel', vorlage: 'vereinbarung', mail: true, frist: true };

  // Lagen im Ablauf (Flusskoordinaten): [x, y, Breite]. Ziel-Griffe am
  // Ergebnis wie auf reactflow.dev: drei Griffe untereinander, 20 px Abstand.
  // Schmale Schirme bekommen ein eigenes Layout statt einer Verkleinerung,
  // bei der niemand mehr etwas lesen kann.
  var LAYOUT = {
    breit: { eingabe: [100, 0, 180], vorlage: [0, 150, 180], automatik: [100, 330, 180], ergebnis: [430, 50, 260] },
    mittel: { eingabe: [80, 0, 160], vorlage: [0, 124, 160], automatik: [80, 282, 160], ergebnis: [336, 30, 176] },
    schmal: { eingabe: [0, 0, 160], vorlage: [0, 124, 160], automatik: [0, 280, 160], ergebnis: [176, 80, 176] }
  };
  var NODES = [
    { id: 'eingabe', target: 0 },
    { id: 'vorlage', target: 1 },
    { id: 'automatik', target: 2 },
    { id: 'ergebnis' }
  ];
  var mode = null;
  function applyLayout(m) {
    mode = m;
    NODES.forEach(function (n) {
      var l = LAYOUT[m][n.id];
      n.x = l[0];
      n.y = l[1];
      n.el.style.width = l[2] + 'px';
    });
  }
  var TARGET_Y = [52, 72, 92];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function datum(tage) {
    var d = new Date();
    d.setDate(d.getDate() + tage);
    return d.toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function bodyHtml(id) {
    if (id === 'eingabe') {
      return '<label style="display:grid;gap:6px;color:#52525b">Name' +
        '<input class="nf-input nf-nodrag" type="text" maxlength="40" autocomplete="off" spellcheck="false" data-k="name" value="' + esc(state.name) + '" /></label>';
    }
    if (id === 'vorlage') {
      return Object.keys(VORLAGEN).map(function (k) {
        return '<label class="nf-radio nf-nodrag"><input type="radio" name="nf-vorlage" value="' + k + '"' +
          (state.vorlage === k ? ' checked' : '') + ' />' + VORLAGEN[k].label + '</label>';
      }).join('');
    }
    if (id === 'automatik') {
      return '<label class="nf-switch nf-nodrag">Mail vorbereiten<input type="checkbox" data-k="mail"' + (state.mail ? ' checked' : '') + ' /></label>' +
        '<label class="nf-switch nf-nodrag">Frist überwachen<input type="checkbox" data-k="frist"' + (state.frist ? ' checked' : '') + ' /></label>';
    }
    return '<div class="nf-out"></div>';
  }

  // ------------------------------------------------------------------ Aufbau
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  root.innerHTML = '';

  var uid = 'nf' + Math.random().toString(36).slice(2, 7);
  var bg = document.createElementNS(SVGNS, 'svg');
  bg.setAttribute('class', 'nf-bg');
  bg.innerHTML = '<pattern id="' + uid + '" width="' + GAP + '" height="' + GAP + '" patternUnits="userSpaceOnUse">' +
    '<circle cx="0.5" cy="0.5" r="0.5" fill="#91919a"/></pattern><rect width="100%" height="100%" fill="url(#' + uid + ')"/>';
  root.appendChild(bg);

  var vp = document.createElement('div');
  vp.className = 'nf-vp';
  root.appendChild(vp);
  // Schimmer hinter den Knoten, wie die Farbwolke auf reactflow.dev.
  [['#7FD1A6', 0.35, 380, 220, 330], ['#135A3F', 0.14, 120, 120, 300]].forEach(function (g) {
    var d = document.createElement('div');
    d.className = 'nf-glow';
    d.style.cssText = 'background:' + g[0] + ';opacity:' + g[1] + ';left:' + (g[2] - g[4] / 2) + 'px;top:' +
      (g[3] - g[4] / 2) + 'px;width:' + g[4] + 'px;height:' + g[4] + 'px';
    vp.appendChild(d);
  });

  var edgeSvg = document.createElementNS(SVGNS, 'svg');
  edgeSvg.setAttribute('class', 'nf-edges');
  vp.appendChild(edgeSvg);

  var byId = {};
  NODES.forEach(function (n) {
    var el = document.createElement('div');
    el.className = 'nf-node';
    el.innerHTML = '<div class="nf-head">' + n.id + '</div><div class="nf-body">' + bodyHtml(n.id) + '</div>';
    if (n.id === 'ergebnis') {
      TARGET_Y.forEach(function (y) {
        var h = document.createElement('span');
        h.className = 'nf-handle';
        h.style.left = '0';
        h.style.top = y + 'px';
        el.appendChild(h);
      });
    } else {
      var h = document.createElement('span');
      h.className = 'nf-handle';
      h.style.left = '100%';
      h.style.top = '50%';
      el.appendChild(h);
      n.edge = document.createElementNS(SVGNS, 'path');
      n.edge.setAttribute('class', 'nf-edge');
      edgeSvg.appendChild(n.edge);
    }
    vp.appendChild(el);
    n.el = el;
    byId[n.id] = n;
  });
  var out = byId.ergebnis.el.querySelector('.nf-out');

  // ---------------------------------------------------------------- Ergebnis
  function render() {
    var v = VORLAGEN[state.vorlage];
    var name = state.name.trim() || '—';
    out.innerHTML =
      '<div class="nf-doc nf-fresh">' +
        '<div class="nf-doc-kicker">automatisch erstellt</div>' +
        '<div class="nf-doc-title">' + esc(v.titel) + ' für <span class="nf-doc-name">' + esc(name) + '</span></div>' +
        '<div class="nf-doc-meta">erstellt am ' + datum(0) + '</div>' +
        '<div class="nf-bars">' + v.bars.map(function (w) {
          return '<div class="nf-bar" style="width:' + w + '%"></div>';
        }).join('') + '</div>' +
        '<div class="nf-sign"><span></span><span class="nf-doc-meta">Unterschrift</span></div>' +
      '</div>' +
      '<div class="nf-chips">' +
        (state.mail ? '<span class="nf-chip">✓ Mail vorbereitet</span>' : '') +
        (state.frist ? '<span class="nf-chip">◷ Frist ' + datum(14) + '</span>' : '') +
      '</div>';
    schedule();
  }
  function pulse(id) {
    var e = byId[id] && byId[id].edge;
    if (!e) return;
    e.classList.add('is-hot');
    clearTimeout(e._t);
    e._t = setTimeout(function () { e.classList.remove('is-hot'); }, 700);
  }

  var typing = 0;
  root.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.dataset.k === 'name') {
      state.name = t.value;
      pulse('eingabe');
      clearTimeout(typing);
      typing = setTimeout(render, 120);
    }
  });
  root.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.name === 'nf-vorlage') { state.vorlage = t.value; pulse('vorlage'); render(); }
    if (t.dataset.k === 'mail' || t.dataset.k === 'frist') { state[t.dataset.k] = t.checked; pulse('automatik'); render(); }
  });

  // ------------------------------------------------------------- Zeichnen
  var view = { x: 0, y: 0, k: 1 };
  // Bezier wie getBezierPath() in @xyflow/system: Quelle rechts, Ziel links.
  function controlOffset(d) { return d >= 0 ? 0.5 * d : 0.25 * 25 * Math.sqrt(-d); }
  function bezier(sx, sy, tx, ty) {
    var c1 = sx + controlOffset(tx - sx), c2 = tx - controlOffset(tx - sx);
    return 'M' + sx + ',' + sy + ' C' + c1 + ',' + sy + ' ' + c2 + ',' + ty + ' ' + tx + ',' + ty;
  }
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; draw(); });
  }
  var pattern = bg.querySelector('pattern');
  function draw() {
    if (mode === null) return; // Lage erst nach dem ersten Einpassen bekannt
    vp.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.k + ')';
    pattern.setAttribute('width', GAP * view.k);
    pattern.setAttribute('height', GAP * view.k);
    var t = byId.ergebnis;
    NODES.forEach(function (n) {
      n.el.style.transform = 'translate(' + n.x + 'px,' + n.y + 'px)';
      if (!n.edge) return;
      var sx = n.x + n.el.offsetWidth, sy = n.y + n.el.offsetHeight / 2;
      n.edge.setAttribute('d', bezier(sx, sy, t.x, t.y + TARGET_Y[n.target]));
    });
  }
  function fit() {
    var W = root.clientWidth, H = root.clientHeight;
    if (!W || !H) return;
    var m = W < 440 ? 'schmal' : W < 640 ? 'mittel' : 'breit';
    if (m !== mode) applyLayout(m);
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    NODES.forEach(function (n) {
      x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x + n.el.offsetWidth); y1 = Math.max(y1, n.y + n.el.offsetHeight);
    });
    var pad = 24;
    var k = Math.min(1, (W - pad * 2) / (x1 - x0), (H - pad * 2) / (y1 - y0));
    view = { k: k, x: (W - (x1 - x0) * k) / 2 - x0 * k, y: (H - (y1 - y0) * k) / 2 - y0 * k };
    schedule();
  }

  // ----------------------------------------------------------------- Ziehen
  var drag = null;
  root.addEventListener('pointerdown', function (ev) {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    var el = ev.target.closest('.nf-node');
    if (!el || ev.target.closest('.nf-nodrag')) return;
    var n = NODES.filter(function (x) { return x.el === el; })[0];
    vp.appendChild(el); // nach vorn
    drag = { n: n, sx: ev.clientX, sy: ev.clientY, ox: n.x, oy: n.y, id: ev.pointerId };
    el.setPointerCapture(ev.pointerId);
    el.classList.add('is-dragging');
    ev.preventDefault();
  });
  root.addEventListener('pointermove', function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    drag.n.x = drag.ox + (ev.clientX - drag.sx) / view.k;
    drag.n.y = drag.oy + (ev.clientY - drag.sy) / view.k;
    schedule();
  });
  function stop(ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    drag.n.el.classList.remove('is-dragging');
    drag = null;
  }
  root.addEventListener('pointerup', stop);
  root.addEventListener('pointercancel', stop);

  // ------------------------------------------------------------------ Start
  render();
  // Die Seite blendet Unterseiten per [hidden] aus — eingepasst wird, sobald
  // die Fläche eine Größe hat, und bei jeder Größenänderung neu.
  new ResizeObserver(fit).observe(root);
})();
