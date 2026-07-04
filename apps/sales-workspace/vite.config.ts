import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // apps/desktop(Tauri)はこのビルドの静的ファイルをfrontendDistとして配信する。
  // 絶対base("/", デフォルト)でも動作するが、相対baseはビルド成果物をこのディレクトリ
  // からどう配信しても(ローカルファイルとして直接開く場合も含め)解決可能にするため安全側。
  base: "./",
  build: {
    outDir: "dist",
    // メインウィンドウ(index.html)に加えて、MUSAアバターオーバーレイウィンドウ
    // (apps/desktop/src-tauri/src/lib.rs が生成する第2ウィンドウ)用にavatar.htmlも
    // 同じdist/へビルドするマルチページ構成(Tauri移行、docs/ARCHITECTURE.md 第4.2章)。
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        avatar: fileURLToPath(new URL("./avatar.html", import.meta.url)),
      },
    },
    commonjsOptions: {
      // npm workspaces symlinks local packages (e.g. @musasabi/ai-core) outside
      // node_modules on disk, so Rollup's default `include: [/node_modules/]`
      // never runs the CJS->ESM interop on their compiled dist/ output and
      // named imports silently fail ("X is not exported by Y"). Widen the
      // match to also cover workspace packages' dist output.
      include: [/node_modules/, /packages\/.*\/dist/],
    },
  },
});
