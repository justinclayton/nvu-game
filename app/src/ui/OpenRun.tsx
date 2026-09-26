/* Opening a run file to replay it: a button that is really a file input. A run
 * can also be dropped anywhere on the table; `Table.tsx` handles the drop. */

interface Props {
  readonly onOpen: (text: string) => void;
}

export function OpenRun({ onOpen }: Props) {
  return (
    <label
      className="open-run button"
      title="Open a .json run file — an export, or one the CLI or a bot wrote — and step through it."
    >
      Open run…
      <input
        type="file"
        accept="application/json,.json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void file.text().then(onOpen);
          e.target.value = "";
        }}
      />
    </label>
  );
}
