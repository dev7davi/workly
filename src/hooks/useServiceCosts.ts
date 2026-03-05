import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CostCategory = "material" | "ferramenta" | "consumivel" | "deslocamento" | "peca" | "outro";
export type PaidBy = "client" | "provider";

export interface ServiceCost {
    id: string;
    service_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    paid_by: PaidBy;
    category: CostCategory;
    notes?: string | null;
    created_at: string;
}

export interface CreateServiceCost {
    service_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    paid_by: PaidBy;
    category: CostCategory;
    notes?: string;
}

export const COST_CATEGORIES: Record<CostCategory, string> = {
    material: "Material",
    ferramenta: "Ferramenta",
    consumivel: "Consumível",
    deslocamento: "Deslocamento",
    peca: "Peça",
    outro: "Outro",
};

export const CATEGORY_EMOJIS: Record<CostCategory, string> = {
    material: "🧱",
    ferramenta: "🔧",
    consumivel: "🧴",
    deslocamento: "🚗",
    peca: "⚙️",
    outro: "📦",
};

// Fetch costs for a service
export function useServiceCosts(serviceId: string | undefined) {
    return useQuery({
        queryKey: ["service_costs", serviceId],
        queryFn: async () => {
            if (!serviceId) return [];
            const { data, error } = await supabase
                .from("service_costs")
                .select("*")
                .eq("service_id", serviceId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return (data || []) as ServiceCost[];
        },
        enabled: !!serviceId,
    });
}

// Add a cost
export function useAddServiceCost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (cost: CreateServiceCost) => {
            const { data, error } = await supabase
                .from("service_costs")
                .insert(cost)
                .select()
                .single();
            if (error) throw error;
            return data as ServiceCost;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["service_costs", data.service_id] });
            toast.success("Custo adicionado!");
        },
        onError: () => {
            toast.error("Erro ao adicionar custo.");
        },
    });
}

// Update a cost
export function useUpdateServiceCost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<ServiceCost> & { id: string }) => {
            const { data, error } = await supabase
                .from("service_costs")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as ServiceCost;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["service_costs", data.service_id] });
            toast.success("Custo atualizado!");
        },
        onError: () => {
            toast.error("Erro ao atualizar custo.");
        },
    });
}

// Delete a cost
export function useDeleteServiceCost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ costId, serviceId }: { costId: string; serviceId: string }) => {
            const { error } = await supabase
                .from("service_costs")
                .delete()
                .eq("id", costId);
            if (error) throw error;
            return serviceId;
        },
        onSuccess: (serviceId) => {
            queryClient.invalidateQueries({ queryKey: ["service_costs", serviceId] });
            toast.success("Custo removido.");
        },
        onError: () => {
            toast.error("Erro ao remover custo.");
        },
    });
}

// Utility: calculate totals from a list of costs
export function calcCostTotals(costs: ServiceCost[]) {
    const totalProviderCost = costs
        .filter(c => c.paid_by === "provider")
        .reduce((acc, c) => acc + c.total_price, 0);
    const totalClientCost = costs
        .filter(c => c.paid_by === "client")
        .reduce((acc, c) => acc + c.total_price, 0);
    const totalCost = costs.reduce((acc, c) => acc + c.total_price, 0);
    return { totalProviderCost, totalClientCost, totalCost };
}
