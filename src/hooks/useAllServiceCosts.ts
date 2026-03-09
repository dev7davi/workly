import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface ServiceCost {
    id: string;
    service_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    paid_by: "client" | "provider";
    category: string;
    notes?: string | null;
    created_at: string;
    service?: {
        id: string;
        client_name: string;
        service_type: string;
        service_date: string;
        status: string;
        value: string;
    };
}

export function useAllServiceCosts() {
    const queryClient = useQueryClient();

    const { data: costs = [], isLoading } = useQuery({
        queryKey: ["all_service_costs"],
        queryFn: async () => {
            // Fetching costs and joining basic service info manually/via native join
            // Supabase type for foreign keys sometimes requires verbose syntax.
            const { data, error } = await db
                .from("service_costs")
                .select(`
          *,
          services (
            id, client_name, service_type, service_date, status, value
          )
        `);

            if (error) throw error;
            return (data || []).map((c: any) => ({
                ...c,
                service: c.services
            })) as ServiceCost[];
        },
    });

    return {
        costs,
        isLoading
    };
}
