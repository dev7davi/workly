import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Plus, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/services", icon: FileText, label: "Serviços" },
  { to: "/services/new", icon: Plus, label: "Novo", isAction: true },
  { to: "/clients", icon: Users, label: "Clientes" },
  { to: "/statistics", icon: BarChart3, label: "Relatórios" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 select-none">
      <div className="mx-auto max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[32px] h-20 flex items-center justify-around px-2">
        {navItems.map(({ to, icon: Icon, label, isAction }) => {
          const isActive =
            location.pathname === to ||
            (to === "/services" &&
              location.pathname.startsWith("/services") &&
              location.pathname !== "/services/new") ||
            (to === "/clients" && location.pathname.startsWith("/clients"));

          if (isAction) {
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="relative -top-8 flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-full shadow-xl shadow-primary/40 text-white transition-all hover:scale-110 active:scale-90"
              >
                <Plus className="h-8 w-8 stroke-[3]" />
              </button>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300",
                isActive
                  ? "text-primary translate-y-[-2px]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
              </div>
              <span className={cn(
                "text-[10px] uppercase font-black tracking-tighter opacity-70",
                isActive && "opacity-100"
              )}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
