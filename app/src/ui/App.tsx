/* The table, wired to one session. The session is created at the composition
 * root, so nothing in ui knows where the seed came from. */

import type { Replay } from "@application/replay";
import type { Session } from "@application/session";
import { Table } from "./Table";
import { SessionProvider } from "./useSession";
/* The three faces the table prints in, served with the app rather than from a
 * font host, so the first paint and an offline playtest use them too. */
import "@fontsource/alegreya-sans/latin-400.css";
import "@fontsource/alegreya-sans/latin-400-italic.css";
import "@fontsource/alegreya-sans/latin-700.css";
import "@fontsource/barlow-semi-condensed/latin-600.css";
import "@fontsource/barlow-semi-condensed/latin-700.css";
import "@fontsource/saira-stencil-one/latin-400.css";
import "./table.css";

interface Props {
  readonly session: Session;
  readonly onNewRun: () => void;
  /** Opens a run file to replay; returns why it was refused, or null. */
  readonly onOpenRun: (text: string) => string | null;
  readonly replay?: Replay | undefined;
}

export function App({ session, onNewRun, onOpenRun, replay }: Props) {
  return (
    <SessionProvider value={session}>
      <Table onNewRun={onNewRun} onOpenRun={onOpenRun} replay={replay} />
    </SessionProvider>
  );
}
