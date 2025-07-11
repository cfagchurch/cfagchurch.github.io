// Global Variables
let currentTheme = localStorage.getItem("theme") || "light";
let isNavOpen = false;

// DOM Elements
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const modalOk = document.getElementById("modalOk");
const scrollIndicator = document.querySelector(".scroll-indicator");

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  initializeTheme();
  initializeNavigation();
  initializeScrollEffects();
  initializeContactForm();
  initializeAnimations();
  initializeAccessibility();
});

// Theme Management
function initializeTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon();

  themeToggle.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = themeToggle.querySelector("i");
  icon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
}

// Navigation Management
function initializeNavigation() {
  navToggle.addEventListener("click", toggleNavigation);

  // Close nav when clicking on nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isNavOpen) {
        toggleNavigation();
      }
    });
  });

  // Close nav when clicking outside
  document.addEventListener("click", (e) => {
    if (isNavOpen && !navbar.contains(e.target)) {
      toggleNavigation();
    }
  });
}

function toggleNavigation() {
  isNavOpen = !isNavOpen;
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");

  // Prevent body scroll when nav is open
  document.body.style.overflow = isNavOpen ? "hidden" : "";
}

// Scroll Effects
function initializeScrollEffects() {
  window.addEventListener("scroll", handleScroll);

  // Smooth scroll for scroll indicator
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.getElementById("about").scrollIntoView({
        behavior: "smooth",
      });
    });
  }
}

function handleScroll() {
  const scrollTop = window.pageYOffset;

  // Navbar background on scroll
  if (scrollTop > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Parallax effect for hero section
  const hero = document.querySelector(".hero");
  if (hero) {
    const speed = scrollTop * 0.5;
    hero.style.transform = `translateY(${speed}px)`;
  }

  // Hide scroll indicator after scrolling
  if (scrollIndicator && scrollTop > 200) {
    scrollIndicator.style.opacity = "0";
  } else if (scrollIndicator) {
    scrollIndicator.style.opacity = "1";
  }
}

// Contact Form Management with EmailJS integration
function initializeContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener("submit", handleFormSubmit);

  // Real-time validation
  const inputs = contactForm.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => clearFieldError(input));
  });
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (validateForm()) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;

    // EmailJS integration with library check
    if (typeof emailjs === 'undefined' || !emailjs.send) {
      alert('Email service is not available. Please check your internet connection or contact the site administrator.');
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      return;
    }

    // Use provided EmailJS IDs
    const serviceID = 'service_bo5iubp';
    const templateID = 'template_y3f2lyw';

    // Prepare template params
    const templateParams = {
      from_name: document.getElementById('name').value,
      from_email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      phone: document.getElementById('phone').value,
      message: document.getElementById('message').value,
      to_email: 'cfagchurch@gmail.com',
    };

    // Initialize EmailJS with your public key if not already initialized
    if (!emailjs._init || !emailjs._userID) {
      emailjs.init('BD1g9iK26T1WzZSKx');
    }

    emailjs.send(serviceID, templateID, templateParams)
      .then(function(response) {
        showSuccessModal();
        resetForm();
        submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        setTimeout(function() {
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }, 2000);
      }, function(error) {
        alert('Failed to send message. Please try again later.');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      });
  }
}

function validateForm() {
  let isValid = true;
  const fields = ["name", "email", "subject", "message"];

  fields.forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    if (!validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = "";

  // Clear previous error
  clearFieldError(field);

  // Required field validation
  if (field.hasAttribute("required") && !value) {
    errorMessage = `${getFieldLabel(fieldName)} is required.`;
    isValid = false;
  }

  // Specific field validations
  if (value && fieldName === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errorMessage = "Please enter a valid email address.";
      isValid = false;
    }
  }

  if (value && fieldName === "phone") {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      errorMessage = "Please enter a valid phone number.";
      isValid = false;
    }
  }

  if (value && fieldName === "name" && value.length < 2) {
    errorMessage = "Name must be at least 2 characters long.";
    isValid = false;
  }

  if (value && fieldName === "message" && value.length < 10) {
    errorMessage = "Message must be at least 10 characters long.";
    isValid = false;
  }

  // Show error if invalid
  if (!isValid) {
    showFieldError(field, errorMessage);
  }

  return isValid;
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(field.name + "Error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
  field.style.borderColor = "#e74c3c";
  field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field) {
  const errorElement = document.getElementById(field.name + "Error");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
  field.style.borderColor = "";
  field.removeAttribute("aria-invalid");
}

