import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

export type ServiceStatus = "pending" | "paid" | "cancelled";

export interface Service {
  id: string;
  user_id: string;
  client_id?: string;
  client_name: string;
  service_type: string;
  value: number;
  service_date: string;
  payment_date: string;
  status: ServiceStatus;
  notes?: string;
  versao_atual?: number;
  data_criacao?: string;
  criado_por?: string;
  receipt_generated?: boolean;
}

export interface ServiceAuditLog {
  id: string;
  service_id: string;
  usuario_id: string;
  acao: string;
  timestamp: string;
  campos_afetados: any[];
  snapshot_anterior: any;
  snapshot_posterior: any;
  motivo?: string;
  versao: number;
  profiles?: {
    name: string;
    email: string;
  };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMaster, viewingUserId } = useAdmin();

  async function fetchServices() {
    setLoading(true);

    let query = supabase
      .from("services")
      .select("*")
      .order("payment_date", { ascending: true });

    if (isMaster && viewingUserId) {
      query = query.eq("user_id", viewingUserId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setServices(data);
    }

    setLoading(false);
  }

  async function createService(payload: Omit<Service, "id" | "user_id">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const targetUserId = (isMaster && viewingUserId) ? viewingUserId : user.id;

    await supabase.from("services").insert({
      ...payload,
      user_id: targetUserId,
    });

    fetchServices();
  }

  async function updateService(id: string, payload: Partial<Service>) {
    await supabase.from("services").update(payload).eq("id", id);
    fetchServices();
  }

  async function deleteService(id: string) {
    try {
      if (!id) throw new Error("ID do serviço inválido");

      const { error, count } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[DELETE_SERVICE_ERROR]", error);
        throw new Error(`Erro ao excluir: ${error.message}`);
      }

      toast.success("Serviço excluído com sucesso!");
      fetchServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("[DELETE_SERVICE]", errorMessage);
      toast.error(`Falha ao excluir: ${errorMessage}`);
    }
  }


  async function fetchServiceHistory(id: string): Promise<ServiceAuditLog[]> {
    const { data, error } = await supabase
      .from("services_audit")
      .select(`
        *,
        profiles:usuario_id (
          name,
          email
        )
      `)
      .eq("service_id", id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }

    return data || [];
  }

  async function restoreVersion(serviceId: string, versionData: any) {
    const { id, user_id, versao_atual, data_criacao, criado_por, updated_at, ...cleanData } = versionData;
    
    const { error } = await supabase
      .from("services")
      .update(cleanData)
      .eq("id", serviceId);

    if (error) {
      throw error;
    }
    
    fetchServices();
  }

  useEffect(() => {
    fetchServices();
  }, [viewingUserId]); // Refetch if admin changes viewing user

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    fetchServiceHistory,
    restoreVersion,
  };
}
