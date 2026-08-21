#!/usr/bin/env python3
"""
Baut aus der Claude-Design-Quelle `src/Axion Website.dc.html` die statische
Seite `index.html`.

Die Quelle nutzt die Design-Canvas-Syntax (x-dc / helmet / sc-if / {{ bindings }}
/ style-hover). Dieses Skript uebersetzt sie 1:1 in Standard-HTML + CSS + Vanilla-JS:

  <sc-if value="{{ isStart }}">   ->  <div class="ax-page" data-page="start">
  style-hover="..."               ->  generierte .hvN:hover-Regel (mit !important,
                                      da Inline-Styles sonst gewinnen)
  style-focus="..."               ->  generierte .fcN:focus-Regel
  onClick="{{ goProzesse }}"      ->  data-go="prozesse" (Hash-Routing)
  style="{{ navStart }}"          ->  class="ax-nav" data-nav="start"
  {{ mitarbeiter }}               ->  <span data-bind="mitarbeiter"></span>
  value/onChange auf <input>      ->  data-model="mitarbeiter"
  <image-slot placeholder="X">    ->  Platzhalterflaeche (bis echte Screenshots da sind)

Aufruf:  python3 build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src" / "Axion Website.dc.html"
OUT = ROOT / "index.html"

src = SRC.read_text(encoding="utf-8")

# ---------------------------------------------------------------- helmet / body
helmet = re.search(r"<helmet>(.*?)</helmet>", src, re.S).group(1)
body = re.search(r"</helmet>(.*?)</x-dc>", src, re.S).group(1)

# Thumbnail-Template wird zum Favicon, nicht zum Markup.
thumb = re.search(
    r'<template id="__bundler_thumbnail">(.*?)</template>', helmet, re.S
).group(1).strip()
helmet = re.sub(
    r'<template id="__bundler_thumbnail">.*?</template>', "", helmet, flags=re.S
)
favicon = "data:image/svg+xml;utf8," + re.sub(r"\s+", " ", thumb).replace(
    "#", "%23"
).replace('"', "'")

# image-slot.js / support.js sind Canvas-Runtime, in der Seite ueberfluessig.
helmet = re.sub(r'<script src="\./(image-slot|support)\.js"></script>\s*', "", helmet)

# ---------------------------------------------------- style-hover / style-focus
extra_css = []


def camel_to_kebab(css: str) -> str:
    # accentColor: X  ->  accent-color: X
    return re.sub(
        r"(^|;|\{)\s*([a-z]+[A-Z][a-zA-Z]*)\s*:",
        lambda m: m.group(1)
        + " "
        + re.sub(r"([A-Z])", lambda c: "-" + c.group(1).lower(), m.group(2))
        + ":",
        css,
    )


def important(css: str) -> str:
    out = []
    for decl in css.split(";"):
        decl = decl.strip()
        if decl:
            out.append(decl + " !important")
    return "; ".join(out) + ";"


_n = [0]


def state_attr(match, kind, pseudo):
    _n[0] += 1
    cls = f"{kind}{_n[0]}"
    css = important(camel_to_kebab(html.unescape(match.group(1))))
    extra_css.append(f".{cls}:{pseudo} {{ {css} }}")
    return f' data-{kind}-class="{cls}"'


body = re.sub(
    r'\sstyle-hover="([^"]*)"', lambda m: state_attr(m, "hv", "hover"), body
)
body = re.sub(
    r'\sstyle-focus="([^"]*)"', lambda m: state_attr(m, "fc", "focus"), body
)

# ------------------------------------------------------------------ sc-if/Seiten
PAGES = {
    "isStart": "start",
    "isProzesse": "prozesse",
    "isTraeger": "traeger",
    "isSicherheit": "sicherheit",
    "isPreise": "preise",
    "isImpressum": "impressum",
    "isDatenschutz": "datenschutz",
    "isAgb": "agb",
}


def open_scif(m):
    cond = m.group(1).strip()
    if cond == "showKontakt":
        return '<div id="ax-kontakt-wrap">'
    return '<div class="ax-page" data-page="%s" hidden>' % PAGES[cond]


body = re.sub(r'<sc-if value="\{\{\s*([^}]+?)\s*\}\}"[^>]*>', open_scif, body)
body = body.replace("</sc-if>", "</div>")

# ------------------------------------------------------------------- Navigation
NAV = {
    "navStart": "start",
    "navProzesse": "prozesse",
    "navTraeger": "traeger",
    "navSicherheit": "sicherheit",
    "navPreise": "preise",
}
body = re.sub(
    r'style="\{\{\s*(nav\w+)\s*\}\}"',
    lambda m: 'data-nv-class="ax-nav" data-nav="%s"' % NAV[m.group(1)],
    body,
)

GO = {
    "goStart": "start",
    "goProzesse": "prozesse",
    "goTraeger": "traeger",
    "goSicherheit": "sicherheit",
    "goPreise": "preise",
    "goImpressum": "impressum",
    "goDatenschutz": "datenschutz",
    "goAgb": "agb",
}
body = re.sub(
    r'onClick="\{\{\s*(go\w+)\s*\}\}"',
    lambda m: 'type="button" data-go="%s"' % GO[m.group(1)],
    body,
)

# --------------------------------------------------------------- Rechner-Inputs
MODEL = {"setMitarbeiter": "mitarbeiter", "setStunden": "stunden", "setSatz": "satz"}
body = re.sub(
    r'value="\{\{\s*\w+\s*\}\}" onChange="\{\{\s*(set\w+)\s*\}\}"',
    lambda m: 'data-model="%s"' % MODEL[m.group(1)],
    body,
)

# ------------------------------------------------------------- Textbindings
body = re.sub(
    r"\{\{\s*(mitarbeiter|stunden|satz|stundenJahr|gespart|kostenJahr|kostenGespart)\s*\}\}",
    lambda m: '<span data-bind="%s"></span>' % m.group(1),
    body,
)

# ------------------------------------------------------------------ Kontaktform
body = body.replace(
    'onSubmit="{{ onSubmit }}"', 'id="ax-form" novalidate'
)
FIELDS = [
    ("Vor- und Nachname", 'name="name" required'),
    ("Institut, Verein, Betrieb", 'name="organisation"'),
    ("name@organisation.at", 'name="email" type="email" required'),
    ("+43", 'name="telefon" type="tel"'),
]
for placeholder, attrs in FIELDS:
    body = body.replace(
        'placeholder="%s"' % placeholder, 'placeholder="%s" %s' % (placeholder, attrs)
    )
body = body.replace(
    'rows="3" placeholder="z. B. Teilnehmerdaten in mehreren Listen pflegen"',
    'rows="3" name="ablauf" required placeholder="z. B. Teilnehmerdaten in mehreren Listen pflegen"',
)

# ------------------------------------------------------------------ image-slot
def image_slot(m):
    attrs = m.group(1)
    slot_id = re.search(r'id="([^"]+)"', attrs).group(1)
    label = re.search(r'placeholder="([^"]*)"', attrs)
    label = label.group(1) if label else "Screenshot"
    # Sobald ein echtes Bild vorliegt: assets/<id>.png ablegen, das <img> greift
    # automatisch, der Platzhalter bleibt als Fallback dahinter.
    return (
        '<div class="ax-slot">'
        '<span class="ax-slot-label">%s</span>'
        '<img src="assets/%s.png" alt="%s" loading="lazy" '
        'onerror="this.remove()" />'
        "</div>" % (html.escape(label), slot_id, html.escape(label))
    )


body = re.sub(r"<image-slot([^>]*)></image-slot>", image_slot, body)

# ------------------------------------------------- generierte Klassen zusammenfuehren
# Erst hier, damit Hover-, Focus- und Nav-Klassen in EIN class-Attribut wandern
# (zwei class= am selben Tag ignoriert der Browser stillschweigend).
def merge_classes(tag: str) -> str:
    classes = re.findall(r'data-(?:hv|fc|nv)-class="([^"]+)"', tag)
    if not classes:
        return tag
    tag = re.sub(r'\sdata-(?:hv|fc|nv)-class="[^"]+"', "", tag)
    existing = re.search(r'\sclass="([^"]*)"', tag)
    if existing:
        return tag.replace(
            existing.group(0), ' class="%s %s"' % (existing.group(1), " ".join(classes))
        )
    close = "/>" if tag.endswith("/>") else ">"
    return tag[: -len(close)].rstrip() + ' class="%s"%s' % (" ".join(classes), close)


body = re.sub(r"<[a-zA-Z][^>]*>", lambda m: merge_classes(m.group(0)), body)

# ------------------------------------------------------------ camelCase-Styles
body = re.sub(
    r'style="([^"]*)"', lambda m: 'style="%s"' % camel_to_kebab(m.group(1)), body
)

# ------------------------------------------------------------------ Restpruefung
leftovers = (
    re.findall(r"\{\{[^}]*\}\}", body)
    + re.findall(r"<(?:sc-if|image-slot)", body)
    + re.findall(r'data-(?:hv|fc|nv)-class', body)
    + [t for t in re.findall(r"<[a-zA-Z][^>]*>", body) if t.count("class=") > 1]
)
if leftovers:
    raise SystemExit("Nicht uebersetzte Design-Syntax: %s" % sorted(set(leftovers))[:10])

# --------------------------------------------------------------------- Ausgabe
RUNTIME_CSS = """
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  img { max-width: 100%; display: block; }
  :focus-visible { outline: 2px solid #135A3F; outline-offset: 3px; }
  .ax-page[hidden] { display: none; }
  .ax-nav { width: auto; background: none; border: none; font: inherit; cursor: pointer;
    padding: 6px 0; color: inherit; font-weight: 400;
    border-bottom: 2px solid transparent; transition: color .2s ease, border-color .2s ease; }
  .ax-nav.is-active { color: #135A3F; font-weight: 500; border-bottom-color: #135A3F; }
  .ax-slot { position: absolute; inset: 0; display: grid; place-items: center;
    background: repeating-linear-gradient(45deg, rgba(19,90,63,.05) 0 10px, transparent 10px 20px); }
  .ax-slot img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .ax-slot-label { font-family: 'IBM Plex Mono', monospace; font-size: 12px;
    color: #616C79; text-align: center; padding: 0 16px; }
  .ax-note { margin: 0; font-family: 'IBM Plex Mono', monospace; font-size: 13px;
    line-height: 1.6; color: #135A3F; }
  .ax-note[hidden] { display: none; }
"""

RUNTIME_JS = """
(function () {
  var PAGES = ['start','prozesse','traeger','sicherheit','preise','impressum','datenschutz','agb'];
  var NO_CONTACT = ['impressum','datenschutz','agb'];
  var pages = document.querySelectorAll('.ax-page');
  var navs = document.querySelectorAll('.ax-nav');
  var kontakt = document.getElementById('ax-kontakt-wrap');

  function routeFromHash() {
    var h = (location.hash || '').replace(/^#\\/?/, '');
    return PAGES.indexOf(h) > -1 ? h : 'start';
  }

  function render(page, scroll) {
    pages.forEach(function (el) { el.hidden = el.dataset.page !== page; });
    navs.forEach(function (el) { el.classList.toggle('is-active', el.dataset.nav === page); });
    kontakt.hidden = NO_CONTACT.indexOf(page) > -1;
    document.documentElement.dataset.page = page;
    if (scroll) window.scrollTo(0, 0);
    reveal();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-go], [data-nav]');
    if (!btn) return;
    var page = btn.dataset.go || btn.dataset.nav;
    if (!page) return;
    e.preventDefault();
    if (routeFromHash() === page) { window.scrollTo(0, 0); return; }
    location.hash = '#/' + page;
  });

  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#/') !== 0) return;   // #kontakt nicht abfangen
    render(routeFromHash(), true);
  });

  // Auf den Rechtsseiten ist das Kontaktformular ausgeblendet — "Anfrage senden"
  // muss von dort erst zurueck auf die Startseite routen, sonst passiert nichts.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href="#kontakt"]');
    if (!link || !kontakt.hidden) return;
    e.preventDefault();
    render('start', false);
    history.replaceState(null, '', '#/start');
    document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
  });

  // ---- Ueberschlagsrechner
  var state = { mitarbeiter: 8, stunden: 6, satz: 30 };
  var fmt = function (n) { return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.'); };

  function compute() {
    var jahr = state.mitarbeiter * state.stunden * 46;
    var frei = Math.round(jahr * 0.6);
    return {
      mitarbeiter: state.mitarbeiter,
      stunden: state.stunden,
      satz: state.satz,
      stundenJahr: fmt(jahr),
      gespart: fmt(frei),
      kostenJahr: fmt(Math.round(jahr * state.satz / 1000) * 1000),
      kostenGespart: fmt(Math.round(frei * state.satz / 1000) * 1000)
    };
  }

  function paint() {
    var vals = compute();
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      el.textContent = vals[el.dataset.bind];
    });
  }

  document.querySelectorAll('[data-model]').forEach(function (input) {
    input.value = state[input.dataset.model];
    input.addEventListener('input', function () {
      state[input.dataset.model] = +input.value;
      paint();
    });
  });
  paint();

  // ---- Kontaktformular: ohne Backend per E-Mail-Entwurf
  var form = document.getElementById('ax-form');
  if (form) {
    var note = document.createElement('p');
    note.className = 'ax-note';
    note.hidden = true;
    form.appendChild(note);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var lines = [
        'Name: ' + (d.get('name') || ''),
        'Organisation: ' + (d.get('organisation') || '—'),
        'E-Mail: ' + (d.get('email') || ''),
        'Telefon: ' + (d.get('telefon') || '—'),
        '',
        'Der Ablauf:',
        (d.get('ablauf') || '')
      ];
      location.href = 'mailto:office@jasonschreiber.at'
        + '?subject=' + encodeURIComponent('Anfrage Prozessautomatisierung')
        + '&body=' + encodeURIComponent(lines.join('\\n'));
      note.textContent = 'Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. '
        + 'Falls nicht: office@jasonschreiber.at';
      note.hidden = false;
    });
  }

  // ---- Scroll-Reveal (aus der Design-Quelle uebernommen)
  var obs = null;
  function reveal() {
    document.querySelectorAll('section').forEach(function (sec) {
      sec.querySelectorAll(':scope > div > *, :scope > div > div > *').forEach(function (el, i) {
        if (el.dataset.rv) return;
        el.dataset.rv = '1';
        el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
      });
    });
    if (!obs) {
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('rv-in'); obs.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }
    document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(function (el) { obs.observe(el); });
    clearTimeout(reveal._t);
    reveal._t = setTimeout(function () {
      document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(function (el) {
        el.classList.add('rv-in');
      });
    }, 2500);
  }

  render(routeFromHash(), false);
  if (location.hash === '#kontakt') {
    var k = document.getElementById('kontakt');
    if (k) k.scrollIntoView();
  }
})();
"""

out = """<!DOCTYPE html>
<html lang="de-AT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#F4F3EE">
<link rel="icon" href="{favicon}">
{helmet}
<style>{runtime_css}</style>
</head>
<body>
{body}
<script>{runtime_js}</script>
</body>
</html>
""".format(
    favicon=favicon,
    helmet=helmet.strip().replace(
        "</style>", "\n" + "\n".join("  " + r for r in extra_css) + "\n</style>"
    ),
    runtime_css=RUNTIME_CSS,
    body=body.strip(),
    runtime_js=RUNTIME_JS,
)

OUT.write_text(out, encoding="utf-8")

# Zusaetzlich eine Variante fuer die Claude-Artifact-Vorschau: dort liefert der
# Host das <html>/<head>/<body>-Geruest, es darf also nur Seiteninhalt drin sein.
# Canonical/robots/og faellt weg (zeigt auf die echte Domain, nicht auf die Vorschau).
preview_head = helmet.strip().replace(
    "</style>", "\n" + "\n".join("  " + r for r in extra_css) + "\n</style>"
)
preview_head = re.sub(r"<title>.*?</title>", "", preview_head, flags=re.S)
preview_head = re.sub(
    r'<(?:link rel="canonical"|meta name="robots"|meta property="og:[^"]*"'
    r'|meta name="twitter:[^"]*")[^>]*/?>\s*',
    "",
    preview_head,
)
preview = (
    "<title>Axion Prozessautomatisierung</title>\n"
    + preview_head
    + "\n<style>"
    + RUNTIME_CSS
    + "</style>\n"
    + body.strip()
    + "\n<script>"
    + RUNTIME_JS
    + "</script>\n"
)
prev_path = ROOT / ".preview" / "artifact.html"
prev_path.parent.mkdir(exist_ok=True)
prev_path.write_text(preview, encoding="utf-8")

print("index.html geschrieben — %d Zeilen, %d Hover/Focus-Regeln, %d Seiten"
      % (out.count("\n") + 1, len(extra_css), len(PAGES)))
