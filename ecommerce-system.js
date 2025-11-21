/**
 * FLO FACTION - COMPLETE E-COMMERCE SYSTEM
 * Shopping cart, payments (Stripe + PayPal), digital delivery, order management
 */

class ECommerceSystem {
  constructor() {
    this.apiUrl = process.env.API_URL || 'https://api.flofaction.com';
    this.stripeKey = process.env.STRIPE_PUBLIC_KEY;
    this.paypalClientId = process.env.PAYPAL_CLIENT_ID;
    this.cart = this.loadCart();
    this.user = JSON.parse(sessionStorage.getItem('currentUser')) || null;
  }

  // ===== CART MANAGEMENT =====
  
  addToCart(product) {
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1, addedAt: new Date() });
    }
    this.saveCart();
    this.updateCartUI();
    return { success: true, cartCount: this.getCartCount() };
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
      this.updateCartUI();
    }
  }

  getCart() {
    return this.cart;
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
  }

  // ===== PERSISTENCE =====

  saveCart() {
    localStorage.setItem('flofaction_cart', JSON.stringify(this.cart));
    this.syncCartToServer();
  }

  loadCart() {
    const saved = localStorage.getItem('flofaction_cart');
    return saved ? JSON.parse(saved) : [];
  }

  async syncCartToServer() {
    if (!this.user) return;
    try {
      await fetch(`${this.apiUrl}/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({ items: this.cart })
      });
    } catch (error) {
      console.error('Cart sync error:', error);
    }
  }

  // ===== STRIPE PAYMENT =====

  async initiateStripeCheckout() {
    try {
      const response = await fetch(`${this.apiUrl}/checkout/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          items: this.cart,
          total: this.getCartTotal(),
          userId: this.user?.id
        })
      });

      const { sessionId } = await response.json();
      const stripe = Stripe(this.stripeKey);
      await stripe.redirectToCheckout({ sessionId });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== PAYPAL PAYMENT =====

  async initiatePayPalCheckout() {
    try {
      const response = await fetch(`${this.apiUrl}/checkout/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          items: this.cart,
          total: this.getCartTotal(),
          userId: this.user?.id
        })
      });

      const { approvalUrl } = await response.json();
      window.location.href = approvalUrl;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== ORDER PROCESSING =====

  async processOrder(paymentMethod, token) {
    try {
      const response = await fetch(`${this.apiUrl}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          items: this.cart,
          total: this.getCartTotal(),
          paymentMethod,
          paymentToken: token,
          userId: this.user?.id,
          email: this.user?.email
        })
      });

      const order = await response.json();
      if (order.success) {
        this.clearCart();
        await this.sendOrderConfirmation(order.id, order.downloadLinks);
      }
      return order;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== DIGITAL DELIVERY =====

  async sendOrderConfirmation(orderId, downloadLinks) {
    try {
      await fetch(`${this.apiUrl}/email/order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          orderId,
          email: this.user?.email,
          userName: `${this.user?.firstName} ${this.user?.lastName}`,
          downloadLinks,
          expiresIn: 7
        })
      });
      return { success: true };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== ORDER HISTORY & DOWNLOADS =====

  async getOrderHistory() {
    try {
      const response = await fetch(`${this.apiUrl}/orders/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getDownloadLinks(orderId) {
    try {
      const response = await fetch(`${this.apiUrl}/downloads/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async validateDownloadToken(token) {
    try {
      const response = await fetch(`${this.apiUrl}/downloads/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== PRODUCTS CATALOG =====

  async getProducts(category = null) {
    try {
      const url = category 
        ? `${this.apiUrl}/products?category=${category}`
        : `${this.apiUrl}/products`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProduct(productId) {
    try {
      const response = await fetch(`${this.apiUrl}/products/${productId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== UI UPDATES =====

  updateCartUI() {
    const cartCount = document.querySelector('[data-cart-count]');
    if (cartCount) {
      cartCount.textContent = this.getCartCount();
      cartCount.style.display = this.getCartCount() > 0 ? 'block' : 'none';
    }

    const cartTotal = document.querySelector('[data-cart-total]');
    if (cartTotal) {
      cartTotal.textContent = `$${this.getCartTotal().toFixed(2)}`;
    }
  }

  renderCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = '<p>Your cart is empty</p>';
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item" data-product-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image" loading="lazy">
        <div class="cart-item-details">
          <h3>${item.title}</h3>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-controls">
          <input type="number" min="1" value="${item.quantity}" 
            data-quantity-input
            onchange="window.ecommerce.updateQuantity('${item.id}', this.value)">
          <button onclick="window.ecommerce.removeFromCart('${item.id}')">Remove</button>
        </div>
        <div class="cart-item-total">
          $${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    `).join('');
  }
}

// Initialize globally
if (typeof window !== 'undefined') {
  window.ecommerce = new ECommerceSystem();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ECommerceSystem;
}
