export default function decorate(block) {
  // Each slide is authored as a pair of rows: an image cell followed by a text
  // cell. Group consecutive pairs into slides so the block can rotate them.
  const rows = [...block.children];
  block.textContent = '';

  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'hero-banner-slides';

  const slides = [];
  for (let i = 0; i < rows.length; i += 2) {
    const slide = document.createElement('div');
    slide.className = 'hero-banner-slide';
    const imageRow = rows[i];
    const textRow = rows[i + 1];
    if (imageRow) slide.append(imageRow);
    if (textRow) slide.append(textRow);
    if (!slide.querySelector(':scope > div:first-child picture')) {
      slide.classList.add('no-image');
    }
    slidesWrapper.append(slide);
    slides.push(slide);
  }
  block.append(slidesWrapper);

  // Single slide: render statically, no carousel controls.
  if (slides.length < 2) {
    slides.forEach((s) => s.classList.add('active'));
    return;
  }

  const nav = document.createElement('div');
  nav.className = 'hero-banner-dots';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Choose a slide to display');

  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-banner-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    nav.append(dot);
    return dot;
  });

  let current = 0;
  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => {
      const selected = i === current;
      dot.classList.toggle('active', selected);
      dot.setAttribute('aria-selected', selected ? 'true' : 'false');
      dot.setAttribute('tabindex', selected ? '0' : '-1');
    });
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

  block.append(nav);
  showSlide(0);

  // Auto-advance, pausing while the pointer is over the banner.
  let timer = window.setInterval(() => showSlide(current + 1), 6000);
  block.addEventListener('mouseenter', () => window.clearInterval(timer));
  block.addEventListener('mouseleave', () => {
    timer = window.setInterval(() => showSlide(current + 1), 6000);
  });
}
