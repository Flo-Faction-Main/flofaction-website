/**
 * Flo Faction - ElevenLabs AI Voice Agent Integration
 * Autonomous conversational AI for lead qualification and sales
 * Integrated with HITL (Human-In-The-Loop) approval system
 */

class ElevenLabsVoiceAgent {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.ELEVENLABS_API_KEY;
    this.agentId = config.agentId || process.env.ELEVENLABS_AGENT_ID;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.conversationHistory = [];
    this.leadData = {};
    this.isActive = false;
    this.config = {
      model: 'eleven-turbo-v2',
      voiceId: config.voiceId || 'EXAVITQu4vr4xnSDxMaL', // Professional voice
      temperature: 0.7,
      topP: 0.9,
      ...config
    };
  }

  /**
   * Initialize voice agent with conversation context
   */
  async initialize() {
    try {
      this.systemPrompt = this.buildSystemPrompt();
      console.log('ElevenLabs Voice Agent initialized');
      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }

  /**
   * Build intelligent system prompt for autonomous conversation
   */
  buildSystemPrompt() {
    return `You are an expert financial advisor for Flo Faction LLC, a nationwide insurance and wealth-building company.

Your Role:
- Qualify leads through natural conversation
- Identify service needs (Insurance, Infinite Banking, Tax, Business Services)
- Gather key information without sounding like a script
- Build rapport and trust
- Escalate high-value opportunities to humans

Key Services:
1. Life Insurance & IUL (Infinite Wealth Strategy)
2. Infinite Banking Strategy (2-5% monthly passive income)
3. Medicare Planning
4. Annuities & Retirement Income
5. Tax Optimization
6. Business Services

Escalation Triggers (HITL):
- Investment capital > $50,000
- Annual insurance premium > $10,000
- Complex multi-product needs
- Special circumstances

Conversation Guidelines:
- Start with warm greeting and ask about their primary need
- Listen for pain points (debt, retirement concerns, tax burden)
- Recommend services that directly address their situation
- Share brief success stories when relevant
- Ask for contact info and availability before ending
- Be helpful, knowledgeable, and professional

Default Response Style: Conversational, empathetic, solution-focused`;
  }

  /**
   * Start autonomous conversation with lead
   */
  async startConversation(leadInfo = {}) {
    this.leadData = leadInfo;
    this.conversationHistory = [];

    const greeting = `Hi ${leadInfo.firstName || 'there'}! I'm the AI assistant for Flo Faction LLC. We help people build wealth, optimize taxes, and secure their family's financial future. What brings you in today?`;

    return {
      status: 'success',
      message: greeting,
      agentReady: true,
      conversationId: this.generateConversationId()
    };
  }

  /**
   * Process user message and generate AI response
   */
  async processMessage(userMessage) {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    try {
      const response = await this.generateResponse(userMessage);
      
      this.conversationHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      });

      // Check if this should be escalated to HITL
      const escalationScore = this.calculateEscalationScore();
      
      return {
        message: response.message,
        escalationScore,
        shouldEscalate: escalationScore > 7,
        leadQualification: this.extractLeadData(),
        suggestedServices: response.suggestedServices || []
      };
    } catch (error) {
      console.error('Message processing error:', error);
      return {
        message: 'I apologize, let me connect you with one of our specialists.',
        error: true,
        shouldEscalate: true
      };
    }
  }

  /**
   * Intelligent lead qualification through conversation
   */
  extractLeadData() {
    const data = { ...this.leadData };
    
    // Scan conversation for key indicators
    this.conversationHistory.forEach(msg => {
      const text = msg.content.toLowerCase();
      
      // Investment capital detection
      const investmentMatch = text.match(/\$(\d+[,\d]*)[kK]?/);
      if (investmentMatch) data.investmentCapital = investmentMatch[1];
      
      // Annual income detection
      if (text.includes('earn') || text.includes('income')) {
        const incomeMatch = text.match(/(\d+[,\d]*)[kK].*year/);
        if (incomeMatch) data.annualIncome = incomeMatch[1];
      }
      
      // Service interest detection
      if (text.includes('infinite banking') || text.includes('passive income')) {
        data.interestedIn = (data.interestedIn || []).concat('Infinite Banking');
      }
      if (text.includes('insurance') || text.includes('protect')) {
        data.interestedIn = (data.interestedIn || []).concat('Life Insurance');
      }
      if (text.includes('tax') || text.includes('deduction')) {
        data.interestedIn = (data.interestedIn || []).concat('Tax Services');
      }
    });
    
    return data;
  }

  /**
   * Calculate escalation score (0-10) for HITL routing
   */
  calculateEscalationScore() {
    let score = 0;
    const leadData = this.extractLeadData();
    
    // High-value investment capital
    if (leadData.investmentCapital) {
      const amount = parseInt(leadData.investmentCapital.replace(/[^0-9]/g, ''));
      if (amount > 50000) score += 5;
      if (amount > 100000) score += 2;
    }
    
    // High income
    if (leadData.annualIncome) {
      const amount = parseInt(leadData.annualIncome.replace(/[^0-9]/g, ''));
      if (amount > 200000) score += 3;
      if (amount > 500000) score += 2;
    }
    
    // Multiple service interests
    if (leadData.interestedIn && leadData.interestedIn.length > 2) score += 2;
    
    // Infinite Banking interest (high-value niche)
    if (leadData.interestedIn && leadData.interestedIn.includes('Infinite Banking')) score += 3;
    
    return Math.min(score, 10);
  }

  /**
   * Generate AI response using ElevenLabs API
   */
  async generateResponse(userMessage) {
    // This would connect to ElevenLabs Conversational AI endpoint
    // For now, returning structured response template
    
    const conversationContext = this.conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // In production, this sends to ElevenLabs API
    // const response = await fetch(`${this.baseUrl}/convai/conversation`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     agentId: this.agentId,
    //     userMessage,
    //     conversationContext,
    //     systemPrompt: this.systemPrompt
    //   })
    // });

    // Mock response for demonstration
    return {
      message: this.generateMockResponse(userMessage),
      suggestedServices: this.suggestServices(userMessage)
    };
  }

  /**
   * Generate contextual mock response (replaced with real API in production)
   */
  generateMockResponse(userMessage) {
    const responses = {
      passive: 'That\'s great! Our Infinite Banking strategy helps clients generate 2-5% monthly passive income through overfunded whole life insurance. It\'s especially effective for someone in your situation.',
      insurance: 'Protecting your family\'s financial future is crucial. Our IUL policies offer competitive returns with guaranteed minimums.',
      tax: 'Tax optimization is one of our specialties. Many of our clients save $10K-50K+ annually through strategic planning.',
      default: 'I understand. Let me share how Flo Faction helps people in similar situations...'
    };
    
    const text = userMessage.toLowerCase();
    if (text.includes('passive') || text.includes('income')) return responses.passive;
    if (text.includes('insurance') || text.includes('protect')) return responses.insurance;
    if (text.includes('tax') || text.includes('deduction')) return responses.tax;
    return responses.default;
  }

  /**
   * Recommend services based on conversation
   */
  suggestServices(userMessage) {
    const suggestions = [];
    const text = userMessage.toLowerCase();
    
    if (text.includes('retire') || text.includes('income')) suggestions.push('Annuities & Retirement Income');
    if (text.includes('invest') || text.includes('wealth')) suggestions.push('Infinite Banking Strategy');
    if (text.includes('protect') || text.includes('family')) suggestions.push('Life Insurance & IUL');
    if (text.includes('tax') || text.includes('deduction')) suggestions.push('Tax Optimization Services');
    if (text.includes('business')) suggestions.push('Business Consulting');
    
    return suggestions.length > 0 ? suggestions : ['Financial Planning Consultation'];
  }

  /**
   * End conversation and route to appropriate channel
   */
  async endConversation(reason = 'user_request') {
    const qualification = this.extractLeadData();
    const escalationScore = this.calculateEscalationScore();

    // Send to HITL if needed
    if (escalationScore > 7 || reason === 'escalation_needed') {
      await this.escalateToHITL(qualification);
    }
    
    // Send to CRM
    await this.syncToCRM({
      leadData: qualification,
      conversationHistory: this.conversationHistory,
      escalationScore,
      timestamp: new Date()
    });

    return {
      status: 'conversation_ended',
      escalationScore,
      shouldContact: escalationScore > 5
    };
  }

  /**
   * Escalate high-value lead to HITL dashboard
   */
  async escalateToHITL(leadQualification) {
    try {
      // This would send to your HITL dashboard API
      const response = await fetch('/api/hitl/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadQualification,
          source: 'elevenlabs-ai',
          timestamp: new Date(),
          priority: this.calculateEscalationScore() > 8 ? 'high' : 'medium'
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('HITL escalation error:', error);
    }
  }

  /**
   * Sync conversation to CRM system
   */
  async syncToCRM(conversationData) {
    try {
      await fetch('/api/crm/sync-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationData)
      });
    } catch (error) {
      console.error('CRM sync error:', error);
    }
  }

  /**
   * Generate unique conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for use in HTML/other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElevenLabsVoiceAgent;
}

// Make globally available
if (typeof window !== 'undefined') {
  window.ElevenLabsVoiceAgent = ElevenLabsVoiceAgent;
}
