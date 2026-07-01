```javascript
// packages/sales-coach/src/realtimeCoachService.js
class RealtimeCoachService {
  constructor(contextBuilder, signalDetector, recommendationEngine) {
    this.contextBuilder = contextBuilder;
    this.signalDetector = signalDetector;
    this.recommendationEngine = recommendationEngine;
  }

  async getRecommendations(data) {
    const context = await this.contextBuilder.build(data);
    const signals = this.signalDetector.detect(context);
    return this.recommendationEngine.generate(signals, context);
  }
}

module.exports = RealtimeCoachService;

// packages/sales-coach/src/coachingContextBuilder.js
class CoachingContextBuilder {
  async build(data) {
    // Build context from lead profile, call history, transcript, etc.
    return {
      leadProfile: data.leadProfile,
      callHistory: data.callHistory,
      transcript: data.transcript,
      appointmentForecast: data.appointmentForecast,
      leadPriority: data.leadPriority,
      salesBrainInsights: data.salesBrainInsights,
      scriptRecommendations: data.scriptRecommendations,
      voiceAnalysis: data.voiceAnalysis,
    };
  }
}

module.exports = CoachingContextBuilder;

// packages/sales-coach/src/coachingSignalDetector.js
class CoachingSignalDetector {
  detect(context) {
    const signals = [];
    // Detect signals based on context
    if (context.leadProfile.isNew) signals.push('startRecommendation');
    if (context.appointmentForecast.high) signals.push('directClose');
    if (context.transcript.hasObjections) signals.push('refuteObjection');
    if (context.voiceAnalysis.highOperatorTalkRatio) signals.push('askMoreQuestions');
    return signals;
  }
}

module.exports = CoachingSignalDetector;

// packages/sales-coach/src/coachingRecommendationEngine.js
class CoachingRecommendationEngine {
  generate(signals, context) {
    const recommendations = [];
    // Generate recommendations based on detected signals
    signals.forEach(signal => {
      switch (signal) {
        case 'startRecommendation':
          recommendations.push(this.createRecommendation('start', context));
          break;
        case 'directClose':
          recommendations.push(this.createRecommendation('close', context));
          break;
        case 'refuteObjection':
          recommendations.push(this.createRecommendation('refute', context));
          break;
        case 'askMoreQuestions':
          recommendations.push(this.createRecommendation('question', context));
          break;
        default:
          break;
      }
    });
    return recommendations;
  }

  createRecommendation(type, context) {
    // Create recommendation based on type and context
    return {
      recommendationType: type,
      recommendation: `Recommended action based on ${type}`,
      reason: `Based on ${type} signals`,
      confidence: 0.9,
      priority: 1,
    };
  }
}

module.exports = CoachingRecommendationEngine;

// packages/sales-coach/src/nextBestLineGenerator.js
class NextBestLineGenerator {
  generate(context) {
    // Use context to generate the next best line suggestion
    return `Next best line based on context: ${context.transcript.latest}`;
  }
}

module.exports = NextBestLineGenerator;

// packages/sales-coach/src/coachingSessionRepository.js
const sqlite3 = require('sqlite3').verbose();

class CoachingSessionRepository {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
      } else {
        console.log('Connected to database');
      }
    });
  }

  saveSession(session) {
    // Save the coaching session data into the database
    const { id, lead_id, created_at } = session;
    this.db.run('INSERT INTO realtime_coaching_sessions (id, lead_id, created_at) VALUES (?, ?, ?)',
      [id, lead_id, created_at]);
  }

  saveRecommendation(recommendation) {
    // Save recommendation data into the database
    const { session_id, recommendation, confidence, created_at } = recommendation;
    this.db.run('INSERT INTO realtime_coaching_recommendations (session_id, recommendation, confidence, created_at) VALUES (?, ?, ?, ?)',
      [session_id, recommendation, confidence, created_at]);
  }
}

module.exports = CoachingSessionRepository;

// packages/sales-coach/src/index.js
const RealtimeCoachService = require('./realtimeCoachService');
const CoachingContextBuilder = require('./coachingContextBuilder');
const CoachingSignalDetector = require('./coachingSignalDetector');
const CoachingRecommendationEngine = require('./coachingRecommendationEngine');
const CoachingSessionRepository = require('./coachingSessionRepository');

const contextBuilder = new CoachingContextBuilder();
const signalDetector = new CoachingSignalDetector();
const recommendationEngine = new CoachingRecommendationEngine();
const sessionRepository = new CoachingSessionRepository('path/to/sqlite.db');

const realtimeCoachService = new RealtimeCoachService(contextBuilder, signalDetector, recommendationEngine);

async function main() {
  const data = {}; // Assume this is populated with required data
  const recommendations = await realtimeCoachService.getRecommendations(data);
  recommendations.forEach(rec => sessionRepository.saveRecommendation(rec));
}

main();
```
