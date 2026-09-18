/**
 * SHREYANSH ENTERPRISES - APPLICATION LOGIC
 * Navigation, mobile drawer, interactive validation, accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initActiveNav();
  initContactForm();
});

/* Sticky Navigation Bar */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
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

      if (formStatus) {
        formStatus.className = 'form-status notice';
        formStatus.innerHTML = `
          <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 6px;">Enquiry Details Validated &amp; Ready</div>
          <p style="margin-bottom: 12px; font-size: 0.95rem; color: var(--primary);">
            Thank you, <strong>${escapeHtml(payload.fullName)}</strong>. Your requirement for <strong>${escapeHtml(payload.service)}</strong> is confirmed.
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
            <a href="https://wa.me/919271707273?text=Hello%20Shreyansh%20Enterprises%2C%20I%20am%20${encodeURIComponent(payload.fullName)}%20inquiring%20about%20${encodeURIComponent(payload.service)}.%20Requirement%3A%20${encodeURIComponent(payload.message)}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="padding: 10px 18px; font-size: 0.88rem;">
              Send via WhatsApp Instantly
            </a>
            <a href="tel:+919271707273" class="btn btn-primary" style="padding: 10px 18px; font-size: 0.88rem;">
              Call Direct: +91 92717 07273
            </a>
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
