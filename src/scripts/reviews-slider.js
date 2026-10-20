class ReviewsSlider extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const track = this.querySelector('.track');
    const originals = Array.from(track.querySelectorAll('blockquote'));
    const count = originals.length;
    if (count < 2) return;
    const clone = (slide) => {
      const copy = slide.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      return copy;
    };
    track.prepend(...originals.map(clone));
    track.append(...originals.map(clone));
    const slides = Array.from(track.querySelectorAll('blockquote'));
    const position = this.querySelector('.position');
    this.querySelector('.controls').hidden = false;
    track.dataset.enhanced = '';
    let current = count;
    let target = count;
    let settling;
    const destination = (index) => slides[index].offsetLeft + slides[index].offsetWidth / 2 - track.clientWidth / 2;
    const paint = () => {
      current = slides.reduce((closest, slide, index) =>
        Math.abs(destination(index) - track.scrollLeft) < Math.abs(destination(closest) - track.scrollLeft) ? index : closest, 0);
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === current);
        slide.classList.toggle('is-near', Math.abs(index - current) === 1);
      });
      const label = `${current % count + 1} / ${count}`;
      if (position.textContent !== label) position.textContent = label;
    };
    const settle = () => {
      if (current < count || current >= count * 2) {
        current = count + current % count;
        track.scrollTo({ left: destination(current), behavior: 'instant' });
      }
      target = current;
      paint();
    };
    const go = (index) => {
      target = Math.max(0, Math.min(index, slides.length - 1));
      track.scrollTo({ left: destination(target), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    this.querySelector('[data-prev]').addEventListener('click', () => go(target - 1));
    this.querySelector('[data-next]').addEventListener('click', () => go(target + 1));
    track.addEventListener('scroll', () => {
      paint();
      clearTimeout(settling);
      settling = setTimeout(settle, 180);
    }, { passive: true });
    track.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key === 'Home' ? count : event.key === 'End' ? count * 2 - 1 : target + (event.key === 'ArrowRight' ? 1 : -1));
    });
    this.resizeObserver = new ResizeObserver(() => {
      track.scrollTo({ left: destination(current), behavior: 'instant' });
      paint();
    });
    this.resizeObserver.observe(track);
    track.scrollTo({ left: destination(current), behavior: 'instant' });
    paint();
  }
  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }
}
customElements.define('reviews-slider', ReviewsSlider);
