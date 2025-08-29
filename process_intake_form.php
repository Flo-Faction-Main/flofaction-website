<?php
// Flo Faction Insurance - Client Intake Form Processor
// This file actually sends real emails when forms are submitted

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session for CSRF token
session_start();

// Generate CSRF token if it doesn't exist
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Allow CORS for form submission
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// CSRF token validation
if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid CSRF token']);
    exit();
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Extract form data
$formData = $data['formData'] ?? [];
$referralAgent = $data['referralAgent'] ?? '';
$selectedPolicies = $data['selectedPolicies'] ?? [];

// Validate selected policies
$allowedPolicies = ['term', 'whole', 'iul', 'annuity', 'mortgage', 'final-expense'];
$selectedPolicies = array_intersect($selectedPolicies, $allowedPolicies);
$timestamp = $data['timestamp'] ?? date('Y-m-d H:i:s');
$signature = $data['signature'] ?? false;

// Validate required fields
$requiredFields = ['firstName', 'lastName', 'email', 'phone'];
foreach ($requiredFields as $field) {
    if (empty($formData[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Sanitize data
$firstName = htmlspecialchars($formData['firstName']);
$lastName = htmlspecialchars($formData['lastName']);
$email = filter_var($formData['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}
$phone = htmlspecialchars($formData['phone']);
$clientName = "$firstName $lastName";

// Your email address (primary recipient)
$yourEmail = 'flofaction.insurance@gmail.com';



// Prepare email content
$subject = "🎯 NEW CLIENT INTAKE: $clientName";

$body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1e3c72; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #1e3c72; background: #f8f9fa; }
        .highlight { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .policy-list { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>🎯 NEW CLIENT INTAKE FORM SUBMITTED</h1>
        <p>Flo Faction Insurance</p>
    </div>
    
    <div class='content'>
        <div class='section'>
            <h2>👤 CLIENT INFORMATION</h2>
            <p><strong>Name:</strong> $clientName</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Phone:</strong> $phone</p>
            <p><strong>Date of Birth:</strong> " . ($formData['dob'] ?? 'Not provided') . "</p>
            <p><strong>Address:</strong> " . ($formData['address'] ?? 'Not provided') . "</p>
        </div>
        
        <div class='section'>
            <h2>🏢 EMPLOYMENT & INCOME</h2>
            <p><strong>Occupation:</strong> " . ($formData['occupation'] ?? 'Not provided') . "</p>
            <p><strong>Employer:</strong> " . ($formData['employer'] ?? 'Not provided') . "</p>
            <p><strong>Annual Income:</strong> " . ($formData['annualIncome'] ?? 'Not provided') . "</p>
        </div>
        
        <div class='section'>
            <h2>💰 FINANCIAL INFORMATION</h2>
            <p><strong>Monthly Budget:</strong> " . ($formData['budgetRange'] ?? 'Not provided') . "</p>
            <p><strong>Monthly Debt:</strong> " . ($formData['monthlyDebt'] ?? 'Not provided') . "</p>
            <p><strong>Monthly Expenses:</strong> " . ($formData['monthlyExpenses'] ?? 'Not provided') . "</p>
            <p><strong>Emergency Fund:</strong> " . ($formData['emergencyFund'] ?? 'Not provided') . "</p>
        </div>
        
        <div class='section'>
            <h2>🛡️ INSURANCE PREFERENCES</h2>
            <div class='policy-list'>
                <h3>Selected Policies:</h3>
                <ul>
";

// Add selected policies to email
if (!empty($selectedPolicies)) {
    foreach ($selectedPolicies as $policy) {
        $policyName = ucfirst(str_replace('-', ' ', $policy));
        $body .= "                    <li>$policyName</li>\n";
    }
} else {
    $body .= "                    <li>No specific policies selected</li>\n";
}

$body .= "
                </ul>
            </div>
        </div>
        
        <div class='section'>
            <h2>📋 FORM DETAILS</h2>
            <p><strong>Submission Time:</strong> " . date('F j, Y \a\t g:i A', strtotime($timestamp)) . "</p>
            <p><strong>Digital Signature:</strong> " . ($signature ? '✅ Provided' : '❌ Not provided') . "</p>
            <p><strong>Referral Source:</strong> " . ($referralAgent ? ucfirst(str_replace('-', ' ', $referralAgent)) : 'Direct submission') . "</p>
        </div>
        
        <div class='highlight'>
            <h3>🚀 NEXT STEPS:</h3>
            <ol>
                <li>Review client information and preferences</li>
                <li>Prepare personalized insurance illustrations</li>
                <li>Schedule consultation call with client</li>
                <li>Follow up with referring agent if applicable</li>
            </ol>
        </div>
        
        <p style='margin-top: 30px; text-align: center; color: #666;'>
            This email was automatically generated by the Flo Faction Insurance intake form system.
        </p>
    </div>
</body>
</html>
";

// Email headers
$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Flo Faction Insurance <noreply@flofaction.com>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
);

// Send email to you (primary)
$mailSent = mail($yourEmail, $subject, $body, implode("\r\n", $headers));

// Log email status
if (!$mailSent) {
    error_log("Failed to send intake form email to $yourEmail");
}

// Send referral notification if applicable
$referralSent = false;
if ($referralAgent && $referralAgent !== 'social-media' && $referralAgent !== 'friend-family' && $referralAgent !== 'search') {
    $referralSent = sendReferralNotification($referralAgent, $clientName, $email, $phone, $timestamp);
}

// Log the submission
$logEntry = [
    'id' => 'FF-' . date('Ymd-His') . '-' . rand(1000, 9999),
    'timestamp' => $timestamp,
    'clientName' => $clientName,
    'clientEmail' => $email,
    'clientPhone' => $phone,
    'referralAgent' => $referralAgent,
    'selectedPolicies' => $selectedPolicies,
    'status' => 'submitted',
    'signature' => $signature
];

// Store in simple JSON file (in production, use a database)
// IMPORTANT: Storing submissions in a publicly accessible JSON file is a major security risk.
// Use a database or a secure, non-public directory for production environments.
$logFile = 'intake_submissions.json';
$existingLogs = [];
if (file_exists($logFile)) {
    $existingLogs = json_decode(file_get_contents($logFile), true) ?? [];
}
$existingLogs[] = $logEntry;
file_put_contents($logFile, json_encode($existingLogs, JSON_PRETTY_PRINT));

// Return success response
$response = [
    'success' => true,
    'message' => 'Intake form submitted successfully!',
    'submissionId' => $logEntry['id'],
    'emailSent' => $mailSent,
    'referralNotified' => $referralSent,
    'timestamp' => $timestamp
];

echo json_encode($response);

/**
 * Send referral notification to the referring agent
 */
function sendReferralNotification($agentId, $clientName, $clientEmail, $clientPhone, $timestamp) {
    $agentEmails = [
        'justine-edwards' => 'justine.theinsurancequeen@gmail.com',
        'sandy-garcia' => 'sandra.theinsurancebroker28@gmail.com',
        'paul-edwards' => 'flofaction.insurance@gmail.com'
    ];
    
    if (!isset($agentEmails[$agentId])) {
        return false;
    }
    
    $agentEmail = $agentEmails[$agentId];
    $agentName = ucfirst(str_replace('-', ' ', $agentId));
    
    $subject = "🎯 REFERRAL SUCCESS: $clientName";
    
    $body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .highlight { background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🎯 REFERRAL SUCCESS!</h1>
            <p>Your referral has submitted an intake form!</p>
        </div>
        
        <div class='content'>
            <div class='highlight'>
                <h2>Client Information:</h2>
                <p><strong>Name:</strong> $clientName</p>
                <p><strong>Email:</strong> $clientEmail</p>
                <p><strong>Phone:</strong> $clientPhone</p>
                <p><strong>Submission Time:</strong> " . date('F j, Y \a\t g:i A', strtotime($timestamp)) . "</p>
            </div>
            
            <p>Great job! Your referral has taken the first step toward getting insurance coverage.</p>
            
            <p><strong>What happens next:</strong></p>
            <ol>
                <li>Flo Faction will review the client's information</li>
                <li>We'll prepare personalized insurance illustrations</li>
                <li>We'll contact the client to schedule a consultation</li>
                <li>You'll receive commission details once the policy is issued</li>
            </ol>
            
            <p style='margin-top: 20px; color: #28a745; font-weight: bold;'>
                Thank you for the referral! This is exactly how we grow together. 🚀
            </p>
            
            <p style='margin-top: 30px; text-align: center; color: #666;'>
                Flo Faction Insurance Team
            </p>
        </div>
    </body>
    </html>
    ";
    
    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Flo Faction Insurance <noreply@flofaction.com>',
        'Reply-To: flofaction.insurance@gmail.com',
        'X-Mailer: PHP/' . phpversion()
    );
    
    $mailSent = mail($agentEmail, $subject, $body, implode("\r\n", $headers));

    // Log email status
    if (!$mailSent) {
        error_log("Failed to send referral notification email to $agentEmail");
    }

    return $mailSent;
}
?>
