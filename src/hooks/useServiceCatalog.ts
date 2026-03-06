import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CatalogItem {
    id: string;
    user_id: string;
    name: string;
    description?: string | null;
    default_price: number;
    default_cost: number;
    category?: string | null;
    unit: string;
    created_at: string;
}

export type CreateCatalogItem = Omit<CatalogItem, "id" | "user_id" | "created_at">;

export function useServiceCatalog() {
    const queryClient = useQueryClient();

    const { data: catalog = [], isLoading } = useQuery({
        queryKey: ["service_catalog"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("service_catalog")
                .select("*")
                .order("name", { ascending: true });
            if (error) throw error;
            return (data || []) as CatalogItem[];
        },
    });

    const addItem = useMutation({
        mutationFn: async (item: CreateCatalogItem) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("service_catalog")
                .insert({ ...item, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data as CatalogItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["service_catalog"] });
            toast.success("Item adicionado ao catálogo!");
        },
        onError: () => toast.error("Erro ao adicionar item."),
    });

    const updateItem = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<CatalogItem> & { id: string }) => {
            const { data, error } = await supabase
                .from("service_catalog")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as CatalogItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["service_catalog"] });
            toast.success("Item atualizado!");
        },
        onError: () => toast.error("Erro ao atualizar item."),
    });

    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("service_catalog").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["service_catalog"] });
            toast.success("Item removido.");
        },
        onError: () => toast.error("Erro ao remover item."),
    });

    return {
        catalog,
        isLoading,
        addItem: addItem.mutateAsync,
        updateItem: updateItem.mutateAsync,
        deleteItem: deleteItem.mutateAsync,
    };
}
