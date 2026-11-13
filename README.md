# RP-Bau Website

Statische Website für RP-Bau (Robert Palumbo, Fliesenlegermeister) aus Wiesloch. Vanilla HTML/CSS/JS, Mobile First, Hosting Vercel + DNS Cloudflare.

## Setup lokal

```bash
# Statischer Server (Beispiel)
npx serve .
# oder
python3 -m http.server 8080
```

Für Formular-/API-Tests lokal: `vercel dev` (Vercel CLI) mit `.env.local`.

## Umgebungsvariablen

Siehe `.env.local.example`. In `.env.local` setzen (nicht committen):

- `RESEND_API_KEY` — Resend API Key
- `RESEND_FROM` — Absender (muss bei Resend verifiziert sein), Standard: `anfrage@rp-bau.info`
- `RESEND_TO` — Empfänger für Anfragen, Standard: `anfrage@rp-bau.info`

## Resend-Domain-Setup (rp-bau.info)

1. Domain in Resend hinzufügen.
2. SPF/DKIM (und ggf. Return-Path) DNS-Einträge bei Cloudflare setzen.
3. Verifizierung in Resend abwarten.
4. `RESEND_FROM` muss eine verifizierte Adresse/Domain verwenden.

## Deployment

- **Vercel**: Repo verbinden, Framework Preset „Other/Static“, Build leer (statisch), Output Root `.`. Env-Variablen in Vercel Project Settings setzen.
- **Cloudflare**: DNS auf Vercel zeigen (CNAME/A wie von Vercel vorgegeben). SPF/DKIM für Resend ergänzen.

## Header/Footer ändern

Kein Build-Schritt; Markup ist in jeder Seite wiederholt. Bei Änderungen in **allen** Dateien anpassen:

- `index.html`
- `galerie.html`
- `ueber-uns.html`
- `impressum.html`
- `datenschutz.html`
- `cookie-einstellungen.html`
- `leistungen/fliesenlegen.html`
- `leistungen/sanierung.html`
- `leistungen/badsanierung.html`
- `leistungen/maler-tapezierarbeiten.html`
- `leistungen/trockenbau.html`
- `leistungen/balkon.html`

## Kontaktdaten ändern

Quelle: `credentials.md` (lokal, gitignored). Werte statisch in HTML und dynamisch in JS pflegen:

- `js/config.js` — zentrale Daten (Tel/WhatsApp/Mail/Adresse/Legal)
- Alle HTML-Dateien — Footer/Header-Kontakt, CTA-Links wo statisch eingebunden
- `impressum.html` — §5 DDG / §18 MStV Angaben
- `datenschutz.html` — Verantwortlicher
- `index.html` — JSON-LD Schema.org `HomeAndConstructionBusiness`

## Bilder & Galerie austauschen

- Bilder unter `images/` ablegen (benannte Pfade beibehalten oder konsistent ändern).
- Hero (Startseite): interaktives Haus. Bilder `images/hero/hero-haus-desktop.jpg` und `hero-haus-mobile.jpg`. Klickbare Räume stehen als Polygone in `images/hero/zones-desktop.json` und `zones-mobile.json` (`label`, `href`, `points` in Bildkoordinaten). `js/hero.js` liest sie ein. Wird ein Hero-Bild neu erzeugt, müssen die Zonen neu bestimmt werden. Link-Ziele der Räume nur in den JSON-Dateien ändern (die `.svg`-Dateien sind eine Referenzkopie, die Seite nutzt sie nicht).
- Hero-Hintergrund: `--color-hero-bg` in `css/tokens.css` ist an den Bildrand angeglichen (#282420). Bei neuen Bildern Randfarbe prüfen.
- Inhaberbild im Hero: `images/hero/inhaber.png` (freigestellt, transparent, KI-Karikatur). Position/Größe in `css/pages.css` (`.hero-house__owner`).
- Hero- und Leistungsbilder: Pfade in den jeweiligen `leistungen/*.html` anpassen. `<picture>`/`srcset`, `width`/`height`, `alt` setzen.
- Galerie: Vorher-Nachher-Vergleiche in `js/gallery-data.js` pflegen. Zusätzliche Nachher-Fotos (JPG, PNG oder WebP) in `images/leistungen/<gewerk>/galerie/` ablegen. Danach auf dem Mac im Projektordner `node scripts/build-gallery.mjs` ausführen. Das Skript erstellt die Fotoliste und komprimierte Vorschauen. Bei der Veröffentlichung die aktualisierte Fotoliste, Vorschauen und Fotos mitnehmen.
- Inhaberfoto (Seite „Über uns“): `images/ueber-uns/robert-palumbo.*`, Pfad in `js/config.js` und `ueber-uns.html`.
- Logo: `images/logo/` (hell/dunkel Varianten prüfen).

## Aktuelle [PLATZHALTER]

- Impressum: Handwerkskammer (Name/Anschrift) — `credentials.md` leer
- Impressum: Eintragung Handwerksrolle (Nummer) — fehlt
- Betriebshaftpflicht — nicht angegeben (nur aufnehmen, falls gewünscht)
- Inhaberfoto — `credentials.md`: tbd
- Leistungsdetails „nur falls zutreffend“ (Großformate/Mosaik/Naturstein, Außenbereich/Balkon/Terrasse bei Fliesen) — nicht als Fakt übernommen
- Balkon: Leistungstext, Stichpunkte und FAQ in `leistungen/balkon.html` sind `[PLATZHALTER]`, Bilder unter `images/leistungen/balkon/` fehlen
- Hero: `images/hero/inhaber.png` muss im Ordner liegen
- Lokale WOFF2-Schriftdateien — in `fonts/` ablegen (siehe `fonts/README.txt`)
- Bilder/Vorher-Nachher — Platzhalterpfade

## Sicherheit/Compliance (kurz)

- Keine Analytics, keine Tracking-Skripte, keine Drittanbieter-CDNs, keine eingebetteten Karten.
- `RESEND_API_KEY` nur serverseitig (Vercel Env). `credentials.md` und `.env*` gitignored.
- CSP und Security-Header in `vercel.json` (ohne externe Quellen).
