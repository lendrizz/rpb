# PLAN.md — RP-Bau Website (Wiesloch)

## Zweck
Umsetzung der Website für RP-Bau gemäß `brief.md` (maßgeblich) und `credentials.md` (Datenquelle). Ziel: Anfragen generieren. Statischer, handgemachter Auftritt, Mobile First, kein Framework/Bundler-Zwang.

## Eingaben / Abhängigkeiten
- `brief.md` — vollständige fachliche/technische Vorgabe.
- `credentials.md` — Betriebs-/Kontaktdaten, Rechtstexte, Leistungs- und Über-uns-Textgrundlage. **Nicht committen** (`.gitignore`).
- `logo.jpeg` — aktuell vorhanden; Variante für hell/dunkel prüfen (s. Phase 1/2). Bei Bedarf PNG/SVG mit Transparenz als zusätzliche Datei ablegen.
- Noch fehlende Assets (als Platzhalterpfade planen): Inhaberfoto (`/images/ueber-uns/robert-palumbo.*`), Hero-Bilder je Leistung, Vorher/Nachher-Paare je Leistung, Galerie-Bilder. Pfade in `js/gallery-data.js` und HTML zentral dokumentieren.

## Globale Entscheidungen
| Thema | Entscheidung |
|---|---|
| Stack | Vanilla HTML/CSS/JS (ES-Module). Mehrseitig, statisch. |
| Hosting/DNS | Vercel + Cloudflare (SPF/DKIM für Resend-Domain in README). |
| Formular | `/api/contact.js` Vercel Serverless Function (Node), Resend. `RESEND_API_KEY` nur Env. |
| Bilder-Upload im Formular | **In Phase 5 weglassen** (empfohlen). Begründung: serverless Request-Size/Parsing, Datei-MIME/Größenvalidierung, Spam-/Malware-Risiko, Resend-Attachment-Limits, zusätzlicher Storage nicht im Brief vorgesehen. Formular bleibt vollständig nutzbar (Nachricht + E-Mail/Telefon). Optionaler Folgeauftrag: externer Upload (z. B. signierte URL) nur mit expliziter Freigabe. |
| Header/Footer | Wiederholtes Markup pro Seite (kein Build). Änderungsstellen in README. |
| Drittanbieter | Keine Analytics/Tracking/CDNs/Maps/Google reCAPTCHA. Schriften lokal (WOFF2). WhatsApp nur als `wa.me`-Link. |
| Datenübernahme | Rechtlich/SEO-relevante Daten statisch in HTML. Dynamische Links (Tel/WhatsApp/Mail/Formular-Empfängeranzeige nicht nötig) über `js/config.js`. |
| Unbestätigte Angaben | Werte aus `credentials.md`, die `[ ... ]`/„nur falls zutreffend“ enthalten, **nicht als Fakt** rendern: als sichtbarer `[PLATZHALTER]` ausgeben und in README/Abnahmeliste erfassen. Fehlende Pflichtangaben ebenfalls `[PLATZHALTER]` + Endliste. |

## Bekannte Platzhalter / zu klären
Aus `credentials.md` / Assets:
- Handwerkskammer (Name/Anschrift), Eintragung Handwerksrolle — fehlen → `[PLATZHALTER]` im Impressum.
- Betriebshaftpflicht — leer; nur aufnehmen, wenn gewünscht → vorerst weglassen, in README vermerken.
- Steuernummer vorhanden (`44197/22488`); USt-IdNr. nicht vorhanden → nicht erfinden; Feld nur zeigen, wenn vorhanden, sonst weglassen/Platzhalter je rechtlicher Notwendigkeit (im Plan als Prüfpunkt).
- Google/Instagram/Facebook `tbd` → **nicht verlinken**, keine Social-Einbindungen.
- Inhaberfoto `tbd` → Platzhalterbildpfad, Alt-Text vorbereiten.
- Leistungsstichpunkte mit `[Großformate…]`, `[Außenbereich…]` → als `[PLATZHALTER: nur falls zutreffend bestätigen]` oder weglassen; Umsetzung konsistent, nicht als Leistungsversprechen.
- Logo nur JPEG: auf `#fff8ef`/`#1f1d2b` prüfen; ggf. freigestellte Variante erstellen/anfordern.

