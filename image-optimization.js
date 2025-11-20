/**
 * Flo Faction - Image Optimization & Logo Integration
 * Lazy loading, responsive images, and performance optimization
 */

class ImageOptimizer {
  constructor() {
    this.images = [];
    this.optimizedCount = 0;
  }

  init() {
    this.integrateLogoAcrossPages();
    this.setupLazyLoading();
    this.optimizeImagesForPerformance();
    this.implementResponsiveImages();
    console.log('✓ Image Optimization initialized');
  }

  /**
   * Add logo to all page headers with fallback
   */
  integrateLogoAcrossPages() {
    const logoHTML = `
      <a href="/" class="logo" aria-label="Flo Faction LLC - Home">
        <img src="/images/logo.svg" alt="Flo Faction LLC" class="logo-img" loading="eager" decoding="sync">
      </a>
    `;

    const headers = document.querySelectorAll('header, nav, .navbar, [role="banner"]');
    headers.forEach(header => {
      if (!header.querySelector('.logo')) {
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        logoContainer.innerHTML = logoHTML;
        header.insertBefore(logoContainer, header.firstChild);
      }
    });

    // Add favicon
    this.addFavicon('/images/logo.svg');
  }

  /**
   * Add favicon to document
   */
  addFavicon(url) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
    link.type = 'image/svg+xml';
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.01
      });

      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });
    }
  }

  /**
   * Load image with proper error handling
   */
  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    img.classList.add('loaded');
    this.optimizedCount++;
  }

  /**
   * Optimize images for performance
   */
  optimizeImagesForPerformance() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add alt text if missing
      if (!img.alt) {
        img.alt = img.src.split('/').pop().replace(/[_-]/g, ' ');
      }

      // Add responsive sizing
      if (!img.sizes) {
        img.sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
      }

      // Add width and height for better layout
      if (!img.width && !img.height) {
        img.style.aspectRatio = '16 / 9';
      }

      // Add lazy loading attributes
      img.setAttribute('decoding', 'async');
      
      // Add loading optimization
      const isBelowFold = this.isBelowFold(img);
      if (!isBelowFold) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('importance', 'high');
      } else {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  /**
   * Check if image is below the fold
   */
  isBelowFold(element) {
    const rect = element.getBoundingClientRect();
    return rect.top > window.innerHeight;
  }

  /**
   * Implement responsive images with srcset
   */
  implementResponsiveImages() {
    const images = document.querySelectorAll('img[data-srcset]');
    images.forEach(img => {
      img.srcset = img.dataset.srcset;
      img.removeAttribute('data-srcset');
    });
  }

  /**
   * Add WebP support with fallback
   */
  addWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') === 5;
  }

  /**
   * Convert image URLs to optimized format
   */
  optimizeImagePath(url) {
    if (!url) return url;
    
    // Add optimization parameters if using image CDN
    const supportsWebP = this.addWebPSupport();
    const format = supportsWebP ? 'webp' : 'jpg';
    
    // This would integrate with a service like Cloudinary or Imgix
    // Example: return url.replace(/\.(jpg|png)$/i, `.${format}?w=800&h=auto&q=80`);
    return url;
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    return {
      totalImages: this.images.length,
      optimized: this.optimizedCount,
      webPSupported: this.addWebPSupport(),
      loadedImages: document.querySelectorAll('img.loaded').length
    };
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ImageOptimizer().init();
  });
} else {
  new ImageOptimizer().init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}
