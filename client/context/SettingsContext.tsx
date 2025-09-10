import React, { createContext, useContext, useMemo, useState } from "react";

export type SettingsState = {
  running: boolean;
  showWireframe: boolean;
  showHeatmap: boolean;
  showPit: boolean;
  showTunnels: boolean;
  showStructures: boolean;
  showHills: boolean;
  hilliness: number;
  mountainCount: number;
  alertsEnabled: boolean;
  alertsMinInterval: number;
};

const defaultState: SettingsState = {
  running: true,
  showWireframe: false,
  showHeatmap: true,
  showPit: true,
  showTunnels: true,
  showStructures: true,
  showHills: true,
  hilliness: 85,
  mountainCount: 14,
  alertsEnabled: true,
  alertsMinInterval: 30,
};

const SettingsContext = createContext<{
  state: SettingsState;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
} | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem("safekhadaan:settings");
      return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  const api = useMemo(
    () => ({
      state,
      set: (key, value) => {
        setState((prev) => {
          const next = { ...prev, [key]: value } as SettingsState;
          try {
            localStorage.setItem("safekhadaan:settings", JSON.stringify(next));
          } catch {}
          return next;
        });
      },
    }),
    [state],
  );

  return (
    <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
