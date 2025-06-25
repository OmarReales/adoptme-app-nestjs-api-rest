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
      showLoading(button, 'Aprobando...');

      const result = await window.api.call(`/adoptions/${adoptionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved',
          notes: 'Aprobado desde la interfaz web',
        }),
      });

      showSuccess('¡Adopción aprobada exitosamente!');
      this.updateCardStatus(button, 'approved');

      // Reload page after short delay to show updated data
      setTimeout(() => location.reload(), 2000);
    } catch (error) {
      console.error('Error approving adoption:', error);
      showError(`Error al aprobar la adopción: ${error.message}`);
      resetButton(button, '<i class="fas fa-check me-1"></i>Aprobar');
    }
  }

  async handleRejection(event) {
    const button = event.target.closest('.reject-adoption');
    const adoptionId = button.dataset.id;

    const reason = prompt('¿Cuál es la razón del rechazo?');
    if (!reason) return;

    try {
      showLoading(button, 'Rechazando...');

      const result = await window.api.call(`/adoptions/${adoptionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'rejected',
          notes: reason,
        }),
      });

      showSuccess('Adopción rechazada.');
      this.updateCardStatus(button, 'rejected');

      // Reload page after short delay to show updated data
      setTimeout(() => location.reload(), 2000);
    } catch (error) {
      console.error('Error rejecting adoption:', error);
      showError(`Error al rechazar la adopción: ${error.message}`);
      resetButton(button, '<i class="fas fa-times me-1"></i>Rechazar');
    }
  }

  handleFilterChange(event) {
    const input = event.target;

    // TODO: Implement real-time filtering
    // For now, we'll submit the form or reload with new parameters
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

  // TODO: Implement when authentication is added
  getAuthToken() {
    return (
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new AdoptionsAPI();
});
