import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    User, UserPlus, Search, Check, X, Loader2,
    Phone, CheckCircle2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";

// ─── Quick Register Form Schema ───────────────────────────────────────────────
const quickClientSchema = z.object({
    name: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)"),
    phone: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
});
type QuickClientForm = z.infer<typeof quickClientSchema>;

// ─── Success Popup ─────────────────────────────────────────────────────────────
function SuccessPopup({ name, onClose }: { name: string; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-8 flex flex-col items-center gap-4 max-w-xs w-full animate-in zoom-in-95 duration-200">
                <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="text-center">
                    <p className="font-black text-xl tracking-tight">Cliente cadastrado!</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        <span className="text-primary font-black">{name}</span> foi adicionado ao sistema
                    </p>
                </div>
                <p className="text-xs text-muted-foreground/60">Fechando automaticamente…</p>
            </div>
        </div>
    );
}

// ─── Quick Register Modal ──────────────────────────────────────────────────────
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

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<QuickClientForm>({
        resolver: zodResolver(quickClientSchema),
        defaultValues: { name: initialName, phone: "", email: "" },
    });

    const onSubmit = async (data: QuickClientForm) => {
        await createClient({
            name: data.name,
            type: "pf",
            phone: data.phone || null,
            email: data.email || null,
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
        onSuccess(data.name);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 flex items-center justify-center bg-white/20 rounded-xl">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Cadastro Rápido</p>
                            <h2 className="text-xl font-black">Novo Cliente</h2>
                        </div>
                    </div>
                    <p className="text-sm opacity-80 font-medium">
                        Preencha o essencial agora. Você pode completar o cadastro depois em Clientes.
                    </p>
                    <div className="absolute -bottom-8 -right-8 h-28 w-28 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" /> Nome completo *
                        </Label>
                        <Input
                            autoFocus
                            placeholder="Ex: Maria Oliveira"
                            className="h-12 rounded-xl bg-muted/40 border-none focus-visible:ring-primary text-base font-medium"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Telefone / WhatsApp
                        </Label>
                        <Input
                            placeholder="(00) 00000-0000"
                            inputMode="tel"
                            className="h-12 rounded-xl bg-muted/40 border-none focus-visible:ring-primary"
                            {...register("phone")}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            E-mail
                        </Label>
                        <Input
                            placeholder="cliente@email.com"
                            inputMode="email"
                            type="email"
                            className="h-12 rounded-xl bg-muted/40 border-none focus-visible:ring-primary"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                        )}
                    </div>

                    <p className="text-[10px] text-muted-foreground/60 font-medium">
                        * Obrigatório. Demais informações podem ser adicionadas depois em <strong>Clientes →</strong>
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <><Check className="h-4 w-4 mr-1.5" /> Cadastrar</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── ClientNameField (main exported component) ─────────────────────────────────
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

    // Close suggestions on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Filter clients by input
    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 0
    ).slice(0, 6);

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
        // Auto-fill the field with the registered client's name
        setInputValue(name);
        onChange(name);
    };

    const noExactMatch = inputValue.length >= 2 && !clients.some(
        c => c.name.toLowerCase() === inputValue.toLowerCase()
    );

    return (
        <>
            {/* Modals */}
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

            {/* Field */}
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
                        placeholder="Buscar ou digitar nome do cliente…"
                        className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary pl-10 pr-24"
                        autoComplete="off"
                    />
                    {/* Quick register button */}
                    <button
                        type="button"
                        onClick={() => setShowRegisterModal(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 h-8 px-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-[10px] font-black uppercase tracking-tight transition-all"
                        title="Cadastrar novo cliente"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Novo</span>
                    </button>
                </div>

                {error && <p className="text-xs font-medium text-destructive">{error}</p>}

                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                        {filtered.length > 0 && (
                            <ul>
                                {filtered.map(client => (
                                    <li key={client.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(client.name)}
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

                        {/* Not found — offer to register */}
                        {noExactMatch && (
                            <button
                                type="button"
                                onClick={() => { setShowSuggestions(false); setShowRegisterModal(true); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 transition-colors",
                                    filtered.length > 0
                                        ? "border-t border-border hover:bg-indigo-500/5"
                                        : "hover:bg-indigo-500/5"
                                )}
                            >
                                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <UserPlus className="h-4 w-4 text-indigo-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                        Cadastrar "{inputValue}"
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground">
                                        Adicionar como novo cliente
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0" />
                            </button>
                        )}

                        {filtered.length === 0 && !noExactMatch && (
                            <div className="px-4 py-4 text-center text-sm text-muted-foreground font-medium">
                                Nenhum cliente encontrado
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
