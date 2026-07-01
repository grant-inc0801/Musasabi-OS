```javascript
// packages/voice-analysis/src/voiceAnalysisService.js
const sqlite3 = require('sqlite3').verbose();

class VoiceAnalysisService {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
  }

  createVoiceAnalysisRecord(record) {
    const stmt = this.db.prepare(
      "INSERT INTO voice_analysis_records (call_log_id, transcript_id, lead_id, talk_speed_score, silence_score, interruption_score, tone_score, listening_score, clarity_score, overall_score, summary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(
      record.callLogId,
      record.transcriptId,
      record.leadId,
      record.talkSpeedScore,
      record.silenceScore,
      record.interruptionScore,
      record.toneScore,
      record.listeningScore,
      record.clarityScore,
      record.overallScore,
      record.summary,
      new Date(),
      new Date()
    );
    stmt.finalize();
  }

  updateVoiceAnalysisRecord(id, updates) {
    // Implement update logic
  }
}

module.exports = VoiceAnalysisService;

// packages/voice-analysis/src/voiceMetricRepository.js
class VoiceMetricRepository {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
  }

  saveVoiceMetric(metric) {
    const stmt = this.db.prepare(
      "INSERT INTO voice_metrics (analysis_id, metric_name, metric_value, unit, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(
      metric.analysisId,
      metric.metricName,
      metric.metricValue,
      metric.unit,
      new Date()
    );
    stmt.finalize();
  }

  // Implement additional database operations
}

module.exports = VoiceMetricRepository;

// packages/voice-analysis/src/speechPatternAnalyzer.js
class SpeechPatternAnalyzer {
  analyze(transcript) {
    // Mock implementation
    return {
      talkSpeedScore: Math.random() * 100,
      customerTalkRatio: Math.random(),
      operatorTalkRatio: Math.random()
    };
  }
}

module.exports = SpeechPatternAnalyzer;

// packages/voice-analysis/src/silenceAnalyzer.js
class SilenceAnalyzer {
  analyze(silenceDurations) {
    // Mock implementation
    return {
      silenceScore: Math.random() * 100
    };
  }
}

module.exports = SilenceAnalyzer;

// packages/voice-analysis/src/interruptionAnalyzer.js
class InterruptionAnalyzer {
  analyze(interruptions) {
    // Mock implementation
    return {
      interruptionScore: Math.random() * 100
    };
  }
}

module.exports = InterruptionAnalyzer;

// packages/voice-analysis/src/toneAnalyzer.js
class ToneAnalyzer {
  analyze(audio) {
    // Mock implementation
    return {
      toneScore: Math.random() * 100
    };
  }
}

module.exports = ToneAnalyzer;

// packages/voice-analysis/src/voiceScoreCalculator.js
class VoiceScoreCalculator {
  calculateScores(metrics) {
    // Mock scoring logic
    return {
      overallScore: (metrics.talkSpeedScore + metrics.silenceScore + metrics.interruptionScore + metrics.toneScore) / 4,
      summary: "Mock summary"
    };
  }
}

module.exports = VoiceScoreCalculator;

// packages/voice-analysis/src/index.js
const VoiceAnalysisService = require('./voiceAnalysisService');
const VoiceMetricRepository = require('./voiceMetricRepository');
const SpeechPatternAnalyzer = require('./speechPatternAnalyzer');
const SilenceAnalyzer = require('./silenceAnalyzer');
const InterruptionAnalyzer = require('./interruptionAnalyzer');
const ToneAnalyzer = require('./toneAnalyzer');
const VoiceScoreCalculator = require('./voiceScoreCalculator');

const dbPath = 'path/to/database.sqlite';

const voiceAnalysisService = new VoiceAnalysisService(dbPath);
const voiceMetricRepository = new VoiceMetricRepository(dbPath);
const speechPatternAnalyzer = new SpeechPatternAnalyzer();
const silenceAnalyzer = new SilenceAnalyzer();
const interruptionAnalyzer = new InterruptionAnalyzer();
const toneAnalyzer = new ToneAnalyzer();
const voiceScoreCalculator = new VoiceScoreCalculator();

// Mock example of using the services
const transcript = {};  // Mock transcript
const silenceDurations = [];  // Mock silence durations
const interruptions = [];  // Mock interruptions
const audio = {};  // Mock audio

const speechMetrics = speechPatternAnalyzer.analyze(transcript);
const silenceMetrics = silenceAnalyzer.analyze(silenceDurations);
const interruptionMetrics = interruptionAnalyzer.analyze(interruptions);
const toneMetrics = toneAnalyzer.analyze(audio);

const aggregatedMetrics = {
  ...speechMetrics,
  ...silenceMetrics,
  ...interruptionMetrics,
  ...toneMetrics
};

const scores = voiceScoreCalculator.calculateScores(aggregatedMetrics);

voiceAnalysisService.createVoiceAnalysisRecord({
  callLogId: 1,
  transcriptId: 1,
  leadId: 1,
  talkSpeedScore: aggregatedMetrics.talkSpeedScore,
  silenceScore: aggregatedMetrics.silenceScore,
  interruptionScore: aggregatedMetrics.interruptionScore,
  toneScore: aggregatedMetrics.toneScore,
  listeningScore: 0,
  clarityScore: 0,
  overallScore: scores.overallScore,
  summary: scores.summary
});
```