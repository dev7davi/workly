import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown, Zap, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/hooks/usePlan";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const plans = [
    {
        key: "free" as const,
        icon: Star,
        iconColor: "text-slate-400",
        iconBg: "bg-slate-400/10",
        badge: null,
        priceLabel: "Gratuito",
        priceSub: "Para sempre",
        cta: "Seu plano atual",
        ctaDisabled: true,
        gradient: "from-slate-700 to-slate-800",
        accentBorder: "border-slate-500/30",
    },
    {
        key: "pro" as const,
        icon: Zap,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        badge: "Mais Popular",
        badgeColor: "bg-primary text-white",
        priceLabel: "R$19,90",
        priceSub: "por mês (ou R$179/ano)",
        cta: "Assinar Pro",
        ctaDisabled: false,
        gradient: "from-primary to-blue-600",
        accentBorder: "border-primary/30",
        highlight: true,
        stripeLink: "#", // Replace with Stripe payment link
    },
    {
        key: "plus" as const,
        icon: Crown,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-500/10",
        badge: "Completo",
        badgeColor: "bg-amber-500 text-white",
        priceLabel: "R$39,90",
        priceSub: "por mês (ou R$349/ano)",
        cta: "Assinar Plus",
        ctaDisabled: false,
        gradient: "from-amber-500 to-orange-600",
        accentBorder: "border-amber-500/30",
        stripeLink: "#", // Replace with Stripe payment link
    },
];

export default function Plans() {
    const { plan: currentPlan } = usePlan();

    return (
        <div className="flex flex-col gap-8 p-6 pb-24 max-w-2xl mx-auto">
            <header className="flex items-center gap-4">
                <Link to="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Planos</h1>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Escolha o plano ideal para o seu negócio
                    </p>
                </div>
            </header>

            {/* Value proposition */}
            <div className="text-center space-y-2">
                <p className="text-sm font-bold text-muted-foreground">
                    🚀 Junte-se a centenas de autônomos que organizam seu negócio com o Workly
                </p>
            </div>

            {/* Plans Grid */}
            <div className="flex flex-col gap-6">
                {plans.map((plan) => {
                    const limit = PLAN_LIMITS[plan.key];
                    const isCurrentPlan = currentPlan === plan.key;
                    const PlanIcon = plan.icon;

                    return (
                        <Card
                            key={plan.key}
                            className={cn(
                                "relative overflow-hidden border-2 rounded-3xl transition-all duration-300",
                                plan.highlight
                                    ? "border-primary shadow-2xl shadow-primary/20 scale-[1.02]"
                                    : `${plan.accentBorder} shadow-lg`,
                                isCurrentPlan && "ring-2 ring-primary/40"
                            )}
                        >
                            {/* Popular badge */}
                            {plan.badge && (
                                <div className="absolute top-4 right-4">
                                    <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-full", plan.badgeColor)}>
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="absolute top-4 left-4">
                                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500 text-white">
                                        ✓ Ativo
                                    </span>
                                </div>
                            )}

                            <CardContent className="p-6 space-y-6">
                                {/* Plan Header */}
                                <div className={cn("flex items-center gap-4", (plan.badge || isCurrentPlan) && "mt-6")}>
                                    <div className={cn("h-14 w-14 flex items-center justify-center rounded-2xl", plan.iconBg)}>
                                        <PlanIcon className={cn("h-7 w-7", plan.iconColor)} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black">{limit.name}</h2>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-foreground">{plan.priceLabel}</span>
                                            <span className="text-xs font-bold text-muted-foreground">{plan.priceSub}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Limit indicator for free */}
                                {plan.key === "free" && (
                                    <div className="bg-muted/50 rounded-2xl p-3">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground">
                                            Limite: até {limit.maxServices} serviços · sem exportação · com marca d'água
                                        </p>
                                    </div>
                                )}

                                {/* Features */}
                                <div className="grid gap-2">
                                    {limit.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", plan.iconBg)}>
                                                <Check className={cn("h-3 w-3", plan.iconColor)} />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                {plan.ctaDisabled ? (
                                    <Button
                                        disabled
                                        className="w-full h-14 rounded-2xl font-black text-sm opacity-40"
                                        variant="outline"
                                    >
                                        {isCurrentPlan ? "Plano Atual" : plan.cta}
                                    </Button>
                                ) : (
                                    <a href={plan.stripeLink} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            className={cn(
                                                "w-full h-14 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95",
                                                plan.highlight
                                                    ? "bg-gradient-to-r from-primary to-blue-600 shadow-primary/20"
                                                    : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20"
                                            )}
                                        >
                                            {isCurrentPlan ? "Seu Plano Atual" : plan.cta}
                                        </Button>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Trust signals */}
            <div className="text-center space-y-3 pt-4">
                <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>✓ Cancele Quando Quiser</span>
                    <span>✓ Pagamento Seguro</span>
                    <span>✓ Suporte Incluso</span>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground/50">
                    Pagamentos processados com segurança via Stripe
                </p>
            </div>
        </div>
    );
}
