import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type AppointmentStatus = "scheduled" | "done" | "cancelled";

export interface Appointment {
    id: string;
    user_id: string;
    client_id?: string | null;
    service_id?: string | null;
    title: string;
    description?: string | null;
    date: string;
    time?: string | null;
    location?: string | null;
    status: AppointmentStatus;
    reminder_sent: boolean;
    created_at: string;
}

export type CreateAppointment = Omit<Appointment, "id" | "user_id" | "created_at" | "reminder_sent">;
export type UpdateAppointment = Partial<CreateAppointment> & { id: string };

export function useAppointments() {
    const queryClient = useQueryClient();

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ["appointments"],
        queryFn: async () => {
            const { data, error } = await db
                .from("appointments")
                .select("*")
                .order("date", { ascending: true });
            if (error) throw error;
            return (data || []) as Appointment[];
        },
    });

    const createAppointment = useMutation({
        mutationFn: async (appt: CreateAppointment) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const { data, error } = await db
                .from("appointments")
                .insert({ ...appt, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data as Appointment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Compromisso criado!");
        },
        onError: () => toast.error("Erro ao criar compromisso."),
    });

    const updateAppointment = useMutation({
        mutationFn: async ({ id, ...updates }: UpdateAppointment) => {
            const { data, error } = await db
                .from("appointments")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as Appointment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Compromisso atualizado!");
        },
        onError: () => toast.error("Erro ao atualizar."),
    });

    const deleteAppointment = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await db.from("appointments").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Compromisso removido.");
        },
        onError: () => toast.error("Erro ao remover."),
    });

    const markDone = async (id: string) => {
        await updateAppointment.mutateAsync({ id, status: "done" });
    };

    return {
        appointments,
        isLoading,
        createAppointment: createAppointment.mutateAsync,
        updateAppointment: updateAppointment.mutateAsync,
        deleteAppointment: deleteAppointment.mutateAsync,
        markDone,
    };
}
