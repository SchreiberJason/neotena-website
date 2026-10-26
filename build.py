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

# Thumbnail-Template ist nur die Vorschau im Design-Canvas. Das Favicon liegt
# als PNG unter assets/ (favicon-32.png, apple-touch-icon.png).
helmet = re.sub(
    r'<template id="__bundler_thumbnail">.*?</template>', "", helmet, flags=re.S
)

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
  /* iOS zoomt bei Eingabefeldern unter 16 px hinein — auf dem Handy nie kleiner. */
  @media (max-width: 760px) { input, textarea, select { font-size: 16px !important; } }
  /* Lange deutsche Wörter (Datenschutzbeauftragter) trennen statt aus dem Fenster zu ragen. */
  h1, h2, h3 { overflow-wrap: break-word; text-wrap: balance; }
  /* Nur wirklich lange Wörter trennen (Datenschutzbeauftragter), nicht „ver-langt“. */
  @media (max-width: 600px) { h1, h2, h3 { hyphens: auto; -webkit-hyphens: auto; hyphenate-limit-chars: 16 7 7; } }
  /* Prozesse: auf dem Handy immer erst Text, dann Bild. */
  @media (max-width: 760px) { [data-nf="ablauf"] > div { order: 0 !important; } }
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
  /* „Was sie kann · was es bringt“: große Zeilen, jede führt zu ihrer Kachel im Bento. */
  .nb-kb { display: grid; border-top: 1px solid rgba(19,90,63,.28); }
  .nb-kb-kopf, .nb-kb-zeile { display: grid; grid-template-columns: 3.2em minmax(0, 1fr) minmax(0, 1.25fr) 11em; gap: 8px 28px; align-items: baseline; }
  .nb-kb-kopf { padding: 14px 0; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #616C79;
    border-bottom: 1px solid rgba(19,90,63,.28); }
  .nb-kb-zeile { position: relative; padding: clamp(18px, 2.4vw, 28px) 0; border-bottom: 1px solid rgba(19,90,63,.18);
    color: inherit; text-decoration: none; transition: background .3s, padding .3s; }
  .nb-kb-zeile:hover, .nb-kb-zeile:focus-visible { background: rgba(255,255,255,.55); padding-left: 14px; padding-right: 14px; }
  .nb-kb-nr { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #135A3F; }
  .nb-kb-kann { font-size: clamp(20px, 2.3vw, 28px); line-height: 1.15; letter-spacing: -.02em; font-weight: 600; }
  .nb-kb-bringt { font-size: clamp(16px, 1.6vw, 19px); line-height: 1.45; color: #135A3F; }
  .nb-kb-bsp { justify-self: end; padding: 4px 10px; border-radius: 999px; background: rgba(19,90,63,.07); font-family: 'IBM Plex Mono', monospace;
    font-size: 12px; color: #616C79; white-space: nowrap; }
  .nb-kb-echt { background: #135A3F; color: #F4F3EE; }
  .nb-kb-zeile::after { content: "→"; position: absolute; right: 0; top: 50%; transform: translate(0, -50%); opacity: .5;
    font-family: 'IBM Plex Mono', monospace; color: #135A3F; transition: opacity .3s, transform .3s; }
  .nb-kb-zeile:hover::after { opacity: 1; transform: translate(-6px, -50%); }
  .nb-kb-bsp { margin-right: 26px; }
  .nb-kb-zeile:hover .nb-kb-bsp { opacity: 0; }
  @media (max-width: 820px) {
    .nb-kb-kopf { display: none; }
    .nb-kb-zeile { padding-right: 28px; }
    .nb-kb-zeile { grid-template-columns: 2.4em minmax(0, 1fr); }
    .nb-kb-bringt, .nb-kb-bsp { grid-column: 2; }
    .nb-kb-bsp { justify-self: start; }
  }
  .nb-kachel { scroll-margin-top: 96px; }
  /* Hero: zwei Türen als Kacheln. */
  .nb-tueren { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(440px, 100%), 1fr)); gap: 20px; }
  .nb-tuer { display: flex; flex-direction: column; min-width: 0; overflow: hidden; padding: clamp(24px, 3vw, 36px);
    border-radius: 28px; border: 1px solid rgba(19,90,63,.2); background: rgba(255,255,255,.55);
    transition: transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s, background .4s; }
  .nb-tuer:hover { transform: translateY(-3px); background: rgba(255,255,255,.75); box-shadow: 0 30px 60px -30px rgba(12,46,34,.25); }
  .nb-tuer-weg { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #135A3F; }
  .nb-tuer-titel { margin: 10px 0 0; font-size: clamp(26px, 2.8vw, 34px); line-height: 1.08; letter-spacing: -.025em; font-weight: 600; }
  .nb-tuer-bild { flex: 1; display: grid; align-items: center; min-height: 320px; margin: 8px 0; }
  .nb-tuer-fuss { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px;
    padding-top: 18px; border-top: 1px dashed rgba(19,90,63,.3); font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #616C79; }
  .nb-tuer-los { width: auto; padding: 11px 20px; border-radius: 999px; border: 1px solid #135A3F; background: #135A3F; color: #F4F3EE;
    font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .04em; cursor: pointer; text-decoration: none; }
  .nb-tuer-los:hover { background: #0B3D2A; }
  /* Dunkelgrünes Band: bricht die Papierfläche auf; Kacheln stehen hell darauf. */
  .nb-band .nb-tuer { background: #F4F3EE; border-color: transparent; color: #121A22; }
  .nb-band .nb-tuer:hover { background: #FFFFFF; box-shadow: 0 30px 60px -20px rgba(0,0,0,.45); }
  /* Wer dahintersteht: freigestelltes Foto vor einem grünen Bogen. */
  .nb-portrait { position: relative; max-width: 420px; width: 100%; margin: 0 auto; aspect-ratio: 720 / 994; }
  .nb-portrait::before { content: ""; position: absolute; left: 4%; right: 4%; top: 18%; bottom: 0;
    border-radius: 999px 999px 32px 32px; background: #0C2E22; }
  .nb-portrait::after { content: ""; position: absolute; left: 4%; right: 4%; top: 18%; bottom: 0; border-radius: 999px 999px 32px 32px;
    background: radial-gradient(circle at 50% 30%, rgba(127,209,166,.28), transparent 60%); }
  .nb-portrait img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: contain; object-position: bottom; }
  /* Pilotangebot: dunkle Karte über die Breite. */
  .nb-pilot { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 28px 56px; align-items: center;
    padding: clamp(28px, 4vw, 56px); border-radius: 28px; background: #0C2E22; color: #EAF2ED; }
  .nb-pilot-liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
  .nb-pilot-liste li { display: grid; grid-template-columns: 2.4em 1fr; gap: 2px 10px; padding: 14px 0; border-top: 1px solid rgba(127,209,166,.22);
    font-size: 14px; color: rgba(234,242,237,.7); }
  .nb-pilot-liste li span { grid-row: span 2; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #7FD1A6; }
  .nb-pilot-liste b { font-size: 17px; font-weight: 600; color: #EAF2ED; }
  .nb-pilot-los { grid-column: 1 / -1; justify-self: start; padding: 14px 26px; border-radius: 999px; background: #7FD1A6; color: #0C2E22;
    font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: .04em; text-decoration: none; transition: background .3s; }
  .nb-pilot-los:hover { background: #A6E3C3; }
  @media (max-width: 860px) { .nb-pilot { grid-template-columns: 1fr; } }
  /* Sicherheit: drei Gruppen, je Schicht ein Satz und die Technik. */
  .nb-schutz { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 16px; }
  .nb-sg { display: grid; align-content: start; gap: 0; padding: clamp(20px, 2.6vw, 30px); border-radius: 24px; border: 1px solid rgba(19,90,63,.16); background: rgba(255,255,255,.5); }
  .nb-sg .nb-k-label { margin-bottom: 10px; }
  .nb-sz { display: grid; gap: 4px; padding: 16px 0; border-top: 1px solid rgba(19,90,63,.14); }
  .nb-sz b { font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
  .nb-sz span { font-size: 15px; line-height: 1.55; color: #3C4A58; }
  .nb-sz code { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #135A3F; }
  /* Kosten: welche Stages verrechnet werden. */
  .nb-zaehlt { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
  .nb-z-st { display: grid; gap: 6px; padding: 14px; border-radius: 14px; border: 1px dashed rgba(127,209,166,.3);
    font-size: 14px; font-weight: 600; color: rgba(234,242,237,.55); }
  .nb-z-st i { width: 10px; height: 10px; border-radius: 50%; opacity: .5; }
  .nb-z-st span { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 400; }
  .nb-z-ja { border: 0; background: #7FD1A6; color: #0C2E22; }
  .nb-z-ja i { opacity: 1; } .nb-z-ja span { font-weight: 600; }
  @media (max-width: 760px) { .nb-zaehlt { grid-template-columns: 1fr 1fr; } .nb-z-ja { grid-column: 1 / -1; } }
  /* Weg 1: das Paket als drei aufgefächerte Karten. */
  .nb-paket { position: relative; display: grid; gap: 12px; max-width: 400px; width: 100%; margin: 0 auto; }
  .nb-paket-karte { display: grid; grid-template-columns: auto 1fr; gap: 2px 14px; align-items: baseline; padding: 18px 20px;
    border-radius: 16px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 16px 32px -20px rgba(12,46,34,.3);
    transition: transform .5s cubic-bezier(.2,.7,.2,1); }
  .nb-paket-karte:nth-child(1) { transform: rotate(-2deg) translateX(-8px); }
  .nb-paket-karte:nth-child(3) { transform: rotate(1.5deg) translateX(10px); }
  .nb-tuer:hover .nb-paket-karte { transform: none; }
  .nb-paket-nr { grid-row: span 2; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #135A3F; }
  .nb-paket-karte b { font-size: 17px; font-weight: 600; }
  .nb-paket-karte span:last-child { font-size: 14px; line-height: 1.45; color: #3C4A58; }
  /* Bento: Kacheln in verschiedenen Größen, jede zum Anfassen. */
  .nb-bento { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
  .nb-kachel { display: flex; flex-direction: column; min-width: 0; padding: clamp(20px, 2.6vw, 32px);
    border-radius: 24px; border: 1px solid rgba(19,90,63,.16); background: rgba(255,255,255,.5); }
  /* Dunkelgrüne Kacheln: dasselbe Grün wie das Band, Inhalt bleibt hell. */
  .nb-kachel.nb-dunkel { background: #0C2E22; border-color: #0C2E22; color: #EAF2ED; }
  .nb-dunkel .nb-k-label { color: #7FD1A6; }
  .nb-dunkel .nb-k-tipp { background: #7FD1A6; color: #0C2E22; }
  .nb-dunkel .pt-linie { border-color: rgba(127,209,166,.45) !important; }
  .nb-dunkel .pt-akte { background: rgba(255,255,255,.96); color: #18181b; }
  .nb-dunkel .nb-suche { background: #FFFFFF; }
  .nb-dunkel .nb-tn { background: rgba(255,255,255,.94); color: #18181b; }
  .nb-dunkel .nb-nichts { color: rgba(234,242,237,.7); }
  .nb-k4 { grid-column: span 4; } .nb-k6 { grid-column: span 6; } .nb-k8 { grid-column: span 8; } .nb-k12 { grid-column: span 12; }
  .nb-hoch { grid-row: span 2; }
  .nb-k-label { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #135A3F;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
  .nb-k-tipp { padding: 4px 10px; border-radius: 999px; background: #135A3F; color: #F4F3EE; letter-spacing: .04em; text-transform: none; font-size: 11px; white-space: nowrap; }
  .nb-k-titel { margin: 6px 0 22px; font-size: clamp(19px, 1.8vw, 22px); line-height: 1.2; letter-spacing: -.015em; font-weight: 600; }
  @media (max-width: 960px) {
    .nb-bento { grid-template-columns: 1fr; }
    .nb-k4, .nb-k6, .nb-k8, .nb-k12 { grid-column: auto; } .nb-hoch { grid-row: auto; }
  }
  /* Schmaler Viewport: Logo und Anfrage-Button in die erste Zeile, Navigation darunter. */
  /* Handy: Burger-Menü statt Navigationszeile. */
  .ax-burger { display: none; }
  @media (max-width: 860px) {
    header > a[href="#kontakt"] { margin-left: auto; padding: 9px 14px !important; }
    .ax-burger { display: grid; place-items: center; width: 42px; height: 42px; padding: 0; border: 1px solid rgba(19,90,63,.35);
      border-radius: 999px; background: transparent; cursor: pointer; }
    .ax-burger span, .ax-burger span::before, .ax-burger span::after { display: block; width: 16px; height: 1.5px; background: #135A3F;
      position: relative; transition: transform .25s, background .2s; }
    .ax-burger span::before, .ax-burger span::after { content: ""; position: absolute; left: 0; }
    .ax-burger span::before { top: -5px; } .ax-burger span::after { top: 5px; }
    header.is-offen .ax-burger span { background: transparent; }
    header.is-offen .ax-burger span::before { transform: translateY(5px) rotate(45deg); }
    header.is-offen .ax-burger span::after { transform: translateY(-5px) rotate(-45deg); }
    header > nav { display: none !important; order: 3; flex-basis: 100%; flex-direction: column; align-items: stretch !important;
      gap: 0 !important; padding: 8px 0 6px; }
    header.is-offen > nav { display: flex !important; }
    header > nav > * { text-align: left; padding: 14px 2px !important; font-size: 17px !important; border-bottom: 1px solid rgba(19,90,63,.14) !important; }
    header > nav > *:last-child { border-bottom: 0 !important; }
    header > nav > .ax-nav.is-active { border-bottom-color: rgba(19,90,63,.14) !important; }
  }
"""

RUNTIME_JS = """
(function () {
  var AX_SEITE = null;
  var PFAD = { start: '/', prozesse: '/prozesse/', traeger: '/bildungstraeger/', sicherheit: '/sicherheit/',
    preise: '/ablauf-und-kosten/', impressum: '/impressum/', datenschutz: '/datenschutz/', agb: '/agb/' };
  // Alte Links (#/prozesse) auf die echte Adresse umleiten.
  var alt = (location.hash || '').match(/^#\\/(\\w+)/);
  if (alt && PFAD[alt[1]] && AX_SEITE !== alt[1]) { location.replace(PFAD[alt[1]]); return; }
  var page = AX_SEITE || 'start';
  document.querySelectorAll('.ax-page').forEach(function (el) { el.hidden = el.dataset.page !== page; });
  document.querySelectorAll('.ax-nav').forEach(function (el) { el.classList.toggle('is-active', el.dataset.nav === page); });
  document.documentElement.dataset.page = page;
  // Burger-Menü fürs Handy: Knopf hinter „Anfrage senden“ einhängen.
  var kopf = document.querySelector('header'), menue = kopf && kopf.querySelector('nav');
  if (kopf && menue) {
    menue.id = 'ax-menue';
    var burger = document.createElement('button');
    burger.type = 'button'; burger.className = 'ax-burger';
    burger.setAttribute('aria-label', 'Menü öffnen'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-controls', 'ax-menue');
    burger.innerHTML = '<span></span>';
    kopf.appendChild(burger);
    var zu = function () { kopf.classList.remove('is-offen'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menü öffnen'); };
    burger.addEventListener('click', function () {
      var offen = kopf.classList.toggle('is-offen');
      burger.setAttribute('aria-expanded', String(offen)); burger.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    });
    menue.addEventListener('click', zu);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-go], [data-nav]');
    if (!btn) return;
    var ziel = btn.dataset.go || btn.dataset.nav;
    if (!PFAD[ziel]) return;
    e.preventDefault();
    if (ziel === page) { window.scrollTo(0, 0); return; }
    location.href = PFAD[ziel];
  });
  // Ohne Kontaktformular (Rechtsseiten) fuehrt „Anfrage senden“ zur Startseite.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href="#kontakt"]');
    if (!link || document.getElementById('kontakt')) return;
    e.preventDefault();
    location.href = '/#kontakt';
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

  reveal();
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
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
{helmet}
<style>{runtime_css}</style>
</head>
<body>
{body}
<script>{runtime_js}</script>
</body>
</html>
""".format(
    helmet=helmet.strip().replace(
        "</style>", "\n" + "\n".join("  " + r for r in extra_css) + "\n</style>"
    ),
    runtime_css=RUNTIME_CSS,
    body=body.strip(),
    runtime_js=RUNTIME_JS,
)

# ------------------------------------------------------- eine Datei je Seite
# Fuer Suchmaschinen: jede Seite hat ihre eigene Adresse (/prozesse/ usw.),
# genau eine <h1>, eigenen Titel, Beschreibung und Canonical. Im Dokument
# bleibt nur die eigene .ax-page stehen.
DOMAIN = "https://neotena.jasonschreiber.at"
PFAD = {"start": "/", "prozesse": "/prozesse/", "traeger": "/bildungstraeger/", "sicherheit": "/sicherheit/",
        "preise": "/ablauf-und-kosten/", "impressum": "/impressum/", "datenschutz": "/datenschutz/", "agb": "/agb/"}
META = {
    "start": ("Software für AMS-Bildungsträger | Neotena Wien",
              "Eine Akte pro Person: Teilnehmerverwaltung, Formulare, Anwesenheiten und eAMS-Meldungen automatisch — lokal und verschlüsselt. Bezahlt nur für Menschen in Ausbildung."),
    "prozesse": ("Sechs Abläufe automatisiert — Teilnehmer, Formulare, eAMS | Neotena",
                 "Teilnehmerverwaltung, Word- und PDF-Formulare, Excel-Listen zusammenführen, Anwesenheiten, Betriebsmatching und Portale wie eAMS automatisch befüllen."),
    "traeger": ("Für AMS-Bildungsträger: Dokumentationspflichten abgedeckt | Neotena",
                "Anwesenheitslisten, Betreuungsverlauf, Meldungen an den Fördergeber, Aufbewahrung und Erfolgsnachweis — was Ihre Vorgaben verlangen und was die Software abdeckt."),
    "sicherheit": ("Sicherheit & DSGVO — Teilnehmerdaten bleiben im Haus | Neotena",
                   "Lokale, verschlüsselte Datenhaltung (AES-256-GCM, Argon2id), Rollen, revisionssichere Protokollierung, Ende-zu-Ende-Verschlüsselung zwischen Standorten. Keine Cloud, keine Telemetrie."),
    "preise": ("Ablauf & Kosten — Software as a Result | Neotena",
               "Prozessaufnahme, Bauplan, Einrichtung, Betrieb. Sie zahlen nur für Menschen in Ausbildung — vorher kostet es nichts."),
    "impressum": ("Impressum | Neotena", "Impressum und Offenlegung nach § 5 ECG und § 25 MedienG."),
    "datenschutz": ("Datenschutzerklärung | Neotena", "Datenschutzerklärung von Neotena."),
    "agb": ("Allgemeine Geschäftsbedingungen | Neotena", "Allgemeine Geschäftsbedingungen von Neotena."),
}

def seite_ausschneiden(html_text, behalten):
    """Entfernt jede .ax-page ausser `behalten` (ausbalanciert ueber <div>)."""
    teile, pos = [], 0
    for m in re.finditer(r'<div class="ax-page" data-page="(\w+)" hidden>', html_text):
        if m.start() < pos:
            continue
        tiefe, i = 0, m.start()
        for t in re.finditer(r"<div\b|</div>", html_text[m.start():]):
            tiefe += 1 if t.group(0) == "<div" else -1
            if tiefe == 0:
                ende = m.start() + t.end()
                break
        if m.group(1) == behalten:
            teile.append(html_text[pos:m.start()])
            teile.append(html_text[m.start():ende].replace(" hidden>", ">", 1))
        else:
            teile.append(html_text[pos:m.start()])
        pos = ende
    teile.append(html_text[pos:])
    return "".join(teile)

def fuer_seite(seite):
    h = seite_ausschneiden(out, seite)
    titel, beschr = META[seite]
    url = DOMAIN + PFAD[seite]
    h = re.sub(r"<title>.*?</title>", "<title>%s</title>" % html.escape(titel, quote=False), h, count=1, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*" />', '<meta name="description" content="%s" />' % html.escape(beschr), h, count=1)
    h = re.sub(r'<link rel="canonical" href="[^"]*" />', '<link rel="canonical" href="%s" />' % url, h, count=1)
    h = re.sub(r'<meta property="og:title" content="[^"]*" />', '<meta property="og:title" content="%s" />' % html.escape(titel), h, count=1)
    h = re.sub(r'<meta property="og:description" content="[^"]*" />', '<meta property="og:description" content="%s" />' % html.escape(beschr), h, count=1)
    h = h.replace('<meta property="og:type"', '<meta property="og:url" content="%s" />\n<meta property="og:type"' % url, 1)
    # Wurzel-relative Pfade, damit /prozesse/ dieselben Dateien findet
    h = re.sub(r'(src|href)="assets/', r'\1="/assets/', h)
    h = h.replace("var AX_SEITE = null;", "var AX_SEITE = %s;" % json.dumps(seite))
    if seite in ("impressum", "datenschutz", "agb"):
        h = re.sub(r'<div id="ax-kontakt-wrap">.*?</section>\s*</div>', "", h, count=1, flags=re.S)
    return h

for seite, pfad in PFAD.items():
    ziel = ROOT / pfad.strip("/") / "index.html" if pfad != "/" else OUT
    ziel.parent.mkdir(exist_ok=True)
    ziel.write_text(fuer_seite(seite), encoding="utf-8")

(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join("  <url><loc>%s%s</loc></url>\n" % (DOMAIN, p) for s, p in PFAD.items() if s not in ("impressum", "datenschutz", "agb"))
    + "</urlset>\n", encoding="utf-8")

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
    "<title>Neotena Prozessautomatisierung</title>\n"
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
