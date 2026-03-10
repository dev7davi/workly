import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft, Save, Loader2, User, Building2,
    Phone, Mail, MapPin, FileText, Calendar, StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useClients, ClientType } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";

const clientSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    type: z.enum(["pf", "pj"]),
    document: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    phone_secondary: z.string().optional(),
    street: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    birthday: z.string().optional(),
    notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export default function ClientForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clients, isLoading, createClient, updateClient } = useClients();
    const { limits } = usePlan();
    const [clientType, setClientType] = useState<ClientType>("pf");
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const isEdit = !!id;

    const existing = clients.find(c => c.id === id);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ClientForm>({
        resolver: zodResolver(clientSchema),
        defaultValues: { type: "pf" },
    });

    useEffect(() => {
        if (existing) {
            setValue("name", existing.name);
            setValue("type", existing.type || "pf");
            setValue("document", existing.document || "");
            setValue("email", existing.email || "");
            setValue("phone", existing.phone || "");
            setValue("phone_secondary", existing.phone_secondary || "");
            setValue("street", existing.street || "");
            setValue("neighborhood", existing.neighborhood || "");
            setValue("city", existing.city || "");
            setValue("state", existing.state || "");
            setValue("zip", existing.zip || "");
            setValue("birthday", existing.birthday || "");
            setValue("notes", existing.notes || "");
            setClientType(existing.type || "pf");
        } else if (!isEdit) {
            if (clients.length >= limits.maxClients) {
                setShowUpgradeModal(true);
            }
        }
    }, [existing, setValue, isEdit, clients.length, limits.maxClients]);

    const onSubmit = async (data: ClientForm) => {
        if (!isEdit && clients.length >= limits.maxClients) {
            setShowUpgradeModal(true);
            return;
        }
        const payload = {
            ...data,
            type: clientType,
            email: data.email || null,
            document: data.document || null,
            phone: data.phone || null,
            phone_secondary: data.phone_secondary || null,
            street: data.street || null,
            neighborhood: data.neighborhood || null,
            city: data.city || null,
            state: data.state || null,
            zip: data.zip || null,
            birthday: data.birthday || null,
            notes: data.notes || null,
        } as any;

        if (isEdit && id) {
            await updateClient({ id, ...payload });
        } else {
            await createClient(payload);
        }
        navigate("/clients");
    };

    if (isLoading && isEdit) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <Skeleton className="h-10 w-56 rounded-xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            {showUpgradeModal && <UpgradeModal onClose={() => { setShowUpgradeModal(false); navigate("/clients") }} />}

            {/* Header */}
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/clients")} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">
                        {isEdit ? "Editar Cliente" : "Novo Cliente"}
                    </h1>
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                        {isEdit ? existing?.name : "Preencha os dados do cliente"}
                    </p>
                </div>
            </header>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-3">
                {(["pf", "pj"] as ClientType[]).map(t => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setClientType(t)}
                        className={cn(
                            "flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-black text-sm transition-all",
                            clientType === t
                                ? t === "pj"
                                    ? "border-blue-500 bg-blue-500/10 text-blue-600"
                                    : "border-primary bg-primary/10 text-primary"
                                : "border-muted bg-muted/30 text-muted-foreground"
                        )}
                    >
                        {t === "pf"
                            ? <><User className="h-5 w-5" /> Pessoa Física</>
                            : <><Building2 className="h-5 w-5" /> Pessoa Jurídica</>
                        }
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Basic Info */}
                <Card className="border-none shadow-lg rounded-3xl bg-card/60">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User className="h-3 w-3" /> Dados principais
                        </p>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">
                                {clientType === "pj" ? "Razão Social / Nome" : "Nome completo"} *
                            </Label>
                            <Input
                                placeholder={clientType === "pj" ? "Ex: Construtora Silva LTDA" : "Ex: João da Silva"}
                                className="h-12 rounded-xl bg-muted/30 border-none"
                                {...register("name")}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" /> {clientType === "pj" ? "CNPJ" : "CPF"} (opcional)
                            </Label>
                            <Input
                                placeholder={clientType === "pj" ? "XX.XXX.XXX/0001-XX" : "XXX.XXX.XXX-XX"}
                                className="h-12 rounded-xl bg-muted/30 border-none"
                                {...register("document")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="border-none shadow-lg rounded-3xl bg-card/60">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3 w-3" /> Contato
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Telefone principal</Label>
                                <Input
                                    placeholder="(xx) xxxxx-xxxx"
                                    inputMode="tel"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    {...register("phone")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Telefone 2</Label>
                                <Input
                                    placeholder="(xx) xxxxx-xxxx"
                                    inputMode="tel"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    {...register("phone_secondary")}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> E-mail
                            </Label>
                            <Input
                                placeholder="email@exemplo.com"
                                inputMode="email"
                                className="h-12 rounded-xl bg-muted/30 border-none"
                                {...register("email")}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        {clientType === "pf" && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Aniversário
                                </Label>
                                <Input
                                    type="date"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    {...register("birthday")}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Address */}
                <Card className="border-none shadow-lg rounded-3xl bg-card/60">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Endereço (opcional)
                        </p>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Rua / Logradouro</Label>
                            <Input
                                placeholder="Rua das Flores, 123"
                                className="h-12 rounded-xl bg-muted/30 border-none"
                                {...register("street")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Bairro</Label>
                                <Input
                                    placeholder="Centro"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    {...register("neighborhood")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">CEP</Label>
                                <Input
                                    placeholder="00000-000"
                                    inputMode="numeric"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    {...register("zip")}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Cidade</Label>
                                <Input
                                    placeholder="São Paulo"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    {...register("city")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Estado</Label>
                                <Input
                                    placeholder="SP"
                                    maxLength={2}
                                    className="h-12 rounded-xl bg-muted/30 border-none uppercase"
                                    {...register("state")}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="border-none shadow-lg rounded-3xl bg-card/60">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <StickyNote className="h-3 w-3" /> Observações internas
                        </p>
                        <Textarea
                            placeholder="Informações relevantes sobre este cliente..."
                            className="rounded-xl bg-muted/30 border-none min-h-[100px]"
                            {...register("notes")}
                        />
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/20 text-base transition-all hover:scale-[1.02] active:scale-95"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5" />
                            {isEdit ? "Salvar Alterações" : "Cadastrar Cliente"}
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
