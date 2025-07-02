// Simple authentication for AdoptMe App using sessions
document.addEventListener('DOMContentLoaded', function () {
  // Check if user is authenticated on page load
  checkAuthStatus();

  // Bind form events
  bindLoginForm();
  bindRegisterForm();
  bindPasswordToggles();
  initPasswordStrengthChecker();
  initConfirmPasswordValidation();
  bindLogoutButton();
});

// Check authentication status and update UI
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/profile', {
      credentials: 'include', // Important for cookies
    });

    if (response.ok) {
      const user = await response.json();
      updateUIForAuthenticatedUser(user);
    } else {
      updateUIForUnauthenticatedUser();
    }
  } catch (error) {
    // User not authenticated - this is expected for non-protected pages
    updateUIForUnauthenticatedUser();
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  // Hide auth buttons
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) authButtons.style.display = 'none';

  // Show user info
  const userInfo = document.querySelector('.user-info');
  if (userInfo) {
    userInfo.style.display = 'block';

    // Update user details in navbar
    const userNameDisplay = document.querySelector('.user-name-display');
    const userFullName = document.querySelector('.user-full-name');
    const userRoleBadge = document.querySelector('.user-role-badge');

    if (userNameDisplay) {
      // Show username or first name if available
      userNameDisplay.textContent =
        user.firstName || user.username || 'Usuario';
    }

    if (userFullName) {
      // Construct full name safely
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      userFullName.textContent = fullName || user.username || 'Usuario';
    }

    if (userRoleBadge) {
      userRoleBadge.textContent = user.role || 'user';
      userRoleBadge.className = `text-muted user-role-badge badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`;
    }
  }

  // Show protected elements
  document
    .querySelectorAll('.protected')
    .forEach((el) => (el.style.display = 'block'));

  // Handle admin elements based on user role
  const adminElements = document.querySelectorAll('.admin-only');
  if (user.role === 'admin') {
    adminElements.forEach((el) => (el.style.display = 'block'));
  } else {
    adminElements.forEach((el) => (el.style.display = 'none'));
  }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  // Show auth buttons
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) authButtons.style.display = 'flex';

  // Hide user info
  const userInfo = document.querySelector('.user-info');
  if (userInfo) userInfo.style.display = 'none';

  // Hide protected elements
  document
    .querySelectorAll('.protected')
    .forEach((el) => (el.style.display = 'none'));
  document
    .querySelectorAll('.admin-only')
    .forEach((el) => (el.style.display = 'none'));
}

// Bind login form
function bindLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Ingresando...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('¡Login exitoso! Redirigiendo...');
        setTimeout(() => (window.location.href = '/'), 1500);
      } else {
        showError(data.message || 'Error en el login');
      }
    } catch (error) {
      showError('Error de conexión');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
}

// Bind register form
function bindRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const userData = {
      userName: formData.get('userName'),
      firstName: formData.get('firstName'), // Backend expects 'firstname'
      lastName: formData.get('lastName'), // Backend expects 'lastname'
      email: formData.get('email'),
      password: formData.get('password'),
      age: parseInt(formData.get('age')),
      role: 'user',
    };

    // Validate password confirmation
    if (userData.password !== formData.get('confirmPassword')) {
      showError('Las contraseñas no coinciden');
      return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => (window.location.href = '/'), 1500);
      } else {
        showError(data.message || 'Error en el registro');
        console.error('❌ Error en registro:', data);
      }
    } catch (error) {
      console.error('❌ Error de conexión en registro:', error);
      showError('Error de conexión');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
}

// Logout function
async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    showInfo('Sesión cerrada correctamente');
    setTimeout(() => (window.location.href = '/'), 1000);
  } catch (error) {
    showError('Error al cerrar sesión');
  }
}

// Bind password toggles
function bindPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      const icon = this.querySelector('i');

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
      } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
      }
    });
  });
}

// Password strength checker and validation
function initPasswordStrengthChecker() {
  const passwordInput = document.getElementById('password');
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');

  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', function () {
      const password = this.value;
      const strength = checkPasswordStrength(password);
      updatePasswordStrengthUI(strength);
    });
  }
}

function initConfirmPasswordValidation() {
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', function () {
      const password = passwordInput.value;
      const confirmPassword = this.value;

      if (confirmPassword && password !== confirmPassword) {
        this.setCustomValidity('Las contraseñas no coinciden');
        this.classList.add('is-invalid');
      } else {
        this.setCustomValidity('');
        this.classList.remove('is-invalid');
      }
    });
  }
}

function checkPasswordStrength(password) {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score++;
  else feedback.push('al menos 8 caracteres');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('minúsculas');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('mayúsculas');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('números');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('símbolos');

  return { score, feedback };
}

function updatePasswordStrengthUI(strength) {
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');

  if (!strengthBar || !strengthText) return;

  // Remove existing strength classes
  strengthBar.className = 'strength-bar';

  let strengthClass = '';
  let strengthMessage = '';

  switch (strength.score) {
    case 0:
    case 1:
      strengthClass = 'strength-weak';
      strengthMessage =
        'Contraseña muy débil. Necesita: ' + strength.feedback.join(', ');
      break;
    case 2:
      strengthClass = 'strength-fair';
      strengthMessage =
        'Contraseña débil. Mejorar: ' + strength.feedback.join(', ');
      break;
    case 3:
      strengthClass = 'strength-good';
      strengthMessage =
        'Contraseña aceptable. Agregar: ' + strength.feedback.join(', ');
      break;
    case 4:
      strengthClass = 'strength-good';
      strengthMessage =
        'Contraseña buena. Agregar: ' + strength.feedback.join(', ');
      break;
    case 5:
      strengthClass = 'strength-strong';
      strengthMessage = 'Contraseña muy segura';
      break;
  }

  strengthBar.classList.add(strengthClass);
  strengthText.textContent = strengthMessage;
  strengthText.className = `strength-text ${strength.score >= 4 ? 'text-success' : strength.score >= 2 ? 'text-warning' : 'text-danger'}`;
}

// Demo credentials helper
function fillDemoCredentials(email, password) {
  document.getElementById('email').value = email;
  document.getElementById('password').value = password;
}

// Bind logout button
function bindLogoutButton() {
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

// Make functions available globally for backward compatibility
window.logout = logout;
window.fillDemoCredentials = fillDemoCredentials;
