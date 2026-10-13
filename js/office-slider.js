/**
 * MS Digital NET Plus — Office Slider & Lightbox
 * Coverflow-style slider on desktop, touch-swipe on mobile, fullscreen accessible lightbox.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var section = document.getElementById('office');
    var track = document.getElementById('office-slider-track');
    var container = document.querySelector('.office-slider-container');
    if (!section || !track || !container) return;

    var slides = track.querySelectorAll('.office-slide');
    var dots = container.querySelectorAll('.office-slider-dot');
    var prevBtn = container.querySelector('.office-slider-arrow--prev');
    var nextBtn = container.querySelector('.office-slider-arrow--next');
    var totalSlides = slides.length;
    var currentIndex = 0;

    var prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var autoplayInterval = 4500;
    var autoplayTimer = null;
    var isSectionVisible = false;
    var isPaused = false;

    // Lightbox elements
    var lightbox = document.getElementById('office-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    var lightboxBackdrop = lightbox ? lightbox.querySelector('.lightbox-backdrop') : null;
    var lastFocusedSlide = null;

    var slideData = [
      {
        src: 'assets/Images/office-executive-1280w.webp',
        alt: 'Our Executive Office',
        caption: 'Our Executive Office'
      },
      {
        src: 'assets/Images/office-teamwork-1280w.webp',
        alt: 'Teamwork in Action',
        caption: 'Teamwork in Action'
      },
      {
        src: 'assets/Images/office-modern-1280w.webp',
        alt: 'Hard at Work, Every Day',
        caption: 'Hard at Work, Every Day'
      }
    ];

    function updateSlides(index) {
      currentIndex = (index + totalSlides) % totalSlides;

      for (var i = 0; i < totalSlides; i++) {
        var slide = slides[i];
        slide.classList.remove('active', 'prev', 'next');

        if (i === currentIndex) {
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else if (i === (currentIndex - 1 + totalSlides) % totalSlides) {
          slide.classList.add('prev');
          slide.setAttribute('aria-hidden', 'true');
        } else if (i === (currentIndex + 1) % totalSlides) {
          slide.classList.add('next');
          slide.setAttribute('aria-hidden', 'true');
        } else {
          slide.setAttribute('aria-hidden', 'true');
        }
      }

      // Update dots
      for (var d = 0; d < dots.length; d++) {
        if (d === currentIndex) {
          dots[d].classList.add('active');
          dots[d].setAttribute('aria-selected', 'true');
        } else {
          dots[d].classList.remove('active');
          dots[d].setAttribute('aria-selected', 'false');
        }
      }
    }

    function goToSlide(index) {
      updateSlides(index);
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Autoplay logic
    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      if (isSectionVisible && !isPaused) {
        autoplayTimer = setInterval(nextSlide, autoplayInterval);
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Visibility Observer for Autoplay (Runs only while section is visible in viewport)
    if ('IntersectionObserver' in window) {
      var visibilityObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isSectionVisible = entry.isIntersecting;
            if (isSectionVisible) {
              startAutoplay();
            } else {
              stopAutoplay();
            }
          });
        },
        { threshold: 0.25 }
      );
      visibilityObserver.observe(section);
    } else {
      isSectionVisible = true;
      startAutoplay();
    }

    // Pause on hover, focus, touch
    container.addEventListener('mouseenter', function () {
      isPaused = true;
      stopAutoplay();
    });

    container.addEventListener('mouseleave', function () {
      isPaused = false;
      startAutoplay();
    });

    container.addEventListener('focusin', function () {
      isPaused = true;
      stopAutoplay();
    });

    container.addEventListener('focusout', function () {
      isPaused = false;
      startAutoplay();
    });

    // Arrow Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        startAutoplay();
      });
    }

    // Dot Buttons
    for (var b = 0; b < dots.length; b++) {
      dots[b].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          startAutoplay();
        }
      });
    }

    // Keyboard Navigation (Arrow keys on slides and container)
    container.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        startAutoplay();
      }
    });

    // Touch Swipe Support (Mobile)
    var touchStartX = 0;
    var touchStartY = 0;
    var touchEndX = 0;
    var touchEndY = 0;
    var isSwiping = false;

    track.addEventListener(
      'touchstart',
      function (e) {
        isPaused = true;
        stopAutoplay();
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isSwiping = true;
        }
      },
      { passive: true }
    );

    track.addEventListener(
      'touchmove',
      function (e) {
        if (!isSwiping || e.touches.length !== 1) return;
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      function () {
        if (!isSwiping) return;
        isSwiping = false;
        var diffX = touchEndX - touchStartX;
        var diffY = touchEndY - touchStartY;
        // Only trigger if horizontal swipe is greater than vertical movement
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
        isPaused = false;
        startAutoplay();
      },
      { passive: true }
    );

    // Lightbox Functionality
    function openLightbox(index) {
      if (!lightbox || !lightboxImg || !lightboxCaption) return;
      var data = slideData[index];
      if (!data) return;

      lastFocusedSlide = document.activeElement;
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
      lightboxCaption.textContent = data.caption;

      lightbox.removeAttribute('hidden');
      lightbox.classList.add('active');
      document.body.classList.add('no-scroll');

      stopAutoplay();

      if (lightboxClose) {
        lightboxClose.focus();
      }
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('active');
      lightbox.setAttribute('hidden', '');
      document.body.classList.remove('no-scroll');

      startAutoplay();

      if (lastFocusedSlide && lastFocusedSlide.focus) {
        lastFocusedSlide.focus();
      }
    }

    // Open lightbox on slide click / Enter / Space
    for (var s = 0; s < slides.length; s++) {
      (function (slide) {
        slide.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          if (!isNaN(idx)) {
            if (idx === currentIndex) {
              openLightbox(idx);
            } else {
              goToSlide(idx);
              startAutoplay();
            }
          }
        });

        slide.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var idx = parseInt(this.getAttribute('data-index'), 10);
            if (!isNaN(idx)) {
              openLightbox(idx);
            }
          }
        });
      })(slides[s]);
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    // Focus Trap in Lightbox
    if (lightbox) {
      lightbox.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var focusable = lightbox.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }

    // Initialize
    updateSlides(0);
  });
})();
