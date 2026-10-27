import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

// Exercise the browser-facing event contract without adding a DOM dependency.
// Native dialog rendering, Escape handling and responsive appearance still need browser QA.
const source = await readFile(new URL('../src/scripts/nature-gallery.js', import.meta.url), 'utf8');

function fixture({ reducedMotion = false, dialogs = true } = {}) {
  const document = { activeElement: null };
  class Element extends EventTarget {
    dataset = {};
    hidden = false;
    textContent = '';
    focus() { document.activeElement = this; }
    closest(selector) {
      if (selector === 'button' && this.button) return this;
      if (selector === '[hidden]' && this.parent?.hidden) return this.parent;
      if (selector === '.nature-card') return this.card || null;
      return null;
    }
    getBoundingClientRect() { return { top: 1100, bottom: 1300 }; }
    setPointerCapture() {}
  }
  class Dialog extends Element {
    open = false;
    showModal() { this.open = true; }
    close() { this.open = false; this.dispatchEvent(new Event('close')); }
  }
  const properties = new Map([['overflow', ['auto', 'important']]]);
  document.documentElement = { style: {
    getPropertyValue: (name) => properties.get(name)?.[0] || '',
    getPropertyPriority: (name) => properties.get(name)?.[1] || '',
    setProperty: (name, value, priority = '') => properties.set(name, [value, priority]),
    removeProperty: (name) => properties.delete(name),
  } };
  const dialog = new Dialog();
  const stage = new Element();
  const figure = new Element();
  const image = new Element();
  const caption = new Element();
  const count = new Element();
  const status = new Element();
  const error = new Element();
  error.hidden = true;
  const file = new Element();
  file.parent = error;
  const [close, previous, next] = Array.from({ length: 3 }, () => Object.assign(new Element(), { button: true }));
  const cards = Array.from({ length: 3 }, () => new Element());
  const links = cards.map((card, index) => Object.assign(new Element(), {
    card, href: `https://example.test/photo-${index}.webp`,
    dataset: { caption: `Kadr ${index + 1}`, alt: `Opis zdjęcia ${index + 1}` },
  }));
  const selectors = new Map([
    ['[data-nature-dialog]', dialog], ['[data-nature-stage]', stage],
    ['[data-nature-image]', image], ['[data-nature-caption]', caption],
    ['[data-nature-count]', count], ['[data-nature-status]', status],
    ['[data-nature-error]', error], ['[data-nature-file]', file],
    ['[data-nature-close]', close], ['[data-nature-prev]', previous], ['[data-nature-next]', next],
  ]);
  stage.querySelector = () => figure;
  dialog.querySelectorAll = () => [close, previous, next, file];
  Element.prototype.querySelector = (selector) => selectors.get(selector);
  Element.prototype.querySelectorAll = (selector) => selector === '.nature-card' ? cards : links;
  const reduced = Object.assign(new EventTarget(), { matches: reducedMotion });
  let observer;
  class Observer {
    observed = new Set();
    constructor(callback) { this.callback = callback; observer = this; }
    observe(card) { this.observed.add(card); }
    unobserve(card) { this.observed.delete(card); }
    disconnect() { this.observed.clear(); }
  }
  const registry = new Map();
  const window = Object.assign(new EventTarget(), { IntersectionObserver: Observer });
  if (dialogs) window.HTMLDialogElement = Dialog;
  vm.runInNewContext(source, {
    HTMLElement: Element, HTMLDialogElement: Dialog, document, window,
    IntersectionObserver: Observer, innerHeight: 900, performance, AbortController,
    matchMedia: () => reduced,
    customElements: { get: (name) => registry.get(name), define: (name, value) => registry.set(name, value) },
  });
  const gallery = new (registry.get('nature-gallery'))();
  gallery.connectedCallback();
  const emit = (target, type, properties = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, properties);
    target.dispatchEvent(event);
    return event;
  };
  const click = (target, properties = {}) => emit(target, 'click', { button: 0, ...properties });
  return { gallery, links, cards, dialog, stage, figure, image, caption, count, error, file, close, previous, next, document, reduced, observer, emit, click, properties };
}

test('lightbox opens the selected photo and wraps navigation within Okolica', () => {
  const f = fixture();
  assert.equal(f.click(f.links[2]).defaultPrevented, true);
  assert.equal(f.dialog.open, true);
  assert.equal(f.image.src, f.links[2].href);
  assert.equal(f.image.alt, 'Opis zdjęcia 3');
  assert.equal(f.caption.textContent, 'Kadr 3');
  f.click(f.next);
  assert.equal(f.count.textContent, '1 / 3');
  f.emit(f.dialog, 'keydown', { key: 'ArrowLeft' });
  assert.equal(f.count.textContent, '3 / 3');
});

