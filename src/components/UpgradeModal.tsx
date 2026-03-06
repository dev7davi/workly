import { useNavigate } from "react-router-dom";
import { Crown, X, Check, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/hooks/usePlan";

interface UpgradeModalProps {
    onClose: () => void;
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-card rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-8 text-white overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Crown className="h-6 w-6 text-amber-300" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">Limite Atingido</p>
                            <h2 className="text-xl font-black">Faça Upgrade!</h2>
                        </div>
                    </div>
                    <p className="text-sm font-medium opacity-90">
                        Você atingiu o limite de <strong>5 serviços</strong> do plano gratuito.
                        Faça upgrade para registrar serviços ilimitados e desbloquear recursos premium.
                    </p>
                    <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Plans Preview */}
                <div className="p-6 space-y-4">
                    {/* Start Plan */}
                    <div className="border border-border rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-black text-lg">Start</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase">R$14,90/mês</p>
                            </div>
                            <Zap className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {PLANS.start.features.slice(0, 4).map((f) => (
                                <div key={f} className="flex items-center gap-1">
                                    <Check className="h-3 w-3 shrink-0 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative border-2 border-primary rounded-2xl p-4 bg-primary/5">
                        <div className="absolute -top-3 left-4">
                            <span className="text-[10px] font-black uppercase bg-primary text-white px-3 py-1 rounded-full">
                                Mais Popular
                            </span>
                        </div>
                        <div className="flex items-center justify-between mb-3 mt-1">
                            <div>
                                <p className="font-black text-lg">Pro</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase">R$27,90/mês</p>
                            </div>
                            <Crown className="h-6 w-6 text-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {PLANS.pro.features.slice(0, 4).map((f) => (
                                <div key={f} className="flex items-center gap-1">
                                    <Check className="h-3 w-3 shrink-0 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 rounded-2xl font-black text-sm bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/20"
                        onClick={() => {
                            onClose();
                            navigate("/plans");
                        }}
                    >
                        VER TODOS OS PLANOS
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <button
                        onClick={onClose}
                        className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                        Agora não
                    </button>
                </div>
            </div>
        </div>
    );
}
