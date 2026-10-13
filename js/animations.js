/**
 * MS Digital NET Plus — Scroll Animations
 * Scroll reveal, counter animation, speedometer gauge activation.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ================================================================
       1. SCROLL REVEAL
       ================================================================ */
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if (prefersReducedMotion) {
      /* Immediately activate every element */
      for (var i = 0; i < revealEls.length; i++) {
        revealEls[i].classList.add('active');
      }
    } else if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          for (var j = 0; j < entries.length; j++) {
            if (entries[j].isIntersecting) {
              entries[j].target.classList.add('active');
              observer.unobserve(entries[j].target);
            }
          }
        },
        { threshold: 0.15 }
      );

      for (var k = 0; k < revealEls.length; k++) {
        revealObserver.observe(revealEls[k]);
      }
    } else {
      /* Fallback: show everything */
      for (var m = 0; m < revealEls.length; m++) {
        revealEls[m].classList.add('active');
      }
    }

    /* ================================================================
       2. COUNTER ANIMATION
       ================================================================ */
    var statNumbers = document.querySelectorAll('.stat-number[data-target]');

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounter(el) {
      var isPlaceholder = el.getAttribute('data-placeholder') === 'true';
      if (isPlaceholder) {
        el.textContent = '--';
        return;
      }

      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) {
        el.textContent = '--';
        return;
      }

      var suffix = el.getAttribute('data-suffix') || '';

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      var duration = 2000; // ms
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var value = Math.round(easeOutExpo(progress) * target);
        el.textContent = value + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    if (statNumbers.length > 0) {
      if (prefersReducedMotion) {
        for (var s = 0; s < statNumbers.length; s++) {
          animateCounter(statNumbers[s]);
        }
      } else if ('IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(
          function (entries, observer) {
            for (var idx = 0; idx < entries.length; idx++) {
              if (entries[idx].isIntersecting) {
                /* Find all .stat-number children inside this stat-item */
                var statItem = entries[idx].target;
                var nums = statItem.querySelectorAll('.stat-number[data-target]');
                for (var n = 0; n < nums.length; n++) {
                  animateCounter(nums[n]);
                }
                observer.unobserve(statItem);
              }
            }
          },
          { threshold: 0.3 }
        );

        /* Observe the parent .stat-item of each counter */
        var observed = [];
        for (var q = 0; q < statNumbers.length; q++) {
          var parent = statNumbers[q].closest('.stat-item');
          if (!parent) parent = statNumbers[q];
          if (observed.indexOf(parent) === -1) {
            observed.push(parent);
            counterObserver.observe(parent);
          }
        }
      } else {
        for (var f = 0; f < statNumbers.length; f++) {
          animateCounter(statNumbers[f]);
        }
      }
    }

    /* ================================================================
       3. SPEEDOMETER / GAUGE ANIMATION
       ================================================================ */
    var speedometers = document.querySelectorAll('.speedometer-arc');

    if (speedometers.length > 0 && 'IntersectionObserver' in window) {
      var gaugeObserver = new IntersectionObserver(
        function (entries, observer) {
          for (var g = 0; g < entries.length; g++) {
            if (entries[g].isIntersecting) {
              entries[g].target.classList.add('animated');
              entries[g].target.removeAttribute('data-not-animated');
              observer.unobserve(entries[g].target);
            }
          }
        },
        { threshold: 0.1 }
      );

      for (var h = 0; h < speedometers.length; h++) {
        gaugeObserver.observe(speedometers[h]);
      }
    } else {
      /* Fallback: activate all immediately */
      for (var r = 0; r < speedometers.length; r++) {
        speedometers[r].classList.add('animated');
      }
    }
  });
})();