## Projektstruktur (Ziel)
```text
RPB/
├─ brief.md
├─ credentials.md                 # lokal, gitignored
├─ .gitignore
├─ .env.local                     # lokal, gitignored
├─ README.md
├─ PLAN.md
├─ vercel.json
├─ robots.txt
├─ sitemap.xml
├─ index.html
├─ galerie.html
├─ ueber-uns.html
├─ impressum.html
├─ datenschutz.html
├─ cookie-einstellungen.html
├─ leistungen/
│  ├─ fliesenlegen.html
│  ├─ sanierung.html
│  ├─ badsanierung.html
│  ├─ maler-tapezierarbeiten.html
│  ├─ trockenbau.html
│  └─ balkon.html
├─ api/
│  └─ contact.js                  # Vercel Serverless (Node)
├─ css/
│  ├─ tokens.css
│  ├─ base.css
│  ├─ components.css
│  └─ pages.css
├─ js/
│  ├─ config.js                   # Kontaktdaten aus credentials.md
│  ├─ compare-slider.js           # Vorher/Nachher, wiederverwendbar
│  ├─ gallery-data.js             # zentrale Bilddaten
│  ├─ gallery.js                  # Rendering/Filter/Anker
│  ├─ hero.js                     # Interaktiver Hero (Zonen-Overlay, Hover/Tippen)
│  ├─ contact-form.js             # clientseitige Validierung + fetch
│  ├─ consent.js                  # Cookie-Auswahl, localStorage, gate
│  └─ main.js                     # Nav/Mobile/Sticky-Leiste/A11y-Init
├─ fonts/                         # lokale WOFF2 + Lizenzhinweis
└─ images/
   ├─ logo/                        # logo.jpeg + ggf. Varianten
   ├─ hero/                        # hero-haus-desktop/mobile.jpg, zones-*.json/svg, inhaber.png
   ├─ leistungen/{fliesenlegen,sanierung,badsanierung,maler-tapezierarbeiten,trockenbau,balkon}/
   ├─ galerie/
   └─ ueber-uns/
```

## Daten-Mapping (`credentials.md` → Ausgabe)
| Quelle | Ziele |
|---|---|
| Firmenname, Inhaber, Berufsbezeichnung, Slogan | Header/Footer, Hero, Über uns, Schema.org, Title/OG. |
| Anschrift, Einzugsgebiet | Kontakt/Footer, Impressum, Datenschutz Verantwortlicher, Schema `areaServed`/Adresse, lokale Keywords. |
| Telefon, E-Mail, WhatsApp, Erreichbarkeit | `js/config.js` (Tel/WA), statisch in Kontakt/Impressum/Footer/Header-CTA. |
| Rechtliches (§5 DDG, §18 MStV) | `impressum.html` vollständig, fehlende Werte `[PLATZHALTER]`. |
| Domain/Resend | README, API-Konfig (Env-Namen dokumentiert), Datenschutz. |
| Über uns / Leistungen / Ablauf | `ueber-uns.html`, Leistungsseiten, Startseiten-Teaser/FAQ-Platzhalter; Eckiges nur als Platzhalter. |
| Logo/Inhaberfoto-Pfade | Header/Footer/Hero/Über uns; fehlende Medien als benannte Platzhalter. |

## Phasenplan (einzeln abnehmen)

