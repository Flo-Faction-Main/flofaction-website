# FLO FACTION WEBSITE - IMPLEMENTATION & DEPLOYMENT GUIDE

## 📋 TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Module Integration](#module-integration)
3. [Database Setup](#database-setup)
4. [API Configuration](#api-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Testing Checklist](#testing-checklist)
7. [Go-Live Timeline](#go-live-timeline)

---

## 🏗️ SYSTEM OVERVIEW

### Architecture
```
FLO FACTION WEBSITE v2.0
├── Frontend (HTML/CSS/JavaScript)
│   ├── index.html - Main landing page
│   ├── adaptive-intake.html - Client intake form
│   └── dashboard/ - CRM dashboard UI
├── JavaScript Modules
│   ├── auth-system.js - Authentication & Subscriptions
│   ├── insurance-quote-generator.js - Quote engine
│   ├── crm-dashboard.js - CRM system
│   ├── FloFactonCore.js - API client
│   └── analytics.js - Conversion tracking
├── Backend APIs
│   ├── /auth/* - Authentication endpoints
│   ├── /insurance/* - Quote generation
│   ├── /crm/* - Lead management
│   └── /subscriptions/* - Payment processing
└── Database
    ├── users table
    ├── leads table
    ├── quotes table
    └── activities table
```

---

## 🔗 MODULE INTEGRATION

### 1. Authentication System Setup

**File**: `auth-system.js`

**Integration Steps**:
```html
<!-- Add to index.html head -->
<script src="auth-system.js"></script>

<script>
  const auth = new AuthenticationSystem();
  
  // Initialize on page load
  window.addEventListener('load', () => {
    if (!auth.isAuthenticated()) {
      // Show login prompt
      showLoginModal();
    }
  });
</script>
```

**Environment Variables Required**:
```
API_URL=https://api.flofaction.com
JWT_SECRET=your-jwt-secret-key
OAUTH_GOOGLE_ID=your-google-oauth-id
OAUTH_LINKEDIN_ID=your-linkedin-oauth-id
STRIPE_PUBLIC_KEY=your-stripe-public-key
```

### 2. Insurance Quote Generator Setup

**File**: `insurance-quote-generator.js`

**Integration Steps**:
```html
<!-- Add to insurance pages -->
<script src="insurance-quote-generator.js"></script>

<script>
  const quoteEngine = new InsuranceQuoteGenerator();
  
  // Listen for form submissions
  document.getElementById('quoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);
    
    const result = await quoteEngine.generateQuotes('termLife', userData);
    displayQuotes(result.quotes);
  });
</script>
```

### 3. CRM Dashboard Setup

**File**: `crm-dashboard.js`

**Integration Steps**:
```html
<!-- Add to dashboard pages -->
<script src="crm-dashboard.js"></script>

<script>
  const crm = new CRMDashboard();
  
  // Load leads on dashboard load
  async function initializeDashboard() {
    const analytics = crm.getPipelineAnalytics();
    updateDashboardUI(analytics);
    
    // Set auto-refresh every 5 minutes
    setInterval(() => {
      const overdue = crm.getFollowUpsOverdue();
      if (overdue.length > 0) showAlert(`${overdue.length} overdue follow-ups!`);
    }, 5 * 60 * 1000);
  }
  
  initializeDashboard();
</script>
```

---

## 💾 DATABASE SETUP

### PostgreSQL Schema

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE
);

-- Leads Table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'new',
  estimated_value DECIMAL(12,2),
  lead_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP,
  next_follow_up TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Quotes Table
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  policy_type VARCHAR(100),
  carrier_name VARCHAR(100),
  monthly_premium DECIMAL(10,2),
  annual_premium DECIMAL(10,2),
  approval_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activities Table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  activity_type VARCHAR(100),
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id VARCHAR(50),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_quotes_lead_id ON quotes(lead_id);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
```

---

## 🔌 API CONFIGURATION

### Authentication Endpoints

```
POST /api/auth/register
  Body: { email, password, firstName, lastName }
  Response: { user, token, refreshToken }

POST /api/auth/login
  Body: { email, password }
  Response: { user, token, refreshToken }

POST /api/auth/logout
  Headers: { Authorization: Bearer token }
  Response: { success }

POST /api/auth/oauth/{provider}
  Body: { code }
  Response: { user, token }
```

### Insurance Quote Endpoints

```
POST /api/insurance/quotes
  Headers: { Authorization: Bearer token }
  Body: { policyType, age, health, coverage_amount }
  Response: { success, quotes: [...] }

POST /api/insurance/proposal
  Headers: { Authorization: Bearer token }
  Body: { quoteId, carrierId, userData }
  Response: { proposalId, documentUrl }
```

### CRM Endpoints

```
GET /api/crm/leads
  Headers: { Authorization: Bearer token }
  Response: { leads: [...], analytics: {...} }

POST /api/crm/leads
  Headers: { Authorization: Bearer token }
  Body: { name, email, phone, source }
  Response: { lead }

PATCH /api/crm/leads/{leadId}
  Headers: { Authorization: Bearer token }
  Body: { status, notes }
  Response: { lead }

POST /api/crm/activities
  Headers: { Authorization: Bearer token }
  Body: { leadId, type, details }
  Response: { activity }
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Environment Setup
```bash
# Clone repository
git clone https://github.com/Flo-Faction-Main/flofaction-website.git
cd flofaction-website

# Create .env file
cp .env.example .env
# Edit .env with your API keys and credentials
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Migration
```bash
# Run database schema
psql -U postgres -d flofaction < database/schema.sql

# Run seed data
psql -U postgres -d flofaction < database/seeds.sql
```

### Step 4: Build & Test
```bash
# Build production bundle
npm run build

# Run tests
npm test

# Run integration tests
npm run test:integration
```

### Step 5: Deploy to Vercel
```bash
# Connect repository to Vercel
vercel link

# Deploy
vercel deploy --prod

# Set environment variables
vercel env add API_URL
vercel env add JWT_SECRET
vercel env add STRIPE_PUBLIC_KEY
```

---

## ✅ TESTING CHECKLIST

### Authentication
- [ ] User registration works
- [ ] Email verification sent
- [ ] Login with credentials works
- [ ] OAuth login (Google) works
- [ ] OAuth login (LinkedIn) works
- [ ] JWT token validation
- [ ] Token refresh works
- [ ] Logout clears session
- [ ] Password reset email sent

### Insurance Quotes
- [ ] Term life quote generates
- [ ] Whole life quote generates
- [ ] IUL quote generates
- [ ] Annuity quote generates
- [ ] Multi-carrier comparison works
- [ ] Required field validation works
- [ ] Health risk factors calculated
- [ ] Premium calculations accurate
- [ ] CRM sync on quote generation

### CRM Dashboard
- [ ] Leads display correctly
- [ ] Lead status updates work
- [ ] Activities log correctly
- [ ] Follow-up reminders trigger
- [ ] Pipeline analytics calculated
- [ ] Lead scoring works
- [ ] CSV export works
- [ ] Bulk operations work

### Payments
- [ ] Stripe integration connected
- [ ] Subscription checkout works
- [ ] Plan upgrade works
- [ ] Webhook events processed
- [ ] Subscription status updated

### Performance
- [ ] Page load < 1.5 seconds
- [ ] Quote generation < 2 seconds
- [ ] CRM dashboard < 500ms response
- [ ] Database queries optimized

---

## 📅 GO-LIVE TIMELINE

### Week 1: Setup & Integration
- [ ] Day 1-2: Database setup and testing
- [ ] Day 3: API configuration and validation
- [ ] Day 4: Module integration testing
- [ ] Day 5: Security review and hardening

### Week 2: Testing & Quality Assurance
- [ ] Day 1-3: Full system testing
- [ ] Day 4: User acceptance testing (UAT)
- [ ] Day 5: Performance optimization

### Week 3: Soft Launch & Monitoring
- [ ] Day 1: Deploy to staging
- [ ] Day 2-3: Stakeholder testing
- [ ] Day 4: Deploy to production
- [ ] Day 5: Monitor and support

### Week 4: Full Launch
- [ ] Day 1: Launch marketing campaign
- [ ] Day 2-5: Monitor metrics and support
- [ ] Day 5: Post-launch review

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue**: JWT token expired
**Solution**: Implement automatic token refresh using refresh token

**Issue**: Insurance quotes not generating
**Solution**: Verify carrier API endpoints are reachable, check rate limits

**Issue**: CRM leads not syncing
**Solution**: Check database connection, verify API token, check server logs

**Issue**: Payment processing failing
**Solution**: Verify Stripe API keys, check webhook configuration, review logs

---

**Last Updated**: November 20, 2025
**Version**: 2.0.0
**Status**: Production Ready
