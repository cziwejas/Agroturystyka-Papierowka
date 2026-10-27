class NatureGallery extends HTMLElement {
  connectedCallback() {
    if (this.cleanup) return;
    const controller = new AbortController();
    const on = (target, type, handler) => target.addEventListener(type, handler, { signal: controller.signal });
    const cards = [...this.querySelectorAll('.nature-card')];
    const links = [...this.querySelectorAll('[data-nature-open]')];
    const dialog = this.querySelector('[data-nature-dialog]');
    const stage = this.querySelector('[data-nature-stage]');
    const image = this.querySelector('[data-nature-image]');
    const caption = this.querySelector('[data-nature-caption]');
    const count = this.querySelector('[data-nature-count]');
    const status = this.querySelector('[data-nature-status]');
    const error = this.querySelector('[data-nature-error]');
    const file = this.querySelector('[data-nature-file]');
    const close = this.querySelector('[data-nature-close]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let current = 0;
    let returnFocus;
    let swipe;
    let backdropStart = false;
    let savedOverflow;

    const reveal = (card, animate = true) => {
      if (animate && !reduced.matches) card.dataset.reveal = 'visible';
      else delete card.dataset.reveal;
      observer?.unobserve(card);
    };
    const prepare = () => {
      observer?.disconnect();
      cards.forEach((card) => {
        delete card.dataset.reveal;
        if (observer && !reduced.matches && card.getBoundingClientRect().top >= innerHeight) {
          card.dataset.reveal = 'pending';
          observer.observe(card);
        }
      });
    };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) reveal(entry.target);
        });
      }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });
    }
    prepare();
    on(reduced, 'change', prepare);
    on(window, 'pageshow', (event) => { if (event.persisted) prepare(); });
    on(this, 'focusin', (event) => {
      const card = event.target.closest('.nature-card');
      if (card) reveal(card, false);
    });

    const unlock = () => {
      if (!savedOverflow) return;
      const rootStyle = document.documentElement.style;
      if (savedOverflow.value) rootStyle.setProperty('overflow', savedOverflow.value, savedOverflow.priority);
      else rootStyle.removeProperty('overflow');
      savedOverflow = undefined;
    };
    this.cleanup = () => {
      if (dialog.open) dialog.close();
      unlock();
      observer?.disconnect();
      controller.abort();
      cards.forEach((card) => delete card.dataset.reveal);
      this.cleanup = undefined;
    };
    // The links continue to open their image files when native dialogs are unavailable.
    if (!('HTMLDialogElement' in window) || !(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== 'function') return;

    const show = (index) => {
      current = (index + links.length) % links.length;
      const selected = links[current];
      error.hidden = true;
      image.alt = selected.dataset.alt;
      image.src = selected.href;
      file.href = selected.href;
      caption.textContent = selected.dataset.caption;
      count.textContent = `${current + 1} / ${links.length}`;
      status.textContent = `Zdjęcie ${current + 1} z ${links.length}. ${selected.dataset.caption}`;
    };
    const open = (index) => {
      returnFocus = links[index];
      show(index);
      const rootStyle = document.documentElement.style;
      savedOverflow = { value: rootStyle.getPropertyValue('overflow'), priority: rootStyle.getPropertyPriority('overflow') };
      rootStyle.setProperty('overflow', 'hidden');
      dialog.showModal();
      close.focus({ preventScroll: true });
    };
    links.forEach((link, index) => on(link, 'click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(index);
    }));
    on(close, 'click', () => dialog.close());
    on(this.querySelector('[data-nature-prev]'), 'click', () => show(current - 1));
    on(this.querySelector('[data-nature-next]'), 'click', () => show(current + 1));
    on(dialog, 'close', () => {
      swipe = undefined;
      unlock();
      returnFocus?.focus({ preventScroll: true });
    });
    on(image, 'error', () => { error.hidden = false; });
    on(dialog, 'keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
      if (event.key === 'Tab') {
        const controls = [...dialog.querySelectorAll('button, a[href]')].filter((node) => !node.closest('[hidden]'));
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      // Escape uses the dialog's native cancel behavior, including its close event.
    });

    const isBackground = (event) => {
      const target = event.target;
      if (target === dialog || target === stage || target === stage.querySelector('figure')) return true;
      if (target !== image || !image.naturalWidth || !image.naturalHeight) return false;
      // object-fit: contain leaves clickable background inside the image element's box.
      const rect = image.getBoundingClientRect();
      const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const left = rect.left + (rect.width - width) / 2;
      const top = rect.top + (rect.height - height) / 2;
      return event.clientX < left || event.clientX > left + width || event.clientY < top || event.clientY > top + height;
    };
    on(dialog, 'pointerdown', (event) => { backdropStart = isBackground(event); });
    on(dialog, 'click', (event) => {
      if (backdropStart && isBackground(event)) dialog.close();
      backdropStart = false;
    });
    on(stage, 'pointerdown', (event) => {
      if (event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button')) {
        swipe = undefined;
        return;
      }
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
      stage.setPointerCapture(event.pointerId);
    });
    on(stage, 'pointercancel', () => { swipe = undefined; });
    on(stage, 'pointerup', (event) => {
      if (!swipe || event.pointerId !== swipe.id) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      const duration = performance.now() - swipe.time;
      swipe = undefined;
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3 && duration < 800) {
        backdropStart = false;
        show(current + (dx < 0 ? 1 : -1));
      }
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

if (!customElements.get('nature-gallery')) customElements.define('nature-gallery', NatureGallery);
