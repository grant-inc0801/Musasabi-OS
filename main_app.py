```python
import sqlite3
from datetime import datetime

# データベース接続
conn = sqlite3.connect('transcripts.db')
c = conn.cursor()

# call_transcriptsテーブル作成
c.execute('''
    CREATE TABLE IF NOT EXISTS call_transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        call_log_id INTEGER,
        lead_id INTEGER,
        transcript TEXT,
        source TEXT DEFAULT 'manual',
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# トランスクリプトの新規作成
def create_transcript(call_log_id, lead_id, transcript, source='manual'):
    created_at = datetime.now()
    updated_at = datetime.now()
    c.execute('''
        INSERT INTO call_transcripts (call_log_id, lead_id, transcript, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (call_log_id, lead_id, transcript, source, created_at, updated_at))
    conn.commit()

# トランスクリプトの更新
def update_transcript(id, transcript):
    updated_at = datetime.now()
    c.execute('''
        UPDATE call_transcripts
        SET transcript = ?, updated_at = ?
        WHERE id = ?
    ''', (transcript, updated_at, id))
    conn.commit()

# トランスクリプトの検索
def search_transcripts(keyword):
    c.execute('''
        SELECT * FROM call_transcripts
        WHERE transcript LIKE ?
    ''', ('%' + keyword + '%',))
    return c.fetchall()

# サマリーの生成
def generate_summary(transcript_id):
    # MUSAサマリー生成モック
    summary = "Generated summary."
    updated_at = datetime.now()
    c.execute('''
        UPDATE call_transcripts
        SET summary = ?, updated_at = ?
        WHERE id = ?
    ''', (summary, updated_at, transcript_id))
    conn.commit()

# トランスクリプトリンク（この例では表示用）
def get_transcript_link(transcript_id):
    return f"http://example.com/transcripts/{transcript_id}"

# テスト用のサンプルデータ作成
create_transcript(1, 1, "Sample transcript content", "manual")
create_transcript(2, 2, "Another transcript example", "zoom_ai")
update_transcript(1, "Updated transcript content")
result = search_transcripts("Sample")
generate_summary(1)
transcript_link = get_transcript_link(1)

# データベースクローズ
conn.close()

# 結果表示（この部分は実際の実装ではUIに置き換える）
print(result)
print(transcript_link)
```