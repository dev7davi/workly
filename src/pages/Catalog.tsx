import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit3, Check, X, BookOpen, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useServiceCatalog, CatalogItem } from "@/hooks/useServiceCatalog";
import { formatCurrency } from "@/lib/format";

const CATEGORIES = [
    "Instalação", "Manutenção", "Reparo", "Reforma",
    "Limpeza", "Consultoria", "Pintura", "Elétrica",
    "Hidráulica", "Marcenaria", "Outro",
];

const catalogSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().optional(),
    default_price: z.string().optional(),
    default_cost: z.string().optional(),
    unit: z.string().min(1, "Unidade obrigatória"),
});

type CatalogForm = z.infer<typeof catalogSchema>;

function ItemForm({
    existing,
    onSuccess,
}: {
    existing?: CatalogItem;
    onSuccess: () => void;
}) {
    const { addItem, updateItem } = useServiceCatalog();
    const [category, setCategory] = useState(existing?.category || "Outro");

    const {
        register, handleSubmit, reset, formState: { isSubmitting, errors },
    } = useForm<CatalogForm>({
        resolver: zodResolver(catalogSchema),
        defaultValues: {
            name: existing?.name || "",
            description: existing?.description || "",
            default_price: existing?.default_price ? String(existing.default_price) : "",
            default_cost: existing?.default_cost ? String(existing.default_cost) : "",
            unit: existing?.unit || "un",
        },
    });

    const onSubmit = async (data: CatalogForm) => {
        const payload = {
            name: data.name,
            description: data.description || null,
            default_price: parseFloat(data.default_price?.replace(",", ".") || "0") || 0,
            default_cost: parseFloat(data.default_cost?.replace(",", ".") || "0") || 0,
            unit: data.unit,
            category,
        };

        if (existing) {
            await updateItem({ id: existing.id, ...payload });
        } else {
            await addItem(payload as any);
            reset();
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {existing ? "Editar Serviço" : "Novo Serviço no Catálogo"}
            </p>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Nome do serviço *</Label>
                <Input
                    placeholder="Ex: Instalação de tomada"
                    className="h-11 rounded-xl bg-background border-none"
                    {...register("name")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Descrição</Label>
                <Textarea
                    placeholder="Detalhes do serviço..."
                    className="rounded-xl bg-background border-none min-h-[70px]"
                    {...register("description")}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Preço padrão (R$)</Label>
                    <Input
                        placeholder="0,00"
                        inputMode="decimal"
                        className="h-11 rounded-xl bg-background border-none"
                        {...register("default_price")}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Custo padrão (R$)</Label>
                    <Input
                        placeholder="0,00"
                        inputMode="decimal"
                        className="h-11 rounded-xl bg-background border-none"
                        {...register("default_cost")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11 rounded-xl bg-background border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Unidade</Label>
                    <Input
                        placeholder="un, m², h..."
                        className="h-11 rounded-xl bg-background border-none"
                        {...register("unit")}
                        defaultValue={existing?.unit || "un"}
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={onSuccess}>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 rounded-xl font-black bg-primary" disabled={isSubmitting}>
                    <Check className="h-4 w-4 mr-1" />
                    {existing ? "Salvar" : "Adicionar"}
                </Button>
            </div>
        </form>
    );
}

export default function Catalog() {
    const { catalog, isLoading, deleteItem } = useServiceCatalog();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <Skeleton className="h-10 w-48 rounded-xl" />
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Catálogo</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Serviços com preços pré-definidos
                    </p>
                </div>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="rounded-2xl h-12 px-6 font-black bg-primary shadow-lg shadow-primary/20"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                )}
            </header>

            {/* Add form */}
            {showForm && !editingId && (
                <ItemForm onSuccess={() => setShowForm(false)} />
            )}

            {/* List */}
            {catalog.length > 0 ? (
                <div className="space-y-3">
                    {/* Group by category */}
                    {Array.from(new Set(catalog.map(i => i.category || "Outro"))).sort().map(cat => {
                        const items = catalog.filter(i => (i.category || "Outro") === cat);
                        return (
                            <div key={cat} className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                                    {cat}
                                </p>
                                {items.map(item => (
                                    <div key={item.id}>
                                        {editingId === item.id ? (
                                            <ItemForm existing={item} onSuccess={() => setEditingId(null)} />
                                        ) : (
                                            <Card className="border-none shadow-md rounded-2xl bg-card group overflow-hidden">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                            <BookOpen className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-sm">{item.name}</p>
                                                            {item.description && (
                                                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                                            )}
                                                            <div className="flex gap-3 mt-1">
                                                                {item.default_price > 0 && (
                                                                    <span className="text-[10px] font-black text-emerald-600 uppercase">
                                                                        💰 {formatCurrency(item.default_price)}
                                                                    </span>
                                                                )}
                                                                {item.default_cost > 0 && (
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                        custo: {formatCurrency(item.default_cost)}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {item.unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className="h-8 w-8 rounded-xl"
                                                                onClick={() => setEditingId(item.id)}
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon"
                                                                        className="h-8 w-8 rounded-xl text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="rounded-3xl">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="font-black">Remover do catálogo?</AlertDialogTitle>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction className="rounded-xl bg-destructive" onClick={() => deleteItem(item.id)}>
                                                                            Remover
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ) : !showForm ? (
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full p-10 border-2 border-dashed border-muted rounded-2xl text-center hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary/40 mx-auto mb-3 transition-colors" />
                    <p className="text-sm font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">
                        Catálogo vazio
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        Cadastre seus serviços com preços padrão para agilizar novos registros
                    </p>
                </button>
            ) : null}
        </div>
    );
}
