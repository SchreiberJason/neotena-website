---
type: Entscheidung
title: Keine Anfragen an fremde Server
description: Schriften liegen selbst gehostet unter assets/fonts, der interaktive Ablauf ist ein eigener Nachbau statt React Flow.
tags: [neotena-website, datenschutz, abhaengigkeiten]
status: stable
generated:
  by: claude-code/opus-5.5
  at: 2026-10-25T19:40:00Z
sources:
  - resource: assets/fonts/fonts.css
    title: Selbst gehostete Schriften
  - resource: assets/flow.js
    title: Ablauf im Stil von reactflow.dev
---

# Keine Anfragen an fremde Server

## Frage
Die Seite lud ihre Schriften von fonts.googleapis.com, und für den
interaktiven Ablauf stand React Flow im Raum. Beides heißt: der Browser
jedes Besuchers fragt bei einem Dritten an.

## Entscheidung
Space Grotesk und IBM Plex Mono liegen unter `assets/fonts/` (nur latin und
latin-ext, OFL 1.1). Der Ablauf ist ein eigener Nachbau in `assets/flow.js`,
ohne Abhängigkeiten, Aussehen auf reactflow.dev gemessen. Die Seite ruft
keinen fremden Host auf.

## Alternativen
- **Google Fonts per Link:** schickt die IP jedes Besuchers an Google; in
  Österreich und Deutschland bereits abgemahnt.
- **React Flow von einem CDN (esm.sh, unpkg):** dieselbe Weitergabe der IP,
  und sie müsste in die Datenschutzerklärung — falsches Signal für eine Seite,
  deren Kernversprechen „Ihre Daten bleiben bei Ihnen“ ist.
- **React Flow per npm gebündelt:** brächte npm, einen Bundler und rund
  200 KB JavaScript in ein Repo ohne Build-Schritt.

## Folgen
- Neue Schriftschnitte oder Zeichensätze müssen von Hand nachgeladen werden.
- `flow.js` ist eigener Code: Verhalten, das React Flow mitbrächte
  (Verbinden, Minimap, Controls), gibt es nur, wenn es hier gebaut wird.
- Jede künftige Einbindung (Analyse, Karten, Videos) prüft zuerst, ob sie
  einen fremden Host anfragt — Prüfung im Browser: alle fremden Hosts
  blockieren, die Seite muss vollständig laden.
