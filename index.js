document.addEventListener("DOMContentLoaded", function () {
  // Initialize homepage carousels
  var mainCarousel = document.querySelector('.main-carousel');
  var featuredCarousel = document.querySelector('.featured-carousel');

  if (mainCarousel) initCarousel(mainCarousel, true);
  if (featuredCarousel) initCarousel(featuredCarousel, true);

  // Initialize product slideshow
  initProductSlideshow();
});

function initCarousel(carouselElement, auto) {
  if (!carouselElement) return;

  var track = carouselElement.querySelector('.carousel-track');
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var prevButton = carouselElement.querySelector('.carousel-btn.prev');
  var nextButton = carouselElement.querySelector('.carousel-btn.next');
  var dots = carouselElement.querySelectorAll('.dot');

  var currentIndex = 0;
  var autoScrollInterval;
  var startX, endX;

  function updateCarousel() {
    if (!track) return;
    track.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentIndex);
    });
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

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      currentIndex = i;
      updateCarousel();
    });
  });

  if (track) {
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', function (e) {
      endX = e.changedTouches[0].clientX;
      var diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) goToNext();
        else goToPrev();
      }
    });
  }

  function startAutoScroll() {
    if (auto) {
      stopAutoScroll();
      autoScrollInterval = setInterval(goToNext, 4000);
    }
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  carouselElement.addEventListener('mouseenter', stopAutoScroll);
  carouselElement.addEventListener('mouseleave', startAutoScroll);

  updateCarousel();
  startAutoScroll();
}

function initProductSlideshow() {
  var productCards = document.querySelectorAll('.product-card');
  var productDots = document.querySelectorAll('.product-dots .dot');
  var currentProductIndex = 0;

  if (productCards.length === 0 || productDots.length === 0) return;

  function updateProductSlideshow() {
    productCards.forEach(function (card, i) {
      card.classList.toggle('active', i === currentProductIndex);
    });
    productDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentProductIndex);
    });
  }

  productDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      currentProductIndex = i;
      updateProductSlideshow();
    });
  });

  setInterval(function () {
    currentProductIndex = (currentProductIndex + 1) % productCards.length;
    updateProductSlideshow();
  }, 4000);

  updateProductSlideshow();
}
