import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
});
