/* The one place the engine states which rulebook it implements.
 *
 * design/rulebook-0.2-draft.md is the authority for this build (see its own
 * header: "Rules version: 0.2.0 (draft)"). Issue #83's generic drift check
 * against that header has not landed yet — this constant is just the engine's
 * own declaration, read by nothing but itself and whatever `make check`
 * grows into once #83 lands.
 */
export const RULES_VERSION = "0.2.0-draft";
