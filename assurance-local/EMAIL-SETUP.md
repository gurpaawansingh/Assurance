# Assurance Local - Email Server Setup

## Automated Emergency Email Alerts

The email server automatically sends emergency alerts with GPS location to trusted contacts when an emergency is triggered.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Email Credentials

#### Option A: Using Gmail (Recommended)

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Generate a new app password
3. Create a `.env` file:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

#### Option B: Using Other Email Providers

Edit `email-server.mjs` and update the transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

**Common SMTP Settings:**
- **Gmail**: service: 'gmail', port: 587
- **Outlook**: host: 'smtp-mail.outlook.com', port: 587
- **Yahoo**: host: 'smtp.mail.yahoo.com', port: 465, secure: true

### 3. Run the Servers

Open **two separate terminals**:

**Terminal 1 - Frontend Server:**
```bash
npm start
```
This runs on http://127.0.0.1:4173

**Terminal 2 - Email Server:**
```bash
npm run email-server
```
This runs on http://127.0.0.1:3001

## How It Works

1. **Add Trusted Contacts**: Navigate to "Trusted People" and add contacts with email addresses
2. **Emergency Trigger**: When emergency mode starts (auto-countdown, manual button, or route deviation)
3. **Automatic Email Send**: Backend server sends HTML emails to all contacts with:
   - Emergency alert message
   - Current GPS coordinates
   - Google Maps link to location
   - Timestamp
   - Recommended actions

## Email Content

Recipients receive a professional HTML email with:

```
🚨 EMERGENCY ALERT - Immediate Assistance Needed

- Contact name personalization
- Current GPS location with map link
- Timestamp of alert
- Recommended actions (call, check location, contact authorities)
- Emergency service numbers (100, 112)
```

## API Endpoints

### POST /send-emergency-email
Send emergency alerts to multiple contacts

**Request:**
```json
{
  "contacts": [
    {"name": "John Doe", "email": "john@example.com"}
  ],
  "location": {
    "latitude": "28.12345",
    "longitude": "77.12345"
  },
  "timestamp": 1698489600000
}
```

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "results": [...]
}
```

### GET /health
Check server status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-28T10:47:09.673Z"
}
```

## Testing

1. Start both servers
2. Add a test contact with your own email
3. Configure emergency PINs in Privacy settings
4. Trigger emergency (wait for countdown or click Emergency button)
5. Check your email inbox

## Security Notes

- **Never commit** `.env` file with real credentials
- Use app-specific passwords, not your main password
- Email server runs locally on 127.0.0.1 (not exposed to internet)
- CORS enabled only for local development

## Troubleshooting

**Error: "Email server unavailable"**
- Make sure `npm run email-server` is running in a separate terminal
- Check that port 3001 is not in use

**Error: "Invalid login"**
- Verify EMAIL_USER and EMAIL_PASS in .env
- For Gmail, ensure "Less secure app access" is disabled and use app password
- For Outlook, enable SMTP access in account settings

**Emails not arriving**
- Check spam/junk folder
- Verify email addresses are correct
- Check email-server terminal for error logs
- Test with `curl http://127.0.0.1:3001/health`

## Production Deployment

For production use:
1. Deploy email server to a cloud platform (Heroku, Railway, Render)
2. Use environment variables for credentials
3. Update frontend API URL to production server
4. Enable HTTPS and proper CORS configuration
5. Consider rate limiting to prevent abuse
6. Use a dedicated email service (SendGrid, AWS SES, Mailgun)

## Environment Variables

Create `.env` file in `assurance-local/` directory:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3001
```

## License

This is a safety tool for personal use. Use responsibly.
