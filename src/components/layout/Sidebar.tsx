import { NavLink, useLocation } from "react-router-dom";
import {
    Home, FileText, Users, CalendarDays,
    BarChart3, User, BookOpen, Wallet, Package, TrendingDown,
    Settings, ScanText, ShieldCheck, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/contexts/AdminContext";

const sidebarItems = [
    {
        title: "Principal",
        items: [
            { to: "/dashboard", icon: Home, label: "Home" },
            { to: "/agenda", icon: CalendarDays, label: "Agenda" },
            { to: "/services", icon: FileText, label: "Serviços" },
            { to: "/clients", icon: Users, label: "Clientes" },
            { to: "/import", icon: ScanText, label: "Importar Anotação", color: "text-blue-500", bg: "bg-blue-500/10" },
        ]
    },
    {
        title: "Financeiro",
        items: [
            { to: "/costs", icon: TrendingDown, label: "Custos", color: "text-rose-500", bg: "bg-rose-500/10" },
            { to: "/financial", icon: Wallet, label: "Financeiro", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { to: "/statistics", icon: BarChart3, label: "Relatórios", color: "text-purple-500", bg: "bg-purple-500/10" },
        ]
    },
    {
        title: "Administração",
        items: [
            { to: "/catalog", icon: BookOpen, label: "Catálogo" },
            { to: "/plans", icon: Package, label: "Planos" },
            { to: "/profile", icon: User, label: "Perfil" },
            { to: "/help", icon: HelpCircle, label: "Ajuda", color: "text-primary", bg: "bg-primary/10" },
        ]
    }
];

export function Sidebar({ className }: { className?: string }) {
    const location = useLocation();
    const { isMaster } = useAdmin();

    const currentSidebarItems = [...sidebarItems];

    if (isMaster) {
        // Encontrar a seção Administração
        const adminSectionIdx = currentSidebarItems.findIndex(s => s.title === "Administração");
        if (adminSectionIdx !== -1) {
            // Adicionar Painel Admin no início da seção
            const updatedAdminItems = [
                { to: "/admin", icon: ShieldCheck, label: "Painel Admin", color: "text-amber-500", bg: "bg-amber-500/10" },
                ...currentSidebarItems[adminSectionIdx].items
            ];
            currentSidebarItems[adminSectionIdx] = {
                ...currentSidebarItems[adminSectionIdx],
                items: updatedAdminItems
            };
        }
    }

    return (
        <aside className={cn("fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-40 overflow-y-auto", className)}>
            {/* Logo Header */}
            <div className="h-20 flex items-center px-6 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Fallback caso a logo não carregue, mas tentará carregar faviconw.png/logo.png */}
                    <img src="/logo_w6.png" alt="Workly" className="h-8 max-w-[140px] object-contain dark:invert-0 invert" onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }} />
                    <div className="font-black text-2xl tracking-tighter text-primary fallback-logo">Workly</div>
                </div>
            </div>

            <style>{`
        img[src="/logo_w6.png"]:not([style*="display: none"]) + .fallback-logo {
          display: none;
        }
      `}</style>

            {/* Navigation */}
            <div className="flex-1 py-6 flex flex-col gap-6 px-4">
                {currentSidebarItems.map((section, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                        <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                            {section.title}
                        </p>
                        {section.items.map(item => {
                            const isActive = location.pathname.startsWith(item.to);
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isActive && !item.bg ? "bg-primary text-white" : "",
                                        !isActive && !item.bg ? "bg-muted-foreground/10 group-hover:bg-muted-foreground/20 text-muted-foreground group-hover:text-foreground" : "",
                                        item.bg ? item.bg : ""
                                    )}>
                                        <Icon className={cn(
                                            "h-4 w-4",
                                            isActive && !item.color ? "text-white" : "",
                                            item.color ? item.color : ""
                                        )} />
                                    </div>
                                    <span className={cn(
                                        "font-bold text-sm",
                                        isActive ? "text-primary" : "text-foreground"
                                    )}>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </div>
        </aside>
    );
}
