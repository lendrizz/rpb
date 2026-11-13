// js/main.js
// Navigation: mobiles Menü, Dropdown "Leistungen", aktuelle Seite markieren.

function normalizePath(p) {
  return p.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
}

export function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const desktop = window.matchMedia('(min-width: 900px)');
  const canHover = window.matchMedia('(hover: hover)');

  // Aktuelle Seite markieren (ohne Anker-Links wie "Anfrage")
  const here = normalizePath(window.location.pathname);
  nav.querySelectorAll('a:not(.btn)').forEach((a) => {
    if (a.hash || normalizePath(a.pathname) !== here) return;
    a.setAttribute('aria-current', 'page');
    const parent = a.closest('.has-submenu');
    if (parent) parent.querySelector('.submenu-toggle')?.setAttribute('aria-current', 'true');
  });

  // Dropdown "Leistungen"
  const items = Array.from(nav.querySelectorAll('.has-submenu'));
  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  items.forEach((item) => {
    const btn = item.querySelector('.submenu-toggle');
    let timer = null;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Am Desktop mit Maus hält ein Klick das per Hover geöffnete Menü offen.
      if (desktop.matches && canHover.matches) setOpen(item, true);
      else setOpen(item, !item.classList.contains('is-open'));
    });

    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !desktop.matches) return;
      clearTimeout(timer);
      setOpen(item, true);
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse' || !desktop.matches) return;
      timer = setTimeout(() => setOpen(item, false), 150);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        setOpen(item, false);
        btn.focus();
      }
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) setOpen(item, false);
    });
  });

  document.addEventListener('click', (e) => {
    items.forEach((item) => {
      if (!item.contains(e.target)) setOpen(item, false);
    });
  });

  // Mobiles Menü
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
      items.forEach((item) => setOpen(item, false));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();

  const hint = document.querySelector('.hero-map__hint');
  if (!hint) return;

  const house = hint.parentElement;
  const dismiss = () => {
    hint.remove();
    house.removeEventListener('pointerenter', handlePointer);
    house.removeEventListener('focusin', handleFocus);
  };
  const handlePointer = (event) => {
    if (event.pointerType === 'mouse') dismiss();
  };
  const handleFocus = (event) => {
    if (event.target !== hint) dismiss();
  };

  hint.hidden = false;
  house.addEventListener('pointerenter', handlePointer);
  house.addEventListener('focusin', handleFocus);
  hint.addEventListener('click', (event) => {
    dismiss();
    if (event.detail === 0) house.querySelector('.hero-map__zones a')?.focus();
  });
});
