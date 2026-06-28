```javascript
// packages/approval/src/approvalRepository.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE approval_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      requested_by TEXT,
      requested_by_type TEXT,
      action TEXT,
      resource_type TEXT,
      status TEXT,
      reason TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);
});

class ApprovalRepository {
  createRequest(request) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO approval_requests 
        (title, requested_by, requested_by_type, action, resource_type, status, reason, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      stmt.run(
        request.title,
        request.requested_by,
        request.requested_by_type,
        request.action,
        request.resource_type,
        request.status,
        request.reason,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM approval_requests WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  list() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM approval_requests', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`UPDATE approval_requests SET status = ?, updated_at = datetime('now') WHERE id = ?`);
      stmt.run(status, id, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
}

module.exports = ApprovalRepository;
```

```javascript
// packages/approval/src/approvalService.js
const ApprovalRepository = require('./approvalRepository');

class ApprovalService {
  constructor() {
    this.repository = new ApprovalRepository();
    this.StatusEnum = {
      SUBMITTED: 'submitted',
      WAITING: 'waiting',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      CANCELLED: 'cancelled',
    };
  }

  async createApprovalRequest(data) {
    const request = {
      ...data,
      status: this.StatusEnum.SUBMITTED,
    };
    const id = await this.repository.createRequest(request);
    return id;
  }

  async getApprovalRequest(id) {
    const request = await this.repository.findById(id);
    return request;
  }
  
  async listApprovalRequests() {
    const requests = await this.repository.list();
    return requests;
  }

  async updateApprovalStatus(id, status) {
    const validStatus = Object.values(this.StatusEnum).includes(status);
    if (!validStatus) {
      throw new Error('Invalid status value');
    }
    const changes = await this.repository.updateStatus(id, status);
    return changes;
  }
}

module.exports = ApprovalService;
```

```javascript
// packages/approval/src/index.js
const ApprovalService = require('./approvalService');

async function main() {
  const service = new ApprovalService();

  console.log("Approval Engine: Ready");

  const requestId = await service.createApprovalRequest({
    title: 'Request 1',
    requested_by: 'User A',
    requested_by_type: 'user',
    action: 'access',
    resource_type: 'file',
    reason: 'Need access to perform tasks'
  });

  console.log("Approval Request: Created");

  const request = await service.getApprovalRequest(requestId);
  console.log("Approval Status: ", request.status);
}

main();
```

```javascript
// unit tests are typically in a separate directory, but here's a basic example
// packages/approval/test/approvalService.test.js
const ApprovalService = require('../src/approvalService');
const assert = require('assert');

(async () => {
  const service = new ApprovalService();

  // Test: Request creation
  const requestID = await service.createApprovalRequest({
    title: 'Sample Request',
    requested_by: 'tester',
    requested_by_type: 'user',
    action: 'create',
    resource_type: 'document',
    reason: 'Testing'
  });
  assert.ok(requestID, 'Request ID should be created');

  // Test: Request retrieval
  const request = await service.getApprovalRequest(requestID);
  assert.equal(request.title, 'Sample Request', 'Request title should match');

  // Test: Status update
  const updated = await service.updateApprovalStatus(requestID, service.StatusEnum.APPROVED);
  assert.equal(updated, 1, 'Should update one row');

  const updatedRequest = await service.getApprovalRequest(requestID);
  assert.equal(updatedRequest.status, 'approved', 'Status should be updated to approved');

  // Test: UI bootstrap - simple console output check
  console.log("Tests passed");
})();
```