# Axion — Prozessautomatisierung (Website)

Öffentliche Website für das **Prozessautomatisierungs-Angebot** an Bildungsträger
und Beratungsbetriebe. Nicht zu verwechseln mit `axion-website` — das ist die
Seite zum Desktop-Produkt. Gleicher Name, anderes Ding.

Statische Single-File-Seite, kein Build-Toolchain, kein Backend.

## Aufbau

```
src/Axion Website.dc.html   Quelle aus Claude Design (Canvas-Syntax)
build.py                    übersetzt die Quelle nach index.html
index.html                  das Deploybare — nicht von Hand editieren
assets/                     Screenshots (siehe assets/README.md)
```

`index.html` ist **generiert**. Änderungen gehören in die Design-Quelle oder in
`build.py`, danach:

```bash
python3 build.py
```

## Was build.py übersetzt

Die Design-Quelle nutzt die Claude-Design-Canvas-Syntax. `build.py` löst sie in
Standard-HTML auf:

| Quelle                        | Ergebnis                                          |
|-------------------------------|---------------------------------------------------|
| `<sc-if value="{{ isStart }}">` | `<div class="ax-page" data-page="start">`       |
| `style-hover` / `style-focus` | generierte `.hvN:hover` / `.fcN:focus`-Regeln     |
| `onClick="{{ goPreise }}"`    | `data-go="preise"` + Hash-Routing                 |
| `{{ stundenJahr }}`           | `<span data-bind="stundenJahr">`                  |
| `<image-slot>`                | Platzhalterfläche mit `<img>`-Fallback            |

Das Skript bricht ab, wenn nach dem Lauf noch unübersetzte Design-Syntax oder
doppelte `class`-Attribute im Markup stehen.

## Routing

Acht Seiten in einer Datei, per Hash: `#/start`, `#/prozesse`, `#/traeger`,
`#/sicherheit`, `#/preise`, `#/impressum`, `#/datenschutz`, `#/agb`.
`#kontakt` bleibt ein Sprungziel innerhalb der Seite.

## Kontaktformular

Ohne Backend. Das Formular validiert und öffnet dann einen vorausgefüllten
E-Mail-Entwurf an `office@jasonschreiber.at`. Wenn echtes Server-Handling
gewünscht ist (Formspree, eigener Endpoint), ist das der Ort zum Ansetzen:
der `submit`-Handler am Ende von `build.py`.

## Lokal ansehen

```bash
python3 -m http.server 8000
# http://localhost:8000
```
