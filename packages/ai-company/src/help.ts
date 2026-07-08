// D-020 Onboarding & Help: アプリ内ヘルプ(機能ガイド・用語集・FAQ)を提供する。
// 静的な案内データ(決定的)。外部送信なし。

/** 機能ガイド1項目(何ができる画面か)。 */
export interface HelpTopic {
  title: string;
  page: string; // 遷移先ページID(App.tsx の Page)。用語集/FAQは空。
  description: string;
}

export const HELP_TOPICS: readonly HelpTopic[] = [
  {
    title: "ワークスペース",
    page: "workspace",
    description: "本日のダイジェスト(承認待ち・進行中・要対応)と各機能へのクイックアクション。",
  },
  {
    title: "オペレーション",
    page: "operations",
    description: "全社の承認待ちを一元管理する承認キューと稼働状況の総括。",
  },
  {
    title: "全社ダッシュボード",
    page: "company_dashboard",
    description: "9部署のKPIを一画面に集約。営業部は実データ(テストコール・営業リスト)を反映。",
  },
  {
    title: "ワークフロー",
    page: "workflow",
    description: "部署をまたぐ業務フロー(商品化・架電・出版・問い合わせ対応)の進捗を可視化。",
  },
  {
    title: "コラボレーション",
    page: "collaboration",
    description: "部署間の引き継ぎ・提案・承認依頼と、全社で共有・採用されるナレッジ。",
  },
  {
    title: "レポート",
    page: "reports",
    description: "全社レポートを生成し、Markdown/JSONで書き出せます。",
  },
  {
    title: "通知センター",
    page: "notifications",
    description: "承認待ち・エラー・容量注意などを一元表示。既読管理ができます。",
  },
  {
    title: "スケジューラ",
    page: "scheduler",
    description: "各部署の定例業務を頻度・次回予定つきで一覧化。自動化ルーチンも併記。",
  },
  {
    title: "AI自己進化",
    page: "self_evolution",
    description: "行動記録から自動化候補・頻出操作を分析し、長期ナレッジ化を提案。",
  },
  {
    title: "Company Brain",
    page: "company_brain",
    description: "アプリ内の行動記録(Memory)を分類・検索。期間フィルタとJSON書き出し。",
  },
];

/** 用語集1項目。 */
export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  { term: "コマンドセンター", definition: "部署パネル・連携ライン・指示チャットを備えた既定のホーム画面。" },
  { term: "Company Brain / Memory", definition: "AI社員と利用者の行動を6分類で記録するローカルの行動記録。" },
  { term: "保管庫(Knowledge Vault)", definition: "マニュアル・提案資料等を保管するストレージ。容量管理付き。" },
  { term: "ワークフロー", definition: "部署をまたぐ一連の業務を、担当・作業・状態で表したもの。" },
  { term: "承認キュー", definition: "部署・ワークフロー・コラボの承認待ちを一元化した待ち行列。" },
  { term: "AutoCall", definition: "自動架電モード。安全ゲートによりβ版では本番実行は無効。" },
  { term: "Automation", definition: "画面操作を手動記録して再実行できる自動化(手動オプトイン)。" },
];

/** はじめての方向けFAQ。 */
export interface HelpFaq {
  question: string;
  answer: string;
}

export const HELP_FAQ: readonly HelpFaq[] = [
  {
    question: "実際に電話をかけたり外部へ送信したりしますか?",
    answer: "いいえ。β版はすべてMock・ローカル処理で、実架電・実API接続・外部送信は行いません。",
  },
  {
    question: "データはどこに保存されますか?",
    answer: "この端末のローカル(localStorage)にのみ保存されます。設定 > データ管理でバックアップできます。",
  },
  {
    question: "ミニアバターはいつ表示されますか?",
    answer: "管理画面を最小化/閉じたときに右下へ表示されます。トレイやミニパネルから復帰できます。",
  },
];
