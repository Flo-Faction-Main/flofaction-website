// Adaptive Intake Form Logic - FloFactonCore Integration
class AdaptiveIntakeForm {
    constructor() {
        this.form = document.getElementById('intakeForm');
        this.serviceSelect = document.getElementById('serviceType');
        this.formData = {};
        this.initEventListeners();
        this.loadFromIndexedDB();
    }

    initEventListeners() {
        this.serviceSelect.addEventListener('change', (e) => this.handleServiceChange(e));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.form.addEventListener('change', (e) => this.autoSaveToIndexedDB());
    }

    handleServiceChange(event) {
        const service = event.target.value;
        this.hideAllSections();
        
        if (service === 'insurance') {
            document.getElementById('insuranceSection').classList.add('visible');
        } else if (service === 'wealth') {
            document.getElementById('wealthSection').classList.add('visible');
        } else if (service === 'tax') {
            document.getElementById('taxSection').classList.add('visible');
        } else if (service === 'business') {
            document.getElementById('businessSection').classList.add('visible');
        }
    }

    hideAllSections() {
        const sections = [
            'insuranceSection',
            'wealthSection',
            'taxSection',
            'businessSection'
        ];
        sections.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.classList.remove('visible');
        });
    }

    async autoSaveToIndexedDB() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        try {
            const db = await this.openIndexedDB();
            const tx = db.transaction('formDrafts', 'readwrite');
            const store = tx.objectStore('formDrafts');
            await store.put({
                id: 'draft-' + new Date().getTime(),
                timestamp: new Date(),
                data: data
            });
        } catch (err) {
            console.log('Auto-save to IndexedDB failed:', err);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate required fields based on service type
        if (!this.validateForm(data)) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Determine priority for HITL
        const priority = this.calculatePriority(data);
        
        try {
            // Submit to API
            const response = await fetch('/api/intake-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, priority })
            });
            
            if (response.ok) {
                // Show success message
                document.getElementById('successMessage').style.display = 'block';
                
                // Clear form
                this.form.reset();
                this.hideAllSections();
                
                // Clear IndexedDB draft
                this.clearDraftFromIndexedDB();
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = '/confirmation';
                }, 2000);
            } else {
                // If offline, save to IndexedDB for sync
                await this.autoSaveToIndexedDB();
                alert('Your application has been saved offline and will be submitted when you\'re back online');
            }
        } catch (err) {
            console.error('Submission error:', err);
            await this.autoSaveToIndexedDB();
            alert('Your application has been saved offline');
        }
    }

    validateForm(data) {
        // Basic validation
        if (!data.fullName || !data.email || !data.phone || !data.serviceType) {
            return false;
        }
        
        // Service-specific validation
        if (data.serviceType === 'wealth') {
            if (!data.currentIncome || !data.investmentCapital || !data.financialGoals || !data.riskTolerance) {
                return false;
            }
        }
        
        return true;
    }

    calculatePriority(data) {
        let priority = 'LOW';
        let score = 0;
        
        // High priority: Infinite Banking inquiries >$50K
        if (data.serviceType === 'wealth' && parseFloat(data.investmentCapital) > 50000) {
            score += 5;
        }
        
        // High priority: Insurance with large coverage
        if (data.serviceType === 'insurance' && parseFloat(data.currentCoverage) > 100000) {
            score += 3;
        }
        
        // High priority: High income
        if (parseFloat(data.currentIncome) > 200000) {
            score += 2;
        }
        
        if (score >= 5) priority = 'HIGH';
        else if (score >= 2) priority = 'MEDIUM';
        
        return priority;
    }

    async openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FloFactonDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('formDrafts')) {
                    db.createObjectStore('formDrafts', { keyPath: 'id' });
                }
            };
        });
    }

    async loadFromIndexedDB() {
        try {
            const db = await this.openIndexedDB();
            const tx = db.transaction('formDrafts', 'readonly');
            const store = tx.objectStore('formDrafts');
            const request = store.getAll();
            
            request.onsuccess = () => {
                if (request.result.length > 0) {
                    const latestDraft = request.result[request.result.length - 1];
                    this.populateFormFromDraft(latestDraft.data);
                }
            };
        } catch (err) {
            console.log('Could not load from IndexedDB:', err);
        }
    }

    populateFormFromDraft(data) {
        Object.keys(data).forEach(key => {
            const field = this.form.elements[key];
            if (field) field.value = data[key];
        });
    }

    async clearDraftFromIndexedDB() {
        try {
            const db = await this.openIndexedDB();
            const tx = db.transaction('formDrafts', 'readwrite');
            const store = tx.objectStore('formDrafts');
            store.clear();
        } catch (err) {
            console.log('Could not clear drafts:', err);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AdaptiveIntakeForm();
    });
} else {
    new AdaptiveIntakeForm();
}
