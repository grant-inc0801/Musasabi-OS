```python
# Import necessary libraries
import sqlite3
from datetime import datetime

# Constants
SPRINT_STATUS = "Active"

# Connect to SQLite database
def connect_database():
    conn = sqlite3.connect('musasabi_os.db')
    return conn

# Create the development_reports table
def create_table(conn):
    with conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS development_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sprint_key TEXT,
                generated_at TIMESTAMP,
                report_type TEXT,
                summary TEXT,
                quality_score REAL
            )
        ''')

# Generate a daily development report
def generate_report(sprint_key, report_type, summary, quality_score):
    conn = connect_database()
    create_table(conn)
    with conn:
        conn.execute('''
            INSERT INTO development_reports (sprint_key, generated_at, report_type, summary, quality_score)
            VALUES (?, ?, ?, ?, ?)
        ''', (sprint_key, datetime.now(), report_type, summary, quality_score))
    conn.close()

# Sample report data
sprint_key = 'S5-012'
report_type = 'Daily Development Report'
summary = 'Tasks completed: 5, Tasks failed: 1'
quality_score = 8.5

# Generate a sample report
generate_report(sprint_key, report_type, summary, quality_score)
```