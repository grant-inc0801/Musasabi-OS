# ChatGPT Directive

## Directive ID
D-20260706-003

## Title
Windows向けβ版リリースビルドを最優先で出力する

## 決定
現在の最優先は、Musasabi OSをユーザーが実際に起動・操作できるβ版として出力することです。

ソースコード上の機能追加よりも、Windowsで触れる評価版を作成することを優先してください。

## 目的
ユーザーが自分のWindows PCでMusasabi OS β版を起動し、主要画面を操作できる状態にします。

## 実装指示

1. Tauri Windows β版ビルドを最優先で整備する。
2. 可能であれば `.exe` または `.msi` を生成できる状態にする。
3. `npm run dev:desktop` で開発起動できる導線を確認・整備する。
4. `npm run build:desktop` または同等のビルドコマンドを整備する。
5. `cargo tauri build` またはTauri公式ビルド導線を確認する。
6. GitHub Actionsの手動実行 `beta-build` workflowを整備する。
7. ビルド成果物をGitHub Actions artifactとしてアップロードできるようにする。
8. 可能であればGitHub Releasesへβ版を公開できる準備を行う。
9. アプリアイコンは現行の白黒ムササビアイコンを仮採用する。
10. VRoid/VRM/three.js実アバターは後続フェーズに回す。
11. Windows実機確認チェックリストを更新する。
12. β版の起動・インストール手順READMEを作成または更新する。
13. 実機で確認できない項目は正直に未検証として記録する。
14. テスト結果とビルド結果を日本語で `docs/ai-handoff/CLAUDE_RESPONSE.md` に記録する。

## β版に含める最低画面

1. Dashboard
2. Learning Mode
3. Test Mode
4. AutoCall Mode（本番実行不可）
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

## 完了条件

このDirectiveは以下を満たしたら完了です。

- Windows向けβ版の起動手順が明確である。
- 可能な範囲で `.exe` / `.msi` またはGitHub Actions artifact出力導線がある。
- `npm run dev:desktop` 等の開発起動導線が確認されている。
- β版READMEが更新されている。
- Windows実機確認チェックリストが更新されている。
- アプリアイコンが仮採用されている、または組み込み手順が明確になっている。
- テストが通る。
- `CLAUDE_RESPONSE.md` が日本語で更新されている。
- 完了後はNext Directive待ちとして停止する。

## 次のアクション

最新のmainをpullし、このDirectiveを最優先として、Windows向けβ版リリースビルドの出力準備を進めてください。
