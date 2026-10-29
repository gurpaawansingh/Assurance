const STORAGE_KEY = 'assurance-local-v1';
const PIN_ITERATIONS = 120000;
const COUNTDOWN_SECONDS = 60;
const emptyState = () => ({ 
  contacts: [], 
  notes: [], 
  journey: null, 
  activity: [], 
  emergencyPins: null,
  cyberMessages: [],
  cyberFiles: [],
  activeJourneyTracking: null
});

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== 'object') return emptyState();
    return {
      contacts: Array.isArray(stored.contacts) ? stored.contacts : [],
      notes: Array.isArray(stored.notes) ? stored.notes : [],
      journey: stored.journey && typeof stored.journey === 'object' ? stored.journey : null,
      activity: Array.isArray(stored.activity) ? stored.activity : [],
      emergencyPins: stored.emergencyPins && typeof stored.emergencyPins === 'object' ? stored.emergencyPins : null,
      cyberMessages: Array.isArray(stored.cyberMessages) ? stored.cyberMessages : [],
      cyberFiles: Array.isArray(stored.cyberFiles) ? stored.cyberFiles : [],
      activeJourneyTracking: stored.activeJourneyTracking && typeof stored.activeJourneyTracking === 'object' ? stored.activeJourneyTracking : null
    };
  } catch {
    return emptyState();
  }
}

const state = readState();
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const dateTime = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const shortDate = (value) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
const escapeText = (value) => String(value ?? '');
const emergencyDialog = document.querySelector('#emergency-dialog');
let toastTimer;
let expiredJourneyId = null;
let emergencyWatchId = null;
let emergencySession = null;
let latestPosition = null;
let countdownTimer = null;
let countdownRemaining = 0;
let emergencyEmailSent = false;
let emergencyEmailFallbackTimer = null;

async function hashPin(pin, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = Uint8Array.from(salt.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: PIN_ITERATIONS, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function matchesPin(pin, savedPin) {
  if (!savedPin?.salt || !savedPin?.hash || savedPin.iterations !== PIN_ITERATIONS) return false;
  return (await hashPin(pin, savedPin.salt)) === savedPin.hash;
}

function toast(message) {
  const target = document.querySelector('#toast');
  target.textContent = message;
  target.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => target.classList.remove('is-visible'), 2600);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    toast('Browser storage is unavailable. Changes may not be saved.');
    return false;
  }
}

function recordActivity(label) {
  state.activity.unshift({ id: id(), label, at: Date.now() });
  state.activity = state.activity.slice(0, 8);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = escapeText(text);
  return node;
}

