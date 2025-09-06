import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
        <p className="mt-3 text-muted-foreground">This route does not exist.</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
        >
          Back to dashboard
        </a>
      </main>
    </div>
  );
};

export default NotFound;
