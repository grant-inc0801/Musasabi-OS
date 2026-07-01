```markdown
# 技術指示書: S5-003 Voice Analysis Engine

## 目的

このプロジェクトでは、営業コールの学習のための音声解析エンジンの基礎を実装します。Musasabi AIは、コール音声のメタデータとトランスクリプトのタイミングを分析し、営業会話の質を示すシグナルを特定します。本イシューでは、分析の基礎のみを実装します。実際の音声処理がまだ利用できない場合、手動またはモックのメトリック入力をサポートします。

## ビジョン

1. Zoom Phone Call
2. Recording / Transcript
3. Voice Analysis Engine
4. Sales Intelligence
5. MUSA Sales Coach
6. Sales Brain

## 必要モジュール

`packages/voice-analysis/src/` ディレクトリに以下のモジュールを実装してください。
- `voiceAnalysisService.js`
- `voiceMetricRepository.js`
- `speechPatternAnalyzer.js`
- `silenceAnalyzer.js`
- `interruptionAnalyzer.js`
- `toneAnalyzer.js`
- `voiceScoreCalculator.js`
- `index.js`

## データベース: SQLite

### 以下のテーブルを作成します。
#### voice_analysis_records

- id
- call_log_id
- transcript_id
- lead_id
- talk_speed_score
- silence_score
- interruption_score
- tone_score
- listening_score
- clarity_score
- overall_score
- summary
- created_at
- updated_at

#### voice_metrics

- id
- analysis_id
- metric_name
- metric_value
- unit
- created_at

## メトリクス

以下のメトリクスをサポート
- 話す速度 (talk speed)
- 無音時間 (silence duration)
- 割り込み回数 (interruption count)
- お客様の話す割合 (customer talk ratio)
- オペレーターの話す割合 (operator talk ratio)
- トーンスコア (tone score)
- リスニングスコア (listening score)
- 明瞭度スコア (clarity score)

## 手動/モックモード

リアルな音声処理が利用できない場合は、手動またはモックのメトリクス入力を許可します。これにより、フル音声処理が可能になる前に営業チームの学習を開始できます。

## 解析ロジック

決定論的なスコアリングを使用します。例:
- オペレーターの話す割合が高すぎる場合：リスニングスコアを下げ、顧客への質問を増やすことを提案します。
- 無音時間が長い場合：質問の流れを強化することを提案します。
- インタラプション回数が多い場合：応答する前に待つことを提案します。
- トーンスコアが低い場合：明るいオープニングやより遅いペースでの話し方を提案します。

## UIの追加

以下のパネルにVoice Analysisを追加します。
- リード詳細
- トランスクリプト詳細
- セールスコーチパネル

表示内容:
- 話す速度
- 無音
- 割り込み
- トーン
- リスニング
- 明瞭性
- 総合スコア
- MUSAの改善アドバイス

## 統合

- トランスクリプトが保存されるとき：メトリクスが存在する場合、音声分析レコードを作成または更新します。
- コールが終了するとき：音声分析のプレースホルダーを準備します。
- 手動メトリクスが入力されるとき：スコアを計算し、Sales Brain学習記録を更新します。

## テスト

以下のテストを実装します。
- 音声分析レコードの作成
- 手動メトリクス入力
- 話す速度のスコアリング
- 無音のスコアリング
- 割り込みのスコアリング
- トーンのスコアリング
- 総合スコア計算
- MUSAアドバイスの生成

## ドキュメンテーション

更新:
- `README.md`
- `CHANGELOG.md`
- `docs/VOICE_ANALYSIS.md`

追加:
- メトリクス定義
- 手動メトリックスのワークフロー
- 将来の音声処理計画

## 制約事項

以下の実装は行いません。
- リアルタイム音声認識
- 録音ダウンロード
- 外部AIトランスクリプション
- AutoCall
- 音声生成
- 顧客へのコール

このイシューでは外部オーディオAPIを使用しません。

## 受入基準

- 音声解析モジュールが存在する
- 音声解析テーブルが存在する
- 手動/モックメトリクスが入力できる
- スコアが計算される
- MUSA改善アドバイスが表示される
- Sales Brainが音声解析の出力を使用できる
- テストが通過する
- ドキュメンテーションが更新される

## 成果物

レポート:
- 変更されたファイル
- テスト結果
- 提案されたコミット

自動プッシュしないでください。

提案されたコミット:
```
feat(sales): add voice analysis engine foundation
```
```