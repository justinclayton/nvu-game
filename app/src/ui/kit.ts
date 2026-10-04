/* The kit revision this build was made at, `R29.C43-v1` (design/loop/spec.md).
 *
 * `vite.config.ts` bakes it in from `tools/kit-revision.sh` at build time,
 * because the engine count, v, comes from git and a browser has no git.
 * Undefined in a build made outside a checkout.
 */

export const KIT_REVISION: string | undefined =
  typeof import.meta.env.VITE_KIT_REVISION === "string" && import.meta.env.VITE_KIT_REVISION !== ""
    ? import.meta.env.VITE_KIT_REVISION
    : undefined;