### Phase 1 — Struktur, Basis, Sicherheit
**Ziel:** Lauffähiges statisches Gerüst mit Designsystem und Doku.
- Repo-Basis: `.gitignore` (`credentials.md`, `.env*`, `node_modules`, `.vercel`, OS-Dateien), `.env.local.example` (nur Variablennamen/Kommentare), `README.md` Grundstruktur.
- Projektstruktur anlegen (Ordner/Leerdateien/Platzhalterbilder-Pfade dokumentiert).
- `css/tokens.css`: Farbvariablen exakt lt. Brief + neutrale Text/Spacing/Radius/Shadow-Tokens; Fokus-/Kontrast-kompatible Ableitungen nur innerhalb Regeln.
- `css/base.css`: Reset/Normalize-Ansatz, Typografie (`@font-face`, WOFF2, `font-display: swap`), semantische Defaults, `prefers-reduced-motion`, Skip-Link-Styles.
- `css/components.css` + `pages.css`: leere/modulare Grundgerüste.
- `js/config.js`: Werte aus `credentials.md` (inkl. normalisierte Tel/WA-Links), keine Secrets.
- `vercel.json`: Security-Header (CSP ohne externe Quellen, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`; `frame-ancestors`/`Permissions-Policy` prüfen und minimal setzen), Asset-Caching.
- `robots.txt`, `sitemap.xml` (Platzhalter-Domain `https://rp-bau.info`).
- Lokale Schriftwahl (lizenzfrei, markant + lesbar, nicht Inter-Standardoptik) und Einbindung vorbereiten; Dateien in `fonts/` ablegen oder als TODO mit Lizenznachweis.
- Logo auf hell/dunkel prüfen; Variante dokumentieren/ablegen.
- **Abnahme:** Dateien/Struktur vollständig, CSS lädt ohne Fehler, Kontrast-Tokens dokumentiert, keine Secrets im Repo.
- **Lokaltest:** statischer Server (`npx serve .` o. ä.) oder direkt öffnen; HTML-Validator grob; CSS-Variablen sichtbar.
- **Nächstes:** Phase 2.

### Phase 2 — Globale UI, Navigation, Responsive-Grundlayout
**Ziel:** Wiederverwendbares Seitenlayout auf allen Seitentypen.
- Gemeinsames Markup-Muster: Skip-Link, Header (Logo, Navigation zu Start/Leistungen/Galerie/Über uns/Kontakt, Header-CTA), Main, Footer (Kontakt, Rechtliches, Cookie-Einstellungen).
- Mobile Navigation (zugänglich, tastaturbedienbar, Fokusfalle vermeiden), Sticky-Kontaktleiste mobil (Anrufen/WhatsApp/Anfrage).
- Responsive Raster/Spalten-System in CSS (ohne Framework).
- CTA-Komponente: konsistent, Akzentfarbe sparsam, Text `#1f1d2b` auf Orange.
- Bilder-Pattern: `<picture>`/`srcset`-Schnittstelle, `width`/`height`, `loading="lazy"` außer Hero.
- **Abnahme:** Layout auf allen geplanten Seiten (ggf. Stub-Inhalte) konsistent, Header/Footer-Änderungsstellen in README notiert.
- **Lokaltest:** 320/375/768/1024/1440px; Tastatur/Focus; `prefers-reduced-motion`.
- **Nächstes:** Phase 3.

### Phase 3 — Startseite
**Ziel:** Conversion-starke `index.html` mit Hero-Spalten und Kontaktbereich.
- Hero: interaktives Haus im Querschnitt (siehe `brief.md`, Abschnitt Startseite). `js/hero.js` baut aus `images/hero/zones-*.json` ein SVG-Overlay mit echten Links je Leistung (inkl. Balkon). Hover/Fokus hebt Raum hervor, Touch: erster Tipp markiert, zweiter öffnet. Inhaber (`images/hero/inhaber.png`) als klickbare Ebene zu "Über uns". Chip-Liste unter dem Bild als Fallback.
- Hero-Aussagen: „Seit 20 Jahren“, „Handwerker des Vertrauens“ (aus Claim), primärer CTA „Anfrage“, WhatsApp-Button (`config.js`).
- Mobil: Text, Hochformat-Bild (`hero-haus-mobile.jpg`), Chip-Liste. Desktop: Text links, Bild rechts (`hero-haus-desktop.jpg`).
- Vertrauenssektion: 20 Jahre, Einzugsgebiet 100 km, Ablauf 4 Schritte (aus `credentials.md`).
- Galerie-Teaser, Kontaktbereich mit Formular-Markup (Funktion in Phase 5).
- SEO: Title/Description lokal (Wiesloch, Rhein-Neckar), genau 1 H1, OG-Tags, JSON-LD `HomeAndConstructionBusiness` nur mit bestätigten Daten.
- Cookie-Banner nur hier (UI in Phase 3, Logik in Phase 6).
- **Abnahme:** Inhalte faktentreu, alle CTAs vorhanden, keine erfundenen Referenzen/Zahlen.
- **Lokaltest:** Links, Snap-Verhalten Touch/Trackpad, Kontraste, Screenreader-Grundcheck.
- **Nächstes:** Phase 4.

### Phase 4 — Leistungsseiten, Galerie, Über uns
**Ziel:** Alle Inhaltsseiten inkl. Vorher/Nachher-Modul.
- `js/compare-slider.js`: ES-Modul, Data-Attribute (`data-compare`, Bildquellen, Labels), zwei 100%-überlagerte Bilder, `clip-path`, Pointer Events (Maus/Touch), `touch-action: pan-y`, Tastatur (Links/Rechts/Home/End), ARIA `role="slider"`, `aria-valuemin/max/now`, `aria-label`, Resize-sicher. Initialisierung idempotent.
- 6 Leistungsseiten (inkl. Balkon) mit großem Hero-Slider, Leistungsbeschreibung (credentials, Platzhalter bei Eckigem), Ablauf, FAQ `<details>` Platzhalter, CTA-Block.
- `galerie.html`: Abschnitte/Anker oder Filter je Tätigkeitsfeld, `js/gallery-data.js` als zentrale Datenquelle, Rendering aus Daten, gleicher Slider.
- `ueber-uns.html`: Inhaberfoto-Platzhalter, 20 Jahre/Berufserfahrung, Werte aus credentials, CTA.
- Pro Seite: eigene Meta/OG/H1, lokale Keywords natürlich.
- **Abnahme:** Slider funktioniert mit Maus, Touch, Tastatur; keine vertikale Scroll-Blockade; Modul nur einmal implementiert.
- **Lokaltest:** Touch-Simulation/echtes Gerät falls möglich; Tastatur; reduzierte Bewegung.
- **Nächstes:** Phase 5.

### Phase 5 — Kontaktformular + Resend API
**Ziel:** Sicherer Anfrageweg Ende-zu-Ende (lokal/Vercel).
- Felder: Name, E-Mail oder Telefon (mind. eins), Leistung (Auswahl), PLZ/Ort, Nachricht, Datenschutz-Checkbox Pflicht. Kein Upload (s. Entscheidung).
- `js/contact-form.js`: clientseitige Validierung, `fetch` POST `/api/contact`, Lade-/Erfolgs-/Fehlerzustand, barrierefreie Statusmeldungen.
- `api/contact.js`: Node Serverless, JSON-Parsing, erneute Validierung, Honeypot-Feld, einfaches Rate-Limit (z. B. IP+Zeitfenster, best effort auf Serverless; Grenzen in README), Methodenbeschränkung, klare 4xx/5xx, Resend-Versand an `credentials.md`-Empfänger, Absender = verifizierte Resend-Adresse.
- Sicherheitsaspekte: Input-Längenlimits, Header/Injection-Schutz, keine Secrets im Client, CORS nur same-origin/notwendig.
- **Abnahme:** Gültige Anfrage sendet Mail; ungültige/Spam wird sauber abgewiesen; UI verständlich bei Fehler.
- **Lokaltest:** `vercel dev`/äquivalent mit `.env.local`; ungültige Fälle; Rate-Limit.
- **Nächstes:** Phase 6.

### Phase 6 — Rechtliches, Consent, Feinschliff
**Ziel:** Rechtstexte, Banner-Logik, QA.
- `impressum.html` (§5 DDG, TMG-Kontext nicht erfinden) mit Daten aus `credentials.md`; fehlende Kammer/Rolle als `[PLATZHALTER]`.
- `datenschutz.html` (DSGVO): Verantwortlicher, Vercel Hosting, Cloudflare DNS/CDN, Kontaktformular/Resend, WhatsApp-Kontakt (Meta/WhatsApp, Link-Klick), Server-Logfiles, localStorage Cookie-Auswahl, Rechte, Speicherdauer. Keine ungenutzten Dienste.
- `js/consent.js` + `cookie-einstellungen.html`: Banner nur Startseite, Buttons gleichwertig (Alle akzeptieren / Nur notwendige / Einstellungen), nur Kategorie „Notwendig“ aktiv, erweiterbare Struktur, Speicherung in `localStorage`, jederzeit änderbar. Nicht-notwendige Skripte (derzeit keine) nur nach Einwilligung laden — Gate-Funktion vorhanden.
- QA: Links, 404-nahe Pfade, Bilder-Alt, Heading-Hierarchie, Fokus, Tastatur-Slider, Formular ohne JS? (progressive enhancement wo sinnvoll dokumentieren; fetch erfordert JS, Fehlermeldung klar).
- Performance: Bildgrößen/WebP-AVIF-Fallback-Strategie, kein unnötiges JS, Lighthouse-Mobilziel > 90.
- **Abnahme:** Rechtseiten vollständig/plausibel aus Datenbasis, Banner auf Startseite, Einstellungen änderbar, keine Drittanbieter-Requests.
- **Lokaltest:** Network-Tab auf externe Requests; localStorage; Lighthouse lokal.

## README (Pflichtinhalte)
- Setup lokal, Env-Variablen (`RESEND_API_KEY`, optional Absender/Empfänger falls nicht hardcoded), `.env.local.example`.
- Resend-Domain-Setup (SPF/DKIM/Return-Path) über Cloudflare + Domain-Verifizierung.
- Vercel Deployment, Cloudflare DNS-Hinweise.
- Kontaktdaten-Stellen: `js/config.js`, alle HTML-Seiten mit Nennung, Impressum/Datenschutz/Schema, Footer/Header — exakte Dateiliste pflegen.
- Header/Footer-Änderungsstellen (alle HTML-Dateien).
- Bilder/Galerie austauschen: `images/*`, `js/gallery-data.js`, Leistungsseiten-Hero-Attribute.
- Liste aktueller `[PLATZHALTER]`.

## Abnahmeformat pro Phase (für Umsetzung)
Nach jeder Phase liefern:
1. **Fertig:** konkret erstellte/geänderte Dateien + Verhalten.
2. **Lokal getestet:** Kommandos/Browserchecks/Ergebnis.
3. **Platzhalter/Offen:** was noch durch echte Daten/Medien ersetzt werden muss.
4. **Nächstes:** folgende Phase.

## Risiken / Hinweise
- Rechtstexte sind datenbasiert umgesetzt, aber keine Rechtsberatung; fehlende Kammerdaten müssen nachgetragen werden.
- Resend erfordert verifizierte Domain (`anfrage@rp-bau.info`) vor produktivem Versand.
- Rate-Limit in Serverless ist best-effort; bei Bedarf Upstash/KV ergänzen (separater Auftrag).
- JPEG-Logo kann auf dunklem Grund problematisch sein; freigestellte Variante empfohlen.
