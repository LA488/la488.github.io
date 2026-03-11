/* ===========================================
   Personal Business Card — Interactivity
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ——— Cursor Glow Tracking ———
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });
  }

  // ——— Typed Text Effect ———
  const typedEl = document.getElementById('typed-text');
  const roles = [
    'Data Analyst',
    'ML Engineer',
    'Product Analyst',
    'Python Developer'
  ];
  let roleIndex = 0, charIndex = 0, isDeleting = false;

  function typeEffect() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      typedEl.textContent = currentRole.substring(0, charIndex--);
      if (charIndex < 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeEffect, 500);
        return;
      }
      setTimeout(typeEffect, 30);
    } else {
      typedEl.textContent = currentRole.substring(0, charIndex++);
      if (charIndex > currentRole.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
        return;
      }
      setTimeout(typeEffect, 60);
    }
  }
  if (typedEl) typeEffect();


  // ——— Navbar scroll effect ———
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });


  // ——— Smooth scroll for nav links ———
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close mobile menu if open
        document.querySelector('.nav-links').classList.remove('active');
        document.querySelector('.hamburger').classList.remove('active');
      }
    });
  });


  // ——— Hamburger menu ———
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }


  // ——— Intersection Observer — reveal on scroll ———
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .skill-card, .project-card, .highlight-card').forEach(el => {
    revealObserver.observe(el);
  });


  // ——— Contact form (demo handler) ———
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn');
      const originalHtml = btn.innerHTML;
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#fafafa';
      btn.style.color = '#09090b';
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 3000);
    });
  }

});