function setView(name) {
  const validViews = ['home', 'contacts', 'notes', 'privacy', 'cybersecurity', 'journey-tracking'];
  const view = validViews.includes(name) ? name : 'home';
  document.querySelectorAll('.view').forEach((section) => {
    const isCurrent = section.id === `view-${view}`;
    section.hidden = !isCurrent;
    section.classList.toggle('is-visible', isCurrent);
  });
  document.querySelectorAll('[data-view]').forEach((button) => {
    const isCurrent = button.dataset.view === view;
    if (button.classList.contains('nav-item') || button.classList.contains('mobile-nav-item')) {
      if (isCurrent) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      button.classList.toggle('is-active', isCurrent);
    }
  });
  if (view === 'home') history.replaceState(null, '', `${location.pathname}${location.search}`);
  else history.replaceState(null, '', `#${view}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPeople() {
  const preview = document.querySelector('#people-preview');
  const contactsList = document.querySelector('#contacts-list');
  preview.replaceChildren();
  contactsList.replaceChildren();
  document.querySelector('#people-number').textContent = String(state.contacts.length).padStart(2, '0');
  document.querySelector('#contact-count').textContent = String(state.contacts.length);
  document.querySelector('#contacts-total').textContent = `${state.contacts.length} SAVED`;

  if (!state.contacts.length) {
    preview.append(element('p', 'empty-message', 'Your circle starts with one person you trust.'));
    contactsList.append(element('p', 'empty-message roomy-empty', 'No one added yet. Add a person you can reach when you choose to.'));
    return;
  }

  state.contacts.slice(0, 3).forEach((contact) => {
    const row = element('div', 'person-row');
    row.append(element('span', 'person-avatar', contact.name.trim().charAt(0).toUpperCase()));
    const details = element('span', 'person-details');
    details.append(element('strong', '', contact.name));
    details.append(element('span', '', contact.relation || 'Trusted person'));
    row.append(details);
    preview.append(row);
  });

  state.contacts.forEach((contact) => {
    const row = element('article', 'contact-card');
    const details = element('div', 'contact-card-details');
    details.append(element('span', 'person-avatar', contact.name.trim().charAt(0).toUpperCase()));
    const copy = element('div', 'contact-copy');
    copy.append(element('h3', '', contact.name));
    const infoLines = [];
    if (contact.relation) infoLines.push(contact.relation);
    if (contact.email) infoLines.push(contact.email);
    if (contact.phone) infoLines.push(contact.phone);
    copy.append(element('p', '', infoLines.join(' · ') || 'Trusted person'));
    details.append(copy);
    row.append(details);
    const actions = element('div', 'contact-actions');
    if (contact.phone) {
      const call = element('a', 'call-link', 'Call');
      call.href = `tel:${contact.phone.replace(/[^+\d*#;,]/g, '')}`;
      call.setAttribute('aria-label', `Call ${contact.name}`);
      actions.append(call);
    }
    const remove = element('button', 'icon-button delete-button', '×');
    remove.type = 'button';
    remove.dataset.action = 'remove-contact';
    remove.dataset.id = contact.id;
    remove.setAttribute('aria-label', `Remove ${contact.name}`);
    actions.append(remove);
    row.append(actions);
    contactsList.append(row);
  });
}

function renderNotes() {
  const target = document.querySelector('#notes-list');
  target.replaceChildren();
  document.querySelector('#notes-total').textContent = `${state.notes.length} SAVED`;
  if (!state.notes.length) {
    target.append(element('p', 'empty-message roomy-empty', 'Your saved notes will appear here.'));
    return;
  }
  state.notes.forEach((note) => {
    const card = element('article', 'note-card');
    const heading = element('div', 'note-card-heading');
    heading.append(element('h3', '', note.title || 'Untitled note'));
    const remove = element('button', 'icon-button delete-button', '×');
    remove.type = 'button';
    remove.dataset.action = 'remove-note';
    remove.dataset.id = note.id;
    remove.setAttribute('aria-label', 'Delete note');
    heading.append(remove);
    card.append(heading);
    card.append(element('p', 'note-body', note.body));
    card.append(element('time', 'note-date', dateTime(note.createdAt)));
    target.append(card);
  });
}

function renderActivity() {
  const target = document.querySelector('#recent-activity');
  target.replaceChildren();
  if (!state.activity.length) {
    target.append(element('p', 'empty-message', 'Your completed check-ins and saved plans will show up here.'));
    return;
  }
  state.activity.slice(0, 4).forEach((item) => {
    const row = element('div', 'activity-row');
    row.append(element('span', 'activity-dot'));
    row.append(element('span', 'activity-label', item.label));
    row.append(element('time', 'activity-date', shortDate(item.at)));
    target.append(row);
  });
}

function renderPinSettings() {
  document.querySelector('#pin-settings-status').textContent = state.emergencyPins ? 'PINs configured' : 'PINs not set';
}

function emergencyMessage() {
  const timestamp = new Date().toLocaleString();
  const locationText = latestPosition
    ? `Current location: https://maps.google.com/?q=${latestPosition.latitude},${latestPosition.longitude}`
    : 'Location is not available yet.';
  return `I may need help. Assurance emergency session started at ${timestamp}. ${locationText}`;
}

function sendEmergencyEmails() {
  if (!state.contacts.length) return;
  
  const contactsWithEmail = state.contacts.filter(c => c.email);
  
  if (contactsWithEmail.length === 0) {
    toast('No contacts with email addresses.');
    return;
  }
  
  // Send via backend server
  const payload = {
    contacts: contactsWithEmail.map(c => ({ name: c.name, email: c.email })),
    location: latestPosition,
    timestamp: Date.now()
  };
  
  fetch('http://127.0.0.1:3001/send-emergency-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      toast(`✓ Emergency emails sent to ${data.sent} contact(s)`);
      recordActivity(`Emergency emails sent to ${data.sent} contact(s)`);
      persist();
      renderActivity();
    } else {
      toast('⚠ Failed to send emergency emails');
      console.error('Email send error:', data);
    }
  })
  .catch(error => {
    console.error('Failed to connect to email server:', error);
    toast('⚠ Email server unavailable. Start email-server.mjs');
  });
}

