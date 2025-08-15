const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const prevButton = document.querySelector('.carousel-btn.prev');
const nextButton = document.querySelector('.carousel-btn.next');
const dots = document.querySelectorAll('.dot');

let currentIndex = 0;
let startX = 0;
let endX = 0;
let autoScrollInterval;

function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  dots.forEach((dot, i) => {
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


prevButton.addEventListener('click', goToPrev);
nextButton.addEventListener('click', goToNext);


dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    currentIndex = i;
    updateCarousel();
  });
});


track.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

track.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;
  let diff = startX - endX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      goToNext();
    } else {
      goToPrev();
    }
  }
});


function startAutoScroll() {
  autoScrollInterval = setInterval(goToNext, 4000);
}

function stopAutoScroll() {
  clearInterval(autoScrollInterval);
}

track.addEventListener('mouseenter', stopAutoScroll);
track.addEventListener('mouseleave', startAutoScroll);
track.addEventListener('touchstart', stopAutoScroll);
track.addEventListener('touchend', startAutoScroll);

startAutoScroll();
