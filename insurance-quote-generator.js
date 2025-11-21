/**
 * FLO FACTION - DYNAMIC INSURANCE QUOTE GENERATOR
 * Real-time quote generation with policy types, pricing, and required field validation
 */

class InsuranceQuoteGenerator {
  constructor() {
    this.apiUrl = process.env.API_URL || 'https://api.flofaction.com';
    this.carriers = {
      ethos: { name: 'Ethos', termLife: true, wholeLife: false, annuities: false, rating: 4.8 },
      mutualOfOmaha: { name: 'Mutual of Omaha', termLife: true, wholeLife: true, annuities: true, rating: 4.6 },
      americo: { name: 'Americo', termLife: true, wholeLife: true, annuities: true, rating: 4.5 },
      allianz: { name: 'Allianz', termLife: false, wholeLife: false, annuities: true, rating: 4.7 },
      nationwide: { name: 'Nationwide', termLife: true, wholeLife: true, annuities: true, rating: 4.4 },
      massMutual: { name: 'Mass Mutual', termLife: true, wholeLife: true, annuities: true, rating: 4.5 },
      johnHancock: { name: 'John Hancock', termLife: true, wholeLife: true, annuities: true, rating: 4.6 },
      prudential: { name: 'Prudential', termLife: true, wholeLife: true, annuities: true, rating: 4.5 }
    };

    this.policyTypes = {
      termLife: {
        name: 'Term Life Insurance',
        description: 'Affordable protection for a specific term',
        requiredFields: ['age', 'health', 'coverage_amount', 'term_length']
      },
      wholeLife: {
        name: 'Whole Life Insurance',
        description: 'Lifetime coverage with cash value accumulation',
        requiredFields: ['age', 'health', 'coverage_amount']
      },
      universalLife: {
        name: 'Universal Life (UL)',
        description: 'Flexible coverage with investment options',
        requiredFields: ['age', 'health', 'coverage_amount']
      },
      indexedUniversalLife: {
        name: 'Indexed Universal Life (IUL)',
        description: 'Market-linked growth with principal protection',
        requiredFields: ['age', 'health', 'coverage_amount']
      },
      immediateAnnuity: {
        name: 'Immediate Annuity',
        description: 'Guaranteed income for life',
        requiredFields: ['age', 'investment_amount', 'payment_frequency']
      },
      fixedIndexAnnuity: {
        name: 'Fixed Index Annuity (FIA)',
        description: 'Protected growth linked to market index',
        requiredFields: ['age', 'investment_amount']
      }
    };
  }

  /**
   * STEP 1: Validate Required Fields
   */
  validateRequiredFields(policyType, userData) {
    const requiredFields = this.policyTypes[policyType]?.requiredFields || [];
    const missing = requiredFields.filter(field => !userData[field] || userData[field] === '');
    
    return {
      isValid: missing.length === 0,
      missingFields: missing,
      validationMessage: missing.length > 0 ? `Missing fields: ${missing.join(', ')}` : 'All required fields valid'
    };
  }

  /**
   * STEP 2: Get Carrier Options Based on Policy Type
   */
  getEligibleCarriers(policyType) {
    return Object.entries(this.carriers)
      .filter(([_, carrier]) => carrier[policyType])
      .map(([id, carrier]) => ({
        id,
        ...carrier
      }))
      .sort((a, b) => b.rating - a.rating);
  }

  /**
   * STEP 3: Calculate Base Premium
   */
  calculateBasePremium(policyType, userData) {
    const { age, health, coverage_amount, term_length, investment_amount } = userData;
    let basePremium = 0;

    switch (policyType) {
      case 'termLife':
        // Term life: Lower cost, increases with age
        const ageRate = Math.pow(1.05, age - 25); // 5% increase per year from age 25
        const healthFactor = this.getHealthRiskFactor(health);
        basePremium = (coverage_amount / 100000) * (10 + ageRate * 2) * healthFactor * (term_length / 20);
        break;

      case 'wholeLife':
      case 'universalLife':
        // Permanent life: Higher premium for lifetime coverage
        basePremium = (coverage_amount / 100000) * (20 + (age - 25) * 0.5) * this.getHealthRiskFactor(health);
        break;

      case 'indexedUniversalLife':
        // IUL: Moderate premium with market potential
        basePremium = (coverage_amount / 100000) * (18 + (age - 25) * 0.4) * this.getHealthRiskFactor(health);
        break;

      case 'immediateAnnuity':
        // Annuity: Based on age and investment amount
        const annuityRate = 0.04 + (Math.max(0, age - 60) * 0.002); // Higher income at older ages
        basePremium = investment_amount * annuityRate / 12; // Monthly
        break;

      case 'fixedIndexAnnuity':
        // FIA: Lower guarantees
        basePremium = investment_amount * 0.03 / 12; // Monthly
        break;
    }

    return Math.round(basePremium * 100) / 100;
  }

