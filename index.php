<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FloFaction LLC - Business Solutions & Insurance Management</title>
    <meta name="description" content="FloFaction LLC provides comprehensive business solutions including insurance management, music supervision, marketing, video production, and social media management.">
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>FloFaction LLC</h2>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#home" class="nav-link">Home</a>
                </li>
                <li class="nav-item">
                    <a href="#services" class="nav-link">Services</a>
                </li>
                <li class="nav-item">
                    <a href="#insurance" class="nav-link">Insurance</a>
                </li>
                <li class="nav-item">
                    <a href="#about" class="nav-link">About</a>
                </li>
                <li class="nav-item">
                    <a href="#contact" class="nav-link">Contact</a>
                </li>
            </ul>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-content">
            <h1>Transform Your Business with FloFaction</h1>
            <p>Comprehensive business solutions, insurance management, and creative services to scale your success.</p>
            <div class="hero-buttons">
                <a href="#insurance" class="btn btn-primary">Get Insurance Quote</a>
                <a href="#contact" class="btn btn-secondary">Start Your Project</a>
            </div>
        </div>
        <div class="hero-image">
            <div class="hero-graphic">
                <i class="fas fa-chart-line"></i>
                <i class="fas fa-shield-alt"></i>
                <i class="fas fa-music"></i>
                <i class="fas fa-video"></i>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services">
        <div class="container">
            <h2>Our Comprehensive Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>Insurance Management</h3>
                    <p>Complete insurance solutions with live quotes, carrier integration, and expert guidance.</p>
                    <a href="#insurance" class="service-link">Learn More</a>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <h3>Music Supervision</h3>
                    <p>Professional music licensing, clearance, and supervision for media projects.</p>
                    <a href="#contact" class="service-link">Get Started</a>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-bullhorn"></i>
                    </div>
                    <h3>Marketing & Branding</h3>
                    <p>Strategic marketing campaigns, brand development, and growth strategies.</p>
                    <a href="#contact" class="service-link">Learn More</a>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <h3>Video Production</h3>
                    <p>Professional video content creation, editing, and post-production services.</p>
                    <a href="#contact" class="service-link">Get Quote</a>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <h3>Social Media Management</h3>
                    <p>Complete social media strategy, content creation, and community management.</p>
                    <a href="#contact" class="service-link">Learn More</a>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <h3>Business Solutions</h3>
                    <p>Strategic consulting, process optimization, and business development services.</p>
                    <a href="#contact" class="service-link">Get Started</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Insurance Section -->
    <section id="insurance" class="insurance">
        <div class="container">
            <h2>Insurance Management Solutions</h2>
            <p class="section-subtitle">Get live quotes, manage policies, and secure the best coverage for your needs.</p>
            
            <!-- Live Quote Generator -->
            <div class="quote-generator">
                <h3>Live Insurance Quote Generator</h3>
                <form id="quoteForm" class="quote-form">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">First Name *</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name *</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone *</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="insuranceType">Insurance Type *</label>
                            <select id="insuranceType" name="insuranceType" required>
                                <option value="">Select Insurance Type</option>
                                <option value="life">Life Insurance</option>
                                <option value="health">Health Insurance</option>
                                <option value="auto">Auto Insurance</option>
                                <option value="home">Home Insurance</option>
                                <option value="business">Business Insurance</option>
                                <option value="disability">Disability Insurance</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="coverageAmount">Coverage Amount</label>
                            <select id="coverageAmount" name="coverageAmount">
                                <option value="">Select Coverage</option>
                                <option value="100k">$100,000</option>
                                <option value="250k">$250,000</option>
                                <option value="500k">$500,000</option>
                                <option value="1m">$1,000,000</option>
                                <option value="2m">$2,000,000+</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="additionalInfo">Additional Information</label>
                        <textarea id="additionalInfo" name="additionalInfo" rows="3" placeholder="Tell us about your specific needs..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Get Live Quote</button>
                </form>
            </div>

            <!-- Client Intake Form -->
            <div class="client-intake">
                <h3>New Client Intake Form</h3>
                <form id="intakeForm" class="intake-form">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="intakeFirstName">First Name *</label>
                            <input type="text" id="intakeFirstName" name="intakeFirstName" required>
                        </div>
                        <div class="form-group">
                            <label for="intakeLastName">Last Name *</label>
                            <input type="text" id="intakeLastName" name="intakeLastName" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="intakeEmail">Email *</label>
                            <input type="email" id="intakeEmail" name="intakeEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="intakePhone">Phone *</label>
                            <input type="tel" id="intakePhone" name="intakePhone" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="businessName">Business Name</label>
                            <input type="text" id="businessName" name="businessName">
                        </div>
                        <div class="form-group">
                            <label for="industry">Industry</label>
                            <select id="industry" name="industry">
                                <option value="">Select Industry</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="technology">Technology</option>
                                <option value="retail">Retail</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="services">Professional Services</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="servicesNeeded">Services Needed *</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="servicesNeeded" value="insurance"> Insurance Management
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="servicesNeeded" value="music"> Music Supervision
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="servicesNeeded" value="marketing"> Marketing & Branding
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="servicesNeeded" value="video"> Video Production
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="servicesNeeded" value="social"> Social Media Management
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="servicesNeeded" value="consulting"> Business Consulting
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="projectDescription">Project Description</label>
                        <textarea id="projectDescription" name="projectDescription" rows="4" placeholder="Describe your project or business needs..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="budget">Budget Range</label>
                        <select id="budget" name="budget">
                            <option value="">Select Budget Range</option>
                            <option value="under5k">Under $5,000</option>
                            <option value="5k-15k">$5,000 - $15,000</option>
                            <option value="15k-50k">$15,000 - $50,000</option>
                            <option value="50k-100k">$50,000 - $100,000</option>
                            <option value="over100k">Over $100,000</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="timeline">Project Timeline</label>
                        <select id="timeline" name="timeline">
                            <option value="">Select Timeline</option>
                            <option value="immediate">Immediate (1-2 weeks)</option>
                            <option value="short">Short Term (1-3 months)</option>
                            <option value="medium">Medium Term (3-6 months)</option>
                            <option value="long">Long Term (6+ months)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit Intake Form</button>
                </form>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
        <div class="container">
            <div class="about-content">
                <div class="about-text">
                    <h2>About FloFaction LLC</h2>
                    <p>FloFaction LLC is a comprehensive business solutions company dedicated to helping businesses scale, optimize, and succeed in today's competitive market.</p>
                    <p>We specialize in insurance management, creative services, and strategic business consulting, providing end-to-end solutions that drive growth and efficiency.</p>
                    <div class="about-stats">
                        <div class="stat">
                            <h3>100+</h3>
                            <p>Clients Served</p>
                        </div>
                        <div class="stat">
                            <h3>5+</h3>
                            <p>Years Experience</p>
                        </div>
                        <div class="stat">
                            <h3>24/7</h3>
                            <p>Support Available</p>
                        </div>
                    </div>
                </div>
                <div class="about-image">
                    <div class="about-graphic">
                        <i class="fas fa-users"></i>
                        <i class="fas fa-handshake"></i>
                        <i class="fas fa-award"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="container">
            <h2>Get In Touch</h2>
            <p class="section-subtitle">Ready to transform your business? Let's discuss your project.</p>
            
            <div class="contact-content">
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <h4>Email</h4>
                            <p>info@flofaction.com</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <h4>Phone</h4>
                            <p>+1 (555) 123-4567</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <h4>Location</h4>
                            <p>Florida, United States</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <h4>Business Hours</h4>
                            <p>Mon-Fri: 9:00 AM - 6:00 PM EST</p>
                        </div>
                    </div>
                </div>
                
                <div class="contact-form">
                    <h3>Send Us a Message</h3>
                    <form id="contactForm">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactFirstName">First Name *</label>
                                <input type="text" id="contactFirstName" name="contactFirstName" required>
                            </div>
                            <div class="form-group">
                                <label for="contactLastName">Last Name *</label>
                                <input type="text" id="contactLastName" name="contactLastName" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactEmail">Email *</label>
                                <input type="email" id="contactEmail" name="contactEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="contactPhone">Phone</label>
                                <input type="tel" id="contactPhone" name="contactPhone">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="contactSubject">Subject *</label>
                            <input type="text" id="contactSubject" name="contactSubject" required>
                        </div>
                        <div class="form-group">
                            <label for="contactMessage">Message *</label>
                            <textarea id="contactMessage" name="contactMessage" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>FloFaction LLC</h3>
                    <p>Comprehensive business solutions for the modern enterprise.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="#insurance">Insurance Management</a></li>
                        <li><a href="#services">Music Supervision</a></li>
                        <li><a href="#services">Marketing & Branding</a></li>
                        <li><a href="#services">Video Production</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#contact">Contact</a></li>
                        <li><a href="#privacy">Privacy Policy</a></li>
                        <li><a href="#terms">Terms of Service</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact Info</h4>
                    <p>Email: info@flofaction.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                    <p>Location: Florida, United States</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 FloFaction LLC. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Notification System -->
    <div id="notification" class="notification"></div>

    <script src="script.js"></script>
</body>
</html>
