import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GradientTransition",
      fileName: "gradient-transition",
      formats: ["es", "cjs", "umd"],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
    cssInjectedByJsPlugin(),
  ],
});
