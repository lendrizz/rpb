// js/consent.js
const KEY = 'rp-bau-consent';

export function getConsent() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export function setConsent(value) {
  const data = { necessary: true, updated: new Date().toISOString(), ...value };
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

function hideBanner() {
  const b = document.getElementById('cookie-banner');
  if (b) b.classList.remove('is-visible');
}

function initBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return; // only on index
  if (!getConsent()) banner.classList.add('is-visible');
  banner.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-consent]');
    if (!btn) return;
    setConsent({ necessary: true, all: btn.dataset.consent === 'all' });
    hideBanner();
  });
}

function initSettings() {
  const form = document.getElementById('consent-settings');
  if (!form) return;
  const status = document.getElementById('consent-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    setConsent({ necessary: true, all: fd.get('level') === 'all' });
    if (status) status.textContent = 'Einstellungen gespeichert.';
  });
  const current = getConsent();
  if (current?.all) {
    const all = form.querySelector('input[value="all"]');
    if (all) all.checked = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initBanner();
  initSettings();
});
