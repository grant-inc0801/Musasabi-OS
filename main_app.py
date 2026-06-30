```javascript
// packages/appointment-forecast/src/appointmentForecastService.js
class AppointmentForecastService {
  calculateProbability(leadData, callHistory) {
    let probability = 0;
    let positiveFactors = [];
    let negativeFactors = [];

    // Example logic for probability calculation
    if (leadData.status === 'interested') {
      probability += 20;
      positiveFactors.push("Lead shows interest");
    }
    if (callHistory.some(call => call.callbackScheduled)) {
      probability += 15;
      positiveFactors.push("Callback is scheduled");
    }
    if (leadData.industry === 'successfulIndustry') {
      probability += 10;
      positiveFactors.push("High success rate in similar industry");
    }
    if (!leadData.decisionMakerConfirmed) {
      probability -= 10;
      negativeFactors.push("Decision maker not confirmed");
    }

    return {
      probability: Math.min(Math.max(probability, 0), 100),
      positiveFactors,
      negativeFactors
    };
  }

  calculateConfidence(probability) {
    return probability >= 50 ? 'High' : 'Low';
  }

  generateExplanation(probability, factors) {
    return `Probability: ${probability}%, Positive factors: ${factors.positiveFactors.join(", ")}, Negative factors: ${factors.negativeFactors.join(", ")}`;
  }
}

module.exports = AppointmentForecastService;

// packages/appointment-forecast/src/probabilityCalculator.js
class ProbabilityCalculator {
  determineProbability(lead) {
    // Just returning a static number for the sake of example
    return Math.floor(Math.random() * 101);
  }
}

module.exports = ProbabilityCalculator;

// packages/appointment-forecast/src/forecastRepository.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

class ForecastRepository {
  constructor() {
    this.createTable();
  }

  createTable() {
    db.run(`CREATE TABLE appointment_forecasts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              lead_id INTEGER,
              probability INTEGER,
              confidence TEXT,
              reason TEXT,
              positive_factors_json TEXT,
              negative_factors_json TEXT,
              calculated_at TEXT
            )`);
  }

  saveForecast(forecast) {
    db.run(`INSERT INTO appointment_forecasts 
            (lead_id, probability, confidence, reason, positive_factors_json, negative_factors_json, calculated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [forecast.lead_id, forecast.probability, forecast.confidence, forecast.reason, 
       JSON.stringify(forecast.positiveFactors), JSON.stringify(forecast.negativeFactors), new Date().toISOString()]);
  }
}

module.exports = ForecastRepository;

// packages/appointment-forecast/src/forecastExplainer.js
class ForecastExplainer {
  getExplanation(probabilityData) {
    return `Probability: ${probabilityData.probability}%, Confidence: ${probabilityData.confidence}, Reason: Some reasons`;
  }
}

module.exports = ForecastExplainer;

// packages/appointment-forecast/src/index.js
const AppointmentForecastService = require('./appointmentForecastService');
const ForecastRepository = require('./forecastRepository');
const ForecastExplainer = require('./forecastExplainer');

const leadData = {
  status: 'interested',
  industry: 'successfulIndustry',
  decisionMakerConfirmed: false
};

const callHistory = [
  { callbackScheduled: true }
];

const forecastService = new AppointmentForecastService();
const repository = new ForecastRepository();
const explainer = new ForecastExplainer();

const forecast = forecastService.calculateProbability(leadData, callHistory);
forecast.confidence = forecastService.calculateConfidence(forecast.probability);
forecast.reason = explainer.getExplanation(forecast);

repository.saveForecast({ 
  lead_id: 123, 
  ...forecast, 
  positiveFactors: forecast.positiveFactors, 
  negativeFactors: forecast.negativeFactors 
});
```
