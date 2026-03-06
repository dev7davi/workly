import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    CalendarDays, Plus, Clock, MapPin, User, Check, X,
    Trash2, ChevronRight, Calendar, AlertCircle, CheckCircle2,
    Edit3, Loader2, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppointments, Appointment, AppointmentStatus } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const apptSchema = z.object({
    title: z.string().min(2, "Título obrigatório"),
    description: z.string().optional(),
    date: z.string().min(1, "Data obrigatória"),
    time: z.string().optional(),
    location: z.string().optional(),
    client_id: z.string().optional(),
});

type ApptForm = z.infer<typeof apptSchema>;

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; icon: any }> = {
    scheduled: { label: "Agendado", color: "bg-blue-500/10 text-blue-600", icon: Clock },
    done: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
    cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive", icon: X },
};

function formatDateLabel(dateStr: string) {
    try {
        const d = parseISO(dateStr);
        if (isToday(d)) return "Hoje";
        if (isTomorrow(d)) return "Amanhã";
        return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
    } catch { return dateStr; }
}

function AppointmentForm({
    existing,
    onSuccess,
    onCancel,
}: {
    existing?: Appointment;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { createAppointment, updateAppointment } = useAppointments();
    const { clients } = useClients();
    const [selectedClient, setSelectedClient] = useState(existing?.client_id || "");

    const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ApptForm>({
        resolver: zodResolver(apptSchema),
        defaultValues: {
            title: existing?.title || "",
            description: existing?.description || "",
            date: existing?.date || new Date().toISOString().slice(0, 10),
            time: existing?.time || "",
            location: existing?.location || "",
        },
    });

    const onSubmit = async (data: ApptForm) => {
        const payload = {
            ...data,
            client_id: selectedClient || null,
            description: data.description || null,
            time: data.time || null,
            location: data.location || null,
            status: "scheduled" as AppointmentStatus,
        };

        if (existing) {
            await updateAppointment({ id: existing.id, ...payload });
        } else {
            await createAppointment(payload);
        }
        onSuccess();
    };

    return (
        <div className="bg-muted/30 rounded-2xl border border-border/60 p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {existing ? "Editar Compromisso" : "Novo Compromisso"}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Título *</Label>
                    <Input placeholder="Ex: Visita técnica, Orçamento..." className="h-11 rounded-xl bg-background border-none" {...register("title")} />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Data *</Label>
                        <Input type="date" className="h-11 rounded-xl bg-background border-none" {...register("date")} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Horário</Label>
                        <Input type="time" className="h-11 rounded-xl bg-background border-none" {...register("time")} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Cliente (opcional)</Label>
                    <select
                        value={selectedClient}
                        onChange={e => setSelectedClient(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-background border border-muted text-sm font-medium"
                    >
                        <option value="">Sem cliente vinculado</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Local</Label>
                    <Input placeholder="Endereço ou referência..." className="h-11 rounded-xl bg-background border-none" {...register("location")} />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Observações</Label>
                    <Textarea placeholder="Detalhes adicionais..." className="rounded-xl bg-background border-none min-h-[80px]" {...register("description")} />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={onCancel}>
                        <X className="h-4 w-4 mr-1.5" /> Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl font-black bg-primary">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1.5" /> {existing ? "Salvar" : "Criar"}</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function Agenda() {
    const { appointments, isLoading, deleteAppointment, markDone, updateAppointment } = useAppointments();
    const { clients } = useClients();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"upcoming" | "all" | "done">("upcoming");

    // Sort and filter
    const filtered = useMemo(() => {
        let list = [...appointments];
        if (filter === "upcoming") list = list.filter(a => a.status === "scheduled");
        if (filter === "done") list = list.filter(a => a.status === "done");
        return list.sort((a, b) => a.date.localeCompare(b.date));
    }, [appointments, filter]);

    // Group by date
    const grouped = useMemo(() => {
        const groups: Record<string, Appointment[]> = {};
        filtered.forEach(a => {
            if (!groups[a.date]) groups[a.date] = [];
            groups[a.date].push(a);
        });
        return groups;
    }, [filtered]);

    const clientName = (id?: string | null) =>
        clients.find(c => c.id === id)?.name;

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = appointments.filter(a => a.status === "scheduled" && a.date >= today);

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-6 pb-24 max-w-2xl mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Agenda</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {upcoming.length} compromisso{upcoming.length !== 1 ? "s" : ""} pendente{upcoming.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button
                    onClick={() => { setShowForm(true); setEditingId(null); }}
                    className="rounded-2xl h-12 px-6 font-black bg-primary shadow-lg shadow-primary/20"
                >
                    <Plus className="mr-2 h-4 w-4" /> Novo
                </Button>
            </header>

            {/* New form */}
            {showForm && !editingId && (
                <AppointmentForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 bg-muted/40 p-1 rounded-2xl">
                {([["upcoming", "Próximos"], ["all", "Todos"], ["done", "Concluídos"]] as const).map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setFilter(val)}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            filter === val ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* List */}
            {Object.keys(grouped).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, appts]) => (
                        <div key={date} className="space-y-2">
                            {/* Date header */}
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase",
                                    date === today
                                        ? "bg-primary text-white"
                                        : isPast(parseISO(date)) && date < today
                                            ? "bg-muted text-muted-foreground"
                                            : "bg-blue-500/10 text-blue-600"
                                )}>
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {formatDateLabel(date)}
                                </div>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {appts.map(appt => {
                                const statusCfg = STATUS_CONFIG[appt.status];
                                const StatusIcon = statusCfg.icon;
                                const isEditing = editingId === appt.id;

                                if (isEditing) {
                                    return (
                                        <AppointmentForm
                                            key={appt.id}
                                            existing={appt}
                                            onSuccess={() => setEditingId(null)}
                                            onCancel={() => setEditingId(null)}
                                        />
                                    );
                                }

                                return (
                                    <Card key={appt.id} className="border-none shadow-md rounded-2xl bg-card group overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Status indicator */}
                                                <div className={cn("mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0", statusCfg.color)}>
                                                    <StatusIcon className="h-4 w-4" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "font-black text-base",
                                                                appt.status === "done" && "line-through opacity-60"
                                                            )}>
                                                                {appt.title}
                                                            </p>

                                                            <div className="flex flex-wrap gap-3 mt-1">
                                                                {appt.time && (
                                                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                                        <Clock className="h-3 w-3" /> {appt.time}
                                                                    </span>
                                                                )}
                                                                {appt.location && (
                                                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground truncate max-w-[160px]">
                                                                        <MapPin className="h-3 w-3 shrink-0" /> {appt.location}
                                                                    </span>
                                                                )}
                                                                {appt.client_id && (
                                                                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                                                                        <User className="h-3 w-3" /> {clientName(appt.client_id)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {appt.description && (
                                                                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{appt.description}</p>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {appt.status === "scheduled" && (
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    className="h-8 w-8 rounded-xl text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                                                                    onClick={() => markDone(appt.id)}
                                                                    title="Marcar como concluído"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className="h-8 w-8 rounded-xl"
                                                                onClick={() => setEditingId(appt.id)}
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="rounded-3xl">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="font-black">Excluir compromisso?</AlertDialogTitle>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction className="rounded-xl bg-destructive" onClick={() => deleteAppointment(appt.id)}>
                                                                            Excluir
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                    <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center">
                        <Calendar className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <div>
                        <p className="font-black text-lg uppercase tracking-tight">
                            {filter === "upcoming" ? "Nenhum compromisso pendente" : "Sem registros"}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                            {filter === "upcoming" ? "Sua agenda está livre por agora" : "Nenhum compromisso encontrado"}
                        </p>
                    </div>
                    {filter === "upcoming" && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="rounded-2xl h-12 px-8 font-black bg-primary shadow-lg shadow-primary/20"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Criar compromisso
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