function getFieldLabel(fieldName) {
  const labels = {
    name: "Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
  };
  return labels[fieldName] || fieldName;
}

function resetForm() {
  contactForm.reset();
  const errorElements = contactForm.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.textContent = "";
    element.style.display = "none";
  });

  const fields = contactForm.querySelectorAll("input, select, textarea");
  fields.forEach((field) => {
    field.style.borderColor = "";
    field.removeAttribute("aria-invalid");
  });
}

// Modal Management
function showSuccessModal() {
  successModal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Focus management for accessibility
  const firstFocusable = successModal.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (firstFocusable) {
    firstFocusable.focus();
  }
}

function hideSuccessModal() {
  successModal.style.display = "none";
  document.body.style.overflow = "";
}

// Modal event listeners
if (closeModal) {
  closeModal.addEventListener("click", hideSuccessModal);
}

if (modalOk) {
  modalOk.addEventListener("click", hideSuccessModal);
}

// Close modal on outside click
if (successModal) {
  successModal.addEventListener("click", (e) => {
    if (e.target === successModal) {
      hideSuccessModal();
    }
  });
}

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && successModal.style.display === "block") {
    hideSuccessModal();
  }
});

// Animation Management
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".about-card, .service-card, .ministry-card, .contact-item"
  );
  animateElements.forEach((el) => {
    observer.observe(el);
  });
}

// Accessibility Features
function initializeAccessibility() {
  // Keyboard navigation for mobile menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isNavOpen) {
      toggleNavigation();
    }
  });

  // Skip to main content link
  const skipLink = document.createElement("a");
  skipLink.href = "#main";
  skipLink.textContent = "Skip to main content";
  skipLink.className = "skip-link";
  skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        z-index: 1001;
        transition: top 0.3s;
    `;

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "0";
  });

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main landmark
  const heroSection = document.getElementById("home");
  if (heroSection) {
    heroSection.setAttribute("role", "main");
    heroSection.id = "main";
  }

  // Improve form accessibility
  const formInputs = document.querySelectorAll("input, select, textarea");
  formInputs.forEach((input) => {
    if (
      !input.getAttribute("aria-label") &&
      !input.previousElementSibling?.tagName?.toLowerCase() === "label"
    ) {
      input.setAttribute("aria-label", input.placeholder || input.name);
    }
  });
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Performance optimized scroll handler
const handleScrollDebounced = debounce(handleScroll, 10);
window.removeEventListener("scroll", handleScroll);
window.addEventListener("scroll", handleScrollDebounced);

// Error Handling
window.addEventListener("error", (e) => {
  console.error("JavaScript Error:", e.error);
  // In production, you might want to send this to an error tracking service
});

// Service Worker Registration (for future PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Uncomment when you have a service worker
    // navigator.serviceWorker.register('/sw.js')
    //     .then(registration => console.log('SW registered'))
    //     .catch(error => console.log('SW registration failed'));
  });
}

// Analytics placeholder (replace with actual analytics code)
function trackEvent(category, action, label) {
  // Google Analytics 4 example:
  // gtag('event', action, {
  //     event_category: category,
  //     event_label: label
  // });
  console.log("Event tracked:", category, action, label);
}

// Track form submissions
if (contactForm) {
  contactForm.addEventListener("submit", () => {
    trackEvent("Contact", "Form Submit", "Contact Form");
  });
}

// Track theme changes
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    trackEvent("UI", "Theme Toggle", currentTheme);
  });
}

// Export functions for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateField,
    toggleTheme,
    handleFormSubmit,
  };
}
