import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus, ChevronLeft, ChevronRight, X, Check, Loader2,
    Clock, MapPin, User, Trash2, Edit3, CalendarDays,
    List, Calendar, Grid3x3, AlertTriangle, CheckCircle2,
    Briefcase, Bell, ChevronDown
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCalendarEvents, CalendarEvent, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, EventType } from "@/hooks/useCalendarEvents";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { useClients } from "@/hooks/useClients";
import { AgendaExportButtons } from "@/components/services/AgendaExportButtons";
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameMonth, isToday, parseISO, addMonths, subMonths,
    startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay,
    addDays, getDay
} from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = "mes" | "semana" | "dia" | "lista";

// ─── Unified CalDay item ──────────────────────────────────────────────────────
interface DayItem {
    id: string;
    type: "event" | "payment" | "service_date" | "appointment";
    title: string;
    time?: string;
    color: string;
    dotColor: string; // blue/green/amber/red/purple
    status?: string;
    data: any;
}

// ─── Event form schema ────────────────────────────────────────────────────────
const eventSchema = z.object({
    titulo: z.string().min(2, "Título obrigatório"),
    tipo_evento: z.string(),
    data_inicio: z.string().min(1, "Data obrigatória"),
    hora_inicio: z.string().optional(),
    descricao: z.string().optional(),
    endereco: z.string().optional(),
    prioridade: z.string().optional(),
    cliente_id: z.string().optional(),
    dia_inteiro: z.boolean().optional(),
});
type EventForm = z.infer<typeof eventSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function statusColor(status: string) {
    switch (status) {
        case "concluido": return "bg-emerald-500/10 text-emerald-600";
        case "cancelado": return "bg-slate-500/10 text-slate-500";
        case "atrasado": return "bg-destructive/10 text-destructive";
        case "confirmado": return "bg-blue-500/10 text-blue-600";
        case "em_andamento": return "bg-indigo-500/10 text-indigo-600";
        default: return "bg-primary/10 text-primary";
    }
}

function priorityBadge(p: string) {
    switch (p) {
        case "urgente": return "bg-destructive text-white";
        case "alta": return "bg-amber-500 text-white";
        case "baixa": return "bg-muted text-muted-foreground";
        default: return "bg-muted/60 text-muted-foreground";
    }
}