test('Tab wraps in both directions; closing restores focus and prior overflow', () => {
  const f = fixture();
  f.click(f.links[1]);
  assert.equal(f.document.activeElement, f.close);
  assert.equal(f.properties.get('overflow')[0], 'hidden');
  f.emit(f.dialog, 'keydown', { key: 'Tab', shiftKey: true });
  assert.equal(f.document.activeElement, f.next);
  f.emit(f.dialog, 'keydown', { key: 'Tab' });
  assert.equal(f.document.activeElement, f.close);
  f.click(f.close);
  assert.equal(f.document.activeElement, f.links[1]);
  assert.deepEqual(f.properties.get('overflow'), ['auto', 'important']);
});

test('a background click closes; clicking the image does not', () => {
  const f = fixture();
  f.click(f.links[0]);
  f.emit(f.dialog, 'pointerdown');
  f.click(f.dialog);
  assert.equal(f.dialog.open, false);
  f.click(f.links[0]);
  f.click(f.image);
  assert.equal(f.dialog.open, true);
});

test('horizontal swipes navigate; vertical gestures and pinch gestures do not', () => {
  const f = fixture();
  f.click(f.links[0]);
  const down = (properties = {}) => f.emit(f.stage, 'pointerdown', { pointerType: 'touch', isPrimary: true, pointerId: 1, clientX: 200, clientY: 200, ...properties });
  down();
  f.emit(f.stage, 'pointerup', { pointerId: 1, clientX: 100, clientY: 205 });
  assert.equal(f.count.textContent, '2 / 3');
  down();
  f.emit(f.stage, 'pointerup', { pointerId: 1, clientX: 180, clientY: 350 });
  assert.equal(f.count.textContent, '2 / 3');
  down();
  down({ isPrimary: false, pointerId: 2 });
  f.emit(f.stage, 'pointerup', { pointerId: 1, clientX: 100, clientY: 200 });
  assert.equal(f.count.textContent, '2 / 3');
});

test('letterboxing around a contained portrait behaves as background', () => {
  const f = fixture();
  f.image.naturalWidth = 600;
  f.image.naturalHeight = 1200;
  f.image.getBoundingClientRect = () => ({ left: 100, top: 100, width: 1200, height: 600 });
  const tap = (x) => {
    for (const type of ['pointerdown', 'click']) {
      const event = new Event(type);
      Object.defineProperty(event, 'target', { value: f.image });
      Object.assign(event, { clientX: x, clientY: 300 });
      f.dialog.dispatchEvent(event);
    }
  };
  f.click(f.links[0]);
  tap(600);
  assert.equal(f.dialog.open, true);
  tap(200);
  assert.equal(f.dialog.open, false);
});

test('off-screen reveals respect reduced motion and expose focused cards immediately', () => {
  const f = fixture();
  assert.equal(f.cards[0].dataset.reveal, 'pending');
  const focus = new Event('focusin');
  Object.defineProperty(focus, 'target', { value: f.links[0] });
  f.gallery.dispatchEvent(focus);
  assert.equal(f.cards[0].dataset.reveal, undefined);
  f.observer.callback([{ target: f.cards[1], isIntersecting: true }]);
  assert.equal(f.cards[1].dataset.reveal, 'visible');
  f.reduced.matches = true;
  f.emit(f.reduced, 'change');
  assert.ok(f.cards.every((card) => !card.dataset.reveal));
  assert.equal(f.observer.observed.size, 0);
  assert.ok(fixture({ reducedMotion: true }).cards.every((card) => !card.dataset.reveal));
});

test('modified clicks and browsers without native dialogs keep normal image links', () => {
  const f = fixture();
  assert.equal(f.click(f.links[0], { ctrlKey: true }).defaultPrevented, false);
  assert.equal(f.dialog.open, false);
  const fallback = fixture({ dialogs: false });
  assert.equal(fallback.click(fallback.links[0]).defaultPrevented, false);
});

test('load failures offer a file link; disconnecting cleans up and reconnecting works', () => {
  const f = fixture();
  f.click(f.links[0]);
  f.emit(f.image, 'error');
  assert.equal(f.error.hidden, false);
  assert.equal(f.file.href, f.links[0].href);
  f.click(f.next);
  assert.equal(f.error.hidden, true);
  f.gallery.disconnectedCallback();
  assert.equal(f.dialog.open, false);
  assert.deepEqual(f.properties.get('overflow'), ['auto', 'important']);
  f.gallery.connectedCallback();
  f.click(f.links[0]);
  f.click(f.next);
  assert.equal(f.count.textContent, '2 / 3');
});