function renderEmergencyContacts() {
  const target = document.querySelector('#emergency-contacts');
  target.replaceChildren();
  if (!state.contacts.length) {
    target.append(element('p', 'empty-message', 'No trusted people saved. Add contacts from the People page.'));
    return;
  }
  state.contacts.forEach((contact) => {
    const row = element('div', 'emergency-contact-row');
    const details = element('div', 'emergency-contact-details');
    details.append(element('strong', '', contact.name));
    const contactInfo = contact.email || contact.phone || 'No contact info';
    details.append(element('span', '', contactInfo));
    row.append(details);
    
    const actions = element('div', 'emergency-contact-actions');
    
    if (contact.email) {
      const emailLink = element('a', 'button button-light emergency-message-link', '📧 Email');
      const subject = encodeURIComponent('🚨 EMERGENCY - I Need Help');
      const body = encodeURIComponent(emergencyMessage());
      emailLink.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      emailLink.setAttribute('aria-label', `Email emergency alert to ${contact.name}`);
      actions.append(emailLink);
    }
    
    if (contact.phone) {
      const smsLink = element('a', 'button button-light emergency-message-link', '💬 SMS');
      const number = contact.phone.replace(/[^+\d*#;,]/g, '');
      smsLink.href = `sms:${number}?body=${encodeURIComponent(emergencyMessage())}`;
      smsLink.setAttribute('aria-label', `Draft SMS for ${contact.name}`);
      actions.append(smsLink);
    }
    
    row.append(actions);
    target.append(row);
  });
}

function updateLocation(position) {
  if (!emergencySession) return;
  latestPosition = { latitude: position.coords.latitude.toFixed(5), longitude: position.coords.longitude.toFixed(5) };
  const target = document.querySelector('#location-coordinates');
  target.replaceChildren();
  target.append(element('span', '', `Updated ${new Date(position.timestamp).toLocaleTimeString()} · ${latestPosition.latitude}, ${latestPosition.longitude} `));
  const mapLink = element('a', 'location-map-link', 'Open map');
  mapLink.href = `https://maps.google.com/?q=${latestPosition.latitude},${latestPosition.longitude}`;
  mapLink.target = '_blank';
  mapLink.rel = 'noopener noreferrer';
  target.append(mapLink);
  document.querySelector('#location-status').textContent = 'Location active on this device';
  renderEmergencyContacts();

  // First GPS fix — cancel fallback timer and send email with real location
  if (!emergencyEmailSent) {
    window.clearTimeout(emergencyEmailFallbackTimer);
    emergencyEmailFallbackTimer = null;
    emergencyEmailSent = true;
    sendEmergencyEmails();
  }
}

function startLocationWatch() {
  const status = document.querySelector('#location-status');
  const coordinates = document.querySelector('#location-coordinates');
  latestPosition = null;
  coordinates.textContent = 'Waiting for a location fix.';
  renderEmergencyContacts();
  if (!navigator.geolocation) {
    status.textContent = 'Location is not supported by this browser.';
    return;
  }
  status.textContent = 'Requesting location permission…';
  emergencyWatchId = navigator.geolocation.watchPosition(updateLocation, (error) => {
    if (!emergencySession) return;
    const message = error.code === 1 ? 'Location permission was denied.' : 'Unable to get a location fix.';
    status.textContent = message;
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
}

function startEmergency(source = 'button', silent = false) {
  if (emergencySession) {
    if (!emergencyDialog.open && !silent) emergencyDialog.showModal();
    return;
  }
  emergencySession = { id: id(), startedAt: Date.now(), source, silent };
  if (!silent) {
    recordActivity('Emergency session started');
    persist();
    renderActivity();
    emergencyDialog.showModal();
    renderEmergencyContacts();
  }
  document.querySelector('#emergency-cancel-pin').value = '';
  emergencyEmailSent = false;
  startLocationWatch();
  if (!silent) {
    // Send with real location on first GPS fix (see updateLocation).
    // Fallback: if no fix within 10 s, send anyway (location will be null).
    emergencyEmailFallbackTimer = window.setTimeout(() => {
      if (!emergencyEmailSent) {
        emergencyEmailSent = true;
        sendEmergencyEmails();
      }
    }, 10000);
  }
}

function endEmergency(result) {
  if (!emergencySession) return;
  if (emergencyWatchId !== null) navigator.geolocation?.clearWatch(emergencyWatchId);
  if (countdownTimer) window.clearInterval(countdownTimer);
  if (emergencyEmailFallbackTimer) { window.clearTimeout(emergencyEmailFallbackTimer); emergencyEmailFallbackTimer = null; }
  emergencyWatchId = null;
  latestPosition = null;
  countdownTimer = null;
  countdownRemaining = 0;
  emergencyEmailSent = false;
  const wasSilent = emergencySession.silent;
  emergencySession = null;
  document.querySelector('#location-status').textContent = 'Emergency session ended.';
  document.querySelector('#location-coordinates').textContent = 'Location sharing has stopped.';
  if (!wasSilent) {
    recordActivity(result === 'safe' ? 'Session ended safely' : result === 'alert' ? 'Emergency alert triggered' : 'Emergency session ended');
    persist();
    renderActivity();
  }
  if (emergencyDialog.open) emergencyDialog.close();
  document.querySelector('#emergency-pin-entry').hidden = true;
  if (!wasSilent) toast(result === 'safe' ? 'Session ended safely.' : result === 'alert' ? 'Emergency alert triggered.' : 'Emergency session ended.');
}

function renderJourney() {
  const form = document.querySelector('#journey-form');
  const active = document.querySelector('#journey-active');
  const status = document.querySelector('#journey-status');
  const copy = document.querySelector('#journey-copy');
  const journey = state.journey;
  form.hidden = Boolean(journey);
  active.hidden = !journey;
  status.classList.toggle('status-due', Boolean(journey && journey.dueAt <= Date.now()));
  status.textContent = journey ? (journey.dueAt <= Date.now() ? 'CHECK IN' : 'IN PROGRESS') : 'READY';

  if (!journey) {
    copy.textContent = 'Set a destination and check-in time. Your plan stays on this device.';
    return;
  }

  copy.textContent = journey.destination ? `Your plan for ${journey.destination}.` : 'Your personal check-in reminder is active.';
  document.querySelector('#active-destination').textContent = `Started ${dateTime(journey.startedAt)}${journey.destination ? ` · ${journey.destination}` : ''}`;
  const remaining = Math.max(0, journey.dueAt - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.querySelector('#countdown').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  if (remaining === 0 && expiredJourneyId !== journey.id) {
    expiredJourneyId = journey.id;
    toast('Your check-in time has passed. Check in with yourself or someone you trust.');
  }
}

function render() {
  renderPeople();
  renderNotes();
  renderJourney();
  renderActivity();
  renderPinSettings();
}

document.querySelector('#today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

document.querySelector('#emergency-launch').addEventListener('click', () => startEmergency());

document.querySelector('#emergency-pin-entry').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#emergency-pin');
  const message = document.querySelector('#emergency-pin-message');
  const pin = input.value;
  input.value = '';
  if (!state.emergencyPins) {
    message.textContent = 'Configure your PINs in Privacy & data first.';
    return;
  }
  if (countdownTimer) {
    if (await matchesPin(pin, state.emergencyPins.start)) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
      countdownRemaining = 0;
      endEmergency('safe');
    } else if (await matchesPin(pin, state.emergencyPins.cancel)) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
      countdownRemaining = 0;
      if (emergencySession?.silent) {
        emergencySession.silent = false;
        emergencyDialog.showModal();
        recordActivity('Emergency alert triggered');
        persist();
        renderActivity();
      } else {
        startEmergency('alert-pin', false);
      }
    } else {
      message.textContent = 'PIN not recognized.';
    }
    return;
  }
  if (emergencySession) {
    if (await matchesPin(pin, state.emergencyPins.start)) {
      endEmergency('safe');
      toast('Emergency cancelled. You are safe.');
    }
    else if (await matchesPin(pin, state.emergencyPins.cancel)) {
      // Show "cancelled" message while actually triggering emergency in background
      document.querySelector('#emergency-pin-entry').hidden = true;
      toast('Emergency cancelled. You are safe.');
      if (emergencySession.silent) {
        emergencySession.silent = false;
        // Continue tracking silently, don't show dialog
        recordActivity('Emergency alert triggered (silent)');
        persist();
        renderActivity();
      } else {
        // Already visible, keep it going
        recordActivity('Emergency alert escalated');
        persist();
        renderActivity();
      }
    } else message.textContent = 'PIN not recognized.';
  }
});

document.querySelector('#emergency-pin-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const startPin = document.querySelector('#start-pin').value;
  const cancelPin = document.querySelector('#cancel-pin').value;
  const status = document.querySelector('#pin-settings-status');
  if (startPin === cancelPin) {
    status.textContent = 'Choose two different PINs.';
    return;
  }
  try {
    state.emergencyPins = {
      start: { salt: randomSalt(), iterations: PIN_ITERATIONS, hash: '' },
      cancel: { salt: randomSalt(), iterations: PIN_ITERATIONS, hash: '' }
    };
    state.emergencyPins.start.hash = await hashPin(startPin, state.emergencyPins.start.salt);
    state.emergencyPins.cancel.hash = await hashPin(cancelPin, state.emergencyPins.cancel.salt);
    persist();
    form.reset();
    renderPinSettings();
    toast('Emergency PINs saved on this device.');
  } catch {
    status.textContent = 'PIN protection is unavailable in this browser context.';
  }
});

document.querySelector('#emergency-cancel-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#emergency-cancel-pin');
  const pin = input.value;
  input.value = '';
  if (await matchesPin(pin, state.emergencyPins?.start)) {
    endEmergency('safe');
    toast('Emergency ended safely.');
  }
  else if (await matchesPin(pin, state.emergencyPins?.cancel)) {
    // Close dialog and show cancelled message, but keep tracking
    emergencyDialog.close();
    toast('Emergency cancelled.');
    recordActivity('Emergency alert triggered (from dialog)');
    persist();
    renderActivity();
  } else toast('PIN not recognized.');
});

