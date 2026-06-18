function showSlide(block, index) {
  const slides = block.querySelectorAll('.hero-banner-slide');
  if (!slides.length) return;
  let target = index;
  if (target < 0) target = slides.length - 1;
  if (target >= slides.length) target = 0;
  block.dataset.activeSlide = target;

  slides.forEach((slide, i) => {
    slide.setAttribute('aria-hidden', i !== target);
    slide.querySelectorAll('a').forEach((link) => {
      if (i !== target) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  const dots = block.querySelectorAll('.hero-banner-dot');
  dots.forEach((dot, i) => {
    dot.setAttribute('aria-current', i === target ? 'true' : 'false');
  });

  const track = block.querySelector('.hero-banner-track');
  track.scrollTo({ left: slides[target].offsetLeft, behavior: 'smooth' });
}

export default function decorate(block) {
  // Group child rows into slides. Each slide = an image row followed by a content row.
  const rows = [...block.children];
  const slides = [];
  let current = null;
  rows.forEach((row) => {
    if (row.querySelector('picture')) {
      current = { image: row.querySelector('picture'), content: null };
      slides.push(current);
    } else if (current && !current.content) {
      current.content = row;
    } else {
      current = { image: null, content: row };
      slides.push(current);
    }
  });

  const track = document.createElement('div');
  track.className = 'hero-banner-track';

  slides.forEach((data, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-banner-slide';
    slide.dataset.slideIndex = i;

    if (data.image) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'hero-banner-image';
      imageWrap.append(data.image);
      slide.append(imageWrap);
    } else {
      slide.classList.add('no-image');
    }

    const content = document.createElement('div');
    content.className = 'hero-banner-content';
    if (data.content) {
      [...data.content.children].forEach((child) => content.append(child));
    }
    slide.append(content);
    track.append(slide);
  });

  block.textContent = '';
  block.append(track);

  if (slides.length <= 1) {
    if (slides.length && !slides[0].image) block.classList.add('no-image');
    block.dataset.activeSlide = 0;
    return;
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const nav = document.createElement('div');
  nav.className = 'hero-banner-dots';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Hero slides');
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-banner-dot';
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    dot.addEventListener('click', () => showSlide(block, i));
    nav.append(dot);
  });
  block.append(nav);

  showSlide(block, 0);
}
