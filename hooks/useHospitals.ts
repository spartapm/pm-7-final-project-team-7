"use client";

import { LIST_TIMEOUT_MS } from "@/lib/constants";
import { loadSnapshot } from "@/lib/hospitals";
import type { Hospital } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

type State =
  | { status: "loading"; hospitals: Hospital[] }
  | { status: "ready"; hospitals: Hospital[] }
  | { status: "error"; hospitals: Hospital[] };

export function useHospitals() {
  const [state, setState] = useState<State>({ status: "loading", hospitals: [] });

  const load = useCallback(async (force: boolean) => {
    setState((current) => ({ status: "loading", hospitals: current.hospitals }));
    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("timeout")), LIST_TIMEOUT_MS);
    });
    try {
      const snapshot = await Promise.race([loadSnapshot(force), timeout]);
      setState({ status: "ready", hospitals: snapshot.hospitals });
    } catch {
      setState({ status: "error", hospitals: [] });
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return { ...state, reload: () => load(true) };
}