document.querySelector('#emergency-end').addEventListener('click', () => endEmergency('ended'));
document.querySelector('#emergency-close').addEventListener('click', () => endEmergency('ended'));
emergencyDialog.addEventListener('cancel', (event) => {
  if (!emergencySession) return;
  event.preventDefault();
  toast('End the emergency session to stop location tracking.');
});

document.querySelector('#journey-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const destination = document.querySelector('#destination').value.trim();
  const duration = Number(document.querySelector('#duration').value);
  const startedAt = Date.now();
  state.journey = { id: id(), destination, startedAt, dueAt: startedAt + duration * 60000 };
  expiredJourneyId = null;
  recordActivity(destination ? `Started a check-in plan for ${destination}` : 'Started a check-in plan');
  persist();
  render();
  toast('Your check-in plan is ready.');
});

document.querySelector('#safe-button').addEventListener('click', () => {
  const destination = state.journey?.destination;
  state.journey = null;
  expiredJourneyId = null;
  recordActivity(destination ? `Checked in safely after ${destination}` : 'Checked in safely');
  persist();
  render();
  toast('Check-in complete. Take care.');
});

document.querySelector('#extend-button').addEventListener('click', () => {
  if (!state.journey) return;
  state.journey.dueAt = Math.max(Date.now(), state.journey.dueAt) + 30 * 60000;
  expiredJourneyId = null;
  persist();
  renderJourney();
  toast('Check-in extended by 30 minutes.');
});

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  if (!name || !email) return;
  state.contacts.push({ 
    id: id(), 
    name, 
    email,
    relation: String(form.get('relation') || '').trim(), 
    phone: String(form.get('phone') || '').trim() 
  });
  recordActivity(`Added ${name} to your circle`);
  persist();
  event.currentTarget.reset();
  render();
  toast('Added to your circle.');
});

