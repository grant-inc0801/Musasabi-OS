// Brain Memory Engine の型定義(Development Bible 第9章)。
// 「全ての行動はMemoryに保存」— AI社員・ユーザーの行動を6分類で記録する。
// 保存はローカルのみ(localStorage / SQLiteファイル)。外部送信はしない。

/** メモリの分類(Development Bible 第9章)。 */
export type MemoryCategory =
  | "short_term" // 短期
  | "long_term" // 長期
  | "work" // 業務
  | "user" // ユーザー
  | "company" // 会社
  | "project"; // プロジェクト

export const MEMORY_CATEGORIES: readonly MemoryCategory[] = [
  "short_term",
  "long_term",
  "work",
  "user",
  "company",
  "project",
];

export const MEMORY_CATEGORY_LABEL_JA: Record<MemoryCategory, string> = {
  short_term: "短期",
  long_term: "長期",
  work: "業務",
  user: "ユーザー",
  company: "会社",
  project: "プロジェクト",
};

/** 1件の行動記録。第三者が後から検証できる形で残す(Company Genome: 記録文化)。 */
export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  /** 行動主体(AI社員ID "MUSA-101" / "user" / "system")。 */
  actor: string;
  /** 何をしたか(短い動詞句。例: "テストコール開始")。 */
  action: string;
  /** 詳細(自由記述。secretsを含めてはならない)。 */
  detail: string;
  timestampMs: number;
  tags: string[];
}

/** query() の絞り込み条件。指定しない項目は無視される。 */
export interface MemoryQuery {
  category?: MemoryCategory;
  actor?: string;
  /** この時刻(ms)以降のみ。 */
  sinceMs?: number;
  /** action/detail/tags への部分一致(小文字比較)。 */
  text?: string;
  /** 最大件数(新しい順)。 */
  limit?: number;
}
