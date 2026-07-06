import { DatabaseSync } from "node:sqlite";
import type { TestCallSession } from "./types";
import { parseCallLog, serializeCallLog } from "./persistence";

/**
 * テストコール履歴のSQLite永続化(デスクトップ/Node環境用)。
 * 追加のネイティブ依存を避けるためNode標準の `node:sqlite`(Node 22.5+)を使う
 * (packages/voice-analysis/CallAnalysisRepository と同じ方針)。
 * ブラウザ(WebView)側は localStorage + persistence.ts のJSON直列化を使う。
 * 実DB接続・外部送信はしない(ローカルファイルのみ)。
 */
export class TestCallRepository {
  private readonly db: DatabaseSync;

  constructor(path: string = ":memory:") {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_call_sessions (
        session_id TEXT PRIMARY KEY,
        started_at_ms INTEGER NOT NULL,
        session_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  /** セッションを保存する(同IDは置き換え)。 */
  save(session: TestCallSession): void {
    this.db
      .prepare(
        `INSERT INTO test_call_sessions (session_id, started_at_ms, session_json)
         VALUES (?, ?, ?)
         ON CONFLICT(session_id) DO UPDATE SET
           started_at_ms = excluded.started_at_ms,
           session_json = excluded.session_json`,
      )
      .run(session.id, session.startedAtMs, JSON.stringify(session));
  }

  getById(sessionId: string): TestCallSession | null {
    const row = this.db
      .prepare("SELECT session_json FROM test_call_sessions WHERE session_id = ?")
      .get(sessionId) as { session_json: string } | undefined;
    if (!row) {
      return null;
    }
    const parsed = parseCallLog(serializeWrap(row.session_json));
    return parsed[0] ?? null;
  }

  /** 全セッションを新しい順で返す(壊れた行は捨てる)。 */
  listSessions(): TestCallSession[] {
    const rows = this.db
      .prepare("SELECT session_json FROM test_call_sessions ORDER BY started_at_ms DESC")
      .all() as Array<{ session_json: string }>;
    return rows.flatMap((row) => parseCallLog(serializeWrap(row.session_json)));
  }

  close(): void {
    this.db.close();
  }
}

/** 1件のセッションJSONを parseCallLog が読める形(CallLogFile)に包む。 */
function serializeWrap(sessionJson: string): string {
  try {
    const session = JSON.parse(sessionJson) as TestCallSession;
    return serializeCallLog([session]);
  } catch {
    return serializeCallLog([]);
  }
}
