import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    User, UserPlus, Search, Check, X, Loader2,
    Phone, CheckCircle2, ChevronRight, AlertCircle, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";

// ─── Quick Register Schema (lenient — only name required) ────────────────────
const quickClientSchema = z.object({
    name: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)"),
    phone: z.string().optional(),
    email: z
        .string()
        .optional()
        .refine(v => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido"),
});
type QuickClientForm = z.infer<typeof quickClientSchema>;

// ─── Success Popup ───────────────────────────────────────────────────────────
function SuccessPopup({ name, onClose }: { name: string; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-8 flex flex-col items-center gap-5 max-w-xs w-full animate-in zoom-in-90 duration-300">
                <div className="relative">
                    <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="font-black text-2xl tracking-tight">Cadastrado!</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed">
                        <span className="text-primary font-black">"{name}"</span><br />
                        foi adicionado ao sistema com sucesso.
                    </p>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-[width_3.5s_linear]" style={{ width: "100%", animation: "shrink 3.5s linear forwards" }} />
                </div>
                <p className="text-xs text-muted-foreground/60 font-medium">Fecha automaticamente…</p>
            </div>
            <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        </div>
    );
}

// ─── Quick Register Modal ────────────────────────────────────────────────────
function QuickRegisterModal({
    initialName,
    onClose,
    onSuccess,
}: {
    initialName: string;
    onClose: () => void;
    onSuccess: (name: string) => void;
}) {
    const { createClient } = useClients();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<QuickClientForm>({
        resolver: zodResolver(quickClientSchema),
        defaultValues: { name: initialName, phone: "", email: "" },
    });

    const onSubmit = async (data: QuickClientForm) => {
        setServerError(null);
        try {
            await createClient({
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
            // Only called if createClient succeeds
            onSuccess(data.name.trim());
        } catch (err: any) {
            console.error("Erro ao cadastrar cliente:", err);
            setServerError(
                err?.message?.includes("duplicate")
                    ? "Já existe um cliente com este nome."
                    : err?.message || "Erro ao cadastrar. Tente novamente."
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card w-full max-w-md rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-11 w-11 flex items-center justify-center bg-white/20 rounded-2xl">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Cadastro Rápido</p>
                            <h2 className="text-xl font-black leading-tight">Novo Cliente</h2>
                        </div>
                    </div>
                    <p className="text-sm opacity-80 font-medium">
                        Preencha o essencial agora. Complete o cadastro depois em <strong>Clientes →</strong>
                    </p>
                    <div className="absolute -bottom-8 -right-8 h-28 w-28 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Server error */}
                    {serverError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {serverError}
                        </div>
                    )}

                    {/* Name — required */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Nome completo <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            autoFocus
                            placeholder="Ex: Maria Oliveira"
                            className={cn(
                                "h-12 rounded-xl bg-muted/40 border text-base font-medium focus-visible:ring-primary",
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

                    {/* Phone — optional */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3" /> Telefone / WhatsApp
                            <span className="text-muted-foreground/50 font-medium normal-case tracking-normal">(opcional)</span>
                        </Label>
                        <Input
                            placeholder="(00) 00000-0000"
                            inputMode="tel"
                            className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:ring-primary"
                            {...register("phone")}
                        />
                    </div>

                    {/* Email — optional */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Mail className="h-3 w-3" /> E-mail
                            <span className="text-muted-foreground/50 font-medium normal-case tracking-normal">(opcional)</span>
                        </Label>
                        <Input
                            placeholder="cliente@email.com"
                            inputMode="email"
                            type="email"
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

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cadastrando…
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <Check className="h-4 w-4" /> Cadastrar
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── ClientNameField ─────────────────────────────────────────────────────────
interface ClientNameFieldProps {
    value: string;
    onChange: (name: string) => void;
    error?: string;
}

export function ClientNameField({ value, onChange, error }: ClientNameFieldProps) {
    const { clients } = useClients();
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [registeredName, setRegisteredName] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Fuzzy filter
    const filtered = clients
        .filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 0)
        .slice(0, 6);

    const noExactMatch =
        inputValue.trim().length >= 2 &&
        !clients.some(c => c.name.toLowerCase() === inputValue.toLowerCase().trim());

    const handleInputChange = (v: string) => {
        setInputValue(v);
        onChange(v);
        setShowSuggestions(v.length > 0);
    };

    const handleSelect = (name: string) => {
        setInputValue(name);
        onChange(name);
        setShowSuggestions(false);
    };

    const handleRegisterSuccess = (name: string) => {
        setRegisteredName(name);
        setShowRegisterModal(false);
        setShowSuccessPopup(true);
        setInputValue(name);
        onChange(name);
        setShowSuggestions(false);
    };

    return (
        <>
            {showRegisterModal && (
                <QuickRegisterModal
                    initialName={inputValue}
                    onClose={() => setShowRegisterModal(false)}
                    onSuccess={handleRegisterSuccess}
                />
            )}
            {showSuccessPopup && (
                <SuccessPopup
                    name={registeredName}
                    onClose={() => setShowSuccessPopup(false)}
                />
            )}

            <div ref={wrapperRef} className="relative space-y-1.5">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="h-3 w-3" /> Nome do Cliente
                </Label>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        id="client_name"
                        value={inputValue}
                        onChange={e => handleInputChange(e.target.value)}
                        onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
                        placeholder="Buscar cliente ou digitar novo nome…"
                        className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary pl-10 pr-28"
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={() => { setShowSuggestions(false); setShowRegisterModal(true); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 h-8 px-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-[10px] font-black uppercase tracking-tight transition-all active:scale-95"
                        title="Cadastrar novo cliente"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>+ Novo</span>
                    </button>
                </div>

                {error && (
                    <p className="text-xs font-medium text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {error}
                    </p>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && (filtered.length > 0 || noExactMatch) && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        {filtered.length > 0 && (
                            <ul className="py-1">
                                {filtered.map(client => (
                                    <li key={client.id}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); handleSelect(client.name); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-left transition-colors group"
                                        >
                                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm">{client.name}</p>
                                                {client.phone && (
                                                    <p className="text-[10px] font-bold text-muted-foreground">{client.phone}</p>
                                                )}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Option to register new client */}
                        {noExactMatch && (
                            <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); setShowRegisterModal(true); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-indigo-500/5",
                                    filtered.length > 0 && "border-t border-border"
                                )}
                            >
                                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <UserPlus className="h-4 w-4 text-indigo-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                        Cadastrar "{inputValue.trim()}"
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground">
                                        Adicionar como novo cliente no sistema
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
