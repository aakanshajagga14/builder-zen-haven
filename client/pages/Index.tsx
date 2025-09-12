import { useState } from "react";
import Header from "@/components/layout/Header";
import ARScene, { RealtimeStats } from "@/components/dashboard/ARScene";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import SitePredictor from "@/components/dashboard/SitePredictor";
import { useSettings } from "@/context/SettingsContext";

export default function Index() {
  const { state, set } = useSettings();
  const [stats, setStats] = useState<RealtimeStats>({
    hazardIndex: 0,
    velocityAvg: 0,
    activeRocks: 0,
    confidence: 0,
  });
  const [siteName, setSiteName] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Live Safety Dashboard
              </p>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                Mine Risk Monitoring
              </h2>
            </div>
          </div>
          <div className="h-[48vh] lg:h-[60vh] rounded-2xl border border-border/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(250,204,21,0.1),transparent)]">
            <ARScene
              running={state.running}
              showWireframe={state.showWireframe}
              showHeatmap={state.showHeatmap}
              showPit={state.showPit}
              showTunnels={state.showTunnels}
              showStructures={state.showStructures}
              showHills={state.showHills}
              hilliness={state.hilliness}
              mountainCount={state.mountainCount}
              onStats={setStats}
              statsOutputEnabled={false}
              hazardExternal={stats.hazardIndex}
              mineAreaRadius={12}
            />
          </div>
          <SitePredictor
            onStats={(s) => setStats(s)}
            onLocation={setSiteName}
          />
          <MetricsPanel
            hazard={stats.hazardIndex}
            velocityAvg={stats.velocityAvg}
            activeRocks={stats.activeRocks}
            confidence={stats.confidence}
          />
          <AlertsFeed
            hazard={stats.hazardIndex}
            enabled={state.alertsEnabled}
            minIntervalSec={state.alertsMinInterval}
            activeRocks={stats.activeRocks}
            site={siteName}
          />
        </section>
      </main>
    </div>
  );
}
