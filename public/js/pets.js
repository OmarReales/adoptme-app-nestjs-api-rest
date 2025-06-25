// ===== PETS API HANDLER =====

class PetsAPI {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Handle pet adoption requests
    document.querySelectorAll('.adopt-pet').forEach((button) => {
      button.addEventListener('click', (e) => this.handleAdoptionRequest(e));
    });

    // Handle pet favorites
    document.querySelectorAll('.favorite-pet').forEach((button) => {
      button.addEventListener('click', (e) => this.handleFavorite(e));
    });

    // Handle filter changes
    document
      .querySelectorAll('.form-select, .form-control')
      .forEach((input) => {
        input.addEventListener('change', (e) => this.handleFilterChange(e));
      });

    // Handle search
    const searchForm = document.querySelector('#pet-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => this.handleSearch(e));
    }
  }

  async handleAdoptionRequest(event) {
    event.preventDefault();
    const button = event.target.closest('.adopt-pet');
    const petId = button.dataset.petId;

    // TODO: Check if user is authenticated
    if (!Auth.isAuthenticated()) {
      showError('Debes iniciar sesión para solicitar una adopción.');
      // TODO: Redirect to login page
      return;
    }

    const notes = prompt('¿Por qué quieres adoptar a esta mascota? (Opcional)');

    try {
      showLoading(button, 'Enviando solicitud...');

      const response = await fetch('/api/adoptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add JWT token when auth is implemented
          // 'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          pet: petId,
          notes: notes || '',
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Debes iniciar sesión para solicitar una adopción.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      showSuccess('¡Solicitud de adopción enviada exitosamente!');
      this.updateButtonToRequested(button);
    } catch (error) {
      console.error('Error creating adoption request:', error);
      showError(`Error al enviar la solicitud: ${error.message}`);
      this.resetButton(button, '<i class="fas fa-heart me-1"></i>Adoptar');
    }
  }

  async handleFavorite(event) {
    event.preventDefault();
    const button = event.target.closest('.favorite-pet');
    const petId = button.dataset.petId;
    const isFavorited = button.classList.contains('favorited');

    // Check if user is authenticated
    if (!Auth.isAuthenticated()) {
      showError('Debes iniciar sesión para marcar favoritos.');
      return;
    }

    try {
      // Call the favorites API endpoint
      await this.handleFavoriteAPI(petId, isFavorited);
      // Update UI on success
      this.toggleFavoriteUI(button, !isFavorited);
    } catch (error) {
      // Error already handled in handleFavoriteAPI
    }
  }

  async handleFavoriteAPI(petId, isCurrentlyFavorited) {
    try {
      const endpoint = `/pets/${petId}/like`;
      const method = isCurrentlyFavorited ? 'DELETE' : 'POST';

      const response = await window.api.call(endpoint, null, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(
          data.message ||
            (isCurrentlyFavorited
              ? 'Eliminado de favoritos'
              : 'Agregado a favoritos'),
        );
        return data;
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Error al actualizar favoritos');
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error with favorites API:', error);
      showError('Error al actualizar favoritos');
      throw error;
    }
  }

  handleFilterChange(event) {
    const input = event.target;

    // Build URL with filters
    const form = input.closest('form');
    if (form) {
      const formData = new FormData(form);
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        if (value) {
          params.append(key, value);
        }
      }

      // Update URL without page reload for better UX
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);

      // TODO: Load filtered results via AJAX instead of page reload
      window.location.reload();
    }
  }

  handleSearch(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const searchTerm = formData.get('search');

    if (searchTerm) {
      const params = new URLSearchParams({ search: searchTerm });
      window.location.href = `${window.location.pathname}?${params.toString()}`;
    }
  }

  updateButtonToRequested(button) {
    button.disabled = true;
    button.className = 'btn btn-secondary btn-sm';
    button.innerHTML = '<i class="fas fa-clock me-1"></i>Solicitud Enviada';
  }

  toggleFavoriteUI(button, isFavorited) {
    const icon = button.querySelector('i');

    if (isFavorited) {
      button.classList.add('favorited');
      icon.className = 'fas fa-heart';
      button.title = 'Quitar de favoritos';
    } else {
      button.classList.remove('favorited');
      icon.className = 'far fa-heart';
      button.title = 'Agregar a favoritos';
    }
  }
}

// ===== PET DETAIL FUNCTIONALITY =====

