document.documentElement.classList.add('js');

const heroSlides = [...document.querySelectorAll('[data-hero-slide]')];
const heroToggle = document.querySelector('[data-hero-toggle]');
const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const facts = document.querySelector('[data-count-up]');
if (facts && 'IntersectionObserver' in window && !reducedMotion.matches) {
  const counters = [...facts.querySelectorAll('[data-count-to]')].map((node) => ({
    node,
    target: Number(node.dataset.countTo),
  }));
  const duration = 1200;
  let frame;
  const finish = () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    counters.forEach(({ node, target }) => { node.textContent = String(target); });
    reducedMotion.removeEventListener('change', onMotionChange);
  };
  const onMotionChange = (event) => {
    if (event.matches) finish();
  };
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    const start = performance.now();
    counters.forEach(({ node }) => { node.textContent = '0'; });
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      counters.forEach(({ node, target }) => {
        node.textContent = String(Math.floor(target * eased));
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
  });
  reducedMotion.addEventListener('change', onMotionChange);
  observer.observe(facts);
}

// Add data-reveal to a section's inner content or to individual cards. Avoid nesting reveal targets.
// Only prepare content below the first viewport (or hidden cards that may be expanded later).
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const targets = [...document.querySelectorAll(
    '[data-reveal], main > section:not(.hero):not(.page-hero) > .container, .gallery-nav, .gallery-section-header, .gallery .tile'
  )].filter((node) => !node.querySelector('[data-reveal], .gallery-root'));
  const pending = new Set(targets.filter((node) => {
    const rect = node.getBoundingClientRect();
    return rect.height === 0 || rect.top >= window.innerHeight;
  }));
  const reveal = (node, animate = true) => {
    if (!pending.delete(node)) return;
    observer.unobserve(node);
    if (animate) node.classList.add('is-visible');
    else node.classList.remove('scroll-reveal');
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.boundingClientRect.height > 0) reveal(entry.target);
    }
  });
  for (const node of pending) {
    node.classList.add('scroll-reveal');
    observer.observe(node);
  }
  document.addEventListener('focusin', (event) => {
    const node = event.target.closest('.scroll-reveal');
    if (node) reveal(node, false);
  });
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) pending.forEach((node) => reveal(node, false));
  });
  // Show the restored viewport without rearming elements that have already appeared.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    pending.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.height > 0 && rect.top < window.innerHeight) reveal(node, false);
    });
  });
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
