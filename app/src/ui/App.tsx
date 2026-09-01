/* The table, wired to one session. The session is created at the composition
 * root, so nothing in ui knows where the seed came from. */

import type { Session } from "@application/session";
import { Table } from "./Table";
import { SessionProvider } from "./useSession";
import "./table.css";

interface Props {
  readonly session: Session;
  readonly onNewRun: () => void;
}

export function App({ session, onNewRun }: Props) {
  return (
    <SessionProvider value={session}>
      <Table onNewRun={onNewRun} />
    </SessionProvider>
  );
}
