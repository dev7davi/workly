import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Briefcase, Download, Printer, User, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatDateLong } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function OS() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const osRef = useRef<HTMLDivElement>(null);

    const { services, loading: loadingServices } = useServices();
    const { data: profile, isLoading: loadingProfile } = useProfile();

    const service = services.find((s) => s.id === id);
    const isLoading = loadingServices || loadingProfile;

    const { canUseOS, canUseWhiteLabel } = usePlan();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        if (!isLoading && !canUseOS) {
            setShowUpgradeModal(true);
        }
    }, [isLoading, canUseOS]);

    const generatePDF = async () => {
        if (!osRef.current || !service) return;

        try {
            toast({
                title: "Gerando PDF...",
                description: "Formatando em modo paisagem (A4).",
            });

            const canvas = await html2canvas(osRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                width: 1123,
                height: 794,
            });

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [1123, 794],
            });

            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", 0, 0, 1123, 794);
            pdf.save(`OS_${service.id.substring(0, 8)}_${service.client_name.replace(/\s+/g, "_")}.pdf`);

            toast({
                title: "PDF Gerado!",
                description: "Arquivo baixado com sucesso.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao gerar PDF",
                description: "Tente novamente em instantes.",
                variant: "destructive",
            });
        }
    };

    const generatePNG = async () => {
        if (!osRef.current || !service) return;

        try {
            toast({
                title: "Gerando Imagem...",
            });

            const canvas = await html2canvas(osRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                width: 1123,
                height: 794,
            });

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `OS_${service.id.substring(0, 8)}.png`;
                link.click();
                URL.revokeObjectURL(url);
            }, "image/png");

            toast({
                title: "Imagem Gerada!",
            });
        } catch (error) {
            console.error(error);
        }
    };

    const shareWhatsApp = () => {
        if (!service) return;

        const cleanPhone = profile?.phone?.replace(/\D/g, "") || "";
        const message = encodeURIComponent(
            `Olá ${service.client_name}!\n\nSua Ordem de Serviço #${service.id.substring(0, 8).toUpperCase()} foi gerada.\n\n*Detalhes:*\n- Serviço: ${service.service_type}\n- Valor: ${formatCurrency(service.value)}\n- Data: ${new Date(service.service_date).toLocaleDateString("pt-BR")}\n\nAtenciosamente,\n${profile?.company_name || profile?.name || "Workly"}`
        );

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const url = isMobile 
            ? `whatsapp://send?text=${message}` 
            : `https://wa.me/?text=${message}`;

        window.open(url, "_blank");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-[600px] w-full rounded-2xl" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                <h2 className="text-2xl font-black text-muted-foreground mt-4">Serviço não encontrado</h2>
                <Button className="mt-6 rounded-2xl h-12 px-8" onClick={() => navigate("/services")}>
                    Voltar para Serviços
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 max-w-[1200px] mx-auto w-full pb-24 animate-in fade-in duration-300">
            {showUpgradeModal && <UpgradeModal onClose={() => { setShowUpgradeModal(false); navigate(-1) }} />}

            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold leading-none">Ordem de Serviço</h1>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Formato Paisagem A4</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={generatePDF} className="rounded-xl gap-2 font-bold bg-primary/5 text-primary border-primary/20">
                        <FileText className="h-4 w-4" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={generatePNG} className="rounded-xl gap-2 font-bold">
                        <Download className="h-4 w-4" /> PNG
                    </Button>
                </div>
            </header>

            {/* Preview Container com Scroll Horizontal no Mobile */}
            <div className="w-full overflow-x-auto pb-4 rounded-3xl bg-muted/20 p-4 lg:p-8 flex justify-center">
                <div 
                    ref={osRef}
                    className="bg-white text-slate-900 shadow-2xl flex flex-col justify-between shrink-0"
                    style={{
                        width: "1123px",
                        height: "794px",
                        padding: "60px",
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    {/* Top Bar Branding */}
                    <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
                        <div className="space-y-4">
                            <div className="bg-slate-900 text-white px-4 py-1 inline-block rounded-lg">
                                <p className="text-[10px] font-black tracking-[0.4em] uppercase">Ordem de Serviço</p>
                            </div>
                            <h1 className="text-5xl font-black tracking-tight text-slate-900">
                                {(canUseWhiteLabel && profile?.company_name) ? profile.company_name : (profile?.name || "Workly")}
                            </h1>
                            <div className="flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                <span>{profile?.document || "Doc não inf."}</span>
                                <span>{profile?.phone || "Tel não inf."}</span>
                                <span>ID: {service.id.substring(0, 8).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 text-right">
                            {canUseWhiteLabel && profile?.company_logo_url ? (
                                <img src={profile.company_logo_url} className="h-20 w-40 object-contain" alt="Logo" />
                            ) : (
                                <div className="flex flex-col items-end">
                                    <img src="/logo_w6.png" className="h-10 object-contain grayscale" alt="Workly" />
                                    <p className="text-[9px] font-black text-slate-400 mt-2 tracking-widest">WORKLY ORGANIZER</p>
                                </div>
                            )}
                            <div className="mt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Data de Emissão</p>
                                <p className="text-sm font-black">{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-2 gap-12 py-10">
                        {/* Coluna 1: Cliente e Serviço */}
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Informações do Cliente
                                </h2>
                                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex items-center gap-6">
                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <Briefcase className="h-8 w-8 text-primary/40" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{service.client_name}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Cliente Registrado</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="h-3 w-3" /> Descritivo do Serviço
                                </h2>
                                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 min-h-[160px]">
                                    <p className="text-lg font-black text-slate-800">{service.service_type}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed italic">
                                        {service.notes || "Nenhuma observação técnica adicional registrada para esta ordem de serviço."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: Prazos e Valores */}
                        <div className="space-y-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Execução</p>
                                    <p className="font-black text-slate-900">{new Date(service.service_date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                                    <p className="font-black text-slate-900">{new Date(service.payment_date).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white rounded-3xl p-10 flex flex-col justify-between h-full relative overflow-hidden shadow-xl">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Valor Total do Serviço</p>
                                    <h3 className="text-6xl font-black mt-2 tracking-tighter">{formatCurrency(service.value)}</h3>
                                </div>
                                <div className="mt-10 flex justify-between items-end border-t border-white/10 pt-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Técnico Responsável</p>
                                        <p className="text-sm font-bold">{profile?.name || "Equipe Workly"}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                                        <Printer className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-8 opacity-40">
                        <p className="text-[10px] font-black tracking-widest uppercase">Gerado automaticamente por Workly Organizer • {new Date().toLocaleTimeString('pt-BR')}</p>
                        <p className="text-[10px] font-bold">Página 01 / 01</p>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (WhatsApp) */}
            <div className="fixed bottom-[calc(var(--menu-height)+32px)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
                <Button 
                    onClick={shareWhatsApp}
                    className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-2xl flex items-center justify-center gap-3 text-lg font-black transition-all active:scale-95"
                >
                    <MessageCircle className="h-6 w-6 fill-current" />
                    Enviar via WhatsApp
                </Button>
            </div>
        </div>
    );
}