document.querySelector('#note-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = String(form.get('body') || '').trim();
  if (!body) return;
  state.notes.unshift({ id: id(), title: String(form.get('title') || '').trim(), body, createdAt: Date.now() });
  recordActivity('Saved a private note');
  persist();
  event.currentTarget.reset();
  render();
  toast('Your note is saved on this device.');
});

document.querySelector('#contacts-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove-contact"]');
  if (!button) return;
  const contact = state.contacts.find((item) => item.id === button.dataset.id);
  state.contacts = state.contacts.filter((item) => item.id !== button.dataset.id);
  if (contact) recordActivity(`Removed ${contact.name} from your circle`);
  persist();
  render();
  toast('Contact removed.');
});

document.querySelector('#notes-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove-note"]');
  if (!button) return;
  state.notes = state.notes.filter((item) => item.id !== button.dataset.id);
  recordActivity('Deleted a private note');
  persist();
  render();
  toast('Note deleted.');
});

document.querySelector('#export-button').addEventListener('click', () => {
  const backup = { exportedAt: new Date().toISOString(), contacts: state.contacts, notes: state.notes, journey: state.journey, activity: state.activity };
  const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = element('a');
  link.href = url;
  link.download = `assurance-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast('Backup downloaded.');
});

const confirmDialog = document.querySelector('#confirm-dialog');
document.querySelector('#clear-button').addEventListener('click', () => confirmDialog.showModal());
confirmDialog.addEventListener('close', () => {
  if (confirmDialog.returnValue !== 'confirm') return;
  if (emergencyWatchId !== null) navigator.geolocation?.clearWatch(emergencyWatchId);
  if (emergencyEmailFallbackTimer) { window.clearTimeout(emergencyEmailFallbackTimer); emergencyEmailFallbackTimer = null; }
  emergencyWatchId = null;
  emergencySession = null;
  emergencyEmailSent = false;
  latestPosition = null;
  Object.assign(state, emptyState());
  localStorage.removeItem(STORAGE_KEY);
  expiredJourneyId = null;
  render();
  toast('All local data has been cleared.');
});

window.addEventListener('hashchange', () => setView(location.hash.slice(1) || 'home'));
setView(location.hash.slice(1) || 'home');
render();
window.setInterval(renderJourney, 1000);

// CyberShield AI functionality
let cyberFiles = [];

function renderCyberMessages() {
  const container = document.querySelector('#cyber-messages');
  const messages = state.cyberMessages || [];
  
  let html = `
    <div class="cyber-message cyber-ai">
      <div class="cyber-avatar">AI</div>
      <div class="cyber-content">
        <p><strong>Welcome to CyberShield</strong></p>
        <p>I'm here to help with online safety concerns including:</p>
        <ul>
          <li>Social media harassment or threats</li>
          <li>Unwanted contact or stalking behavior</li>
          <li>Privacy and security advice</li>
          <li>Reporting and documentation guidance</li>
        </ul>
        <p>You can type your concern below or upload evidence (screenshots, videos).</p>
      </div>
    </div>
  `;
  
  messages.forEach(msg => {
    const className = msg.isUser ? 'cyber-user' : 'cyber-ai';
    const avatar = msg.isUser ? 'You' : 'AI';
    html += `
      <div class="cyber-message ${className}">
        <div class="cyber-avatar">${avatar}</div>
        <div class="cyber-content">
          <p>${escapeText(msg.text).replace(/\n/g, '<br>')}</p>
          ${msg.timestamp ? `<small style="color: var(--muted); font-size: 13px;">${shortDate(msg.timestamp)}</small>` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

function generateAIResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('harassment') || message.includes('threat') || message.includes('abuse')) {
    return `I understand this is a serious situation. Here's what I recommend:\n\n1. **Document everything**: Save screenshots with timestamps, URLs, and any identifying information.\n\n2. **Report on the platform**: Use the platform's reporting tools to report the harassment.\n\n3. **Block the user**: Block the person on all platforms to prevent further contact.\n\n4. **Report to authorities**: File a report with the National Cyber Crime Portal at cybercrime.gov.in or call 1930.\n\n5. **Tell someone you trust**: Share what's happening with a friend or family member.\n\nWould you like me to help you prepare an official report?`;
  }
  
  if (message.includes('stalking') || message.includes('following') || message.includes('tracking')) {
    return `Stalking behavior is serious and illegal. Here's what to do:\n\n1. **Do not engage**: Don't respond to messages or contact attempts.\n\n2. **Document patterns**: Keep a log of dates, times, and nature of contact.\n\n3. **Secure your accounts**: Change passwords, enable 2FA, review privacy settings.\n\n4. **File a police report**: Contact your local police cyber cell (dial 100) and the Women's Helpline (1091).\n\n5. **Consider legal options**: You may be eligible for a restraining order.\n\nYour safety is the priority. Do you need help preparing evidence for authorities?`;
  }
  
  if (message.includes('privacy') || message.includes('secure') || message.includes('protect')) {
    return `Here are essential privacy and security steps:\n\n**Social Media Security:**\n• Set all profiles to private\n• Review and remove tagged photos\n• Disable location tagging\n• Limit who can contact you\n\n**Account Security:**\n• Use unique, strong passwords\n• Enable two-factor authentication\n• Review connected apps and permissions\n• Check login activity regularly\n\n**Digital Safety:**\n• Don't share personal details publicly\n• Be cautious with friend requests\n• Use VPN on public WiFi\n• Keep software updated\n\nWould you like specific guidance for a particular platform?`;
  }
  
  if (message.includes('report') || message.includes('police') || message.includes('authorities')) {
    return `To report to authorities effectively:\n\n**What to prepare:**\n1. Detailed timeline of incidents\n2. Screenshots with visible dates/times\n3. URLs and usernames involved\n4. Your contact information\n5. Any prior reports filed\n\n**Where to report:**\n• **Cyber Crime**: cybercrime.gov.in or call 1930\n• **Women's Helpline**: 1091 or 181\n• **Local Police**: Visit cyber cell with evidence\n• **NCW**: 7827-170-170 for women's rights issues\n\nI can help you organize this information into a formal report. Would you like me to do that?`;
  }
  
  return `Thank you for sharing your concern. To give you the best advice, could you tell me:\n\n• What platform is this happening on? (Instagram, WhatsApp, Facebook, etc.)\n• How long has this been going on?\n• Have you documented any evidence?\n• Do you feel you're in immediate danger?\n\nThe more details you share, the better I can guide you. Your information stays private on this device.`;
}

document.querySelector('#cyber-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#cyber-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  if (!state.cyberMessages) state.cyberMessages = [];
  state.cyberMessages.push({
    id: id(),
    text: message,
    isUser: true,
    timestamp: Date.now(),
    files: cyberFiles.length > 0 ? [...cyberFiles] : []
  });
  
  input.value = '';
  cyberFiles = [];
  document.querySelector('#cyber-file-preview').innerHTML = '';
  
  // Generate AI response
  const response = generateAIResponse(message);
  state.cyberMessages.push({
    id: id(),
    text: response,
    isUser: false,
    timestamp: Date.now()
  });
  
  persist();
  renderCyberMessages();
});

