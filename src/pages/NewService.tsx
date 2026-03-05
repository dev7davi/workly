import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServices } from "@/hooks/useServices";

const serviceSchema = z.object({
  client_name: z.string().min(2, "Digite o nome do cliente"),
  service_type: z.string().min(2, "Descreva o serviço"),
  value: z
    .string()
    .min(1, "Digite o valor")
    .refine(
      (v) =>
        !isNaN(parseFloat(v.replace(",", "."))) &&
        parseFloat(v.replace(",", ".")) > 0,
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      service_date: new Date().toISOString().slice(0, 10),
      payment_date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: ServiceForm) => {
    await createService({
      client_name: data.client_name,
      service_type: data.service_type,
      value: Number(data.value.replace(/\./g, "").replace(",", ".")),
      service_date: data.service_date,
      payment_date: data.payment_date,
      status: "pending",
      notes: data.notes || undefined,
    });

    navigate("/services");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          Novo Serviço
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">
                Nome do cliente *
              </Label>
              <Input
                id="client_name"
                placeholder="Ex: João Silva"
                {...register("client_name")}
              />
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
            <CardTitle className="text-base">
              Detalhes do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">
                Tipo de serviço *
              </Label>
              <Input
                id="service_type"
                placeholder="Ex: Manutenção elétrica"
                {...register("service_type")}
              />
              {errors.service_type && (
                <p className="text-sm text-destructive">
                  {errors.service_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                placeholder="0,00"
                inputMode="decimal"
                {...register("value")}
              />
              {errors.value && (
                <p className="text-sm text-destructive">
                  {errors.value.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_date">
                  Data do serviço *
                </Label>
                <Input
                  id="service_date"
                  type="date"
                  {...register("service_date")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">
                  Data pagamento *
                </Label>
                <Input
                  id="payment_date"
                  type="date"
                  {...register("payment_date")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Anotações sobre o serviço..."
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-gradient-hero py-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Cadastrar Serviço
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
