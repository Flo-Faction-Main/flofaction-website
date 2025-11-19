// Product Database with Limited Time Discounts
const products = [
  // MUSIC & BEATS
  {
    id: 'music-001',
    name: 'Royalty-Free Beat Pack Vol. 1',
    category: 'music',
    price: 49.99,
    description: 'High-quality royalty-free beats perfect for YouTube, TikTok, and commercial projects. 25 unique tracks.',
    icon: '🎵',
    badge: 'Premium'
  },
  {
    id: 'music-002',
    name: 'Hip-Hop & Trap Beats Collection',
    category: 'music',
    price: 39.99,
    description: '20 premium hip-hop and trap beats ready for your projects. License included.',
    icon: '🎤',
    badge: 'Premium'
  },
  {
    id: 'music-003',
    name: 'Ambient & Chill Background Music',
    category: 'music',
    price: 29.99,
    description: '15 perfect background tracks for podcasts, videos, and streams.',
    icon: '🎧',
    badge: 'Premium'
  },
  // GUIDES - PREMIUM WITH LIMITED TIME DISCOUNT
  {
    id: 'guide-001',
    name: 'Comprehensive Retirement Planning Guide',
    category: 'guides',
    price: 97.00,
    originalPrice: 197.00,
    discount: 100.00,
    discountPercent: 51,
    isDiscounted: true,
    description: 'Complete 200+ page guide covering retirement strategies, tax optimization, and investment planning. Lifetime access.',
    icon: '📚',
    badge: 'Premium - Save $100'
  },
  {
    id: 'guide-002',
    name: 'Emergency Management & Disaster Preparedness',
    category: 'guides',
    price: 87.00,
    originalPrice: 177.00,
    discount: 90.00,
    discountPercent: 51,
    isDiscounted: true,
    description: 'In-depth guide for personal and family emergency preparedness. 180+ pages with checklists and templates.',
    icon: '🛡️',
    badge: 'Premium - Save $90'
  },
  // GUIDES - FREE
  {
    id: 'guide-003',
    name: 'FREE: Retirement Planning Quick Start',
    category: 'free',
    price: 0,
    description: 'Free 50-page introduction to retirement planning. Upgrade to comprehensive version for $97.',
    icon: '📄',
    badge: 'FREE'
  },
  {
    id: 'guide-004',
    name: 'FREE: Emergency Preparedness Basics',
    category: 'free',
    price: 0,
    description: 'Free 40-page emergency preparedness guide. Access full 180-page version for $87.',
    icon: '📋',
    badge: 'FREE'
  }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  displayProducts(products);
  updateCartCount();
});

// Display products in grid with discount styling
function displayProducts(productsToDisplay) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  
  productsToDisplay.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Build pricing display
    let priceHtml = '';
    if (product.isDiscounted) {
      priceHtml = `
        <div class="product-price">
          <div class="price-discount-container">
            <div class="discount-badge">⏰ Limited Time Offer</div>
            <div class="price-breakdown">
              <span class="price-original">Original: $${product.originalPrice.toFixed(2)}</span>
              <span class="discount-amount">Save $${product.discount.toFixed(2)} (${product.discountPercent}% off)</span>
            </div>
            <span class="price-current">Now: $${product.price.toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (product.price === 0) {
      priceHtml = `
        <div class="product-price">
          <span class="price-current" style="color: #51cf66; font-size: 1.5rem;">FREE</span>
        </div>
      `;
    } else {
      priceHtml = `
        <div class="product-price">
          <span class="price-current">$${product.price.toFixed(2)}</span>
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="product-image">${product.icon}</div>
      <div class="product-content">
        <span class="product-badge${product.badge.includes('FREE') ? ' free' : ''}">${product.badge}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        ${priceHtml}
        <div class="product-footer">
          <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
          <button class="btn btn-secondary" onclick="showProductDetails('${product.id}')">Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Filter products
function filterProducts() {
  const category = document.getElementById('category-filter').value;
  let filtered = products;
  
  if (category !== 'all') {
    filtered = products.filter(p => p.category === category);
  }
  
  displayProducts(filtered);
}

// Sort products
function sortProducts() {
  const sort = document.getElementById('sort-filter').value;
  let sorted = [...products];
  
  if (sort === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'price-low') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    sorted.sort((a, b) => b.price - a.price);
  }
  
  displayProducts(sorted);
}

// Show product details with discount info
function showProductDetails(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('modal-body');
  
  // Build pricing display for modal
  let priceHtml = '';
  if (product.isDiscounted) {
    priceHtml = `
      <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-radius: 10px; border: 2px solid #667eea;">
        <div style="font-size: 0.9rem; color: #ff6b6b; font-weight: bold; margin-bottom: 10px;">⏰ LIMITED TIME OFFER</div>
        <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">Original Price: <span style="text-decoration: line-through;">$${product.originalPrice.toFixed(2)}</span></div>
        <div style="font-size: 0.9rem; color: #51cf66; font-weight: bold; margin-bottom: 10px;">You Save: $${product.discount.toFixed(2)} (${product.discountPercent}% off)</div>
        <div style="font-size: 1.5rem; color: #667eea; font-weight: bold;">Final Price: $${product.price.toFixed(2)}</div>
      </div>
    `;
  } else if (product.price === 0) {
    priceHtml = `<p style="font-size: 1.5rem; color: #51cf66; font-weight: bold; margin: 20px 0;">FREE DOWNLOAD</p>`;
  } else {
    priceHtml = `<p style="font-size: 1.2rem; color: #667eea; font-weight: bold; margin: 20px 0;">$${product.price.toFixed(2)}</p>`;
  }
  
  modalBody.innerHTML = `
    <div style="text-align: center; font-size: 4rem; margin-bottom: 20px;">${product.icon}</div>
    <h2>${product.name}</h2>
    ${priceHtml}
    <p>${product.description}</p>
    <div style="margin-top: 30px; display: flex; gap: 10px;">
      <button class="btn btn-primary" onclick="addToCart('${product.id}'); closeModal()">Add to Cart</button>
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;
  
  modal.style.display = 'block';
}

// Close modal
function closeModal() {
  document.getElementById('product-modal').style.display = 'none';
}

// Cart functions
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  let cart = JSON.parse(localStorage.getItem('floFactionCart')) || [];
  cart.push(product);
  localStorage.setItem('floFactionCart', JSON.stringify(cart));
  
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('floFactionCart')) || [];
  displayCart(cart);
}

function displayCart(cart) {
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Cart is empty</p>';
    document.getElementById('cart-total').textContent = '0.00';
    return;
  }
  
  let total = 0;
  const itemCounts = {};
  
  cart.forEach(item => {
    itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
    total += item.price;
  });
  
  Object.keys(itemCounts).forEach(productId => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const count = itemCounts[productId];
      const item = document.createElement('div');
      item.className = 'cart-item';
      item.innerHTML = `
        <div>
          <strong>${product.name}</strong><br/>
          <small>Qty: ${count} x $${product.price.toFixed(2)}</small>
        </div>
        <span class="cart-item-remove" onclick="removeFromCart('${product.id}')">Remove</span>
      `;
      cartItems.appendChild(item);
    }
  });
  
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('floFactionCart')) || [];
  const index = cart.findIndex(p => p.id === productId);
  if (index > -1) {
    cart.splice(index, 1);
    localStorage.setItem('floFactionCart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('floFactionCart')) || [];
  document.getElementById('cart-count').textContent = cart.length;
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  sidebar.classList.toggle('open');
}

function proceedToCheckout() {
  window.location.href = '/checkout';
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('product-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
