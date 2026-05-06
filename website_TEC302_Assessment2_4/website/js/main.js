/**
 * NexaCore — Main JavaScript
 * TEC302 Assessment 2 — Website Development
 *
 * Modules:
 *  1.  Page Loader          — animated intro with progress bar
 *  2.  Scroll Progress Bar  — top bar showing scroll position
 *  3.  Particle System      — floating dots on canvas
 *  4.  Dark / Light Mode    — theme toggle with localStorage
 *  5.  Navbar               — scroll shrink + mobile hamburger
 *  6.  Typing Effect        — hero headline cycling text
 *  7.  Animated Counters    — IntersectionObserver stat counters
 *  8.  Testimonial Slider   — auto-advance with swipe & keyboard
 *  9.  Accordion            — FAQ collapsible panels
 *  10. Service Filter       — category card filtering
 *  11. Contact Form         — real-time validation
 *  12. Tilt Effect          — 3D card hover
 *  13. Scroll Reveal        — fade-up on scroll
 */

(function () {
  'use strict';

  /* =========================================================
     UTILITY — Safe querySelector with null guard
  ========================================================= */
  function $(id) {
    try {
      return document.getElementById(id);
    } catch (e) {
      console.error('[NexaCore] Element not found:', id, e);
      return null;
    }
  }

  /* =========================================================
     1. PAGE LOADER
     Animates a progress bar, then fades the loader out.
  ========================================================= */
  const loader     = $('pageLoader');
  const loaderFill = $('loaderFill');
  const loaderText = $('loaderText');

  if (loader && loaderFill && loaderText) {
    const steps = ['Initialising...', 'Loading assets...', 'Almost ready...', 'Welcome!'];
    let progress = 0;
    let stepIdx  = 0;

    const loaderInterval = setInterval(() => {
      progress += Math.random() * 25 + 10;

      if (progress >= 100) {
        progress = 100;
        clearInterval(loaderInterval);

        // Small delay then hide
        setTimeout(() => {
          loader.classList.add('hidden');
          // Remove from DOM after transition
          setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
        }, 300);
      }

      loaderFill.style.width = progress + '%';

      if (stepIdx < steps.length - 1 && progress > (stepIdx + 1) * 25) {
        stepIdx++;
        loaderText.textContent = steps[stepIdx];
      }
    }, 220);
  }

  /* =========================================================
     2. SCROLL PROGRESS BAR
     Updates width based on how far the user has scrolled.
  ========================================================= */
  const scrollBar = $('scrollProgress');

  if (scrollBar) {
    window.addEventListener('scroll', () => {
      try {
        const scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const pct          = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        scrollBar.style.width = pct + '%';
      } catch (e) {
        console.error('[NexaCore] Scroll progress error:', e);
      }
    }, { passive: true });
  }

  /* =========================================================
     3. PARTICLE SYSTEM
     Draws animated floating dots on a canvas background.
  ========================================================= */
  const canvas = document.getElementById('particleCanvas');

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    /**
     * Resize canvas to match viewport.
     */
    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    /**
     * Create a single particle with random properties.
     * @returns {Object} Particle object
     */
    function createParticle() {
      return {
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        dx:     (Math.random() - 0.5) * 0.4,
        dy:     (Math.random() - 0.5) * 0.4,
        alpha:  Math.random() * 0.4 + 0.1,
      };
    }

    function initParticles() {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
      for (let i = 0; i < count; i++) particles.push(createParticle());
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 57, 53, ${p.alpha})`;
        ctx.fill();

        // Move
        p.x += p.dx;
        p.y += p.dy;

        // Wrap around edges
        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    initParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    }, { passive: true });
  }

  /* =========================================================
     4. DARK / LIGHT MODE TOGGLE
     Persists preference to localStorage.
  ========================================================= */
  const themeToggle = $('themeToggle');
  const themeIcon   = $('themeIcon');
  const html        = document.documentElement;

  /**
   * Apply a theme by setting the data-theme attribute.
   * @param {string} theme - 'dark' or 'light'
   */
  function applyTheme(theme) {
    try {
      html.setAttribute('data-theme', theme);
      if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      localStorage.setItem('nc-theme', theme);
    } catch (e) {
      console.error('[NexaCore] Theme error:', e);
    }
  }

  // Load saved preference
  const savedTheme = localStorage.getItem('nc-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* =========================================================
     5. NAVBAR — Scroll shrink + mobile hamburger
  ========================================================= */
  const navbar    = $('navbar');
  const hamburger = $('hamburger');
  const navLinks  = $('navLinks');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  /* =========================================================
     6. TYPING EFFECT — Hero headline cycles through phrases
  ========================================================= */
  const typingEl = $('typingText');

  if (typingEl) {
    const phrases  = ['Digital Worlds', 'Bold Ideas', 'Future Products', 'Lasting Impact'];
    let phraseIdx  = 0;
    let charIdx    = 0;
    let isDeleting = false;
    let typeTimer  = null;

    function type() {
      try {
        const current = phrases[phraseIdx];

        if (isDeleting) {
          charIdx--;
          typingEl.textContent = current.slice(0, charIdx);
        } else {
          charIdx++;
          typingEl.textContent = current.slice(0, charIdx);
        }

        let delay = isDeleting ? 60 : 110;

        if (!isDeleting && charIdx === current.length) {
          // Pause at end
          delay      = 1800;
          isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
          isDeleting = false;
          phraseIdx  = (phraseIdx + 1) % phrases.length;
          delay      = 300;
        }

        typeTimer = setTimeout(type, delay);
      } catch (e) {
        console.error('[NexaCore] Typing effect error:', e);
        clearTimeout(typeTimer);
      }
    }

    // Start after loader delay
    setTimeout(type, 1800);
  }

  /* =========================================================
     7. ANIMATED COUNTERS — IntersectionObserver triggered
  ========================================================= */
  const statItems = document.querySelectorAll('.stat-item');

  if (statItems.length) {
    /**
     * Animate a number from 0 to target with cubic ease-out.
     * @param {HTMLElement} el     - Element to update
     * @param {number}      target - Final value
     * @param {number}      dur    - Duration in ms
     */
    function animateCounter(el, target, dur = 1800) {
      let start  = null;
      const ease = t => 1 - Math.pow(1 - t, 3);

      function step(ts) {
        if (!start) start = ts;
        const elapsed  = ts - start;
        const progress = Math.min(elapsed / dur, 1);
        el.textContent = Math.floor(ease(progress) * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }

      requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item   = entry.target;
          const target = parseInt(item.dataset.target, 10);
          const idx    = Array.from(statItems).indexOf(item);
          const el     = $('stat-' + idx);
          if (el) animateCounter(el, target);
          statsObserver.unobserve(item);
        }
      });
    }, { threshold: 0.4 });

    statItems.forEach(item => statsObserver.observe(item));
  }

  /* =========================================================
     8. TESTIMONIAL SLIDER — Auto-advance, swipe, keyboard
  ========================================================= */
  const slider      = $('slider');
  const prevBtn     = $('prevBtn');
  const nextBtn     = $('nextBtn');
  const dotsWrapper = $('sliderDots');

  if (slider && prevBtn && nextBtn && dotsWrapper) {
    const slides = slider.querySelectorAll('.slide');
    let current  = 0;
    let autoTimer;

    // Build dot buttons
    slides.forEach((_, i) => {
      const dot  = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrapper.appendChild(dot);
    });

    const dots = dotsWrapper.querySelectorAll('.dot');

    function goTo(n) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    });

    // Touch / swipe
    let touchStart = 0;
    slider.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); resetAuto(); }
    });

    resetAuto();
  }

  /* =========================================================
     9. ACCORDION — Single-open FAQ panels
  ========================================================= */
  const accItems = document.querySelectorAll('.accordion-item');

  accItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      accItems.forEach(other => other.classList.remove('open'));
      item.classList.toggle('open', !isOpen);
    });
  });

  /* =========================================================
     10. SERVICE FILTER — Category-based card filtering
  ========================================================= */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const svcCards    = document.querySelectorAll('.service-card');

  if (filterBtns.length && svcCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        svcCards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hidden', !show);
          if (show) card.style.animation = 'fadeUp 0.4s ease forwards';
        });
      });
    });
  }

  /* =========================================================
     11. CONTACT FORM — Real-time validation & submission
  ========================================================= */
  const contactForm  = $('contactForm');
  const submitBtn    = $('submitBtn');
  const submitText   = $('submitText');
  const submitLoader = $('submitLoader');
  const formSuccess  = $('formSuccess');
  const formBlock    = $('contactFormBlock');
  const resetBtn     = $('resetForm');
  const msgField     = $('message');
  const charCount    = $('charCount');

  // Character counter
  if (msgField && charCount) {
    msgField.addEventListener('input', () => {
      const len = msgField.value.length;
      charCount.textContent = len + ' / 500';
      charCount.style.color = len > 500 ? 'var(--clr-accent-2)' : 'var(--clr-text-muted)';
    });
  }

  /**
   * Validate a single field and display inline error.
   * @param {string}   fieldId - Input element ID
   * @param {Function} rule    - Returns error string or ''
   * @returns {boolean} Is field valid
   */
  function validateField(fieldId, rule) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-err');
    if (!field || !errEl) return true;

    const msg = rule(field.value.trim());
    errEl.textContent = msg;
    field.classList.toggle('error', !!msg);
    return !msg;
  }

  const validations = [
    ['firstName', v => v ? '' : 'First name is required.'],
    ['lastName',  v => v ? '' : 'Last name is required.'],
    ['email',     v => {
      if (!v) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email.';
      return '';
    }],
    ['phone',  v => {
      if (!v) return '';
      if (!/^[\+\d\s\-\(\)]{7,20}$/.test(v)) return 'Please enter a valid phone number.';
      return '';
    }],
    ['service', v => v ? '' : 'Please select a service.'],
    ['message', v => {
      if (!v) return 'Please provide project details.';
      if (v.length > 500) return 'Message must be under 500 characters.';
      return '';
    }],
  ];

  // Blur + live validation
  if (contactForm) {
    validations.forEach(([id, rule]) => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('blur',  () => validateField(id, rule));
      field.addEventListener('input', () => {
        const errEl = document.getElementById(id + '-err');
        if (errEl && errEl.textContent) validateField(id, rule);
      });
    });
  }

  // Submit handler
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      try {
        const allValid = validations.map(([id, rule]) => validateField(id, rule)).every(Boolean);

        if (!allValid) {
          const firstErr = contactForm ? contactForm.querySelector('.error') : null;
          if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        // Loading state
        if (submitText)   submitText.style.display   = 'none';
        if (submitLoader) submitLoader.style.display  = 'inline';
        if (submitBtn)    submitBtn.disabled           = true;

        // Simulated async request
        await new Promise(resolve => setTimeout(resolve, 1800));

        // Show success
        if (formBlock)   formBlock.style.display   = 'none';
        if (formSuccess) {
          formSuccess.style.display   = 'block';
          formSuccess.style.animation = 'fadeUp 0.5s ease forwards';
        }
      } catch (e) {
        console.error('[NexaCore] Form submission error:', e);
        if (submitText)   submitText.style.display   = 'inline';
        if (submitLoader) submitLoader.style.display  = 'none';
        if (submitBtn)    submitBtn.disabled           = false;
      }
    });
  }

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (formSuccess) formSuccess.style.display = 'none';
      if (formBlock)   formBlock.style.display   = 'block';
      if (contactForm) {
        contactForm.querySelectorAll('input, select, textarea').forEach(el => {
          el.value = '';
          el.classList.remove('error');
        });
        contactForm.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      }
      if (charCount)    charCount.textContent   = '0 / 500';
      if (submitText)   submitText.style.display  = 'inline';
      if (submitLoader) submitLoader.style.display = 'none';
      if (submitBtn)    submitBtn.disabled         = false;
    });
  }

  /* =========================================================
     12. TILT EFFECT — 3D perspective on feature cards
  ========================================================= */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      try {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dx    = (e.clientX - cx) / (rect.width  / 2);
        const dy    = (e.clientY - cy) / (rect.height / 2);
        const angle = 8;
        card.style.transform  = `perspective(600px) rotateX(${-dy * angle}deg) rotateY(${dx * angle}deg) translateY(-6px)`;
        card.style.transition = 'transform 0.1s ease';
      } catch (e) {
        console.error('[NexaCore] Tilt error:', e);
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.5s ease';
    });
  });

  /* =========================================================
     13. SCROLL REVEAL — Fade-up elements on scroll
  ========================================================= */
  const revealItems = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Stagger delay based on sibling index
          const siblings = Array.from(el.parentElement ? el.parentElement.querySelectorAll('.reveal-item') : [el]);
          const idx      = siblings.indexOf(el);
          el.style.transitionDelay = (idx * 0.1) + 's';
          el.classList.add('revealed');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all immediately if IntersectionObserver unavailable
    revealItems.forEach(el => el.classList.add('revealed'));
  }

})();
