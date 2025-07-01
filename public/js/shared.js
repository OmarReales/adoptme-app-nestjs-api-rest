// ===== SHARED UTILITIES FOR ADOPTME APP =====

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
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="flex-grow-1">${message}</span>
        <button type="button" class="close-btn" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add close functionality
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () =>
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

    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Position notifications
    this.repositionNotifications();
  }

  removeNotification(notification) {
    if (!notification.parentElement) return;

    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
        this.notifications = this.notifications.filter(
          (n) => n !== notification,
        );
        this.repositionNotifications();
      }
    }, 300);
  }

  repositionNotifications() {
    this.notifications.forEach((notification, index) => {
      if (notification.parentElement) {
        notification.style.top = `${20 + index * 80}px`;
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return { success: true, data, response };
    } catch (error) {
      return { success: false, error: error.message, originalError: error };
    }
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

// ===== INITIALIZE ON DOM LOAD =====
document.addEventListener('DOMContentLoaded', function () {
  // Initialize authentication check
  window.Auth.checkAuthStatus();
});

// ===== BACKWARDS COMPATIBILITY =====
// For compatibility with existing code
window.showNotification = function (message, type) {
  return window.Notifications.show(message, type);
};

window.showMessage = function (message, type) {
  return window.Notifications.show(message, type);
};

window.showSuccess = function (message) {
  return window.Notifications.success(message);
};

window.showError = function (message) {
  return window.Notifications.error(message);
};

window.showInfo = function (message) {
  return window.Notifications.info(message);
};

window.showWarning = function (message) {
  return window.Notifications.warning(message);
};

// Global loading functions for compatibility
window.showLoading = function (button, text) {
  return window.Loading.showLoading(button, text);
};

window.resetButton = function (button, originalText) {
  return window.Loading.resetButton(button, originalText);
};
