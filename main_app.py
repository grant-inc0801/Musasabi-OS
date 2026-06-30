```javascript
// packages/sales/src/salesLeadRepository.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE sales_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    store_name TEXT,
    phone_number TEXT,
    postal_code TEXT,
    address TEXT,
    industry_major TEXT,
    industry_minor TEXT,
    status TEXT,
    priority INTEGER,
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;

// packages/sales/src/salesLeadService.js
const db = require('./salesLeadRepository');

const createLead = (leadData) => {
  const { company_name, store_name, phone_number, postal_code, address, industry_major, industry_minor, status, priority, assigned_to } = leadData;
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO sales_leads (company_name, store_name, phone_number, postal_code, address, industry_major, industry_minor, status, priority, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, store_name, phone_number, postal_code, address, industry_major, industry_minor, status, priority, assigned_to],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
  });
};

module.exports = { createLead };

// packages/sales/src/callHistoryRepository.js
const db = require('./salesLeadRepository');

db.serialize(() => {
  db.run(`CREATE TABLE call_histories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    call_result TEXT,
    contact_person TEXT,
    memo TEXT,
    next_action TEXT,
    next_call_date DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;

// packages/sales/src/callHistoryService.js
const db = require('./callHistoryRepository');

const createCallHistory = (callHistoryData) => {
  const { lead_id, call_result, contact_person, memo, next_action, next_call_date, created_by } = callHistoryData;
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO call_histories (lead_id, call_result, contact_person, memo, next_action, next_call_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lead_id, call_result, contact_person, memo, next_action, next_call_date, created_by],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
  });
};

module.exports = { createCallHistory };

// packages/sales/src/hearingNoteRepository.js
const db = require('./salesLeadRepository');

db.serialize(() => {
  db.run(`CREATE TABLE sales_hearing_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    store_name TEXT,
    company_name TEXT,
    contact_person TEXT,
    phone_number TEXT,
    email TEXT,
    website_url TEXT,
    memo_1 TEXT,
    memo_2 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;

// packages/sales/src/hearingNoteService.js
const db = require('./hearingNoteRepository');

const createHearingNote = (hearingNoteData) => {
  const { lead_id, store_name, company_name, contact_person, phone_number, email, website_url, memo_1, memo_2 } = hearingNoteData;
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO sales_hearing_notes (lead_id, store_name, company_name, contact_person, phone_number, email, website_url, memo_1, memo_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lead_id, store_name, company_name, contact_person, phone_number, email, website_url, memo_1, memo_2],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
  });
};

module.exports = { createHearingNote };

// packages/sales/src/index.js
const express = require('express');
const app = express();
const salesLeadService = require('./salesLeadService');
const callHistoryService = require('./callHistoryService');
const hearingNoteService = require('./hearingNoteService');

app.use(express.json());

app.post('/lead', async (req, res) => {
  try {
    const leadId = await salesLeadService.createLead(req.body);
    res.status(201).send({ leadId });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/call-history', async (req, res) => {
  try {
    const callHistoryId = await callHistoryService.createCallHistory(req.body);
    res.status(201).send({ callHistoryId });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/hearing-note', async (req, res) => {
  try {
    const hearingNoteId = await hearingNoteService.createHearingNote(req.body);
    res.status(201).send({ hearingNoteId });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```