document.querySelector('#cyber-file-input').addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      cyberFiles.push({
        name: file.name,
        type: file.type,
        data: event.target.result
      });
      renderCyberFilePreview();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

function renderCyberFilePreview() {
  const container = document.querySelector('#cyber-file-preview');
  container.innerHTML = cyberFiles.map((file, index) => {
    const isImage = file.type.startsWith('image/');
    return `
      <div class="cyber-file-item">
        ${isImage ? `<img src="${file.data}" alt="${file.name}">` : `<div style="display:grid;place-items:center;height:100%;font-size:24px;">📹</div>`}
        <button type="button" class="cyber-file-remove" onclick="removeC yberFile(${index})">×</button>
      </div>
    `;
  }).join('');
}

window.removeCyberFile = (index) => {
  cyberFiles.splice(index, 1);
  renderCyberFilePreview();
};

document.querySelector('#cyber-escalate-btn').addEventListener('click', () => {
  if (!state.cyberMessages || state.cyberMessages.length === 0) {
    toast('Start a conversation first to generate a report.');
    return;
  }
  
  const report = {
    date: new Date().toISOString(),
    messages: state.cyberMessages.filter(m => m.isUser).map(m => ({
      text: m.text,
      timestamp: m.timestamp,
      files: m.files || []
    })),
    summary: `Cyber safety consultation on ${dateTime(Date.now())}`
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cyber-report-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast('Report prepared. You can submit this to authorities.');
});

// Journey Tracking functionality
let journeyTrackTimer = null;
let journeyStartTime = null;

function renderJourneyTracking() {
  const form = document.querySelector('#journey-track-form');
  const active = document.querySelector('#journey-track-active');
  
  if (state.activeJourneyTracking) {
    form.style.display = 'none';
    active.hidden = false;
    
    document.querySelector('#track-from').textContent = state.activeJourneyTracking.start;
    document.querySelector('#track-to').textContent = state.activeJourneyTracking.destination;
    
    const elapsed = Math.floor((Date.now() - state.activeJourneyTracking.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    document.querySelector('#track-elapsed').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    const expected = new Date(state.activeJourneyTracking.startTime + state.activeJourneyTracking.duration * 60000);
    document.querySelector('#track-expected').textContent = expected.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    
    // Check for deviation
    const maxTime = state.activeJourneyTracking.duration * 1.5; // 50% over expected
    if (elapsed > maxTime * 60) {
      document.querySelector('#track-route-status').textContent = '⚠ Route deviation detected';
      document.querySelector('#track-warning').hidden = false;
      
      // Start emergency countdown after warning
      if (!state.activeJourneyTracking.warningShown) {
        state.activeJourneyTracking.warningShown = true;
        state.activeJourneyTracking.warningStartTime = Date.now();
        persist();
      }
      
      const warningElapsed = Math.floor((Date.now() - (state.activeJourneyTracking.warningStartTime || Date.now())) / 1000);
      const warningRemaining = Math.max(0, 30 - warningElapsed);
      document.querySelector('#track-warning-countdown').textContent = warningRemaining;
      
      if (warningRemaining === 0 && state.emergencyPins && !emergencySession) {
        startEmergency('route-deviation', false);
        toast('⚠ Emergency started: Route deviation detected');
      }
    }
  } else {
    form.style.display = 'block';
    active.hidden = true;
  }
}

document.querySelector('#journey-track-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const start = document.querySelector('#journey-start').value.trim();
  const destination = document.querySelector('#journey-destination').value.trim();
  const link = document.querySelector('#journey-link').value.trim();
  const duration = parseInt(document.querySelector('#journey-expected-duration').value);
  
  state.activeJourneyTracking = {
    id: id(),
    start,
    destination,
    link,
    duration,
    startTime: Date.now(),
    warningShown: false
  };
  
  persist();
  renderJourneyTracking();
  toast(`Journey tracking started: ${duration} min expected`);
  recordActivity(`Started tracking journey to ${destination}`);
  
  if (!journeyTrackTimer) {
    journeyTrackTimer = setInterval(renderJourneyTracking, 1000);
  }
});

document.querySelector('#track-arrived').addEventListener('click', () => {
  if (journeyTrackTimer) clearInterval(journeyTrackTimer);
  journeyTrackTimer = null;
  recordActivity(`Arrived safely at ${state.activeJourneyTracking.destination}`);
  state.activeJourneyTracking = null;
  persist();
  renderJourneyTracking();
  toast('Journey completed safely.');
});

document.querySelector('#track-extend').addEventListener('click', () => {
  state.activeJourneyTracking.duration += 10;
  state.activeJourneyTracking.warningShown = false;
  persist();
  toast('Journey extended by 10 minutes.');
});

document.querySelector('#track-cancel').addEventListener('click', () => {
  if (journeyTrackTimer) clearInterval(journeyTrackTimer);
  journeyTrackTimer = null;
  state.activeJourneyTracking = null;
  persist();
  renderJourneyTracking();
  toast('Journey monitoring stopped.');
});

document.querySelector('#track-confirm-safe').addEventListener('click', () => {
  state.activeJourneyTracking.warningShown = false;
  state.activeJourneyTracking.duration += 15;
  persist();
  document.querySelector('#track-warning').hidden = true;
  toast('Journey extended. Stay safe!');
});

// Initialize renders
if (state.cyberMessages) renderCyberMessages();
if (state.activeJourneyTracking) {
  renderJourneyTracking();
  journeyTrackTimer = setInterval(renderJourneyTracking, 1000);
}

// Auto-start emergency countdown
if (state.emergencyPins && !emergencySession) {
  countdownRemaining = COUNTDOWN_SECONDS;
  document.querySelector('#emergency-pin-entry').hidden = false;
  document.querySelector('#emergency-pin-message').textContent = `Enter your PIN within ${COUNTDOWN_SECONDS} seconds.`;
  countdownTimer = window.setInterval(() => {
    countdownRemaining--;
    if (countdownRemaining > 0) {
      document.querySelector('#emergency-pin-message').textContent = `Enter your PIN within ${countdownRemaining} seconds.`;
    } else {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
      startEmergency('auto-start', true);
      document.querySelector('#emergency-pin-entry').hidden = true;
    }
  }, 1000);
}