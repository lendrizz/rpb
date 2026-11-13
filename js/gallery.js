// js/gallery.js
import { galleryData } from './gallery-data.js';
import { galleryPhotos } from './gallery-photos.js';
import { initCompareSliders } from './compare-slider.js';

const PAGE_SIZE = 12; // so viele Nachher-Bilder werden zuerst gezeigt, danach "Mehr anzeigen"

const root = document.getElementById('gallery-root');

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function compareHtml(group, item, i) {
  const portrait = item.orientation === 'portrait';
  const [w, h] = portrait ? [720, 1280] : [1200, 675];
  return `
    <div class="compare ${portrait ? 'compare--portrait' : ''}" data-compare aria-label="${esc(group.title)} Vergleich ${i + 1}">
      <div class="compare__before"><img src="${item.before}" alt="${esc(item.altBefore)}" width="${w}" height="${h}" loading="lazy"></div>
      <div class="compare__after"><img src="${item.after}" alt="${esc(item.altAfter)}" width="${w}" height="${h}" loading="lazy"></div>
      <button class="compare__handle" type="button" role="slider" aria-label="Vorher/Nachher Vergleich ${esc(group.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></button>
    </div>`;
}

function photoItemsHtml(groupId, photos, start) {
  return photos.slice(start, start + PAGE_SIZE).map((p, i) => `
    <li class="gallery-grid__item">
      <button type="button" class="gallery-grid__button" data-group="${groupId}" data-index="${start + i}" aria-label="Bild vergrößern: ${esc(p.alt)}">
        <img src="${esc(p.thumbnail)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy">
      </button>
    </li>`).join('');
}

function photosHtml(group, photos) {
  if (!photos.length) return '';
  const more = photos.length > PAGE_SIZE
    ? `<button type="button" class="btn btn--outline gallery-more" data-more="${group.id}">Mehr anzeigen</button>`
    : '';
  return `
    <h3 class="gallery-subtitle">Weitere Ergebnisse</h3>
    <ul class="gallery-grid" data-grid="${group.id}">${photoItemsHtml(group.id, photos, 0)}</ul>
    ${more}`;
}

// ---------- Lightbox (natives <dialog>: Esc, Fokusfalle, Hintergrund inklusive) ----------
function createLightbox() {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Bildansicht');
  dialog.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Schließen">&times;</button>
    <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Vorheriges Bild">&#8249;</button>
    <figure class="lightbox__figure">
      <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Nächstes Bild">&#8250;</button>`;
  document.body.appendChild(dialog);

  const img = new Image();
  img.className = 'lightbox__img';
  const caption = dialog.querySelector('.lightbox__caption');
  let list = [];
  let current = 0;

  function show(index) {
    current = (index + list.length) % list.length;
    const p = list[current];
    img.src = p.src;
    img.alt = p.alt;
    if (!img.parentNode) caption.before(img);
    caption.textContent = `${current + 1} / ${list.length}`;
  }

  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lightbox__nav--next').addEventListener('click', () => show(current + 1));

  // Klick auf den Hintergrund schließt
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Wischen am Handy
  let startX = null;
  dialog.addEventListener('pointerdown', (e) => { startX = e.pointerType === 'touch' ? e.clientX : null; });
  dialog.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  return {
    open(photos, index, opener) {
      list = photos;
      show(index);
      dialog.showModal();
      dialog.addEventListener('close', () => opener && opener.focus(), { once: true });
    }
  };
}

if (root) {
  root.innerHTML = galleryData.map((group) => {
    const photos = galleryPhotos[group.id] || [];
    return `
    <section class="gallery-section" id="${group.id}">
      <h2>${esc(group.title)}</h2>
      ${group.items.map((item, i) => compareHtml(group, item, i)).join('')}
      ${photosHtml(group, photos)}
    </section>`;
  }).join('');
  initCompareSliders(root);

  const lightbox = createLightbox();

  root.addEventListener('click', (e) => {
    const more = e.target.closest('[data-more]');
    if (more) {
      const groupId = more.dataset.more;
      const grid = root.querySelector(`[data-grid="${groupId}"]`);
      const photos = galleryPhotos[groupId];
      const start = grid.children.length;
      grid.insertAdjacentHTML('beforeend', photoItemsHtml(groupId, photos, start));
      if (grid.children.length >= photos.length) more.remove();
      return;
    }
    const btn = e.target.closest('.gallery-grid__button');
    if (btn) {
      const photos = galleryPhotos[btn.dataset.group] || [];
      lightbox.open(photos, Number(btn.dataset.index), btn);
    }
  });
}
