"use client";

import { HospitalsProvider } from "@/hooks/useHospitals";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HospitalsProvider>
      <div className="app-shell">{children}</div>
    </HospitalsProvider>
  );
}
