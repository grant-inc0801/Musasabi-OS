```javascript
// fileMakerImportPreviewService.js
class FileMakerImportPreviewService {
  applyFieldMapping(fileMakerRecord) {
    // Implement field mapping logic
  }

  normalizePhoneNumber(phoneNumber) {
    // Implement phone number normalization logic
  }

  validateRequiredFields(mappedRecord) {
    // Implement required fields validation
  }

  classifyRecord(mappedRecord, isDuplicate) {
    if (isDuplicate) {
      return 'duplicate';
    }
    if (this.validateRequiredFields(mappedRecord)) {
      return 'valid';
    }
    return 'error';
  }
}

// duplicateLeadDetector.js
class DuplicateLeadDetector {
  constructor(existingLeads) {
    this.existingLeads = existingLeads;
  }

  detectDuplicate(fileMakerRecord) {
    const { phone_number, company_name, address } = fileMakerRecord;
    return this.existingLeads.find(
      lead => lead.phone_number === phone_number ||
              (lead.company_name === company_name && lead.address === address)
    );
  }
}

// importApprovalService.js
class ImportApprovalService {
  constructor(dbConnection) {
    this.dbConnection = dbConnection;
  }

  async approveBatch(batchId) {
    // Implement batch approval logic
  }

  async importApprovedRecords(batchId) {
    // Implement importing logic for approved records
  }
}

// SQLite table creation (pseudo-code)
const dbSchema = `
CREATE TABLE filemaker_import_batches (
  id INTEGER PRIMARY KEY,
  status TEXT,
  source TEXT,
  total_records INTEGER,
  valid_records INTEGER,
  duplicate_records INTEGER,
  warning_records INTEGER,
  error_records INTEGER,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE filemaker_import_preview_records (
  id INTEGER PRIMARY KEY,
  batch_id INTEGER,
  raw_record_json TEXT,
  mapped_record_json TEXT,
  status TEXT,
  warning_json TEXT,
  duplicate_lead_id INTEGER,
  created_at DATETIME
);
`;

// Placeholder for UI functions
function displayBatchSummary(batch) {
  // Implement UI batch summary display
}

function displayRecordTable(records) {
  // Implement UI record table display
}

function onApproveButtonClicked(batchId) {
  // Handle approve button click event
}

// Tests (pseudo-code)
async function testImportPreviewBatchCreation() {
  // Implement test for batch creation
}

async function testFieldMappingApplication() {
  // Implement test for field mapping application
}

async function testDuplicateDetectionByPhone() {
  // Implement test for duplicate detection by phone
}

async function testDuplicateDetectionByCompanyAndAddress() {
  // Implement test for duplicate detection by company and address
}

async function testErrorOnMissingPhoneNumber() {
  // Implement test for error on missing phone number
}

async function testApprovalLeadsToImport() {
  // Implement test for approval leading to import
}

async function testDefaultSkipForDuplicate() {
  // Implement test for default skip of duplicate
}

async function testCancelledBatchNotImported() {
  // Implement test to ensure cancelled batch not imported
}
```