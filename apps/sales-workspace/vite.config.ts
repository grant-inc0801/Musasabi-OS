import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
