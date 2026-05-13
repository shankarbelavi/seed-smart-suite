import { Link, useLocation } from "@tanstack/react-router";
import { Sprout, LayoutDashboard, Leaf, BarChart3, History, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Home", icon: Sprout },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recommendation", label: "Recommend", icon: Leaf },
  { to: "/yield", label: "Yield", icon: BarChart3 },
  { to: "/analytics", label: "Analytics", icon: Cpu },
  { to: "/history", label: "History", icon: History },
] as const;

export function Nav() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-emerald)] glow-emerald"
            >
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight">FarmConnect</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Agriculture</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = loc.pathname === l.to;
              const Icon = l.icon;
              return (
                <Link key={l.to} to={l.to}
                  className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  <Icon className="h-4 w-4" />
                  <span>{l.label}</span>
                  {active && (
                    <motion.span layoutId="navActive"
                      className="absolute inset-0 -z-10 rounded-lg bg-primary/10 ring-1 ring-primary/30" />
                  )}
                </Link>
              );
            })}
          </nav>
          <Link to="/recommendation"
            className="hidden rounded-lg bg-[var(--gradient-emerald)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] sm:inline-flex">
            Try Demo
          </Link>
        </div>
        {/* mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {links.map((l) => {
            const active = loc.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}>
                <Icon className="h-3.5 w-3.5" /> {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
