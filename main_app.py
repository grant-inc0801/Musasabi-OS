```javascript
// fileMakerTypes.js
export const syncStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PARTIAL: 'PARTIAL',
};

// fileMakerClient.js
import axios from 'axios';

class FileMakerClient {
  constructor() {
    this.baseUrl = process.env.FILEMAKER_BASE_URL;
    this.database = process.env.FILEMAKER_DATABASE;
    this.layout = process.env.FILEMAKER_LAYOUT;
    this.username = process.env.FILEMAKER_USERNAME;
    this.password = process.env.FILEMAKER_PASSWORD;
  }

  async fetchLeads() {
    if (!this.baseUrl || !this.database || !this.username || !this.password || !this.layout) {
      throw new Error('FileMaker configuration is incomplete.');
    }
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const response = await axios.get(`${this.baseUrl}/databases/${this.database}/layouts/${this.layout}/records`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data;
  }
}

export default new FileMakerClient();

// fileMakerService.js
import { syncStatus } from './fileMakerTypes';
import fileMakerClient from './fileMakerClient';
import { normalizeLead } from './fileMakerNormalizer';
import db from './db';

export async function getIntegrationStatus() {
  const configComplete = !!(process.env.FILEMAKER_BASE_URL && process.env.FILEMAKER_DATABASE && process.env.FILEMAKER_USERNAME && process.env.FILEMAKER_PASSWORD && process.env.FILEMAKER_LAYOUT);
  return {
    status: configComplete ? 'configured' : 'unconfigured',
  };
}

export async function importLeads(rawRecords) {
  const syncLog = {
    sync_type: 'import',
    status: syncStatus.SUCCESS,
    imported_count: 0,
    skipped_count: 0,
    error_count: 0,
    started_at: new Date(),
    detail_json: JSON.stringify({}),
  };

  try {
    const leads = rawRecords.map(normalizeLead);
    for (const lead of leads) {
      const existingLead = await matchLeadByPhoneNumber(lead.phone_number);
      if (existingLead) {
        syncLog.skipped_count++;
        await db.filemaker_lead_mappings.insert({
          filemaker_record_id: lead.filemaker_record_id,
          sales_lead_id: existingLead.id,
          match_key: lead.phone_number,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        await db.sales_leads.insert(lead);
        syncLog.imported_count++;
      }
    }
  } catch (error) {
    syncLog.status = syncStatus.FAILED;
    syncLog.error_count++;
  } finally {
    syncLog.completed_at = new Date();
    await db.filemaker_sync_logs.insert(syncLog);
    return syncLog;
  }
}

export async function listImportedLeads() {
  return db.sales_leads.findAll();
}

export async function getSyncHistory() {
  return db.filemaker_sync_logs.findAll();
}

export async function matchLeadByPhoneNumber(phoneNumber) {
  return db.sales_leads.findOne({ where: { phone_number: phoneNumber } });
}

// fileMakerNormalizer.js
export function normalizeLead(rawRecord) {
  return {
    filemaker_record_id: rawRecord.id,
    company_name: rawRecord.companyName,
    store_name: rawRecord.storeName,
    phone_number: rawRecord.phoneNumber,
    postal_code: rawRecord.postalCode,
    address: rawRecord.address,
    industry_major: rawRecord.industryMajor,
    industry_minor: rawRecord.industryMinor,
    status: rawRecord.status,
    priority: rawRecord.priority,
    assigned_to: rawRecord.assignedTo,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// index.js
import { getIntegrationStatus, importLeads, listImportedLeads, getSyncHistory } from './fileMakerService';
import fileMakerClient from './fileMakerClient';

(async () => {
  try {
    const status = await getIntegrationStatus();
    console.log('FileMaker Integration Status:', status);

    const rawRecords = await fileMakerClient.fetchLeads();
    await importLeads(rawRecords);

    const leads = await listImportedLeads();
    console.log('Imported Leads:', leads);

    const syncHistory = await getSyncHistory();
    console.log('Sync History:', syncHistory);
  } catch (error) {
    console.error('Error during FileMaker sync:', error);
  }
})();
```