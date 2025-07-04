// ===== SHARED UTILITIES FOR ADOPTME APP =====

// ===== UTILITY FUNCTIONS =====
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ===== NOTIFICATION SYSTEM =====
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
  }

  show(message, type = 'info', duration = null) {
    const notification = this.createNotification(
      message,
      type,
      duration || this.defaultDuration,
    );
    this.addNotification(notification);
    return notification;
  }

  success(message, duration = null) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = null) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = null) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = null) {
    return this.show(message, 'info', duration);
  }

  createNotification(message, type, duration) {
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} alert-dismissible`;

    // Create elements safely to prevent XSS
    const container = document.createElement('div');
    container.className = 'd-flex align-items-center';

    const messageSpan = document.createElement('span');
    messageSpan.className = 'flex-grow-1';
    messageSpan.textContent = message; // Safe text content instead of innerHTML

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close-btn';
    closeButton.setAttribute('aria-label', 'Close');

    const closeIcon = document.createElement('i');
    closeIcon.className = 'fas fa-times';
    closeButton.appendChild(closeIcon);

    container.appendChild(messageSpan);
    container.appendChild(closeButton);
    notification.appendChild(container);

    // Add close functionality
    closeButton.addEventListener('click', () =>
      this.removeNotification(notification),
    );

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);

    return notification;
  }

  addNotification(notification) {
    // Remove oldest if at max capacity
    if (this.notifications.length >= this.maxNotifications) {
      this.removeNotification(this.notifications[0]);
    }

    // Add to DOM
    document.body.appendChild(notification);
    this.notifications.push(notification);

    // Set initial position and trigger animation
    this.repositionNotifications();

    // Use requestAnimationFrame for smoother animations
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  }

  removeNotification(notification) {
    if (!notification.parentElement) return;

    notification.classList.remove('show');

    // Use transition end event for better performance
    const handleTransitionEnd = () => {
      if (notification.parentElement) {
        notification.remove();
        this.notifications = this.notifications.filter(
          (n) => n !== notification,
        );
        this.repositionNotifications();
      }
      notification.removeEventListener('transitionend', handleTransitionEnd);
    };

    notification.addEventListener('transitionend', handleTransitionEnd);

    // Fallback in case transition doesn't fire
    setTimeout(handleTransitionEnd, 350);
  }

  repositionNotifications() {
    // Use transform instead of changing top property for better performance
    this.notifications.forEach((notification, index) => {
      if (notification.parentElement) {
        notification.style.transform = `translateY(${index * 80}px) translateX(${notification.classList.contains('show') ? '0' : '400px'})`;
      }
    });
  }

  clearAll() {
    this.notifications.forEach((notification) =>
      this.removeNotification(notification),
    );
  }
}

// ===== API HELPER CLASS =====
class APIHelper {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, finalOptions);

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Enhanced error handling with status codes
        const errorMessage =
          data.message || this.getStatusMessage(response.status);
        throw new Error(errorMessage);
      }

      return { success: true, data, response };
    } catch (error) {
      // Enhanced error logging and handling
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
        originalError: error,
        endpoint,
      };
    }
  }

  // Helper method to get user-friendly status messages
  getStatusMessage(status) {
    const statusMessages = {
      400: 'Solicitud inválida',
      401: 'No autorizado - inicia sesión',
      403: 'Acceso denegado',
      404: 'Recurso no encontrado',
      409: 'Conflicto con el estado actual',
      422: 'Datos de entrada inválidos',
      429: 'Demasiadas solicitudes - intenta más tarde',
      500: 'Error interno del servidor',
      502: 'Servidor no disponible',
      503: 'Servicio no disponible',
    };

    return statusMessages[status] || `Error HTTP: ${status}`;
  }

  // Simplified call method that directly returns data or throws on error
  async call(endpoint, options = {}) {
    const result = await this.request(endpoint, options);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(endpoint, formData, options = {}) {
    const uploadOptions = { ...options };
    delete uploadOptions.headers; // Let browser set Content-Type for FormData

    return this.request(endpoint, {
      ...uploadOptions,
      method: 'POST',
      body: formData,
    });
  }
}

// ===== AUTHENTICATION HELPER =====
class AuthHelper {
  constructor() {
    this.currentUser = null;
    this.authChecked = false;
  }

  async checkAuthStatus() {
    if (this.authChecked) return this.currentUser;

    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        this.currentUser = await response.json();
        this.authChecked = true;
        return this.currentUser;
      } else {
        this.currentUser = null;
        this.authChecked = true;
        return null;
      }
    } catch (error) {
      this.currentUser = null;
      this.authChecked = true;
      return null;
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  getUser() {
    return this.currentUser;
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      this.currentUser = null;
      this.authChecked = false;
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ===== LOADING HELPER =====
class LoadingHelper {
  static showButtonLoading(button, loadingText = 'Cargando...') {
    if (!button) return;

    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${loadingText}`;

    // Add card opacity effect if button is inside a card
    const card = button.closest('.card');
    if (card) card.style.opacity = '0.7';
  }

  static hideButtonLoading(button) {
    if (!button || !button.dataset.originalText) return;

    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;

    // Remove card opacity effect
    const card = button.closest('.card');
    if (card) card.style.opacity = '1';
  }

  // Alias for compatibility with existing code
  static showLoading(button, text) {
    return this.showButtonLoading(button, text);
  }

  static resetButton(button, originalText) {
    if (!button) return;

    button.disabled = false;
    button.innerHTML = originalText;

    // Remove card opacity effect
    const card = button.closest('.card');
    if (card) card.style.opacity = '1';
  }
}

// ===== FORM HELPER =====
class FormHelper {
  static validateForm(form) {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return false;
    }
    return true;
  }

  static getFormData(form) {
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (like checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  static clearForm(form) {
    form.reset();
    form.classList.remove('was-validated');

    // Clear custom validation messages
    form.querySelectorAll('.is-invalid').forEach((input) => {
      input.classList.remove('is-invalid');
    });
  }
}

// ===== GLOBAL INSTANCES =====
window.Notifications = new NotificationManager();
window.API = new APIHelper();
window.api = window.API; // Alias for convenience
window.Auth = new AuthHelper();
window.Loading = LoadingHelper;
window.Form = FormHelper;
window.debounce = debounce; // Make debounce available globally

// ===== INITIALIZE ON DOM LOAD =====
document.addEventListener('DOMContentLoaded', function () {
  // Initialize authentication check
  window.Auth.checkAuthStatus();
});

// ===== BACKWARDS COMPATIBILITY =====
// Essential compatibility functions - simplified
window.showSuccess = (message) => window.Notifications.success(message);
window.showError = (message) => window.Notifications.error(message);
window.showInfo = (message) => window.Notifications.info(message);
window.showWarning = (message) => window.Notifications.warning(message);
window.showNotification = (message, type) =>
  window.Notifications.show(message, type);
window.showMessage = (message, type) =>
  window.Notifications.show(message, type);

// Loading functions for compatibility
window.showLoading = (button, text) =>
  window.Loading.showButtonLoading(button, text);
window.resetButton = (button, originalText) =>
  window.Loading.hideButtonLoading(button);
