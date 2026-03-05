import { NavLink, useLocation } from "react-router-dom";
import { Home, FileText, DollarSign, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Início" },
  { to: "/services", icon: FileText, label: "Serviços" },
  { to: "/financial", icon: DollarSign, label: "Financeiro" },
  { to: "/statistics", icon: BarChart3, label: "Stats" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || 
            (to === "/services" && location.pathname.startsWith("/services"));
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn(
                "text-xs",
                isActive ? "font-semibold" : "font-medium"
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
