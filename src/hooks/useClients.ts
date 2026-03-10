import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

// Cast to any to bypass missing Supabase type gen for 'clients' table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type ClientType = "pf" | "pj";

export interface Client {
    id: string;
    user_id: string;
    name: string;
    type: ClientType;
    document?: string | null;
    email?: string | null;
    phone?: string | null;
    phone_secondary?: string | null;
    street?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    birthday?: string | null;
    notes?: string | null;
    created_at: string;
}

export type CreateClient = Omit<Client, "id" | "user_id" | "created_at">;
export type UpdateClient = Partial<CreateClient>;

export function useClients() {
    const queryClient = useQueryClient();
    const { isMaster, viewingUserId } = useAdmin();

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ["clients", viewingUserId],
        queryFn: async () => {
            let query = db
                .from("clients")
                .select("*")
                .order("name", { ascending: true });

            if (isMaster && viewingUserId) {
                query = query.eq("user_id", viewingUserId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as Client[];
        },
    });

    const createClient = useMutation({
        mutationFn: async (client: CreateClient) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const targetUserId = (isMaster && viewingUserId) ? viewingUserId : user.id;

            const { data, error } = await db
                .from("clients")
                .insert({ ...client, user_id: targetUserId })
                .select()
                .single();
            if (error) throw error;
            return data as Client;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente cadastrado!", { description: "O cliente foi adicionado ao sistema." });
        },
        onError: (err: any) => {
            console.error("Erro ao cadastrar cliente:", err);
            toast.error("Erro ao cadastrar cliente.", { description: err?.message || "Tente novamente." });
        },
    });

    const updateClient = useMutation({
        mutationFn: async ({ id, ...updates }: UpdateClient & { id: string }) => {
            const { data, error } = await db
                .from("clients")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as Client;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente atualizado!");
        },
        onError: (err: any) => toast.error("Erro ao atualizar cliente.", { description: err?.message }),
    });

    const deleteClient = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await db.from("clients").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente removido.");
        },
        onError: (err: any) => toast.error("Erro ao remover cliente.", { description: err?.message }),
    });

    return {
        clients,
        isLoading,
        createClient: createClient.mutateAsync,
        updateClient: updateClient.mutateAsync,
        deleteClient: deleteClient.mutateAsync,
    };
}

export function useClient(id: string | undefined) {
    return useQuery({
        queryKey: ["clients", id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await db
                .from("clients")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as Client;
        },
        enabled: !!id,
    });
}
