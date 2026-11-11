// js/compare-slider.js
export function initCompareSliders(root = document) {
  root.querySelectorAll('[data-compare]').forEach(initSlider);
}

function initSlider(el) {
  if (el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const after = el.querySelector('.compare__after');
  const handle = el.querySelector('.compare__handle');
  if (!after || !handle) return;

  let value = 50;
  const setPos = (v) => {
    value = Math.max(0, Math.min(100, v));
    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    handle.style.left = `${value}%`;
    handle.setAttribute('aria-valuenow', String(Math.round(value)));
  };

  const getPercent = (clientX) => {
    const rect = el.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  let dragging = false;
  const onMove = (e) => {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(getPercent(x));
  };
  const stop = () => { dragging = false; };

  handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
  handle.addEventListener('touchstart', (e) => { dragging = true; }, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', stop);
  window.addEventListener('touchend', stop);

  handle.addEventListener('keydown', (e) => {
    let step = 5;
    if (e.key === 'ArrowRight') setPos(value + step);
    else if (e.key === 'ArrowLeft') setPos(value - step);
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
    else return;
    e.preventDefault();
  });

  setPos(50);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initCompareSliders());
} else {
  initCompareSliders();
}
