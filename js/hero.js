// js/hero.js
// Interaktiver Hero: Haus im Querschnitt mit klickbaren Räumen (je Leistung).
// Zonen kommen aus /images/hero/zones-desktop.json bzw. zones-mobile.json.
// Bei Hover/Fokus/Tipp wird die Zone markiert und eine Leitlinie führt diagonal
// aus dem Haus heraus, wird dann horizontal und unterstreicht den Namen des Gewerks.
// Ohne JS bleiben die Chip-Links unter dem Bild als Fallback nutzbar.

const SVG_NS = 'http://www.w3.org/2000/svg';
const root = document.querySelector('[data-hero-house]');

// Richtung der Leitlinie je Zone: side -1 = nach links, 1 = nach rechts; v -1 = nach oben, 1 = nach unten.
const LEADER_RULES = {
  trockenbau: { side: -1, v: -1 },
  badsanierung: { side: -1, v: -1 },
  fliesenlegen: { side: -1, v: 1 },
  maler: { side: 1, v: -1 },
  balkon: { side: 1, v: -1 },
  sanierung: { side: 1, v: 1 }
};

const LEADER_MARGIN = 28;   // Abstand (Bildpunkte) hinter dem Hausrand bis zum Knick
const TAG_MAX_WIDTH = 240;  // maximale Breite eines Namens in px
const HIDE_DELAY = 140;     // ms, damit der Name vom Zeiger erreichbar bleibt

function polygonCentroid(pts) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const f = x0 * y1 - x1 * y0;
    area += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-6) return { x: pts[0][0], y: pts[0][1] };
  return { x: cx / (6 * area), y: cy / (6 * area) };
}

function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Ankerpunkt: Flächenschwerpunkt, bei konkaven Zonen der nächste Punkt innerhalb der Zone.
function findAnchor(pts) {
  const c = polygonCentroid(pts);
  if (pointInPolygon(c.x, c.y, pts)) return c;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  let best = { x: pts[0][0], y: pts[0][1] };
  let bestDist = Infinity;
  for (let y = Math.min(...ys); y <= Math.max(...ys); y += 12) {
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 12) {
      if (!pointInPolygon(x, y, pts)) continue;
      const d = (x - c.x) ** 2 + (y - c.y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = { x, y };
      }
    }
  }
  return best;
}

// Läuft vom Anker diagonal (45°) nach außen, bis die Linie das Haus verlassen hat.
function computeLeader(key, polys, width, height) {
  const rule = LEADER_RULES[key];
  if (!rule || !polys[key]) return null;
  const anchor = findAnchor(polys[key]);
  const all = Object.values(polys);
  const STEP = 4;
  const NEED = 10; // aufeinanderfolgende Schritte außerhalb, damit schmale Fugen zwischen Zonen nicht zählen
  let outside = 0;
  let exitT = 0;
  for (let t = 0; t < Math.max(width, height); t += STEP) {
    const x = anchor.x + rule.side * t;
    const y = anchor.y + rule.v * t;
    if (!all.some((p) => pointInPolygon(x, y, p))) {
      outside += 1;
      if (outside >= NEED) {
        exitT = t - (NEED - 1) * STEP;
        break;
      }
    } else {
      outside = 0;
    }
  }
  const tE = exitT + LEADER_MARGIN;
  return {
    side: rule.side,
    anchor,
    elbow: { x: anchor.x + rule.side * tE, y: anchor.y + rule.v * tE }
  };
}

