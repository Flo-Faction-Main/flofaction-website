// FloFaction LLC - Comprehensive Website JavaScript
// Handles insurance system, forms, navigation, and user interactions

class FloFactionWebsite {
    constructor() {
        this.initializeWebsite();
    }

    initializeWebsite() {
        this.initializeNavigation();
        this.initializeForms();
        this.initializeSmoothScrolling();
        this.initializeAnimations();
        this.initializeNotifications();
    }

    initializeNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Active navigation highlighting
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    initializeForms() {
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
    }

    handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            type: 'contact_inquiry',
            timestamp: new Date().toISOString(),
            name: formData.get('contactName'),
            email: formData.get('contactEmail'),
            serviceInterest: formData.get('serviceInterest'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            source: 'website_direct',
            utm_source: this.getUTMParameter('utm_source'),
            utm_medium: this.getUTMParameter('utm_medium'),
            utm_campaign: this.getUTMParameter('utm_campaign')
        };

        // Store locally
        this.storeContactData(contactData);

        // Send to backend (placeholder for now)
        this.sendContactData(contactData);

        // Show success message
        this.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');

        // Reset form
        e.target.reset();
    }

    storeContactData(data) {
        try {
            const existingData = JSON.parse(localStorage.getItem('flofaction_contacts') || '[]');
            existingData.push(data);
            localStorage.setItem('flofaction_contacts', JSON.stringify(existingData));
        } catch (error) {
            console.error('Error storing contact data:', error);
        }
    }

    async sendContactData(data) {
        try {
            // Placeholder for backend API call
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('Contact data sent successfully');
            } else {
                console.error('Failed to send contact data');
            }
        } catch (error) {
            console.error('Error sending contact data:', error);
            // Store for later retry
            this.storeFailedSubmission(data);
        }
    }

    storeFailedSubmission(data) {
        try {
            const failedSubmissions = JSON.parse(localStorage.getItem('flofaction_failed_submissions') || '[]');
            failedSubmissions.push({
                ...data,
                retryCount: 0,
                lastAttempt: new Date().toISOString()
            });
            localStorage.setItem('flofaction_failed_submissions', JSON.stringify(failedSubmissions));
        } catch (error) {
            console.error('Error storing failed submission:', error);
        }
    }

    initializeSmoothScrolling() {
        // Smooth scrolling for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.insurance-card, .music-card, .marketing-card, .video-card, .social-card, .business-card').forEach(card => {
            observer.observe(card);
        });
    }

    initializeNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    getUTMParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name) || '';
    }

    // Analytics tracking
    trackEvent(eventName, eventData = {}) {
        try {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, eventData);
            }

            // Custom analytics
            const analyticsData = {
                event: eventName,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                ...eventData
            };

            // Store locally for analytics
            this.storeAnalyticsData(analyticsData);

            console.log('Event tracked:', analyticsData);
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    storeAnalyticsData(data) {
        try {
            const existingData = JSON.parse(localStorage.getItem('flofaction_analytics') || '[]');
            existingData.push(data);
            
            // Keep only last 1000 events
            if (existingData.length > 1000) {
                existingData.splice(0, existingData.length - 1000);
            }
            
            localStorage.setItem('flofaction_analytics', JSON.stringify(existingData));
        } catch (error) {
            console.error('Error storing analytics data:', error);
        }
    }

    // Page view tracking
    trackPageView() {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_url: window.location.href,
            referrer: document.referrer
        });
    }

    // Form interaction tracking
    trackFormInteraction(formType, action) {
        this.trackEvent('form_interaction', {
            form_type: formType,
            action: action,
            page_url: window.location.href
        });
    }

    // Service interest tracking
    trackServiceInterest(service) {
        this.trackEvent('service_interest', {
            service: service,
            page_url: window.location.href
        });
    }

    // Insurance quote interest tracking
    trackInsuranceInterest(type) {
        this.trackEvent('insurance_interest', {
            insurance_type: type,
            page_url: window.location.href
        });
    }
}

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const website = new FloFactionWebsite();
    
    // Track page view
    website.trackPageView();
    
    // Track service interest clicks
    document.querySelectorAll('a[href*="insurance"], a[href*="music"], a[href*="marketing"], a[href*="video"], a[href*="social"], a[href*="business"]').forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            if (href.includes('insurance')) {
                website.trackInsuranceInterest('general');
            } else if (href.includes('music')) {
                website.trackServiceInterest('music_supervision');
            } else if (href.includes('marketing')) {
                website.trackServiceInterest('marketing');
            } else if (href.includes('video')) {
                website.trackServiceInterest('video_production');
            } else if (href.includes('social')) {
                website.trackServiceInterest('social_media');
            } else if (href.includes('business')) {
                website.trackServiceInterest('business_solutions');
            }
        });
    });

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('focusin', () => {
            website.trackFormInteraction(form.id || 'unknown', 'focus');
        });
        
        form.addEventListener('submit', () => {
            website.trackFormInteraction(form.id || 'unknown', 'submit');
        });
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                website.trackEvent('scroll_depth', {
                    depth: maxScroll,
                    page_url: window.location.href
                });
            }
        }
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        website.trackEvent('time_on_page', {
            seconds: timeOnPage,
            page_url: window.location.href
        });
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .insurance-card, .music-card, .marketing-card, .video-card, .social-card, .business-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .insurance-card.animate-in, .music-card.animate-in, .marketing-card.animate-in, 
    .video-card.animate-in, .social-card.animate-in, .business-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-link.active {
        color: #667eea;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);
