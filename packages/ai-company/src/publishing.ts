// 出版部門の作品パイプライン・敏腕編集長AI(Directive D-20260708-001 §6/§7)。
// Claude Code等で作成したライトノベル・書籍・note記事などを半自動で商品化する
// 出版部門を表現する。β版はすべて Mock(決定論)。外部出版サービスへの実ログイン・
// 実投稿・実販売設定は行わない。

/** 作品の制作フェーズ(企画 → 執筆 → 校正 → 類似性チェック → Kindle準備 → note準備 → 販売中)。 */
export type PublishingStage =
  | "planning"
  | "writing"
  | "proofreading"
  | "similarity_check"
  | "kindle_prep"
  | "note_prep"
  | "published";

export const PUBLISHING_STAGES: readonly PublishingStage[] = [
  "planning",
  "writing",
  "proofreading",
  "similarity_check",
  "kindle_prep",
  "note_prep",
  "published",
];

export const PUBLISHING_STAGE_LABEL_JA: Record<PublishingStage, string> = {
  planning: "企画中",
  writing: "執筆中",
  proofreading: "校正待ち",
  similarity_check: "類似性チェック待ち",
  kindle_prep: "Kindle準備中",
  note_prep: "note販売準備中",
  published: "販売中",
};

/** 作品の販売想定チャネル。 */
export type PublishingChannel = "kindle" | "note" | "both";

export const PUBLISHING_CHANNEL_LABEL_JA: Record<PublishingChannel, string> = {
  kindle: "Kindle",
  note: "note",
  both: "Kindle / note",
};

/** 出版部門が管理する1作品(Mock)。 */
export interface PublishingWork {
  id: string;
  title: string;
  genre: string;
  stage: PublishingStage;
  channel: PublishingChannel;
  /** 全体進捗(0-100)。 */
  progressPercent: number;
  /** 担当AI社員名。 */
  owner: string;
}

/** 出版部門の作品Mockマスタ。実在の作品ではない。各ステージを網羅的に持つ。 */
export const PUBLISHING_WORKS: readonly PublishingWork[] = [
  {
    id: "work-yozora-3",
    title: "ムササビは夜に翔ぶ(第3巻)",
    genre: "ライトノベル",
    stage: "planning",
    channel: "both",
    progressPercent: 15,
    owner: "AI企画担当",
  },
  {
    id: "work-eigyo-ai",
    title: "営業AIの教科書",
    genre: "実用書",
    stage: "writing",
    channel: "kindle",
    progressPercent: 42,
    owner: "AIライター",
  },
  {
    id: "work-mukashi",
    title: "むかしむかしAIがいた",
    genre: "童話・絵本",
    stage: "proofreading",
    channel: "note",
    progressPercent: 68,
    owner: "AI校正担当",
  },
  {
    id: "work-yozora-2",
    title: "ムササビは夜に翔ぶ(第2巻)",
    genre: "ライトノベル",
    stage: "similarity_check",
    channel: "both",
    progressPercent: 74,
    owner: "AI類似性チェッカー",
  },
  {
    id: "work-kanjo-ai",
    title: "感情を持ったAIの一日",
    genre: "SF短編",
    stage: "kindle_prep",
    channel: "kindle",
    progressPercent: 88,
    owner: "AI販売戦略担当",
  },
  {
    id: "work-note-diary",
    title: "AI社員の開発日記(note連載)",
    genre: "エッセイ",
    stage: "note_prep",
    channel: "note",
    progressPercent: 92,
    owner: "AI販売戦略担当",
  },
];

/** ステージ別の作品件数を集計する(決定的)。 */
export function countWorksByStage(
  works: readonly PublishingWork[] = PUBLISHING_WORKS,
): Record<PublishingStage, number> {
  const counts = {} as Record<PublishingStage, number>;
  for (const stage of PUBLISHING_STAGES) counts[stage] = 0;
  for (const w of works) counts[w.stage] += 1;
  return counts;
}

/** 指定ステージの作品だけを返す。 */
export function worksInStage(
  stage: PublishingStage,
  works: readonly PublishingWork[] = PUBLISHING_WORKS,
): PublishingWork[] {
  return works.filter((w) => w.stage === stage);
}

// ---- 敏腕編集長AI(Directive §7) ----

/** 敏腕編集長AIの指摘カテゴリ。 */
export type EditorNoteCategory =
  | "manuscript"
  | "structure"
  | "character"
  | "similarity"
  | "target"
  | "sales";

export const EDITOR_NOTE_CATEGORY_LABEL_JA: Record<EditorNoteCategory, string> = {
  manuscript: "原稿改善",
  structure: "物語構成",
  character: "キャラ一貫性",
  similarity: "酷似回避",
  target: "読者ターゲット",
  sales: "販売導線",
};

/** 敏腕編集長AIからの1指摘(Mock)。 */
export interface EditorNote {
  id: string;
  workId: string;
  category: EditorNoteCategory;
  /** 指摘本文(「敏腕編集長AI：」の後に続く文)。 */
  message: string;
}

