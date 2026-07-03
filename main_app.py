```python
import sqlite3
from datetime import datetime

# Database setup
connection = sqlite3.connect(':memory:')
cursor = connection.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS emotion_states (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    emotion TEXT,
    confidence REAL,
    reason TEXT,
    created_at TEXT
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS personality_profiles (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    profile TEXT,
    intensity REAL,
    updated_at TEXT
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS emotion_history (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    previous_emotion TEXT,
    new_emotion TEXT,
    trigger TEXT,
    created_at TEXT
)''')

# Emotion Engine System
class EmotionEngine:
    def __init__(self):
        self.current_emotion = 'Neutral'
        self.confidence = 1.0
        self.reason = 'Initial State'
    
    def setEmotion(self, emotion, confidence, reason):
        self.current_emotion = emotion
        self.confidence = confidence
        self.reason = reason
        cursor.execute('''
            INSERT INTO emotion_states (employee_id, emotion, confidence, reason, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (1, emotion, confidence, reason, str(datetime.now())))
        connection.commit()

    def getEmotion(self):
        return self.current_emotion, self.confidence, self.reason
    
    def calculateEmotion(self, metrics):
        if metrics['progress'] > 75:
            self.setEmotion('Celebrating', 0.9, 'High Progress')
        elif metrics['failures'] > 3:
            self.setEmotion('Encouraging', 0.8, 'Multiple Failures')
        else:
            self.setEmotion('Focused', 0.7, 'Steady Progress')
    
    def applyContext(self, context):
        if context == 'High Load':
            self.setEmotion('Concerned', 0.75, 'User Under Pressure')
        elif context == 'Idle':
            self.setEmotion('Neutral', 0.6, 'Idle Workflow')
    
    def resetEmotion(self):
        self.setEmotion('Neutral', 1.0, 'Reset State')

# Adaptive Personality System
class AdaptivePersonality:
    def __init__(self):
        self.profile = 'Default'
        self.intensity = 1.0
    
    def updateProfile(self, profile, intensity):
        self.profile = profile
        self.intensity = intensity
        cursor.execute('''
            INSERT INTO personality_profiles (employee_id, profile, intensity, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (1, profile, intensity, str(datetime.now())))
        connection.commit()
    
    def getProfile(self):
        return self.profile, self.intensity

# Example Usage
emotion_engine = EmotionEngine()
emotion_engine.setEmotion('Happy', 0.9, 'Completed a Task')

adaptive_personality = AdaptivePersonality()
adaptive_personality.updateProfile('Analytical', 0.8)

emotion_engine.calculateEmotion({'progress': 80, 'failures': 2})
emotion_engine.applyContext('High Load')
emotion_engine.resetEmotion()

print("Current Emotion:", emotion_engine.getEmotion())
print("Current Profile:", adaptive_personality.getProfile())
```