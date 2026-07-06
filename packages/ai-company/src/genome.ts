// Company Genome(docs/COMPANY_GENOME.md)をシステムへ反映する(D-20260706-001)。
// Genome は全設計・組織・行動原則の最上位ドキュメント。ここではその中核値を
// 定数としてデータ化し、UI表示・AI社員の行動原則参照に使えるようにする。

/** Company Genome 第3章 Values の識別子。 */
export type CompanyValue =
  | "customer_first"
  | "safety_first"
  | "integrity"
  | "continuous_improvement"
  | "transparency"
  | "collaboration";

export const COMPANY_VALUES: readonly CompanyValue[] = [
  "customer_first",
  "safety_first",
  "integrity",
  "continuous_improvement",
  "transparency",
  "collaboration",
];

export const COMPANY_VALUE_LABEL_JA: Record<CompanyValue, string> = {
  customer_first: "顧客第一",
  safety_first: "安全第一",
  integrity: "誠実",
  continuous_improvement: "継続改善",
  transparency: "透明性",
  collaboration: "協働",
};

/** Company Genome の中核データ(第1〜5章)。 */
export const COMPANY_GENOME = {
  version: "1.0",
  mission:
    "AIが人の代わりに仕事を理解し、自律的に実行するWindows AI社員プラットフォームを構築する。",
  vision:
    "Windows上で常駐し、社員一人につき一人のAI社員を実現する。1社から10社、100社、そしてSaaSへ拡張する。",
  values: COMPANY_VALUES,
  /** 第5章 Decision Principles(意思決定原則)。 */
  decisionPrinciples: [
    "データと根拠に基づかない独断は行わない",
    "可逆的な選択肢がある場合は可逆性の高い方を優先する",
    "設計ドキュメントと矛盾する実装は行わず、矛盾する場合は設計変更案を先に提示する",
    "承認フローを経ずに、権限を超える行動を実行しない",
    "迷った場合は、実行してから謝るのではなく、先に確認する",
  ],
} as const;
