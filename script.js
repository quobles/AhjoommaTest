function initCarousel(carouselElement, auto = true) {
  let track = carouselElement.querySelector('.carousel-track');
  let slides = track ? Array.from(track.children) : [];
  let prevButton = carouselElement.querySelector('.carousel-btn.prev');
  let nextButton = carouselElement.querySelector('.carousel-btn.next');
  let dots = carouselElement.querySelectorAll('.dot');

  let currentIndex = 0;
  let autoScrollInterval;

  function updateCarousel() {
    if (!track) return;
    track.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function goToPrev() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  }
  function goToNext() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }

  if (prevButton) prevButton.addEventListener('click', goToPrev);
  if (nextButton) nextButton.addEventListener('click', goToNext);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentIndex = i;
      updateCarousel();
    });
  });

  // Auto scroll
  function startAutoScroll() {
    if (auto) {
      stopAutoScroll();
      autoScrollInterval = setInterval(goToNext, 4000);
    }
  }
  function stopAutoScroll() { clearInterval(autoScrollInterval); }

  carouselElement.addEventListener('mouseenter', stopAutoScroll);
  carouselElement.addEventListener('mouseleave', startAutoScroll);

  updateCarousel();
  startAutoScroll();
}

function initProductSlideshow() {
  let productCards = document.querySelectorAll('.product-card');
  let productDots = document.querySelectorAll('.product-dots .dot');
  let currentProductIndex = 0;

  function updateProductSlideshow() {
    productCards.forEach((card, i) => card.classList.toggle('active', i === currentProductIndex));
    productDots.forEach((dot, i) => dot.classList.toggle('active', i === currentProductIndex));
  }

  productDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentProductIndex = i;
      updateProductSlideshow();
    });
  });

  setInterval(() => {
    currentProductIndex = (currentProductIndex + 1) % productCards.length;
    updateProductSlideshow();
  }, 4000);

  updateProductSlideshow();
}

document.addEventListener('DOMContentLoaded', () => {
  initCarousel(document.querySelector('.main-carousel'), true);     // main hero
  initCarousel(document.querySelector('.featured-carousel'), true); // featured
  initProductSlideshow();                                           // product cards
});
