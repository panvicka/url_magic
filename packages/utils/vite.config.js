import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "@cm-url-magic/utility",
      // the proper extensions will be added
      fileName: "utility",
      formats: ["es", "cjs"],
    },
  },
  plugins: [dts()],
});
