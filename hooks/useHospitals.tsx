"use client";

import { LIST_TIMEOUT_MS } from "@/lib/constants";
import { loadSnapshot } from "@/lib/hospitals";
import type { Hospital } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type State =
  | { status: "loading"; hospitals: Hospital[] }
  | { status: "ready"; hospitals: Hospital[] }
  | { status: "error"; hospitals: Hospital[] };

type HospitalsContextValue = State & { reload: () => Promise<void> };

const HospitalsContext = createContext<HospitalsContextValue | null>(null);

function useHospitalsState(): HospitalsContextValue {
  const [state, setState] = useState<State>({ status: "loading", hospitals: [] });
  const inFlight = useRef(false);

  const load = useCallback(async (force: boolean) => {
    if (inFlight.current && !force) return;
    inFlight.current = true;
    setState((current) => ({ status: "loading", hospitals: current.hospitals }));
    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("timeout")), LIST_TIMEOUT_MS);
    });
    try {
      const snapshot = await Promise.race([loadSnapshot(force), timeout]);
      setState({ status: "ready", hospitals: snapshot.hospitals });
    } catch {
      setState({ status: "error", hospitals: [] });
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return useMemo(() => ({ ...state, reload: () => load(true) }), [load, state]);
}

export function HospitalsProvider({ children }: { children: ReactNode }) {
  const value = useHospitalsState();
  return <HospitalsContext.Provider value={value}>{children}</HospitalsContext.Provider>;
}

export function useHospitals() {
  const value = useContext(HospitalsContext);
  if (!value) {
    throw new Error("useHospitals must be used within HospitalsProvider");
  }
  return value;
}
