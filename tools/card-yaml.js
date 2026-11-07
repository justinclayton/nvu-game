/* Serialises one card back into the block shape cards.yaml uses, so the
 * editor page and the applier write identical YAML. Loaded by the page with a
 * <script> tag and by node through require(). */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.CardYaml = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ORDER_PLAYER = ["name", "count", "starter", "set", "kind", "owner", "rarity", "cost", "oomph", "scramble", "conditional_stat", "text", "flavor"];
  var ORDER_ROOM = ["name", "count", "set", "kind", "tier", "flavor", "text", "challenges", "flee"];

  /* The parser only strips the outer quotes; it has no escapes. A string with
     one kind of quote takes the other; one with both goes into a folded block. */
  function scalar(v) {
    if (v === null || v === undefined) return "null";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    /* The parser reads one line per value and folds whitespace, so a line
       break inside a field can only ever be a space. */
    var s = String(v).replace(/\s*\n\s*/g, " ").trim();
    if (/^[A-Za-z][A-Za-z_]*$/.test(s) && !/^(true|false|null)$/.test(s)) return s;
    if (s.indexOf('"') === -1) return '"' + s + '"';
    if (s.indexOf("'") === -1) return "'" + s + "'";
    return null; // caller folds
  }

  function bareOk(s) {
    return /^[A-Za-z][^#:"'\n]*[A-Za-z0-9!?.)']$/.test(s) && !/\s#/.test(s) && !/^(true|false|null)$/.test(s);
  }

  function nameScalar(s) {
    return bareOk(s) ? s : scalar(s);
  }

  function emit(lines, indent, key, v) {
    var pad = new Array(indent + 1).join(" ");
    var q = key === "name" ? nameScalar(String(v)) : scalar(v);
    if (q !== null) { lines.push(pad + key + ": " + q); return; }
    lines.push(pad + key + ": >-");
    lines.push(pad + "  " + String(v).replace(/\s+/g, " ").trim());
  }

  function emitThreshold(lines, t) {
    var first = true;
    function kv(key, val) {
      var pad = first ? "          - " : "            ";
      first = false;
      lines.push(pad + key + ": " + val);
    }
    if (t.stats) {
      kv("stats", "{ Oomph: " + Number(t.stats.Oomph || 0) + ", Scramble: " + Number(t.stats.Scramble || 0) + " }");
    } else {
      kv("stat", t.stat);
      kv("value", Number(t.value));
    }
    var q = scalar(t.outcome || "");
    if (q !== null) kv("outcome", q);
    else { kv("outcome", ">-"); lines.push("              " + String(t.outcome).replace(/\s+/g, " ").trim()); }
  }

  function isRoom(c) { return c.kind === "room" || c.kind === "stairwell"; }

  /** The card as the lines of its `  - name: ...` block, no trailing blank. */
  function cardLines(c) {
    var lines = [];
    var order = isRoom(c) ? ORDER_ROOM : ORDER_PLAYER;
    var seen = {};
    order.concat(Object.keys(c)).forEach(function (key) {
      if (seen[key]) return;
      seen[key] = true;
      if (!(key in c)) return;
      var v = c[key];
      if (v === undefined) return;
      if (key === "challenges") {
        lines.push("    challenges:");
        (v || []).forEach(function (ch) {
          var ths = ch.thresholds || [];
          ths.forEach(function (t, i) {
            if (i === 0) {
              lines.push("      - thresholds:");
            }
            emitThreshold(lines, t);
          });
        });
        return;
      }
      if (key === "starter" || key === "conditional_stat") {
        if (v !== true) return;
      }
      if (key === "count" && (v === null || v === 1)) return;
      if ((key === "text" || key === "flavor" || key === "flee") && (v === "" || v === null)) return;
      if ((key === "oomph" || key === "scramble") && (v === null || v === 0)) return;
      if (key === "rarity" && (v === null || v === "")) return;
      if (key === "owner" && (v === null || v === "")) return;
      if (lines.length === 0) {
        lines.push("  - " + key + ": " + (key === "name" ? nameScalar(String(v)) : scalar(v)));
      } else {
        emit(lines, 4, key, v);
      }
    });
    return lines;
  }

  return { cardLines: cardLines, scalar: scalar, isRoom: isRoom };
});
