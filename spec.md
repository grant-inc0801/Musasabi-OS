```markdown
# 技術指示書: S9-001 Emotion Engine & Adaptive Personality

## はじめに

本指示書は、Musasabi AIにおける「Emotion Engine & Adaptive Personality」を実装するための技術的な指示を提供します。このドキュメントに従って開発、テスト、ドキュメント作成を行ってください。

## Sprint 概要

### 目標

- Emotion EngineとAdaptive Personality Systemの構築

### 感情が影響を与える領域

- アバターの表情
- コーチングスタイル
- 通知
- デスクトップの動作
- AI従業員間の相互作用

## Sprint タスク

### S9-001 Emotion Engine Foundation

- 感情状態管理システムの実装
- サポートされる感情: Neutral, Happy, Focused, Thinking, Curious, Encouraging, Concerned, Celebrating

### S9-002 Adaptive Personality

- 性格プロファイルのサポート
- 性格の変化が通知の言い回し、コーチングの言い回し、ダッシュボードのコメント、アバターの振る舞いに影響

### S9-003 Context Awareness

- 感情の変化は以下に応じて: スプリント進捗、営業KPI、アポイント取得、ユーザーの作業負荷、学習モード、サポートモード、分析モード

### S9-004 Avatar Emotion Sync

- Emotion Engineとアバターの表情、アニメーション、スピーチバブルの同期

### S9-005 Memory Influence

- 最近の歴史が感情に影響を与える: 多数のアポイント→Celebrating, 繰り返す失敗→Encouraging, 長期間のアイドル→Gentle reminder

### S9-006 Coaching Style

- コーチがスタイルを適応: 新しいセールスパーソン→Encouraging, 経験豊富なセールスパーソン→Analytical, マネージャー→Executive summary

### S9-007 Emotion Dashboard

- 表示: 現在の感情、理由、自信レベル、性格、最近のイベント

### S9-008 Emotion API

- 内部API作成: setEmotion(), getEmotion(), calculateEmotion(), applyContext(), resetEmotion()

## データベーススキーマ (SQLite)

- **emotion_states**: id, employee_id, emotion, confidence, reason, created_at
- **personality_profiles**: id, employee_id, profile, intensity, updated_at
- **emotion_history**: id, employee_id, previous_emotion, new_emotion, trigger, created_at

## 互換性とサポート

- Supported: Live2D, VRM, Voice, AI Employees, AI Organization, AutoCall

## テスト

- 実装するテスト: 感情の遷移、性格の切り替え、文脈の認識、アバターの同期、コーチングの適応、ダッシュボードの更新

## ドキュメントの更新

- 更新対象: README.md, CHANGELOG.md, docs/EMOTION_ENGINE.md

## 制限事項

-実装しない: 音声合成, 心理的診断, 定義されたルール外の自律的な感情決定
- 感情の変化は決定論的かつ説明可能であること

## 受け入れ基準

- Sprint-009.yamlの存在確認
- Emotion Engineの動作
- 性格プロファイルの機能
- アバターが感情を反映
- コーチングスタイルが適応
- ダッシュボードが感情状態を表示
- テストが合格
- ドキュメントの更新

## デリバラブル

- 変更されたファイルの報告
- テスト結果の報告
- 推奨commitメッセージ

### 推奨コミットメッセージ

```
feat(ai): implement Emotion Engine and Adaptive Personality
```

本指示書に基づいて開発を進め、指示された基準を満たすようにしてください。```

以上、技術指示書を完成させました。適切な管理とレビューを怠らず、スプリントの目標を達成できるよう進めてください。