# ChatGPT Directive

## Directive ID
D-20260706-001

## Title
AutoCall基盤実装後の次フェーズ（AI Company System・β統合）

## 決定
AutoCall三段階設計の実装を継続しつつ、並行してAI Company Systemを正式実装してください。β版で各機能が一つのアプリとして動作する統合を優先します。

## 実装指示
1. packages/ai-company を完成させる。
2. AI社員モデル（部署・部門・役職・権限・KPI・状態）を実装する。
3. Company GenomeとOrganization Bibleをシステムへ反映する。
4. Learning/Test/AutoCall をAI社員モデルへ統合する。
5. Settings画面からAI社員・音声・モード設定を管理できるようにする。
6. β版で各画面が相互遷移できる状態まで統合する。
7. 実API接続は行わず、Mockのまま維持する。
8. テスト追加・更新後、CLAUDE_RESPONSE.mdを日本語で更新する。

## 継続ルール
- 同一Directive内の未完了タスクは自律的に継続する。
- 完了後は新機能を推測して開始せず、CLAUDE_RESPONSE更新→Next Directive待ちIssue作成→STATUSをwaiting_for_chatgptへ更新して待機する。

## 優先順位
1. AutoCall(Test Mode)
2. AI Company System
3. β版統合
4. MUSA Avatar System
5. Plugin System

## 完了条件
- AI Company Systemが統合される。
- β版で主要画面を操作できる。
- Mock構成を維持。
- テスト成功。
- 日本語ドキュメント更新。
