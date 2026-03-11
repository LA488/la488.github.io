/**
 * Futuristic Glassmorphism — Interactive Layer
 */

document.addEventListener('DOMContentLoaded', () => {

  // ——— Cursor Glow Tracking ———
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });
  }

  // ——— Subtle Background Blob Movement ———
  const blobs = document.querySelectorAll('.blob');
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    blobs.forEach((blob, index) => {
      const speed = (index + 1) * 20;
      const moveX = (x - 0.5) * speed;
      const moveY = (y - 0.5) * speed;
      blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
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

  // ——— Navbar Scroll Effect ———
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

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

  // Check saved preference
  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
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

  // ——— Contact Form Mock Handler ———
  const contactForm = document.getElementById('contact-form');
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
