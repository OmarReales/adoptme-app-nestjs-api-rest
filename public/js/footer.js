// ===== FOOTER FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function () {
  initFooterAnimations();
  initNewsletterForm();
  initStatsCounter();
  initFooterLinks();
});

/**
 * Initialize footer animations
 */
function initFooterAnimations() {
  // Animate stats cards on scroll
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';

        // Trigger counter animation if it's a stat card
        if (entry.target.classList.contains('footer-stat-card')) {
          animateStatNumber(entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe footer elements
  document
    .querySelectorAll('.footer-stat-card, .footer-section')
    .forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
}

/**
 * Animate stat numbers with counting effect
 */
function animateStatNumber(card) {
  const numberElement = card.querySelector('.footer-stat-number');
  const targetText = numberElement.textContent.trim();

  // Only animate if it's a number
  const targetNumber = parseInt(targetText.replace(/[^\d]/g, ''));
  if (isNaN(targetNumber)) return;

  let current = 0;
  const increment = targetNumber / 30; // 30 frames for smooth animation
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetNumber) {
      current = targetNumber;
      clearInterval(timer);
    }
    numberElement.textContent = Math.floor(current).toString();
  }, 50);
}

/**
 * Initialize newsletter form functionality
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', handleNewsletterSubmit);
}

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const input = form.querySelector('.newsletter-input');
  const button = form.querySelector('.newsletter-btn');
  const email = input.value.trim();

  // Validate email
  if (!isValidEmail(email)) {
    showNewsletterMessage('Por favor, ingresa un email válido', 'error');
    return;
  }

  // Show loading state
  const originalButtonContent = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;
  input.disabled = true;

  try {
    // Simulate API call (replace with actual endpoint)
    await simulateNewsletterSubscription(email);

    // Success state
    showNewsletterMessage('¡Gracias! Te has suscrito exitosamente', 'success');
    form.reset();

    // Add success animation
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      button.innerHTML = originalButtonContent;
    }, 2000);
  } catch (error) {
    // Error state
    showNewsletterMessage(
      'Error al suscribirse. Inténtalo nuevamente',
      'error',
    );
    button.innerHTML = originalButtonContent;
  } finally {
    button.disabled = false;
    input.disabled = false;
  }
}

/**
 * Simulate newsletter subscription API call
 */
async function simulateNewsletterSubscription(email) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success most of the time
      if (Math.random() > 0.1) {
        resolve({ success: true });
      } else {
        reject(new Error('Simulated error'));
      }
    }, 1500);
  });
}

/**
 * Show newsletter subscription message
 */
function showNewsletterMessage(message, type) {
  // Remove existing message
  const existingMessage = document.querySelector('.newsletter-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageEl = document.createElement('div');
  messageEl.className = `newsletter-message alert alert-${type === 'error' ? 'danger' : 'success'} mt-2`;
  messageEl.style.fontSize = 'var(--font-size-sm)';
  messageEl.style.padding = 'var(--spacing-sm) var(--spacing-md)';
  messageEl.style.borderRadius = 'var(--border-radius-md)';
  messageEl.style.margin = 'var(--spacing-sm) 0 0 0';
  messageEl.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>
    ${message}
  `;

  // Insert after form
  const form = document.getElementById('newsletter-form');
  form.parentNode.insertBefore(messageEl, form.nextSibling);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 5000);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Initialize stats counter with real-time updates
 */
function initStatsCounter() {
  // Update stats every 30 seconds (for demo purposes)
  setInterval(updateFooterStats, 30000);
}

/**
 * Update footer statistics
 */
async function updateFooterStats() {
  try {
    // This would normally fetch from your API
    // For now, we'll just add small random increments for demo
    const statsElements = [
      { id: 'footer-total-pets', increment: Math.floor(Math.random() * 2) },
      {
        id: 'footer-total-adoptions',
        increment: Math.floor(Math.random() * 1),
      },
      { id: 'footer-total-users', increment: Math.floor(Math.random() * 3) },
    ];

    statsElements.forEach(({ id, increment }) => {
      const element = document.getElementById(id);
      if (element && increment > 0) {
        const currentValue = parseInt(element.textContent) || 0;
        const newValue = currentValue + increment;

        // Animate the change
        element.style.transform = 'scale(1.1)';
        element.style.color = 'var(--secondary-color)';

        setTimeout(() => {
          element.textContent = newValue;
          element.style.transform = 'scale(1)';
          element.style.color = '';
        }, 150);
      }
    });
  } catch (error) {
    console.log('Stats update failed:', error);
  }
}

/**
 * Initialize footer links with analytics tracking
 */
function initFooterLinks() {
  document.querySelectorAll('.footer-link').forEach((link) => {
    link.addEventListener('click', function (e) {
      // Track link clicks for analytics
      const linkText = this.textContent.trim();
      const linkHref = this.getAttribute('href');

      // You can send this data to your analytics service
      console.log('Footer link clicked:', { text: linkText, href: linkHref });

      // Add visual feedback
      this.style.transform = 'translateX(12px)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);
    });
  });

  // Initialize social media link tracking
  document.querySelectorAll('.social-link').forEach((link) => {
    link.addEventListener('click', function (e) {
      const platform = this.getAttribute('aria-label');
      console.log('Social link clicked:', platform);

      // Add pulse animation
      this.style.animation = 'pulse 0.3s ease';
      setTimeout(() => {
        this.style.animation = '';
      }, 300);
    });
  });
}

/**
 * Utility function for smooth scroll to top
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// Export functions for use in other scripts if needed
window.FooterUtils = {
  scrollToTop,
  updateFooterStats,
  showNewsletterMessage,
};
