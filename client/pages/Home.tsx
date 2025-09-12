import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import KeyFeatures from "@/components/marketing/KeyFeatures";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=2000&q=80"
          alt="Open pit mine aerial background"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/80 to-background" />
      </div>
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(1200px_400px_at_50%_-20%,hsl(var(--brand)/0.15),transparent)]">
          <div className="px-6 py-14 md:px-12 md:py-20 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs tracking-widest uppercase text-muted-foreground">
              Safer Mines • Smarter Decisions
            </p>
            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight">
              Real‑time Mine Safety Intelligence
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Monitor hazards, fuse sensor data, and act before incidents occur.
              Rockfall, rainfall, landslides, gas risks—one premium dashboard.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Open Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/sensors")}
              >
                Connect Sensors
              </Button>
            </div>
          </div>
        </section>
        <KeyFeatures />
      </main>
    </div>
  );
}
