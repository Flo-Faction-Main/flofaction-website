// HITL Workflow Manager - Human-In-The-Loop Automation
class HITLWorkflow {
    constructor() {
        this.apiEndpoint = '/api/hitl';
        this.floFactonCore = window.FloFactonCore || {};
        this.queue = [];
        this.approvedCount = 0;
        this.rejectedCount = 0;
        this.init();
    }

    async init() {
        console.log('HITL Workflow initialized');
        this.setupNotifications();
        await this.loadQueue();
    }

    setupNotifications() {
        // Setup email and SMS notifications
        this.emailConfig = {
            high: 'flofaction.insurance@gmail.com',
            business: 'flofaction.business@gmail.com',
            default: 'flofactionllc@gmail.com'
        };
        this.phoneNumber = '(772) 208-9646';
    }

    async loadQueue() {
        try {
            const response = await fetch(this.apiEndpoint + '/queue');
            this.queue = await response.json();
        } catch (err) {
            console.error('Error loading HITL queue:', err);
        }
    }

    // Calculate priority score for automatic routing
    calculatePriority(intake) {
        let score = 0;
        let priority = 'LOW';

        // Infinite Banking/Wealth inquiries with large investment
        if (intake.service === 'wealth' && intake.investmentCapital > 50000) {
            score += 5;
        }

        // Insurance with high annual premium
        if (intake.service === 'insurance' && (intake.currentCoverage * 0.02) > 10000) {
            score += 4;
        }

        // High income earners
        if (intake.currentIncome && intake.currentIncome > 200000) {
            score += 3;
        }

        // Multi-product bundles
        if (intake.multiProduct) {
            score += 2;
        }

        if (score >= 5) priority = 'HIGH';
        else if (score >= 2) priority = 'MEDIUM';

        return { priority, score };
    }

    // Approval workflow
    async approveInquiry(inquiryId, intake) {
        try {
            // Route to CRM
            await this.updateCRM(inquiryId, 'approved', intake);

            // Send confirmation email
            await this.sendNotification({
                type: 'email',
                to: intake.email,
                subject: 'Application Received - Flo Faction LLC',
                body: `Thank you for your interest in our services. Your application has been received and will be reviewed shortly.`
            });

            // Log to audit trail
            this.logAuditTrail(inquiryId, 'approved', new Date());

            this.approvedCount++;
            return { success: true, message: 'Inquiry approved and CRM updated' };
        } catch (err) {
            console.error('Error approving inquiry:', err);
            return { success: false, error: err.message };
        }
    }

    // Rejection workflow
    async rejectInquiry(inquiryId, intake, reason) {
        try {
            await this.updateCRM(inquiryId, 'rejected', intake);

            await this.sendNotification({
                type: 'email',
                to: intake.email,
                subject: 'Application Status Update',
                body: `We appreciate your interest. At this time, we are unable to proceed. Reason: ${reason}`
            });

            this.logAuditTrail(inquiryId, 'rejected', new Date(), reason);

            this.rejectedCount++;
            return { success: true };
        } catch (err) {
            console.error('Error rejecting inquiry:', err);
            return { success: false, error: err.message };
        }
    }

    // CRM Integration - FloFactonCore
    async updateCRM(inquiryId, status, intake) {
        if (this.floFactonCore.updateLead) {
            return await this.floFactonCore.updateLead({
                id: inquiryId,
                status: status,
                name: intake.fullName,
                email: intake.email,
                phone: intake.phone,
                service: intake.serviceType,
                timestamp: new Date()
            });
        }
    }

    // Send notifications
    async sendNotification(config) {
        try {
            if (config.type === 'email') {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
            } else if (config.type === 'sms') {
                await fetch('/api/send-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
            }
        } catch (err) {
            console.error('Error sending notification:', err);
        }
    }

    // Audit trail logging
    logAuditTrail(inquiryId, action, timestamp, notes = '') {
        const log = {
            inquiryId,
            action,
            timestamp,
            user: 'system',
            notes
        };

        fetch('/api/audit-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
        }).catch(err => console.error('Audit logging failed:', err));
    }

    // Get dashboard stats
    getDashboardStats() {
        return {
            totalInQueue: this.queue.length,
            highPriority: this.queue.filter(q => q.priority === 'HIGH').length,
            mediumPriority: this.queue.filter(q => q.priority === 'MEDIUM').length,
            lowPriority: this.queue.filter(q => q.priority === 'LOW').length,
            approved: this.approvedCount,
            rejected: this.rejectedCount
        };
    }
}

// Initialize HITL Workflow globally
window.HITLWorkflow = new HITLWorkflow();
