// ===== ADOPTME API - MAIN JS =====

document.addEventListener('DOMContentLoaded', function () {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize modals
  const modalTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="modal"]'),
  );
  modalTriggerList.map(function (modalTriggerEl) {
    return new bootstrap.Modal(modalTriggerEl);
  });

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

  // API Helper functions
  window.AdoptMeAPI = {
    baseURL: '/api',

    // Generic API call
    async call(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error en la petición');
        }

        return data;
      } catch (error) {
        console.error('API Error:', error);
        this.showAlert(error.message, 'danger');
        throw error;
      }
    },

    // Get pets
    async getPets(filters = {}) {
      const queryString = new URLSearchParams(filters).toString();
      return this.call(`/pets${queryString ? '?' + queryString : ''}`);
    },

    // Get adoptions
    async getAdoptions(filters = {}) {
      const queryString = new URLSearchParams(filters).toString();
      return this.call(`/adoptions${queryString ? '?' + queryString : ''}`);
    },

    // Get notifications
    async getNotifications(filters = {}) {
      const queryString = new URLSearchParams(filters).toString();
      return this.call(`/notifications${queryString ? '?' + queryString : ''}`);
    },

    // Show alert
    showAlert(message, type = 'info') {
      const alertHtml = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;

      const alertContainer = document.querySelector('.main-content');
      if (alertContainer) {
        alertContainer.insertAdjacentHTML('afterbegin', alertHtml);
      }
    },

    // Format date
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    // Format time ago
    timeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'hace un momento';
      if (diffInSeconds < 3600)
        return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
      if (diffInSeconds < 86400)
        return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
      if (diffInSeconds < 2592000)
        return `hace ${Math.floor(diffInSeconds / 86400)} días`;
      return this.formatDate(dateString);
    },
  };

  // Add some fun animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Animate cards on scroll
  document.querySelectorAll('.card, .stat-card').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  console.log('🐾 AdoptMe API Frontend initialized!');
});
