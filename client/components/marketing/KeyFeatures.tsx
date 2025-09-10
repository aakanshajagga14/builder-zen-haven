import { Card } from "@/components/ui/card";
import { CloudRain, AlertTriangle, Brain, Layers } from "lucide-react";

export default function KeyFeatures() {
  const items = [
    {
      icon: CloudRain,
      title: "Rainfall–Slope Instability & Hazard Correlation",
      desc:
        "Historical + live rainfall data predicts collapse probability (e.g., 60% risk after 40 mm rain in Zone B). Extends to detect toxic gases and hazardous materials for real-time worker safety.",
    },
    {
      icon: Brain,
      title: "AI Explainability Panel",
      desc:
        "Converts complex AI predictions into plain-language reasoning (e.g., Steep slope ↑ + rainfall ↑ = 75% rockfall risk). Builds trust and usability for all stakeholders.",
    },
    {
      icon: Layers,
      title: "Multi-Hazard Fusion",
      desc:
        "Unified dashboard integrating risks from rockfalls, floods, landslides, and gas leaks. Provides proactive, all-in-one safety intelligence.",
    },
  ];

  return (
    <section aria-labelledby="kf-title" className="w-full">
      <Card className="relative overflow-hidden border-foreground/10 bg-black text-foreground">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-neutral-700/20 blur-3xl" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-10">
          <h2 id="kf-title" className="text-center text-2xl md:text-3xl font-extrabold tracking-tight">
            Key Features of SafeKhadaan Dashboard
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {items.map((it, i) => (
              <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-14 w-14 rounded-xl bg-neutral-900 border border-yellow-500/40 flex items-center justify-center">
                    <it.icon className="h-7 w-7 text-yellow-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base md:text-lg font-bold text-neutral-100">{it.title}</h3>
                    <p className="text-sm md:text-[13px] leading-relaxed text-neutral-400">{it.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 md:mt-10 text-center text-sm md:text-base font-medium text-neutral-300">
            One Dashboard. All Risks. Safer Mines.
          </p>
        </div>
      </Card>
    </section>
  );
}
