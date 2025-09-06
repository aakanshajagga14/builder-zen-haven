import { Button } from "@/components/ui/button";
import { Sun, Moon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-7 w-7 rounded-md border flex items-center justify-center",
              "bg-gradient-to-tr from-brand to-cyan-400 border-brand/30 shadow-[0_0_25px_-8px_hsl(var(--brand))]",
            )}
          >
            <Zap className="h-4 w-4 text-brand-foreground" />
          </div>
          <span className="font-extrabold tracking-tight text-lg">
            LithoGuard AR
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button>Connect Sensors</Button>
        </div>
      </div>
    </header>
  );
}
