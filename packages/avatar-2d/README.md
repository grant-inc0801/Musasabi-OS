# @musasabi/avatar-2d

MUSA 常駐アバターの状態機械。`AvatarStateMachine` が
idle / working / preparing_call / follow_up / goal_achieved の5状態を管理し、
状態変化をリスナー(`apps/desktop` のIPC送信)に通知する。

透過・最前面のオーバーレイウィンドウ自体は `apps/desktop/src/main.ts` に実装されている
(現段階ではプレースホルダーの絵文字表示。実アセットはAIクリエイティブ本部が用意する —
Organization Bible 第3.5章)。

## テスト

`npm run test` で `node --test` によるユニットテストを実行する
(初期状態、遷移、不正状態の拒否、リスナーの購読解除を検証)。

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) Phase 2、
[docs/AI_EMPLOYEE_BIBLE.md](../../docs/AI_EMPLOYEE_BIBLE.md) 第8章を参照。
