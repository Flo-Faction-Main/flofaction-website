/**
 * FLO FACTION - CRM DASHBOARD & CONTACT MANAGEMENT
 * Lead tracking, pipeline management, and client intake integration
 */

class CRMDashboard {
  constructor() {
    this.apiUrl = process.env.API_URL || 'https://api.flofaction.com';
    this.currentUser = null;
    this.leads = [];
    this.pipeline = {
      new: [],
      contacted: [],
      qualified: [],
      proposed: [],
      client: [],
      archived: []
    };
  }

  /**
   * LEAD MANAGEMENT
   */
  async createLead(leadData) {
    try {
      const lead = {
        id: `LEAD_${Date.now()}`,
        ...leadData,
        createdAt: new Date(),
        status: 'new',
        value: 0,
        nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        activities: [],
        notes: [],
        attachments: []
      };

      const response = await fetch(`${this.apiUrl}/crm/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(lead)
      });

      const savedLead = await response.json();
      this.pipeline.new.push(savedLead);
      return { success: true, lead: savedLead };
    } catch (error) {
      console.error('Lead creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MOVE LEAD THROUGH PIPELINE
   */
  async updateLeadStatus(leadId, newStatus, notes = '') {
    try {
      // Move lead from current status to new status
      const lead = this.findLead(leadId);
      if (!lead) return { success: false, error: 'Lead not found' };

      const oldStatus = lead.status;
      
      // Remove from old status
      this.pipeline[oldStatus] = this.pipeline[oldStatus].filter(l => l.id !== leadId);
      
      // Update lead
      lead.status = newStatus;
      lead.lastActivity = new Date();
      if (notes) lead.notes.push({ timestamp: new Date(), note: notes });

      // Add to new status
      this.pipeline[newStatus].push(lead);

      // Save to database
      await fetch(`${this.apiUrl}/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });

      return { success: true, lead };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * PIPELINE ANALYTICS
   */
  getPipelineAnalytics() {
    const analytics = {
      totalLeads: this.leads.length,
      byStatus: {},
      expectedRevenue: 0,
      conversionRate: 0,
      averageDealSize: 0
    };

    Object.entries(this.pipeline).forEach(([status, leads]) => {
      analytics.byStatus[status] = {
        count: leads.length,
        value: leads.reduce((sum, l) => sum + l.value, 0)
      };
      analytics.expectedRevenue += leads.reduce((sum, l) => sum + l.value, 0);
    });

    if (this.pipeline.client.length > 0) {
      analytics.conversionRate = (this.pipeline.client.length / this.leads.length) * 100;
      analytics.averageDealSize = this.pipeline.client.reduce((sum, l) => sum + l.value, 0) / this.pipeline.client.length;
    }

    return analytics;
  }

  /**
   * ACTIVITY TRACKING
   */
  async logActivity(leadId, activityType, details) {
    try {
      const activity = {
        id: `ACT_${Date.now()}`,
        leadId,
        type: activityType, // 'call', 'email', 'meeting', 'proposal'
        details,
        timestamp: new Date(),
        user: this.currentUser.id
      };

      await fetch(`${this.apiUrl}/crm/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(activity)
      });

      const lead = this.findLead(leadId);
      if (lead) {
        lead.activities.push(activity);
        lead.lastActivity = new Date();
      }

      return { success: true, activity };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * FOLLOW-UP REMINDERS
   */
  getFollowUpsOverdue() {
    const now = new Date();
    const overdue = [];

    Object.values(this.pipeline).forEach(statusLeads => {
      statusLeads.forEach(lead => {
        if (lead.nextFollowUp < now) {
          overdue.push(lead);
        }
      });
    });

    return overdue.sort((a, b) => a.nextFollowUp - b.nextFollowUp);
  }

  getUpcomingFollowUps(days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const upcoming = [];

    Object.values(this.pipeline).forEach(statusLeads => {
      statusLeads.forEach(lead => {
        if (lead.nextFollowUp >= now && lead.nextFollowUp <= future) {
          upcoming.push(lead);
        }
      });
    });

    return upcoming.sort((a, b) => a.nextFollowUp - b.nextFollowUp);
  }

  /**
   * CONTACT DETAILS MANAGEMENT
   */
  updateLeadContact(leadId, contactInfo) {
    const lead = this.findLead(leadId);
    if (!lead) return { success: false, error: 'Lead not found' };

    lead.contactInfo = {
      ...lead.contactInfo,
      ...contactInfo,
      lastUpdated: new Date()
    };

    return { success: true, lead };
  }

  /**
   * DOCUMENT & PROPOSAL MANAGEMENT
   */
  async attachProposal(leadId, proposalData) {
    try {
      const attachment = {
        id: `DOC_${Date.now()}`,
        type: 'proposal',
        name: proposalData.name,
        url: proposalData.url,
        createdAt: new Date()
      };

      const lead = this.findLead(leadId);
      if (lead) {
        lead.attachments.push(attachment);
        await this.logActivity(leadId, 'proposal', { proposalId: attachment.id });
      }

      return { success: true, attachment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * LEAD SCORING
   */
  calculateLeadScore(lead) {
    let score = 0;

    // Engagement score (0-30)
    const activityCount = lead.activities?.length || 0;
    score += Math.min(activityCount * 5, 30);

    // Value score (0-30)
    if (lead.estimatedValue) {
      score += Math.min((lead.estimatedValue / 100000) * 30, 30);
    }

    // Status score (0-20)
    const statusScores = {
      'new': 5,
      'contacted': 10,
      'qualified': 15,
      'proposed': 20,
      'client': 20
    };
    score += statusScores[lead.status] || 0;

    // Recency bonus (0-20)
    const daysSinceContact = Math.floor((Date.now() - lead.lastActivity) / (24 * 60 * 60 * 1000));
    if (daysSinceContact <= 7) score += 20;
    else if (daysSinceContact <= 30) score += 10;

    return Math.min(score, 100);
  }

  /**
   * BULK OPERATIONS
   */
  async bulkUpdateLeads(leadIds, updates) {
    try {
      const results = [];

      for (const leadId of leadIds) {
        const lead = this.findLead(leadId);
        if (lead) {
          Object.assign(lead, updates);
          results.push(lead);
        }
      }

      // Sync to database
      await fetch(`${this.apiUrl}/crm/leads/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({ leadIds, updates })
      });

      return { success: true, updated: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * EXPORT & REPORTING
   */
  exportLeadsToCSV(status = null) {
    let leadsToExport = this.leads;
    if (status) {
      leadsToExport = this.pipeline[status] || [];
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Value', 'Created', 'Last Activity'];
    const rows = leadsToExport.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone,
      lead.status,
      lead.value,
      lead.createdAt,
      lead.lastActivity
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }

  /**
   * HELPER METHODS
   */
  findLead(leadId) {
    for (const statusLeads of Object.values(this.pipeline)) {
      const lead = statusLeads.find(l => l.id === leadId);
      if (lead) return lead;
    }
    return null;
  }

  searchLeads(query) {
    return this.leads.filter(lead =>
      lead.name?.toLowerCase().includes(query.toLowerCase()) ||
      lead.email?.toLowerCase().includes(query.toLowerCase()) ||
      lead.phone?.includes(query)
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CRMDashboard;
}
