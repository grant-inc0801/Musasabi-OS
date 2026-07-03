```markdown
# 技術指示書: S7-002 Zoom Phone Real-Time Voice Pipeline

## 目的

Zoom Phoneのリアルタイム音声パイプラインを実装する。これはLearning Mode、Sales Coach、Voice Analysis、将来のAutoCall Modeが使用するライブ音声イベントパイプラインを確立する。このパイプラインは、通話イベントをリアルタイムで受信し、Musasabi OSモジュールに配信する。AIによる会話、オートコール、自律通話は行わない。本スプリントは観察のみを目的とする。

## ビジョン

1. Zoom Phone
2. Call Events
3. Voice Pipeline
4. Learning Mode
5. Voice Analysis
6. Sales Coach
7. Memory Engine
8. Company Brain

## 必要モジュール

`packages/zoom-phone/src/` 以下に次のモジュールを実装する。

- `ZoomPhoneConnector.ts`
- `VoicePipeline.ts`
- `CallSessionManager.ts`
- `EventRouter.ts`
- `TranscriptCollector.ts`
- `AudioMetadataCollector.ts`
- `VoicePipelineRepository.ts`

## 対応イベント

- Incoming Call
- Outgoing Call
- Call Started
- Call Connected
- Call Ended
- Recording Started
- Recording Finished
- Transcript Ready
- Participant Joined
- Participant Left
- Mute
- Hold
- Resume

## コールセッション

### テーブル: `call_sessions`

フィールド:
- id
- session_id
- lead_id
- operator
- direction
- started_at
- connected_at
- ended_at
- duration
- status

ステータス:
- ringing
- connected
- on_hold
- completed
- failed

## イベントキュー

### テーブル: `voice_events`

フィールド:
- id
- session_id
- event_type
- payload_json
- created_at

## トランスクリプトパイプライン

- トランスクリプトのプレースホルダをサポート
- トランスクリプトステータスをサポート
- トランスクリプト受信イベントのサポート
- トランスクリプト更新イベントのサポート

音声認識は行わない。利用可能であればトランスクリプトを受け取る。

## 音声メタデータ

メタデータを収集および保存:
- duration
- silence time
- speaking ratio
- interruptions
- recording availability

## 統合

以下のモジュールにイベントを公開:
- Learning Mode
- Sales Brain
- Memory Engine
- Voice Analysis
- Executive Dashboard
- Avatar

## ダッシュボード

ライブコールモニターを作成し、以下を表示:
- Active Calls
- Call Status
- Duration
- Transcript Status
- Voice Analysis Status
- Learning Status

## アバター統合

- Call Started → Headset appears + Listening animation
- Call Ended → Thinking animation
- Transcript Ready → Notebook animation
- Learning Complete → Happy animation

## テスト

次を実装:
- Event routing
- Session lifecycle
- Transcript events
- Metadata collection
- Dashboard updates
- Avatar synchronization

## ドキュメント

作成:
- `docs/ZOOM_PHONE_PIPELINE.md`

更新:
- `README.md`
- `CHANGELOG.md`

## 制限事項

次の機能は実装しない:
- AutoCall
- Speech Recognition
- Voice Generation
- Customer Conversation
- Call Recording Download
- Telephone Control

## 受け入れ基準

- Voice pipelineがイベントを受信できる
- Call sessionsが追跡される
- Event routingが動作する
- Metadataが保存される
- Dashboardがリアルタイムで更新される
- Avatarが正しく反応する
- テストが通過する
- ドキュメントが更新される

## 成果物

- 変更されたファイルのレポート
- テスト結果
- Live Call Monitorのスクリーンショット
- 推奨コミット

### 推奨コミット

```
feat(zoom): implement real-time voice pipeline
```
```

この技術指示書は、プロジェクトの成功のために必要な情報をカバーしています。すべてのイベントが正しくルーティングされ、関連するメタデータが取得および保存されていることを確認してください。手順ごとにドキュメントを更新し、提出する際にはすべての成果物が揃っていることを確認してください。