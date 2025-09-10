import { useState } from "react";
import Header from "@/components/layout/Header";
import ARScene, { RealtimeStats } from "@/components/dashboard/ARScene";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import SitePredictor from "@/components/dashboard/SitePredictor";
import KeyFeatures from "@/components/marketing/KeyFeatures";
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-[48vh] lg:h-[60vh]">
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
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Right Panel</h2>
              <Button asChild size="sm"><Link to="/settings">Open Settings</Link></Button>
            </div>
            <SitePredictor onStats={(s) => setStats(s)} onLocation={setSiteName} />
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
          </div>
        </section>
        <section className="pt-4">
          <KeyFeatures />
        </section>
      </main>
    </div>
  );
}
