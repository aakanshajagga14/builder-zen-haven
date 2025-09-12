import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Zap,
  Menu,
  LayoutDashboard,
  Settings as SettingsIcon,
  Plug,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ControlsPanel from "@/components/dashboard/ControlsPanel";
import { useSettings } from "@/context/SettingsContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return { dark, setDark };
}

export default function Header() {
  const { dark, setDark } = useTheme();
  const { state, set } = useSettings();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <div
            className={cn(
              "h-7 w-7 rounded-md border flex items-center justify-center",
              "bg-gradient-to-tr from-brand to-cyan-400 border-brand/30 shadow-[0_0_25px_-8px_hsl(var(--brand))]",
            )}
          >
            <Zap className="h-4 w-4 text-brand-foreground" />
          </div>
          <span className="font-extrabold tracking-tight text-lg">
            SAFEKHADAAN
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open settings">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full sm:max-w-sm overflow-y-auto"
            >
              <SheetTitle className="sr-only">Main Menu</SheetTitle>
              <div className="mb-3">
                <p className="text-sm font-semibold">Menu</p>
                <p className="text-xs text-muted-foreground">Navigate</p>
              </div>
              <nav className="grid gap-1.5 mb-3">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate("/sensors")}
                  >
                    <Plug className="h-4 w-4 mr-2" /> Connect Sensors
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate("/settings")}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </SheetClose>
              </nav>
              <div className="pt-2 border-t mb-2">
                <p className="text-sm font-semibold">Dashboard Settings</p>
                <p className="text-xs text-muted-foreground">
                  Tweak AR and visualization
                </p>
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
            </SheetContent>
          </Sheet>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button onClick={() => navigate("/sensors")}>Connect Sensors</Button>
        </div>
      </div>
    </header>
  );
}