class PetDetail {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.initTabs();
  }

  bindEvents() {
    // Share pet functionality
    const shareBtn = document.querySelector('.share-pet-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', this.sharePet.bind(this));
    }

    // Favorite pet functionality
    const favoriteBtn = document.querySelector('.favorite-pet-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', this.addToFavorites.bind(this));
    }
  }

  sharePet() {
    if (navigator.share) {
      const petName =
        document.querySelector('.pet-name')?.textContent || 'Esta mascota';
      navigator.share({
        title: `${petName} - AdoptMe`,
        text: `¡Mira a ${petName}! Esta hermosa mascota está buscando un hogar.`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        showSuccess('Enlace copiado al portapapeles');
      });
    }
  }

  addToFavorites(event) {
    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    const petId = button.dataset.petId;

    // Check if user is authenticated before allowing favorites
    if (!Auth.isAuthenticated()) {
      showError('Debes iniciar sesión para guardar favoritos');
      return;
    }

    // Call API to add to favorites (assuming not favorited yet)
    this.handleFavoriteAPI(petId, false)
      .then(() => {
        // Visual feedback on success
        if (icon.classList.contains('fas')) {
          icon.classList.remove('fas');
          icon.classList.add('far');
          button.innerHTML = '<i class="far fa-bookmark me-2"></i>Guardado';
        } else {
          icon.classList.remove('far');
          icon.classList.add('fas');
          button.innerHTML = '<i class="fas fa-bookmark me-2"></i>Guardar';
        }
      })
      .catch(() => {
        // Error already handled in handleFavoriteAPI
      });
  }

  initTabs() {
    // Initialize Bootstrap tabs
    const tabTriggerList = [].slice.call(
      document.querySelectorAll('#petTabs button'),
    );
    tabTriggerList.forEach(function (tabTriggerEl) {
      new bootstrap.Tab(tabTriggerEl);
    });
  }
}

// ===== PET CREATION FUNCTIONALITY =====

class PetCreation {
  constructor() {
    this.selectedFiles = [];
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const form = document.getElementById('createPetForm');
    const imagesInput = document.getElementById('images');

    if (!form || !imagesInput) return;

    // Image preview functionality
    imagesInput.addEventListener('change', this.handleImageChange.bind(this));

    // Form submission
    form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  handleImageChange(e) {
    const files = Array.from(e.target.files);
    this.selectedFiles = files;
    this.displayImagePreviews();
  }

  displayImagePreviews() {
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return;

    imagePreview.innerHTML = '';

    this.selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.innerHTML = `
          <img src="${e.target.result}" class="image-preview-img" alt="Preview">
          <button type="button" class="image-remove-btn" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        `;

        // Add remove functionality
        const removeBtn = previewItem.querySelector('.image-remove-btn');
        removeBtn.addEventListener('click', () => this.removeImage(index));

        imagePreview.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index) {
    this.selectedFiles.splice(index, 1);
    this.displayImagePreviews();

    // Update the file input
    const dt = new DataTransfer();
    this.selectedFiles.forEach((file) => dt.items.add(file));
    document.getElementById('images').files = dt.files;
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const spinner = submitBtn.querySelector('.spinner-border');

    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    // Prepare form data
    const formData = new FormData();

    // Basic information
    formData.append('name', document.getElementById('name').value);
    formData.append('species', document.getElementById('species').value);
    formData.append('age', document.getElementById('age').value);
    formData.append('gender', document.getElementById('gender').value);
    formData.append('weight', document.getElementById('weight').value);
    formData.append(
      'description',
      document.getElementById('description').value,
    );

    // Characteristics
    const characteristics = [];
    document
      .querySelectorAll('input[name="characteristics"]:checked')
      .forEach((checkbox) => {
        characteristics.push(checkbox.value);
      });
    formData.append('characteristics', JSON.stringify(characteristics));

    // Health information
    const healthInfo = {
      vaccinated: document.getElementById('vaccinated').checked,
      sterilized: document.getElementById('sterilized').checked,
      dewormed: document.getElementById('dewormed').checked,
      notes: document.getElementById('healthNotes').value,
    };
    formData.append('healthInfo', JSON.stringify(healthInfo));

    // Contact information
    formData.append(
      'contactName',
      document.getElementById('contactName').value,
    );
    formData.append(
      'contactEmail',
      document.getElementById('contactEmail').value,
    );
    formData.append(
      'contactPhone',
      document.getElementById('contactPhone').value,
    );
    formData.append('location', document.getElementById('location').value);

    // Images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Submit to API
    fetch('/api/pets', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Show success message
          showSuccess('¡Mascota publicada exitosamente!');

          // Redirect to pet detail page after a short delay
          setTimeout(() => {
            window.location.href = `/pets/${data.pet._id}`;
          }, 2000);
        } else {
          throw new Error(data.message || 'Error al crear la mascota');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        showError('Error al publicar la mascota. Inténtalo de nuevo.');
      })
      .finally(() => {
        // Hide loading state
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
      });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new PetsAPI();

  // Initialize pet detail functionality if on detail page
  if (
    document.querySelector('#petTabs') ||
    document.querySelector('.pet-detail-container')
  ) {
    new PetDetail();
  }

  // Initialize pet creation functionality if on create page
  if (document.getElementById('createPetForm')) {
    new PetCreation();
  }
});
