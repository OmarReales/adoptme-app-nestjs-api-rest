# AdoptMe App - Inline Styles Reference

## Overview

This document serves as a reference for the inline styles used throughout the AdoptMe application after the CSS-to-inline conversion refactoring.

## Color Palette

- **Primary**: #6366f1 (Indigo)
- **Secondary**: #ec4899 (Pink)
- **Success**: #10b981 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #ef4444 (Red)
- **Gray Scale**:
  - Light: #f8f9fa
  - Medium: #6c757d
  - Dark: #1e293b

## Component Patterns

### Buttons

#### Primary Button

```html
style="background: #6366f1; color: white; padding: 1rem 2rem; border-radius:
1rem; text-decoration: none; font-weight: 600; transition: all 0.3s ease;
border: none;"
```

#### Outline Button

```html
style="background: transparent; color: #6366f1; border: 1px solid #6366f1;
padding: 0.75rem 1rem; border-radius: 0.5rem; text-decoration: none; transition:
all 0.3s ease;"
```

#### Small Button

```html
style="padding: 0.5rem 1rem; font-size: 0.875rem; border-radius: 0.5rem;"
```

### Cards

#### Basic Card

```html
style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px
rgba(0, 0, 0, 0.1); border: none; overflow: hidden;"
```

#### Card with Hover Effect

```html
style="transition: transform 0.3s ease, box-shadow 0.3s ease; background: white;
border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
```

### Form Elements

#### Input Field

```html
style="border-radius: 0.75rem; border: 2px solid #e5e7eb; padding: 0.75rem 1rem;
transition: all 0.3s ease;"
```

#### Label

```html
style="color: #374151; font-weight: 500; margin-bottom: 0.5rem; display: block;"
```

#### Required Field Indicator

```html
<span style="color: #dc3545;">*</span>
```

### Navigation

#### Navbar

```html
style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #1e293b
100%); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255,
0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); position: sticky; top: 0;
z-index: 1000;"
```

#### Nav Link

```html
style="color: rgba(255, 255, 255, 0.9); text-decoration: none; display: flex;
align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 0.5rem;
background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px
solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; font-weight: 500;"
```

### Status Badges

#### Available Status

```html
style="background: rgba(40, 167, 69, 0.9); color: white; padding: 5px 12px;
border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform:
uppercase;"
```

#### Adopted Status

```html
style="background: rgba(108, 117, 125, 0.9); color: white; padding: 5px 12px;
border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform:
uppercase;"
```

#### Pending Status

```html
style="background: rgba(255, 193, 7, 0.9); color: #212529; padding: 5px 12px;
border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform:
uppercase;"
```

### Layouts

#### Container

```html
style="padding: 3rem 0;"
```

#### Section Header

```html
style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg,
#6366f1 0%, #ec4899 100%); background-clip: text; -webkit-background-clip: text;
-webkit-text-fill-color: transparent; margin-bottom: 1rem;"
```

#### Breadcrumb

```html
style="display: flex; align-items: center; gap: 0.5rem; list-style: none;
padding: 0; margin: 0; font-size: 0.875rem;"
```

### Hover Effects (using CSS classes)

```css
.pet-card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.btn-hover:hover {
  background-color: #5a67d8 !important;
  color: white !important;
}

.btn-outline-hover:hover {
  background-color: #6366f1 !important;
  color: white !important;
}
```

## Animation Patterns

### Fade In On Scroll

Applied via JavaScript intersection observer:

```javascript
element.style.opacity = '0';
element.style.transform = 'translateY(20px)';
element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
```

### Counter Animation

Applied to stat numbers:

```javascript
function animateCounter(element) {
  const target = parseInt(element.textContent.replace(/\D/g, ''));
  // Animation logic...
}
```

## Grid Layouts

### Responsive Grid

```html
style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,
1fr)); gap: 15px; padding: 20px; background: #f8f9fa; border-radius: 10px;"
```

### Flex Layout

```html
style="display: flex; justify-content: space-between; align-items: center; gap:
1rem;"
```

## Image Handling

### Responsive Image

```html
style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s
ease;"
```

### Image Placeholder

```html
style="width: 100%; height: 100%; display: flex; align-items: center;
justify-content: center; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef
100%);"
```

## Notes for Future CSS Generation

1. Extract common patterns into utility classes
2. Use CSS custom properties for color values
3. Group related styles into component classes
4. Maintain responsive design principles
5. Preserve hover and interactive states
6. Keep accessibility considerations (focus states, etc.)

## File Changes Made

- Removed all CSS files from `public/css/`
- Converted all views to use inline styles
- Consolidated JavaScript functionality
- Removed duplicate animation code
- Simplified JavaScript files

## Converted Views

- ✅ layouts/main.hbs
- ✅ index.hbs (home page)
- ✅ auth/login.hbs
- ✅ auth/register.hbs
- ✅ partials/navbar.hbs
- ✅ partials/footer.hbs (already had inline styles)
- ✅ pets/index.hbs
- ✅ pets/detail.hbs
- ❌ pets/create.hbs (REMOVED - pet creation page deleted)
- ❌ adoptions/index.hbs (needs conversion)
- ❌ profile/index.hbs (needs conversion)

## JavaScript Files Status

- ✅ main.js - Core functionality and animations
- ✅ shared.js - Utility classes and global functions
- ✅ footer.js - Cleaned and optimized
- ✅ auth.js - Authentication UI, uses shared AuthHelper
- ✅ pets.js - Pet functionality, removed creation code
- ✅ adoptions.js - Uses shared notification and loading systems
- ✅ profile.js - Profile management functionality

## Code Cleanup Completed

- 🧹 Removed duplicate notification functions from footer.js
- 🧹 Updated all notification calls to use window.Notifications
- 🧹 Simplified compatibility functions in shared.js
- 🧹 Removed redundant authentication checks (uses shared AuthHelper)
- 🧹 Updated loading states to use shared LoadingHelper where appropriate
- 🧹 Eliminated unused getAuthToken() method
- 🧹 Consolidated all global utility functions in shared.js
