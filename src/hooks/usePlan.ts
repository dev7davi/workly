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
        priceAnnual: "Grátis",
        maxServices: 5,
        maxClients: 5,
        color: "#94a3b8",
        features: [
            "Até 5 serviços cadastrados",
            "Até 5 clientes",
            "Dashboard financeiro básico",
            "Comprovante com marca Workly",
        ],
    },
    start: {
        name: "start",
        label: "Start",
        price: "R$14,90/mês",
        priceAnnual: "R$149,90/ano",
        maxServices: null,
        maxClients: null,
        color: "#6366f1",
        features: [
            "Clientes ilimitados",
            "Serviços ilimitados",
            "Financeiro completo",
            "Comprovante e recibo",
            "Catálogo de serviços",
            "Histórico completo por cliente",
        ],
    },
    pro: {
        name: "pro",
        label: "Pro",
        price: "R$27,90/mês",
        priceAnnual: "R$279,90/ano",
        maxServices: null,
        maxClients: null,
        color: "#10b981",
        features: [
            "Tudo do Start",
            "Custos e despesas por serviço",
            "Lucro real por serviço",
            "Gráficos e relatórios",
            "Documentos personalizados",
            "Logo e filtros avançados",
            "Lembretes de cobrança",
        ],
    },
    pro_plus: {
        name: "pro_plus",
        label: "Pro+",
        price: "R$44,90/mês",
        priceAnnual: "R$449,90/ano",
        maxServices: null,
        maxClients: null,
        color: "#f59e0b",
        features: [
            "Tudo do Pro",
            "Ordem de serviço",
            "Orçamentos",
            "QR Code PIX para cobrança",
            "Relatórios avançados",
            "Suporte prioritário",
        ],
    },
};

// For now, all users are on Free plan. Stripe integration will update this.
export function usePlan() {
    const { services } = useServices();
    const [plan] = useState<Plan>("free");

    const planConfig = PLANS[plan];
    const serviceCount = services.length;
    const canAddService =
        planConfig.maxServices === null || serviceCount < planConfig.maxServices;
    const isAtLimit =
        planConfig.maxServices !== null && serviceCount >= planConfig.maxServices;
    const isStart = plan === "start";
    const isPro = plan === "pro";
    const isProPlus = plan === "pro_plus";
    const isPaid = plan !== "free";

    return {
        plan,
        planConfig,
        limits: {
            maxServices: planConfig.maxServices ?? Infinity,
            maxClients: planConfig.maxClients ?? Infinity,
        },
        serviceCount,
        canAddService,
        isAtLimit,
        isStart,
        isPro,
        isProPlus,
        isPaid,
    };
}
