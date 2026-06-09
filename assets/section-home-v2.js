// Vault TCG — Homepage v2 interactive behaviours
// Vanilla JS, no dependencies. Three IIFEs: hero slider, tab switcher, newsletter.

// ── Hero Slider ──────────────────────────────────────────────────────────────
(function () {
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;

  var slides = Array.from(hero.querySelectorAll('[data-slide]'));
  var dots   = Array.from(hero.querySelectorAll('[data-dot]'));
  if (slides.length < 2) return;

  var current  = 0;
  var interval = null;
  var isPaused = false;
  var INTERVAL_MS = 5000;

  function goTo(n) {
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    current = ((n % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function start() {
    if (!isPaused) {
      interval = setInterval(function () { goTo(current + 1); }, INTERVAL_MS);
    }
  }
  function stop() { clearInterval(interval); }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      stop();
      goTo(i);
      start();
    });
  });

  // Arrow key navigation between tabs
  var tablist = hero.querySelector('[role="tablist"]');
  if (tablist) {
    tablist.addEventListener('keydown', function (e) {
      var idx = dots.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        stop();
        goTo(idx + 1);
        dots[current].focus();
        start();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        stop();
        goTo(idx - 1);
        dots[current].focus();
        start();
      }
    });
  }

  // Pause on hover/focus for accessibility
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', function () { if (!isPaused) start(); });
  hero.addEventListener('focusin',  stop);
  hero.addEventListener('focusout', function () { if (!isPaused) start(); });

  // Persistent pause/play button
  var pauseBtn = document.getElementById('qc-hero-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      isPaused = !isPaused;
      if (isPaused) {
        stop();
        pauseBtn.setAttribute('aria-label', 'Play slideshow');
        pauseBtn.setAttribute('aria-pressed', 'true');
      } else {
        start();
        pauseBtn.setAttribute('aria-label', 'Pause slideshow');
        pauseBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  start();
}());

// ── Fan Favourites Tab Switcher ───────────────────────────────────────────────
(function () {
  var tabGroups = Array.from(document.querySelectorAll('[data-tabs]'));

  tabGroups.forEach(function (group) {
    var tabs   = Array.from(group.querySelectorAll('[data-tab]'));
    var panels = Array.from(group.querySelectorAll('[data-panel]'));

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        // Deactivate all
        tabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) {
          p.hidden = true;
        });
        // Activate selected
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        if (panels[i]) panels[i].hidden = false;
      });
    });
  });
}());

// ── Scroll-reveal ─────────────────────────────────────────────────────────────
(function () {
  if (!('IntersectionObserver' in window)) return;
  var sections = Array.from(document.querySelectorAll('.qc-home-section'));
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('will-reveal');
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });

  sections.forEach(function (section) {
    if (section.getBoundingClientRect().top > window.innerHeight * 0.85) {
      section.classList.add('will-reveal');
      observer.observe(section);
    }
  });
}());

// ── Newsletter Form ───────────────────────────────────────────────────────────
(function () {
  var form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    // Let the form submit to Shopify normally (contact form endpoint)
    // but update UI state immediately so the button feels responsive
    var btn   = form.querySelector('[data-newsletter-btn]');
    var input = form.querySelector('input[type="email"]');

    if (btn) {
      btn.textContent = "You're in";
      btn.disabled = true;
    }
    if (input) {
      input.disabled = true;
    }
  });
}());
