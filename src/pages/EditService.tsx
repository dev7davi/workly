import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Check, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const serviceSchema = z.object({
  client_name: z.string().min(2, "Digite o nome do cliente"),
  service_type: z.string().min(2, "Descreva o serviço"),
  value: z.string().min(1, "Digite o valor"),
  service_date: z.string().min(1, "Selecione a data"),
  payment_date: z.string().min(1, "Selecione a data"),
  status: z.enum(["pending", "paid", "cancelled"]),
  notes: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

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

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">Serviço não encontrado</p>
        <Button onClick={() => navigate("/services")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Editar Serviço</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/services/${id}/receipt`)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Comprovante
        </Button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do cliente *</Label>
              <Input id="client_name" {...register("client_name")} />
              {errors.client_name && (
                <p className="text-sm text-destructive">
                  {errors.client_name.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de serviço *</Label>
              <Input id="service_type" {...register("service_type")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  inputMode="decimal"
                  {...register("value")}
                />
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) =>
                    setValue("status", v as ServiceStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_date">Data do serviço</Label>
                <Input
                  id="service_date"
                  type="date"
                  {...register("service_date")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_date">Data pagamento</Label>
                <Input
                  id="payment_date"
                  type="date"
                  {...register("payment_date")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="submit"
            className="flex-1 bg-gradient-hero"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