if (root) {
  const media = window.matchMedia('(min-width: 768px)');
  const cache = {};
  const chips = Array.from(document.querySelectorAll('[data-hero-chip]'));
  const owner = root.querySelector('[data-hero-owner]');
  const label = root.querySelector('[data-hero-label]');

  let svg = null;
  let zoneEls = {};
  let zoneData = {};
  let tags = {};
  let leaders = {};
  let activeKey = null;
  let lastPointerType = 'mouse';
  let clearTimer = null;

  async function loadZones(variant) {
    if (!cache[variant]) {
      const res = await fetch(`/images/hero/zones-${variant}.json`);
      if (!res.ok) throw new Error('Zonen konnten nicht geladen werden');
      cache[variant] = await res.json();
    }
    return cache[variant];
  }

  // Beschriftung der Inhaber-Figur (unverändert: Label über der Figur)
  function showOwnerLabel(visible) {
    if (!label) return;
    if (!visible || !owner) {
      label.classList.remove('is-visible');
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const r = owner.getBoundingClientRect();
    label.textContent = 'Über uns →';
    label.classList.add('is-visible');
    const half = label.offsetWidth / 2 + 8;
    const x = Math.max(half, Math.min(rootRect.width - half, r.left - rootRect.left + r.width / 2));
    label.style.left = `${x}px`;
    label.style.top = `${r.top - rootRect.top - 16}px`;
  }

  // Leitlinie + Name: Position und Länge hängen von der aktuellen Darstellungsgröße ab.
  function layoutLeader(key) {
    const tag = tags[key];
    const lead = leaders[key];
    const z = zoneData[key];
    if (!svg || !tag || !lead || !z || !z.leader) return;

    const rootRect = root.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const scale = svgRect.width / zoneData.__w;
    const { anchor, elbow, side } = z.leader;
    const ex = svgRect.left - rootRect.left + elbow.x * scale;
    const ey = svgRect.top - rootRect.top + elbow.y * scale;

    // Verfügbarer Platz bis zum Bildschirmrand, danach bricht der Name um.
    const viewportX = rootRect.left + ex;
    const room = side < 0 ? viewportX - 8 : window.innerWidth - viewportX - 8;
    tag.style.maxWidth = `${Math.max(60, Math.min(room, TAG_MAX_WIDTH))}px`;
    tag.style.left = '0px';
    const run = tag.offsetWidth;

    tag.style.left = `${side < 0 ? ex - run : ex}px`;
    tag.style.top = `${ey - 5}px`;
    tag.classList.toggle('hero-tag--left', side < 0);

    const endX = elbow.x + (side * run) / scale;
    const d = `M ${anchor.x} ${anchor.y} L ${elbow.x} ${elbow.y} L ${endX} ${elbow.y}`;
    lead.casing.setAttribute('d', d);
    lead.path.setAttribute('d', d);
    lead.dot.setAttribute('cx', anchor.x);
    lead.dot.setAttribute('cy', anchor.y);
    lead.dot.setAttribute('r', 5 / scale);
  }

  function setActive(key) {
    clearTimeout(clearTimer);
    activeKey = key;
    if (svg) svg.classList.toggle('has-active', Boolean(key));
    Object.entries(zoneEls).forEach(([k, el]) => el.classList.toggle('is-active', k === key));
    Object.entries(tags).forEach(([k, el]) => el.classList.toggle('is-visible', k === key));
    chips.forEach((chip) => chip.classList.toggle('is-active', chip.dataset.heroChip === key));
    if (owner) owner.classList.toggle('is-active', key === 'owner');
    if (key && tags[key]) layoutLeader(key);
    showOwnerLabel(key === 'owner');
  }

  function scheduleClear() {
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => setActive(null), HIDE_DELAY);
  }

  // Tippen auf Touch: erster Tipp markiert, zweiter Tipp öffnet die Seite.
  function handleActivate(event, key) {
    if (lastPointerType !== 'mouse' && activeKey !== key) {
      event.preventDefault();
      setActive(key);
    }
  }

  function buildSvg(data) {
    if (svg) svg.remove();
    root.querySelectorAll('.hero-tag').forEach((el) => el.remove());
    zoneEls = {};
    zoneData = { __w: data.width, __h: data.height };
    tags = {};
    leaders = {};

    svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${data.width} ${data.height}`);
    svg.setAttribute('class', 'hero-zones');
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Interaktives Haus: Wähle einen Raum, um zur passenden Leistung zu kommen');

    const polys = {};
    Object.entries(data.zones).forEach(([key, zone]) => {
      zoneData[key] = zone;
      polys[key] = zone.points;
    });

    Object.entries(data.zones).forEach(([key, zone]) => {
      const a = document.createElementNS(SVG_NS, 'a');
      a.setAttribute('href', zone.href);
      a.setAttribute('class', `zone zone--${key}`);
      a.setAttribute('aria-label', zone.label);

      const poly = document.createElementNS(SVG_NS, 'polygon');
      poly.setAttribute('points', zone.points.map((p) => p.join(',')).join(' '));
      a.appendChild(poly);

      // Leitlinie (Pfad + Punkt), Geometrie wird beim Aktivieren gesetzt
      zone.leader = computeLeader(key, polys, data.width, data.height);
      if (zone.leader) {
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'hero-leader');
        const casing = document.createElementNS(SVG_NS, 'path');
        casing.setAttribute('class', 'hero-leader__casing');
        const path = document.createElementNS(SVG_NS, 'path');
        const dot = document.createElementNS(SVG_NS, 'circle');
        g.appendChild(casing);
        g.appendChild(path);
        g.appendChild(dot);
        a.appendChild(g);
        leaders[key] = { casing, path, dot };

        const tag = document.createElement('a');
        tag.className = 'hero-tag';
        tag.href = zone.href;
        tag.textContent = zone.label;
        tag.tabIndex = -1;
        tag.setAttribute('aria-hidden', 'true');
        tag.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive(key); });
        tag.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleClear(); });
        tag.addEventListener('pointerdown', (e) => { lastPointerType = e.pointerType || 'mouse'; });
        root.appendChild(tag);
        tags[key] = tag;
      }

      a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive(key); });
      a.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleClear(); });
      a.addEventListener('focus', () => setActive(key));
      a.addEventListener('blur', () => setActive(null));
      a.addEventListener('click', (e) => handleActivate(e, key));

      svg.appendChild(a);
      zoneEls[key] = a;
    });

    const pic = root.querySelector('picture');
    pic.insertAdjacentElement('afterend', svg);
  }

  async function build() {
    const variant = media.matches ? 'desktop' : 'mobile';
    try {
      const data = await loadZones(variant);
      buildSvg(data);
      setActive(null);
    } catch (err) {
      // Fallback: Chip-Links bleiben nutzbar.
      console.warn(err);
    }
  }

  // Inhaber-Ebene (klickbar zu "Über uns")
  if (owner) {
    owner.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive('owner'); });
    owner.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleClear(); });
    owner.addEventListener('focus', () => setActive('owner'));
    owner.addEventListener('blur', () => setActive(null));
    owner.addEventListener('click', (e) => handleActivate(e, 'owner'));
  }

  // Chips unter dem Bild spiegeln die Zonen
  chips.forEach((chip) => {
    const key = chip.dataset.heroChip;
    chip.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive(key); });
    chip.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleClear(); });
    chip.addEventListener('focus', () => setActive(key));
    chip.addEventListener('blur', () => setActive(null));
  });

  root.addEventListener('pointerdown', (e) => { lastPointerType = e.pointerType || 'mouse'; }, true);

  // Tippen neben ein Element hebt die Markierung auf
  document.addEventListener('pointerdown', (e) => {
    if (!activeKey) return;
    if (e.target.closest && (e.target.closest('.zone') || e.target.closest('.hero-tag') || e.target.closest('[data-hero-owner]'))) return;
    setActive(null);
  });

  window.addEventListener('resize', () => {
    if (!activeKey) return;
    if (activeKey === 'owner') showOwnerLabel(true);
    else layoutLeader(activeKey);
  });
  media.addEventListener('change', build);
  build();
}
