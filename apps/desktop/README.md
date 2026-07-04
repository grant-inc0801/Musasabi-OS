# @musasabi/desktop

Electron 製 Windows デスクトップシェル(Phase 1、docs/ARCHITECTURE.md 参照)。

## 実装済み

- `src/main.ts` — Electron main process。メインウィンドウ、トレイ常駐(開く/終了)、
  Xボタンでは終了せずトレイに常駐、`app.setLoginItemSettings` によるログイン時自動起動
- `src/preload.ts` — contextIsolation 有効、`window.musasabi.getAppVersion()` のみ公開
- `package.json` の `build` フィールド — `electron-builder` による Windows NSIS
  インストーラ設定(`appId`, `productName`, `win.target: nsis`)
- `assets/icon.png` — 仮アイコン(16x16 placeholder。本番用アセットは
  AIクリエイティブ本部が別途用意する — Organization Bible 第3.5章)

## 検証状況

- `npm run build`(`tsc`)でのコンパイルは **成功済み**(型エラーなし)
- 実際にElectronアプリを起動してのウィンドウ・トレイ表示確認、および
  `electron-builder` によるWindowsインストーラのビルドは **未検証**。
  この開発コンテナはネットワーク egress ポリシー上 `github.com` からの
  Electronバイナリダウンロードが許可されておらず(`registry.npmjs.org` 等の
  パッケージメタデータ取得のみ許可)、Electron本体を取得できないため。
  Windows環境またはgithub.comへのダウンロードが許可されたCI環境での実機確認が必要。

## 次にやること

- Sales Workspace(`apps/sales-workspace`)をメインウィンドウに読み込む
- `packages/avatar-2d` のオーバーレイウィンドウを追加する(Phase 2)
- Windows実機/CIでの起動確認とインストーラビルド検証
