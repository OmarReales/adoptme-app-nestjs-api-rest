// ===== ADOPTIONS API HANDLER =====

class AdoptionsAPI {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Handle adoption approval
    document.querySelectorAll('.approve-adoption').forEach((button) => {
      button.addEventListener('click', (e) => this.handleApproval(e));
    });

    // Handle adoption rejection
    document.querySelectorAll('.reject-adoption').forEach((button) => {
      button.addEventListener('click', (e) => this.handleRejection(e));
    });

    // Handle filter changes
    document
      .querySelectorAll('.form-select, .form-control')
      .forEach((input) => {
        input.addEventListener('change', (e) => this.handleFilterChange(e));
      });
  }

  async handleApproval(event) {
    const button = event.target.closest('.approve-adoption');
    const adoptionId = button.dataset.id;

    if (!confirm('¿Estás seguro de que quieres aprobar esta adopción?')) {
      return;
    }

    try {
      window.Loading.showButtonLoading(button, 'Aprobando...');

      const result = await window.api.call(`/adoptions/${adoptionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved',
          notes: 'Aprobado desde la interfaz web',
        }),
      });

      window.Notifications.success('¡Adopción aprobada exitosamente!');
      this.updateCardStatus(button, 'approved');

      // Reload page after short delay to show updated data
      setTimeout(() => location.reload(), 2000);
    } catch (error) {
      console.error('Error approving adoption:', error);
      window.Notifications.error(
        `Error al aprobar la adopción: ${error.message}`,
      );
      window.Loading.hideButtonLoading(button);
    }
  }

  async handleRejection(event) {
    const button = event.target.closest('.reject-adoption');
    const adoptionId = button.dataset.id;

    const reason = prompt('¿Cuál es la razón del rechazo?');
    if (!reason) return;

    try {
      window.Loading.showButtonLoading(button, 'Rechazando...');

      const result = await window.api.call(`/adoptions/${adoptionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'rejected',
          notes: reason,
        }),
      });

      window.Notifications.success('Adopción rechazada.');
      this.updateCardStatus(button, 'rejected');

      // Reload page after short delay to show updated data
      setTimeout(() => location.reload(), 2000);
    } catch (error) {
      console.error('Error rejecting adoption:', error);
      window.Notifications.error(
        `Error al rechazar la adopción: ${error.message}`,
      );
      window.Loading.hideButtonLoading(button);
    }
  }

  handleFilterChange(event) {
    const input = event.target;

    // Implement real-time filtering by reloading with new parameters
    if (input.form) {
      const formData = new FormData(input.form);
      const params = new URLSearchParams(formData);
      window.location.search = params.toString();
    }
  }

  updateCardStatus(button, status) {
    const card = button.closest('.card');
    const statusBadge = card.querySelector('.badge');

    if (statusBadge) {
      statusBadge.className = `badge bg-${status === 'approved' ? 'success' : 'danger'}`;
      statusBadge.textContent =
        status === 'approved' ? 'Aprobada' : 'Rechazada';
    }

    // Hide action buttons
    const btnGroup = button.closest('.btn-group');
    if (btnGroup) {
      btnGroup.style.display = 'none';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new AdoptionsAPI();
});