  /**
   * Health Risk Factor
   */
  getHealthRiskFactor(health) {
    const factors = {
      excellent: 0.85,
      good: 1.0,
      fair: 1.25,
      poor: 1.75
    };
    return factors[health] || 1.0;
  }

  /**
   * STEP 4: Generate Multi-Carrier Quotes
   */
  async generateQuotes(policyType, userData) {
    try {
      // Validate
      const validation = this.validateRequiredFields(policyType, userData);
      if (!validation.isValid) {
        return { success: false, error: validation.validationMessage, missingFields: validation.missingFields };
      }

      // Get eligible carriers
      const carriers = this.getEligibleCarriers(policyType);
      const basePremium = this.calculateBasePremium(policyType, userData);

      // Generate quotes from each carrier
      const quotes = carriers.map(carrier => ({
        carrierName: carrier.name,
        carrierId: carrier.id,
        policyType: this.policyTypes[policyType].name,
        monthlyPremium: basePremium * (0.95 + Math.random() * 0.1), // 5% variance
        annualPremium: basePremium * 12 * (0.95 + Math.random() * 0.1),
        rating: carrier.rating,
        availableNow: true,
        benefits: this.getPolicyBenefits(policyType),
        estimatedApprovalTime: this.getApprovalTime(policyType)
      }));

      // Send to CRM
      await this.syncQuoteToC RM(userData, policyType, quotes);

      return {
        success: true,
        policyType: this.policyTypes[policyType].name,
        quotes: quotes.sort((a, b) => a.monthlyPremium - b.monthlyPremium),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Quote generation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * STEP 5: Get Policy-Specific Benefits
   */
  getPolicyBenefits(policyType) {
    const benefits = {
      termLife: [
        'Pure death benefit protection',
        'Most affordable option',
        'Convertible to permanent policy',
        'Quick underwriting (7-14 days)'
      ],
      wholeLife: [
        'Lifetime coverage guaranteed',
        'Cash value growth',
        'Loan against cash value',
        'Tax-free withdrawals'
      ],
      universalLife: [
        'Flexible premiums',
        'Adjustable death benefit',
        'Cash value potential',
        'Lower cost than whole life'
      ],
      indexedUniversalLife: [
        'Market-linked growth potential',
        'Principal protection (0% floor)',
        'Tax-deferred growth',
        'Monthly income potential'
      ],
      immediateAnnuity: [
        'Guaranteed income for life',
        'No market risk',
        'Immediate payments',
        'Predictable retirement income'
      ],
      fixedIndexAnnuity: [
        'Principal protected',
        'Market upside potential',
        'Tax-deferred growth',
        'Guaranteed minimum interest rate'
      ]
    };
    return benefits[policyType] || [];
  }

  /**
   * Approval Timeline
   */
  getApprovalTime(policyType) {
    const times = {
      termLife: '7-14 days',
      wholeLife: '10-21 days',
      universalLife: '10-21 days',
      indexedUniversalLife: '14-28 days',
      immediateAnnuity: '5-10 days',
      fixedIndexAnnuity: '5-10 days'
    };
    return times[policyType] || '7-14 days';
  }

  /**
   * Sync Quote to CRM for Follow-up
   */
  async syncQuoteToCRM(userData, policyType, quotes) {
    try {
      return fetch(`${this.apiUrl}/crm/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userData,
          policyType,
          quotes,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('CRM sync error:', error);
    }
  }

  /**
   * Request Full Proposal
   */
  async requestProposal(quoteId, carrierId, userData) {
    try {
      const response = await fetch(`${this.apiUrl}/insurance/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          carrierId,
          userData,
          timestamp: new Date().toISOString()
        })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InsuranceQuoteGenerator;
}
