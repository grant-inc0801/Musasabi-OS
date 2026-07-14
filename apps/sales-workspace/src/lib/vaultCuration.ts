// 保管庫のAI司書(本番・完全ローカル・決定論)。
// 保管庫が成果物で肥大化しないよう、整理候補(同名の旧版・古いAI成果物)を提案する。
// 実行(要約して削除)は必ず人間の承認(候補ごとのボタン)後のみ。削除の代わりに
// 冒頭要約を「要約: <タイトル>」として残すため、RAG から完全には消えない。

import {
  addVaultDocument,
  loadVaultDocs,
  removeVaultDocument,
  type VaultDocument,
} from "./vaultStorage";
import { recordMemory } from "./memoryStorage";
import { pushAppEvent } from "./appEvents";

export interface CurationCandidate {
  doc: VaultDocument;
  reason: string;
}

/** AI成果物をこの日数より長く保管していたら整理候補にする。 */
const AGENT_DOC_MAX_AGE_DAYS = 30;
/** 要約として残す冒頭文字数。 */
const SUMMARY_CHARS = 300;

/**
 * 整理候補を決定論で提案する(提案のみ・データは変更しない)。
 * 1) 同名・同出所の旧版(最新1件を残す) 2) 30日より古いAI成果物。
 */
export function proposeVaultCuration(nowMs = Date.now()): CurationCandidate[] {
  const docs = loadVaultDocs();
  const candidates = new Map<string, CurationCandidate>();

  // 1) 同名・同出所の重複: 最新以外を候補に
  const byKey = new Map<string, VaultDocument[]>();
  for (const d of docs) {
    const key = `${d.source}:${d.title}`;
    byKey.set(key, [...(byKey.get(key) ?? []), d]);
  }
  for (const group of byKey.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => b.createdAtMs - a.createdAtMs);
    for (const old of sorted.slice(1)) {
      candidates.set(old.id, { doc: old, reason: "同名の新しい版があります(旧版)" });
    }
  }

  // 2) 古いAI成果物(要約済みは除外)
  const threshold = nowMs - AGENT_DOC_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  for (const d of docs) {
    if (candidates.has(d.id)) continue;
    if (d.source !== "agent") continue;
    if (d.tags.includes("summary")) continue;
    if (d.createdAtMs < threshold) {
      candidates.set(d.id, { doc: d, reason: `${AGENT_DOC_MAX_AGE_DAYS}日より古いAI成果物です` });
    }
  }

  return [...candidates.values()].sort((a, b) => a.doc.createdAtMs - b.doc.createdAtMs);
}

/**
 * 候補1件を「要約して削除」する(人間の承認ボタンから呼ぶ)。
 * 原本を削除してから冒頭要約を保存する(容量を増やさない)。
 * 本文が要約より短い場合は要約を残さず削除のみ。
 */
export function summarizeAndRemove(doc: VaultDocument): { summaryTitle: string | null } {
  removeVaultDocument(doc.id);
  let summaryTitle: string | null = null;
  if (doc.text.length > SUMMARY_CHARS + 100) {
    const summary = addVaultDocument({
      title: `要約: ${doc.title}`.slice(0, 80),
      text:
        `${doc.text.slice(0, SUMMARY_CHARS)}…\n` +
        `(AI司書による整理: ${new Date(doc.createdAtMs).toLocaleDateString("ja-JP")} 作成の原本 ` +
        `${Math.round(doc.text.length / 1000)}千文字を要約し、原本は承認のうえ削除済み)`,
      source: doc.source,
      tags: [...doc.tags.filter((t) => t !== "summary"), "summary"],
    });
    summaryTitle = summary.title;
  }
  recordMemory({
    category: "company",
    actor: "AI司書",
    action: "保管庫の整理を実行(承認済み)",
    detail: `「${doc.title}」を${summaryTitle ? "要約を残して" : ""}削除`,
    tags: ["vault", "curation"],
  });
  pushAppEvent({
    level: "info",
    title: "保管庫の整理を実行",
    detail: `「${doc.title}」${summaryTitle ? " → 要約を保存し原本を削除" : " を削除"}(承認済み)`,
  });
  return { summaryTitle };
}
