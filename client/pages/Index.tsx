import { useState } from "react";
import Header from "@/components/layout/Header";
import ARScene, { RealtimeStats } from "@/components/dashboard/ARScene";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import ControlsPanel from "@/components/dashboard/ControlsPanel";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import EnvPanel from "@/components/dashboard/EnvPanel";

export default function Index() {
  const [running, setRunning] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPit, setShowPit] = useState(true);
  const [showTunnels, setShowTunnels] = useState(true);
  const [showStructures, setShowStructures] = useState(true);
  const [showHills, setShowHills] = useState(true);
  const [hilliness, setHilliness] = useState(85);
  const [mountainCount, setMountainCount] = useState(14);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertsMinInterval, setAlertsMinInterval] = useState(30);
  const [stats, setStats] = useState<RealtimeStats>({
    hazardIndex: 0,
    velocityAvg: 0,
    activeRocks: 0,
    confidence: 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[48vh] lg:h-[60vh]">
            <ARScene
              running={running}
              showWireframe={showWireframe}
              showHeatmap={showHeatmap}
              showPit={showPit}
              showTunnels={showTunnels}
              showStructures={showStructures}
              showHills={showHills}
              hilliness={hilliness}
              mountainCount={mountainCount}
              onStats={setStats}
            />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <ControlsPanel
              running={running}
              setRunning={setRunning}
              showWireframe={showWireframe}
              setShowWireframe={setShowWireframe}
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
              showPit={showPit}
              setShowPit={setShowPit}
              showTunnels={showTunnels}
              setShowTunnels={setShowTunnels}
              showStructures={showStructures}
              setShowStructures={setShowStructures}
              showHills={showHills}
              setShowHills={setShowHills}
              hilliness={hilliness}
              setHilliness={setHilliness}
              mountainCount={mountainCount}
              setMountainCount={setMountainCount}
              alertsEnabled={alertsEnabled}
              setAlertsEnabled={setAlertsEnabled}
              alertsMinInterval={alertsMinInterval}
              setAlertsMinInterval={setAlertsMinInterval}
            />
            <AlertsFeed
              hazard={stats.hazardIndex}
              enabled={alertsEnabled}
              minIntervalSec={alertsMinInterval}
            />
          </div>
        </section>
        <section>
          <MetricsPanel
            hazard={stats.hazardIndex}
            velocityAvg={stats.velocityAvg}
            activeRocks={stats.activeRocks}
            confidence={stats.confidence}
          />
        </section>
      </main>
    </div>
  );
}
