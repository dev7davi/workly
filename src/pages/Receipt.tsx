import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatDateLong } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

export default function Receipt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { services, updateService, loading } = useServices();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const service = services.find((s) => s.id === id);

  const isLoading = loading || profileLoading;

  const handleShare = async () => {
    if (!service) return;

    const text = `✅ COMPROVANTE DE SERVIÇO

📋 Prestador: ${profile?.name}
👤 Cliente: ${service.client_name}
🔧 Serviço: ${service.service_type}
💰 Valor: ${formatCurrency(service.value)}
📅 Data: ${formatDateLong(service.service_date)}

— Gerado pelo WORKLY`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        if (!service.receipt_generated) {
          await updateService(service.id, {
            receipt_generated: true,
          });
        }
      } catch {
        // usuário cancelou
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description:
          "Comprovante copiado para a área de transferência.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">
          Serviço não encontrado
        </p>
        <Button onClick={() => navigate("/services")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          Comprovante
        </h1>
      </header>

      <Card className="overflow-hidden">
        <div className="bg-gradient-hero p-6 text-center text-primary-foreground">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">WORKLY</h2>
          <p className="text-sm opacity-90">
            Comprovante de Serviço
          </p>
        </div>

        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Prestador
            </p>
            <p className="font-semibold">
              {profile?.name}
            </p>
            {profile?.document && (
              <p className="text-sm text-muted-foreground">
                {profile.document}
              </p>
            )}
          </div>

          <hr />

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Cliente
            </p>
            <p className="font-semibold">
              {service.client_name}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Serviço
            </p>
            <p className="font-semibold">
              {service.service_type}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Data
              </p>
              <p className="font-semibold">
                {formatDateLong(service.service_date)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Valor
              </p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(service.value)}
              </p>
            </div>
          </div>

          {service.notes && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Observações
              </p>
              <p className="text-sm">
                {service.notes}
              </p>
            </div>
          )}

          <hr />

          <p className="text-center text-xs text-muted-foreground">
            ID: {service.id.slice(0, 8).toUpperCase()}
          </p>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-gradient-hero py-6"
        onClick={handleShare}
      >
        <Share2 className="mr-2 h-5 w-5" />
        Compartilhar no WhatsApp
      </Button>
    </div>
  );
}
