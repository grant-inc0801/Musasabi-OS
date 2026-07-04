import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // apps/desktop loads this build's index.html via Electron's loadFile() (file://
  // protocol). An absolute base ("/", the default) makes the built HTML reference
  // its assets as "/assets/..." which resolves from the filesystem root under
  // file:// and fails to load. A relative base keeps the references resolvable
  // relative to index.html's own directory regardless of how it's loaded.
  base: "./",
  build: {
    outDir: "dist",
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
