// ===== FOOTER FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function () {
  initNewsletterForm();
  initFooterLinks();
});

/**
 * Initialize newsletter subscription form
 */
function initNewsletterForm() {
  const form = document.querySelector('#newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!emailInput || !submitBtn) return;

    const email = emailInput.value.trim();

    if (!email) {
      window.Notifications.error('Por favor, ingresa tu email');
      return;
    }

    // Save original button state
    const originalText = submitBtn.innerHTML;

    try {
      // Show loading state
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Suscribiendo...';
      submitBtn.disabled = true;

      // Simulate API call (replace with actual endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success
      window.Notifications.success('¡Te has suscrito exitosamente!');
      emailInput.value = '';
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      window.Notifications.error('Error al suscribirse. Inténtalo de nuevo.');
    } finally {
      // Restore button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/**
 * Initialize footer links and interactions
 */
function initFooterLinks() {
  // Social media link tracking
  document.querySelectorAll('.social-link').forEach((link) => {
    link.addEventListener('click', function (e) {
      const platform = this.getAttribute('data-platform');
      if (platform) {
        console.log(`Social link clicked: ${platform}`);
        // Add analytics tracking here if needed
      }
    });
  });

  // Quick link interactions
  document.querySelectorAll('.quick-link').forEach((link) => {
    link.addEventListener('click', function () {
      console.log(`Quick link clicked: ${this.textContent}`);
      // Add analytics tracking here if needed
    });
  });
}
