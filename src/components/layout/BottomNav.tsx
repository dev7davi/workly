import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home, FileText, Plus, Users, CalendarDays,
  BarChart3, User, BookOpen, MoreHorizontal, X,
  Wallet, Package, TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const moreItems = [
  { to: "/statistics", icon: BarChart3, label: "Relatórios", color: "text-purple-500", bg: "bg-purple-500/10" },
  { to: "/financial", icon: Wallet, label: "Financeiro", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { to: "/costs", icon: TrendingDown, label: "Custos", color: "text-rose-500", bg: "bg-rose-500/10" },
  { to: "/catalog", icon: BookOpen, label: "Catálogo", color: "text-primary", bg: "bg-primary/10" },
  { to: "/plans", icon: Package, label: "Planos", color: "text-amber-500", bg: "bg-amber-500/10" },
  { to: "/profile", icon: User, label: "Perfil", color: "text-slate-500", bg: "bg-slate-500/10" },
];

const mainNavItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/services", icon: FileText, label: "Serviços" },
  { to: "/services/new", icon: Plus, label: "Novo", isAction: true },
  { to: "/clients", icon: Users, label: "Clientes" },
  { to: "/agenda", icon: CalendarDays, label: "Agenda" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some(item => location.pathname.startsWith(item.to));

  const handleMoreItemClick = (to: string) => {
    setShowMore(false);
    navigate(to);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Panel */}
      {showMore && (
        <div className="fixed bottom-28 left-4 right-4 z-50 max-w-lg mx-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-3 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mais opções</p>
              <button
                onClick={() => setShowMore(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <button
                    key={item.to}
                    onClick={() => handleMoreItemClick(item.to)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95",
                      isActive ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("h-11 w-11 flex items-center justify-center rounded-2xl", item.bg)}>
                      <Icon className={cn("h-6 w-6", item.color)} />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-tight",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 select-none">
        <div className="mx-auto max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[32px] h-20 flex items-center justify-around px-2">
          {mainNavItems.map(({ to, icon: Icon, label, isAction }) => {
            const isActive =
              location.pathname === to ||
              (to === "/services" &&
                location.pathname.startsWith("/services") &&
                location.pathname !== "/services/new") ||
              (to === "/clients" && location.pathname.startsWith("/clients")) ||
              (to === "/agenda" && location.pathname.startsWith("/agenda"));

            if (isAction) {
              return (
                <button
                  key={to}
                  onClick={() => { setShowMore(false); navigate(to); }}
                  className="relative -top-8 flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-full shadow-xl shadow-primary/40 text-white transition-all hover:scale-110 active:scale-90"
                >
                  <Plus className="h-8 w-8 stroke-[3]" />
                </button>
              );
            }

            // Replace last item slot with "More" button
            if (label === "Agenda") {
              return (
                <div key="agenda-more" className="flex gap-0">
                  <NavLink
                    to={to}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 w-12 transition-all duration-300",
                      isActive ? "text-primary translate-y-[-2px]" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn("p-1 rounded-xl transition-all", isActive && "bg-primary/10")}>
                      <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                    </div>
                    <span className={cn("text-[10px] uppercase font-black tracking-tighter opacity-70", isActive && "opacity-100")}>
                      {label}
                    </span>
                  </NavLink>

                  {/* More button */}
                  <button
                    onClick={() => setShowMore(v => !v)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 w-12 transition-all duration-300",
                      (showMore || isMoreActive)
                        ? "text-primary translate-y-[-2px]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn("p-1 rounded-xl transition-all", (showMore || isMoreActive) && "bg-primary/10")}>
                      <MoreHorizontal className={cn("h-6 w-6", (showMore || isMoreActive) && "stroke-[2.5]")} />
                    </div>
                    <span className={cn("text-[10px] uppercase font-black tracking-tighter opacity-70", (showMore || isMoreActive) && "opacity-100")}>
                      Mais
                    </span>
                  </button>
                </div>
              );
            }

            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setShowMore(false)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300",
                  isActive ? "text-primary translate-y-[-2px]" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("p-1 rounded-xl transition-all", isActive && "bg-primary/10")}>
                  <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                </div>
                <span className={cn("text-[10px] uppercase font-black tracking-tighter opacity-70", isActive && "opacity-100")}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
