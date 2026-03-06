import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, Plus, Search, Phone, Mail, MapPin,
    ChevronRight, Star, Building2, User, Trash2, Edit3
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

export default function Clients() {
    const { clients, isLoading, deleteClient } = useClients();
    const { services } = useServices();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

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

    // Stats per client
    const clientStats = useMemo(() => {
        return clients.reduce((acc, client) => {
            const clientServices = services.filter(s =>
                s.client_name.toLowerCase().trim() === client.name.toLowerCase().trim()
            );
            const paid = clientServices.filter(s => s.status === "paid");
            const pending = clientServices.filter(s => s.status === "pending");
            acc[client.id] = {
                total: clientServices.length,
                paidRevenue: paid.reduce((sum, s) => sum + s.value, 0),
                pending: pending.length,
            };
            return acc;
        }, {} as Record<string, { total: number; paidRevenue: number; pending: number }>);
    }, [clients, services]);

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 max-w-4xl mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Clientes</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {clients.length} cliente{clients.length !== 1 ? "s" : ""} cadastrado{clients.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/clients/new")}
                    className="rounded-2xl h-12 px-6 font-black bg-primary shadow-lg shadow-primary/20"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Novo
                </Button>
            </header>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome, telefone, cidade..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-11 h-12 rounded-2xl bg-muted/40 border-none focus-visible:ring-primary"
                />
            </div>

            {/* Clients List */}
            {filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map(client => {
                        const stats = clientStats[client.id] || { total: 0, paidRevenue: 0, pending: 0 };
                        return (
                            <Card
                                key={client.id}
                                className="border-none shadow-md rounded-2xl bg-card overflow-hidden cursor-pointer group hover:shadow-xl hover:scale-[1.01] transition-all duration-200"
                                onClick={() => navigate(`/clients/${client.id}`)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black",
                                            client.type === "pj"
                                                ? "bg-blue-500/10 text-blue-600"
                                                : "bg-primary/10 text-primary"
                                        )}>
                                            {client.type === "pj"
                                                ? <Building2 className="h-6 w-6" />
                                                : client.name.charAt(0).toUpperCase()
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Name + badge */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-black text-base truncate">{client.name}</p>
                                                {stats.pending > 0 && (
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase">
                                                        {stats.pending} pendente{stats.pending > 1 ? "s" : ""}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Contact info */}
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                {client.phone && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {client.phone}
                                                    </span>
                                                )}
                                                {client.city && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                        <MapPin className="h-3 w-3" /> {client.city}{client.state ? `, ${client.state}` : ""}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Financials */}
                                            {stats.total > 0 && (
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase">
                                                        {stats.total} serviço{stats.total !== 1 ? "s" : ""}
                                                    </span>
                                                    {stats.paidRevenue > 0 && (
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase">
                                                            {formatCurrency(stats.paidRevenue)} recebido
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 shrink-0 items-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={e => { e.stopPropagation(); navigate(`/clients/${client.id}/edit`); }}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild onClick={e => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
                            onClick={() => navigate("/clients/new")}
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
