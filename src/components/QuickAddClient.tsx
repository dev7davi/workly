import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    UserPlus, X, Loader2, Phone, Mail, Check, CheckCircle2,
    AlertCircle, User, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
    name: z.string().min(2, "Nome obrigatório (mín. 2 letras)"),
    phone: z.string().optional(),
    email: z.string().optional().refine(
        v => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "E-mail inválido"
    ),
});
type FormData = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────
interface QuickAddClientProps {
    initialName?: string;
    trigger?: React.ReactNode;
    onSuccess?: (name: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function QuickAddClient({
    initialName = "",
    trigger,
    onSuccess,
    open: controlledOpen,
    onOpenChange,
}: QuickAddClientProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [internalOpen, setInternalOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [savedName, setSavedName] = useState("");
    const [serverError, setServerError] = useState<string | null>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = (v: boolean) => {
        if (onOpenChange) onOpenChange(v);
        else setInternalOpen(v);
    };

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: initialName, phone: "", email: "" },
    });

    const onSubmit = async (data: FormData) => {
        setServerError(null);

        try {
            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("Você precisa estar logado.");

            // Use supabase as any to bypass empty type gen
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await (supabase as any)
                .from("clients")
                .insert({
                    user_id: user.id,
                    name: data.name.trim(),
                    type: "pf",
                    phone: data.phone?.trim() || null,
                    email: data.email?.trim() || null,
                    document: null,
                    phone_secondary: null,
                    street: null,
                    neighborhood: null,
                    city: null,
                    state: null,
                    zip: null,
                    birthday: null,
                    notes: null,
                });

            if (insertError) {
                console.error("Supabase insert error:", insertError);
                throw new Error(insertError.message || "Erro ao salvar no banco.");
            }

            // Invalidate queries so Clients page refreshes
            await queryClient.invalidateQueries({ queryKey: ["clients"] });

            setSavedName(data.name.trim());
            setDone(true);
            reset();
            onSuccess?.(data.name.trim());
        } catch (err: any) {
            console.error("QuickAddClient error:", err);
            setServerError(err?.message || "Erro desconhecido. Tente novamente.");
        }
    };

    const handleClose = () => {
        setOpen(false);
        setDone(false);
        setServerError(null);
        reset({ name: initialName, phone: "", email: "" });
    };

    return (
        <>
            {/* Trigger */}
            {trigger && (
                <div onClick={() => setOpen(true)} className="cursor-pointer">
                    {trigger}
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <div className="bg-card w-full max-w-md rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-200">

                        {/* ── Success state ── */}
                        {done ? (
                            <div className="flex flex-col items-center gap-5 p-10 text-center">
                                <div className="relative">
                                    <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-7 w-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                        <Check className="h-4 w-4 text-white stroke-[3]" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-2xl font-black">Cliente Cadastrado!</p>
                                    <p className="text-base text-muted-foreground font-medium mt-1">
                                        <span className="text-primary font-black">"{savedName}"</span> foi salvo no sistema.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <Button
                                        className="w-full h-12 rounded-xl font-black bg-primary"
                                        onClick={handleClose}
                                    >
                                        <Check className="h-4 w-4 mr-1.5" /> Fechar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-xl font-bold"
                                        onClick={() => { handleClose(); navigate("/clients"); }}
                                    >
                                        <ArrowRight className="h-4 w-4 mr-1.5" /> Ver todos os Clientes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* ── Form state ── */
                            <>
                                {/* Header */}
                                <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
                                    <button
                                        onClick={handleClose}
                                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="h-11 w-11 bg-white/20 rounded-2xl flex items-center justify-center">
                                            <UserPlus className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Cadastro Rápido</p>
                                            <h2 className="text-xl font-black">Novo Cliente</h2>
                                        </div>
                                    </div>
                                    <p className="text-sm opacity-80">Apenas o nome é obrigatório. Complete o cadastro depois.</p>
                                    <div className="absolute -bottom-8 -right-8 h-28 w-28 bg-white/10 rounded-full blur-2xl" />
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                    {/* Server error */}
                                    {serverError && (
                                        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                            <p className="text-sm text-destructive font-medium">{serverError}</p>
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                            <User className="h-3 w-3" /> Nome <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            autoFocus
                                            placeholder="Ex: Maria Oliveira"
                                            className={cn(
                                                "h-12 rounded-xl bg-muted/40 border focus-visible:ring-primary text-base",
                                                errors.name ? "border-destructive" : "border-transparent"
                                            )}
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-destructive font-medium flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                            <Phone className="h-3 w-3" /> Telefone / WhatsApp
                                        </Label>
                                        <Input
                                            placeholder="(00) 00000-0000"
                                            inputMode="tel"
                                            className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:ring-primary"
                                            {...register("phone")}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" /> E-mail
                                        </Label>
                                        <Input
                                            placeholder="cliente@email.com"
                                            type="email"
                                            inputMode="email"
                                            className={cn(
                                                "h-12 rounded-xl bg-muted/40 border focus-visible:ring-primary",
                                                errors.email ? "border-destructive" : "border-transparent"
                                            )}
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive font-medium flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={handleClose} disabled={isSubmitting}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Salvando…</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Cadastrar</span>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
