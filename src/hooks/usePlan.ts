import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";

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
        maxServices: 30,
        maxClients: 20,
        color: "#94a3b8",
        features: [
            "Até 20 clientes ativos",
            "Até 30 serviços cadastrados",
            "Comprovante Simples",
            "Agenda básica",
            "Resumo financeiro",
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
            "Até 100 clientes e 200 serviços",
            "Ordem de Serviço (PDF) c/ Logo Workly",
            "Catálogo de Serviços",
            "Dashboard D.R.E. Financeiro",
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
            "Clientes e Serviços Ilimitados",
            "White-Label (Sua Logomarca na O.S.)",
            "Anexos e Fotos nos Serviços",
            "Dashboards e Relatórios Avançados",
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
            "Inteligência IA (Leitura de texto manual)",
            "Gestão livre de Custos Extras",
            "Automação e Suporte VIP",
        ],
    },
};

// For now, testing logic assumes Free plan. In a real app, you fetch this from auth/profile.
export function usePlan() {
    const { services } = useServices();

    // Default testing plan, change to "pro" or "start" during dev if needed
    const [plan] = useState<Plan>("free");

    const planConfig = PLANS[plan];
    const serviceCount = services.length;

    const canAddService = planConfig.maxServices === null || serviceCount < planConfig.maxServices;
    const isAtServiceLimit = planConfig.maxServices !== null && serviceCount >= planConfig.maxServices;

    // Feature gates based on plan hierarchy
    const planLevel = ["free", "start", "pro", "pro_plus"].indexOf(plan);

    const canUseCatalog = planLevel >= 1; // start and above
    const canUseOS = planLevel >= 1; // start and above
    const canUseAdvancedDRE = planLevel >= 1; // start and above

    const canUseWhiteLabel = planLevel >= 2; // pro and above
    const canUseAdvancedAnalytics = planLevel >= 2; // pro and above

    const canUseOCR = planLevel >= 3; // pro_plus only
    const canUseFreeCosts = planLevel >= 3; // pro_plus only

    return {
        plan,
        planConfig,
        limits: {
            maxServices: planConfig.maxServices ?? Infinity,
            maxClients: planConfig.maxClients ?? Infinity,
        },
        serviceCount,
        canAddService,
        isAtServiceLimit,
        canUseCatalog,
        canUseOS,
        canUseAdvancedDRE,
        canUseWhiteLabel,
        canUseAdvancedAnalytics,
        canUseOCR,
        canUseFreeCosts,
        isPaid: plan !== "free",
    };
}
