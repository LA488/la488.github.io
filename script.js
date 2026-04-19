document.addEventListener('DOMContentLoaded', () => {
  // ——— Lenis Smooth Scroll Initialization ———
  const lenis = new Lenis({
    duration: 0.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ——— Cursor Glow Tracking ———
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });
  }

  // ——— Dynamic Parallax & Background Bloom ———
  // PERF FIX: Only run on desktop pointer devices.
  // rotate() + scale() on blobs causes non-composited paint storms — use translate only.
  const blobs = document.querySelectorAll('.blob');
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const x = clientX / window.innerWidth;
      const y = clientY / window.innerHeight;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 25;
        const moveX = (x - 0.5) * speed;
        const moveY = (y - 0.5) * speed;
        // translate only — keeps blobs on their own GPU layer without causing paint
        blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });
  }

  // ——— Hybrid Stacking & Internal Scroll ———
  const sections = document.querySelectorAll('section, footer');

  function updateStickyOffsets() {
    sections.forEach(section => {
      const height = section.offsetHeight;
      const vh = window.innerHeight;
      if (height > vh) {
        // If section is taller than viewport, stick it only when bottom reaches bottom
        section.style.top = `${vh - height}px`;
      } else {
        // If section is shorter/equal, stick at top
        section.style.top = '0px';
      }
    });
  }

  // Initial call and update on resize
  updateStickyOffsets();
  window.addEventListener('resize', updateStickyOffsets);

  // ——— Optimized Section Stacking Logic ———
  let vh = window.innerHeight;
  let isMobile = window.innerWidth <= 768;
  let sectionMetrics = [];

  const cacheSectionMetrics = () => {
    sectionMetrics = Array.from(sections).map(section => ({
      element: section,
      id: section.id ? `#${section.id}` : null,
      offsetTop: section.offsetTop,
      height: section.offsetHeight,
      isActive: true // Track active state for pointer-events
    }));
    vh = window.innerHeight;
    isMobile = window.innerWidth <= 768;
  };

  cacheSectionMetrics();
  window.addEventListener('resize', () => {
    updateStickyOffsets();
    cacheSectionMetrics();
  });

  lenis.on('scroll', ({ scroll }) => {
    // RE-CALCULATE VH: Mobile address bars can change window.innerHeight without triggering resize
    const currentVh = window.innerHeight;

    sectionMetrics.forEach((metric, index) => {
      // Find the highest overlap from any section FOLLOWING this one
      let maxOverlap = 0;

      for (let i = index + 1; i < sectionMetrics.length; i++) {
        const nextMetric = sectionMetrics[i];
        // nextMetric.offsetTop is its position relative to parent (body)
        // nextMetric.offsetTop - scroll is its position relative to viewport
        const nextTop = nextMetric.offsetTop - scroll;
        let currentOverlap = Math.max(0, (currentVh - nextTop) / currentVh);

        // Add scroll buffer: dead zone before transition starts
        const buffer = 0.1;
        currentOverlap = Math.max(0, (currentOverlap - buffer) / (1 - buffer));

        // Apply power curve for smoother transition entry
        currentOverlap = Math.pow(currentOverlap, 1.2);

        if (currentOverlap > maxOverlap) maxOverlap = currentOverlap;
      }

      const section = metric.element;
      if (maxOverlap > 0) {
        const scale = 1 - (maxOverlap * 0.1);
        const opacity = Math.max(0, 1 - (maxOverlap * 1.25));

        // Write transform & opacity directly — no CSS transition, no cascade storm
        section.style.transform = `scale(${scale}) translateZ(0)`;
        section.style.opacity = opacity;

        // Blur: on desktop full 15px, on mobile lighter 8px (restored but cheaper)
        const maxBlur = isMobile ? 8 : 15;
        const blur = maxOverlap * (isMobile ? 12 : 20);
        section.style.filter = `blur(${Math.min(blur, maxBlur)}px)`;

        // PERF FIX: Only toggle pointer-events when crossing threshold
        const shouldDisable = maxOverlap >= 0.95 || opacity <= 0.01;
        if (shouldDisable && metric.isActive) {
          metric.isActive = false;
          section.style.pointerEvents = 'none';
        } else if (!shouldDisable && !metric.isActive) {
          metric.isActive = true;
          section.style.pointerEvents = 'auto';
        }
      } else {
        // Only reset if section was previously affected
        if (!metric.isActive || section.style.opacity !== '') {
          metric.isActive = true;
          section.style.transform = 'scale(1) translateZ(0)';
          section.style.filter = 'none';
          section.style.opacity = '';
          section.style.pointerEvents = 'auto';
        }
      }
    });

    // Navbar Logic
    if (scroll > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // ——— Typed Role Effect ———
  const typedRole = document.getElementById('typed-role');
  const roles = ['Data Analyst', 'ML Engineer', 'Data Scientist', 'Product Analyst'];
  let roleIdx = 0, charIdx = 0, isDeleting = false;

  function type() {
    const current = roles[roleIdx];
    if (isDeleting) {
      typedRole.textContent = current.substring(0, charIdx--);
      if (charIdx < 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(type, 500);
        return;
      }
      setTimeout(type, 40);
    } else {
      typedRole.textContent = current.substring(0, charIdx++);
      if (charIdx > current.length) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 80);
    }
  }
  if (typedRole) type();

  // ——— Navbar Logic (Handled in Lenis scroll) ———
  const navbar = document.getElementById('navbar');

  // ——— Navigation & Mobile Menu ———
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // ——— Theme Switcher ———
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Check saved preference: Default is 'dark'
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light') {
    body.classList.add('light-mode');
  } else if (!savedTheme) {
    // If no theme is saved, we explicitly treat it as dark
    localStorage.setItem('theme', 'dark');
  }

  themeToggle?.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });


  // ——— Robust Navigation Logic ———
  const navigationLinks = document.querySelectorAll('.nav-links a, .nav-logo, .hero-buttons a, .back-to-top');

  navigationLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();

        // Close mobile menu if open
        hamburger?.classList.remove('active');
        navLinks?.classList.remove('active');
        document.body.style.overflow = ''; // Ensure body scroll is not locked

        // Refresh metrics before scrolling to ensure accuracy on mobile
        cacheSectionMetrics();

        // Update Hash without jump
        history.pushState(null, null, targetId);

        // Use Lenis to scroll to the element itself.
        // This is dynamic and accounts for current height/sticky offsets.
        lenis.scrollTo(targetId, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          // If we want a universal offset (e.g., for sticky header), we put it here
          offset: 0 
        });
      }
    });
  });

  // ——— Intersection Observer: Reveal on Scroll ———
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .skill-card, .project-card, .contact-card, .contact-form').forEach(el => {
    revealObserver.observe(el);
  });

  // ——— Interactive Infinite Marquee ———
  const marqueeContainer = document.querySelector('.marquee-container');
  const marqueeTrack = document.querySelector('.marquee-track');

  if (marqueeContainer && marqueeTrack) {
    let currentX = 0;
    let isDragging = false;
    let startX = 0;
    let autoSpeed = 0.5; // Pixels per frame
    let lastTime = 0;
    let isPaused = false;
    let interactionTimer = null;

    // We need the width of one set of items (the first half)
    let trackWidth = marqueeTrack.scrollWidth / 2;

    let dragVelocity = 0;

    function animateMarquee(time) {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isDragging) {
        if (Math.abs(dragVelocity) > 0.1) {
          currentX += dragVelocity;
          dragVelocity *= 0.92; // Friction factor
        } else if (!isPaused) {
          dragVelocity = 0;
          currentX -= autoSpeed;
        }

        // Seamless loop reset bounds
        const fullWidth = trackWidth + 30;
        if (currentX > 0) currentX -= fullWidth;
        else if (Math.abs(currentX) >= fullWidth) currentX += fullWidth;

        marqueeTrack.style.transform = `translateX(${currentX}px)`;
      }

      requestAnimationFrame(animateMarquee);
    }

    requestAnimationFrame(animateMarquee);

    // Interaction Handlers
    let lastDragX = 0;

    const startDrag = (e, x) => {
      isDragging = true;
      isPaused = true;
      lastDragX = x;
      dragVelocity = 0; // Stop any existing momentum
      clearTimeout(interactionTimer);
      marqueeContainer.style.cursor = 'grabbing';
    };

    const moveDrag = (e, x) => {
      if (!isDragging) return;

      // Prevent page scrolling on touch devices while dragging the marquee
      if (e.type === 'touchmove') e.preventDefault();

      // Calculate delta and apply multiplier (faster on mobile)
      const deltaX = x - lastDragX;
      lastDragX = x;

      const dragMultiplier = window.innerWidth <= 768 ? 2.5 : 1.5;
      const movement = deltaX * dragMultiplier;
      currentX += movement;
      dragVelocity = movement; // Record velocity for momentum upon release

      // Keep within loop bounds even during drag
      const fullWidth = trackWidth + 30;
      if (currentX > 0) currentX -= fullWidth;
      else if (Math.abs(currentX) >= fullWidth) currentX += fullWidth;

      marqueeTrack.style.transform = `translateX(${currentX}px)`;
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      marqueeContainer.style.cursor = 'grab';

      // Resume auto-scroll after 2 seconds of idleness
      interactionTimer = setTimeout(() => {
        isPaused = false;
      }, 2000);
    };

    // Mouse Events
    marqueeContainer.addEventListener('mousedown', (e) => startDrag(e, e.pageX));
    window.addEventListener('mousemove', (e) => moveDrag(e, e.pageX));
    window.addEventListener('mouseup', stopDrag);

    // Touch Events - Crucial to set passive: false to allow preventDefault()
    marqueeContainer.addEventListener('touchstart', (e) => startDrag(e, e.touches[0].pageX), { passive: true });
    window.addEventListener('touchmove', (e) => moveDrag(e, e.touches[0].pageX), { passive: false });
    window.addEventListener('touchend', stopDrag);

    marqueeContainer.addEventListener('mouseenter', () => {
      if (!isDragging) isPaused = true;
    });

    marqueeContainer.addEventListener('mouseleave', () => {
      if (!isDragging) {
        clearTimeout(interactionTimer);
        interactionTimer = setTimeout(() => {
          isPaused = false;
        }, 1000);
      }
    });

    // Handle resize to update trackWidth
    window.addEventListener('resize', () => {
      trackWidth = marqueeTrack.scrollWidth / 2;
    });
  }


  // ——— Magnetic Buttons (Desktop Only) ———
  if (window.matchMedia("(pointer: fine)").matches) {
    const magneticButtons = document.querySelectorAll('.btn, .social-circle, .nav-links a, .magnetic-btn');
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const intensity = btn.classList.contains('magnetic-btn') ? 0.4 : 0.3;
        btn.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0, 0)`;
      });
    });
  }

});
