import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit3, Check, X, TrendingDown, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useServiceCosts,
    useAddServiceCost,
    useUpdateServiceCost,
    useDeleteServiceCost,
    calcCostTotals,
    COST_CATEGORIES,
    CATEGORY_EMOJIS,
    ServiceCost,
    PaidBy,
    CostCategory,
} from "@/hooks/useServiceCosts";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const costSchema = z.object({
    name: z.string().min(1, "Nome obrigatório"),
    quantity: z.string().min(1, "Quantidade obrigatória"),
    unit_price: z.string().min(1, "Valor obrigatório"),
});

type CostForm = z.infer<typeof costSchema>;

interface ServiceCostsSectionProps {
    serviceId: string;
    serviceValue: number;
}

function CostForm({
    serviceId,
    onSuccess,
    existing,
}: {
    serviceId: string;
    onSuccess: () => void;
    existing?: ServiceCost;
}) {
    const addCost = useAddServiceCost();
    const updateCost = useUpdateServiceCost();
    const [paidBy, setPaidBy] = useState<PaidBy>(existing?.paid_by || "provider");
    const [category, setCategory] = useState<CostCategory>(existing?.category || "material");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CostForm>({
        resolver: zodResolver(costSchema),
        defaultValues: existing
            ? {
                name: existing.name,
                quantity: String(existing.quantity),
                unit_price: String(existing.unit_price),
            }
            : { name: "", quantity: "1", unit_price: "" },
    });

    const onSubmit = async (data: CostForm) => {
        const quantity = parseFloat(data.quantity.replace(",", "."));
        const unit_price = parseFloat(data.unit_price.replace(",", ".").replace(/\./g, "")) ||
            parseFloat(data.unit_price.replace(",", "."));

        if (existing) {
            await updateCost.mutateAsync({
                id: existing.id,
                name: data.name,
                quantity,
                unit_price,
                paid_by: paidBy,
                category,
            });
        } else {
            await addCost.mutateAsync({
                service_id: serviceId,
                name: data.name,
                quantity,
                unit_price,
                paid_by: paidBy,
                category,
            });
            reset();
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {existing ? "Editar Item" : "Novo Item de Custo"}
            </p>

            {/* Name */}
            <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Nome do item *</Label>
                <Input
                    placeholder="Ex: Tinta branca, Fio elétrico..."
                    className="h-11 rounded-xl bg-background border-none focus-visible:ring-primary"
                    {...register("name")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Qty + Price */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Quantidade *</Label>
                    <Input
                        placeholder="1"
                        inputMode="decimal"
                        className="h-11 rounded-xl bg-background border-none focus-visible:ring-primary"
                        {...register("quantity")}
                    />
                    {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Valor unitário *</Label>
                    <Input
                        placeholder="0,00"
                        inputMode="decimal"
                        className="h-11 rounded-xl bg-background border-none focus-visible:ring-primary"
                        {...register("unit_price")}
                    />
                    {errors.unit_price && <p className="text-xs text-destructive">{errors.unit_price.message}</p>}
                </div>
            </div>

            {/* Category + Paid By */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Categoria</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as CostCategory)}>
                        <SelectTrigger className="h-11 rounded-xl bg-background border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(COST_CATEGORIES) as CostCategory[]).map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {CATEGORY_EMOJIS[cat]} {COST_CATEGORIES[cat]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Pago por</Label>
                    <Select value={paidBy} onValueChange={(v) => setPaidBy(v as PaidBy)}>
                        <SelectTrigger className="h-11 rounded-xl bg-background border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="provider">🧑‍🔧 Prestador</SelectItem>
                            <SelectItem value="client">👤 Cliente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Paid by explanation */}
            <div className={cn(
                "text-[10px] font-bold rounded-xl p-3",
                paidBy === "provider"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-blue-500/10 text-blue-600"
            )}>
                {paidBy === "provider"
                    ? "⚠️ Você pagou — entra no cálculo de custo e reduz seu lucro."
                    : "✅ Cliente pagou — não afeta seu lucro líquido."}
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-bold"
                    onClick={onSuccess}
                >
                    <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl font-black bg-primary"
                    disabled={isSubmitting}
                >
                    <Check className="h-4 w-4 mr-1" />
                    {existing ? "Salvar" : "Adicionar"}
                </Button>
            </div>
        </form>
    );
}

export function ServiceCostsSection({ serviceId, serviceValue }: ServiceCostsSectionProps) {
    const { data: costs = [], isLoading } = useServiceCosts(serviceId);
    const deleteCost = useDeleteServiceCost();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { totalProviderCost, totalClientCost } = calcCostTotals(costs);
    const profit = serviceValue - totalProviderCost;
    const profitMargin = serviceValue > 0 ? (profit / serviceValue) * 100 : 0;
    const isProfitable = profit >= 0;

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Materiais e Custos
                    </h3>
                </div>
                {!showForm && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl font-black text-[10px] uppercase gap-1 border-dashed"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="h-3 w-3" />
                        Adicionar
                    </Button>
                )}
            </div>

            {/* Add Form */}
            {showForm && !editingId && (
                <CostForm serviceId={serviceId} onSuccess={() => setShowForm(false)} />
            )}

            {/* Costs List */}
            {isLoading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-16 bg-muted/40 rounded-2xl" />
                    <div className="h-16 bg-muted/40 rounded-2xl" />
                </div>
            ) : costs.length > 0 ? (
                <div className="space-y-2">
                    {costs.map((cost) => (
                        <div key={cost.id}>
                            {editingId === cost.id ? (
                                <CostForm
                                    serviceId={serviceId}
                                    existing={cost}
                                    onSuccess={() => setEditingId(null)}
                                />
                            ) : (
                                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/30 group">
                                    {/* Category emoji */}
                                    <div className="text-xl shrink-0">
                                        {CATEGORY_EMOJIS[cost.category as CostCategory] || "📦"}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <p className="font-bold text-sm truncate">{cost.name}</p>
                                            <p className="text-sm font-black ml-2 shrink-0">
                                                {formatCurrency(cost.total_price)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                {cost.quantity} × {formatCurrency(cost.unit_price)}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0 h-4",
                                                    cost.paid_by === "provider"
                                                        ? "bg-red-500/10 text-red-600"
                                                        : "bg-blue-500/10 text-blue-600"
                                                )}
                                            >
                                                {cost.paid_by === "provider" ? "🧑‍🔧 Você pagou" : "👤 Cliente pagou"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl"
                                            onClick={() => setEditingId(cost.id)}
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl text-destructive hover:text-destructive"
                                            onClick={() => deleteCost.mutate({ costId: cost.id, serviceId })}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : !showForm ? (
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full p-6 border-2 border-dashed border-muted rounded-2xl text-center hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                    <Package className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/40 mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">
                        Nenhum custo registrado
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Toque para adicionar materiais e custos
                    </p>
                </button>
            ) : null}

            {/* Summary Card — only show if there are costs */}
            {costs.length > 0 && (
                <Card className={cn(
                    "border-none shadow-lg rounded-2xl overflow-hidden",
                    isProfitable ? "bg-emerald-500/10" : "bg-red-500/10"
                )}>
                    <CardContent className="p-5 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Resumo Financeiro
                        </p>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">Valor do serviço</span>
                                <span className="font-black">{formatCurrency(serviceValue)}</span>
                            </div>
                            {totalProviderCost > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                        <TrendingDown className="h-3 w-3 text-red-500" /> Seus custos (prestador)
                                    </span>
                                    <span className="font-black text-red-600">− {formatCurrency(totalProviderCost)}</span>
                                </div>
                            )}
                            {totalClientCost > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">Custos do cliente</span>
                                    <span className="font-bold text-blue-600 text-xs">{formatCurrency(totalClientCost)} (não afeta)</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border/30 pt-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Lucro Real</p>
                                <p className={cn("text-2xl font-black tracking-tighter", isProfitable ? "text-emerald-600" : "text-red-600")}>
                                    {formatCurrency(profit)}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    "flex items-center gap-1 justify-end",
                                    isProfitable ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {isProfitable
                                        ? <TrendingUp className="h-5 w-5" />
                                        : <TrendingDown className="h-5 w-5" />}
                                    <span className="text-xl font-black">{Math.abs(profitMargin).toFixed(0)}%</span>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground">margem de lucro</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
