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

    // Handle filter changes with debouncing for better performance
    const searchInput = document.querySelector('#search');
    const speciesSelect = document.querySelector('#species');
    const ageSelect = document.querySelector('#age');
    const filterForm = document.querySelector('#filter-form');

    // Create debounced filter function for search input
    const debouncedFilter = debounce(() => this.handleFilterWithURL(), 300);

    if (searchInput) {
      searchInput.addEventListener('input', debouncedFilter);
    }

    if (speciesSelect) {
      speciesSelect.addEventListener('change', () =>
        this.handleFilterWithURL(),
      );
    }

    if (ageSelect) {
      ageSelect.addEventListener('change', () => this.handleFilterWithURL());
    }

    // Prevent form submission
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFilterWithURL();
      });
    }

    // Handle pagination clicks
    document.querySelectorAll('.pagination-link').forEach((link) => {
      link.addEventListener('click', (e) => this.handlePagination(e));
    });

    // Initialize filters from URL on page load
    this.initializeFiltersFromURL();
  }

  async handleAdoptionRequest(event) {
    event.preventDefault();
    const button = event.target.closest('.adopt-pet');
    const petId = button.dataset.petId;

    // Check if user is authenticated
    if (!Auth.isAuthenticated()) {
      window.Notifications.error(
        'Debes iniciar sesión para solicitar una adopción.',
      );
      return;
    }

    const notes = prompt('¿Por qué quieres adoptar a esta mascota? (Opcional)');

    try {
      showLoading(button, 'Enviando solicitud...');

      const response = await fetch('/api/adoptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

      window.Notifications.success(
        '¡Solicitud de adopción enviada exitosamente!',
      );
      this.updateButtonToRequested(button);
    } catch (error) {
      console.error('Error creating adoption request:', error);
      window.Notifications.error(
        `Error al enviar la solicitud: ${error.message}`,
      );
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
      window.Notifications.error('Debes iniciar sesión para marcar favoritos.');
      return;
    }

    try {
      // Call the favorites API endpoint
      await PetsAPI.handleFavoriteAPI(petId, isFavorited);
      // Update UI on success
      this.toggleFavoriteUI(button, !isFavorited);
    } catch (error) {
      // Error already handled in handleFavoriteAPI
    }
  }

  static async handleFavoriteAPI(petId, isCurrentlyFavorited) {
    try {
      const endpoint = `/pets/${petId}/like`;
      const method = isCurrentlyFavorited ? 'DELETE' : 'POST';

      const result = await window.API.request(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (result.success) {
        window.Notifications.success(
          result.data.message ||
            (isCurrentlyFavorited
              ? 'Eliminado de favoritos'
              : 'Agregado a favoritos'),
        );
        return result.data;
      } else {
        window.Notifications.error(
          result.error || 'Error al actualizar favoritos',
        );
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error with favorites API:', error);
      window.Notifications.error('Error al actualizar favoritos');
      throw error;
    }
  }

  initializeFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    // Set filter values from URL
    const searchInput = document.querySelector('#search');
    const speciesSelect = document.querySelector('#species');
    const ageSelect = document.querySelector('#age');

    if (searchInput && urlParams.has('name')) {
      searchInput.value = urlParams.get('name');
    }

    if (speciesSelect && urlParams.has('species')) {
      speciesSelect.value = urlParams.get('species');
    }

    if (ageSelect && urlParams.has('ageRange')) {
      ageSelect.value = urlParams.get('ageRange');
    }
  }

  handleFilterWithURL() {
    const searchTerm = document.querySelector('#search')?.value || '';
    const selectedSpecies = document.querySelector('#species')?.value || '';
    const selectedAge = document.querySelector('#age')?.value || '';

    // Build URL with filters (reset to page 1 when filtering)
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', '24');

    if (searchTerm) {
      params.set('name', searchTerm);
    }

    if (selectedSpecies) {
      params.set('species', selectedSpecies);
    }

    if (selectedAge) {
      params.set('ageRange', selectedAge);
    }

    // Navigate to filtered page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.location.href = newUrl;
  }

  handlePagination(event) {
    event.preventDefault();
    const page = event.target.closest('a').dataset.page;

    if (!page) return;

    // Get current filters from URL
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('page', page);
    urlParams.set('limit', '24');

    // Navigate to new page with same filters
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.location.href = newUrl;
  }

  updateButtonToRequested(button) {
    button.disabled = true;
    button.className = 'btn btn-secondary btn-sm';
    button.innerHTML = '<i class="fas fa-clock me-1"></i>Solicitud Enviada';
  }

  resetButton(button, originalContent) {
    button.disabled = false;
    button.className = 'btn btn-primary btn-sm adopt-pet';
    button.innerHTML = originalContent;
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
        window.Notifications.success('Enlace copiado al portapapeles');
      });
    }
  }

  addToFavorites(event) {
    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    const petId = button.dataset.petId;

    // Check if user is authenticated before allowing favorites
    if (!Auth.isAuthenticated()) {
      window.Notifications.error('Debes iniciar sesión para guardar favoritos');
      return;
    }

    // Call API to add to favorites (assuming not favorited yet)
    PetsAPI.handleFavoriteAPI(petId, false)
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
});
