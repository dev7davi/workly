import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type EventStatus =
    | "agendado" | "confirmado" | "em_andamento"
    | "concluido" | "cancelado" | "adiado" | "atrasado";

export type EventPriority = "baixa" | "normal" | "alta" | "urgente";

export type EventType =
    | "servico_agendado" | "visita_tecnica" | "retorno"
    | "cobranca_agendada" | "vencimento_pagamento"
    | "compromisso_pessoal" | "compromisso_profissional"
    | "lembrete" | "entrega" | "manutencao" | "revisao"
    | "prazo_orcamento" | "prazo_contrato" | "follow_up" | "compromisso";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
    servico_agendado: "Serviço Agendado",
    visita_tecnica: "Visita Técnica",
    retorno: "Retorno",
    cobranca_agendada: "Cobrança",
    vencimento_pagamento: "Vencimento",
    compromisso_pessoal: "Pessoal",
    compromisso_profissional: "Profissional",
    lembrete: "Lembrete",
    entrega: "Entrega",
    manutencao: "Manutenção",
    revisao: "Revisão",
    prazo_orcamento: "Prazo Orçamento",
    prazo_contrato: "Prazo Contrato",
    follow_up: "Follow-up",
    compromisso: "Compromisso",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    servico_agendado: "#6366f1",
    visita_tecnica: "#3b82f6",
    retorno: "#8b5cf6",
    cobranca_agendada: "#f59e0b",
    vencimento_pagamento: "#ef4444",
    compromisso_pessoal: "#10b981",
    compromisso_profissional: "#0ea5e9",
    lembrete: "#a855f7",
    entrega: "#f97316",
    manutencao: "#64748b",
    revisao: "#06b6d4",
    prazo_orcamento: "#eab308",
    prazo_contrato: "#dc2626",
    follow_up: "#ec4899",
    compromisso: "#6366f1",
};

export interface CalendarEvent {
    id: string;
    user_id: string;
    tipo_evento: EventType;
    titulo: string;
    descricao?: string | null;
    data_inicio: string;
    hora_inicio?: string | null;
    data_fim?: string | null;
    hora_fim?: string | null;
    dia_inteiro: boolean;
    cliente_id?: string | null;
    servico_id?: string | null;
    financeiro_id?: string | null;
    prioridade: EventPriority;
    status: EventStatus;
    cor: string;
    lembrete_ativo: boolean;
    minutos_antes_lembrete: number;
    origem: "manual" | "servico" | "cobranca" | "sistema";
    endereco?: string | null;
    observacoes?: string | null;
    created_at: string;
    updated_at: string;
}

export type CreateCalendarEvent = Omit<CalendarEvent, "id" | "user_id" | "created_at" | "updated_at">;
export type UpdateCalendarEvent = Partial<CreateCalendarEvent> & { id: string };

export function useCalendarEvents() {
    const queryClient = useQueryClient();

    const { data: events = [], isLoading } = useQuery({
        queryKey: ["calendar_events"],
        queryFn: async () => {
            const { data, error } = await db
                .from("calendar_events")
                .select("*")
                .order("data_inicio", { ascending: true });
            if (error) throw error;
            return (data || []) as CalendarEvent[];
        },
    });

    const createEvent = useMutation({
        mutationFn: async (evt: CreateCalendarEvent) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Não autenticado");
            const { data, error } = await db
                .from("calendar_events")
                .insert({ ...evt, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data as CalendarEvent;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
            toast.success("Evento criado!");
        },
        onError: (e: any) => toast.error("Erro ao criar evento.", { description: e?.message }),
    });

    const updateEvent = useMutation({
        mutationFn: async ({ id, ...updates }: UpdateCalendarEvent) => {
            const { data, error } = await db
                .from("calendar_events")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as CalendarEvent;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
            toast.success("Evento atualizado!");
        },
        onError: (e: any) => toast.error("Erro ao atualizar.", { description: e?.message }),
    });

    const deleteEvent = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await db.from("calendar_events").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
            toast.success("Evento removido.");
        },
        onError: (e: any) => toast.error("Erro ao remover.", { description: e?.message }),
    });

    const markDone = async (id: string) => {
        await updateEvent.mutateAsync({ id, status: "concluido" });
    };

    // Get events for a specific date
    const eventsForDate = (dateStr: string) =>
        events.filter(e => e.data_inicio === dateStr);

    // Get events for a date range
    const eventsForRange = (from: string, to: string) =>
        events.filter(e => e.data_inicio >= from && e.data_inicio <= to);

    return {
        events,
        isLoading,
        createEvent: createEvent.mutateAsync,
        updateEvent: updateEvent.mutateAsync,
        deleteEvent: deleteEvent.mutateAsync,
        markDone,
        eventsForDate,
        eventsForRange,
    };
}
