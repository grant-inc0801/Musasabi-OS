```javascript
// packages/integrations/src/filemaker/fileMakerFieldMappingRepository.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS filemaker_field_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filemaker_field_name TEXT,
        musasabi_field_name TEXT,
        data_type TEXT,
        required BOOLEAN,
        enabled BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const stmt = db.prepare(`INSERT INTO filemaker_field_mappings 
        (filemaker_field_name, musasabi_field_name, data_type, required, enabled) 
        VALUES (?, ?, ?, ?, ?)`);
    
    const defaultMappings = [
        ['顧客名', 'company_name', 'TEXT', true, true],
        ['会社名', 'company_name', 'TEXT', true, true],
        ['店舗名', 'store_name', 'TEXT', true, true],
        ['電話番号', 'phone_number', 'TEXT', true, true],
        ['TEL', 'phone_number', 'TEXT', true, true],
        ['郵便番号', 'postal_code', 'TEXT', false, true],
        ['住所', 'address', 'TEXT', false, true],
        ['業種大分類', 'industry_major', 'TEXT', false, true],
        ['業種小分類', 'industry_minor', 'TEXT', false, true],
        ['ステータス', 'status', 'TEXT', false, true],
        ['優先度', 'priority', 'TEXT', false, true],
        ['担当者', 'assigned_to', 'TEXT', false, true]
    ];

    defaultMappings.forEach(mapping => stmt.run(...mapping));
    stmt.finalize();
});

module.exports = db;

// packages/integrations/src/filemaker/fileMakerFieldMappingService.js
const db = require('./fileMakerFieldMappingRepository');

class FileMakerFieldMappingService {
    getMappings() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM filemaker_field_mappings WHERE enabled = 1", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    mapRecord(record) {
        return this.getMappings().then(mappings => {
            const mappedRecord = {};
            mappings.forEach(mapping => {
                if (record[mapping.filemaker_field_name] != null) {
                    mappedRecord[mapping.musasabi_field_name] = record[mapping.filemaker_field_name];
                }
            });

            if (!mappedRecord.phone_number) {
                console.warn('Record skipped due to missing phone number:', record);
                return null;
            }

            return mappedRecord;
        });
    }
}

module.exports = new FileMakerFieldMappingService();

// packages/integrations/src/filemaker/fileMakerSchemaDetector.js
const fmService = require('./fileMakerFieldMappingService');

class FileMakerSchemaDetector {
    importLeadRecords(records) {
        return Promise.all(records.map(record => fmService.mapRecord(record)))
            .then(mappedRecords => {
                return mappedRecords.filter(mappedRecord => mappedRecord !== null);
            });
    }
}

module.exports = FileMakerSchemaDetector;
```