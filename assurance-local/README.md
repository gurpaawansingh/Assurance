# Assurance Local

A standalone, dependency-free personal safety planner. It keeps contacts, private notes, and check-in plans in the current browser's local storage.

## Run

Requires Node.js 18 or newer. From this directory:

```powershell
npm run dev
```

Open the local URL printed in the terminal (by default, `http://127.0.0.1:4173`). No `npm install` step is needed.

## Included

- Personal check-in timer with an extend and complete action.
- Trusted people list with optional tap-to-call phone links.
- Private notes saved in the current browser.
- JSON data export and a confirmation-protected clear action.
- Emergency mode with separate start and mistaken-activation PINs.
- Responsive layout for desktop and mobile.

Emergency mode requests browser location permission and displays updates while this page is open. It does not provide guaranteed background tracking. Trusted-person SMS messages are drafted for you; each must be reviewed and sent from your messaging app. The app does not contact emergency services or message anyone automatically.

Data stays in this browser profile. PINs are stored as salted, slow hashes, but this is not a replacement for a secure server or device lock. Someone with access to your browser profile can access saved contact and note data. Avoid storing highly sensitive details.