import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .order("name", { ascending: true });
            if (error) throw error;
            return (data || []) as Client[];
        },
    });

    const createClient = useMutation({
        mutationFn: async (client: CreateClient) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("clients")
                .insert({ ...client, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data as Client;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente cadastrado!");
        },
        onError: () => toast.error("Erro ao cadastrar cliente."),
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
        onError: () => toast.error("Erro ao atualizar cliente."),
    });

    const deleteClient = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("clients").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente removido.");
        },
        onError: () => toast.error("Erro ao remover cliente."),
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
