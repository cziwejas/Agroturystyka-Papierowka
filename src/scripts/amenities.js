class AmenitiesList extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const button = this.querySelector('button');
    if (!button) return;
    const label = button.querySelector('span');
    const mobile = matchMedia('(max-width: 650px)');
    let expanded = false;
    const update = () => {
      const showAll = !mobile.matches || expanded;
      this.dataset.expanded = String(showAll);
      button.setAttribute('aria-expanded', String(showAll));
      label.textContent = expanded ? 'Zwiń listę udogodnień' : 'Pokaż więcej udogodnień';
    };
    button.hidden = false;
    button.addEventListener('click', () => {
      expanded = !expanded;
      update();
      if (!expanded && button.getBoundingClientRect().top < 0) {
        button.scrollIntoView({ block: 'end', behavior: 'instant' });
      }
    });
    mobile.addEventListener('change', update);
    update();
  }
}
customElements.define('amenities-list', AmenitiesList);
