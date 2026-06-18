export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.querySelector('picture')) {
        col.classList.add('columns-dark-image');
      } else {
        col.classList.add('columns-dark-body');
      }
    });
  });
}
