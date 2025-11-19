import { FloCore } from './FloFactionCore.js';

class InsMath {
  static calculateIULStep(principal, contribution, rawMarketReturn, cap, floor, costOfInsurance) {
    let effectiveRate = Math.min(cap, Math.max(floor, rawMarketReturn));
    let grossValue = principal + contribution;
    let interest = grossValue * effectiveRate;
    let endValue = grossValue + interest - costOfInsurance;
    return { endValue, effectiveRate, interest };
  }

  static calculateAnnuityPayout(principal, rate, years) {
    const r = rate / 12;
    const n = years * 12;
    return principal * ( (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) );
  }

  static calculateACAsubsidy(householdIncome, familySize, costOfPlan) {
    const fplBase = 15060;
    const perPerson = 5380;
    const fpl = fplBase + ((familySize - 1) * perPerson);
    const povertyPercent = householdIncome / fpl;
    if (povertyPercent < 4.0) {
      const affordablePremium = (householdIncome * 0.085) / 12;
      const subsidy = Math.max(0, costOfPlan - affordablePremium);
      return subsidy;
    }
    return 0;
  }
}

export class IULIllustrator {
  constructor(canvasId, containerId) {
    this.ctx = document.getElementById(canvasId)?.getContext('2d');
    this.container = document.getElementById(containerId);
    this.chart = null;
  }

  async generateIllustration(age, monthlyPremium, initialLumpSum = 0) {
    if (!this.container) return;
    this.container.innerHTML = '<div class="loader">Generating IUL Illustration...</div>';

    const years = 30;
    const cap = 0.105;
    const floor = 0.0075;
    const avgMarketReturn = 0.07;
    let cashValue = initialLumpSum;
    let totalPremiums = initialLumpSum;
    let deathBenefitBase = monthlyPremium * 12 * 25;

    const dataPoints = [];
    const labels = [];
    const deathBenefits = [];

    for (let i = 1; i <= years; i++) {
      const currentAge = Number(age) + i;
      const annualPrem = monthlyPremium * 12;
      const coi = (deathBenefitBase - cashValue) * (0.0005 * Math.exp(0.06 * i));
      const result = InsMath.calculateIULStep(cashValue, annualPrem, avgMarketReturn, cap, floor, coi);
      cashValue = result.endValue;
      totalPremiums += annualPrem;
      const currentDeathBenefit = deathBenefitBase + cashValue;
      dataPoints.push(cashValue);
      deathBenefits.push(currentDeathBenefit);
      labels.push(`Age ${currentAge}`);
    }

    this.renderChart(labels, dataPoints, totalPremiums);
    this.renderSummary(cashValue, deathBenefits[years-1], totalPremiums);
  }

  renderChart(labels, cashValueData, totalPaid) {
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Projected Cash Value (Tax-Free Access)',
            data: cashValueData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'IUL Wealth Accumulation Strategy' }
        }
      }
    });
  }

  renderSummary(fv, db, cost) {
    const profit = fv - cost;
    this.container.innerHTML = `
      <div class="insurance-summary">
        <div class="metric">
          <span>Projected Cash Value</span>
          <strong>$${fv.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>
        </div>
        <div class="metric">
          <span>Death Benefit Protection</span>
          <strong>$${db.toLocaleString(undefined, {maximumFractionDigits:0})}</strong>
        </div>
        <div class="metric highlight">
          <span>Tax-Advantaged Gain</span>
          <strong>+$${profit.toLocaleString(undefined, {maximumFractionDigits:0})}</strong>
        </div>
        <p class="disclaimer">
          *Figures are hypothetical. Not a contract. FloFaction LLC is licensed in all 50 states.
        </p>
        <button class="btn-book" onclick="window.location.href='/book-iul'">Get Official Illustration</button>
      </div>
    `;
  }
}

export class MedicareFinder {
  constructor(formId, resultId) {
    this.form = document.getElementById(formId);
    this.result = document.getElementById(resultId);
    if(this.form) this.form.addEventListener('submit', (e) => this.analyze(e));
  }

  analyze(e) {
    e.preventDefault();
    const data = new FormData(this.form);
    const age = parseInt(data.get('age'));
    const travels = data.get('travels') === 'yes';
    const doctorPreference = data.get('doctor_pref');
    const budget = data.get('budget');

    let recommendation = "";
    let details = "";

    if (age < 64) {
      this.renderError("Medicare is for ages 65+. We can help with ACA/Major Medical instead.");
      return;
    }

    if (travels || doctorPreference === 'specific') {
      recommendation = "Original Medicare + Medigap (Supplement) + Part D";
      details = "Best for nationwide coverage and any doctor. Higher premium, zero copays.";
    } else if (budget === 'low') {
      recommendation = "Medicare Advantage (Part C)";
      details = "All-in-one plan. Low or $0 premium, includes drug coverage, network restrictions.";
    } else {
      recommendation = "Medicare Supplement Plan G";
      details = "Gold Standard coverage. Covers almost all gaps in Original Medicare.";
    }

    this.renderResult(recommendation, details);
  }

