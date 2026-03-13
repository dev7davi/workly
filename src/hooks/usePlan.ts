import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";

export type Plan = "free" | "start" | "pro" | "pro_plus";

export interface PlanConfig {
    name: string;
    label: string;
    price: string;
    priceAnnual: string;
    maxServices: number | null; // null = unlimited
    maxClients: number | null;
    features: string[];
    color: string;
}

export const PLANS: Record<Plan, PlanConfig> = {
    free: {
        name: "free",
        label: "Free",
        price: "Grátis",
        priceAnnual: "Iniciantes / Teste",
        maxServices: 20, // Por mês
        maxClients: 10,
        color: "#94a3b8",
        features: [
            "Até 10 clientes ativos",
            "Até 20 serviços p/ mês",
            "Comprovante Simples",
            "Agenda básica",
            "Resumo financeiro",
            "PDF com logo Workly",
        ],
    },
    start: {
        name: "start",
        label: "Start",
        price: "R$ 19,90/mês",
        priceAnnual: "Autônomos em Crescimento",
        maxServices: 200,
        maxClients: 100,
        color: "#6366f1",
        features: [
            "Até 100 clientes",
            "Até 200 serviços",
            "O.S. PDF c/ Logo Workly",
            "Catálogo de Serviços",
            "Dashboard DRE",
        ],
    },
    pro: {
        name: "pro",
        label: "Pro",
        price: "R$ 39,90/mês",
        priceAnnual: "Pequenos Negócios",
        maxServices: null,
        maxClients: null,
        color: "#10b981",
        features: [
            "Cli. e Serv. Ilimitados",
            "White Label (Logo Própria)",
            "Anexos e Fotos",
            "Relatórios Avançados",
        ],
    },
    pro_plus: {
        name: "pro_plus",
        label: "Pro+",
        price: "R$ 69,90/mês",
        priceAnnual: "Gestão Avançada",
        maxServices: null,
        maxClients: null,
        color: "#f59e0b",
        features: [
            "Tudo do Plano Pro",
            "Inteligência IA",
            "Gestão livre de Custos",
            "Suporte VIP",
        ],
    },
};

// For now, testing logic assumes Free plan. In a real app, you fetch this from auth/profile.
export function usePlan() {
    const { services } = useServices();
    const { user } = useAuth();
    const { data: profile } = useProfile();
    const isMaster = user?.email === "service_master@workly.com" || user?.email === "dev7.davi@gmail.com";

    // Pega o plano real do perfil ou "free" como fallback
    const plan = profile?.plan || "free";

    // Se for master, ele tem o plano máximo
    const effectivePlan = isMaster ? "pro_plus" : plan;
    const planConfig = PLANS[effectivePlan];
    
    // Contagens reais do banco de dados (via profile) ou fallback para contagem local
    const totalServices = profile?.services_count ?? services.length;
    const servicesThisMonth = profile?.services_created_this_month ?? 0;
    const totalClients = profile?.clients_count ?? 0;

    // Verificação de limites
    const canAddService = isMaster || planConfig.maxServices === null || (
        // Se for Free, limite é mensal. Se for Start, limite é total.
        plan === "free" ? servicesThisMonth < planConfig.maxServices : totalServices < planConfig.maxServices
    );

    const canAddClient = isMaster || planConfig.maxClients === null || totalClients < planConfig.maxClients;

    const isAtServiceLimit = !canAddService;
    const isAtClientLimit = !canAddClient;

    // Feature gates baseados no nível real ou se for master
    const planLevel = isMaster ? 3 : ["free", "start", "pro", "pro_plus"].indexOf(plan);

    const canUseCatalog = planLevel >= 1;
    const canUseOS = planLevel >= 1;
    const canUseAdvancedDRE = planLevel >= 1;

    const canUseWhiteLabel = planLevel >= 2;
    const canUseAdvancedAnalytics = planLevel >= 2;

    const canUseOCR = planLevel >= 3;
    const canUseFreeCosts = planLevel >= 3;

    return {
        plan: effectivePlan,
        planConfig,
        isMaster,
        limits: {
            maxServices: planConfig.maxServices ?? Infinity,
            maxClients: planConfig.maxClients ?? Infinity,
        },
        usage: {
            servicesTotal: totalServices,
            servicesMonth: servicesThisMonth,
            clientsTotal: totalClients,
        },
        canAddService,
        canAddClient,
        isAtServiceLimit,
        isAtClientLimit,
        canUseCatalog,
        canUseOS,
        canUseAdvancedDRE,
        canUseWhiteLabel,
        canUseAdvancedAnalytics,
        canUseOCR,
        canUseFreeCosts,
        isPaid: effectivePlan !== "free",
    };
}
