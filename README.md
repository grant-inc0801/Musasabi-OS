# Musasabi OS

Musasabi OS は、営業部門向けの AI 常駐エージェント「MUSA」を中核とした
Windows デスクトップアプリケーションです。現在の最優先目標は **Epic β-001「営業部運用版完成」** です。

## 現在のステータス: Phase 0(基盤整備中)

このリポジトリは、Issue open をトリガーに `main_app.py` / `spec.md` を
AI が上書き生成し続ける自動ループ(`.github/workflows/ai-pipeline.yml`)により、
長期間「完了済み」を名乗るコミットが積まれていましたが、実際には
コードが一切蓄積されていませんでした。詳しい経緯と再出発の計画は
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照してください。

このワークフローは無効化済みで、ここからモノレポ構成で実装をゼロから積み上げています。

## Epic β-001 優先タスク

1. Windows デスクトップアプリ化 (`apps/desktop`)
2. MUSA 常駐アバター (`packages/avatar-2d`)
3. Voice Analysis (`packages/voice-analysis`)
4. Voice Engine (`packages/voice-engine`)
5. 3D アバター (`packages/avatar-3d`)
6. Sales Workspace β 版仕上げ (`apps/sales-workspace`)

## リポジトリ構成

```
apps/
  desktop/            Electron シェル(Windows インストーラ、トレイ常駐)
  sales-workspace/    Sales Workspace β 版 UI (React + Vite)
packages/
  avatar-2d/          MUSA 常駐アバター(2D オーバーレイ、状態機械)
  avatar-3d/          3D アバター(three.js + VRM、リップシンク)
  voice-engine/       TTS / STT(発話合成・音声認識)
  voice-analysis/     通話音声解析(感情分析・キーワード抽出)
  ai-sales-core/      AI Sales Employee ロジック
  shared/             IPC プロトコル・型定義・共通ユーティリティ
docs/
  ARCHITECTURE.md     フェーズ別の実装計画
```

## セットアップ

各パッケージはスケルトン段階です。依存関係のインストールはまだ実行していません。

```
npm install
npm run build
```
