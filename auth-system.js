/**
 * FLO FACTION - AUTHENTICATION & SUBSCRIPTION SYSTEM
 * Comprehensive auth system with JWT, subscription management, and CRM integration
 */

class AuthenticationSystem {
  constructor() {
    this.apiUrl = process.env.API_URL || 'https://api.flofaction.com';
    this.currentUser = this.loadFromSession();
    this.subscriptionPlans = {
      free: { name: 'Free', price: 0, features: ['basic_tools', 'limited_quotes'] },
      pro: { name: 'Professional', price: 29.99, features: ['all_tools', 'unlimited_quotes', 'crm_access', 'api_access'] },
      enterprise: { name: 'Enterprise', price: 99.99, features: ['all_features', 'priority_support', 'custom_integration'] }
    };
  }

  // User Registration with Email Verification
  async register(email, password, firstName, lastName) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      const data = await response.json();
      this.saveToSession(data.user);
      this.currentUser = data.user;
      
      // Send verification email
      await this.sendVerificationEmail(email);
      
      return { success: true, message: 'Registration successful. Check your email to verify.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login with JWT Token
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const { user, token, refreshToken } = await response.json();
      
      // Store tokens securely
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.saveToSession(user);
      this.currentUser = user;
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // OAuth Integration (Google, LinkedIn)
  async oauthLogin(provider, code) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const { user, token } = await response.json();
      this.setToken(token);
      this.currentUser = user;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Subscription Management
  async upgradeSubscription(planId) {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({ planId, userId: this.currentUser.id })
      });
      
      const { sessionId } = await response.json();
      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  }

  // CRM Data Synchronization
  async syncWithCRM(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/crm/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('CRM sync error:', error);
    }
  }

  // Token Management
  setToken(token) {
    localStorage.setItem('jwtToken', token);
  }

  getToken() {
    return localStorage.getItem('jwtToken');
  }

  setRefreshToken(refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  // Session Management
  saveToSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  loadFromSession() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('currentUser');
    this.currentUser = null;
  }

  isAuthenticated() {
    return !!this.getToken() && !!this.currentUser;
  }

  getSubscriptionPlan() {
    return this.currentUser?.subscriptionPlan || 'free';
  }

  hasFeature(featureName) {
    const plan = this.getSubscriptionPlan();
    const planFeatures = this.subscriptionPlans[plan]?.features || [];
    return planFeatures.includes(featureName);
  }

  // Email Verification
  async sendVerificationEmail(email) {
    return fetch(`${this.apiUrl}/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  }

  // Password Reset
  async requestPasswordReset(email) {
    return fetch(`${this.apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthenticationSystem;
}
