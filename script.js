/* stripey sunday — minimal interactions
 * - Render photo grid from data/photos.json (Sveltia CMS–managed)
 * - Condense nav on scroll
 * - Reveal grid items on enter
 * - Year stamp
 * - Hero image loaded class
 * - Smooth in-page anchor scroll
 */
(() => {
  'use strict';

  const nav = document.querySelector('[data-nav]');
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero__image');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ─── Hero loaded state ───────────────────────────────────────────
  if (hero && heroImg) {
    if (heroImg.tagName === 'VIDEO') {
      if (heroImg.readyState >= 2) {
        hero.classList.add('is-loaded');
      } else {
        heroImg.addEventListener(
          'loadeddata',
          () => hero.classList.add('is-loaded'),
          { once: true }
        );
      }
    } else if (heroImg.complete && heroImg.naturalWidth > 0) {
      hero.classList.add('is-loaded');
    } else {
      heroImg.addEventListener(
        'load',
        () => hero.classList.add('is-loaded'),
        { once: true }
      );
    }
  }

  // ─── Render photo grid from data/photos.json ────────────────────
  const renderPhotos = (items) => {
    const grid = document.getElementById('grid');
    if (!grid || !Array.isArray(items)) return;

    const frag = document.createDocumentFragment();
    items.forEach((photo) => {
      const figure = document.createElement('figure');
      figure.className = photo.featured
        ? 'grid__item grid__item--feature'
        : 'grid__item';
      figure.setAttribute('data-reveal', '');
      figure.innerHTML = `
        <img src="${photo.src}" alt="${photo.name} — ${photo.meta}" loading="lazy" />
        <figcaption>
          <span class="cap-name">${photo.name}</span>
          <span class="cap-meta">${photo.meta}</span>
        </figcaption>
      `;
      frag.appendChild(figure);
    });
    grid.appendChild(frag);

    // Now that items exist, observe them for reveal animation
    observeReveals();
  };

  // ─── Reveal on scroll ────────────────────────────────────────────
  let revealObserver = null;
  const observeReveals = () => {
    if (!('IntersectionObserver' in window)) return;
    if (revealObserver) {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        revealObserver.observe(el);
      });
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.transitionDelay = `${(i % 4) * 70}ms`;
            el.classList.add('is-in');
            revealObserver.unobserve(el);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
  };

  // Fallback for browsers without IntersectionObserver: show everything
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  }

  // ─── Fetch photos data ───────────────────────────────────────────
  fetch('data/photos.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('photos.json ' + r.status))))
    .then((data) => renderPhotos(data.items || data))
    .catch((err) => {
      console.warn('Could not load photos.json:', err);
    });

  // ─── Nav condense on scroll ──────────────────────────────────────
  const condense = () => {
    if (!nav) return;
    if (window.scrollY > 80) nav.classList.add('is-condensed');
    else nav.classList.remove('is-condensed');
  };
  condense();
  window.addEventListener('scroll', condense, { passive: true });

  // ─── Smooth in-page anchor scroll ────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
