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
    '.nb-pipe{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(150px,1fr);gap:14px;overflow-x:auto;padding:6px 2px 14px;scroll-snap-type:x mandatory}',
    '.nb-spalte{display:flex;flex-direction:column;gap:10px;min-height:340px;padding:12px;border-radius:16px;background:rgba(255,255,255,.55);scroll-snap-align:start;transition:background .2s,box-shadow .2s}',
    '.nb-spalte.ziel{background:rgba(255,255,255,.9);box-shadow:0 0 0 2px var(--f) inset}',
    '.nb-spalte-kopf{display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:3px solid var(--f);font-weight:600;font-size:14px}',
    '.nb-zahl{margin-left:auto;min-width:22px;padding:1px 7px;border-radius:999px;background:var(--fa);color:var(--f);font-size:12px;text-align:center}',
    '.nb-karte{display:grid;gap:6px;padding:12px;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06),0 6px 14px -8px rgba(0,0,0,.12);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:box-shadow .2s,transform .2s,outline-color .4s;outline:2px solid transparent}',
    '.nb-karte:hover{box-shadow:0 1px 2px rgba(0,0,0,.06),0 12px 24px -10px rgba(0,0,0,.18)}',
    '.nb-karte.frisch{outline-color:var(--f)}',
    '.nb-karte b{font-size:14px;font-weight:600}',
    '.nb-karte .nb-chip{white-space:normal;line-height:1.35}',
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
    '.nb-vorlage{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(24px,4vw,56px);align-items:start}',
    '.nb-vorlage > *{min-width:0}',
    '.nb-feld > span{min-width:0;overflow-wrap:anywhere}',
    '.nb-quellen{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 12px}',
    '.nb-quelle{width:auto;padding:7px 12px;font-size:12px;font-family:inherit;cursor:grab;touch-action:none;transition:opacity .2s,transform .2s}',
    '.nb-quelle:hover:not(:disabled){transform:translateY(-1px)}',
    '.nb-quelle:disabled{opacity:.35;cursor:default}',
    '.nb-geist{position:fixed;z-index:60;pointer-events:none;transform:translate(-50%,-50%) rotate(-3deg);box-shadow:0 12px 24px -8px rgba(0,0,0,.3);padding:7px 12px;font-size:12px}',
    '.nb-tipp{margin:0 0 20px;font-size:12px;color:#71717a}',
    '.nb-aktion{display:grid;gap:10px;justify-items:start}',
    '.nb-stand{font-size:12px;color:#71717a}',
    '.nb-warn{color:' + ROT + '}',
    '.nb-knopf{padding:10px 18px;border:0;border-radius:999px;background:' + GRUEN + ';color:#fff;font:inherit;font-weight:600;font-size:13px;cursor:pointer;width:auto}',
    '.nb-zurueck{padding:8px 14px;border:1px solid rgba(19,90,63,.35);border-radius:999px;background:transparent;color:' + GRUEN + ';font:inherit;font-size:12px;cursor:pointer;width:auto}',
    '.nb-slot em{font-style:normal;font-size:10px;color:#a1a1aa}',
    '.nb-feld.frei > span:last-child{border:1.5px dashed #c4c4c8;border-radius:4px}',
    '.nb-feld.ziel > span:last-child{border-color:' + GRUEN + ';background:rgba(19,90,63,.08)}',
    '.nb-feld.frisch > span:last-child{animation:nb-ein .4s ease}',
    '.nb-slot .nb-chip{font-size:10px;padding:1px 7px}',
    '.nb-blatt-wrap{display:grid;gap:14px;max-width:470px;width:100%;justify-self:center}',
    '.nb-leer{color:' + ROT + ';font-weight:600}',
    '.nb-blatt{transition:transform .5s cubic-bezier(.2,.7,.2,1),box-shadow .5s}',
    '.nb-blatt.gedruckt{transform:translateY(-6px) rotate(-1deg);box-shadow:0 1px 2px rgba(0,0,0,.06),0 40px 70px -24px rgba(12,46,34,.35)}',
    '.nb-datei{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06);animation:nb-ein .4s ease}',
    '.nb-datei[hidden]{display:none}',
    '.nb-datei b{display:block;font-size:13px}.nb-datei span{font-size:11px;color:#71717a}',
    '.nb-pdf{display:grid;place-items:center;flex:none;width:30px;height:36px;border-radius:4px;background:#B30B00;color:#fff;font-size:9px;font-weight:700}',
    '.nb-ok{margin-left:auto;color:' + GRUEN + ';font-weight:700}',
    '.nb-blatt{position:relative;padding:9% 10% 18%;background:#fff;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06),0 30px 60px -24px rgba(12,46,34,.25);font-size:11px;color:#3f3f46}',
    '.nb-blatt h4{margin:0 0 4px;font-size:17px;font-weight:600;color:#18181b;letter-spacing:-.01em}',
    '.nb-blatt .nb-kl{display:block;margin-bottom:14px;font-size:10px;color:#a1a1aa}',
    '.nb-feld{display:grid;grid-template-columns:38% 1fr;gap:8px;align-items:end;margin:9px 0}',
    '.nb-feld > span:last-child{min-height:18px;padding:1px 6px;border-bottom:1px solid #d4d4d8;border-radius:3px 3px 0 0;color:#18181b;font-weight:500;transition:background .3s,box-shadow .3s}',
    '.nb-feld.voll > span:last-child{background:rgba(19,90,63,.08)}',
    '.nb-feld.leer > span:last-child{box-shadow:0 0 0 1.5px rgba(179,64,46,.6) inset;background:rgba(179,64,46,.05)}',
    '.nb-feld.an > span:last-child{box-shadow:0 0 0 2px ' + GRUEN + ' inset}',
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

    // Anwesenheit
    '.aw-tab{display:grid;grid-template-columns:auto repeat(5,minmax(30px,44px));gap:6px;align-items:center;justify-content:start}',
    '.aw-tag{font-size:11px;font-weight:600;color:#71717a;text-align:center}',
    '.aw-name{padding-right:10px;font-size:13px;font-weight:500;white-space:nowrap}',
    '.aw-zelle{width:100%;aspect-ratio:1;border:0;border-radius:10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .2s,transform .15s}',
    '.aw-zelle:hover{transform:scale(1.06)}',
    '.aw-zelle:focus-visible{outline:2px solid ' + GRUEN + ';outline-offset:2px}',
    '.aw-da{background:rgba(19,90,63,.12);color:' + GRUEN + '}',
    '.aw-krank{background:rgba(245,158,11,.16);color:#B45309}',
    '.aw-fehlt{background:rgba(179,64,46,.14);color:' + ROT + '}',
    '.aw-fuss{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;margin-top:16px;font-size:12px;color:#52525b}',
    '.aw-fuss b{color:#18181b}',
    // Aufnahme-Portal — Werte aus portal/public/stil.css (Schrift 18 px, Karten 12 px, Kopf mit 5 px Linie)
    '.pt-buehne{display:grid;grid-template-columns:auto minmax(48px,.5fr) minmax(0,1.1fr);align-items:center}',
    '.pt-handy{width:252px;padding:9px;border-radius:40px;background:#1a202c;box-shadow:0 30px 60px -20px rgba(12,46,34,.35)}',
    '.pt-schirm{height:500px;overflow-y:auto;overflow-x:hidden;border-radius:31px;background:rgb(247,248,250);scrollbar-width:none}',
    '.pt-schirm::-webkit-scrollbar{display:none}',
    '.pt-seite{width:390px;zoom:.6;padding:0 16px 40px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5;color:rgb(26,32,44)}',
    '.ps-kopfzeile{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:5px solid rgb(31,90,142);border-bottom:1px solid rgb(205,213,224);margin:0 -16px;padding-left:16px;padding-right:16px}',
    '.ps-zeichen{display:grid;place-items:center;width:44px;height:44px;border-radius:8px;background:rgb(31,90,142);color:#fff;font-size:20px;font-weight:700}',
    '.ps-name{font-weight:700;font-size:18px;line-height:1.2}.ps-zusatz{font-size:14px;color:rgb(74,85,104)}',
    '.ps-h1{margin:20px 0 6px;font-size:28px;line-height:1.2;font-weight:700}',
    '.ps-h2{margin:0 0 16px;font-size:20px;line-height:1.3;font-weight:600}',
    '.ps-schritt{margin-bottom:12px;padding:10px 13px;border:1px solid rgb(205,213,224);border-radius:12px;background:#fff}',
    '.ps-schritt-jetzt{border:2px solid rgb(31,90,142);padding:9px 12px}',
    '.ps-kopf{display:flex;align-items:center;gap:14px}',
    '.ps-punkt{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:50%;border:2px solid rgb(205,213,224);font-size:16px;font-weight:700;color:rgb(74,85,104)}',
    '.ps-jetzt{border-color:rgb(31,90,142);color:rgb(31,90,142)}',
    '.ps-fertig{background:rgb(31,90,142);border-color:rgb(31,90,142);color:#fff}',
    '.ps-titel{font-size:18px;font-weight:700;line-height:1.3}',
    '.ps-wort{font-size:16px;color:rgb(74,85,104)}',
    '.ps-gut{color:rgb(3,112,78);font-weight:600}',
    '.ps-doks{margin:8px 0 4px 48px}',
    '.ps-dok{padding:14px 0 6px;border-top:1px solid rgb(205,213,224)}',
    '.ps-dok:first-child{border-top:0}',
    '.ps-dokname{font-weight:700;margin-bottom:6px}',
    '.ps-stand{font-size:18px}',
    '.ps-knopf{display:block;width:100%;margin:8px 0 4px;padding:11px 20px;border:0;border-radius:12px;background:rgb(31,90,142);color:#fff;font:inherit;font-weight:600;cursor:pointer}',
    '.ps-knopf:disabled{opacity:.45;cursor:default}',
    '.ps-knopf-zweit{background:#fff;color:rgb(26,32,44);border:2px solid rgb(74,85,104);padding:9px 18px}',
    '.ps-knoepfe{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.ps-datei{display:flex;justify-content:space-between;gap:8px;padding:6px 0;font-size:16px}',
    '.ps-klein{margin:16px 0 0;font-size:16px;color:rgb(74,85,104)}',
    '.pt-weg{position:relative;height:40px}',
    '.pt-linie{position:absolute;left:8px;right:8px;top:50%;border-top:2px dashed #c2c2bc}',
    '.pt-paket{position:absolute;top:calc(50% - 12px);left:0;padding:3px 8px;border-radius:6px;background:rgba(19,90,63,.1);color:' + GRUEN + ';font-family:"IBM Plex Mono",monospace;font-size:10px;white-space:nowrap;opacity:0}',
    '.pt-weg.faehrt .pt-paket{animation:pt-fahrt .85s ease-in-out}',
    '@keyframes pt-fahrt{0%{left:0;opacity:0}15%{opacity:1}85%{opacity:1}100%{left:calc(100% - 90px);opacity:0}}',
    '.pt-akte{display:grid;gap:10px;padding:16px;border-radius:16px;background:rgba(255,255,255,.75)}',
    '.pt-akte-kopf{display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(0,0,0,.06)}',
    '.pt-akte-kopf b{display:block;font-size:13px}.pt-akte-kopf small{font-size:11px;color:#71717a}',
    '.pt-eingang{display:grid;gap:8px;min-height:120px;align-content:start}',
    '.pt-doc{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:#fff;font-size:12px}',
    '.pt-doc .nb-pdf{width:24px;height:28px;font-size:8px}',
    '.pt-wartet{padding:20px 0;font-size:12px;color:#a1a1aa;text-align:center}',
    '@container (max-width:500px){.pt-buehne{grid-template-columns:1fr;justify-items:center;gap:10px}.pt-weg{width:40px;height:50px}.pt-linie{left:50%;right:auto;top:0;bottom:0;border-top:0;border-left:2px dashed #c2c2bc}.pt-weg .pt-paket{display:none}.pt-akte{width:100%;max-width:340px}}',
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
    ['suche', 'Bauer Lena', 'K2', 'Köchin', 'Voitsberg', null],
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
    ['aufgebucht', 'erstkontakt', 'suche', 'massnahme'].forEach(function (k) {
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
  // Wie im Vorlagen-Editor: Felder aus der Akte auf die Stellen der Datei
  // ziehen (Schritt 2), mit einer Akte testen (Schritt 3), dann erstellen.
  var QUELLEN = [
    ['name', 'Vor- und Nachname', 'Alex Beispiel'],
    ['geb', 'Geburtsdatum', '14.03.2004'],
    ['adresse', 'Adresse', 'Musterweg 5, 8020 Graz'],
    ['beginn', 'Maßnahmenbeginn', null],
    ['betrieb', 'Betrieb', 'Muster Bau GmbH'],
    ['tel', 'Telefon', '']
  ];
  var STELLEN_BLATT = [
    ['Name', 'name'], ['Geburtsdatum', 'geb'], ['Anschrift', null], ['Telefon', null],
    ['Beginn', null], ['Betrieb', 'betrieb']
  ];
  function vorlage(root) {
    var quelle = function (k) { return QUELLEN.filter(function (q) { return q[0] === k; })[0]; };
    var zuordnung = STELLEN_BLATT.map(function (s) { return s[1]; });
    var schritt = 2;
    var SCHRITTE = ['Datei prüfen', 'Stellen zuordnen', 'Mit einer Akte testen', 'Freigeben'];

    root.innerHTML =
      '<div class="nb-schritte"></div>' +
      '<div class="nb-vorlage">' +
        '<div class="nb-palette"><div class="nb-label">Aus der Akte</div><div class="nb-quellen">' +
          QUELLEN.map(function (q) { return '<button type="button" class="nb-chip nb-brand nb-quelle" data-q="' + q[0] + '">' + q[1] + '</button>'; }).join('') +
        '</div><p class="nb-tipp">Auf eine freie Stelle im Blatt ziehen — oder antippen.</p>' +
        '<div class="nb-aktion"></div></div>' +
        '<div class="nb-blatt-wrap"><div class="nb-blatt"><h4>Vereinbarung</h4><span class="nb-kl">über die Teilnahme an der Maßnahme</span>' +
          STELLEN_BLATT.map(function (s, i) {
            return (i === 4 ? '<div class="nb-text"><i style="width:96%"></i><i style="width:88%"></i><i style="width:62%"></i></div>' : '') +
              '<div class="nb-feld" data-i="' + i + '"><span>' + s[0] + '</span><span class="nb-slot"></span></div>';
          }).join('') +
          '<div class="nb-text"><i style="width:94%"></i><i style="width:70%"></i></div>' +
          '<div class="nb-unterschrift"><span>Ort, Datum</span><span>Unterschrift</span></div>' +
        '</div><div class="nb-datei" hidden></div></div>' +
      '</div>';
    var leiste = root.querySelector('.nb-schritte'), aktion = root.querySelector('.nb-aktion');
    var felder = Array.prototype.slice.call(root.querySelectorAll('.nb-feld'));
    var datei = root.querySelector('.nb-datei'), blatt = root.querySelector('.nb-blatt');

    function malen() {
      leiste.innerHTML = SCHRITTE.map(function (s, i) {
        var n = i + 1;
        return (i ? '<span class="nb-schritt-linie"></span>' : '') +
          '<span class="nb-schritt ' + (n < schritt ? 'erledigt' : n === schritt ? 'jetzt' : '') + '"><i>' + (n < schritt ? '✓' : n) + '</i>' + s + '</span>';
      }).join('');
      var offen = 0;
      felder.forEach(function (f, i) {
        var slot = f.querySelector('.nb-slot'), k = zuordnung[i];
        f.classList.remove('voll', 'leer', 'frei');
        if (!k) { offen++; f.classList.add('frei'); slot.innerHTML = '<em>Stelle · frei</em>'; return; }
        var q = quelle(k);
        if (schritt < 3) { slot.innerHTML = '<span class="nb-chip nb-brand">' + q[1] + '</span>'; return; }
        var wert = q[2] === null ? datum(9) : q[2];
        if (wert === '') { slot.innerHTML = '<span class="nb-leer">bleibt leer</span>'; f.classList.add('leer'); }
        else { slot.textContent = wert; f.classList.add('voll'); }
      });
      root.querySelectorAll('.nb-quelle').forEach(function (b) {
        b.disabled = schritt > 2 || zuordnung.indexOf(b.dataset.q) > -1;
      });
      if (schritt === 2) {
        aktion.innerHTML = offen
          ? '<span class="nb-stand">' + offen + ' Stelle' + (offen > 1 ? 'n' : '') + ' frei</span>'
          : '<button type="button" class="nb-knopf" data-a="test">Mit einer Akte testen</button>';
      } else if (schritt === 3) {
        var luecken = felder.filter(function (f) { return f.classList.contains('leer'); }).length;
        aktion.innerHTML = (luecken ? '<span class="nb-stand nb-warn">Telefon fehlt in der Akte — rot markiert, bevor etwas gedruckt wird.</span>' : '') +
          '<button type="button" class="nb-knopf" data-a="erstellen">Erstellen</button>';
      } else {
        aktion.innerHTML = '<button type="button" class="nb-zurueck" data-a="neu">Noch einmal</button>';
      }
    }
    function setze(i, k) {
      if (schritt !== 2 || zuordnung[i] || zuordnung.indexOf(k) > -1) return;
      zuordnung[i] = k;
      felder[i].classList.add('frisch');
      setTimeout(function () { felder[i].classList.remove('frisch'); }, 700);
      malen();
    }
    aktion.addEventListener('click', function (e) {
      var a = e.target.dataset.a;
      if (a === 'test') { schritt = 3; malen(); }
      if (a === 'erstellen') {
        schritt = 5;
        blatt.classList.add('gedruckt');
        datei.hidden = false;
        datei.innerHTML = '<span class="nb-pdf">PDF</span><div><b>Vereinbarung_Beispiel_Alex.pdf</b><span>in der Akte abgelegt · ' + datum(0) + '</span></div><span class="nb-ok">✓</span>';
        malen();
      }
      if (a === 'neu') {
        schritt = 2;
        zuordnung = STELLEN_BLATT.map(function (s) { return s[1]; });
        blatt.classList.remove('gedruckt');
        datei.hidden = true;
        malen();
      }
    });

    // Antippen: füllt die erste freie Stelle. Ziehen: genau die Stelle unter dem Finger.
    var zug = null;
    root.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.nb-quelle');
      if (!b || b.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      var g = b.cloneNode(true);
      g.classList.add('nb-geist');
      document.body.appendChild(g);
      zug = { k: b.dataset.q, g: g, x0: e.clientX, y0: e.clientY, id: e.pointerId, bewegt: false };
      zug.g.style.left = e.clientX + 'px';
      zug.g.style.top = e.clientY + 'px';
      try { b.setPointerCapture(e.pointerId); } catch (x) { /* ältere Browser */ }
    });
    var unter = function (x, y) {
      var hit = null;
      felder.forEach(function (f, i) {
        var r = f.getBoundingClientRect();
        if (!zuordnung[i] && x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) hit = i;
      });
      return hit;
    };
    document.addEventListener('pointermove', function (e) {
      if (!zug || e.pointerId !== zug.id) return;
      if (Math.abs(e.clientX - zug.x0) + Math.abs(e.clientY - zug.y0) > 4) zug.bewegt = true;
      zug.g.style.left = e.clientX + 'px';
      zug.g.style.top = e.clientY + 'px';
      var i = unter(e.clientX, e.clientY);
      felder.forEach(function (f, n) { f.classList.toggle('ziel', n === i); });
    });
    var los = function (e) {
      if (!zug || e.pointerId !== zug.id) return;
      var i = zug.bewegt ? unter(e.clientX, e.clientY) : zuordnung.indexOf(null);
      zug.g.remove();
      felder.forEach(function (f) { f.classList.remove('ziel'); });
      if (i != null && i > -1) setze(i, zug.k);
      zug = null;
    };
    document.addEventListener('pointerup', los);
    document.addEventListener('pointercancel', function (e) {
      if (zug && e.pointerId === zug.id) { zug.g.remove(); zug = null; }
    });
    malen();
  }

  // ============================================================ Anwesenheit
  // Eine Woche, drei Personen. Antippen wechselt: da → krank → fehlt → da.
  // Stundenliste und Hinweis rechnen sofort mit.
  function anwesenheit(root) {
    var TAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr'], STUNDEN = 7.5;
    var leute = [['Gruber L.', ['da', 'da', 'da', 'da', 'da']], ['Yılmaz E.', ['da', 'da', 'krank', 'da', 'da']], ['Hofer J.', ['da', 'da', 'da', 'fehlt', 'da']]];
    var ZEICHEN = { da: '✓', krank: 'K', fehlt: '!' }, NAME = { da: 'anwesend', krank: 'Krankenstand', fehlt: 'fehlt ohne Grund' };
    var kw = (function () {
      var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
      var w1 = new Date(d.getFullYear(), 0, 4);
      return 1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7);
    })();
    root.innerHTML = '<div class="aw-tab" role="grid" aria-label="Anwesenheit KW ' + kw + '"></div><div class="aw-fuss"></div>';
    var tab = root.querySelector('.aw-tab'), fuss = root.querySelector('.aw-fuss');
    function malen() {
      tab.innerHTML = '<span></span>' + TAGE.map(function (t) { return '<span class="aw-tag">' + t + '</span>'; }).join('') +
        leute.map(function (l, i) {
          return '<span class="aw-name">' + esc(l[0]) + '</span>' + l[1].map(function (z, j) {
            return '<button type="button" class="aw-zelle aw-' + z + '" data-i="' + i + '" data-j="' + j + '" aria-label="' + esc(l[0]) + ', ' + TAGE[j] + ': ' + NAME[z] + '">' + ZEICHEN[z] + '</button>';
          }).join('');
        }).join('');
      var da = 0, fehlt = 0;
      leute.forEach(function (l) { l[1].forEach(function (z) { if (z === 'da') da++; if (z === 'fehlt') fehlt++; }); });
      fuss.innerHTML = '<span>Stundenliste KW ' + kw + ' · <b>' + (da * STUNDEN).toLocaleString('de-AT') + ' h</b></span>' +
        (fehlt ? '<span class="nb-chip nb-krit">⚠ ' + fehlt + ' Fehltag' + (fehlt > 1 ? 'e' : '') + ' ohne Grund</span>' : '<span class="nb-chip nb-brand">✓ Woche vollständig</span>');
    }
    tab.addEventListener('click', function (e) {
      var b = e.target.closest('.aw-zelle');
      if (!b) return;
      var l = leute[+b.dataset.i][1], j = +b.dataset.j;
      l[j] = { da: 'krank', krank: 'fehlt', fehlt: 'da' }[l[j]];
      malen();
      var neu = tab.querySelector('[data-i="' + b.dataset.i + '"][data-j="' + j + '"]');
      if (neu) { neu.focus(); neu.classList.add('nb-ein'); }
    });
    malen();
  }

  // ============================================================ Aufnahme-Portal
  // Die Seite der Teilnehmerin wie in portal/public (aufnahme.html, stil.css):
  // in echter Breite (390 px) gebaut und ins Handy verkleinert, damit die
  // Verhältnisse stimmen. Rechts die Akte, in der die Unterlagen ankommen.
  // Name des Trägers bewusst neutral — kein Kundenname auf dieser Seite.
  function portal(root) {
    var gueltig = (function () {
      var d = new Date(); d.setDate(d.getDate() + 20);
      return d.toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna', day: 'numeric', month: 'long', year: 'numeric' });
    })();
    var neu = function () { return { sig: [false, false], offen2: false, dateien: { lebenslauf: [], foto: [] }, gesendet: false }; };
    var st = neu();
    root.innerHTML =
      '<div class="pt-buehne">' +
        '<div class="pt-handy"><div class="pt-schirm"><div class="pt-seite"></div></div></div>' +
        '<div class="pt-weg" aria-hidden="true"><span class="pt-linie"></span><span class="pt-paket">🔒 nur Chiffrat</span></div>' +
        '<div class="pt-akte"><div class="pt-akte-kopf"><span class="nb-ava" style="background:#0EA5E9">AB</span><div><b>Alex Beispiel</b><small>Akte · Dokumente</small></div></div>' +
          '<div class="pt-eingang"></div></div>' +
      '</div>';
    var seite = root.querySelector('.pt-seite'), eingang = root.querySelector('.pt-eingang'), weg = root.querySelector('.pt-weg');
    var DOKS = ['Datenschutzvereinbarung', 'Aufnahmeantrag'];
    var FAECHER = [['lebenslauf', 'Lebenslauf'], ['foto', 'Bewerbungsfoto']];

    function punkt(nr, zustand) {
      return '<span class="ps-punkt ps-' + zustand + '">' + (zustand === 'fertig' ? '✓' : nr) + '</span>';
    }
    function schritt(nr, titel, zustand, wort, rumpf) {
      return '<section class="ps-schritt' + (zustand === 'jetzt' ? ' ps-schritt-jetzt' : '') + '"><div class="ps-kopf">' + punkt(nr, zustand) +
        '<div><div class="ps-titel">Schritt ' + nr + ' von 3: ' + titel + '</div><div class="ps-wort' + (zustand === 'fertig' ? ' ps-gut' : '') + '">' + wort + '</div></div></div>' +
        (rumpf || '') + '</section>';
    }
    function malen() {
      var s1fertig = st.sig[0] && st.sig[1];
      var s2fertig = st.gesendet;
      var h = '<div class="ps-kopfzeile"><span class="ps-zeichen">B</span><div><div class="ps-name">Ihr Bildungsträger</div><div class="ps-zusatz">Aufnahme</div></div></div>' +
        '<h1 class="ps-h1">Hallo Alex!</h1><h2 class="ps-h2">Ihre Aufnahme in 3 Schritten.</h2>';
      // Schritt 1
      var r1 = '';
      if (!s1fertig) {
        r1 = '<div class="ps-doks">' + DOKS.map(function (d, i) {
          return '<div class="ps-dok"><div class="ps-dokname">' + d + '</div>' + (st.sig[i]
            ? '<div class="ps-gut ps-stand">✓ Unterschrieben</div>'
            : '<button type="button" class="ps-knopf ps-knopf-zweit" data-a="sig" data-i="' + i + '">Ansehen und unterschreiben</button>') + '</div>';
        }).join('') + '</div>';
      } else {
        r1 = '<div class="ps-doks">' + DOKS.map(function (d) { return '<div class="ps-dok"><div class="ps-dokname">' + d + '</div><div class="ps-gut ps-stand">✓ Unterschrieben</div></div>'; }).join('') + '</div>';
      }
      h += schritt(1, 'Unterschreiben', s1fertig ? 'fertig' : 'jetzt', s1fertig ? '✓ Unterschrieben' : 'Jetzt dran', r1);
      // Schritt 2
      if (!s1fertig) h += schritt(2, 'Lebenslauf und Foto', 'offen', 'Noch offen');
      else if (s2fertig) h += schritt(2, 'Lebenslauf und Foto', 'fertig', '✓ Abgeschickt');
      else if (!st.offen2) h += schritt(2, 'Lebenslauf und Foto', 'jetzt', 'Noch offen', '<button type="button" class="ps-knopf" data-a="weiter">Weiter: Lebenslauf und Foto</button>');
      else {
        var komplett = FAECHER.every(function (f) { return st.dateien[f[0]].length; });
        h += schritt(2, 'Lebenslauf und Foto', 'jetzt', 'Jetzt dran',
          '<div class="ps-doks">' + FAECHER.map(function (f) {
            return '<div class="ps-dok"><div class="ps-dokname">' + f[1] + '</div>' +
              st.dateien[f[0]].map(function (n) { return '<div class="ps-datei"><span>' + n + '</span><span class="ps-gut">✓ verschlüsselt</span></div>'; }).join('') +
              (st.dateien[f[0]].length ? '' : '<div class="ps-knoepfe"><button type="button" class="ps-knopf ps-knopf-zweit" data-a="datei" data-f="' + f[0] + '">Foto aufnehmen</button>' +
                '<button type="button" class="ps-knopf ps-knopf-zweit" data-a="datei" data-f="' + f[0] + '">Datei wählen</button></div>') + '</div>';
          }).join('') + '</div>' +
          '<button type="button" class="ps-knopf" data-a="senden"' + (komplett ? '' : ' disabled') + '>Abschicken</button>');
      }
      // Schritt 3
      h += schritt(3, 'Zeugnisse und Zertifikate', s2fertig ? 'jetzt' : 'offen', s2fertig ? 'Jetzt dran' : 'Noch offen');
      h += '<p class="ps-klein">Dieser Link gilt bis ' + gueltig + '. Sie können jederzeit aufhören und später mit diesem Link weitermachen.</p>' +
        '<p class="ps-klein">Ihre Angaben und Dateien werden auf Ihrem Gerät verschlüsselt. Nur Ihr Bildungsträger kann sie öffnen.</p>';
      seite.innerHTML = h;
      var doks = [];
      if (s1fertig) doks.push(['PDF', 'Datenschutzvereinbarung · unterschrieben'], ['PDF', 'Aufnahmeantrag · unterschrieben']);
      if (s2fertig) FAECHER.forEach(function (f) { st.dateien[f[0]].forEach(function (n) { doks.push(['JPG', f[1] + ' · ' + n]); }); });
      eingang.innerHTML = doks.length
        ? doks.map(function (d) { return '<div class="pt-doc nb-ein"><span class="nb-pdf">' + d[0] + '</span>' + d[1] + '<span class="nb-ok">✓</span></div>'; }).join('') +
          (s2fertig ? '<button type="button" class="nb-zurueck" data-a="neu" style="justify-self:start;margin-top:6px">Noch einmal</button>' : '')
        : '<div class="pt-wartet">Wartet auf Unterlagen …</div>';
    }
    function fahren(dann) {
      weg.classList.remove('faehrt'); void weg.offsetWidth; weg.classList.add('faehrt');
      setTimeout(dann, ruhig ? 0 : 850);
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]');
      if (!b || b.disabled) return;
      var a = b.dataset.a;
      if (a === 'sig') {
        st.sig[+b.dataset.i] = true;
        if (st.sig[0] && st.sig[1]) { fahren(malen); malen(); return; }
      }
      if (a === 'weiter') st.offen2 = true;
      if (a === 'datei') st.dateien[b.dataset.f].push((b.textContent.indexOf('Foto') > -1 ? 'Foto_' : 'Scan_') + (st.dateien[b.dataset.f].length + 1) + '.jpg');
      if (a === 'senden') { st.gesendet = true; fahren(malen); return; }
      if (a === 'neu') st = neu();
      malen();
    });
    malen();
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

  var BAU = { pipeline: pipeline, vorlage: vorlage, teilnehmer: teilnehmer, amsfelder: amsfelder, portal: portal, anwesenheit: anwesenheit };
  Array.prototype.forEach.call(document.querySelectorAll('[data-nachbau]'), function (el) {
    var f = BAU[el.dataset.nachbau];
    if (f) f(el);
  });
})();
