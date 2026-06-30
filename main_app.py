```javascript
// packages/sales-coach/index.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE live_coaching_sessions (
    id INTEGER PRIMARY KEY,
    lead_id INTEGER,
    operator_id INTEGER,
    started_at DATETIME,
    ended_at DATETIME,
    overall_score INTEGER,
    result TEXT
  )`);

  db.run(`CREATE TABLE live_recommendations (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    recommendation_type TEXT,
    recommendation TEXT,
    confidence REAL,
    displayed_at DATETIME
  )`);
});

app.get('/start-session', (req, res) => {
  const { lead_id, operator_id } = req.query;
  const started_at = new Date().toISOString();
  db.run(`INSERT INTO live_coaching_sessions (lead_id, operator_id, started_at) VALUES (?, ?, ?)`,
    [lead_id, operator_id, started_at], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send({ session_id: this.lastID });
  });
});

app.get('/recommendation', (req, res) => {
  const { session_id } = req.query;
  const recommendation = "Suggest new feature based on past success.";
  const recommendationType = "next move";
  const confidence = Math.random();
  const displayed_at = new Date().toISOString();
  
  db.run(`INSERT INTO live_recommendations (session_id, recommendation_type, recommendation, confidence, displayed_at)
          VALUES (?, ?, ?, ?, ?)`, [session_id, recommendationType, recommendation, confidence, displayed_at], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send({ recommendation, confidence });
  });
});

app.get('/end-session', (req, res) => {
  const { session_id, overall_score, result } = req.query;
  const ended_at = new Date().toISOString();

  db.run(`UPDATE live_coaching_sessions SET ended_at = ?, overall_score = ?, result = ? WHERE id = ?`,
    [ended_at, overall_score, result, session_id], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send({ message: 'Session updated' });
  });
});

app.listen(3000, () => {
  console.log('Real-Time Sales Coach server is running on port 3000');
});

module.exports = app;
```

```javascript
// src/coachingService.js

class CoachingService {
  constructor(db) {
    this.db = db;
  }

  createSession(leadId, operatorId, callback) {
    const startedAt = new Date().toISOString();
    this.db.run(`INSERT INTO live_coaching_sessions (lead_id, operator_id, started_at) VALUES (?, ?, ?)`,
      [leadId, operatorId, startedAt], function(err) {
      callback(err, this ? this.lastID : null);
    });
  }

  endSession(sessionId, overallScore, result, callback) {
    const endedAt = new Date().toISOString();
    this.db.run(`UPDATE live_coaching_sessions SET ended_at = ?, overall_score = ?, result = ? WHERE id = ?`,
      [endedAt, overallScore, result, sessionId], callback);
  }
}

module.exports = CoachingService;
```

```javascript
// src/liveRecommendationEngine.js

class LiveRecommendationEngine {
  constructor(db) {
    this.db = db;
  }

  generateRecommendation(sessionId, callback) {
    const recommendation = "Suggest new feature based on past success.";
    const recommendationType = "next move";
    const confidence = Math.random();
    const displayedAt = new Date().toISOString();

    this.db.run(`INSERT INTO live_recommendations (session_id, recommendation_type, recommendation, confidence, displayed_at)
                VALUES (?, ?, ?, ?, ?)`, [sessionId, recommendationType, recommendation, confidence, displayedAt], function(err) {
      callback(err, { recommendation, confidence });
    });
  }
}

module.exports = LiveRecommendationEngine;
```

```javascript
// src/objectionPredictor.js

class ObjectionPredictor {
  predictObjections() {
    const objections = [
      'Too expensive',
      'Already using a competitor',
      'Not interested right now',
      'Need to consult with a partner',
      'Uncertain about return on investment'
    ];
    return objections.slice(0, 5);
  }
}

module.exports = ObjectionPredictor;
```

```javascript
// src/rebuttalGenerator.js

class RebuttalGenerator {
  generateRebuttal(objections) {
    return objections.map(objection => {
      switch (objection) {
        case 'Too expensive':
          return 'Highlight cost-saving features';
        case 'Already using a competitor':
          return 'Discuss unique benefits';
        case 'Not interested right now':
          return 'Offer a free trial';
        case 'Need to consult with a partner':
          return 'Provide detailed reports and case studies';
        case 'Uncertain about return on investment':
          return 'Provide ROI projections';
        default:
          return 'Follow up later';
      }
    });
  }
}

module.exports = RebuttalGenerator;
```

```javascript
// src/nextActionAdvisor.js

class NextActionAdvisor {
  adviseNextActions() {
    return [
      'Schedule a follow-up meeting',
      'Send a thank you email',
      'Prepare a customized proposal',
      'Update CRM with new information',
      'Set a reminder for the next call'
    ];
  }
}

module.exports = NextActionAdvisor;
```

```javascript
// src/confidenceCalculator.js

class ConfidenceCalculator {
  calculateConfidence(data) {
    return Math.random() * (1 - 0.5) + 0.5;
  }
}

module.exports = ConfidenceCalculator;
```
