/* Binding React to the session. The store is created outside React, at the
 * composition root, so the engine has no idea a browser is involved. */

import { createContext, useContext } from "react";
import { useStore } from "zustand";

import type { Session, SessionState } from "@application/session";

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = SessionContext.Provider;

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("A <SessionProvider> is missing above this component.");
  return session;
}

/** Subscribe to one slice of the session. */
export function useSessionState<T>(selector: (state: SessionState) => T): T {
  return useStore(useSession(), selector);
}

/** Dispatch without subscribing to anything. */
export function useDispatch(): SessionState["dispatch"] {
  const session = useSession();
  return session.getState().dispatch;
}
