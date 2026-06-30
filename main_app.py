```javascript
// packages/integrations/src/zoom-phone/zoomPhoneTypes.js
export const CallLogSchema = {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  zoom_call_id: "TEXT",
  direction: "TEXT",
  caller_number: "TEXT",
  callee_number: "TEXT",
  start_time: "TEXT",
  end_time: "TEXT",
  duration_seconds: "INTEGER",
  result: "TEXT",
  recording_available: "BOOLEAN",
  raw_json: "TEXT",
  created_at: "TEXT DEFAULT CURRENT_TIMESTAMP",
  updated_at: "TEXT DEFAULT CURRENT_TIMESTAMP"
};

// packages/integrations/src/zoom-phone/zoomPhoneClient.js
import axios from 'axios';

export const fetchCallLogs = async (accountId, clientId, clientSecret) => {
  // Placeholder for actual Zoom API call
  return [];
};

// packages/integrations/src/zoom-phone/zoomPhoneService.js
import { CallLogSchema } from './zoomPhoneTypes';
import { fetchCallLogs } from './zoomPhoneClient';
import sqlite3 from 'sqlite3';
import fs from 'fs';

const db = new sqlite3.Database('./database.sqlite');

export const initializeDb = () => {
  const columnDefs = Object.entries(CallLogSchema)
    .map(([key, type]) => `${key} ${type}`)
    .join(', ');
  db.run(`CREATE TABLE IF NOT EXISTS zoom_phone_call_logs (${columnDefs});`);
};

export const normalizeCallLog = (raw) => {
  return {
    zoom_call_id: raw.id,
    direction: raw.direction,
    caller_number: raw.from,
    callee_number: raw.to,
    start_time: raw.start_time,
    end_time: raw.end_time,
    duration_seconds: raw.duration,
    result: raw.result,
    recording_available: raw.recording === 'available',
    raw_json: JSON.stringify(raw)
  };
};

export const importCallLogs = async (rawLogs) => {
  rawLogs.forEach((raw) => {
    const normalized = normalizeCallLog(raw);
    const placeholders = Object.keys(normalized).map(() => '?').join(', ');
    const values = Object.values(normalized);
    db.run(
      `INSERT INTO zoom_phone_call_logs (${Object.keys(normalized).join(', ')}) VALUES (${placeholders})`,
      values
    );
  });
};

export const listCallLogs = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM zoom_phone_call_logs', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

export const getCallLog = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM zoom_phone_call_logs WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

export const getIntegrationStatus = () => {
  const configured = process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET;
  return configured ? 'configured' : 'not configured';
};

export const mockImportIfNeeded = () => {
  if (!process.env.ZOOM_ACCOUNT_ID) {
    const sampleData = JSON.parse(fs.readFileSync('./data/seeds/zoom-phone-sample-call-logs.json'));
    importCallLogs(sampleData);
  }
};

// packages/integrations/src/zoom-phone/index.js
import { initializeDb, mockImportIfNeeded } from './zoomPhoneService';

initializeDb();
mockImportIfNeeded();
```
