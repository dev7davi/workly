import { useServices } from "./useServices";
import { useProfile } from "./useProfile";
import { useMemo } from "react";

export type PlanType = "free" | "pro" | "plus";

export const PLAN_LIMITS = {
    free: {
        name: "Free",
        maxServices: 5,
        features: [
            "Até 5 serviços",
            "Dashboard básico",
            "Comprovante com marca d'água",
            "Cadastro de clientes",
        ],
        price: 0,
    },
    pro: {
        name: "Pro",
        maxServices: Infinity,
        features: [
            "Serviços ilimitados",
            "PDF sem marca d'água",
            "Exportação CSV",
            "Histórico completo por cliente",
            "Relatórios avançados",
            "Lembretes de cobrança por e-mail",
        ],
        price: 19.9,
        priceYear: 179,
    },
    plus: {
        name: "Plus",
        maxServices: Infinity,
        features: [
            "Tudo do Pro",
            "Logo personalizada no comprovante",
            "QR Code PIX automático",
            "Catálogo de serviços com preços fixos",
            "Dashboard de previsão avançado",
            "Múltiplos usuários (até 3)",
        ],
        price: 39.9,
        priceYear: 349,
    },
} as const;

export function usePlan() {
    const { data: profile } = useProfile();
    const { services } = useServices();

    const plan: PlanType = (profile?.plan as PlanType) || "free";
    const limits = PLAN_LIMITS[plan];
    const serviceCount = services.length;
    const canAddService = serviceCount < limits.maxServices;
    const isAtLimit = serviceCount >= limits.maxServices && limits.maxServices !== Infinity;
    const isPro = plan === "pro" || plan === "plus";
    const isPlus = plan === "plus";

    return {
        plan,
        limits,
        serviceCount,
        canAddService,
        isAtLimit,
        isPro,
        isPlus,
    };
}