/** 敏腕編集長AIの指摘Mock。Directive の表示例に沿う。 */
export const EDITOR_NOTES: readonly EditorNote[] = [
  {
    id: "note-1",
    workId: "work-yozora-2",
    category: "manuscript",
    message:
      "第1章は導入として良好です。ただし主人公の目的が弱いため、冒頭3ページ以内に明確な動機を追加してください。",
  },
  {
    id: "note-2",
    workId: "work-yozora-2",
    category: "structure",
    message:
      "中盤の山場が第7章に集中しています。第4章に小さな転換点を置くと緩急がつき、読者の離脱を防げます。",
  },
  {
    id: "note-3",
    workId: "work-eigyo-ai",
    category: "character",
    message:
      "主人公の口調が第2章と第5章で揺れています。一人称と語尾を統一し、キャラ設定の一貫性を保ってください。",
  },
  {
    id: "note-4",
    workId: "work-yozora-2",
    category: "similarity",
    message:
      "既存の人気作と設定が近いモチーフがあります。舞台と能力の描写を差別化し、酷似リスクを下げてください。",
  },
  {
    id: "note-5",
    workId: "work-kanjo-ai",
    category: "target",
    message:
      "読者ターゲットを20〜30代のSF入門層に想定するなら、専門用語には短い補足を添えると読みやすくなります。",
  },
  {
    id: "note-6",
    workId: "work-note-diary",
    category: "sales",
    message:
      "note連載は無料3話+有料マガジンの導線が有効です。タイトルに「開発日記」を残しつつ、帯文で継続性を訴求しましょう。",
  },
];

/** 指定作品への編集長指摘を返す。 */
export function editorNotesForWork(
  workId: string,
  notes: readonly EditorNote[] = EDITOR_NOTES,
): EditorNote[] {
  return notes.filter((n) => n.workId === workId);
}

/** 敏腕編集長AIの担当タスク(役割一覧・Directive §7)。 */
export const EDITOR_IN_CHIEF_ROLES: readonly string[] = [
  "原稿の改善点を指摘",
  "物語構成を確認",
  "キャラクター設定の一貫性を確認",
  "既存作品と酷似しないための注意点を提示",
  "読者ターゲットに合わせた改善提案",
  "タイトル案 / 帯文 / 紹介文を作成",
  "Kindle / note向け販売導線を提案",
];

// ---- 出版部門サマリー ----

export interface PublishingSummary {
  totalWorks: number;
  countsByStage: Record<PublishingStage, number>;
  publishedCount: number;
  inProgressCount: number;
  editorNoteCount: number;
  /** 次の出版アクション(決定的)。 */
  nextActions: string[];
}

/** 出版部門サマリーを組み立てる(決定的)。 */
export function buildPublishingSummary(
  works: readonly PublishingWork[] = PUBLISHING_WORKS,
  notes: readonly EditorNote[] = EDITOR_NOTES,
): PublishingSummary {
  const countsByStage = countWorksByStage(works);
  const publishedCount = countsByStage.published;
  const inProgressCount = works.length - publishedCount;
  const nextActions: string[] = [];
  if (countsByStage.proofreading > 0) {
    nextActions.push(`校正待ち${countsByStage.proofreading}作品をAI校正担当が確認する`);
  }
  if (countsByStage.similarity_check > 0) {
    nextActions.push(
      `類似性チェック待ち${countsByStage.similarity_check}作品をAI類似性チェッカーが確認する`,
    );
  }
  if (countsByStage.kindle_prep > 0) {
    nextActions.push(`Kindle準備中${countsByStage.kindle_prep}作品の表紙・紹介文を仕上げる`);
  }
  if (countsByStage.note_prep > 0) {
    nextActions.push(`note販売準備中${countsByStage.note_prep}作品の連載導線を設定する`);
  }
  if (notes.length > 0) {
    nextActions.push(`敏腕編集長AIの指摘${notes.length}件を各担当が反映する`);
  }
  return {
    totalWorks: works.length,
    countsByStage,
    publishedCount,
    inProgressCount,
    editorNoteCount: notes.length,
    nextActions,
  };
}

/** アバター吹き出し用: 出版部門の要約行(Mock・決定的)。 */
export function buildPublishingSummaryJa(
  works: readonly PublishingWork[] = PUBLISHING_WORKS,
  notes: readonly EditorNote[] = EDITOR_NOTES,
): string[] {
  const summary = buildPublishingSummary(works, notes);
  const lines: string[] = [];
  const proof = summary.countsByStage.proofreading;
  const sim = summary.countsByStage.similarity_check;
  const parts: string[] = [];
  if (proof > 0) parts.push(`校正待ち${proof}作品`);
  if (sim > 0) parts.push(`類似性チェック待ち${sim}作品`);
  if (parts.length > 0) {
    lines.push(`出版部門では${parts.join("・")}があります。`);
  }
  if (summary.editorNoteCount > 0) {
    lines.push(`敏腕編集長AIから${summary.editorNoteCount}件の改善指摘が出ています。`);
  }
  return lines;
}
