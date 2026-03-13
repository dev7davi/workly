import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type UserPlan = "free" | "start" | "pro" | "pro_plus";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  plan: UserPlan;
  clients_count: number;
  services_count: number;
  services_created_this_month: number;
  last_reset_date: string;
  company_name: string | null;
  company_logo_url: string | null;
  company_primary_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  document?: string;
  company_name?: string;
  company_logo_url?: string;
  company_primary_color?: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return updatedProfile as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message,
      });
    },
  });
}
