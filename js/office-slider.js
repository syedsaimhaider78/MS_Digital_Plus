/**
 * MS Digital NET Plus — Office Slider & Lightbox
 * Coverflow-style slider on desktop (>= 1024px), horizontal scroll-snap track on mobile (< 1024px),
 * fullscreen accessible lightbox.
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

    function isDesktop() {
      return window.innerWidth >= 1024;
    }

    function updateDots(index) {
      for (var d = 0; d < dots.length; d++) {
        var isCurrent = d === index;
        dots[d].classList.toggle('active', isCurrent);
        dots[d].setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      }
    }

    function updateSlides(index, opts) {
      opts = opts || {};
      currentIndex = (index + totalSlides) % totalSlides;
      updateDots(currentIndex);

      if (isDesktop()) {
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
      } else {
        // Mobile scroll-snap track
        for (var m = 0; m < totalSlides; m++) {
          var s = slides[m];
          s.classList.remove('prev', 'next');
          var isCur = m === currentIndex;
          s.classList.toggle('active', isCur);
          s.setAttribute('aria-hidden', isCur ? 'false' : 'true');
        }

        if (opts.scroll) {
          var targetSlide = slides[currentIndex];
          if (targetSlide) {
            var trackPad = (track.clientWidth - targetSlide.offsetWidth) / 2;
            var targetLeft = targetSlide.offsetLeft - trackPad;
            track.scrollTo({
              left: Math.max(0, targetLeft),
              behavior: (prefersReducedMotion || opts.instant) ? 'auto' : 'smooth'
            });
          }
        }
      }
    }

    function goToSlide(index, opts) {
      var options = opts || { scroll: true };
      updateSlides(index, options);
    }

    function nextSlide() {
      goToSlide(currentIndex + 1, { scroll: true });
    }

    function prevSlide() {
      goToSlide(currentIndex - 1, { scroll: true });
    }

    // Mobile scroll listener to update dots on swipe/scroll
    var scrollRafId = null;
    track.addEventListener(
      'scroll',
      function () {
        if (isDesktop()) return;
        if (scrollRafId) return;

        scrollRafId = requestAnimationFrame(function () {
          scrollRafId = null;
          var trackCenter = track.scrollLeft + track.clientWidth / 2;
          var closest = 0;
          var minDist = Infinity;

          for (var i = 0; i < totalSlides; i++) {
            var s = slides[i];
            var sCenter = s.offsetLeft + s.offsetWidth / 2;
            var dist = Math.abs(sCenter - trackCenter);
            if (dist < minDist) {
              minDist = dist;
              closest = i;
            }
          }

          if (closest !== currentIndex) {
            currentIndex = closest;
            for (var j = 0; j < totalSlides; j++) {
              var isCur = j === currentIndex;
              slides[j].classList.toggle('active', isCur);
              slides[j].setAttribute('aria-hidden', isCur ? 'false' : 'true');
            }
            updateDots(currentIndex);
          }
        });
      },
      { passive: true }
    );

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

    // Visibility Observer for Autoplay
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

    track.addEventListener(
      'touchstart',
      function () {
        isPaused = true;
        stopAutoplay();
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      function () {
        isPaused = false;
        startAutoplay();
      },
      { passive: true }
    );

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
          goToSlide(idx, { scroll: true });
          startAutoplay();
        }
      });
    }

    // Keyboard Navigation
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
            if (isDesktop()) {
              if (idx === currentIndex) {
                openLightbox(idx);
              } else {
                goToSlide(idx);
                startAutoplay();
              }
            } else {
              // On mobile, if this slide is already active, open lightbox; otherwise center it
              if (idx === currentIndex) {
                openLightbox(idx);
              } else {
                goToSlide(idx, { scroll: true });
                startAutoplay();
              }
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

    // ResizeObserver / Resize Handling
    var wasDesktop = isDesktop();
    function handleResize() {
      var nowDesktop = isDesktop();
      if (nowDesktop !== wasDesktop) {
        wasDesktop = nowDesktop;
        if (nowDesktop) {
          track.scrollLeft = 0;
          updateSlides(currentIndex);
        } else {
          updateSlides(currentIndex, { scroll: true, instant: true });
        }
      } else if (!nowDesktop) {
        // Keep current slide centered on mobile resize
        updateSlides(currentIndex, { scroll: true, instant: true });
      }
    }

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        handleResize();
      });
      ro.observe(container);
    } else {
      window.addEventListener('resize', handleResize, { passive: true });
    }

    // Initialize at slide 1 (index 0)
    updateSlides(0, { scroll: true, instant: true });
  });
})();
