// ===== HOME PAGE ENHANCEMENTS =====

class HomePageAPI {
  constructor() {
    this.init();
  }

  init() {
    this.loadRealtimeStats();
    this.bindEvents();
    this.startStatsRefresh();
  }

  bindEvents() {
    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach((button) => {
      button.addEventListener('click', (e) => this.handleQuickAction(e));
    });

    // Stats refresh button
    const refreshBtn = document.querySelector('.refresh-stats');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => this.refreshStats(e));
    }
  }

  async loadRealtimeStats() {
    try {
      // Load real stats from API endpoint
      const response = await window.api.call('/stats');
      if (response.ok) {
        const stats = await response.json();
        this.updateStatsDisplay(stats);
      }

      // Animate the counters regardless of API success
      this.animateStatsCounters();
    } catch (error) {
      console.error('Error loading stats:', error);
      // Still animate existing counters on error
      this.animateStatsCounters();
    }
  }

  animateStatsCounters() {
    document.querySelectorAll('.stat-number').forEach((counter) => {
      const target = parseInt(counter.textContent);
      let current = 0;
      const increment = target / 50; // Animate over 50 steps
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 30);
    });
  }

  async refreshStats(event) {
    event.preventDefault();
    const button = event.target.closest('.refresh-stats');
    const originalIcon = button.innerHTML;

    try {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      button.disabled = true;

      // Reload the page to get fresh stats
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error refreshing stats:', error);
      button.innerHTML = originalIcon;
      button.disabled = false;
    }
  }

  handleQuickAction(event) {
    const button = event.target.closest('.quick-action-btn');
    const action = button.dataset.action;

    switch (action) {
      case 'view-pets':
        window.location.href = '/view-pets';
        break;
      case 'view-adoptions':
        window.location.href = '/view-adoptions';
        break;
      case 'add-pet':
        showInfo('Funcionalidad de agregar mascota próximamente disponible');
        break;
      case 'generate-data':
        this.handleGenerateData();
        break;
      default:
        // Unknown action - ignore silently
        break;
    }
  }

  async handleGenerateData() {
    if (
      !confirm(
        '¿Quieres generar datos de prueba? Esto creará mascotas y usuarios ficticios.',
      )
    ) {
      return;
    }

    try {
      const response = await window.api.call('/mocking/generatedata', {
        method: 'POST',
        body: JSON.stringify({
          users: 10,
          pets: 20,
        }),
      });

      showSuccess(
        `Datos generados: ${response.summary.usersGenerated} usuarios y ${response.summary.petsGenerated} mascotas`,
      );

      // Refresh stats after generating data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error generating data:', error);
      showError(`Error al generar datos: ${error.message}`);
    }
  }

  startStatsRefresh() {
    // Auto-refresh stats every 30 seconds
    setInterval(() => {
      this.loadRealtimeStats();
    }, 30000);
  }

  updateStatsDisplay(stats) {
    // Update DOM elements with new stats
    const elements = {
      'total-pets': stats.totalPets,
      'total-adoptions': stats.totalAdoptions,
      'total-users': stats.totalUsers,
      'total-notifications': stats.totalNotifications,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new HomePageAPI();
});
