import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";



export type ClientType = "pf" | "pj";

export interface Client {
    id: string;
    user_id: string;
    name: string;
    type: ClientType;
    phone?: string;
    phone_secondary?: string;
    document?: string;
    email?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
    birthday?: string;
    created_from_service?: boolean;
    profile_completed?: boolean;
    registration_origin?: string;
    created_at: string;
}

export const normalizeName = (name: string) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/\s+/g, " ");
};

export type CreateClient = Omit<Client, "id" | "user_id" | "created_at"> & {
    name: string;
    type: ClientType;
    user_id?: string;
    created_from_service?: boolean;
    profile_completed?: boolean;
    registration_origin?: string;
};
export type UpdateClient = Partial<CreateClient>;

export function useClients() {
    const queryClient = useQueryClient();
    const { isMaster, viewingUserId } = useAdmin();

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ["clients", viewingUserId],
        queryFn: async () => {
            let query = supabase
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

            const { data, error } = await supabase
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
            const { data, error } = await supabase
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
            try {
                if (!id) throw new Error("ID do cliente inválido");

                const { error, count } = await supabase
                    .from("clients")
                    .delete()
                    .eq("id", id);

                if (error) {
                    console.error("[DELETE_CLIENT_ERROR]", error);
                    throw new Error(`Erro ao excluir: ${error.message}`);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
                console.error("[DELETE_CLIENT]", errorMessage);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente removido com sucesso!");
        },
        onError: (err: any) => {
            const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
            toast.error("Erro ao remover cliente.", { description: errorMessage });
        },
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
            const { data, error } = await supabase
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
