# BRIEF.md: Website für einen Handwerksbetrieb aus Wiesloch

Rolle: Senior Webdesigner und Frontend-Entwickler. Baue eine Website für einen Handwerksbetrieb aus Wiesloch. Ziel: Anfragen generieren. Das Design soll handgemacht und hochwertig wirken, nicht wie ein generisches KI-Template.

Diese Datei ist die maßgebliche Vorgabe für das gesamte Projekt.

---

## STACK

- Reines HTML, CSS und JavaScript (Vanilla, ES-Module). Kein Framework, kein Tailwind, kein Bundler-Zwang.
- Mehrseitige statische Website, Mobile First.
- Hosting Vercel, DNS Cloudflare.
- Kontaktformular über Resend: Vercel Serverless Function unter `/api/contact.js` (Node). Validierung, Honeypot, Rate-Limit, Fehlerbehandlung. `RESEND_API_KEY` nur als Umgebungsvariable.
- WhatsApp-Button als Link (`wa.me`), Nummer aus `credentials.md`.
- Schriften lokal einbinden (WOFF2 im Repo, kein Google-Fonts-CDN).
- Keine Analytics, keine Tracking-Skripte, keine Drittanbieter-CDNs, keine eingebetteten Karten.
- Header und Footer als wiederholtes Markup in jeder Seite (kein Build-Schritt). In der README dokumentieren, wo sie bei Änderungen angepasst werden müssen.
- CSS strukturiert: `tokens.css` (Variablen), `base.css`, `components.css`, `pages.css`. Kein Inline-CSS.

## DESIGN

Farbpalette (als CSS-Variablen in `tokens.css`):

| Rolle | Hex | Einsatz |
|---|---|---|
| primary | `#1f1d2b` | Text, Header, Footer, dunkle Flächen |
| accent | `#ff7a00` | CTAs, Linien, Hover, Akzente (sparsam) |
| secondary | `#ffa94d` | Sekundäre Akzente, Hover-Zustände, Hervorhebungen auf dunklem Grund |
| surface | `#ffe4c7` | Karten, Abschnittsflächen |
| background | `#fff8ef` | Seitenhintergrund |

Kontrast-Regeln:
- Orange (`#ff7a00`, `#ffa94d`) nie als Textfarbe auf hellem Hintergrund (zu geringer Kontrast).
- Text auf Orange-Flächen (Buttons): `#1f1d2b`.
- Orange als Text oder Linie nur auf `#1f1d2b`.
- Fließtext: `#1f1d2b` auf `#fff8ef` oder `#ffe4c7`.
- Fokuszustände sichtbar (mind. 3:1 Kontrast).

Weitere Vorgaben:
- Logo (Anhang) im Header und Footer einbinden. Prüfen, ob das Logo auf hellem und dunklem Grund lesbar ist, und bei Bedarf eine Variante vorschlagen.
- Typografie: markante, handwerklich-solide Überschriftenschrift plus gut lesbare Textschrift. Keine Standard-Inter-Optik. Lizenzfreie Schriften, lokal eingebunden, mit `font-display: swap`.
- Verboten: Verlaufs-Orgien, Glassmorphism, generische Stockfoto-Icons, Floskeln wie "Ihr zuverlässiger Partner für alles".
- Bilder: Platzhalter mit klar benannten Dateipfaden (`/images/...`), die später ausgetauscht werden. `<picture>`/`srcset`, `width`/`height` gesetzt, `loading="lazy"` außer im Hero, korrekte Alt-Texte.
- Tonalität: direkt, bodenständig, persönlich.

## DATENQUELLE KONTAKTDATEN

- Alle Betriebs- und Kontaktdaten (Firmenname, Inhaber, Anschrift, Telefon, E-Mail, WhatsApp-Nummer, Rechtsform, USt-ID, Handwerkskammer, Berufsbezeichnung, Resend-Absender und -Empfänger) stehen in `credentials.md` im Projektordner.
- Lies die Datei aus und übernimm die Werte statisch in die HTML-Seiten (wichtig für Impressum und SEO). Zusätzlich eine zentrale `js/config.js` für dynamische Teile (WhatsApp-Link, Tel-Link).
- In der README auflisten, an welchen Stellen Kontaktdaten stehen, damit spätere Änderungen leicht fallen.
- Secrets (`RESEND_API_KEY`) nie in Code oder Repo, nur in `.env.local` bzw. Vercel-Umgebungsvariablen. `credentials.md` und `.env*` in `.gitignore`.
- Fehlt ein Wert, als gut sichtbaren `[PLATZHALTER]` ausgeben und am Ende auflisten. Keine Informationen erfinden.
- Die Abschnitte "Über uns", "Leistungen" und "Ablauf" in `credentials.md` sind Textgrundlage. Eckige Klammern darin sind unbestätigt und müssen als `[PLATZHALTER]` erscheinen, nicht als Fakt.

