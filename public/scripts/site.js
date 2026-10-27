document.documentElement.classList.add('js');

const heroSlides = [...document.querySelectorAll('[data-hero-slide]')];
const heroToggle = document.querySelector('[data-hero-toggle]');
const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Leave the first viewport and no-JavaScript content visible immediately.
// Observe content rather than section backgrounds, so scrolling never exposes gaps.
if ('IntersectionObserver' in window) {
  const targets = [...document.querySelectorAll(
    'main > section:not(.hero):not(.page-hero) > .container, .gallery-nav, .gallery-section-header, .gallery .tile'
  )].filter((node) => !node.querySelector('.gallery-root'));
  const reveal = (node) => {
    node.classList.add('is-visible');
    observer.unobserve(node);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) reveal(entry.target);
    });
  }, { rootMargin: '0px 0px -32px 0px', threshold: 0 });
  const prepare = () => {
    observer.disconnect();
    targets.forEach((node) => {
      node.classList.remove('scroll-reveal', 'is-visible');
      if (!reducedMotion.matches && node.getBoundingClientRect().top >= window.innerHeight) {
        node.classList.add('scroll-reveal');
        observer.observe(node);
      }
    });
  };
  document.addEventListener('focusin', (event) => {
    const pending = event.target.closest('.scroll-reveal');
    if (pending) reveal(pending);
  });
  reducedMotion.addEventListener('change', prepare);
  // Restored history entries should show their saved viewport without replaying it.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) prepare();
  });
  prepare();
}

if (heroSlides.length > 1 && heroToggle) {
  let currentSlide = 0;
  let timer;
  let paused = reducedMotion.matches;
  const setSlide = (index) => {
    heroSlides[currentSlide].classList.remove('is-active');
    currentSlide = index % heroSlides.length;
    heroSlides[currentSlide].classList.add('is-active');
    heroDots.forEach((dot, position) => {
      if (position === currentSlide) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!paused && !document.hidden) timer = window.setInterval(() => setSlide(currentSlide + 1), 7000);
  };
  const updateButton = () => {
    heroToggle.setAttribute('aria-pressed', String(paused));
    heroToggle.setAttribute('aria-label', paused ? 'Wznów zmianę zdjęć' : 'Zatrzymaj zmianę zdjęć');
  };
  heroToggle.addEventListener('click', () => {
    paused = !paused;
    updateButton();
    start();
  });
  heroDots.forEach((dot, position) => dot.addEventListener('click', () => {
    setSlide(position);
    start();
  }));
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) paused = true;
    updateButton();
    start();
  });
  updateButton();
  start();
}

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('.sr-only').textContent = expanded ? 'Otwórz menu' : 'Zamknij menu';
    nav.dataset.open = String(!expanded);
  });
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.dataset.open === 'true') {
      nav.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.sr-only').textContent = 'Otwórz menu';
      toggle.focus();
    }
  });
}

document.querySelectorAll('.email[data-user][data-host]').forEach((node) => {
  const user = node.dataset.user;
  const host = node.dataset.host;
  if (!user || !host || user.startsWith('[[') || host.startsWith('[[')) return;
  const address = `${user}@${host}`;
  const link = document.createElement('a');
  link.href = `mailto:${address}`;
  link.textContent = address;
  link.className = 'contact-link';
  node.replaceChildren(link);
});

const dialog = document.querySelector('#lightbox');
if (dialog instanceof HTMLDialogElement) {
  const items = [...document.querySelectorAll('[data-lightbox]')];
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const close = dialog.querySelector('[data-close]');
  const previous = dialog.querySelector('[data-previous]');
  const next = dialog.querySelector('[data-next]');
  let index = 0;
  let returnFocus;

  const show = (position) => {
    index = (position + items.length) % items.length;
    const selected = items[index];
    image.src = selected.href;
    image.alt = selected.dataset.alt || '';
    caption.textContent = selected.dataset.caption || '';
  };
  const open = (position) => {
    returnFocus = document.activeElement;
    show(position);
    dialog.showModal();
    close.focus();
  };
  items.forEach((item, position) => item.addEventListener('click', (event) => {
    event.preventDefault();
    open(position);
  }));
  close.addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}
