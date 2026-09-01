import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/* The layer boundary from the ADR, as a linter rule.
 *
 *   domain          domain only. No React, no fetch, no Math.random, no Date.now.
 *   content         domain (types only)
 *   application     domain, content
 *   infrastructure  domain, application
 *   ui              domain, application, content. Never infrastructure directly.
 *
 * Every layer is named twice in a pattern — once as an alias (`@ui/...`) and once
 * as a path segment (`../ui/...`) — so neither spelling sneaks past.
 */
const LAYERS = ["domain", "content", "application", "infrastructure", "ui"];

function forbidLayers(path, allowed, extraPackages = []) {
  const layer = path.split("/")[0];
  const banned = LAYERS.filter((l) => l !== layer && !allowed.includes(l));
  const patterns = banned.flatMap((l) => [`@${l}/*`, `**/${l}/*`, `**/${l}`]);
  return {
    files: path.includes("*") ? [`src/${path}.{ts,tsx}`] : [`src/${path}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: patterns,
              message: `${layer} may import only: ${[layer, ...allowed].join(", ")}.`,
            },
          ],
          paths: extraPackages.map((name) => ({
            name,
            message: `${layer} may not import ${name}.`,
          })),
        },
      ],
    },
  };
}

export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/content/cards.generated.ts"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  forbidLayers("domain", [], ["react", "react-dom", "zustand"]),
  // A rules test may read the real card list — testing a rule against the cards
  // the game actually prints is the point of it. The direction that matters is
  // still shut: no test in domain knows about the store, an adapter, or React.
  forbidLayers("domain/**/*.test", ["content"], ["react", "react-dom", "zustand"]),
  forbidLayers("content", ["domain"]),
  forbidLayers("application", ["domain", "content"]),
  forbidLayers("infrastructure", ["domain", "application"]),
  forbidLayers("ui", ["domain", "content", "application"]),

  {
    // The domain is pure: no clock, no ambient randomness, no network. The seed
    // lives in GameState and every shuffle returns the advanced seed.
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "The domain's randomness is the seed in GameState." },
        { object: "Date", property: "now", message: "The domain has no clock." },
        { object: "crypto", property: "getRandomValues", message: "The domain's randomness is the seed in GameState." },
      ],
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "The domain does no IO." },
        { name: "localStorage", message: "The domain does no IO." },
        { name: "window", message: "The domain knows nothing about a browser." },
        { name: "document", message: "The domain knows nothing about a browser." },
      ],
    },
  },
);
