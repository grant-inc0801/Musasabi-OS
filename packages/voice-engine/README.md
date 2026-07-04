# @musasabi/voice-engine

TTS(MUSAの発話)/ STT(音声認識)のプラガブルなプロバイダ実装(Phase 7、
Epic β-001最終フェーズ)。

## TTS

- `TtsProvider` — `synthesize(text)` インターフェース。音声データ + リップシンク用
  visemeタイムライン(`packages/avatar-2d`/`avatar-3d`が消費する)を返す
- `MockTtsProvider` — 無音バッファ + 文字ベースの決定的viseme近似。テスト・オフライン開発用
- `VoicevoxTtsProvider` — VOICEVOX Engine(ローカルHTTP、既定 `http://localhost:50021`)の
  `audio_query`/`synthesis` を使用。実エンジン未起動のためこの開発環境では未検証。
  音素タイミング→viseme変換は `VoicevoxAudioQueryVisemes.ts` に純粋関数として切り出し、
  そちらは実エンジン無しでテスト済み

## STT

- `SttProvider` — `startStreaming(onTranscript)` インターフェース、`SttSession.pushAudio`/`stop`
- `MockSttProvider` — 決定的な擬似ストリーミング。テスト用
- `WhisperCppHttpSttProvider` — whisper.cppのHTTP `/inference`(バッチAPI)を使用。
  真のストリーミング(逐次interim結果)ではなく、`stop()`時に蓄積音声をまとめて送信し
  最終結果のみを返す設計。実エンジン未起動のため未検証

## テスト

`npm run test` で `node --test` によるユニットテストを実行する
(文字→viseme対応表、Mock TTS/STTの決定的な出力、VOICEVOX音素タイミング→viseme変換)。

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) Phase 7 を参照。