// ─── Event Modal ──────────────────────────────────────────────────────────────
function EventModal({
    initialDate,
    existing,
    onClose,
}: {
    initialDate?: string;
    existing?: CalendarEvent;
    onClose: () => void;
}) {
    const { createEvent, updateEvent } = useCalendarEvents();
    const { clients } = useClients();
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<EventForm>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            titulo: existing?.titulo || "",
            tipo_evento: existing?.tipo_evento || "compromisso",
            data_inicio: existing?.data_inicio || initialDate || new Date().toISOString().slice(0, 10),
            hora_inicio: existing?.hora_inicio || "",
            descricao: existing?.descricao || "",
            endereco: existing?.endereco || "",
            prioridade: existing?.prioridade || "normal",
            cliente_id: existing?.cliente_id || "",
            dia_inteiro: existing?.dia_inteiro || false,
        },
    });

    const tipo = watch("tipo_evento") as EventType;
    const cor = EVENT_TYPE_COLORS[tipo] || "#6366f1";

    const onSubmit = async (data: EventForm) => {
        setServerError(null);
        try {
            const payload = {
                titulo: data.titulo,
                tipo_evento: data.tipo_evento as EventType,
                data_inicio: data.data_inicio,
                hora_inicio: data.hora_inicio || null,
                descricao: data.descricao || null,
                endereco: data.endereco || null,
                prioridade: (data.prioridade as any) || "normal",
                cliente_id: data.cliente_id || null,
                dia_inteiro: data.dia_inteiro || false,
                status: existing?.status || "agendado" as any,
                cor,
                lembrete_ativo: false,
                minutos_antes_lembrete: 30,
                origem: "manual" as const,
                data_fim: null,
                hora_fim: null,
                servico_id: null,
                financeiro_id: null,
                observacoes: null,
            };
            if (existing) {
                await updateEvent({ id: existing.id, ...payload });
            } else {
                await createEvent(payload);
            }
            onClose();
        } catch (e: any) {
            setServerError(e?.message || "Erro ao salvar evento.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card w-full max-w-lg rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-border" style={{ borderLeft: `4px solid ${cor}` }}>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {existing ? "Editar evento" : "Novo evento"}
                        </p>
                        <h2 className="text-lg font-black">{existing?.titulo || "Criar evento"}</h2>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto flex-1">
                    {serverError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {serverError}
                        </div>
                    )}

                    {/* Tipo + Título */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Tipo de evento</Label>
                        <select
                            className="w-full h-11 px-3 rounded-xl bg-muted/40 border-transparent border text-sm font-medium focus:ring-primary focus:outline-none"
                            {...register("tipo_evento")}
                        >
                            {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Título *</Label>
                        <Input
                            autoFocus
                            placeholder="Ex: Visita técnica na casa do João"
                            className={cn("h-11 rounded-xl bg-muted/40 border-transparent", errors.titulo && "border-destructive")}
                            {...register("titulo")}
                        />
                        {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
                    </div>

                    {/* Date + Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Data *</Label>
                            <Input type="date" className="h-11 rounded-xl bg-muted/40 border-transparent" {...register("data_inicio")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Horário</Label>
                            <Input type="time" className="h-11 rounded-xl bg-muted/40 border-transparent" {...register("hora_inicio")} />
                        </div>
                    </div>

                    {/* Client */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Cliente (opcional)</Label>
                        <select
                            className="w-full h-11 px-3 rounded-xl bg-muted/40 border-transparent border text-sm font-medium"
                            {...register("cliente_id")}
                        >
                            <option value="">Sem cliente vinculado</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Location + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Local</Label>
                            <Input placeholder="Endereço..." className="h-11 rounded-xl bg-muted/40 border-transparent" {...register("endereco")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Prioridade</Label>
                            <select className="w-full h-11 px-3 rounded-xl bg-muted/40 border-transparent border text-sm font-medium" {...register("prioridade")}>
                                <option value="baixa">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Observações</Label>
                        <Textarea placeholder="Detalhes adicionais..." className="rounded-xl bg-muted/40 border-transparent min-h-[80px]" {...register("descricao")} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1 h-12 rounded-xl font-black bg-primary" disabled={isSubmitting}
                            style={{ background: cor }}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1.5" />{existing ? "Salvar" : "Criar"}</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
function DayPanel({
    date,
    items,
    onAddEvent,
    onEditEvent,
    onDeleteEvent,
    onMarkDone,
    onClose,
}: {
    date: Date;
    items: DayItem[];
    onAddEvent: (date: string) => void;
    onEditEvent: (evt: CalendarEvent) => void;
    onDeleteEvent: (id: string) => void;
    onMarkDone: (id: string) => void;
    onClose: () => void;
}) {
    const dateStr = format(date, "yyyy-MM-dd");
    const label = isToday(date)
        ? "Hoje"
        : format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card w-full max-w-lg rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-200 max-h-[85vh] flex flex-col">
                <div className={cn(
                    "flex items-center justify-between p-5 border-b border-border",
                    isToday(date) && "bg-primary/5"
                )}>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <h2 className={cn("text-xl font-black capitalize", isToday(date) && "text-primary")}>{label}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="h-9 rounded-xl font-black bg-primary text-white"
                            onClick={() => onAddEvent(dateStr)}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Evento
                        </Button>
                        <button onClick={onClose} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-2 overflow-y-auto flex-1">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <CalendarDays className="h-12 w-12 text-muted-foreground/20" />
                            <p className="font-black uppercase text-sm">Dia livre</p>
                            <p className="text-xs text-muted-foreground">Clique em "+ Evento" para adicionar</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 p-3.5 rounded-2xl border relative group transition-all hover:shadow-md"
                                style={{ borderColor: item.color + "40", background: item.color + "08" }}
                            >
                                <div className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" style={{ background: item.dotColor }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-black text-sm">{item.title}</p>
                                        {item.time && (
                                            <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">{item.time}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
                                        {item.type === "event" && EVENT_TYPE_LABELS[item.data.tipo_evento as EventType]}
                                        {item.type === "payment" && `Pagamento · ${item.data.status}`}
                                        {item.type === "service_date" && "Execução de Serviço"}
                                        {item.type === "appointment" && "Compromisso"}
                                    </p>
                                    {item.data?.cliente_id && (
                                        <p className="text-[10px] font-bold text-primary mt-0.5 flex items-center gap-1">
                                            <User className="h-2.5 w-2.5" /> Cliente vinculado
                                        </p>
                                    )}
                                </div>
                                {/* Actions for calendar_events */}
                                {item.type === "event" && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {item.data.status !== "concluido" && (
                                            <button
                                                onClick={() => onMarkDone(item.id)}
                                                className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onEditEvent(item.data)}
                                            className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                                        >
                                            <Edit3 className="h-3 w-3" />
                                        </button>
                                         <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                                 <button
                                                     className="h-7 w-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
                                                 >
                                                     <Trash2 className="h-3 w-3" />
                                                 </button>
                                             </AlertDialogTrigger>
                                             <AlertDialogContent className="rounded-2xl">
                                                 <AlertDialogHeader>
                                                     <AlertDialogTitle className="font-black">Excluir evento?</AlertDialogTitle>
                                                     <AlertDialogDescription>
                                                         Deseja realmente excluir este evento? Esta ação não pode ser desfeita.
                                                     </AlertDialogDescription>
                                                 </AlertDialogHeader>
                                                 <AlertDialogFooter>
                                                     <AlertDialogCancel className="rounded-lg font-bold">Cancelar</AlertDialogCancel>
                                                     <AlertDialogAction
                                                         onClick={() => onDeleteEvent(item.id)}
                                                         className="rounded-lg font-bold bg-destructive text-white"
                                                     >
                                                         Excluir
                                                     </AlertDialogAction>
                                                 </AlertDialogFooter>
                                             </AlertDialogContent>
                                         </AlertDialog>
                                    </div>
                                )}
                                {item.type === "payment" && (
                                    <Link to={`/services/${item.data.id}/edit`} className="shrink-0">
                                        <Badge className="bg-primary/10 text-primary text-[9px] font-black">Ver</Badge>
                                    </Link>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── MONTH VIEW ───────────────────────────────────────────────────────────────
function MonthView({
    viewDate,
    allItems,
    onDayClick,
    onPrev,
    onNext,
}: {
    viewDate: Date;
    allItems: Record<string, DayItem[]>;
    onDayClick: (date: Date) => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    // Build grid: start from sunday of the week containing monthStart
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    return (
        <div className="space-y-3">
            {/* Month nav */}
            <div className="flex items-center justify-between">
                <button onClick={onPrev} className="h-9 w-9 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="font-black text-lg capitalize">
                    {format(viewDate, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <button onClick={onNext} className="h-9 w-9 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-px">
                {WEEK_DAYS.map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-muted-foreground uppercase py-1">{d}</div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const items = allItems[dateStr] || [];
                    const inMonth = isSameMonth(day, viewDate);
                    const isT = isToday(day);

                    // Categorize dots
                    const hasEvent = items.some(i => i.type === "event");
                    const hasPayment = items.some(i => i.type === "payment");
                    const hasService = items.some(i => i.type === "service_date");
                    const hasAppt = items.some(i => i.type === "appointment");
                    const hasOverdue = items.some(i => i.dotColor === "#ef4444");
                    const totalCount = items.length;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={cn(
                                "relative flex flex-col items-center p-1 rounded-xl min-h-[52px] transition-all hover:bg-muted/60 active:scale-95",
                                !inMonth && "opacity-30",
                                isT && "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-black leading-tight",
                                isT ? "text-white" : "text-foreground"
                            )}>
                                {format(day, "d")}
                            </span>

                            {/* Dot indicators */}
                            {totalCount > 0 && (
                                <div className="flex gap-0.5 flex-wrap justify-center mt-1 max-w-[36px]">
                                    {hasOverdue && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                                    {hasPayment && !hasOverdue && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                                    {hasEvent && <div className={cn("h-1.5 w-1.5 rounded-full", isT ? "bg-white" : "bg-indigo-500")} />}
                                    {hasAppt && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                                    {hasService && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                                </div>
                            )}

                            {/* Count badge */}
                            {totalCount > 3 && (
                                <span className={cn(
                                    "text-[8px] font-black leading-none mt-0.5",
                                    isT ? "text-white/80" : "text-muted-foreground"
                                )}>
                                    +{totalCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-1 pt-1 flex-wrap">
                {[
                    { color: "bg-indigo-500", label: "Evento" },
                    { color: "bg-emerald-500", label: "Pagamento" },
                    { color: "bg-amber-500", label: "Serviço" },
                    { color: "bg-blue-500", label: "Compromisso" },
                    { color: "bg-red-500", label: "Atrasado" },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", color)} />
                        <span className="text-[9px] font-bold text-muted-foreground">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── WEEK VIEW ────────────────────────────────────────────────────────────────
function WeekView({
    viewDate,
    allItems,
    onDayClick,
    onPrev,
    onNext,
}: {
    viewDate: Date;
    allItems: Record<string, DayItem[]>;
    onDayClick: (date: Date) => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const start = startOfWeek(viewDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <button onClick={onPrev} className="h-9 w-9 rounded-2xl bg-muted flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="font-black text-base">
                    {format(days[0], "dd/MM")} – {format(days[6], "dd/MM/yyyy")}
                </h2>
                <button onClick={onNext} className="h-9 w-9 rounded-2xl bg-muted flex items-center justify-center">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const items = allItems[dateStr] || [];
                    const isT = isToday(day);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={cn(
                                "flex flex-col items-center p-2 rounded-2xl min-h-[90px] text-left transition-all hover:bg-muted/50 active:scale-95 border border-transparent",
                                isT && "bg-primary/5 border-primary/30"
                            )}
                        >
                            <span className="text-[9px] font-black uppercase text-muted-foreground">{WEEK_DAYS[getDay(day)]}</span>
                            <span className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center text-sm font-black mt-1",
                                isT && "bg-primary text-white shadow-md shadow-primary/30"
                            )}>
                                {format(day, "d")}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-1.5 w-full">
                                {items.slice(0, 3).map(item => (
                                    <div
                                        key={item.id}
                                        className="w-full rounded px-1 py-0.5 text-[8px] font-black truncate text-white"
                                        style={{ background: item.color }}
                                    >
                                        {item.title}
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <span className="text-[8px] font-black text-muted-foreground pl-1">+{items.length - 3}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({
    allItems,
    onItemClick,
}: {
    allItems: Record<string, DayItem[]>;
    onItemClick: (date: Date) => void;
}) {
    const now = format(new Date(), "yyyy-MM-dd");
    const sortedDates = Object.keys(allItems)
        .filter(d => d >= now)
        .sort()
        .slice(0, 60); // next 60 days with events

    if (sortedDates.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground/20" />
                <p className="font-black uppercase">Nenhum evento próximo</p>
                <p className="text-sm text-muted-foreground">Adicione um evento para começar</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedDates.map(dateStr => {
                const items = allItems[dateStr];
                const date = parseISO(dateStr);
                const isT = isToday(date);

                return (
                    <div key={dateStr} className="space-y-2">
                        <button
                            onClick={() => onItemClick(date)}
                            className={cn(
                                "flex items-center gap-3 w-full text-left",
                                isT && "sticky top-0 z-10 bg-background py-1"
                            )}
                        >
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase",
                                isT ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                            )}>
                                <CalendarDays className="h-3.5 w-3.5" />
                                {isToday(date) ? "Hoje" : format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </div>
                            <div className="flex-1 h-px bg-border" />
                        </button>

                        {items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 p-3.5 rounded-2xl border group cursor-pointer hover:shadow-md transition-all"
                                style={{ borderColor: item.color + "30", background: item.color + "06" }}
                                onClick={() => onItemClick(date)}
                            >
                                <div className="h-3 w-3 rounded-full mt-1 shrink-0" style={{ background: item.dotColor }} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm">{item.title}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                                        {item.time && <span className="mr-2">🕐 {item.time}</span>}
                                        {item.type === "event" && EVENT_TYPE_LABELS[item.data.tipo_evento as EventType]}
                                        {item.type === "payment" && "Pagamento previsto"}
                                        {item.type === "service_date" && "Serviço"}
                                        {item.type === "appointment" && "Compromisso"}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-primary" />
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Agenda() {
    const [viewMode, setViewMode] = useState<ViewMode>("mes");
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

    const { events, isLoading: eventsLoading, deleteEvent, markDone } = useCalendarEvents();
    const { appointments, isLoading: apptLoading } = useAppointments();
    const { services } = useServices();
    const { clients } = useClients();

    const isLoading = eventsLoading || apptLoading;

    const TODAY_STR = format(new Date(), "yyyy-MM-dd");

    // Build unified day items from all sources
    const allItems = useMemo(() => {
        const map: Record<string, DayItem[]> = {};

        const add = (dateStr: string, item: DayItem) => {
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(item);
        };

        // Calendar events
        events.forEach(evt => {
            const color = evt.cor || EVENT_TYPE_COLORS[evt.tipo_evento] || "#6366f1";
            const isOverdue = evt.data_inicio < TODAY_STR && evt.status !== "concluido" && evt.status !== "cancelado";
            add(evt.data_inicio, {
                id: evt.id,
                type: "event",
                title: evt.titulo,
                time: evt.hora_inicio || undefined,
                color,
                dotColor: isOverdue ? "#ef4444" : color,
                status: evt.status,
                data: evt,
            });
        });

        // Appointments (legacy)
        appointments.forEach(appt => {
            add(appt.date, {
                id: `appt-${appt.id}`,
                type: "appointment",
                title: appt.title,
                time: appt.time || undefined,
                color: "#3b82f6",
                dotColor: "#3b82f6",
                status: appt.status,
                data: appt,
            });
        });

        // Services payment dates
        services.filter(s => s.status === "pending").forEach(s => {
            const isOverdue = s.payment_date < TODAY_STR;
            add(s.payment_date, {
                id: `pay-${s.id}`,
                type: "payment",
                title: `Pagamento: ${s.client_name}`,
                color: isOverdue ? "#ef4444" : "#10b981",
                dotColor: isOverdue ? "#ef4444" : "#10b981",
                status: s.status,
                data: s,
            });
        });

        // Service execution dates
        services.forEach(s => {
            add(s.service_date, {
                id: `svc-${s.id}`,
                type: "service_date",
                title: `${s.service_type} · ${s.client_name}`,
                color: "#f59e0b",
                dotColor: "#f59e0b",
                data: s,
            });
        });

        return map;
    }, [events, appointments, services, TODAY_STR]);

    const handleDayClick = useCallback((date: Date) => setSelectedDay(date), []);

    const handleAddEvent = useCallback((dateStr?: string) => {
        setModalInitialDate(dateStr);
        setEditingEvent(undefined);
        setShowEventModal(true);
    }, []);

    const handleEditEvent = useCallback((evt: CalendarEvent) => {
        setEditingEvent(evt);
        setShowEventModal(true);
    }, []);

    const selectedDayItems = selectedDay
        ? allItems[format(selectedDay, "yyyy-MM-dd")] || []
        : [];

    const todayItems = allItems[TODAY_STR] || [];
    const upcomingCount = events.filter(e =>
        e.data_inicio >= TODAY_STR && e.status !== "concluido" && e.status !== "cancelado"
    ).length;

    if (isLoading) {
        return (
            <div className="p-5 space-y-4 animate-pulse max-w-7xl mx-auto w-full">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
            </div>
        );
    }

    const viewIcons: [ViewMode, any, string][] = [
        ["mes", Grid3x3, "Mês"],
        ["semana", Calendar, "Semana"],
        ["lista", List, "Lista"],
    ];

    // Determine currentMonth for AgendaExportButtons
    const currentMonth = format(viewDate, "yyyy-MM");

    return (
        <>
            {/* Modals */}
            {showEventModal && (
                <EventModal
                    initialDate={modalInitialDate}
                    existing={editingEvent}
                    onClose={() => { setShowEventModal(false); setEditingEvent(undefined); }}
                />
            )}
            {selectedDay && (
                <DayPanel
                    date={selectedDay}
                    items={selectedDayItems}
                    onAddEvent={handleAddEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={async (id) => { await deleteEvent(id); }}
                    onMarkDone={async (id) => { await markDone(id); }}
                    onClose={() => setSelectedDay(null)}
                />
            )}

            <div className="flex flex-col gap-5 p-5 pb-28 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Agenda</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {upcomingCount} evento{upcomingCount !== 1 ? "s" : ""} próximo{upcomingCount !== 1 ? "s" : ""}
                            {todayItems.length > 0 && ` · ${todayItems.length} hoje`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AgendaExportButtons currentDate={viewDate} />
                        <Button
                            onClick={() => handleAddEvent(TODAY_STR)}
                            className="h-11 px-5 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Novo
                        </Button>
                    </div>
                </header>

                {/* Today summary pills */}
                {todayItems.length > 0 && (
                    <button
                        onClick={() => setSelectedDay(new Date())}
                        className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl hover:border-primary/40 transition-colors text-left w-full"
                    >
                        <div className="h-9 w-9 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
                            <CalendarDays className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-primary">Você tem {todayItems.length} item{todayItems.length > 1 ? "s" : ""} hoje</p>
                            <p className="text-[10px] font-bold text-muted-foreground">
                                {todayItems.slice(0, 2).map(i => i.title).join(" · ")}
                                {todayItems.length > 2 && ` +${todayItems.length - 2}`}
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-primary/40 shrink-0" />
                    </button>
                )}

                {/* View switcher */}
                <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl">
                    {viewIcons.map(([mode, Icon, label]) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all",
                                viewMode === mode
                                    ? "bg-primary text-white shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Calendar views */}
                {viewMode === "mes" && (
                    <MonthView
                        viewDate={viewDate}
                        allItems={allItems}
                        onDayClick={handleDayClick}
                        onPrev={() => setViewDate(v => subMonths(v, 1))}
                        onNext={() => setViewDate(v => addMonths(v, 1))}
                    />
                )}

                {viewMode === "semana" && (
                    <WeekView
                        viewDate={viewDate}
                        allItems={allItems}
                        onDayClick={handleDayClick}
                        onPrev={() => setViewDate(v => subWeeks(v, 1))}
                        onNext={() => setViewDate(v => addWeeks(v, 1))}
                    />
                )}

                {viewMode === "lista" && (
                    <ListView
                        allItems={allItems}
                        onItemClick={handleDayClick}
                    />
                )}
            </div>
        </>
    );
}
