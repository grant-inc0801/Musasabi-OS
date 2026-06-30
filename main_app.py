```javascript
// packages/sales-script/src/scriptRepository.js
const sqlite3 = require('sqlite3').verbose();

class ScriptRepository {
  constructor(databaseFile = ':memory:') {
    this.db = new sqlite3.Database(databaseFile, (err) => {
      if (err) {
        console.error('Database opening error: ', err);
      }
    });
  }

  createTables() {
    const createSalesScriptsTable = `
      CREATE TABLE IF NOT EXISTS sales_scripts (
        id INTEGER PRIMARY KEY,
        title TEXT,
        category TEXT,
        content TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `;

    const createSalesScriptVariantsTable = `
      CREATE TABLE IF NOT EXISTS sales_script_variants (
        id INTEGER PRIMARY KEY,
        script_id INTEGER,
        variant_name TEXT,
        content TEXT,
        usage_count INTEGER,
        appointment_count INTEGER,
        success_rate REAL,
        confidence REAL,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY(script_id) REFERENCES sales_scripts(id)
      );
    `;

    const createSalesScriptUsageLogsTable = `
      CREATE TABLE IF NOT EXISTS sales_script_usage_logs (
        id INTEGER PRIMARY KEY,
        script_id INTEGER,
        variant_id INTEGER,
        lead_id INTEGER,
        transcript_id INTEGER,
        call_result TEXT,
        appointment_created INTEGER,
        created_at TEXT,
        FOREIGN KEY(script_id) REFERENCES sales_scripts(id),
        FOREIGN KEY(variant_id) REFERENCES sales_script_variants(id)
      );
    `;

    this.db.exec(createSalesScriptsTable + createSalesScriptVariantsTable + createSalesScriptUsageLogsTable, (err) => {
      if (err) {
        console.error('Table creation error: ', err);
      }
    });
  }
}

module.exports = ScriptRepository;

// packages/sales-script/src/scriptService.js
class ScriptService {
  constructor(scriptRepository) {
    this.scriptRepository = scriptRepository;
  }

  createScript(title, category, content, status) {
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const query = `
      INSERT INTO sales_scripts (title, category, content, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    this.scriptRepository.db.run(query, [title, category, content, status, createdAt, updatedAt], function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`A row has been inserted with ID ${this.lastID}`);
      }
    });
  }
}

module.exports = ScriptService;

// packages/sales-script/src/scriptOptimizer.js
class ScriptOptimizer {
  constructor(scriptRepository) {
    this.scriptRepository = scriptRepository;
  }

  calculateSuccessRate(variantId) {
    const query = `
      SELECT usage_count, appointment_count FROM sales_script_variants WHERE id = ?
    `;
    this.scriptRepository.db.get(query, [variantId], (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        const successRate = row.appointment_count / row.usage_count;
        const updateQuery = `
          UPDATE sales_script_variants SET success_rate = ? WHERE id = ?
        `;
        this.scriptRepository.db.run(updateQuery, [successRate, variantId], (updateErr) => {
          if (updateErr) {
            console.error(updateErr.message);
          }
        });
      }
    });
  }
}

module.exports = ScriptOptimizer;

// packages/sales-script/src/index.js
const ScriptRepository = require('./scriptRepository');
const ScriptService = require('./scriptService');
const ScriptOptimizer = require('./scriptOptimizer');

const dbFile = 'sales_scripts.db';
const scriptRepository = new ScriptRepository(dbFile);
scriptRepository.createTables();

const scriptService = new ScriptService(scriptRepository);
const scriptOptimizer = new ScriptOptimizer(scriptRepository);

scriptService.createScript('Test Script', 'opening', 'Hello, this is a test script.', 'active');
scriptOptimizer.calculateSuccessRate(1);
```
