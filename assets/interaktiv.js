/*
 * Interaktive Bausteine der Seite. Die Quelle (src/Axion Website.dc.html)
 * trägt nur Ankerpunkte (data-nf, data-zaehl, #nf-datenweg); was daraus wird,
 * baut dieses Skript. Fehlt ein Anker, bleibt die Seite wie sie ist.
 *
 *   Blatt 03          Karten springen zum passenden Ablauf A—0x
 *   A—01 … A—06       Umschalter „heute / danach“
 *   Überschlag        frei werdende Vollzeitstellen als Figuren
 *   Referenzprojekt   Kennzahlen zählen beim Hineinscrollen hoch
 *   Bildungsträger    Pflichten anhaken, Auswahl geht in die Anfrage
 *   Sicherheit        „Wo liegen die Daten?“ — Cloud oder AQUAflow
 *   Preise            Größe einstellen, passendes Paket wird hervorgehoben
 */
(function () {
  'use strict';

  var GRUEN = '#135A3F', ROT = '#B3402E', MONO = "'IBM Plex Mono', monospace";
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CSS = [
    // Karten Blatt 03
    '[data-nf="karten"] > [role="link"]{cursor:pointer;transition:background .2s}',
    '[data-nf="karten"] > [role="link"]:focus-visible{outline:2px solid ' + GRUEN + ';outline-offset:-2px}',
    '.nf-mehr{display:inline-block;margin-left:6px;font-family:' + MONO + ';font-size:12px;color:' + GRUEN + ';white-space:nowrap;transition:transform .2s}',
    '[data-nf="karten"] > [role="link"]:hover .nf-mehr{transform:translateX(4px)}',
    '[data-nf="ablauf"]{scroll-margin-top:110px}',
    // heute / danach
    '.nf-seg{display:inline-flex;gap:2px;padding:3px;margin-bottom:12px;border:1px solid rgba(19,90,63,.22);border-radius:999px;background:rgba(255,255,255,.6)}',
    '.nf-seg button{width:auto;padding:6px 14px;border:0;border-radius:999px;background:transparent;font-family:' + MONO + ';font-size:12px;color:#616C79;cursor:pointer;transition:background .2s,color .2s}',
    '.nf-seg button[aria-pressed="true"]{background:' + GRUEN + ';color:#F4F3EE}',
    '.nf-seg button[aria-pressed="true"][data-w="heute"]{background:' + ROT + '}',
    '.nf-chaos{position:relative;overflow:hidden;border-radius:18px;border:1px solid rgba(179,64,46,.28);background:repeating-linear-gradient(0deg,#FBFAF7 0 27px,rgba(19,90,63,.06) 27px 28px)}',
    '.nf-datei{position:absolute;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.08);font-family:' + MONO + ';font-size:12px;color:#3C4A58;white-space:nowrap;animation:nf-wackel 3.2s ease-in-out infinite alternate}',
    '.nf-datei i{flex:none;width:14px;height:16px;border-radius:2px}',
    '@keyframes nf-wackel{to{transform:translate(3px,-4px) rotate(var(--r2))}}',
    '.nf-chaos-text{position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,rgba(251,250,247,.96) 40%);font-family:' + MONO + ';font-size:13px;color:' + ROT + '}',
    // Überschlag
    '.nf-stellen{margin:18px 0 4px}',
    '.nf-stellen-text{font-family:' + MONO + ';font-size:12px;color:#616C79;margin-bottom:10px}',
    '.nf-stellen-text b{color:' + GRUEN + ';font-weight:600}',
    '.nf-figuren{display:flex;flex-wrap:wrap;gap:4px}',
    '.nf-figur{position:relative;width:16px;height:24px}',
    '.nf-figur svg{position:absolute;inset:0;width:100%;height:100%}',
    '.nf-figur .v{clip-path:inset(0 calc(100% - var(--f)) 0 0);transition:clip-path .35s ease}',
    // Bildungsträger
    '.nf-hinweis{font-family:' + MONO + ';font-size:12px;color:#616C79;margin:0 0 12px}',
    '[data-nf="vorgaben"] > div{cursor:pointer;transition:background .2s}',
    '[data-nf="vorgaben"] > div.is-an{background:rgba(19,90,63,.07)}',
    '[data-nf="vorgaben"] > div > span:first-child{display:flex;align-items:flex-start}',
    '.nf-check{appearance:none;-webkit-appearance:none;flex:none;width:18px;height:18px;margin:2px 12px 0 0;border:1.5px solid rgba(19,90,63,.5);border-radius:5px;background:#fff;vertical-align:-3px;cursor:pointer;display:inline-grid;place-items:center}',
    '.nf-check:checked{background:' + GRUEN + ';border-color:' + GRUEN + '}',
    '.nf-check:checked::after{content:"";width:5px;height:9px;margin-top:-2px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}',
    '.nf-check:focus-visible{outline:2px solid ' + GRUEN + ';outline-offset:2px}',
    '.nf-auswahl{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 24px;margin-top:16px;padding:16px 20px;border-radius:14px;background:#0C2E22;color:#EAF2ED}',
    '.nf-auswahl span{font-family:' + MONO + ';font-size:13px}',
    '.nf-auswahl button{width:auto;padding:12px 22px;border:0;border-radius:999px;background:#7FD1A6;color:#0C2E22;font-family:' + MONO + ';font-size:12px;letter-spacing:.04em;cursor:pointer}',
    '.nf-auswahl button:disabled{opacity:.45;cursor:default}',
    // Preise
    '.nf-groesse{display:flex;flex-wrap:wrap;align-items:center;gap:16px 32px;margin:0 0 22px;padding:18px 22px;border-radius:16px;border:1px solid rgba(19,90,63,.22);background:rgba(255,255,255,.6)}',
    '.nf-groesse label{display:flex;align-items:center;gap:12px;font-family:' + MONO + ';font-size:12px;color:#3C4A58}',
    '.nf-groesse input[type="range"]{width:180px;accent-color:' + GRUEN + '}',
    '.nf-groesse b{min-width:2ch;color:' + GRUEN + ';font-size:15px}',
    '.nf-groesse input[type="checkbox"]{accent-color:' + GRUEN + ';width:16px;height:16px}',
    '[data-nf="pakete"] > div{position:relative;transition:transform .3s,opacity .3s,box-shadow .3s,border-color .3s}',
    '[data-nf="pakete"].is-aktiv > div{opacity:.55}',
    '[data-nf="pakete"].is-aktiv > div.is-passt{opacity:1;transform:translateY(-6px);border-color:' + GRUEN + ' !important;box-shadow:0 18px 40px rgba(19,90,63,.14)}',
    '.nf-passt{position:absolute;top:-11px;right:18px;padding:3px 10px;border-radius:999px;background:' + GRUEN + ';color:#F4F3EE;font-family:' + MONO + ';font-size:11px;opacity:0;transition:opacity .3s}',
    '.is-passt .nf-passt{opacity:1}',
    // Datenweg
    '.dw-schalter{display:inline-flex;gap:2px;padding:4px;margin-bottom:22px;border:1px solid rgba(19,90,63,.22);border-radius:999px;background:rgba(255,255,255,.6)}',
    '.dw-schalter button{width:auto;padding:10px 18px;border:0;border-radius:999px;background:transparent;font-family:' + MONO + ';font-size:12px;color:#616C79;cursor:pointer;transition:background .25s,color .25s}',
    '.dw-schalter button[aria-pressed="true"]{background:#0C2E22;color:#EAF2ED}',
    '.dw-flaeche{display:grid;grid-template-columns:minmax(0,1fr) minmax(120px,1.1fr) minmax(0,1fr);align-items:center;gap:0;padding:28px;border-radius:20px;border:1px solid rgba(19,90,63,.22);background:#FBFAF7}',
    '.dw-box{position:relative;min-height:190px;padding:18px;border-radius:16px;border:1px solid #e4e4e7;background:#fff;box-shadow:0 7px 9px rgba(0,0,0,.02);transition:border-color .4s,background .4s}',
    '.dw-kopf{font-family:' + MONO + ';font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#616C79;margin-bottom:10px}',
    '.dw-titel{font-size:17px;font-weight:600;margin-bottom:6px}',
    '.dw-text{font-size:14px;line-height:1.5;color:#3C4A58}',
    '.dw-saetze{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}',
    '.dw-satz{padding:3px 8px;border-radius:6px;font-family:' + MONO + ';font-size:11px}',
    '.dw-leitung{position:relative;height:190px}',
    '.dw-linie{position:absolute;left:0;right:0;top:50%;border-top:2px dashed #c2c2bc}',
    '.dw-label{position:absolute;left:8px;right:8px;top:calc(50% + 14px);text-align:center;font-family:' + MONO + ';font-size:11px;line-height:1.5;color:#616C79}',
    '.dw-paket{position:absolute;top:calc(50% - 13px);left:0;padding:4px 8px;border-radius:6px;font-family:' + MONO + ';font-size:11px;white-space:nowrap;animation:dw-fahrt 3.6s linear infinite;opacity:0}',
    '.dw-paket:nth-of-type(2){animation-delay:1.2s}.dw-paket:nth-of-type(3){animation-delay:2.4s}',
    '@keyframes dw-fahrt{0%{left:0;opacity:0}10%{opacity:1}85%{opacity:1}100%{left:calc(100% - 70px);opacity:0}}',
    '.dw-flaeche.is-lokal .dw-leitung{opacity:.75}',
    '.dw-folgen{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px 28px;margin:22px 0 0;padding:0}',
    '.dw-folgen li{display:flex;gap:10px;align-items:baseline;font-size:15px;line-height:1.5;color:#3C4A58;animation:nf-ein .35s ease both}',
    '.dw-folgen li span{flex:none;font-family:' + MONO + ';font-size:12px;font-weight:600}',
    '@keyframes nf-ein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
    '@media (max-width:760px){.dw-flaeche{grid-template-columns:1fr;padding:18px}.dw-leitung{height:110px}' +
      '.dw-linie{left:50%;right:auto;top:0;bottom:0;border-top:0;border-left:2px dashed #c2c2bc}' +
      '.dw-label{top:auto;bottom:6px;left:calc(50% + 14px);right:0;text-align:left}' +
      '.dw-paket{left:calc(50% - 30px);animation-name:dw-fahrt-v}' +
      '@keyframes dw-fahrt-v{0%{top:0;opacity:0}10%{opacity:1}85%{opacity:1}100%{top:calc(100% - 24px);opacity:0}}}',
    '@media (prefers-reduced-motion:reduce){.nf-datei,.dw-paket{animation:none}.dw-paket{opacity:1}.dw-paket:nth-of-type(2){left:40%}.dw-paket:nth-of-type(3){left:70%}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function knopf(text, attrs) {
    var b = el('button', '', text);
    b.type = 'button';
    for (var k in attrs) b.setAttribute(k, attrs[k]);
    return b;
  }
  function zahl(n, stellen) {
    return n.toLocaleString('de-AT', { minimumFractionDigits: stellen || 0, maximumFractionDigits: stellen || 0 });
  }

  // Seitenwechsel über das Hash-Routing der Seite, danach zum Anker scrollen.
  function gehe(seite, id) {
    var ziel = '#/' + seite;
    var springen = function () {
      var z = document.getElementById(id);
      if (z) z.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    };
    if (location.hash === ziel) { springen(); return; }
    location.hash = ziel;
    setTimeout(springen, 120);
  }

  // ---------------------------------------------------- Blatt 03 → A—0x
  var karten = $('[data-nf="karten"]');
  if (karten) {
    $$(':scope > div', karten).forEach(function (karte, i) {
      var id = 'ablauf-0' + (i + 1);
      if (!document.getElementById(id)) return;
      var titel = $('h3', karte);
      karte.setAttribute('role', 'link');
      karte.setAttribute('aria-label', (titel ? titel.textContent : 'Ablauf') + ' — im Detail');
      karte.tabIndex = 0;
      var p = $('p', karte);
      if (p) p.appendChild(el('span', 'nf-mehr', 'im Detail →'));
      karte.addEventListener('click', function () { gehe('prozesse', id); });
      karte.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gehe('prozesse', id); }
      });
    });
  }

  // ------------------------------------------------- A—0x heute / danach
  var DATEIEN = [
    ['TN_Liste_2026.xlsx', 'TN_Liste_2026_neu.xlsx', 'Kopie von TN_Liste.xlsx', 'Kontakte_Betreuung.xlsx', 'Statusliste_FINAL.xlsx', 'Statusliste_FINAL2.xlsx'],
    ['Vertrag_Vorlage.docx', 'Vertrag_Vorlage_alt.docx', 'Bestaetigung_2025.docx', 'Nachweis_leer.pdf', 'Vertrag_korr.docx', 'Vorlage (1).docx'],
    ['Liste_Standort_A.xlsx', 'Liste_Standort_B.xlsx', 'Auswertung_Q1.xlsx', 'Auswertung_Q1_v2.xlsx', 'Pivot_neu.xlsx', 'Abgleich.xlsx'],
    ['Anwesenheit_KW12.pdf', 'Stundenliste_Maerz.xlsx', 'Unterschriften_Scan.pdf', 'Fehlzeiten.xlsx', 'Anwesenheit_KW13.pdf', 'Stunden_korr.xlsx'],
    ['Betriebe_Kontakte.xlsx', 'Praktikumsplaetze.docx', 'Notizen_Vermittlung.txt', 'Betriebe_alt.xlsx', 'Mail: Re: Re: Platz?', 'Rueckmeldungen.docx'],
    ['Daten_fuer_Portal.xlsx', 'Abtipp_Hilfe.docx', 'Meldung_KW12.pdf', 'Portal_Notizen.txt', 'Meldung_KW13.pdf', 'Checkliste_Portal.docx']
  ];
  var FARBE = { xlsx: '#1D6F42', docx: '#2B579A', pdf: '#B30B00', txt: '#8A8F98' };
  var LAGE = [[6, 8, -4], [44, 4, 3], [16, 30, 2], [52, 34, -3], [8, 56, -2], [46, 62, 4]];

  $$('[data-nf="ablauf"]').forEach(function (zeile, i) {
    var spalten = $$(':scope > div', zeile);
    var bild = spalten.filter(function (s) { return !/A—0\d/.test(s.textContent.slice(0, 40)); })[0];
    if (!bild || !bild.firstElementChild) return;
    var heuteLabel = $$('span', zeile).filter(function (s) { return s.textContent.trim() === 'heute'; })[0];
    var heuteText = heuteLabel && heuteLabel.nextElementSibling ? heuteLabel.nextElementSibling.textContent : '';
    var karte = bild.firstElementChild;

    var chaos = el('div', 'nf-chaos');
    chaos.hidden = true;
    (DATEIEN[i] || DATEIEN[0]).forEach(function (name, k) {
      var d = el('div', 'nf-datei');
      var typ = (name.match(/\.(\w+)$/) || [0, 'txt'])[1];
      var l = LAGE[k];
      d.style.left = l[0] + '%';
      d.style.top = l[1] + '%';
      d.style.transform = 'rotate(' + l[2] + 'deg)';
      d.style.setProperty('--r2', (l[2] * -1) + 'deg');
      d.style.animationDelay = (k * -0.7) + 's';
      var ic = el('i');
      ic.style.background = FARBE[typ] || FARBE.txt;
      d.appendChild(ic);
      d.appendChild(document.createTextNode(name));
      chaos.appendChild(d);
    });
    chaos.appendChild(el('div', 'nf-chaos-text', '✕ heute: ' + heuteText));

    var seg = el('div', 'nf-seg');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Ansicht wechseln');
    var bHeute = knopf('heute', { 'data-w': 'heute', 'aria-pressed': 'false' });
    var bDanach = knopf('danach', { 'data-w': 'danach', 'aria-pressed': 'true' });
    seg.appendChild(bHeute);
    seg.appendChild(bDanach);
    bild.insertBefore(seg, karte);
    bild.appendChild(chaos);

    function zeige(w) {
      if (w === 'heute') chaos.style.height = Math.max(karte.offsetHeight, 280) + 'px';
      chaos.hidden = w !== 'heute';
      karte.hidden = w === 'heute';
      bHeute.setAttribute('aria-pressed', String(w === 'heute'));
      bDanach.setAttribute('aria-pressed', String(w !== 'heute'));
    }
    bHeute.addEventListener('click', function () { zeige('heute'); });
    bDanach.addEventListener('click', function () { zeige('danach'); });
  });

  // ------------------------------------------- Überschlag: Vollzeitstellen
  // 38,5 Wochenstunden × 46 Arbeitswochen; 60 % wie in der Rechnung daneben.
  var gespartEl = $('[data-bind="kostenGespart"]');
  var modelle = $$('[data-model]');
  if (gespartEl && modelle.length) {
    var anker = gespartEl.closest('div');
    var box = el('div', 'nf-stellen');
    var text = el('div', 'nf-stellen-text');
    var figuren = el('div', 'nf-figuren');
    box.appendChild(text);
    box.appendChild(figuren);
    anker.parentNode.insertBefore(box, anker.nextSibling);
    var FIGUR = '<path d="M8 2.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6ZM2.4 22.5c0-6.2 2.5-11 5.6-11s5.6 4.8 5.6 11Z"/>';
    var wert = function (k) {
      var i = modelle.filter(function (m) { return m.dataset.model === k; })[0];
      return i ? +i.value : 0;
    };
    var malen = function () {
      var frei = wert('mitarbeiter') * wert('stunden') * 46 * 0.6;
      var stellen = frei / (38.5 * 46);
      text.innerHTML = 'entspricht rund <b>' + zahl(stellen, stellen < 10 ? 1 : 0) + '</b> Vollzeitstellen';
      var n = Math.max(1, Math.ceil(stellen));
      while (figuren.children.length < n) {
        var f = el('span', 'nf-figur');
        f.innerHTML = '<svg viewBox="0 0 16 24" fill="rgba(19,90,63,.15)">' + FIGUR + '</svg>' +
          '<svg class="v" viewBox="0 0 16 24" fill="' + GRUEN + '">' + FIGUR + '</svg>';
        figuren.appendChild(f);
      }
      while (figuren.children.length > n) figuren.removeChild(figuren.lastChild);
      $$('.nf-figur', figuren).forEach(function (f, k) {
        var anteil = Math.max(0, Math.min(1, stellen - k));
        f.querySelector('.v').style.setProperty('--f', (anteil * 100) + '%');
      });
    };
    modelle.forEach(function (m) { m.addEventListener('input', malen); });
    malen();
  }

  // ---------------------------------------------------- Kennzahlen zählen
  var zaehler = $$('[data-zaehl]');
  if (zaehler.length && 'IntersectionObserver' in window && !ruhig) {
    var zaehle = function (e) {
      var ziel = e.dataset.zaehl;
      var m = ziel.match(/^(\d+)(.*)$/);
      if (!m) return;
      var bis = +m[1], rest = m[2], t0 = performance.now(), dauer = 900;
      (function schritt(t) {
        var p = Math.min(1, (t - t0) / dauer);
        e.textContent = Math.round(bis * (1 - Math.pow(1 - p, 3))) + rest;
        if (p < 1) requestAnimationFrame(schritt);
      })(t0);
    };
    var beob = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (en) {
        if (en.isIntersecting) { zaehle(en.target); beob.unobserve(en.target); }
      });
    }, { threshold: 0 });
    zaehler.forEach(function (z) {
      z.textContent = z.dataset.zaehl.replace(/^\d+/, '0');
      beob.observe(z);
    });
  }

  // -------------------------------------------- Bildungsträger: Pflichten
  var vorgaben = $('[data-nf="vorgaben"]');
  var textfeld = $('textarea[name="ablauf"]');
  if (vorgaben) {
    vorgaben.parentNode.insertBefore(el('p', 'nf-hinweis', 'Haken Sie an, was bei Ihnen gilt — die Auswahl geht auf Wunsch direkt in Ihre Anfrage.'), vorgaben);
    var zeilen = $$(':scope > div', vorgaben);
    var leiste = el('div', 'nf-auswahl');
    var stand = el('span');
    var los = knopf('Mit dieser Auswahl anfragen', {});
    leiste.appendChild(stand);
    leiste.appendChild(los);
    vorgaben.parentNode.insertBefore(leiste, vorgaben.nextSibling);

    var gewaehlt = function () {
      return zeilen.filter(function (z) { return z.classList.contains('is-an'); })
        .map(function (z) { return z.firstElementChild.textContent.trim(); });
    };
    var aktualisieren = function () {
      var g = gewaehlt();
      stand.textContent = g.length
        ? g.length + ' von ' + zeilen.length + ' Pflichten ausgewählt — alle in AQUAflow abgebildet'
        : 'Noch nichts ausgewählt';
      los.disabled = !g.length;
    };
    zeilen.forEach(function (z) {
      var titel = z.firstElementChild;
      if (!titel) return;
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'nf-check';
      box.setAttribute('aria-label', titel.textContent.trim());
      titel.insertBefore(box, titel.firstChild);
      box.addEventListener('change', function () { z.classList.toggle('is-an', box.checked); aktualisieren(); });
      z.addEventListener('click', function (e) {
        if (e.target === box) return;
        box.checked = !box.checked;
        box.dispatchEvent(new Event('change'));
      });
    });
    los.addEventListener('click', function () {
      var g = gewaehlt();
      if (textfeld) {
        textfeld.value = 'Diese Pflichten haben wir:\n' + g.map(function (t) { return '– ' + t; }).join('\n') + '\n\n';
        textfeld.dispatchEvent(new Event('input', { bubbles: true }));
      }
      var k = document.getElementById('kontakt');
      if (k) k.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth' });
      if (textfeld) setTimeout(function () { textfeld.focus({ preventScroll: true }); }, ruhig ? 0 : 700);
    });
    aktualisieren();
  }

  // ------------------------------------------------- Preise: Paketwahl
  var pakete = $('[data-nf="pakete"]');
  if (pakete) {
    var karten4 = $$(':scope > div', pakete);
    if (karten4.length === 4) {
      var regler = el('div', 'nf-groesse');
      regler.innerHTML =
        '<label>Mitarbeitende <input type="range" min="1" max="40" value="8" data-g="ma" /> <b data-g="ma-wert">8</b></label>' +
        '<label>Standorte <input type="range" min="1" max="5" value="1" data-g="st" /> <b data-g="st-wert">1</b></label>' +
        '<label><input type="checkbox" data-g="kurs" /> nur standardisierte Kursformate</label>' +
        '<span class="nf-hinweis" style="margin:0">Richtwert — das genaue Paket ergibt die Prozessaufnahme.</span>';
      pakete.parentNode.insertBefore(regler, pakete);
      karten4.forEach(function (k) { k.appendChild(el('span', 'nf-passt', 'passt zu Ihnen')); });
      var g = function (k) { return $('[data-g="' + k + '"]', regler); };
      var waehlen = function () {
        var ma = +g('ma').value, st = +g('st').value, kurs = g('kurs').checked;
        g('ma-wert').textContent = ma;
        g('st-wert').textContent = st;
        // 0 Kurs · 1 Klein · 2 Standard (5–15) · 3 Verbund
        var i = kurs ? 0 : st > 1 ? 3 : ma <= 4 ? 1 : ma <= 15 ? 2 : 3;
        pakete.classList.add('is-aktiv');
        karten4.forEach(function (k, n) { k.classList.toggle('is-passt', n === i); });
      };
      ['ma', 'st', 'kurs'].forEach(function (k) {
        g(k).addEventListener('input', waehlen);
        g(k).addEventListener('change', waehlen);
      });
      waehlen();
    }
  }

  // ------------------------------------------- Hero: Prozess-Kreis der Akte
  // Nachbau von ProzessKreis/SegmentedDonut aus AQUAflow: 270°-Bogen, ein
  // Segment je Stage, die jetzige in voller Dicke, die übrigen von außen um
  // 20 % schmaler; besucht in voller Farbe, als Nächstes möglich mit
  // Deckung 0,45, offen mit 0,2. Die Person wandert langsam weiter.
  var kreisRoot = document.getElementById('nf-kreis');
  if (kreisRoot) {
    var APP = '-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif';
    var kcss = document.createElement('style');
    kcss.textContent = [
      '#nf-kreis{font-family:' + APP + ';color:#18181b;max-width:440px;margin:0 auto;width:100%}',
      '.kr-kopf{display:flex;align-items:center;gap:12px;margin-bottom:18px}',
      '.kr-avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#0EA5E9;color:#fff;font-size:14px;font-weight:600}',
      '.kr-name{font-size:16px;font-weight:600;line-height:1.2}',
      '.kr-sub{font-size:12px;color:#71717a}',
      '.kr-chip{margin-left:auto;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:500;transition:background .4s,color .4s}',
      '.kr-bogen{position:relative}',
      '.kr-bogen svg{display:block;width:100%;height:auto;overflow:visible}',
      '.kr-bogen path{transition:fill .5s ease,opacity .15s ease;cursor:pointer}',
      '.kr-mitte{position:absolute;left:19%;right:19%;top:24%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;pointer-events:none}',
      '.kr-mitte b{font-size:22px;font-weight:600;line-height:1.15;letter-spacing:-.01em}',
      '.kr-mitte span{font-size:12px;color:#71717a}',
      '.kr-mitte.kr-neu{animation:kr-ein .45s ease}',
      '@keyframes kr-ein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
      '.kr-legende{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;margin:6px 0 0;padding:0;font-size:12px}',
      '.kr-legende li{display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;color:#18181b;transition:opacity .15s,background .15s;cursor:default}',
      '.kr-legende li.blass{color:#a1a1aa}',
      '.kr-legende li.jetzt{font-weight:600}',
      '.kr-legende li.hervor{background:rgba(0,0,0,.04)}',
      '.kr-legende i{flex:none;width:8px;height:8px;border-radius:50%;transition:background .5s}',
      '.kr-legende em{margin-left:auto;font-style:normal;font-variant-numeric:tabular-nums;color:#71717a}',
      '.kr-naechst{margin-top:22px;padding-top:16px;border-top:1px solid rgba(19,90,63,.18)}',
      '.kr-naechst small{display:block;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#71717a;margin-bottom:6px}',
      '.kr-aufgabe{display:flex;align-items:center;gap:12px}',
      '.kr-aufgabe b{font-size:15px;font-weight:600}',
      '.kr-aufgabe span{display:block;font-size:12px;color:#71717a}',
      '.kr-faellig{margin-left:auto;flex:none;padding:3px 9px;border-radius:999px;background:rgba(245,158,11,.14);color:#B45309;font-size:12px;font-variant-numeric:tabular-nums}',
      '.kr-aufgabe.kr-neu{animation:kr-ein .45s ease}'
    ].join('\n');
    document.head.appendChild(kcss);

    var STAGES = [
      { name: 'Aufgebucht', farbe: [59, 130, 246], aufgabe: ['Erstkontakt herstellen', 'Einladung aus der Vorlage vorbereitet'] },
      { name: 'Erstkontakt', farbe: [99, 102, 241], aufgabe: ['Erstgespräch führen', 'Termin steht im Kalender'] },
      { name: 'Suche', farbe: [139, 92, 246], aufgabe: ['Stellen vorschlagen', 'Drei passende Betriebe gefunden'] },
      { name: 'Vorstellung', farbe: [192, 38, 211], aufgabe: ['Gespräch nachfassen', 'Mail an den Betrieb vorbereitet'] },
      { name: 'In Maßnahme', farbe: [22, 163, 74], aufgabe: ['Anwesenheit eintragen', 'Liste der Woche vollständig'] },
      { name: 'Abschluss', farbe: [249, 115, 22], aufgabe: ['Abschlussbericht erstellen', 'Aus der Akte befüllt'] }
    ];
    var rgb = function (c, a) { return a == null ? 'rgb(' + c.join(',') + ')' : 'rgba(' + c.join(',') + ',' + a + ')'; };
    var tag = function (offset) {
      var d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit' }).replace(/\.?$/, '.');
    };

    // Geometrie wie SegmentedDonut (size 340, thickness 30, arcDeg 270, gapDeg 3).
    var SIZE = 340, DICKE = 30, BOGEN = 270, LUECKE = 3, DEG = 180 / Math.PI;
    var cx = SIZE / 2, ro = SIZE / 2 - 2, ri = ro - DICKE, roSchmal = ro - DICKE * 0.2, cyK = ro + 2;
    var vbH = cyK + ro * Math.max(0, -Math.cos(BOGEN / 2 / DEG)) + 4;
    var polar = function (r, deg) { var a = deg / DEG; return [cx + r * Math.cos(a), cyK + r * Math.sin(a)]; };
    var sektor = function (rI, rO, a1, a2, cr) {
      var span = (a2 - a1) / DEG;
      var r = Math.max(0.5, Math.min(cr, (rO - rI) / 2, (rI * span / 2) * 0.95));
      var dO = (r / rO) * DEG, dI = (r / rI) * DEG;
      var f = function (p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); };
      var A = polar(rO, a1 + dO), B = polar(rO, a2 - dO), C = polar(rO - r, a2), D = polar(rI + r, a2);
      var E = polar(rI, a2 - dI), F = polar(rI, a1 + dI), G = polar(rI + r, a1), H = polar(rO - r, a1);
      var lO = a2 - dO - (a1 + dO) > 180 ? 1 : 0, lI = a2 - dI - (a1 + dI) > 180 ? 1 : 0;
      return 'M ' + f(A) + ' A ' + rO + ' ' + rO + ' 0 ' + lO + ' 1 ' + f(B) + ' A ' + r + ' ' + r + ' 0 0 1 ' + f(C) +
        ' L ' + f(D) + ' A ' + r + ' ' + r + ' 0 0 1 ' + f(E) + ' A ' + rI + ' ' + rI + ' 0 ' + lI + ' 0 ' + f(F) +
        ' A ' + r + ' ' + r + ' 0 0 1 ' + f(G) + ' L ' + f(H) + ' A ' + r + ' ' + r + ' 0 0 1 ' + f(A) + ' Z';
    };
    var n = STAGES.length, spanje = (BOGEN - (n - 1) * LUECKE) / n, start = -90 - BOGEN / 2;
    var winkel = STAGES.map(function (s, i) { var a = start + i * (spanje + LUECKE); return [a, a + spanje]; });

    kreisRoot.innerHTML =
      '<div class="kr-kopf"><span class="kr-avatar">AB</span><div><div class="kr-name">Alex Beispiel</div>' +
      '<div class="kr-sub">Teilnehmer:in · Akte</div></div><span class="kr-chip"></span></div>' +
      '<div class="kr-bogen"><svg viewBox="0 0 ' + SIZE + ' ' + vbH.toFixed(1) + '" aria-hidden="true"></svg>' +
      '<div class="kr-mitte"></div></div>' +
      '<ol class="kr-legende" aria-label="Stages des Ablaufs"></ol>' +
      '<div class="kr-naechst"><small>Als Nächstes</small><div class="kr-aufgabe"></div></div>';
    kreisRoot.setAttribute('role', 'img');
    var svgK = $('svg', kreisRoot), mitte = $('.kr-mitte', kreisRoot), legende = $('.kr-legende', kreisRoot);
    var chip = $('.kr-chip', kreisRoot), aufgabe = $('.kr-aufgabe', kreisRoot);
    var pfade = STAGES.map(function (s, i) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.addEventListener('mouseenter', function () { hervor(i); });
      p.addEventListener('mouseleave', function () { hervor(null); });
      svgK.appendChild(p);
      return p;
    });
    var zeilen = STAGES.map(function (s, i) {
      var li = el('li');
      li.innerHTML = '<i></i><span></span><em></em>';
      li.addEventListener('mouseenter', function () { hervor(i); });
      li.addEventListener('mouseleave', function () { hervor(null); });
      legende.appendChild(li);
      return li;
    });

    var jetzt = 2, hervorIdx = null;
    var wert = function (i) {
      if (i < jetzt) return tag(-(jetzt - i) * 9);
      if (i === jetzt) return 'seit ' + tag(-3);
      if (i === jetzt + 1) return 'möglich';
      return '—';
    };
    var mitteText = function (i) {
      if (i === jetzt) return 'seit ' + tag(-3);
      if (i < jetzt) return 'war dort · ' + tag(-(jetzt - i) * 9);
      if (i === jetzt + 1) return 'als Nächstes möglich';
      return 'noch nicht erreicht';
    };
    var malenK = function (neu) {
      STAGES.forEach(function (s, i) {
        var a = i === jetzt + 1 ? 0.45 : i > jetzt ? 0.2 : null;
        pfade[i].setAttribute('d', sektor(ri, i === jetzt ? ro : roSchmal, winkel[i][0], winkel[i][1], DICKE * 0.4));
        pfade[i].style.fill = rgb(s.farbe, a);
        pfade[i].style.opacity = hervorIdx == null || hervorIdx === i ? 1 : 0.3;
        var z = zeilen[i];
        z.className = (i === jetzt ? 'jetzt' : i > jetzt + 1 ? 'blass' : '') + (hervorIdx === i ? ' hervor' : '');
        z.style.opacity = hervorIdx == null || hervorIdx === i ? 1 : 0.4;
        z.children[0].style.background = rgb(s.farbe, a);
        z.children[1].textContent = s.name;
        z.children[2].textContent = wert(i);
      });
      var zeig = hervorIdx == null ? jetzt : hervorIdx;
      mitte.innerHTML = '<b>' + STAGES[zeig].name + '</b><span>' + mitteText(zeig) + '</span>';
      var f = STAGES[jetzt].farbe;
      chip.textContent = STAGES[jetzt].name;
      chip.style.background = rgb(f, 0.12);
      chip.style.color = rgb(f);
      kreisRoot.setAttribute('aria-label', 'Prozess-Kreis: Alex Beispiel steht in „' + STAGES[jetzt].name + '“');
      if (neu) {
        var t = STAGES[jetzt].aufgabe;
        aufgabe.innerHTML = '<div><b>' + t[0] + '</b><span>' + t[1] + '</span></div><span class="kr-faellig">fällig ' + tag(3) + '</span>';
        [mitte, aufgabe].forEach(function (x) { x.classList.remove('kr-neu'); void x.offsetWidth; x.classList.add('kr-neu'); });
      }
    };
    function hervor(i) { hervorIdx = i; malenK(false); }
    malenK(true);

    // Langsam weiter durch den Ablauf — nur sichtbar, nicht beim Zeigen mit der Maus.
    if (!ruhig && 'IntersectionObserver' in window) {
      var sichtbar = false, uhr = 0;
      var weiter = function () {
        clearTimeout(uhr);
        uhr = setTimeout(function () {
          if (sichtbar && hervorIdx == null) { jetzt = (jetzt + 1) % n; malenK(true); }
          weiter();
        }, jetzt === n - 1 ? 4200 : 2800);
      };
      new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; }, { threshold: 0.4 }).observe(kreisRoot);
      weiter();
    }
  }

  // --------------------------------------------- Sicherheit: Datenweg
  var dw = document.getElementById('nf-datenweg');
  if (dw) {
    var MODI = {
      cloud: {
        knopf: 'Übliche Cloud-Lösung',
        links: ['Ihr Büro', 'Sie tippen ein', 'Teilnehmerdaten werden im Browser erfasst und an den Anbieter geschickt.'],
        label: 'Teilnehmerdaten gehen an den Anbieter',
        pakete: ['Name', 'Lebenslauf', 'Gesundheit'],
        paketStil: 'background:rgba(179,64,46,.1);color:' + ROT,
        rechts: ['Rechenzentrum des Anbieters', 'Ihre Daten liegen hier', 'Lesbar für den Anbieter, gespeichert dort, wo er es bestimmt.'],
        saetze: [['Name', 1], ['SVNR', 1], ['Lebenslauf', 1], ['Gesundheit', 1]],
        rahmen: 'rgba(179,64,46,.45)',
        folgen: [
          ['!', 'Auftragsverarbeitungsvertrag nötig'],
          ['!', 'Serverstandort und Drittlandtransfer prüfen'],
          ['!', 'Ohne Internet kein Zugriff'],
          ['!', 'Auskunft und Löschung laufen über den Anbieter']
        ],
        farbe: ROT
      },
      lokal: {
        knopf: 'AQUAflow',
        links: ['Ihr Büro', 'Die Daten bleiben hier', 'Verschlüsselte Datenbank auf Ihrem Gerät oder Server. Wer die Datei kopiert, hat nichts Lesbares.'],
        label: 'nur bei mehreren Standorten: verschlüsselte Pakete',
        pakete: ['🔒 a8f3…', '🔒 c71e…', '🔒 09bd…'],
        paketStil: 'background:rgba(19,90,63,.09);color:' + GRUEN,
        rechts: ['Zwischenstelle → zweiter Standort', 'Sieht nur Chiffrat', 'Die Pakete sind Ende-zu-Ende verschlüsselt. Lesen kann sie erst der andere Standort.'],
        saetze: [['a8f3 9e1c', 0], ['c71e 44d0', 0], ['09bd f2a7', 0]],
        rahmen: 'rgba(19,90,63,.45)',
        folgen: [
          ['✓', 'An einem Standort keine Auftragsverarbeitung im Regelbetrieb'],
          ['✓', 'Kein fremder Serverstandort zu prüfen'],
          ['✓', 'Arbeiten auch ohne Internet'],
          ['✓', 'Auskunft und Löschung bleiben in Ihrer Hand']
        ],
        farbe: GRUEN
      }
    };
    dw.innerHTML =
      '<div class="dw-schalter" role="group" aria-label="Weg der Daten"></div>' +
      '<div class="dw-flaeche" aria-live="polite">' +
        '<div class="dw-box" data-s="links"></div>' +
        '<div class="dw-leitung"><div class="dw-linie"></div><span class="dw-paket"></span><span class="dw-paket"></span><span class="dw-paket"></span><div class="dw-label"></div></div>' +
        '<div class="dw-box" data-s="rechts"></div>' +
      '</div>' +
      '<ul class="dw-folgen"></ul>';
    var schalter = $('.dw-schalter', dw), flaeche = $('.dw-flaeche', dw);
    var boxHtml = function (t, saetze) {
      return '<div class="dw-kopf">' + t[0] + '</div><div class="dw-titel">' + t[1] + '</div><div class="dw-text">' + t[2] + '</div>' +
        (saetze ? '<div class="dw-saetze">' + saetze.map(function (s) {
          return '<span class="dw-satz" style="' + (s[1] ? 'background:rgba(179,64,46,.1);color:' + ROT : 'background:rgba(19,90,63,.09);color:' + GRUEN) + '">' + s[0] + '</span>';
        }).join('') + '</div>' : '');
    };
    var setze = function (m) {
      var d = MODI[m];
      $$('button', schalter).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
      flaeche.classList.toggle('is-lokal', m === 'lokal');
      $('[data-s="links"]', dw).innerHTML = boxHtml(d.links, m === 'lokal' ? [['🔒 verschlüsselt', 0]] : null);
      var rechts = $('[data-s="rechts"]', dw);
      rechts.innerHTML = boxHtml(d.rechts, d.saetze);
      rechts.style.borderColor = d.rahmen;
      $('.dw-label', dw).textContent = d.label;
      $$('.dw-paket', dw).forEach(function (p, i) { p.textContent = d.pakete[i]; p.style.cssText = d.paketStil; });
      $('.dw-folgen', dw).innerHTML = d.folgen.map(function (f, i) {
        return '<li style="animation-delay:' + (i * 60) + 'ms"><span style="color:' + d.farbe + '">' + f[0] + '</span>' + f[1] + '</li>';
      }).join('');
    };
    Object.keys(MODI).forEach(function (m) {
      var b = knopf(MODI[m].knopf, { 'data-m': m, 'aria-pressed': 'false' });
      b.addEventListener('click', function () { setze(m); });
      schalter.appendChild(b);
    });
    setze('cloud');
  }
})();
