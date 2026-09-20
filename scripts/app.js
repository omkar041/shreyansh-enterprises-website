/**
 * SHREYANSH ENTERPRISES - APPLICATION LOGIC
 * Navigation, mobile drawer, interactive validation, accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initActiveNav();
  initContactForm();
  initScrollReveals();
  initHeroParallax();
});

/* Sticky Navigation Bar */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* Lightweight Scroll Fade-Up Reveal Observer */
function initScrollReveals() {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealTargets = document.querySelectorAll(
    '.service-card, .pillar-card, .industry-card, .client-logo-item, .contact-info-card, .contact-form-wrapper, .section-header, .about-image-wrapper'
  );

  revealTargets.forEach(el => {
    el.classList.add('reveal-fade');
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealTargets.forEach(el => observer.observe(el));
}

/* Subtle Hero Image Parallax (rAF optimized) */
function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroBg = document.querySelector('.hero-bg-media');
  const heroSection = document.querySelector('.hero-section');
  if (!heroBg || !heroSection) return;

  let ticking = false;

  const updateParallax = () => {
    const scrolled = window.scrollY;
    const heroHeight = heroSection.offsetHeight;

    if (scrolled <= heroHeight) {
      const translateY = scrolled * 0.28;
      heroBg.style.transform = `translateY(${translateY}px)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* Mobile Hamburger Menu & Backdrop Drawer */
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  let backdrop = document.querySelector('.mobile-backdrop');

  if (!mobileToggle || !mobileMenu) return;

  // Create backdrop element if not already present in DOM
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-backdrop';
    document.body.appendChild(backdrop);
  }

  const openDrawer = () => {
    mobileMenu.classList.add('open');
    backdrop.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  };

  const closeDrawer = () => {
    mobileMenu.classList.remove('open');
    backdrop.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  backdrop.addEventListener('click', closeDrawer);

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Close when clicking any nav link inside mobile drawer
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* Active Link Marker Across All Pages & Sub-routes */
function initActiveNav() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    const cleanHref = href.replace('../', '').replace('.html', '');
    const cleanPath = currentPath.replace('.html', '');

    if (
      currentPath.endsWith(href) ||
      (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath === ''))
    ) {
      link.classList.add('active');
    } else if (cleanHref !== 'index' && cleanHref !== '' && cleanPath.includes(cleanHref)) {
      link.classList.add('active');
    }
  });
}

/* Form Validation & Backend Ready Hook */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const formStatus = document.getElementById('form-status');
  const inputs = contactForm.querySelectorAll('.form-control');

  // Clear individual field errors on input
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const parent = input.closest('.form-group');
      if (parent) {
        const errorEl = parent.querySelector('.error-msg');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
      }
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(contactForm);

    const fullName = contactForm.querySelector('[name="fullName"]');
    const email = contactForm.querySelector('[name="email"]');
    const phone = contactForm.querySelector('[name="phone"]');
    const service = contactForm.querySelector('[name="service"]');
    const message = contactForm.querySelector('[name="message"]');
    const companyName = contactForm.querySelector('[name="companyName"]');

    let isValid = true;

    // Full Name
    if (!fullName || !fullName.value.trim()) {
      showFieldError(fullName, 'Full Name is required.');
      isValid = false;
    }

    // Email
    if (!email || !email.value.trim() || !validateEmail(email.value.trim())) {
      showFieldError(email, 'Please provide a valid email address.');
      isValid = false;
    }

    // Phone
    if (!phone || !phone.value.trim() || !validatePhone(phone.value.trim())) {
      showFieldError(phone, 'Please provide a valid phone number (minimum 10 digits).');
      isValid = false;
    }

    // Service Required
    if (!service || !service.value) {
      showFieldError(service, 'Please select the required service category.');
      isValid = false;
    }

    // Message
    if (!message || !message.value.trim()) {
      showFieldError(message, 'Please provide details about your project or requirement.');
      isValid = false;
    }

    if (isValid) {
      const payload = {
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        companyName: companyName ? companyName.value.trim() : '',
        service: service.value,
        message: message.value.trim(),
        submittedAt: new Date().toISOString()
      };

      console.log('Shreyansh Enterprises Validated Submission Payload:', payload);

      const companyEmail = 'shreyanshenterprises410202@gmail.com';
      const emailSubject = 'New Service Enquiry - Shreyansh Enterprises';
      const emailBody = `Hello Shreyansh Enterprises,

I would like to enquire about your services.

Enquiry Details:

Name: ${payload.fullName}

Email: ${payload.email}

Phone: ${payload.phone}

Company Name: ${payload.companyName || 'N/A'}

Service Required: ${payload.service}

Message:
${payload.message}

Thank you.

Regards,
${payload.fullName}`;

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(companyEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(companyEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      const whatsappMessage = `Hello Shreyansh Enterprises, I am ${payload.fullName} inquiring about ${payload.service}.\n\nCompany: ${payload.companyName || 'N/A'}\nEmail: ${payload.email}\nPhone: ${payload.phone}\n\nRequirement:\n${payload.message}`;
      const whatsappUrl = `https://wa.me/919271707273?text=${encodeURIComponent(whatsappMessage)}`;

      if (formStatus) {
        formStatus.className = 'form-status notice';
        formStatus.innerHTML = `
          <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 6px;">Enquiry Details Validated &amp; Ready</div>
          <p style="margin-bottom: 14px; font-size: 0.95rem; color: var(--primary);">
            Thank you, <strong>${escapeHtml(payload.fullName)}</strong>. Your requirement for <strong>${escapeHtml(payload.service)}</strong> is validated. Select your preferred channel below to complete your enquiry:
          </p>
          <div class="contact-actions-grid">
            <a href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener" class="btn btn-whatsapp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0012.04 2zm.01 16.67c-1.49 0-2.95-.4-4.23-1.16l-.3-.18-3.14.82.84-3.06-.2-.31a8.18 8.18 0 01-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.42 5.82c0 4.54-3.7 8.24-8.19 8.24zm4.51-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.71 4.29 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.22-.17-.47-.3z"/></svg>
              Send via WhatsApp Instantly
            </a>
            <a href="${escapeHtml(gmailUrl)}" target="_blank" rel="noopener" class="btn btn-gmail">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              Send via Gmail
            </a>
            <a href="tel:+919271707273" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              Call Direct
            </a>
          </div>
          <div style="margin-top: 10px; font-size: 0.82rem; color: var(--gray-600);">
            Prefer default mail client? <a href="${escapeHtml(mailtoUrl)}" style="color: var(--primary); text-decoration: underline;">Click here to open mailto app</a>
          </div>
        `;
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
}

function showFieldError(inputElement, message) {
  if (!inputElement) return;
  inputElement.classList.add('error');
  const parent = inputElement.closest('.form-group');
  if (parent) {
    const errorEl = parent.querySelector('.error-msg');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }
}

function clearFormErrors(form) {
  const inputs = form.querySelectorAll('.form-control');
  inputs.forEach(input => input.classList.remove('error'));
  const errors = form.querySelectorAll('.error-msg');
  errors.forEach(err => {
    err.textContent = '';
    err.classList.remove('visible');
  });
  const status = document.getElementById('form-status');
  if (status) status.className = 'form-status';
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const clean = phone.replace(/[\s\-\(\)\+]/g, '');
  return clean.length >= 10;
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
