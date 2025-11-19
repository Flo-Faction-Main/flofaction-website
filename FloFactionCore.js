/**
 * FloFaction LLC - Core System
 * Handles Mock API calls, State Management, and Configuration
 */

class FloFactionCore {
  constructor() {
    this.apiDelay = 800; // Simulate network latency

    this.services = [
      { id: 'tax', name: 'Tax Preparation', basePrice: 250 },
      { id: 'web', name: 'Web Development', basePrice: 1500 },
      { id: 'ai', name: 'AI Automation', basePrice: 3000 },
      { id: 'notary', name: 'Notary Services', basePrice: 25 },
      { id: 'ins', name: 'Insurance', basePrice: 0 }, // Quote based
    ];
  }

  /**
   * Simulates a secure API request
   * @param {string} endpoint
   * @param {object} payload
   */
  async request(endpoint, payload = {}) {
    return new Promise((resolve, reject) => {
      console.log(`[FloAPI] Requesting: ${endpoint}`, payload);
      setTimeout(() => {
        try {
          const response = this._mockRouter(endpoint, payload);
          resolve(response);
        } catch (error) {
          reject({ error: error.message });
        }
      }, this.apiDelay);
    });
  }

  _mockRouter(endpoint, payload) {
    switch (endpoint) {
      case '/api/calculate-quote':
        return this._calculateQuote(payload);
      case '/api/recommend':
        return this._getRecommendation(payload);
      case '/api/ocr-scan':
        return { success: true, data: { extractedType: 'W2 Form', confidence: 0.98 } };
      case '/api/chat-response':
        return this._generateAIResponse(payload.message);
      default:
        throw new Error('Endpoint not found');
    }
  }

  _calculateQuote({ serviceId, complexity }) {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    const multipliers = { low: 1, medium: 1.5, high: 2.5, enterprise: 5 };

    return {
      service: service.name,
      estimatedTotal: service.basePrice * (multipliers[complexity] || 1),
      currency: 'USD'
    };
  }

  _getRecommendation(answers) {
    // Simple logic tree for demo purposes
    if (answers.includes('funding') || answers.includes('startup'))
      return { package: 'Business Launchpad', services: ['Consulting', 'Business Plan', 'SBA Loan Prep'] };
    if (answers.includes('automation') || answers.includes('scale'))
      return { package: 'Tech Scaling', services: ['AI Development', 'Web Design', 'Digital Marketing'] };
    return { package: 'General Business Support', services: ['Tax Prep', 'Notary', 'Insurance'] };
  }

  _generateAIResponse(msg) {
    const m = msg.toLowerCase();
    if (m.includes('tax')) return "For tax services, we offer personal and business returns. Would you like to upload a W2?";
    if (m.includes('quote')) return "I can help with that. Which service are you interested in?";
    return "I can assist with Taxes, AI, Marketing, and more. How can FloFaction help you today?";
  }
}

export const FloCore = new FloFactionCore();
