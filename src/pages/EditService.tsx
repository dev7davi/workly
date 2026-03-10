import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Check, Trash2, FileText, User, Briefcase, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, ServiceStatus } from "@/hooks/useServices";
import { useEffect } from "react";
import { ServiceCostsSection } from "@/components/services/ServiceCostsSection";
import { ServiceMediaSection } from "@/components/services/ServiceMediaSection";
import { ClientNameField } from "@/components/ClientNameField";
import { cn } from "@/lib/utils";

const serviceSchema = z.object({
  client_name: z.string().min(2, "Nome obrigatório"),
  service_type: z.string().min(2, "Tipo de serviço obrigatório"),
  value: z.string().min(1, "Valor obrigatório"),
  service_date: z.string().min(1, "Data obrigatória"),
  payment_date: z.string().min(1, "Data obrigatória"),
  status: z.enum(["pending", "paid", "cancelled"]),
  notes: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

const STATUS_CONFIG = {
  pending: { label: "Pendente", color: "bg-amber-500/10 border-amber-500/30 text-amber-600" },
  paid: { label: "Pago", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" },
  cancelled: { label: "Cancelado", color: "bg-slate-500/10 border-slate-500/30 text-slate-500" },
};

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { services, updateService, deleteService, loading } = useServices();
  const service = services.find((s) => s.id === id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (service) {
      setValue("client_name", service.client_name);
      setValue("service_type", service.service_type);
      setValue("value", String(service.value));
      setValue("service_date", service.service_date.slice(0, 10));
      setValue("payment_date", service.payment_date.slice(0, 10));
      setValue("status", service.status);
      setValue("notes", service.notes || "");
    }
  }, [service, setValue]);

  const onSubmit = async (data: ServiceForm) => {
    if (!id) return;
    await updateService(id, {
      client_name: data.client_name,
      service_type: data.service_type,
      value: Number(data.value.replace(",", ".")),
      service_date: data.service_date,
      payment_date: data.payment_date,
      status: data.status as ServiceStatus,
      notes: data.notes || undefined,
    });
    navigate("/services");
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteService(id);
    navigate("/services");
  };

  const currentStatus = watch("status");

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-black uppercase">Serviço não encontrado</p>
        <Button onClick={() => navigate("/services")} className="rounded-2xl font-black">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-36 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Editar Serviço</h1>
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              {service.client_name}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/services/${id}/receipt`)}
          className="rounded-xl font-bold gap-1"
        >
          <FileText className="h-4 w-4" />
          Comprovante
        </Button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Status selector bar */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-2xl">
          {(["pending", "paid", "cancelled"] as ServiceStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue("status", s)}
              className={cn(
                "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all",
                currentStatus === s
                  ? STATUS_CONFIG[s].color
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Client + Service info */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-card/50">
          <CardContent className="p-6 space-y-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <User className="h-3 w-3" /> Dados do Atendimento
            </p>

            <ClientNameField
              value={watch("client_name") || ""}
              onChange={(name) => setValue("client_name", name, { shouldValidate: true })}
              error={errors.client_name?.message}
            />

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Tipo de Serviço *</Label>
              <Input
                className="h-12 rounded-xl bg-muted/30 border-none"
                placeholder="Ex: Pintura, Instalação..."
                {...register("service_type")}
              />
              {errors.service_type && <p className="text-xs text-destructive">{errors.service_type.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Valor Cobrado (R$) *
                </Label>
                <Input
                  className="h-12 rounded-xl bg-muted/30 border-none text-lg font-black text-primary"
                  inputMode="decimal"
                  placeholder="0,00"
                  {...register("value")}
                />
                {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Status *</Label>
                <Select value={currentStatus} onValueChange={(v) => setValue("status", v as ServiceStatus)}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Pendente</SelectItem>
                    <SelectItem value="paid">✅ Pago</SelectItem>
                    <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Data do Serviço
                </Label>
                <Input
                  type="date"
                  className="h-12 rounded-xl bg-muted/30 border-none"
                  {...register("service_date")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Data de Pgto.</Label>
                <Input
                  type="date"
                  className="h-12 rounded-xl bg-muted/30 border-none"
                  {...register("payment_date")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Observações</Label>
              <Textarea
                className="rounded-xl bg-muted/30 border-none min-h-[80px]"
                placeholder="Detalhes do serviço..."
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        {id && <ServiceMediaSection serviceId={id} />}

        {/* Action Buttons inside form */}
        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-14 px-5 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black">Excluir serviço?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os custos vinculados também serão removidos. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold bg-destructive">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="submit"
            className="flex-1 h-14 rounded-2xl font-black bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Costs Section — outside the form to avoid submit conflicts */}
      <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-card/50">
        <CardContent className="p-6">
          <ServiceCostsSection
            serviceId={service.id}
            serviceValue={Number(watch("value")?.replace(",", ".") || service.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
