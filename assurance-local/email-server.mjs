import http from 'http';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const PORT = process.env.PORT || 3001;

// Email configuration - Configure with your SMTP details
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function sendEmergencyEmail(contactEmail, contactName, location, timestamp) {
  const locationLink = location 
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : 'Location not available';
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: contactEmail,
    subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Times New Roman', Georgia, serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .alert-body { background: #fff3f3; padding: 30px; border: 3px solid #dc2626; border-top: none; border-radius: 0 0 8px 8px; }
          .location-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .action-button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
          .timestamp { color: #666; font-size: 14px; margin-top: 20px; }
          .warning { color: #92400e; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-header">
            <h1 style="margin:0; font-size: 28px;">🚨 EMERGENCY ALERT</h1>
            <p style="margin:10px 0 0; font-size: 16px;">Someone needs your help immediately</p>
          </div>
          <div class="alert-body">
            <p><strong>Dear ${contactName},</strong></p>
            
            <p class="warning">This is an automated emergency alert from Assurance Safety App.</p>
            
            <p>Your trusted contact has triggered an emergency alert and may need immediate assistance.</p>
            
            <div class="location-box">
              <h3 style="margin-top:0; color: #dc2626;">📍 Current Location</h3>
              ${location ? `
                <p><strong>Coordinates:</strong> ${location.latitude}, ${location.longitude}</p>
                <a href="${locationLink}" class="action-button" target="_blank">View Location on Google Maps</a>
              ` : '<p>Location information is not available at this time.</p>'}
            </div>
            
            <h3>⚡ Recommended Actions:</h3>
            <ul>
              <li><strong>Try to contact them immediately</strong> via phone or messaging</li>
              <li><strong>Check their last known location</strong> using the map link above</li>
              <li><strong>If you cannot reach them</strong>, consider contacting local authorities</li>
              <li><strong>Emergency Services:</strong> Dial 100 (Police) or 112 (Emergency)</li>
            </ul>
            
            <p class="timestamp">
              <strong>Alert Time:</strong> ${new Date(timestamp).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 13px; color: #666;">
              This email was sent automatically by Assurance Safety App because you are listed as a trusted contact. 
              If you believe this is a false alarm, please contact your friend to confirm their safety.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🚨 EMERGENCY ALERT - IMMEDIATE ASSISTANCE NEEDED

Dear ${contactName},

This is an automated emergency alert from Assurance Safety App.

Your trusted contact has triggered an emergency alert and may need immediate assistance.

${location ? `
CURRENT LOCATION:
Coordinates: ${location.latitude}, ${location.longitude}
Google Maps: ${locationLink}
` : 'Location information is not available at this time.'}

RECOMMENDED ACTIONS:
• Try to contact them immediately via phone or messaging
• Check their last known location using the map link above
• If you cannot reach them, consider contacting local authorities
• Emergency Services: Dial 100 (Police) or 112 (Emergency)

Alert Time: ${new Date(timestamp).toLocaleString()}

---
This email was sent automatically because you are listed as a trusted contact.
If you believe this is a false alarm, please contact your friend to confirm their safety.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Emergency email sent to ${contactEmail} (${contactName})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`✗ Failed to send email to ${contactEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Emergency email endpoint
  if (req.url === '/send-emergency-email' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { contacts, location, timestamp } = data;

        if (!Array.isArray(contacts) || contacts.length === 0) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ error: 'No contacts provided' }));
          return;
        }

        console.log(`\n📧 Processing emergency email request for ${contacts.length} contact(s)...`);
        
        const results = await Promise.all(
          contacts.map(contact => 
            sendEmergencyEmail(contact.email, contact.name, location, timestamp)
          )
        );

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`\n✓ Sent ${successful} email(s), ${failed} failed\n`);

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          sent: successful,
          failed: failed,
          results: results
        }));
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Assurance Emergency Email Server                    ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on http://127.0.0.1:${PORT}

Endpoints:
  POST /send-emergency-email  - Send emergency alerts
  GET  /health                - Check server status

⚠ IMPORTANT: Configure email credentials before using!

Set environment variables:
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password

Or edit the transporter configuration in email-server.mjs

For Gmail, generate an app password at:
https://myaccount.google.com/apppasswords

Waiting for emergency alert requests...
`);
});
