import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ServiceStatus = "pending" | "paid" | "cancelled";

export interface Service {
  id: string;
  user_id: string;
  client_name: string;
  service_type: string;
  value: number;
  service_date: string;
  payment_date: string;
  status: ServiceStatus;
  notes?: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchServices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("payment_date", { ascending: true });

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

    await supabase.from("services").insert({
      ...payload,
      user_id: user.id,
    });

    fetchServices();
  }

  async function updateService(id: string, payload: Partial<Service>) {
    await supabase.from("services").update(payload).eq("id", id);
    fetchServices();
  }

  async function deleteService(id: string) {
    await supabase.from("services").delete().eq("id", id);
    fetchServices();
  }

  async function duplicateService(service: Service) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, user_id, ...rest } = service;
    await supabase.from("services").insert({
      ...rest,
      user_id: user.id,
      status: "pending" as ServiceStatus,
      service_date: new Date().toISOString().slice(0, 10),
      payment_date: new Date().toISOString().slice(0, 10),
    });
    fetchServices();
  }

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    duplicateService,
  };
}
