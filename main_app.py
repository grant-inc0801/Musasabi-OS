```javascript
// zoomWebhookService.js
const express = require('express');
const crypto = require('crypto');
const { saveEvent } = require('./zoomEventRouter');

const verifyZoomSignature = (req, res, buf) => {
  const zoomSignature = req.headers["x-zoom-signature"];
  const secretToken = process.env.ZOOM_SECRET_TOKEN;
  const hash = crypto.createHmac('sha256', secretToken).update(buf).digest('hex');
  if (hash !== zoomSignature) {
    throw new Error('Invalid signature');
  }
};

const app = express();
app.use(express.json({ verify: verifyZoomSignature }));

app.post('/webhook', (req, res) => {
  saveEvent(req.body);
  res.status(200).send();
});

module.exports = app;

// zoomEventRouter.js
const { processEvent } = require('./zoomCallSyncService');
const { saveToDatabase } = require('./zoomRealtimeClient');

async function saveEvent(event) {
  saveToDatabase(event);
  await processEvent(event);
}

module.exports = { saveEvent };

// zoomCallSyncService.js
const { updateSalesWorkspace, matchLead } = require('./zoomPresenceService');
const { retrySync } = require('./zoomRealtimeClient');

async function processEvent(event) {
  try {
    const lead = await matchLead(event);
    updateSalesWorkspace(event, lead);
  } catch (error) {
    await retrySync(event);
  }
}

module.exports = { processEvent };

// zoomPresenceService.js
const fetch = require('node-fetch');

async function updateSalesWorkspace(event, lead) {
  const endpoint = process.env.SALES_WORKSPACE_API;
  const body = JSON.stringify({
    callStatus: event.event_type,
    callDuration: event.payload.duration,
    lead,
    lastSynced: new Date().toISOString(),
  });
  
  await fetch(endpoint, { method: 'POST', body });
}

async function matchLead(event) {
  const primaryMatch = await findLeadByPhoneNumber(event.payload.phoneNumber);
  if (primaryMatch) return primaryMatch;
  const fallbackMatch = await findLeadByCompanyName(event.payload.companyName);
  return fallbackMatch || createTemporaryRecord(event);
}

async function findLeadByPhoneNumber(phoneNumber) {
  // Lookup logic here
}

async function findLeadByCompanyName(companyName) {
  // Lookup logic here
}

async function createTemporaryRecord(event) {
  // Create temporary logic
}

module.exports = { updateSalesWorkspace, matchLead };

// zoomRealtimeClient.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const initializeDatabase = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS zoom_call_events (
      id INTEGER PRIMARY KEY,
      zoom_call_id TEXT,
      event_type TEXT,
      event_time TEXT,
      payload_json TEXT,
      processed INTEGER DEFAULT 0,
      created_at TEXT
    )`);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS call_sync_status (
      id INTEGER PRIMARY KEY,
      zoom_call_id TEXT,
      sync_status TEXT,
      last_synced_at TEXT,
      error_message TEXT
    )`);
};

const saveToDatabase = (event) => {
  const stmt = db.prepare(`
    INSERT INTO zoom_call_events
    (zoom_call_id, event_type, event_time, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?)`);
  
  stmt.run(event.payload.callId, event.event_type, event.event_time, JSON.stringify(event.payload), new Date().toISOString());
  stmt.finalize();
};

const retrySync = async (event, attempt = 1) => {
  if (attempt > 3) return;
  
  try {
    await processEvent(event);
  } catch (error) {
    setTimeout(() => retrySync(event, attempt + 1), 1000);
  }
};

initializeDatabase();

module.exports = { saveToDatabase, retrySync };
```