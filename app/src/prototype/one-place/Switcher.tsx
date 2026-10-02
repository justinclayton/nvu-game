/* PROTOTYPE — throwaway. The floating variant switcher: not part of any
 * design being judged, which is why it is a high-contrast pill in the way. */

import { useEffect } from "react";

export interface VariantInfo {
  readonly key: string;
  readonly name: string;
}

interface Props {
  readonly variants: readonly VariantInfo[];
  readonly current: string;
  readonly onChange: (key: string) => void;
}

export function Switcher({ variants, current, onChange }: Props) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const step = (by: number) => {
    const next = variants[(index + by + variants.length) % variants.length];
    if (next) onChange(next.key);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (import.meta.env.PROD) return null;
  const v = variants[index];
  return (
    <div className="op-switcher" role="toolbar" aria-label="Prototype variant">
      <button type="button" onClick={() => step(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        <b>{v?.key}</b> — {v?.name}
      </span>
      <button type="button" onClick={() => step(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
