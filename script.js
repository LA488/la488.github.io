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

  // ——— Section Stacking Logic ———
  lenis.on('scroll', ({ scroll }) => {
    sections.forEach((section, index) => {
      // Find the highest overlap from any section FOLLOWING this one
      let maxOverlap = 0;
      const vh = window.innerHeight;

      for (let i = index + 1; i < sections.length; i++) {
        const nextRect = sections[i].getBoundingClientRect();
        const currentOverlap = Math.max(0, (vh - nextRect.top) / vh);
        if (currentOverlap > maxOverlap) maxOverlap = currentOverlap;
      }
      
      if (maxOverlap > 0) {
        const scale = 1 - (maxOverlap * 0.1);
        const blur = maxOverlap * 20; 
        // Aggressive opacity fade: reached 0 at 80% overlap
        const opacity = Math.max(0, 1 - (maxOverlap * 1.25)); 
        
        section.style.transform = `scale(${scale})`;
        section.style.filter = `blur(${blur}px)`;
        section.style.opacity = opacity;
        
        // Final hiding logic
        if (maxOverlap >= 0.95 || opacity <= 0.01) {
          section.style.visibility = 'hidden';
          section.style.pointerEvents = 'none';
        } else {
          section.style.visibility = 'visible';
          section.style.pointerEvents = 'auto';
        }
      } else {
        section.style.transform = 'scale(1)';
        section.style.filter = 'blur(0px)';
        section.style.opacity = 1;
        section.style.visibility = 'visible';
        section.style.pointerEvents = 'auto';
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

  // ——— Infinite Marquee Handled by CSS ———

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