  renderResult(rec, det) {
    this.result.innerHTML = `
      <div class="medicare-card">
        <h4>Recommended: ${rec}</h4>
        <p>${det}</p>
        <button onclick="FloCore.request('/api/quote-medicare')">Compare Plans</button>
        <small class="compliance">
          We do not offer every plan. Contact Medicare.gov or 1-800-MEDICARE for all options.
        </small>
      </div>
    `;
  }

  renderError(msg) {
    this.result.innerHTML = `<div class="alert">${msg}</div>`;
  }
}

export class AnnuityCalculator {
  constructor(inputsId, outputId) {
    this.inputs = document.getElementById(inputsId);
    this.output = document.getElementById(outputId);
  }

  calculate() {
    const lumpSum = parseFloat(document.getElementById('annuity-principal').value) || 100000;
    const age = parseFloat(document.getElementById('annuity-age').value) || 60;
    const deferralYears = parseFloat(document.getElementById('annuity-deferral').value) || 0;
    const guaranteedRate = 0.05;
    const payoutRate = 0.06;

    const incomeBase = lumpSum * Math.pow((1 + guaranteedRate), deferralYears);
    const annualIncome = incomeBase * payoutRate;

    this.output.innerHTML = `
      <div class="annuity-result fade-in">
        <div class="row">
          <div class="col">
            <span>Projected Income Base</span>
            <h3>$${incomeBase.toLocaleString(undefined, {maximumFractionDigits:0})}</h3>
          </div>
          <div class="col">
            <span>Lifetime Annual Income</span>
            <h3 class="highlight">$${annualIncome.toLocaleString(undefined, {maximumFractionDigits:0})}</h3>
          </div>
        </div>
        <p>Starting at age ${age + deferralYears}, guaranteed for life.</p>
        <button class="btn-primary">View Fixed Index Annuity Options</button>
      </div>
    `;
  }
}

export class GroupBenefitsEstimator {
  constructor(formId, tableId) {
    this.form = document.getElementById(formId);
    this.table = document.getElementById(tableId);
    if(this.form) this.form.addEventListener('input', () => this.updateEstimate());
  }

  updateEstimate() {
    const data = new FormData(this.form);
    const employees = parseInt(data.get('employees')) || 0;
    const contribution = parseInt(data.get('employer_contribution')) || 50;
    const avgHealth = 450;
    const avgDental = 30;
    const avgLife = 15;
    const totalMonthly = employees * (avgHealth + avgDental + avgLife);
    const employerCost = totalMonthly * (contribution / 100);
    const taxSavings = employerCost * 0.21;

    this.table.innerHTML = `
      <table class="group-benefits-table">
        <tr><td>Total Monthly Premium</td><td>$${totalMonthly.toLocaleString()}</td></tr>
        <tr><td>Employer Cost (${contribution}%)</td><td class="expense">-$${employerCost.toLocaleString()}</td></tr>
        <tr><td>Est. Tax Savings</td><td class="savings">+$${taxSavings.toLocaleString()}</td></tr>
        <tr class="total-row"><td><strong>Net Monthly Cost</strong></td><td><strong>$${(employerCost - taxSavings).toLocaleString()}</strong></td></tr>
      </table>
      <div class="cta-group">
        <p>We build custom Small Business Health Options Program (SHOP) plans.</p>
        <button onclick="window.location.href='/business-quote'">Request Official Group Quote</button>
      </div>
    `;
  }
}

export class ACACalculator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async getQuote(zip, income, age, householdSize) {
    this.container.innerHTML = 'Checking Marketplace subsidies...';
    const baseCost = 450 + (age - 21) * 10;
    const subsidy = InsMath.calculateACAsubsidy(income, householdSize, baseCost);
    const finalPremium = Math.max(0, baseCost - subsidy);

    this.container.innerHTML = `
      <div class="aca-quote">
        <h3>Health Marketplace Estimate</h3>
        <div class="subsidy-badge">${subsidy > 0 ? `Eligible for $${Math.round(subsidy)}/mo Subsidy` : 'Standard Rates Apply'}</div>
        <div class="price-display">
          <span class="label">Est. Monthly Premium:</span>
          <span class="amount">$${Math.round(finalPremium)}</span>
        </div>
        <p class="disclaimer">Based on Silver Plan for Zip ${zip}. Enrollment Open Nov 1 - Jan 15.</p>
      </div>
    `;
  }
}
