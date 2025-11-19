// FloFaction Analytics & Conversion Tracking
// Comprehensive event tracking and user behavior analytics

(function() {
    'use strict';

    // Analytics Configuration
    const FloAnalytics = {
        // Track page views
        trackPageView: function() {
            const pageData = {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`
            };
            
            this.sendEvent('page_view', pageData);
            console.log('Page view tracked:', pageData);
        },

        // Track button clicks
        trackButtonClick: function(buttonName, buttonType) {
            const eventData = {
                button_name: buttonName,
                button_type: buttonType,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent('button_click', eventData);
        },

        // Track form submissions
        trackFormSubmit: function(formName, formData) {
            const eventData = {
                form_name: formName,
                page: window.location.pathname,
                fields_filled: Object.keys(formData).length,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent('form_submit', eventData);
        },

        // Track conversions
        trackConversion: function(conversionType, value) {
            const eventData = {
                conversion_type: conversionType,
                value: value,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent('conversion', eventData);
        },

        // Track scroll depth
        trackScrollDepth: function() {
            let maxScroll = 0;
            const milestones = [25, 50, 75, 100];
            const tracked = new Set();

            window.addEventListener('scroll', () => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
                
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                }

                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !tracked.has(milestone)) {
                        tracked.add(milestone);
                        this.sendEvent('scroll_depth', {
                            depth: milestone,
                            page: window.location.pathname,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            });
        },

        // Track time on page
        trackTimeOnPage: function() {
            const startTime = Date.now();
            
            window.addEventListener('beforeunload', () => {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                this.sendEvent('time_on_page', {
                    seconds: timeSpent,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString()
                });
            });
        },

        // Track outbound links
        trackOutboundLinks: function() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.hostname !== window.location.hostname) {
                    this.sendEvent('outbound_link', {
                        url: link.href,
                        text: link.textContent,
                        page: window.location.pathname,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        },

        // Track CTA interactions
        trackCTAInteraction: function(ctaName, ctaType) {
            this.sendEvent('cta_interaction', {
                cta_name: ctaName,
                cta_type: ctaType,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        },

        // Send event to analytics service
        sendEvent: function(eventName, eventData) {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, eventData);
            }

            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', eventName, eventData);
            }

            // Custom analytics endpoint (optional)
            if (window.location.hostname !== 'localhost') {
                navigator.sendBeacon('/api/analytics', JSON.stringify({
                    event: eventName,
                    data: eventData
                }));
            }
        },

        // Initialize all tracking
        init: function() {
            this.trackPageView();
            this.trackScrollDepth();
            this.trackTimeOnPage();
            this.trackOutboundLinks();
            this.setupEventListeners();
        },

        // Setup event listeners for interactive elements
        setupEventListeners: function() {
            // Track all button clicks
            document.addEventListener('click', (e) => {
                const button = e.target.closest('button, .btn, .cta-button, [role="button"]');
                if (button) {
                    const buttonText = button.textContent.trim();
                    const buttonClass = button.className;
                    this.trackButtonClick(buttonText, buttonClass);
                }
            });

            // Track all form submissions
            document.addEventListener('submit', (e) => {
                const form = e.target;
                if (form.tagName === 'FORM') {
                    const formId = form.id || form.name || 'unnamed_form';
                    const formData = new FormData(form);
                    const formFields = {};
                    
                    for (let [key, value] of formData.entries()) {
                        // Don't send sensitive data
                        if (!key.includes('password') && !key.includes('ssn') && !key.includes('credit')) {
                            formFields[key] = value.length; // Send length only
                        }
                    }
                    
                    this.trackFormSubmit(formId, formFields);
                }
            });

            // Track video plays
            document.addEventListener('play', (e) => {
                if (e.target.tagName === 'VIDEO') {
                    this.sendEvent('video_play', {
                        video_src: e.target.src,
                        page: window.location.pathname
                    });
                }
            }, true);

            // Track email/phone clicks
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link) {
                    if (link.href.startsWith('mailto:')) {
                        this.trackCTAInteraction('email_click', 'email');
                    } else if (link.href.startsWith('tel:')) {
                        this.trackCTAInteraction('phone_click', 'phone');
                    }
                }
            });
        }
    };

    // Initialize analytics when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => FloAnalytics.init());
    } else {
        FloAnalytics.init();
    }

    // Make FloAnalytics available globally
    window.FloAnalytics = FloAnalytics;

    // Enhanced conversion tracking for specific pages
    if (window.location.pathname.includes('/quote')) {
        document.addEventListener('DOMContentLoaded', () => {
            const quoteForm = document.querySelector('form');
            if (quoteForm) {
                quoteForm.addEventListener('submit', () => {
                    FloAnalytics.trackConversion('quote_request', 1);
                });
            }
        });
    }

    if (window.location.pathname.includes('/checkout')) {
        document.addEventListener('DOMContentLoaded', () => {
            const checkoutForm = document.querySelector('form');
            if (checkoutForm) {
                checkoutForm.addEventListener('submit', () => {
                    FloAnalytics.trackConversion('purchase', 1);
                });
            }
        });
    }

    if (window.location.pathname.includes('/client-intake-form')) {
        document.addEventListener('DOMContentLoaded', () => {
            const intakeForm = document.querySelector('form');
            if (intakeForm) {
                intakeForm.addEventListener('submit', () => {
                    FloAnalytics.trackConversion('client_intake', 1);
                });
            }
        });
    }

    // Performance monitoring
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            FloAnalytics.sendEvent('page_performance', {
                load_time: loadTime,
                dom_content_loaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                page: window.location.pathname
            });
        }
    });

})();
