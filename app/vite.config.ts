import { execFileSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** The kit revision, `R29.C43-v1`, baked in at build time: v is counted from git, which the page cannot see. Empty outside a checkout. */
function kitRevision(): string {
  try {
    const script = fileURLToPath(new URL("../tools/kit-revision.sh", import.meta.url));
    return execFileSync("sh", [script], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/** Path aliases are readability only; ESLint is what guards the layer boundary. */
const alias = {
  "@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
  "@content": fileURLToPath(new URL("./src/content", import.meta.url)),
  "@application": fileURLToPath(new URL("./src/application", import.meta.url)),
  "@infrastructure": fileURLToPath(new URL("./src/infrastructure", import.meta.url)),
  "@ui": fileURLToPath(new URL("./src/ui", import.meta.url)),
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  define: { "import.meta.env.VITE_KIT_REVISION": JSON.stringify(kitRevision()) },
});
