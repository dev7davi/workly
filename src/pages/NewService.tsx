import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Check, Briefcase, Calendar, Clock, DollarSign, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useServices, ServiceStatus } from "@/hooks/useServices";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ClientNameField } from "@/components/ClientNameField";
import { useClients, normalizeName } from "@/hooks/useClients";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const serviceSchema = z.object({
  client_name: z.string().min(2, "Digite o nome do cliente"),
  service_type: z.string().min(2, "Descreva o serviço"),
  value: z
    .string()
    .min(1, "Digite o valor")
    .refine(
      (v) =>
        !isNaN(parseFloat(v.replace(".", "").replace(",", "."))) &&
        parseFloat(v.replace(".", "").replace(",", ".")) > 0,
      "Valor inválido"
    ),
  service_date: z.string().min(1, "Selecione a data do serviço"),
  payment_date: z.string().min(1, "Selecione a data de pagamento"),
  notes: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

import { ContextHelp } from "@/components/ContextHelp";

export default function NewService() {
  const navigate = useNavigate();
  const { createService, services } = useServices();
  const { clients, createClient: apiCreateClient } = useClients();
  const { canAddService, isAtServiceLimit, plan, limits, usage } = usePlan();
  const [status, setStatus] = useState<ServiceStatus>("pending");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // States for Smart Registration
  const [showSimilarityDialog, setShowSimilarityDialog] = useState(false);
  const [similarClient, setSimilarClient] = useState<{ id: string, name: string } | null>(null);
  const [pendingData, setPendingData] = useState<ServiceForm | null>(null);
  

  useEffect(() => {
    if (isAtServiceLimit) setShowUpgradeModal(true);
  }, [isAtServiceLimit]);

  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      service_date: today,
      payment_date: today,
    },
  });

  const clientName = watch("client_name") || "";

  const performSave = async (data: ServiceForm, clientId?: string, clientNameOverride?: string) => {
    try {
      await createService({
        client_id: clientId,
        client_name: clientNameOverride || data.client_name,
        service_type: data.service_type,
        value: Number(data.value.replace(/\./g, "").replace(",", ".")),
        service_date: data.service_date,
        payment_date: data.payment_date,
        status,
        notes: data.notes || undefined,
      });
      navigate("/services");
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data: ServiceForm) => {
    if (!canAddService) {
      setShowUpgradeModal(true);
      return;
    }

    const normalizedTypedName = normalizeName(data.client_name);
    

    // 2. Check for Similar Client
    const existingClient = clients.find(c => normalizeName(c.name) === normalizedTypedName);
    
    if (existingClient) {
      // Client exactly exists, just save
      await performSave(data, existingClient.id, existingClient.name);
      return;
    }

    // Check for fuzzy similar client (starts with or included)
    const similar = clients.find(c => 
      normalizeName(c.name).startsWith(normalizedTypedName) || 
      normalizedTypedName.startsWith(normalizeName(c.name))
    );

    if (similar && !showSimilarityDialog) {
      setSimilarClient(similar);
      setPendingData(data);
      setShowSimilarityDialog(true);
      return;
    }

    // 3. No client found, create auto
    try {
      const newClient = await apiCreateClient({
        name: data.client_name,
        type: "pf",
        created_from_service: true,
        profile_completed: false,
        registration_origin: "service"
      });
      
      await performSave(data, newClient.id);
    } catch (err) {
      // If creation fails (maybe already exists but hook didn't catch), try saving anyway
      await performSave(data);
    }
  };

  const setToday = (field: "service_date" | "payment_date") => setValue(field, today);

  return (
    <>
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full pb-24 animate-in fade-in duration-300">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Novo Serviço</h1>
            <p className="text-sm text-muted-foreground">Registre seu trabalho rapidamente.</p>
          </div>
        </header>

        {/* Plan limit banner */}
        {plan === "free" && (
          <div
            className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl cursor-pointer"
            onClick={() => setShowUpgradeModal(true)}
          >
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs font-black uppercase text-amber-600">Plano Free</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {plan === "free" ? usage.servicesMonth : usage.servicesTotal}/{limits.maxServices} serviços utilizados
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
              Upgrade →
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Status Toggle */}
          <Tabs value={status} onValueChange={(v) => setStatus(v as ServiceStatus)}>
            <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/50 rounded-2xl">
              <TabsTrigger value="pending" className="rounded-xl font-bold data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
                Em Aberto
              </TabsTrigger>
              <TabsTrigger value="paid" className="rounded-xl font-bold data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                Já Pago
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6">
            {/* Client & Service Info */}
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                {/* ✅ Smart Client Name Field */}
                <ClientNameField
                  value={clientName}
                  onChange={(name) => setValue("client_name", name, { shouldValidate: true })}
                  error={errors.client_name?.message}
                />

                <div className="space-y-2">
                  <Label htmlFor="service_type" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Briefcase className="h-3 w-3" /> Descrição do Serviço
                  </Label>
                  <Input
                    id="service_type"
                    placeholder="O que você fez?"
                    className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary"
                    {...register("service_type")}
                  />
                  {errors.service_type && (
                    <p className="text-xs font-medium text-destructive">{errors.service_type.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Finance & Dates */}
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="value" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <DollarSign className="h-3 w-3" /> Valor Cobrado (R$)
                    </Label>
                    <ContextHelp content="Informe o valor brutto do serviço. No plano Pro+ você poderá descontar custos automaticamente." />
                  </div>
                  <Input
                    id="value"
                    placeholder="0,00"
                    inputMode="decimal"
                    className="h-14 text-2xl font-black rounded-xl bg-muted/30 border-none px-4 text-primary"
                    {...register("value")}
                  />
                  {errors.value && (
                    <p className="text-xs font-medium text-destructive">{errors.value.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="service_date" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          <Calendar className="h-3 w-3" /> Data do Serviço
                        </Label>
                        <ContextHelp content="Data em que o trabalho foi executado." />
                      </div>
                      <button type="button" className="text-[9px] font-black uppercase text-primary hover:underline" onClick={() => setToday("service_date")}>
                        Hoje
                      </button>
                    </div>
                    <Input id="service_date" type="date" className="h-12 rounded-xl bg-muted/30 border-none w-full" {...register("service_date")} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <Label htmlFor="payment_date" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <Clock className="h-3 w-3" /> Data de Pgto.
                      </Label>
                      <button type="button" className="text-[9px] font-black uppercase text-primary hover:underline" onClick={() => setToday("payment_date")}>
                        Hoje
                      </button>
                    </div>
                    <Input id="payment_date" type="date" className="h-12 rounded-xl bg-muted/30 border-none w-full" {...register("payment_date")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <FileText className="h-3 w-3" /> Observações (Opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Mais detalhes..."
                    className="rounded-xl bg-muted/30 border-none min-h-[100px] focus-visible:ring-primary"
                    {...register("notes")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-16 rounded-2xl text-lg font-black bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <><Check className="mr-2 h-6 w-6" /> SALVAR SERVIÇO</>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Dialog for Similar Client */}
      <AlertDialog open={showSimilarityDialog} onOpenChange={setShowSimilarityDialog}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Cliente já encontrado</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              Encontramos um cliente com nome semelhante já cadastrado:
              <span className="block mt-2 p-3 bg-muted rounded-xl font-bold text-foreground">
                {similarClient?.name}
              </span>
              Deseja utilizar este cadastro existente ou criar um novo para "{pendingData?.client_name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogAction 
              onClick={() => {
                if (pendingData && similarClient) {
                  performSave(pendingData, similarClient.id, similarClient.name);
                }
              }}
              className="rounded-xl h-12 font-bold"
            >
              Usar Existente
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={async () => {
                if (pendingData) {
                  const newClient = await apiCreateClient({
                    name: pendingData.client_name,
                    type: "pf",
                    created_from_service: true,
                    profile_completed: false,
                    registration_origin: "service"
                  });
                  performSave(pendingData, newClient.id);
                }
              }}
              className="rounded-xl h-12 font-bold bg-muted text-muted-foreground hover:bg-muted/80"
            >
              Criar Novo
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-xl h-12 font-bold border-none">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
