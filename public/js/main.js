// ===== ADOPTME API - MAIN JS =====

document.addEventListener('DOMContentLoaded', function () {
  // Initialize tooltips
  document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el));

  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Loading states for buttons
  document.querySelectorAll('.btn[data-loading]').forEach((btn) => {
    btn.addEventListener('click', function () {
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Cargando...';
      this.disabled = true;

      // Re-enable after 3 seconds (adjust as needed)
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
      }, 3000);
    });
  });

  // Add active class to current nav item
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Animation observer for scroll effects
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';

        // Animate stat numbers if present
        const statNumber = entry.target.querySelector(
          '.stat-number, .footer-stat-number',
        );
        if (statNumber) {
          animateCounter(statNumber);
        }
      }
    });
  }, observerOptions);

  // Apply animation to cards and elements
  document
    .querySelectorAll('.card, .stat-card, .footer-stat-card, .pet-card-hover')
    .forEach((element) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(element);
    });

  console.log('🐾 AdoptMe API Frontend initialized!');
});

// Unified counter animation function
function animateCounter(element) {
  const target = parseInt(element.textContent.replace(/\D/g, ''));
  if (isNaN(target)) return;

  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 40);
}
