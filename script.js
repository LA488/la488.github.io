document.addEventListener('DOMContentLoaded', () => {
  // ——— Lenis Smooth Scroll Initialization ———
  const lenis = new Lenis({
    duration: 1.2,
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
  const blobs = document.querySelectorAll('.blob');
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const x = clientX / window.innerWidth;
    const y = clientY / window.innerHeight;
    
    blobs.forEach((blob, index) => {
      const speed = (index + 1) * 35;
      const moveX = (x - 0.5) * speed;
      const moveY = (y - 0.5) * speed;
      // Added subtle rotation and scale for depth
      blob.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + x * 0.1}) rotate(${x * 10}deg)`;
    });
  });

  // ——— Hybrid Stacking & Internal Scroll ———
  const sections = document.querySelectorAll('section');
  
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
  let sectionMetrics = [];

  function cacheSectionMetrics() {
    sectionMetrics = Array.from(sections).map(section => ({
      element: section,
      offsetTop: section.offsetTop,
      height: section.offsetHeight
    }));
  }

  cacheSectionMetrics();
  window.addEventListener('resize', () => {
    updateStickyOffsets();
    cacheSectionMetrics();
  });

  lenis.on('scroll', ({ scroll }) => {
    const vh = window.innerHeight;

    sectionMetrics.forEach((metric, index) => {
      // Find the highest overlap from any section FOLLOWING this one
      let maxOverlap = 0;

      for (let i = index + 1; i < sectionMetrics.length; i++) {
        const nextMetric = sectionMetrics[i];
        // nextMetric.offsetTop is its position relative to parent (body)
        // nextMetric.offsetTop - scroll is its position relative to viewport
        const nextTop = nextMetric.offsetTop - scroll;
        const currentOverlap = Math.max(0, (vh - nextTop) / vh);
        if (currentOverlap > maxOverlap) maxOverlap = currentOverlap;
      }
      
      const section = metric.element;
      if (maxOverlap > 0) {
        const scale = 1 - (maxOverlap * 0.1);
        const blur = maxOverlap * 20; 
        const opacity = Math.max(0, 1 - (maxOverlap * 1.25)); 
        
        section.style.transform = `scale(${scale}) translateZ(0)`;
        section.style.filter = `blur(${Math.min(blur, 15)}px)`; // Capped blur for perf
        section.style.opacity = opacity;
        
        if (maxOverlap >= 0.95 || opacity <= 0.01) {
          if (section.style.visibility !== 'hidden') {
            section.style.visibility = 'hidden';
            section.style.pointerEvents = 'none';
          }
        } else {
          if (section.style.visibility !== 'visible') {
            section.style.visibility = 'visible';
            section.style.pointerEvents = 'auto';
          }
        }
      } else {
        // Only reset if needed to avoid style thrashing
        if (section.style.opacity !== '1' || section.style.visibility !== 'visible') {
          section.style.transform = 'scale(1) translateZ(0)';
          section.style.filter = 'blur(0px)';
          section.style.opacity = 1;
          section.style.visibility = 'visible';
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
  const roles = ['Data Analyst', 'ML Engineer', 'Product Analyst', 'Predictive Modeler'];
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


  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navLinks?.classList.remove('active');
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

    function animateMarquee(time) {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isDragging && !isPaused) {
        currentX -= autoSpeed;
        
        // Seamless loop reset
        if (Math.abs(currentX) >= trackWidth + 30) { // 30 is half the gap (60px)
          currentX = 0;
        }
        
        marqueeTrack.style.transform = `translateX(${currentX}px)`;
      }
      
      requestAnimationFrame(animateMarquee);
    }

    requestAnimationFrame(animateMarquee);

    // Interaction Handlers
    const startDrag = (e, x) => {
      isDragging = true;
      isPaused = true;
      startX = x - currentX;
      clearTimeout(interactionTimer);
      marqueeContainer.style.cursor = 'grabbing';
    };

    const moveDrag = (e, x) => {
      if (!isDragging) return;
      
      // Prevent page scrolling on touch devices while dragging the marquee
      if (e.type === 'touchmove') e.preventDefault();
      
      currentX = x - startX;
      
      // Keep within loop bounds even during drag
      const fullWidth = trackWidth + 30;
      if (currentX > 0) currentX = -fullWidth;
      if (Math.abs(currentX) > fullWidth) currentX = 0;
      
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

  // ——— 3D Tilt Effect for Project Cards ———
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });

  // ——— Magnetic Buttons ———
  const magneticButtons = document.querySelectorAll('.btn, .social-circle, .nav-links a');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0, 0)`;
    });
  });

  // ——— Contact Form Mock Handler ———
  const contactForm = document.getElementById('contact-form');
  const messageArea = contactForm?.querySelector('textarea');

  if (messageArea) {
    messageArea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        contactForm.reset();
        
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

});
