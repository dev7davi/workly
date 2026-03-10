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

export default function NewService() {
  const navigate = useNavigate();
  const { createService } = useServices();
  const { canAddService, isAtLimit, plan, limits, serviceCount } = usePlan();
  const [status, setStatus] = useState<ServiceStatus>("pending");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (isAtLimit) setShowUpgradeModal(true);
  }, [isAtLimit]);

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

  const onSubmit = async (data: ServiceForm) => {
    if (!canAddService) {
      setShowUpgradeModal(true);
      return;
    }
    await createService({
      client_name: data.client_name,
      service_type: data.service_type,
      value: Number(data.value.replace(/\./g, "").replace(",", ".")),
      service_date: data.service_date,
      payment_date: data.payment_date,
      status,
      notes: data.notes || undefined,
    });
    navigate("/services");
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
                  {serviceCount}/{limits.maxServices} serviços utilizados
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
                  <Label htmlFor="value" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <DollarSign className="h-3 w-3" /> Valor Cobrado (R$)
                  </Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="service_date" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Data do Serviço
                    </Label>
                    <div className="flex gap-2">
                      <Input id="service_date" type="date" className="h-12 rounded-xl bg-muted/30 border-none" {...register("service_date")} />
                      <Button type="button" variant="outline" size="sm" className="h-12 rounded-xl px-4 text-xs font-bold" onClick={() => setToday("service_date")}>
                        Hoje
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_date" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3 w-3" /> Expectativa de Pagamento
                    </Label>
                    <div className="flex gap-2">
                      <Input id="payment_date" type="date" className="h-12 rounded-xl bg-muted/30 border-none" {...register("payment_date")} />
                      <Button type="button" variant="outline" size="sm" className="h-12 rounded-xl px-4 text-xs font-bold" onClick={() => setToday("payment_date")}>
                        Hoje
                      </Button>
                    </div>
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
    </>
  );
}
