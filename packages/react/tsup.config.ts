import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  /*
   * tsup strips the `"use client"` directive from the source files, so it has to
   * be re-injected here. Without it, importing this package from a Next.js
   * Server Component fails with "useEffect only works in a Client Component".
   */
  banner: { js: '"use client";' },
});
