import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, ArrowRight, Sparkles } from "lucide-react";
import { PLANS, Plan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const STRIPE_LINKS = {
    start: "https://buy.stripe.com/6oU8wOftDaqzdBpb2EaMU02",
    pro: "https://buy.stripe.com/7sYbJ0dlv56f40P2w8aMU00",
    pro_plus: "https://buy.stripe.com/14A00i3KV8ir9l9gmYaMU01",
};

const PLAN_ORDER: Plan[] = ["free", "start", "pro", "pro_plus"];

const PLAN_ICONS = {
    free: Star,
    start: Zap,
    pro: Crown,
    pro_plus: Sparkles,
};

const PLAN_STYLES = {
    free: { icon: "text-slate-400", bg: "bg-slate-400/10", highlight: false, badge: null },
    start: { icon: "text-indigo-500", bg: "bg-indigo-500/10", highlight: false, badge: null },
    pro: { icon: "text-emerald-500", bg: "bg-emerald-500/10", highlight: true, badge: "Mais Popular" },
    pro_plus: { icon: "text-amber-500", bg: "bg-amber-500/10", highlight: false, badge: "Completo" },
};

export default function Plans() {
    return (
        <div className="flex flex-col gap-8 p-6 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            {/* Header */}
            <header className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">Planos & Preços</p>
                <h1 className="text-3xl font-black tracking-tight">Comece grátis. Cresça no ritmo certo.</h1>
                <p className="text-muted-foreground mt-2 font-medium">Sem surpresas, sem fidelidade. Cancele quando quiser.</p>
            </header>

            {/* Plans Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PLAN_ORDER.map(planKey => {
                    const plan = PLANS[planKey];
                    const style = PLAN_STYLES[planKey];
                    const PlanIcon = PLAN_ICONS[planKey];
                    const isExternalLink = planKey !== "free";
                    const href = planKey === "free" ? "/auth?mode=signup" : STRIPE_LINKS[planKey as keyof typeof STRIPE_LINKS];

                    return (
                        <div
                            key={planKey}
                            className={cn(
                                "relative flex flex-col rounded-3xl border-2 overflow-hidden transition-all duration-300",
                                style.highlight
                                    ? "border-primary shadow-2xl shadow-primary/20"
                                    : "border-border bg-card shadow-lg"
                            )}
                        >
                            {style.badge && (
                                <div className="absolute top-4 right-4">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase px-3 py-1 rounded-full",
                                        style.highlight ? "bg-primary text-white" : "bg-amber-500 text-white"
                                    )}>
                                        {style.badge}
                                    </span>
                                </div>
                            )}

                            <div className="p-6">
                                <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4", style.bg)}>
                                    <PlanIcon className={cn("h-6 w-6", style.icon)} />
                                </div>
                                <h3 className="text-xl font-black mb-1">{plan.label}</h3>
                                <p className="text-2xl font-black">{plan.price}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{plan.priceAnnual}</p>
                            </div>

                            <div className="px-6 pb-4 flex-1 space-y-2">
                                {plan.features.map(f => (
                                    <div key={f} className="flex items-start gap-2">
                                        <Check className={cn("h-4 w-4 shrink-0 mt-0.5", style.highlight ? "text-primary" : style.icon)} />
                                        <span className="text-sm font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 pt-4">
                                {isExternalLink ? (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                        <Button className={cn(
                                            "w-full h-12 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95",
                                            style.highlight
                                                ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl shadow-primary/20"
                                                : planKey === "pro_plus"
                                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                                    : "bg-indigo-500 text-white"
                                        )}>
                                            Assinar {plan.label} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </a>
                                ) : (
                                    <Link to={href}>
                                        <Button className="w-full h-12 rounded-2xl font-black bg-muted/60 text-foreground hover:bg-muted">
                                            Continuar no Free
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <span>✓ Cancele quando quiser</span>
                <span>✓ Pagamento via Stripe</span>
                <span>✓ Sem fidelidade</span>
            </div>
        </div>
    );
}
