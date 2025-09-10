import Header from "@/components/layout/Header";
import ControlsPanel from "@/components/dashboard/ControlsPanel";
import { useSettings } from "@/context/SettingsContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { state, set } = useSettings();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard Settings</h1>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
        <ControlsPanel
          running={state.running}
          setRunning={(v) => set("running", v)}
          showWireframe={state.showWireframe}
          setShowWireframe={(v) => set("showWireframe", v)}
          showHeatmap={state.showHeatmap}
          setShowHeatmap={(v) => set("showHeatmap", v)}
          showPit={state.showPit}
          setShowPit={(v) => set("showPit", v)}
          showTunnels={state.showTunnels}
          setShowTunnels={(v) => set("showTunnels", v)}
          showStructures={state.showStructures}
          setShowStructures={(v) => set("showStructures", v)}
          showHills={state.showHills}
          setShowHills={(v) => set("showHills", v)}
          hilliness={state.hilliness}
          setHilliness={(v) => set("hilliness", v)}
          mountainCount={state.mountainCount}
          setMountainCount={(v) => set("mountainCount", v)}
          alertsEnabled={state.alertsEnabled}
          setAlertsEnabled={(v) => set("alertsEnabled", v)}
          alertsMinInterval={state.alertsMinInterval}
          setAlertsMinInterval={(v) => set("alertsMinInterval", v)}
        />
      </main>
    </div>
  );
}
