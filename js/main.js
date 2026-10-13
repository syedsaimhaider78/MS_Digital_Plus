/**
 * MS Digital NET Plus — Main Application Logic
 * Navigation, scroll effects, map lazy loading, form validation, and utilities.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var CONFIG = window.SITE_CONFIG || {};

    /* ================================================================
       1. DYNAMIC COPYRIGHT YEAR
       ================================================================ */
    var copyrightYearEl = document.getElementById('copyright-year');
    if (copyrightYearEl) {
      copyrightYearEl.textContent = new Date().getFullYear();
    }

    /* ================================================================
       2. MOBILE NAVIGATION
       ================================================================ */
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var navbar = document.getElementById('navbar');

    function closeMobileNav() {
      if (navToggle && navToggle.classList.contains('active')) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    }

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = navToggle.classList.toggle('active');
        navLinks.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close when clicking any nav link
      var links = navLinks.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function () {
          closeMobileNav();
        });
      }

      // Close on escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeMobileNav();
        }
      });

      // Close when clicking outside navbar
      document.addEventListener('click', function (e) {
        if (navbar && !navbar.contains(e.target)) {
          closeMobileNav();
        }
      });
    }

    /* ================================================================
       3. NAVBAR SCROLL EFFECT (INTERSECTION OBSERVER ON SENTINEL)
       ================================================================ */
    var sentinel = document.getElementById('navbar-sentinel');
    if (navbar) {
      if (sentinel && 'IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                navbar.classList.remove('scrolled');
              } else {
                navbar.classList.add('scrolled');
              }
            });
          },
          { threshold: 0 }
        );
        navObserver.observe(sentinel);
      } else {
        // Fallback for browsers without IntersectionObserver
        var fallbackScroll = function () {
          if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        };
        window.addEventListener('scroll', fallbackScroll, { passive: true });
        fallbackScroll();
      }
    }

    /* ================================================================
       3B. ACTIVE SECTION LINK HIGHLIGHTING
       ================================================================ */
    var observedSections = document.querySelectorAll('section[id]');
    var navLinksList = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn-nav-cta)');
    if ('IntersectionObserver' in window && observedSections.length > 0) {
      var sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.getAttribute('id');
              navLinksList.forEach(function (link) {
                if (link.getAttribute('href') === '#' + id) {
                  link.classList.add('active-nav');
                } else {
                  link.classList.remove('active-nav');
                }
              });
            }
          });
        },
        { rootMargin: '-25% 0px -65% 0px' }
      );
      observedSections.forEach(function (sec) {
        sectionObserver.observe(sec);
      });
    }

    /* ================================================================
       4. COVERAGE MAP LAZY LOADING
       ================================================================ */
    var mapIframe = document.querySelector('.coverage-map iframe[data-src]');
    if (mapIframe) {
      var mapDataSrc = mapIframe.getAttribute('data-src');
      if ('IntersectionObserver' in window) {
        var mapObserver = new IntersectionObserver(
          function (entries, observer) {
            for (var m = 0; m < entries.length; m++) {
              if (entries[m].isIntersecting) {
                mapIframe.src = mapDataSrc;
                mapIframe.removeAttribute('data-src');
                observer.unobserve(mapIframe);
                break;
              }
            }
          },
          { rootMargin: '300px 0px' }
        );
        mapObserver.observe(mapIframe);
      } else {
        // Fallback for older browsers
        mapIframe.src = mapDataSrc;
        mapIframe.removeAttribute('data-src');
      }
    }

    /* ================================================================
       5. CONTACT FORM VALIDATION & WHATSAPP REDIRECTION
       ================================================================ */
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
      var nameInput = document.getElementById('contact-name');
      var phoneInput = document.getElementById('contact-phone');
      var messageInput = document.getElementById('contact-message');
      var submitBtn = contactForm.querySelector('.form-submit');

      function clearError(input) {
        if (!input) return;
        input.classList.remove('error');
        var err = input.parentElement.querySelector('.form-error-msg');
        if (err) {
          err.remove();
        }
      }

      function showError(input, message) {
        if (!input) return;
        clearError(input);
        input.classList.add('error');
        var errorEl = document.createElement('span');
        errorEl.className = 'form-error-msg';
        errorEl.textContent = message;
        input.parentElement.appendChild(errorEl);
      }

      // Clear errors on input
      [nameInput, phoneInput, messageInput].forEach(function (inp) {
        if (inp) {
          inp.addEventListener('input', function () {
            clearError(inp);
          });
        }
      });

      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var isValid = true;
        var firstInvalid = null;

        var nameVal = (nameInput ? nameInput.value : '').trim();
        var phoneVal = (phoneInput ? phoneInput.value : '').trim();
        var messageVal = (messageInput ? messageInput.value : '').trim();

        // Validate Name
        if (!nameVal || nameVal.length < 2) {
          showError(nameInput, 'Please enter your name (at least 2 letters).');
          isValid = false;
          if (!firstInvalid) firstInvalid = nameInput;
        } else {
          clearError(nameInput);
        }

        // Validate Phone (Accepts Pakistan format: 03XX-XXXXXXX or general international)
        var phoneDigits = phoneVal.replace(/[\s\-\(\)\+]/g, '');
        if (!phoneVal || phoneDigits.length < 10) {
          showError(phoneInput, 'Please enter a valid phone number (e.g. 0305-4020019).');
          isValid = false;
          if (!firstInvalid) firstInvalid = phoneInput;
        } else {
          clearError(phoneInput);
        }

        // Validate Message
        if (!messageVal || messageVal.length < 5) {
          showError(messageInput, 'Please enter your message (at least 5 characters).');
          isValid = false;
          if (!firstInvalid) firstInvalid = messageInput;
        } else {
          clearError(messageInput);
        }

        if (!isValid) {
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // Construct WhatsApp message
        var waNumber = CONFIG.whatsapp || '923054020019';
        var waMessage =
          'Hello MS Digital NET Plus,\n\n' +
          'Name: ' + nameVal + '\n' +
          'Phone: ' + phoneVal + '\n' +
          'Message: ' + messageVal;

        var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waMessage);

        // Feedback alert
        var alertEl = contactForm.querySelector('.form-feedback-alert');
        if (!alertEl) {
          alertEl = document.createElement('div');
          alertEl.className = 'form-feedback-alert success';
          contactForm.insertBefore(alertEl, contactForm.firstChild);
        }
        alertEl.textContent = 'Thank you, ' + nameVal + '! Opening WhatsApp to connect directly with our support team...';

        // Open WhatsApp in new tab
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        // Reset form
        contactForm.reset();

        // Clear feedback after 8 seconds
        setTimeout(function () {
          if (alertEl && alertEl.parentElement) {
            alertEl.remove();
          }
        }, 8000);
      });
    }
  });
})();
