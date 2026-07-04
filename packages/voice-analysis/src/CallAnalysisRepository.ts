import { DatabaseSync } from "node:sqlite";
import type { CallAnalysisSummary } from "./types";

/**
 * 通話解析結果の永続化。追加のネイティブ依存を避けるためNode標準の `node:sqlite`
 * (Node 22.5+, experimental)を使う。Electronメインプロセスでのバンドル済みNode
 * バージョンとの互換性はこの開発環境では未検証(docs/ARCHITECTURE.md Phase 6)。
 */
export class CallAnalysisRepository {
  private readonly db: DatabaseSync;

  constructor(path: string = ":memory:") {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS call_analysis (
        call_id TEXT PRIMARY KEY,
        summary_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  save(summary: CallAnalysisSummary): void {
    this.db
      .prepare(
        `INSERT INTO call_analysis (call_id, summary_json) VALUES (?, ?)
         ON CONFLICT(call_id) DO UPDATE SET summary_json = excluded.summary_json`,
      )
      .run(summary.callId, JSON.stringify(summary));
  }

  getByCallId(callId: string): CallAnalysisSummary | null {
    const row = this.db.prepare("SELECT summary_json FROM call_analysis WHERE call_id = ?").get(callId) as
      | { summary_json: string }
      | undefined;
    return row ? (JSON.parse(row.summary_json) as CallAnalysisSummary) : null;
  }

  close(): void {
    this.db.close();
  }
}
