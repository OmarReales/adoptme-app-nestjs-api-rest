/**
 * Profile page JavaScript functionality
 * Handles profile editing, password changes, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function () {
  initializeProfile();
});

function initializeProfile() {
  // Initialize tooltips
  initializeTooltips();

  // Initialize form handlers
  initializeEditProfileForm();
  initializeChangePasswordForm();

  // Initialize other interactive elements
  initializeDocumentActions();
  initializeAvatarUpload();
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Initialize edit profile form functionality
 */
function initializeEditProfileForm() {
  const editProfileForm = document.getElementById('editProfileForm');
  if (!editProfileForm) return;

  editProfileForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i>Guardando...';

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      // Clean empty fields
      Object.keys(data).forEach((key) => {
        if (data[key] === '') {
          delete data[key];
        }
      });

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Update UI with new data
        updateProfileUI(updatedUser);

        // Close modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById('editProfileModal'),
        );
        modal.hide();

        // Show success message
        showAlert('Perfil actualizado correctamente', 'success');

        // Refresh page after a short delay to reflect all changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert(error.message || 'Error al actualizar el perfil', 'danger');
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * Initialize change password form functionality
 */
function initializeChangePasswordForm() {
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (!changePasswordForm) return;

  // Password confirmation validation
  const newPasswordInput = changePasswordForm.querySelector('#newPassword');
  const confirmPasswordInput =
    changePasswordForm.querySelector('#confirmPassword');

  function validatePasswordMatch() {
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  }

  newPasswordInput.addEventListener('input', validatePasswordMatch);
  confirmPasswordInput.addEventListener('input', validatePasswordMatch);

  changePasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      // Validate password match
      if (newPasswordInput.value !== confirmPasswordInput.value) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i>Cambiando...';

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          password: data.newPassword,
        }),
      });

      if (response.ok) {
        // Close modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById('changePasswordModal'),
        );
        modal.hide();

        // Clear form
        this.reset();

        // Show success message
        showAlert('Contraseña cambiada correctamente', 'success');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert(error.message || 'Error al cambiar la contraseña', 'danger');
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * Initialize document-related actions
 */
function initializeDocumentActions() {
  const documentButtons = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]',
  );

  documentButtons.forEach((button) => {
    if (button.title === 'Descargar') {
      button.addEventListener('click', function () {
        // Handle document download
        console.log('Download document functionality would go here');
        showAlert('Función de descarga en desarrollo', 'info');
      });
    } else if (button.title === 'Eliminar') {
      button.addEventListener('click', function () {
        // Handle document deletion
        if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
          console.log('Delete document functionality would go here');
          showAlert('Función de eliminación en desarrollo', 'info');
        }
      });
    }
  });
}

/**
 * Initialize avatar upload functionality
 */
function initializeAvatarUpload() {
  const avatarButton = document.querySelector('.profile-avatar + button');
  if (!avatarButton) return;

  avatarButton.addEventListener('click', function () {
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        // Handle avatar upload
        console.log('Avatar upload functionality would go here');
        showAlert('Función de cambio de foto en desarrollo', 'info');
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  });
}

/**
 * Update profile UI with new data
 */
function updateProfileUI(userData) {
  // Update header information
  const headerName = document.querySelector('.card-body h2');
  if (headerName) {
    headerName.textContent = `${userData.firstName} ${userData.lastName}`;
  }

  // Update personal information fields
  const infoFields = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    age: `${userData.age} años`,
    phone: userData.phone || 'No especificado',
    address: userData.address || 'No especificada',
  };

  Object.keys(infoFields).forEach((field) => {
    const element = document.querySelector(`[data-field="${field}"]`);
    if (element) {
      element.textContent = infoFields[field];
    }
  });
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;

  const alertId = 'alert-' + Date.now();
  const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

  alertContainer.insertAdjacentHTML('beforeend', alertHtml);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alert = document.getElementById(alertId);
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }
  }, 5000);
}

/**
 * Get appropriate icon for alert type
 */
function getAlertIcon(type) {
  const icons = {
    success: 'check-circle',
    danger: 'exclamation-triangle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
  };
  return icons[type] || 'info-circle';
}

/**
 * Handle form validation styles
 */
function updateFormValidation(form, isValid) {
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    }
  });
}

/**
 * Utility function to format dates
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showAlert,
    updateProfileUI,
    formatDate,
  };
}
