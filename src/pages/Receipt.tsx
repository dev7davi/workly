import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Briefcase, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, ServiceStatus } from "@/hooks/useServices";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatDateLong } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const statusConfig: Record<ServiceStatus, { label: string; color: string; icon: any }> = {
  paid: { label: "Pago", color: "bg-success text-success-foreground", icon: CheckCircle },
  pending: { label: "Pendente", color: "bg-warning text-warning-foreground", icon: Clock },
  cancelled: { label: "Cancelado", color: "bg-destructive text-destructive-foreground", icon: XCircle },
};

export default function Receipt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

  const { services, updateService, loading } = useServices();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const service = services.find((s) => s.id === id);
  const isLoading = loading || profileLoading;

  const handleShare = async () => {
    if (!service || !receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, { backgroundColor: "#fff", quality: 1, pixelRatio: 2 });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `comprovante-${service.client_name.toLowerCase().replace(/\s+/g, "-")}.png`, { type: blob.type });

      const shareText = `Olá ${service.client_name}! Segue o comprovante do serviço: *${service.service_type}*.`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Comprovante de Serviço",
          text: shareText,
        });
      } else {
        // Fallback: Copy Link or Text
        await navigator.clipboard.writeText(`${shareText}\n\nValor: ${formatCurrency(service.value)}`);
        toast({
          title: "Texto copiado!",
          description: "O compartilhamento de arquivos não é suportado neste navegador. O resumo foi copiado.",
        });
      }

      if (!service.receipt_generated) {
        await updateService(service.id, { receipt_generated: true });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar imagem",
        description: "Não foi possível gerar o comprovante para compartilhar.",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!service || !profile) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235); // Primary color
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("WORKLY", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Comprovante de Prestação de Serviço", 105, 30, { align: "center" });

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("PRESTADOR", 20, 55);
    doc.setFontSize(14);
    doc.text(profile.name, 20, 65);
    if (profile.document) doc.text(profile.document, 20, 72);

    doc.setFontSize(10);
    doc.text("CLIENTE", 20, 85);
    doc.setFontSize(14);
    doc.text(service.client_name, 20, 95);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 105, 190, 105);

    doc.setFontSize(10);
    doc.text("ESPECIFICAÇÃO DO SERVIÇO", 20, 115);
    doc.setFontSize(12);
    doc.text(service.service_type, 20, 125);
    if (service.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(service.notes, 20, 135, { maxWidth: 170 });
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("DATA", 20, 160);
    doc.text("VALOR TOTAL", 140, 160);
    
    doc.setFontSize(12);
    doc.text(formatDateLong(service.service_date), 20, 170);
    doc.setFontSize(20);
    doc.text(formatCurrency(service.value), 140, 170);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Identificador: ${service.id.toUpperCase()}`, 105, 280, { align: "center" });

    doc.save(`comprovante-${service.id.slice(0, 8)}.pdf`);
    
    toast({
      title: "PDF Gerado!",
      description: "O comprovante foi baixado com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <div className="bg-muted p-4 rounded-full mb-2">
          <XCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Serviço não encontrado</p>
        <Button onClick={() => navigate("/services")} variant="outline">
          Voltar para lista
        </Button>
      </div>
    );
  }

  const status = statusConfig[service.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Comprovante</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="rounded-full gap-2">
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </header>

      <div ref={receiptRef} className="bg-background overflow-hidden rounded-2xl border shadow-xl relative">
        {/* Top Header */}
        <div className="bg-primary p-8 text-center text-primary-foreground">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">WORKLY</h2>
          <p className="text-sm font-medium opacity-80 uppercase tracking-widest">
            Documento de Prestação
          </p>
        </div>

        {/* Diagonal cut corner effect (decorative) */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 origin-bottom-right rotate-45 pointer-events-none" />

        <CardContent className="p-8 space-y-8 relative">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Emitente</label>
              <p className="text-lg font-bold text-foreground leading-tight">{profile?.name}</p>
              {profile?.document && <p className="text-xs text-muted-foreground font-medium">{profile.document}</p>}
            </div>

            <div className="space-y-1.5 md:text-right">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</label>
              <p className="text-lg font-bold text-foreground leading-tight">{service.client_name}</p>
            </div>
          </div>

          {/* Dotted Separator */}
          <div className="border-t-2 border-dashed border-muted mt-2" />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descrição do Serviço</label>
              <p className="text-xl font-bold text-foreground">{service.service_type}</p>
              {service.notes && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic">
                  "{service.notes}"
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 bg-muted/30 p-4 rounded-xl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data do Serviço</label>
                <p className="font-bold">{formatDateLong(service.service_date)}</p>
              </div>
              <div className="space-y-1.5 text-right">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Valor Total</label>
                <p className="text-2xl font-black text-primary">{formatCurrency(service.value)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col items-center gap-2">
            <div className="h-10 w-48 bg-muted rounded flex items-center justify-center border border-dashed opacity-50">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                {service.id.toUpperCase()}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em] opacity-50">
              Autenticado pelo Workly
            </p>
          </div>
        </CardContent>
        
        {/* Serrated edge effect (decorative) */}
        <div className="h-2 w-full flex overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="min-w-[20px] h-4 bg-muted/50 rounded-full -mt-2 mx-auto first:hidden last:hidden" />
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto">
        <Button className="w-full h-14 bg-success hover:bg-success/90 text-success-foreground shadow-2xl rounded-2xl text-lg font-bold gap-3 transition-all hover:scale-[1.02] active:scale-95" onClick={handleShare}>
          <Share2 className="h-6 w-6" />
          Compartilhar no WhatsApp
        </Button>
      </div>
    </div>
  );
}
