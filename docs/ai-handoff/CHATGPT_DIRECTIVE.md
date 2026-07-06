# ChatGPT Directive

## Directive ID
D-20260706-002

## Title
アバターは後続フェーズに回し、まず操作可能なβ版を出力する

## 決定
MUSAアバターの本格実装・VRoid/VRM連携は後続フェーズに回します。

現時点では、ユーザーが実際に操作できるβ版を最優先で出力してください。

アプリ内のアバター表示は、いったん現行のムササビアイコンまたは2Dプレースホルダーで構いません。

## 目的
まずWindows上でMusasabi OSを起動し、主要画面を触れる状態にすることを優先します。

完成度よりも、以下を確認できることを重視します。

- 起動できる
- 画面遷移できる
- Learning / Test / AutoCall のモードが見える
- Test Modeを操作できる
- Settingsを開ける
- AI社員管理を見られる
- Mock構成で安全に操作できる

## 実装指示

1. β版評価ビルドを最優先にする。
2. Tauri Desktopで起動可能な状態を整える。
3. アバターは本格実装せず、現行アイコンまたは2Dプレースホルダーで表示する。
4. VRoid Studio / VRM / three.js実レンダラーはPending Issue扱いにする。
5. ダッシュボード、Learning Mode、Test Mode、AutoCall Mode、AI社員管理、Settingsを操作できる状態に統合する。
6. AutoCall本番実行は無効のまま維持する。
7. FileMaker / Zoom Phone / VOICEVOX / whisper.cpp はMockまたは準備中表示にする。
8. 実API接続、実認証情報保存、実架電は行わない。
9. β版の起動手順READMEを作成または更新する。
10. Windows実機確認チェックリストを作成または更新する。
11. 可能であれば `npm run dev:desktop` または該当コマンドで起動できる導線を整備する。
12. 可能であれば手動実行のbeta-build workflowを整備する。
13. テストを実行し、結果を日本語で `docs/ai-handoff/CLAUDE_RESPONSE.md` に記録する。

## β版に含める画面

1. Dashboard
2. Learning Mode
3. Test Mode
4. AutoCall Mode（準備中・本番実行不可）
5. AI Employee管理
6. Sales Brain / 学習データ
7. Settings

## 安全ルール

Claude Codeは以下を行わないこと。

- 実電話番号への発信
- AutoCall本番実行の有効化
- FileMaker本番DBへの書き込み
- Zoom Phone本番APIへの接続
- 実認証情報の保存
- secretsの表示
- force push

## 優先順位

1. β版評価ビルド出力準備
2. Tauri Desktop起動導線
3. 主要画面統合
4. Test Mode操作導線
5. README / Windows確認手順
6. MUSA Avatar本格実装は後続フェーズ

## 完了条件

このDirectiveは以下を満たしたら完了です。

- β版として起動・操作する手順が明確になっている。
- 主要画面へ遷移できる。
- アバターは仮表示でよい。
- 実API・実架電は無効のまま。
- テストが通る。
- `CLAUDE_RESPONSE.md` が日本語で更新されている。
- 完了後はNext Directive待ちとして停止する。

## 次のアクション

最新のmainをpullし、このDirectiveを最優先として、操作可能なβ版評価ビルドの出力準備を進めてください。
