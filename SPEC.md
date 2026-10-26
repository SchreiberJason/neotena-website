# Neotena-Website — SPEC

## Zweck
Öffentliche Seite für Neotena: Software für AMS-Bildungsträger. Sie soll in
einem Blick sagen, was die Software ist, was sie kann und was es bringt — und
zur Anfrage führen. Zielgruppe sind Leitungen und Verwaltung von Trägern.

## Seiten
`/` · `/prozesse/` · `/bildungstraeger/` · `/sicherheit/` · `/ablauf-und-kosten/`
· `/impressum/` · `/datenschutz/` · `/agb/` — je eine Datei mit eigenem Titel,
Beschreibung, Canonical und genau einer `<h1>`. Alte Adressen `/#/seite` leiten um.

## Invarianten
1. **Keine fremden Anfragen.** Schriften, Bilder und Skripte liegen im Repo.
   Prüfung: alle fremden Hosts blockieren, die Seite muss vollständig laden
   (docs/decisions/0001).
2. **Keine Preise auf der Seite.** Kostenmodell „Software as a Result“: verrechnet
   wird nur je Person in Ausbildung; ein Angebot gibt es nach der
   Prozessaufnahme (docs/decisions/0002).
3. **Nichts Erfundenes als Tatsache.** Noch kein Träger im Echtbetrieb — keine
   Referenzen, Kennzahlen oder Zitate, die das behaupten. Beispielwerte sind als
   Beispiel gekennzeichnet; Demodaten sind erfunden.
4. **Kein Kundenname** ohne schriftliche Zustimmung des Kunden.
5. **Nachbauten statt Screenshots.** Programmteile werden in `assets/nachbau.js`
   nachgebaut, nicht abfotografiert.
6. **Absender ist Neotena**, nicht „wir“ — es gibt kein Team.
7. **Nichts ragt über den Rand** zwischen 360 und 1440 px; Eingabefelder auf
   dem Handy mindestens 16 px (kein Zoom in iOS).

## Bau
`python3 build.py` übersetzt `src/Axion Website.dc.html` (Design-Canvas-Quelle)
in die Seitendateien und `sitemap.xml`. Gebaute Dateien werden mit eingecheckt,
GitHub Pages liefert sie aus. `.preview/` ist nicht im Repo.

## Offen
- Gewerbe-Platzhalter (GISA-Zahl, UID) und Entwurfs-Hinweis auf den Rechtsseiten.
- Kontaktformular sendet nur per Mailprogramm; echtes Absenden über den
  Eingang nach dem Dashboard-Umbau.
- Aufnahme-Portal wird als Funktion gezeigt, ist aber noch nicht live.
