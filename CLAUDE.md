# Neotena-Website — Anweisungen für Claude Code

Erst `sol.yaml`, dann `SPEC.md` (Invarianten), dann hier.

## Aufbau
- Quelle: `src/Axion Website.dc.html` (Design-Canvas-Syntax: sc-if, {{ }}, style-hover).
  Nie `index.html` oder die Unterordner von Hand ändern — sie sind gebaut.
- `build.py` erzeugt je Seite eine Datei (`/prozesse/index.html` …), `sitemap.xml`,
  Laufzeit-CSS/JS (Routing, Rechner, Burger-Menü) und setzt Titel/Beschreibung je Seite.
- `assets/flow.js` — Ablauf im Stil von reactflow.dev (ohne Abhängigkeit).
- `assets/interaktiv.js` — Prozess-Kreis im Hero, Datenweg, Pflichten, Linienplan.
- `assets/nachbau.js` — nachgebaute Programmteile (Pipeline, Vorlage, Portal-Handy,
  AMS-Maske, Anwesenheit, Akte, Listen zusammenführen, Matching). Anker in der
  Quelle: `<div data-nachbau="…">`.
- Schriften selbst gehostet unter `assets/fonts/`.

## Prüfen vor jedem Commit
- Im echten Browser (Playwright, Chrome) bei 1440 und 390 px: keine Konsolenfehler,
  keine fremden Hosts, nichts ragt über den Rand.
- Die Sandbox sperrt lokale Ports — Dateien über `page.route` ausliefern.

## Was hier oft schiefgeht
- Eine CSS-Regel mit `display:` überschreibt `[hidden]` — immer `[hidden]{display:none}` mitgeben.
- Bausteine in `nachbau.js` beim Ersetzen mitlöschen: nach jedem Umbau prüfen, dass
  alle Funktionen in `BAU` noch existieren.
- Raster mit festen Mindestbreiten laufen auf dem Handy über: `minmax(min(Npx, 100%), 1fr)`.

## Inhalt
Kein Kundenname, keine erfundenen Belege, keine Preise, „Neotena“ statt „wir“ (SPEC §3).
Deploy: Push auf `main`, GitHub Pages baut. Domain `neotena.jasonschreiber.at`.
