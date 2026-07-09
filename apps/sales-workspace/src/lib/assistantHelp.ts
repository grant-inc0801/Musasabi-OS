// Musasabi アシスタント(チャットボット)の決定論的応答ロジック。
// 部署プルダウンを廃止し、単一のアシスタントが「操作方法・何がどこにあるか・提案」を案内する。
// 実AI API・外部送信なし。キーワード一致でローカル生成する Mock 応答。

export interface HelpTopic {
  /** 一致キーワード(いずれか含めば該当)。 */
  keywords: readonly string[];
  /** 案内文(場所・操作方法)。 */
  answer: string;
}

/** 「何がどこにあるか/操作方法」のナレッジ(サイドバーの実構成に対応)。 */
export const HELP_TOPICS: readonly HelpTopic[] = [
  { keywords: ["全社ダッシュボード", "ダッシュボード", "全社", "kpi", "KPI"], answer: "全社ダッシュボードはコマンドセンター左の『📊 全社ダッシュボード』(稼働率の下)から開けます。管理画面では Dashboard グループ →『全社ダッシュボード』です。" },
  { keywords: ["設定", "せってい", "settings"], answer: "設定はコマンドセンター左下の『⚙ 設定』から開きます。管理画面では Settings グループにアバター/従業員/データ管理などがまとまっています。" },
  { keywords: ["部署", "ステータス", "稼働", "シリンダー"], answer: "各部署の稼働状況は中央の円柱シリンダー(進捗メーター)で確認できます。シリンダーをクリックすると右側に詳細パネルが開きます。" },
  { keywords: ["営業", "架電", "コール", "リード"], answer: "営業関連は管理画面 Departments →『営業KPI』、架電リストは『架電リスト』、営業リストは『営業リスト管理』にあります。" },
  { keywords: ["ブレイン", "ナレッジ", "brain", "記憶", "メモリ"], answer: "Company Brain は Knowledge グループにあり、期間フィルタと JSON エクスポートに対応しています。" },
  { keywords: ["レポート", "報告", "出力", "エクスポート", "excel", "Excel"], answer: "レポートは Dashboard グループ →『レポート』。各管理部門(経理/人事/マーケ)は各部署ページから Excel 出力できます。" },
  { keywords: ["承認", "approval", "ワークフロー"], answer: "承認・運用は Workflow グループ(オペレーション/運用モニタリング)に集約しています。承認待ちは各部署の詳細と全社ダッシュボードで確認できます。" },
  { keywords: ["保管", "vault", "容量", "ファイル"], answer: "保管庫(Knowledge Vault)は部署一覧の『保管庫』カードから開けます。保管件数・使用容量・容量ステータスを確認できます。" },
  { keywords: ["連携", "統合", "filemaker", "zoom", "integration"], answer: "外部連携の準備画面は Integrations グループにあります(βはMock・実接続なし)。" },
  { keywords: ["バックアップ", "復元", "データ管理"], answer: "全ローカルデータのバックアップ/復元は Settings →『データ管理』から行えます。" },
];

/** 提案(空欄/挨拶時に提示するクイックガイド)。 */
export const HELP_SUGGESTIONS: readonly string[] = [
  "全社ダッシュボードはどこ?",
  "部署の稼働状況を見たい",
  "レポートを出力したい",
  "データのバックアップ方法は?",
];

const GREETING = /(こんにち|おはよう|こんばん|はじめ|hello|hi|ヘルプ|help|使い方|操作)/i;

/**
 * アシスタントの応答を決定論的に生成する。
 * 1) キーワード一致トピックがあれば案内。2) 挨拶/ヘルプ要求なら概要。3) それ以外は汎用ガイド。
 */
export function buildAssistantReply(message: string): string {
  const text = message.trim();
  if (text === "") return "ご用件をどうぞ。『◯◯はどこ?』『◯◯のやり方は?』のように聞いてください。";

  const hit = HELP_TOPICS.find((t) => t.keywords.some((k) => text.includes(k)));
  if (hit) return hit.answer;

  if (GREETING.test(text)) {
    return "Musasabi OS のアシスタントです。操作方法や『何がどこにあるか』を案内します。例: " + HELP_SUGGESTIONS.slice(0, 2).join(" / ");
  }

  return `「${text}」について承知しました。該当機能はサイドバーの各グループ(Dashboard / Departments / AI Assistant / Workflow / Knowledge / Integrations / Settings)から辿れます。具体的な名称で聞いていただければ場所をご案内します。`;
}
