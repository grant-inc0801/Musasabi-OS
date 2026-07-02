```javascript
// scripts/github/pipeline-checkpoint.js

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../../.github/ai-pipeline-state/pipeline.db');
const checkpointFilePath = path.join(__dirname, '../../.github/ai-pipeline-state/checkpoints.json');

function getDbConnection() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Database connection error:', err.message);
    });
}

function init() {
    if (!fs.existsSync(path.dirname(checkpointFilePath))) {
        fs.mkdirSync(path.dirname(checkpointFilePath), { recursive: true });
    }

    const db = getDbConnection();
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS checkpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_number TEXT,
            issue_title TEXT,
            task_key TEXT,
            checkpoint TEXT,
            status TEXT,
            commit_hash TEXT,
            timestamp INTEGER,
            error_message TEXT
        )`);
    });
    db.close();
}

function writeCheckpoint(task_key, options) {
    const { issue_number, issue_title, commit, status, error } = options;
    const db = getDbConnection();
    const timestamp = Date.now();
    const sql = `INSERT INTO checkpoints (issue_number, issue_title, task_key, checkpoint, status, commit_hash, timestamp, error_message)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [issue_number, issue_title, task_key, task_key, status, commit, timestamp, error], (err) => {
        if (err) console.error('Write error:', err.message);
    });
    db.close();
}

function readCheckpoint(task_key) {
    const db = getDbConnection();
    const sql = `SELECT * FROM checkpoints WHERE task_key = ? ORDER BY timestamp DESC LIMIT 1`;
    db.get(sql, [task_key], (err, row) => {
        if (err) console.error('Read error:', err.message);
        else console.log(row);
    });
    db.close();
}

function checkpointExists(task_key, callback) {
    const db = getDbConnection();
    const sql = `SELECT 1 FROM checkpoints WHERE task_key = ? LIMIT 1`;
    db.get(sql, [task_key], (err, row) => {
        if (err) console.error('Exists error:', err.message);
        else callback(!!row);
    });
    db.close();
}

function clearCheckpoints() {
    const db = getDbConnection();
    db.run(`DELETE FROM checkpoints`, [], (err) => {
        if (err) console.error('Clear error:', err.message);
    });
    db.close();
}

function summary() {
    const db = getDbConnection();
    const sql = `SELECT * FROM checkpoints ORDER BY timestamp DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) console.error('Summary error:', err.message);
        else console.log(rows);
    });
    db.close();
}

const [,, cmd, task_key, flag, value] = process.argv;

init();

switch (cmd) {
    case 'write':
        writeCheckpoint(task_key, {
            issue_number: process.env.ISSUE_NUMBER || 'unknown',
            issue_title: process.env.ISSUE_TITLE || 'unknown',
            commit: flag === '--commit' ? value : null,
            status: 'completed',
            error: null
        });
        break;
    case 'read':
        readCheckpoint(task_key);
        break;
    case 'exists':
        checkpointExists(task_key, (exists) => console.log(exists));
        break;
    case 'clear':
        clearCheckpoints();
        break;
    case 'summary':
        summary();
        break;
    default:
        console.log('Command not found');
}
```