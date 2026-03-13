import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Users, Plus, Search, Phone, MapPin,
    ChevronRight, Building2, Trash2, Edit3, MessageCircle,
    UserPlus, Heart, AlertTriangle, CalendarDays, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { QuickAddClient } from "@/components/QuickAddClient";
import { isThisMonth, parseISO } from "date-fns";

const TODAY = new Date().toISOString().slice(0, 10);

export default function Clients() {
    const { clients, isLoading, deleteClient } = useClients();
    const { services } = useServices();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const filtered = useMemo(() => {
        if (!search) return clients;
        const q = search.toLowerCase();
        return clients.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.city?.toLowerCase().includes(q)
        );
    }, [clients, search]);

    // Dashboard Stats & Client Stats
    const { stats, clientStats } = useMemo(() => {
        let newThisMonth = 0;
        let recurring = 0;
        let withOverdue = 0;

        const cStats: Record<string, any> = {};

        clients.forEach(client => {
            // New this month
            if (client.created_at && isThisMonth(parseISO(client.created_at))) {
                newThisMonth++;
            }

            const clientServices = services.filter(s =>
                s.client_name.toLowerCase().trim() === client.name.toLowerCase().trim()
            );

            const paid = clientServices.filter(s => s.status === "paid");
            const pending = clientServices.filter(s => s.status === "pending");
            const overdue = pending.filter(s => s.payment_date < TODAY);

            if (clientServices.length > 1) {
                recurring++;
            }

            if (overdue.length > 0) {
                withOverdue++;
            }

            cStats[client.id] = {
                total: clientServices.length,
                paidRevenue: paid.reduce((sum, s) => sum + Number(s.value), 0),
                pendingCount: pending.length,
                overdueCount: overdue.length,
                lastServiceDate: clientServices.length > 0 ? [...clientServices].sort((a, b) => b.service_date.localeCompare(a.service_date))[0].service_date : null
            };
        });

        return {
            stats: {
                totalActive: clients.length,
                newThisMonth,
                recurring,
                withOverdue
            },
            clientStats: cStats
        };
    }, [clients, services]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-6 animate-pulse max-w-4xl mx-auto">
                <Skeleton className="h-12 w-48 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
                </div>
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-5 pb-28 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            {/* ── Header ── */}
            <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 pt-2">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                        Base de Contatos
                    </p>
                    <h1 className="text-2xl font-black tracking-tight">Clientes</h1>
                </div>
                <Button
                    onClick={() => setShowQuickAdd(true)}
                    className="h-12 w-12 flex items-center justify-center bg-primary rounded-2xl shadow-lg shadow-primary/30 text-white hover:scale-105 active:scale-95 transition-all p-0"
                >
                    <Plus className="h-6 w-6 stroke-[2.5]" />
                </Button>
            </header>

            <QuickAddClient
                open={showQuickAdd}
                onOpenChange={setShowQuickAdd}
                onSuccess={() => setShowQuickAdd(false)}
            />

            {/* ── Dashboard KPIs ── */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-none shadow-md rounded-3xl bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Total Ativos</p>
                            <p className="text-2xl font-black tracking-tighter text-foreground">{stats.totalActive}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-3xl bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-emerald-600/80">Novos no mês</p>
                            <p className="text-2xl font-black tracking-tighter text-emerald-600">{stats.newThisMonth}</p>
                        </div>
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-3xl bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-indigo-600/80">Recorrentes</p>
                            <p className="text-2xl font-black tracking-tighter text-indigo-600">{stats.recurring}</p>
                        </div>
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                            <Heart className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-3xl bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-destructive/80">Com atrasos</p>
                            <p className="text-2xl font-black tracking-tighter text-destructive">{stats.withOverdue}</p>
                        </div>
                        <div className="h-10 w-10 bg-destructive/10 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Search ── */}
            <div className="relative mt-2">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome, telefone, cidade..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-11 h-12 rounded-2xl bg-muted/40 border-none focus-visible:ring-primary shadow-inner"
                />
            </div>

            {/* ── Top Clientes Link ── */}
            <div className="flex justify-end mt-[-5px]">
                <Link to="/statistics" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                    Ver Top Clientes <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* ── Clients List ── */}
            {filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map(client => {
                        const s = clientStats[client.id] || { total: 0, paidRevenue: 0, pendingCount: 0, overdueCount: 0 };
                        return (
                            <Card
                                key={client.id}
                                className={cn(
                                    "border-none shadow-md rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-200",
                                    s.overdueCount > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-card"
                                )}
                            >
                                <CardContent className="p-0">
                                    <div
                                        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => navigate(`/clients/${encodeURIComponent(client.name)}`)}
                                    >
                                        {/* Avatar */}
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black",
                                            client.type === "pj" ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary",
                                            s.overdueCount > 0 && "bg-destructive/10 text-destructive"
                                        )}>
                                            {client.type === "pj"
                                                ? <Building2 className="h-6 w-6" />
                                                : client.name.charAt(0).toUpperCase()
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Name + badge */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <p className="font-black text-base truncate">{client.name}</p>
                                                    {client.profile_completed === false && (
                                                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase">
                                                            Incompleto
                                                        </Badge>
                                                    )}
                                                    {s.overdueCount > 0 && (
                                                        <Badge className="bg-destructive/10 text-destructive border-none text-[9px] font-black uppercase">
                                                            Atraso
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact info */}
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                {client.phone && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {client.phone}
                                                    </span>
                                                )}
                                                {client.city && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                                                        <MapPin className="h-3 w-3 shrink-0" /> {client.city}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Resumo Financeiro */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black uppercase bg-muted/50 px-2 py-0.5 rounded-lg text-muted-foreground">
                                                    {s.total} Serv.
                                                </span>
                                                <span className="text-[10px] font-black uppercase text-emerald-600">
                                                    {formatCurrency(s.paidRevenue)} LTV
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow indicator */}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 mt-4 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center divide-x divide-border/50 border-t border-border/50 bg-muted/10">
                                        <button
                                            onClick={e => { e.stopPropagation(); navigate(`/agenda?client=${client.id}`); }}
                                            className="flex-1 py-3 flex justify-center items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/30 hover:text-blue-600 transition-colors"
                                        >
                                            <CalendarDays className="h-3.5 w-3.5" /> Agendar
                                        </button>

                                        {client.phone ? (
                                            <a
                                                href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex-1 py-3 flex justify-center items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                                            </a>
                                        ) : (
                                            <div className="flex-1 py-3 flex justify-center items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                                                <MessageCircle className="h-3.5 w-3.5" /> Sem Fone
                                            </div>
                                        )}

                                        <div className="flex shrink-0 px-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-muted/50"
                                                onClick={e => { e.stopPropagation(); navigate(`/clients/${client.id}/edit`); }}
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild onClick={e => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-3xl" onClick={e => e.stopPropagation()}>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="font-black">Excluir cliente?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            O cliente <strong>{client.name}</strong> será removido. Os serviços vinculados não serão afetados.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction className="rounded-xl bg-destructive" onClick={() => deleteClient(client.id)}>
                                                            Excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                    <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center">
                        <Users className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <div>
                        <p className="font-black text-lg uppercase tracking-tight">
                            {search ? "Nenhum resultado" : "Nenhum cliente ainda"}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                            {search ? "Tente outro termo" : "Cadastre seu primeiro cliente"}
                        </p>
                    </div>
                    {!search && (
                        <Button
                            onClick={() => setShowQuickAdd(true)}
                            className="rounded-2xl h-12 px-8 font-black bg-primary shadow-lg shadow-primary/20"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Cadastrar cliente
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
