/*
 * Nachgebaute Teile aus AQUAflow — statt Screenshots, ohne Fensterrahmen.
 *
 * Die Quelle trägt nur Platzhalter (<div data-nachbau="…">). Daraus wird:
 *   pipeline    Spalten je Stage, Karten lassen sich in eine andere Spalte ziehen
 *   vorlage     Vorlagen-Editor: Stellen links, Blatt rechts, Werte füllen sich
 *   teilnehmer  Teilnehmerliste mit Suche, die live filtert
 *   amsfelder   Zuordnung Akte → AMS-Maske, die Maske füllt sich Feld für Feld
 *
 * Aufbau und Begriffe folgen dem Programm (VorlagenEditorTeile.tsx,
 * TemplateMappingEditor.tsx, Pipeline, AmsFelder). Alle Namen und Werte sind
 * erfunden.
 */
(function () {
  'use strict';

  var GRUEN = '#135A3F', ROT = '#B3402E';
  var APP = '-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif';
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAGE = {
    aufgebucht: ['Aufgebucht', [59, 130, 246]],
    erstkontakt: ['Erstkontakt', [99, 102, 241]],
    suche: ['Suche', [139, 92, 246]],
    vorstellung: ['Vorstellung', [192, 38, 211]],
    massnahme: ['In Maßnahme', [22, 163, 74]]
  };
  function rgb(c, a) { return a == null ? 'rgb(' + c.join(',') + ')' : 'rgba(' + c.join(',') + ',' + a + ')'; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function datum(tage) {
    var d = new Date();
    d.setDate(d.getDate() + tage);
    return d.toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  // Einmal, sobald sichtbar.
  function beimZeigen(el, fn) {
    if (ruhig || !('IntersectionObserver' in window)) { fn(true); return; }
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { io.disconnect(); fn(false); }
    }, { threshold: 0.35 });
    io.observe(el);
  }

  var CSS = [
    '[data-nachbau]{font-family:' + APP + ';color:#18181b;font-size:13px;line-height:1.4}',
    '.nb-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;white-space:nowrap}',
    '.nb-brand{border:1px solid rgba(19,90,63,.35);background:rgba(19,90,63,.1);color:' + GRUEN + '}',
    '.nb-krit{background:rgba(179,64,46,.1);color:' + ROT + '}',
    '.nb-leise{background:rgba(0,0,0,.05);color:#52525b}',
    '.nb-label{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#71717a}',
    '@keyframes nb-ein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
    '.nb-ein{animation:nb-ein .4s ease both}',

    // Pipeline
    '.nb-pipe{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(210px,1fr);gap:14px;overflow-x:auto;padding:6px 2px 14px;scroll-snap-type:x mandatory}',
    '.nb-spalte{display:flex;flex-direction:column;gap:10px;min-height:340px;padding:12px;border-radius:16px;background:rgba(255,255,255,.55);scroll-snap-align:start;transition:background .2s,box-shadow .2s}',
    '.nb-spalte.ziel{background:rgba(255,255,255,.9);box-shadow:0 0 0 2px var(--f) inset}',
    '.nb-spalte-kopf{display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:3px solid var(--f);font-weight:600;font-size:14px}',
    '.nb-zahl{margin-left:auto;min-width:22px;padding:1px 7px;border-radius:999px;background:var(--fa);color:var(--f);font-size:12px;text-align:center}',
    '.nb-karte{display:grid;gap:6px;padding:12px;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06),0 6px 14px -8px rgba(0,0,0,.12);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:box-shadow .2s,transform .2s,outline-color .4s;outline:2px solid transparent}',
    '.nb-karte:hover{box-shadow:0 1px 2px rgba(0,0,0,.06),0 12px 24px -10px rgba(0,0,0,.18)}',
    '.nb-karte.frisch{outline-color:var(--f)}',
    '.nb-karte b{font-size:14px;font-weight:600}',
    '.nb-karte .nb-sub{font-size:12px;color:#71717a}',
    '.nb-zieh{position:fixed;z-index:50;pointer-events:none;transform:rotate(2deg);box-shadow:0 24px 48px -12px rgba(0,0,0,.28)!important;width:200px}',
    '.nb-platz{border:2px dashed rgba(0,0,0,.12);border-radius:12px;min-height:70px;background:transparent}',
    '.nb-hinweis{font-family:"IBM Plex Mono",monospace;font-size:12px;color:#616C79;margin-top:6px}',

    // Vorlage
    '.nb-schritte{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;margin-bottom:22px;font-size:13px}',
    '.nb-schritt{display:flex;align-items:center;gap:8px;color:#a1a1aa}',
    '.nb-schritt i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;border:1.5px solid currentColor;font-style:normal;font-size:11px;font-weight:600}',
    '.nb-schritt.erledigt{color:' + GRUEN + '}.nb-schritt.erledigt i{background:' + GRUEN + ';border-color:' + GRUEN + ';color:#fff}',
    '.nb-schritt.jetzt{color:#18181b;font-weight:600}.nb-schritt.jetzt i{border-color:#18181b}',
    '.nb-schritt-linie{width:22px;height:1px;background:#d4d4d8}',
    '.nb-vorlage{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:clamp(24px,4vw,56px);align-items:start}',
    '.nb-tab{width:100%;border-collapse:collapse}',
    '.nb-tab th{padding:6px 8px;text-align:left}',
    '.nb-tab td{padding:8px;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:top}',
    '.nb-tab tr.nb-zeile{cursor:pointer;transition:background .15s}',
    '.nb-tab tr.nb-zeile:hover,.nb-tab tr.nb-zeile.an{background:rgba(19,90,63,.07)}',
    '.nb-tab .nb-art{font-size:11px;color:#a1a1aa}',
    '.nb-tab .nb-wert{display:block;margin-top:4px;font-size:12px;color:#52525b;min-height:16px}',
    '.nb-tab .nb-leer{color:' + ROT + ';font-weight:600}',
    '.nb-gruppe th{padding-top:16px}',
    '.nb-blatt{position:relative;aspect-ratio:1/1.3;padding:9% 10%;background:#fff;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06),0 30px 60px -24px rgba(12,46,34,.25);font-size:11px;color:#3f3f46}',
    '.nb-blatt h4{margin:0 0 4px;font-size:17px;font-weight:600;color:#18181b;letter-spacing:-.01em}',
    '.nb-blatt .nb-kl{display:block;margin-bottom:14px;font-size:10px;color:#a1a1aa}',
    '.nb-feld{display:grid;grid-template-columns:38% 1fr;gap:8px;align-items:end;margin:9px 0}',
    '.nb-feld span:last-child{min-height:18px;padding:1px 6px;border-bottom:1px solid #d4d4d8;border-radius:3px 3px 0 0;color:#18181b;font-weight:500;transition:background .3s,box-shadow .3s}',
    '.nb-feld.voll span:last-child{background:rgba(19,90,63,.08)}',
    '.nb-feld.leer span:last-child{box-shadow:0 0 0 1.5px rgba(179,64,46,.6) inset;background:rgba(179,64,46,.05)}',
    '.nb-feld.an span:last-child{box-shadow:0 0 0 2px ' + GRUEN + ' inset}',
    '.nb-kasten{display:inline-grid;place-items:center;width:13px;height:13px;border:1.5px solid #71717a;border-radius:2px;font-size:10px;line-height:1;color:' + GRUEN + '}',
    '.nb-text{display:grid;gap:5px;margin:16px 0}',
    '.nb-text i{display:block;height:5px;border-radius:3px;background:#ececea}',
    '.nb-unterschrift{display:flex;justify-content:space-between;margin-top:22px;font-size:10px;color:#a1a1aa}',
    '.nb-unterschrift span{width:42%;padding-top:4px;border-top:1px solid #a1a1aa}',

    // Teilnehmerliste
    '.nb-suche{display:flex;align-items:center;gap:8px;max-width:340px;margin-bottom:14px;padding:9px 12px;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06)}',
    '.nb-suche input{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:13px;color:#18181b}',
    '.nb-liste{display:grid;gap:6px}',
    '.nb-tn{display:grid;grid-template-columns:auto minmax(0,1.4fr) auto minmax(0,1fr);gap:12px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.75);transition:opacity .2s}',
    '.nb-ava{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;color:#fff;font-size:12px;font-weight:600}',
    '.nb-tn b{display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nb-tn small{color:#71717a;font-size:11px}',
    '.nb-zeit{display:grid;gap:4px;font-size:11px;color:#71717a}',
    '.nb-zeit i{display:block;height:4px;border-radius:2px;background:#e4e4e7;overflow:hidden}',
    '.nb-zeit i span{display:block;height:100%;background:#16a34a;border-radius:2px}',
    '.nb-nichts{padding:14px;color:#71717a;font-size:12px}',

    // AMS-Felder
    '.nb-ams{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(20px,3vw,40px);align-items:start}',
    '.nb-zuord{display:grid;gap:8px}',
    '.nb-zu{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:8px;align-items:center;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.75);font-size:12px}',
    '.nb-zu em{font-style:normal;color:#a1a1aa}',
    '.nb-maske{padding:16px;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06),0 24px 48px -24px rgba(12,46,34,.25)}',
    '.nb-maske-kopf{display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #c8102e;font-size:12px;font-weight:600}',
    '.nb-mf{display:grid;gap:3px;margin-bottom:9px;font-size:11px;color:#52525b}',
    '.nb-mf span{min-height:24px;padding:4px 8px;border:1px solid #d4d4d8;border-radius:3px;color:#18181b;font-size:12px;transition:border-color .3s,background .3s}',
    '.nb-mf.voll span{border-color:' + GRUEN + ';background:rgba(19,90,63,.05)}',
    '.nb-senden{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;color:#71717a}',
    '.nb-senden b{padding:6px 12px;border-radius:6px;background:#e4e4e7;color:#a1a1aa;font-weight:600;transition:background .3s,color .3s}',
    '.nb-senden.bereit b{background:' + GRUEN + ';color:#fff}',

    // Nach dem eigenen Platz, nicht nach dem Bildschirm: die halbe Spalte bei A—0x ist auch am Desktop schmal.
    '[data-nachbau]{container-type:inline-size}',
    '@container (max-width:680px){.nb-vorlage,.nb-ams{grid-template-columns:1fr}.nb-blatt{max-width:420px}}',
    '@container (max-width:520px){.nb-tn{grid-template-columns:auto minmax(0,1fr) auto}.nb-tn .nb-zeit{display:none}}',
    '@media (prefers-reduced-motion:reduce){.nb-ein{animation:none}}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  // ============================================================ Pipeline
  var KARTEN = [
    ['aufgebucht', 'Gruber Lisa-Marie', 'K1', 'Installationstechnik', 'Graz West', 'Erstkontakt offen · seit 9 Tagen'],
    ['aufgebucht', 'Yılmaz Emre', 'K2', 'Elektrotechnik', 'Leibnitz', null],
    ['erstkontakt', 'Kovalenko Olha', 'K3', 'Bürokauffrau', 'Graz Ost', null],
    ['suche', 'Hofer Jonas', 'K1', 'Metalltechnik', 'Deutschlandsberg', null],
    ['suche', 'Đurđević Ivana', 'K1', 'Einzelhandel', 'Graz West', null],
    ['vorstellung', 'Bauer Lena', 'K2', 'Köchin', 'Voitsberg', null],
    ['massnahme', 'Nikolić Marko', 'K1', 'Installationstechnik', 'Graz Ost', null]
  ];
  var VON_SELBST = {
    aufgebucht: 'Akte angelegt',
    erstkontakt: '✓ Einladung vorbereitet',
    suche: '✓ Passende Betriebe vorgeschlagen',
    vorstellung: '✓ Termin im Kalender',
    massnahme: '✓ Vereinbarung erstellt'
  };
  function pipeline(root) {
    root.innerHTML = '<div class="nb-pipe"></div><div class="nb-hinweis">Karten in eine andere Spalte ziehen — was dort von selbst passiert, steht an der Karte.</div>';
    var pipe = root.firstChild, spalten = {};
    Object.keys(STAGE).forEach(function (k) {
      var s = STAGE[k], sp = document.createElement('div');
      sp.className = 'nb-spalte';
      sp.dataset.stage = k;
      sp.style.setProperty('--f', rgb(s[1]));
      sp.style.setProperty('--fa', rgb(s[1], 0.12));
      sp.innerHTML = '<div class="nb-spalte-kopf">' + s[0] + '<span class="nb-zahl">0</span></div>';
      pipe.appendChild(sp);
      spalten[k] = sp;
    });
    var zaehlen = function () {
      Object.keys(spalten).forEach(function (k) {
        spalten[k].querySelector('.nb-zahl').textContent = spalten[k].querySelectorAll('.nb-karte').length;
      });
    };
    KARTEN.forEach(function (k) {
      var c = document.createElement('div');
      c.className = 'nb-karte';
      c.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><b>' + esc(k[1]) + '</b><span class="nb-chip nb-leise" style="margin-left:auto">' + k[2] + '</span></div>' +
        '<div class="nb-sub">' + esc(k[3]) + '</div>' +
        '<div class="nb-extra">' + (k[5] ? '<span class="nb-chip nb-krit">⚠ ' + esc(k[5]) + '</span>' : '') + '</div>' +
        '<div><span class="nb-chip nb-leise">' + esc(k[4]) + '</span></div>';
      spalten[k[0]].appendChild(c);
    });
    zaehlen();

    var zug = null;
    pipe.addEventListener('pointerdown', function (e) {
      var karte = e.target.closest('.nb-karte');
      if (!karte || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      var r = karte.getBoundingClientRect();
      var platz = document.createElement('div');
      platz.className = 'nb-platz';
      platz.style.height = r.height + 'px';
      karte.parentNode.insertBefore(platz, karte);
      var von = karte.parentNode.dataset.stage;
      karte.classList.add('nb-zieh');
      karte.style.width = r.width + 'px';
      karte.style.left = r.left + 'px';
      karte.style.top = r.top + 'px';
      document.body.appendChild(karte);
      zug = { karte: karte, platz: platz, von: von, dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { karte.setPointerCapture(e.pointerId); } catch (x) { /* ältere Browser */ }
    });
    var zielUnter = function (x, y) {
      var hit = null;
      Object.keys(spalten).forEach(function (k) {
        var r = spalten[k].getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top - 40 && y <= r.bottom + 40) hit = spalten[k];
      });
      return hit;
    };
    document.addEventListener('pointermove', function (e) {
      if (!zug || e.pointerId !== zug.id) return;
      zug.karte.style.left = (e.clientX - zug.dx) + 'px';
      zug.karte.style.top = (e.clientY - zug.dy) + 'px';
      var ziel = zielUnter(e.clientX, e.clientY);
      Object.keys(spalten).forEach(function (k) { spalten[k].classList.toggle('ziel', spalten[k] === ziel); });
      if (ziel && zug.platz.parentNode !== ziel) ziel.appendChild(zug.platz);
    });
    var ende = function (e) {
      if (!zug || e.pointerId !== zug.id) return;
      var k = zug.karte, ziel = zug.platz.parentNode;
      k.classList.remove('nb-zieh');
      k.style.cssText = '';
      ziel.insertBefore(k, zug.platz);
      zug.platz.remove();
      Object.keys(spalten).forEach(function (s) { spalten[s].classList.remove('ziel'); });
      var nach = ziel.dataset.stage;
      if (nach !== zug.von) {
        k.style.setProperty('--f', rgb(STAGE[nach][1]));
        k.querySelector('.nb-extra').innerHTML = '<span class="nb-chip nb-brand nb-ein">' + VON_SELBST[nach] + '</span>';
        k.classList.add('frisch');
        setTimeout(function () { k.classList.remove('frisch'); }, 1400);
      }
      zug = null;
      zaehlen();
    };
    document.addEventListener('pointerup', ende);
    document.addEventListener('pointercancel', ende);
  }

  // ============================================================ Vorlage
  var STELLEN = [
    ['Person', [
      ['name', 'Name', 'Platzhalter', 'Vor- und Nachname', 'Alex Beispiel'],
      ['geb', 'Geburtsdatum', 'Textfeld', 'Geburtsdatum', '14.03.2004'],
      ['adresse', 'Anschrift', 'Textfeld', 'Adresse', 'Musterweg 5, 8020 Graz'],
      ['tel', 'Telefon', 'Textfeld', 'Telefon', '']
    ]],
    ['Maßnahme', [
      ['beginn', 'Beginn', 'Textfeld', 'Maßnahmenbeginn', null],
      ['betrieb', 'Betrieb', 'Platzhalter', 'Betrieb', 'Muster Bau GmbH'],
      ['volljaehrig', 'Volljährig', 'Ankreuzfeld', 'aus Geburtsdatum', '✓']
    ]]
  ];
  function vorlage(root) {
    var schritte = ['Datei prüfen', 'Stellen zuordnen', 'Mit einer Akte testen', 'Freigeben'];
    var html = '<div class="nb-schritte">' + schritte.map(function (s, i) {
      return (i ? '<span class="nb-schritt-linie"></span>' : '') +
        '<span class="nb-schritt ' + (i < 2 ? 'erledigt' : i === 2 ? 'jetzt' : '') + '"><i>' + (i < 2 ? '✓' : i + 1) + '</i>' + s + '</span>';
    }).join('') + '</div>';
    html += '<div class="nb-vorlage"><table class="nb-tab"><thead><tr><th class="nb-label">Stelle</th><th class="nb-label">Art</th><th class="nb-label">Wert</th></tr></thead><tbody>';
    STELLEN.forEach(function (g) {
      var offen = g[1].filter(function (s) { return s[4] === '' || s[4] === null; }).length;
      html += '<tr class="nb-gruppe"><th colspan="3" class="nb-label">' + g[0] + ' · ' + (offen ? offen + ' offen' : 'alles belegt') + '</th></tr>';
      g[1].forEach(function (s) {
        html += '<tr class="nb-zeile" data-s="' + s[0] + '"><td><b style="font-weight:500">' + s[1] + '</b></td><td class="nb-art">' + s[2] + '</td><td>' +
          '<span class="nb-chip nb-brand">' + (s[0] === 'beginn' ? '„' + datum(9) + '“' : s[3]) + '</span><span class="nb-wert"></span></td></tr>';
      });
    });
    html += '</tbody></table>';
    html += '<div class="nb-blatt" aria-hidden="true"><h4>Vereinbarung</h4><span class="nb-kl">über die Teilnahme an der Maßnahme</span>' +
      '<div class="nb-feld" data-f="name"><span>Name</span><span></span></div>' +
      '<div class="nb-feld" data-f="geb"><span>Geburtsdatum</span><span></span></div>' +
      '<div class="nb-feld" data-f="adresse"><span>Anschrift</span><span></span></div>' +
      '<div class="nb-feld" data-f="tel"><span>Telefon</span><span></span></div>' +
      '<div class="nb-text"><i style="width:96%"></i><i style="width:88%"></i><i style="width:92%"></i><i style="width:60%"></i></div>' +
      '<div class="nb-feld" data-f="beginn"><span>Beginn</span><span></span></div>' +
      '<div class="nb-feld" data-f="betrieb"><span>Betrieb</span><span></span></div>' +
      '<div class="nb-feld" data-f="volljaehrig" style="grid-template-columns:auto 1fr"><span class="nb-kasten"></span><span style="border:0;background:none;font-weight:400;color:#3f3f46">volljährig</span></div>' +
      '<div class="nb-text"><i style="width:94%"></i><i style="width:70%"></i></div>' +
      '<div class="nb-unterschrift"><span>Ort, Datum</span><span>Unterschrift</span></div></div></div>';
    root.innerHTML = html;

    var alle = [];
    STELLEN.forEach(function (g) { g[1].forEach(function (s) { alle.push(s); }); });
    var feld = function (k) { return root.querySelector('[data-f="' + k + '"]'); };
    var zeile = function (k) { return root.querySelector('[data-s="' + k + '"]'); };
    var setze = function (s) {
      var wert = s[0] === 'beginn' ? datum(9) : s[4];
      var w = zeile(s[0]).querySelector('.nb-wert'), f = feld(s[0]);
      if (wert === '') {
        w.innerHTML = '<span class="nb-leer">bleibt leer</span> <span class="nb-chip nb-krit">Pflichtfeld ohne Wert</span>';
        f.classList.add('leer');
        return;
      }
      w.textContent = wert;
      w.classList.add('nb-ein');
      if (s[0] === 'volljaehrig') f.querySelector('.nb-kasten').textContent = '✓';
      else f.lastChild.textContent = wert;
      f.classList.add('voll');
    };
    alle.forEach(function (s) {
      var z = zeile(s[0]), f = feld(s[0]);
      z.addEventListener('mouseenter', function () { z.classList.add('an'); f.classList.add('an'); });
      z.addEventListener('mouseleave', function () { z.classList.remove('an'); f.classList.remove('an'); });
    });
    beimZeigen(root, function (sofort) {
      alle.forEach(function (s, i) {
        if (sofort) setze(s);
        else setTimeout(function () { setze(s); }, 300 + i * 320);
      });
    });
  }

  // ============================================================ Teilnehmerliste
  var TN = [
    ['Al-Hassan Ahmad', 'K2', 'aufgebucht', '#06b6d4', 0.08],
    ['Baumgartner Elias', 'K2', 'massnahme', '#f59e0b', 0.45],
    ['Brunner Theresa', 'K1', 'massnahme', '#a855f7', 0.7],
    ['Đurđević-Muratović Ivana', 'K1', 'vorstellung', '#6366f1', 0.2],
    ['Grabner Magdalena', 'K3', 'suche', '#0ea5e9', 0.3],
    ['Kovalenko Olha', 'K3', 'erstkontakt', '#ef4444', 0.05]
  ];
  function teilnehmer(root) {
    root.innerHTML = '<label class="nb-suche"><span aria-hidden="true" style="color:#a1a1aa">⌕</span>' +
      '<input type="search" placeholder="Teilnehmer:innen suchen …" aria-label="Teilnehmer:innen suchen" /></label><div class="nb-liste"></div>';
    var liste = root.querySelector('.nb-liste');
    TN.forEach(function (t) {
      var s = STAGE[t[2]], ini = t[0].split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('');
      var z = document.createElement('div');
      z.className = 'nb-tn';
      z.dataset.name = t[0].toLowerCase();
      z.innerHTML = '<span class="nb-ava" style="background:' + t[3] + '">' + ini + '</span>' +
        '<div style="min-width:0"><b>' + esc(t[0]) + '</b><small>' + t[1] + ' · Aktiv</small></div>' +
        '<span class="nb-chip" style="background:' + rgb(s[1], 0.12) + ';color:' + rgb(s[1]) + '">● ' + s[0] + '</span>' +
        '<div class="nb-zeit">' + (t[4] > 0.1 ? 'noch ' + Math.round((1 - t[4]) * 12) + ' Monate' : 'beginnt bald') + '<i><span style="width:' + (t[4] * 100) + '%"></span></i></div>';
      liste.appendChild(z);
    });
    var leer = document.createElement('div');
    leer.className = 'nb-nichts';
    leer.textContent = 'Niemand gefunden.';
    leer.hidden = true;
    liste.appendChild(leer);
    root.querySelector('input').addEventListener('input', function (e) {
      var q = e.target.value.trim().toLowerCase(), treffer = 0;
      root.querySelectorAll('.nb-tn').forEach(function (z) {
        var ja = !q || z.dataset.name.indexOf(q) > -1;
        z.hidden = !ja;
        if (ja) treffer++;
      });
      leer.hidden = treffer > 0;
    });
  }

  // ============================================================ AMS-Felder
  var AMS = [
    ['Vorname', 'Vorname', 'Alex'],
    ['Nachname', 'Familienname', 'Beispiel'],
    ['Geburtsdatum', 'Geburtsdatum', '14.03.2004'],
    ['Maßnahmenbeginn', 'Eintritt', null],
    ['Betrieb', 'Ausbildungsbetrieb', 'Muster Bau GmbH']
  ];
  function amsfelder(root) {
    root.innerHTML = '<div class="nb-ams"><div><div class="nb-label" style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Aus der Akte</span><span>In der Maske</span></div><div class="nb-zuord">' +
      AMS.map(function (a) {
        return '<div class="nb-zu"><span>' + a[0] + '</span><em>→</em><span class="nb-chip nb-brand" style="justify-self:end">Beschriftung „' + a[1].toLowerCase() + '“</span></div>';
      }).join('') +
      '</div></div><div class="nb-maske" aria-hidden="true"><div class="nb-maske-kopf"><span>Portal · Eingabemaske</span><span style="color:#a1a1aa;font-weight:400">Erstanfrage</span></div>' +
      AMS.map(function (a, i) { return '<div class="nb-mf" data-m="' + i + '">' + a[1] + '<span></span></div>'; }).join('') +
      '<div class="nb-senden"><span>Sie prüfen, dann wird gesendet</span><b>Senden</b></div></div></div>';
    var tippe = function (el, text, fertig) {
      if (ruhig) { el.textContent = text; fertig(); return; }
      var i = 0;
      (function schritt() {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(schritt, 35); else fertig();
      })();
    };
    beimZeigen(root, function () {
      var i = 0;
      (function naechstes() {
        if (i >= AMS.length) { root.querySelector('.nb-senden').classList.add('bereit'); return; }
        var a = AMS[i], f = root.querySelector('[data-m="' + i + '"]');
        var text = a[2] === null ? datum(9) : a[2];
        i++;
        tippe(f.querySelector('span'), text, function () { f.classList.add('voll'); setTimeout(naechstes, ruhig ? 0 : 180); });
      })();
    });
  }

  var BAU = { pipeline: pipeline, vorlage: vorlage, teilnehmer: teilnehmer, amsfelder: amsfelder };
  Array.prototype.forEach.call(document.querySelectorAll('[data-nachbau]'), function (el) {
    var f = BAU[el.dataset.nachbau];
    if (f) f(el);
  });
})();
