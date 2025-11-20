// Flo Faction CRM - Vercel Serverless Function
// Handles lead submissions with email routing and SMS alerts

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leadData = req.body;
    const leadId = `${leadData.service_type}-${Date.now()}`;
    
    // Determine email routing based on service type
    const emailRouting = {
      // Insurance services
      'IUL': 'flofaction.insurance@gmail.com',
      'AUTO': 'flofaction.insurance@gmail.com',
      'HOMEOWNERS': 'flofaction.insurance@gmail.com',
      'LIFE': 'flofaction.insurance@gmail.com',
      'HEALTH': 'flofaction.insurance@gmail.com',
      'ANNUITIES': 'flofaction.insurance@gmail.com',
      'MEDICARE': 'flofaction.insurance@gmail.com',
      'ACA': 'flofaction.insurance@gmail.com',
      
      // Business services
      'TAX': 'flofaction.business@gmail.com',
      'NOTARY': 'flofaction.business@gmail.com',
      
      // General services
      'EMERGENCY': 'flofactionllc@gmail.com',
      'AI': 'flofactionllc@gmail.com',
      'DOD': 'flofactionllc@gmail.com',
      'FEMA': 'flofactionllc@gmail.com',
      'OTHER': 'flofactionllc@gmail.com'
    };

    const targetEmail = emailRouting[leadData.service_type] || 'flofactionllc@gmail.com';

    // Format lead details for email
    const emailSubject = `🔔 NEW LEAD - ${leadData.service_type} | ${leadData.contact.name}`;
    const emailBody = formatLeadEmail(leadData, leadId);

    // Send email notification
    await sendEmail({
      to: targetEmail,
      cc: 'flofactionllc@gmail.com', // Always CC main account
      subject: emailSubject,
      html: emailBody
    });

    // Send SMS alert via Google Voice email gateway
    const smsMessage = `🔔 NEW LEAD - ${leadData.service_type}\n\nName: ${leadData.contact.name}\nEmail: ${leadData.contact.email}\nPhone: ${leadData.contact.phone}\n\n📊 Full Details: https://www.flofaction.com/crm/${leadId}\n\nLead ID: ${leadId}`;
    
    await sendSMS({
      to: '7722089646@txt.voice.google.com', // Google Voice SMS gateway
      message: smsMessage
    });

    // Store lead in database (implement your database logic here)
    await storeLead({
      lead_id: leadId,
      timestamp: new Date().toISOString(),
      ...leadData,
      status: 'new',
      email_sent_to: targetEmail
    });

    // Return success response
    return res.status(200).json({
      success: true,
      lead_id: leadId,
      message: 'Lead submitted successfully'
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process lead submission'
    });
  }
}

// Format lead details into HTML email
function formatLeadEmail(leadData, leadId) {
  const serviceIcons = {
    'IUL': '💰',
    'AUTO': '🚗',
    'HOMEOWNERS': '🏠',
    'LIFE': '❤️',
    'HEALTH': '🏥',
    'ANNUITIES': '📈',
    'MEDICARE': '👴',
    'ACA': '🏥',
    'TAX': '💼',
    'NOTARY': '✍️'
  };

  const icon = serviceIcons[leadData.service_type] || '📋';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
        .field { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #667eea; }
        .label { font-weight: bold; color: #667eea; }
        .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${icon} NEW LEAD - ${leadData.service_type}</h1>
          <p>Lead ID: ${leadId}</p>
          <p>${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
        </div>
        
        <div class="content">
          <h2>Contact Information</h2>
          <div class="field">
            <span class="label">Name:</span> ${leadData.contact.name}
          </div>
          <div class="field">
            <span class="label">Email:</span> <a href="mailto:${leadData.contact.email}">${leadData.contact.email}</a>
          </div>
          <div class="field">
            <span class="label">Phone:</span> <a href="tel:${leadData.contact.phone}">${leadData.contact.phone}</a>
          </div>
          
          <h2>Lead Details</h2>
          ${formatLeadDetails(leadData)}
          
          <a href="https://www.flofaction.com/crm/${leadId}" class="button">View Full Lead in CRM →</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Format specific lead details based on service type
function formatLeadDetails(leadData) {
  let html = '';
  
  if (leadData.vehicle) {
    html += '<h3>Vehicle Information</h3>';
    html += `<div class="field"><span class="label">Vehicle:</span> ${leadData.vehicle.year} ${leadData.vehicle.make} ${leadData.vehicle.model}</div>`;
  }
  
  if (leadData.property) {
    html += '<h3>Property Information</h3>';
    html += `<div class="field"><span class="label">Address:</span> ${leadData.property.address}, ${leadData.property.city}, ${leadData.property.state} ${leadData.property.zip}</div>`;
    html += `<div class="field"><span class="label">Property Type:</span> ${leadData.property.type}</div>`;
    html += `<div class="field"><span class="label">Year Built:</span> ${leadData.property.year_built}</div>`;
    html += `<div class="field"><span class="label">Square Footage:</span> ${leadData.property.sqft} sq ft</div>`;
  }
  
  if (leadData.coverage_needs) {
    html += '<h3>Coverage Preferences</h3>';
    html += `<div class="field"><span class="label">Priority:</span> ${leadData.coverage_needs.priority}</div>`;
    if (leadData.coverage_needs.max_budget) {
      html += `<div class="field"><span class="label">Max Budget:</span> $${leadData.coverage_needs.max_budget}</div>`;
    }
  }
  
  return html;
}

// Send email using your preferred email service (implement with Sendgrid, Resend, etc.)
async function sendEmail({ to, cc, subject, html }) {
  // TODO: Implement with your email service
  // Example with Resend:
  /*
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'leads@flofaction.com',
      to: [to],
      cc: [cc],
      subject,
      html
    })
  });
  return response.json();
  */
  
  console.log('Email would be sent to:', to);
  console.log('Subject:', subject);
  return { success: true };
}

// Send SMS via Google Voice email gateway
async function sendSMS({ to, message }) {
  // Send to Google Voice email-to-SMS gateway
  return await sendEmail({
    to: to,
    subject: 'New Flo Faction Lead',
    html: `<pre>${message}</pre>`
  });
}

// Store lead in database
async function storeLead(lead) {
  // TODO: Implement database storage (Vercel KV, Supabase, etc.)
  console.log('Lead would be stored:', lead);
  return { success: true };
}
