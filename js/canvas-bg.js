/**
 * MS Digital NET Plus — Canvas Background
 * Animated network/fiber visualization on the hero section canvas.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* ── Brand Palette ─────────────────────────────────────── */
  var VIOLET = '#8B5CF6';
  var LAVENDER = '#C4B5FD';
  var NODE_OPACITY = 0.6;
  var LINE_OPACITY = 0.15;
  var PACKET_COLOR = '#A78BFA';

  /* ── Tunables ───────────────────────────────────────────── */
  var NODE_SPEED = 0.3;
  var CONNECT_DIST = 140;
  var MOUSE_DIST = 180;
  var MIN_PACKETS = 3;
  var MAX_PACKETS = 5;
  var WIFI_ARC_INTERVAL = 3000; // ms between Wi-Fi pulses
  var RESIZE_DEBOUNCE = 200;

  /* ── State ──────────────────────────────────────────────── */
  var nodes = [];
  var packets = [];
  var wifiArcs = [];
  var mouseX = -9999;
  var mouseY = -9999;
  var animId = null;
  var isHeroVisible = true;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastWifiTime = 0;
  var width = 0;
  var height = 0;

  /* ── Helpers ────────────────────────────────────────────── */
  function getNodeCount() {
    var w = window.innerWidth;
    if (w > 1024) return 40;
    if (w > 768) return 20;
    return 12;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function dist(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ── Resize ─────────────────────────────────────────────── */
  function sizeCanvas() {
    var hero = canvas.parentElement;
    if (!hero) return;
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      sizeCanvas();
      initNodes();
      if (prefersReducedMotion) drawStaticFrame();
    }, RESIZE_DEBOUNCE);
  }

  /* ── Node Initialization ────────────────────────────────── */
  function createNode() {
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-NODE_SPEED, NODE_SPEED),
      vy: rand(-NODE_SPEED, NODE_SPEED),
      r: rand(1.5, 3)
    };
  }

  function initNodes() {
    var count = getNodeCount();
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push(createNode());
    }
    initPackets();
  }

  /* ── Data Packets ───────────────────────────────────────── */
  function pickEdge() {
    /* Pick two random nodes close enough to be connected */
    var tries = 0;
    while (tries < 50) {
      var a = Math.floor(rand(0, nodes.length));
      var b = Math.floor(rand(0, nodes.length));
      if (a !== b && dist(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y) < CONNECT_DIST) {
        return { a: a, b: b };
      }
      tries++;
    }
    /* fallback: just pick two adjacent nodes */
    var ia = Math.floor(rand(0, nodes.length));
    var ib = (ia + 1) % nodes.length;
    return { a: ia, b: ib };
  }

  function createPacket() {
    var edge = pickEdge();
    return {
      from: edge.a,
      to: edge.b,
      t: 0,
      speed: rand(0.005, 0.015)
    };
  }

  function initPackets() {
    var count = Math.floor(rand(MIN_PACKETS, MAX_PACKETS + 1));
    packets = [];
    for (var i = 0; i < count; i++) {
      var p = createPacket();
      p.t = rand(0, 1); // stagger initial positions
      packets.push(p);
    }
  }

  /* ── Wi-Fi Arcs ─────────────────────────────────────────── */
  function spawnWifiArc(now) {
    if (now - lastWifiTime < WIFI_ARC_INTERVAL) return;
    lastWifiTime = now;
    var idx = Math.floor(rand(0, nodes.length));
    wifiArcs.push({
      x: nodes[idx].x,
      y: nodes[idx].y,
      radius: 0,
      maxRadius: rand(25, 50),
      opacity: 0.5,
      speed: 0.6
    });
  }

  /* ── Drawing ────────────────────────────────────────────── */
  function drawNodes() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = VIOLET;
      ctx.globalAlpha = NODE_OPACITY;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawLines() {
    ctx.strokeStyle = LAVENDER;
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        if (d < CONNECT_DIST) {
          ctx.globalAlpha = LINE_OPACITY * (1 - d / CONNECT_DIST);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawMouseLines() {
    if (mouseX < 0 || 'ontouchstart' in window) return;
    ctx.strokeStyle = VIOLET;
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      var d = dist(nodes[i].x, nodes[i].y, mouseX, mouseY);
      if (d < MOUSE_DIST) {
        ctx.globalAlpha = 0.25 * (1 - d / MOUSE_DIST);
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPackets() {
    for (var i = 0; i < packets.length; i++) {
      var p = packets[i];
      if (p.from >= nodes.length || p.to >= nodes.length) continue;
      var a = nodes[p.from];
      var b = nodes[p.to];
      var x = a.x + (b.x - a.x) * p.t;
      var y = a.y + (b.y - a.y) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = PACKET_COLOR;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      /* glow */
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = VIOLET;
      ctx.globalAlpha = 0.15;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWifiArcs() {
    for (var i = wifiArcs.length - 1; i >= 0; i--) {
      var arc = wifiArcs[i];
      if (arc.opacity <= 0) {
        wifiArcs.splice(i, 1);
        continue;
      }
      for (var ring = 0; ring < 3; ring++) {
        var r = arc.radius - ring * 8;
        if (r <= 0) continue;
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, r, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.strokeStyle = LAVENDER;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = arc.opacity * (1 - ring * 0.3);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ── Update ─────────────────────────────────────────────── */
  function updateNodes() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    }
  }

  function updatePackets() {
    for (var i = 0; i < packets.length; i++) {
      var p = packets[i];
      p.t += p.speed;
      if (p.t >= 1) {
        packets[i] = createPacket();
      }
    }
    /* maintain packet count */
    while (packets.length < MIN_PACKETS) {
      packets.push(createPacket());
    }
  }

  function updateWifiArcs() {
    for (var i = 0; i < wifiArcs.length; i++) {
      var arc = wifiArcs[i];
      arc.radius += arc.speed;
      arc.opacity -= 0.008;
    }
  }

  /* ── Static Frame (reduced motion) ─────────────────────── */
  function drawStaticFrame() {
    ctx.clearRect(0, 0, width, height);
    drawLines();
    drawNodes();
  }

  /* ── Animation Loop ─────────────────────────────────────── */
  function loop(timestamp) {
    if (document.hidden || !isHeroVisible) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    updateNodes();
    updatePackets();
    updateWifiArcs();
    spawnWifiArc(timestamp);

    drawLines();
    drawMouseLines();
    drawNodes();
    drawPackets();
    drawWifiArcs();

    animId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (animId || prefersReducedMotion) return;
    if (document.hidden || !isHeroVisible) return;
    animId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  /* ── Visibility & Intersection ──────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  var heroSection = document.getElementById('hero') || canvas.parentElement;
  if (heroSection && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      isHeroVisible = entries[0].isIntersecting;
      if (isHeroVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    }, { threshold: 0 });
    heroObserver.observe(heroSection);
  }

  /* ── Mouse Tracking ─────────────────────────────────────── */
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', function () {
    mouseX = -9999;
    mouseY = -9999;
  });

  /* ── Resize Listener ────────────────────────────────────── */
  window.addEventListener('resize', onResize);

  /* ── Boot ────────────────────────────────────────────────── */
  sizeCanvas();
  initNodes();

  if (prefersReducedMotion) {
    drawStaticFrame();
  } else {
    startLoop();
  }
})();
