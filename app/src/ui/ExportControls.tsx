/* Taking the run away with you: three buttons, one per export format.
 *
 * The files themselves are built in the application layer (`exportRun.ts`).
 * All this knows is how a browser hands a person a file, and what the clock
 * says — the formatter is told the moment, so nothing below the UI reads one.
 */

import { EXPORTS, type ExportFile } from "@application/exportRun";
import { useSession } from "./useSession";

function save(file: ExportFile): void {
  const url = URL.createObjectURL(new Blob([file.text], { type: `${file.mime};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function ExportControls() {
  const session = useSession();

  return (
    <div className="log__exports">
      <span className="log__exports-label">Export</span>
      {EXPORTS.map(({ extension, what, build }) => (
        <button
          key={extension}
          type="button"
          className="button button--small"
          title={`.${extension} — ${what}`}
          onClick={() => {
            save(build(session.getState(), new Date()));
          }}
        >
          .{extension}
        </button>
      ))}
    </div>
  );
}
