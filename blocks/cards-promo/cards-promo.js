export default function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('cards-promo-card');
    [...card.children].forEach((col) => {
      if (col.querySelector('picture')) {
        col.classList.add('cards-promo-image');
      } else {
        col.classList.add('cards-promo-body');
      }
    });
  });
}
