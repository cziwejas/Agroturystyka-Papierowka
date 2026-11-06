class ReviewsSlider extends HTMLElement {
  connectedCallback() {
    if (this.cleanup) return;
    const controller = new AbortController();
    const on = (node, type, handler, options = {}) => node.addEventListener(type, handler, { ...options, signal: controller.signal });
    const track = this.querySelector('.track');
    const cards = [...track.querySelectorAll('.review-card')];
    const previous = this.querySelector('[data-prev]');
    const next = this.querySelector('[data-next]');
    const dots = [...this.querySelectorAll('[data-review-dot]')];
    const controls = this.querySelector('.controls');
    const status = this.querySelector('[data-review-status]');
    const dialog = this.querySelector('.review-dialog');
    const more = [...this.querySelectorAll('[data-review-more]')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    const hasDialog = typeof dialog.showModal === 'function';
    let positions = [0];
    let current = 0;
    let target = 0;
    let frame;
    let settling;
    let lastWheel = -Infinity;
    let returnFocus;

    const announce = () => {
      const label = `Pozycja ${current + 1} z ${positions.length} na liście opinii.`;
      if (status.textContent !== label) status.textContent = label;
    };
    const paint = () => {
      current = positions.reduce((closest, left, index) => Math.abs(left - track.scrollLeft) < Math.abs(positions[closest] - track.scrollLeft) ? index : closest, 0);
      previous.disabled = current === 0;
      next.disabled = current === positions.length - 1;
      dots.forEach((dot, index) => {
        if (index === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };
    const settle = () => {
      paint();
      target = current;
      announce();
    };
    const measure = () => {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const origin = cards[0]?.offsetLeft || 0;
      positions = [];
      for (const card of cards) {
        const left = Math.min(max, Math.max(0, card.offsetLeft - origin));
        if (!positions.length || left - positions.at(-1) > 1) positions.push(left);
      }
      if (!positions.length) positions = [0];
      if (hasDialog) more.forEach((button, index) => {
        const text = cards[index].querySelector('[data-review-text]');
        button.hidden = text.scrollHeight <= text.clientHeight + 1;
      });
      controls.hidden = positions.length < 2;
      dots.forEach((dot, index) => { dot.hidden = index >= positions.length; });
      paint();
      target = current;
      if (dots.some((dot) => dot.hidden && dot === document.activeElement)) dots[current].focus({ preventScroll: true });
    };
    const go = (index) => {
      target = Math.max(0, Math.min(index, positions.length - 1));
      track.scrollTo({ left: positions[target], behavior: reduced.matches ? 'instant' : 'smooth' });
    };
    on(previous, 'click', () => go(target - 1));
    on(next, 'click', () => go(target + 1));
    dots.forEach((dot, index) => on(dot, 'click', () => go(index)));
    on(track, 'keydown', (event) => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? positions.length - 1 : target + (event.key === 'ArrowRight' ? 1 : -1));
    });
    on(track, 'scroll', () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = undefined; paint(); });
      clearTimeout(settling);
      settling = setTimeout(settle, 180);
    }, { passive: true });
    on(track, 'scrollend', settle);
    // Horizontal trackpad gestures and touch scrolling stay native. Let the page
    // continue scrolling at either end, and preserve Ctrl+wheel browser zoom.
    on(track, 'wheel', (event) => {
      if (!mouse.matches || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const direction = Math.sign(event.deltaY);
      if (!direction || (direction < 0 && target === 0) || (direction > 0 && target === positions.length - 1)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheel < 250) return;
      lastWheel = now;
      go(target + direction);
    }, { passive: false });

    if (hasDialog) {
      track.dataset.clamped = '';
      more.forEach((button, index) => on(button, 'click', () => {
        const card = cards[index];
        this.querySelector('[data-review-full-text]').textContent = card.querySelector('[data-review-text]').textContent;
        this.querySelector('[data-review-full-author]').textContent = card.querySelector('[data-review-author]').textContent;
        this.querySelector('[data-review-full-date]').textContent = card.querySelector('[data-review-date]').textContent;
        this.querySelector('[data-review-full-rating]').textContent = card.querySelector('.review-rating').getAttribute('aria-label');
        returnFocus = button;
        dialog.showModal();
        this.querySelector('[data-review-close]').focus();
      }));
      on(this.querySelector('[data-review-close]'), 'click', () => dialog.close());
      on(dialog, 'close', () => returnFocus?.focus({ preventScroll: true }));
      on(dialog, 'click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      });
    }

    measure();
    const resize = 'ResizeObserver' in window ? new ResizeObserver(measure) : undefined;
    resize?.observe(track);
    if (!resize) on(window, 'resize', measure);
    document.fonts?.ready.then(() => { if (this.isConnected) measure(); });
    this.cleanup = () => {
      if (dialog.open) dialog.close();
      controller.abort();
      resize?.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(settling);
      controls.hidden = true;
      delete track.dataset.clamped;
      more.forEach((button) => { button.hidden = true; });
      this.cleanup = undefined;
    };
  }
  disconnectedCallback() { this.cleanup?.(); }
}
if (!customElements.get('reviews-slider')) customElements.define('reviews-slider', ReviewsSlider);
