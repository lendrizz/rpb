import { galleryData } from './gallery-data.js';
import { initCompareSliders } from './compare-slider.js';

const root = document.getElementById('gallery-root');
if (root) {
  root.innerHTML = galleryData.map(group => `
    <section class="gallery-section" id="${group.id}">
      <h2>${group.title}</h2>
      ${group.items.map((item, i) => `
        <div class="compare" data-compare aria-label="${group.title} Vergleich ${i + 1}">
          <div class="compare__before"><img src="${item.before}" alt="${item.altBefore}" width="1200" height="675" loading="lazy"></div>
          <div class="compare__after"><img src="${item.after}" alt="${item.altAfter}" width="1200" height="675" loading="lazy"></div>
          <button class="compare__handle" type="button" role="slider" aria-label="Vorher/Nachher Vergleich ${group.title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></button>
        </div>
      `).join('')}
    </section>
  `).join('');
  initCompareSliders(root);
}
