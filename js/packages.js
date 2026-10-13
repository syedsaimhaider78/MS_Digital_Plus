/**
 * MS Digital NET Plus — Packages Section
 * Renders on-page internet packages, dynamic speedometer gauges, and WhatsApp links.
 * No prices displayed — focuses on speed offerings, GPON fiber, and Static/Dynamic IP customization.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('packages-grid');
    if (!grid) return;

    var PACKAGES = window.PACKAGES || [];
    var CONFIG = window.SITE_CONFIG || {};
    var whatsapp = CONFIG.whatsapp || '923054020019';
    var CIRCUMFERENCE = 2 * Math.PI * 34; // ≈ 213.63

    function calcOffset(speed, maxSpeed) {
      var ratio = Math.min(speed / maxSpeed, 1);
      ratio = Math.max(ratio, 0.12);
      return CIRCUMFERENCE * (1 - ratio);
    }

    function buildWaLink(pkg) {
      var text = encodeURIComponent(
        "Hello MS Digital NET Plus! I am interested in your " +
          pkg.speed +
          " Mbps fiber package. Please share the details, rates, and IP options."
      );
      return "https://wa.me/" + whatsapp + "?text=" + text;
    }

    function getBadgeClass(cat) {
      if (cat === 'super') return 'pkg-plan-badge--super';
      if (cat === 'standard') return 'pkg-plan-badge--standard';
      return 'pkg-plan-badge--starter';
    }

    function renderCards(filterCat) {
      grid.innerHTML = '';

      var filtered = PACKAGES.filter(function (p) {
        if (!filterCat || filterCat === 'all') return true;
        return p.category === filterCat;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--lavender);grid-column:1/-1;">No packages found in this category.</p>';
        return;
      }

      filtered.forEach(function (pkg, index) {
        var card = document.createElement('div');
        card.className = 'pkg-plan-card' + (pkg.popular ? ' popular' : '');
        card.setAttribute('data-category', pkg.category);

        var offset = calcOffset(pkg.speed, 100);
        var badgeText = pkg.popular ? '★ Most Popular' : (pkg.badge || (pkg.category.toUpperCase()));
        var badgeClass = getBadgeClass(pkg.category);

        var isSuper = pkg.category === 'super';
        var features = [
          'True GPON Fiber Connection',
          'Unlimited Ultra-fast Downloads',
          'Dynamic IP (Static IP on demand)',
          '24/7 Dedicated Support',
          'Free Wi-Fi Router Setup'
        ];
        if (isSuper) {
          features.push('Priority Low-Latency Routing');
        }

        var featuresHtml = features
          .map(function (feat) {
            return (
              '<li>' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
              feat +
              '</li>'
            );
          })
          .join('');

        card.innerHTML =
          '<span class="pkg-plan-badge ' + badgeClass + '">' + badgeText + '</span>' +
          '<div class="pkg-speed-gauge-wrap">' +
            '<svg viewBox="0 0 84 84">' +
              '<circle cx="42" cy="42" r="34" fill="none" stroke="rgba(139,92,246,0.15)" stroke-width="5"/>' +
              '<circle cx="42" cy="42" r="34" fill="none" stroke="' + (isSuper ? '#EC4899' : '#8B5CF6') + '" stroke-width="5" ' +
                'stroke-dasharray="' + CIRCUMFERENCE.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '" ' +
                'stroke-linecap="round" transform="rotate(-90 42 42)" class="speedometer-arc"/>' +
            '</svg>' +
          '</div>' +
          '<div class="pkg-plan-speed-val">' + pkg.speed + '</div>' +
          '<div class="pkg-plan-speed-unit">Mbps Fiber Speed</div>' +
          '<div class="pkg-plan-divider"></div>' +
          '<ul class="pkg-plan-features">' + featuresHtml + '</ul>' +
          '<a href="' + buildWaLink(pkg) + '" target="_blank" rel="noopener" class="pkg-plan-cta">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.141 1.534 5.886L.05 23.487a.5.5 0 00.612.612l5.601-1.484A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.94 0-3.753-.564-5.285-1.532l-.38-.227-3.327.882.882-3.327-.227-.38A9.965 9.965 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>' +
            'Inquire on WhatsApp' +
          '</a>' +
          '<div class="pkg-plan-note">* Dynamic or Static IP available as per request</div>';

        grid.appendChild(card);
      });
    }

    // Filter Buttons Listener
    var filterBtns = document.querySelectorAll('.pkg-filter-btn');
    for (var b = 0; b < filterBtns.length; b++) {
      filterBtns[b].addEventListener('click', function () {
        for (var k = 0; k < filterBtns.length; k++) {
          filterBtns[k].classList.remove('active');
        }
        this.classList.add('active');
        var cat = this.getAttribute('data-filter');
        renderCards(cat);
      });
    }

    // Initial Render
    renderCards('all');
  });
})();
