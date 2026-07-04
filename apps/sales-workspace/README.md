# @musasabi/sales-workspace

Sales Workspace β 版 UI(React + Vite)。KPIダッシュボード・日次計画・
MUSAからの推奨アクション・リード一覧を表示する(Phase 3)。

`@musasabi/ai-core`(決定的ロジック、LLM推論なし)のリード優先順位付け・日次計画生成・
KPI集計・推奨アクション生成を呼び出す。現在はFileMaker/Zoom Phone連携(Phase 4/5)が
未実装のため、`src/mockData.ts` の仮データを使用している。

## 開発

```
npm run dev    # Vite開発サーバー(この開発コンテナには表示環境がないため未検証)
npm run build  # 本番ビルド(vite build)。ai-coreのビルドを含む
```

`vite build` は検証済み。実際のブラウザ表示確認はこの環境では未実施。

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) Phase 3、
[docs/department-playbooks/sales.md](../../docs/department-playbooks/sales.md) を参照。
