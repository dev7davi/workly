import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface MaterialItem {
    id: string;
    user_id: string;
    name: string;
    description?: string | null;
    unit: string;
    default_cost: number;
    default_price: number;
    category?: string | null;
    created_at: string;
}

export type CreateMaterialItem = Omit<MaterialItem, "id" | "user_id" | "created_at">;

export function useMaterialCatalog() {
    const queryClient = useQueryClient();

    const { data: materials = [], isLoading } = useQuery({
        queryKey: ["material_catalog"],
        queryFn: async () => {
            const { data, error } = await db
                .from("material_catalog")
                .select("*")
                .order("name", { ascending: true });
            if (error) throw error;
            return (data || []) as MaterialItem[];
        },
    });

    const addMaterial = useMutation({
        mutationFn: async (item: CreateMaterialItem) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const { data, error } = await db
                .from("material_catalog")
                .insert({ ...item, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data as MaterialItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material_catalog"] });
            toast.success("Material adicionado!");
        },
        onError: () => toast.error("Erro ao adicionar material."),
    });

    const updateMaterial = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<MaterialItem> & { id: string }) => {
            const { data, error } = await db
                .from("material_catalog")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as MaterialItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material_catalog"] });
            toast.success("Material atualizado!");
        },
        onError: () => toast.error("Erro ao atualizar material."),
    });

    const deleteMaterial = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await db.from("material_catalog").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material_catalog"] });
            toast.success("Material removido.");
        },
        onError: () => toast.error("Erro ao remover material."),
    });

    return {
        materials,
        isLoading,
        addMaterial: addMaterial.mutateAsync,
        updateMaterial: updateMaterial.mutateAsync,
        deleteMaterial: deleteMaterial.mutateAsync,
    };
}