## INHALTE

- Keine Informationen erfinden (Referenzen, Bewertungen, Preise, Zertifikate, Zahlen).
- Fakten, die feststehen:
  - Standort Wiesloch, Einzugsgebiet 100 km
  - 20 Jahre Berufserfahrung, Positionierung als "Handwerker des Vertrauens"
  - Leistungen: Fliesenlegen, Sanierung, Badsanierung, Maler- und Tapezierarbeiten, Trockenbau, Balkon (Balkon ist eine eigene Leistung mit eigener Unterseite)
  - Keine weiteren Leistungen oder Qualifikationen aufführen.
- Ablauf in vier Schritten (Anfrage, Besprechung, Angebot, Umsetzung), schlicht und schnell formuliert. Keine Zeit- oder Preisversprechen, die nicht in `credentials.md` stehen.

## STARTSEITE (`index.html`)

- Hero als interaktives Bild: Haus im Querschnitt (stilisierte Illustration), in dem jedes Gewerk einen eigenen Raum hat. Dateien: `images/hero/hero-haus-desktop.jpg` (2576x1438), `images/hero/hero-haus-mobile.jpg` (1438x2576), Zonen in `images/hero/zones-desktop.json` und `zones-mobile.json` (Polygone in Bildkoordinaten, je Zone `label`, `href`, `points`).
- Räume: Dachgeschoss = Trockenbau, Obergeschoss links = Badsanierung, Obergeschoss rechts = Maler- und Tapezierarbeiten, Erdgeschoss links = Fliesenlegen, Erdgeschoss rechts = Sanierung, Balkon = Balkon. Jede Zone ist ein echter Link (`<a>`) auf die Leistungsseite, gebaut von `js/hero.js` als SVG-Overlay über dem Bild.
- Hover (Maus) oder Fokus (Tastatur) hebt den Raum hervor: übrige Räume werden abgedunkelt, der aktive Raum bekommt eine Akzent-Kontur und ein Label "Leistung →". Auf Touch markiert der erste Tipp den Raum, der zweite öffnet die Seite.
- Inhaber: freigestelltes Bild `images/hero/inhaber.png` (KI-Karikatur, bewusst unverändert) steht im Vordergrund des Hauses, klickbar, führt zu "Über uns". Alt-Text kennzeichnet es als Karikatur.
- Unter dem Bild eine Chip-Liste mit allen Leistungen plus "Über uns" als Fallback (ohne JS, Touch, Screenreader, SEO).
- Bilder ohne Hintergrundkante: Hero-Hintergrund `--color-hero-bg` (#282420) ist an den Bildrand angeglichen.
- Überschrift, Claim und CTAs sind echter Text neben bzw. über dem Bild, nicht im Bild.
- Im Hero prominent: "Seit 20 Jahren" und die Aussage "Handwerker des Vertrauens", dazu primärer CTA (Anfrage) und WhatsApp-Button.
- Mobil: Text, dann Hochformat-Bild, dann Chip-Liste. Desktop ab 1000px: Text links, Bild rechts.
- Darunter: kurze Vertrauenssektion (20 Jahre, Einzugsgebiet, Ablauf in 4 Schritten), Teaser zur Galerie, Kontaktbereich mit Formular.
- Cookie-Banner nur auf der Startseite (siehe unten).

## UNTERSEITEN TÄTIGKEITSFELDER (je eine pro Leistung)

Dateien: `leistungen/fliesenlegen.html`, `leistungen/sanierung.html`, `leistungen/badsanierung.html`, `leistungen/maler-tapezierarbeiten.html`, `leistungen/trockenbau.html`, `leistungen/balkon.html`.

- Hero: ein großes Bild, das den Hero fast vollständig einnimmt, mit Vorher/Nachher-Slider:
  - Zwei Bilder liegen zu 100 % übereinander (A = links, B = rechts).
  - Vertikaler Regler, per Drag & Drop horizontal verschiebbar (Maus und Touch, Pointer Events).
  - Regler in der Mitte: linke Hälfte zeigt A, rechte Hälfte zeigt B.
  - Regler nach rechts: A wird zunehmend sichtbar bis 100 %.
  - Regler nach links: B wird zunehmend sichtbar bis 100 %.
  - Umsetzung per `clip-path`. Tastatursteuerung (Pfeiltasten, Home/End), ARIA (`role="slider"`, `aria-valuenow`, `aria-label`), vertikales Scrollen auf Mobil darf nicht blockiert werden (`touch-action: pan-y`).
  - Als wiederverwendbares Modul `js/compare-slider.js`, initialisiert über Data-Attribute, ohne Abhängigkeiten.
- Darunter: Leistungsbeschreibung (aus `credentials.md`, sonst Platzhalter), Ablauf, FAQ-Platzhalter (natives `<details>`), CTA-Block (Formular + WhatsApp).

## GALERIE (`galerie.html`)

- Vorher/Nachher-Bilder, gruppiert nach Tätigkeitsfeld (sechs Gruppen inkl. Balkon, Abschnitte mit Anker-Navigation oder Filter), nutzt dasselbe Slider-Modul.
- Bilddaten aus einer zentralen Datei `js/gallery-data.js`, damit Bilder leicht ergänzt werden können. Die Seite rendert daraus.
- Am Ende CTA.

## ÜBER UNS (`ueber-uns.html`)

- Inhaberfoto, Text zu Person und 20 Jahren Erfahrung (aus `credentials.md`, sonst Platzhalter), Werte, CTA.

## CTA-REGEL

Jede Seite hat mindestens einen klaren CTA: Header-Button, Sticky-Kontaktleiste auf Mobil (Anrufen / WhatsApp / Anfrage) und ein CTA-Block am Seitenende.

## KONTAKTFORMULAR

- Felder: Name, E-Mail oder Telefon, Leistung (Auswahl), PLZ/Ort, Nachricht, optional Bilder-Upload (nur wenn technisch sauber lösbar, sonst weglassen und im Plan begründen), Datenschutz-Checkbox (Pflicht).
- Clientseitige Validierung mit `fetch` an `/api/contact`, Bestätigungsanzeige, Fehlerbehandlung, funktioniert auch bei Fehlern verständlich.
- Serverseitig erneute Validierung, Honeypot, einfaches Rate-Limit, Spam-Schutz ohne Google reCAPTCHA.
- Versand über Resend.

## RECHTLICHES (Deutschland)

- Seiten: `impressum.html`, `datenschutz.html`, `cookie-einstellungen.html`. Footer-Links auf jeder Seite.
- Impressum nach § 5 DDG, Daten aus `credentials.md` (inkl. Handwerkskammer, Berufsbezeichnung, USt-ID).
- Datenschutzerklärung (DSGVO) mit Abschnitten zu: Hosting (Vercel), DNS/CDN (Cloudflare), Kontaktformular (Resend, E-Mail-Versand), WhatsApp-Kontakt (Meta/WhatsApp), Server-Logfiles, lokale Speicherung der Cookie-Auswahl, Betroffenenrechte, Speicherdauer. Verantwortlicher aus `credentials.md`. Keine Dienste aufführen, die nicht genutzt werden (insbesondere keine Analytics, keine Karten, keine Social-Media-Einbindungen).
- Cookie-Banner auf der Startseite: üblicher Text, gleichwertige Buttons "Alle akzeptieren", "Nur notwendige", "Einstellungen". Da keine Analytics oder Marketing-Dienste aktiv sind, nur Kategorie "Notwendig" (immer aktiv). Struktur so bauen, dass später weitere Kategorien ergänzt werden können. Auswahl im `localStorage` speichern, jederzeit über die Seite "Cookie-Einstellungen" änderbar. Nicht-notwendige Skripte erst nach Einwilligung laden.

## QUALITÄT

- SEO: sprechende Title/Description pro Seite, Open-Graph-Tags, Schema.org `HomeAndConstructionBusiness` als JSON-LD (nur mit Daten aus `credentials.md`), `sitemap.xml`, `robots.txt`, lokale Keywords (Wiesloch, Rhein-Neckar) natürlich einbauen, sinnvolle Überschriftenhierarchie (genau eine H1 je Seite).
- Barrierefreiheit: Kontrast, Fokuszustände, Alt-Texte, Skip-Link, semantisches HTML, `prefers-reduced-motion` beachten.
- Performance: Lighthouse > 90 mobil, kein unnötiges JS, Bilder in passenden Größen und modernen Formaten (WebP/AVIF mit Fallback).
- `vercel.json` mit Security-Headern (CSP ohne externe Quellen, `X-Content-Type-Options`, `Referrer-Policy`) und Caching für Assets.
- README mit Env-Variablen (`RESEND_API_KEY`, Ziel-E-Mail, Absenderadresse), Resend-Domain-Setup (SPF/DKIM über Cloudflare), Deployment-Hinweisen für Vercel/Cloudflare und Anleitung zum Austauschen von Bildern, Galerie-Einträgen und Kontaktdaten.

## ARBEITSWEISE

1. Zuerst Projektstruktur und Umsetzungsplan (`PLAN.md`), noch kein Code.
2. Danach phasenweise umsetzen, jede Phase einzeln zur Abnahme.
3. Nach jeder Phase kurz auflisten: was fertig ist, wie lokal getestet wird, was als Nächstes kommt.