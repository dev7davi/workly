import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Briefcase, Download, Printer, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatDateLong } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useState, useEffect } from "react";

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
                title: "Gerando OS...",
                description: "Aguarde um momento...",
            });

            const element = osRef.current;
            const dataUrl = await toPng(element, { quality: 1, backgroundColor: '#ffffff', pixelRatio: 2 });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Ordem_Servico_${service.client_name.replace(/\s+/g, '_')}_${service.id.substring(0, 6)}.pdf`);

            toast({
                title: "Sucesso!",
                description: "Ordem de Serviço exportada com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao gerar PDF",
                description: "Ocorreu um erro interno. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const shareOS = async () => {
        if (!osRef.current || !service) return;
        try {
            const element = osRef.current;
            const dataUrl = await toPng(element, { quality: 0.9, backgroundColor: '#ffffff', pixelRatio: 2 });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `OS_${service.client_name.replace(/\s+/g, '_')}.png`, { type: "image/png" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Ordem de Serviço - ${service.service_type}`,
                    text: `Segue a Ordem de Serviço para: ${service.client_name}`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Compartilhamento não suportado",
                    description: "Seu navegador/dispositivo não suporta envio direto. Baixe o PDF.",
                });
            }
        } catch (error) {
            console.error(error);
        }
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
        <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
            {showUpgradeModal && <UpgradeModal onClose={() => { setShowUpgradeModal(false); navigate(-1) }} />}

            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Ordem de Serviço</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={generatePDF} className="rounded-full gap-2">
                        <Download className="h-4 w-4" /> PDF
                    </Button>
                </div>
            </header>

            {/* OS Container visible on screen */}
            <div className="filter drop-shadow-xl flex justify-center pb-10">
                {/* The actual A4-like OS element to capture */}
                <div
                    ref={osRef}
                    className="bg-[#f8f9fa] w-full max-w-[800px] text-slate-900 border"
                    style={{
                        fontFamily: "'Inter', sans-serif"
                    }}>

                    {/* Header Card Dark */}
                    <div className="p-8">
                        <div className="bg-[#111] text-white rounded-3xl p-8 relative overflow-hidden flex justify-between items-center shadow-2xl">
                            <div className="z-10 relative space-y-2">
                                <p className="tracking-[0.3em] font-black text-[10px] text-slate-400">ORDEM DE SERVIÇO</p>
                                <h1 className="text-4xl font-black tracking-tight leading-none text-white">
                                    {(canUseWhiteLabel && profile?.company_name) ? profile.company_name : (profile?.name || "Prestador Autônomo")}
                                </h1>
                                <div className="text-xs text-slate-300 space-y-0.5 mt-2">
                                    {profile?.document && <p>{profile.document}</p>}
                                    {profile?.phone && <p>{profile.phone}</p>}
                                    <p>ID da O.S: {service.id.substring(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="z-10 relative flex flex-col items-end">
                                {/* Dynamic Logo or Placeholder */}
                                {canUseWhiteLabel && profile?.company_logo_url ? (
                                    <img 
                                        src={profile.company_logo_url} 
                                        className="h-16 w-32 object-contain drop-shadow-md" 
                                        alt="Company Logo" 
                                    />
                                ) : !canUseWhiteLabel ? (
                                    <div className="flex flex-col items-end gap-2">
                                        <img src="/logo_w6.png" className="h-10 object-contain drop-shadow-md brightness-0 invert opacity-100" alt="Workly Logo" />
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Seu trabalho, organizado</span>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                        <User className="text-slate-400 h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="absolute top-0 right-10 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full" />
                        </div>
                    </div>

                    <div className="px-8 pb-12 space-y-8">

                        {/* Cliente */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase ml-1">Cliente</h2>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</p>
                                    <p className="text-xl font-bold text-slate-800">{service.client_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Resumo */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase ml-1">Resumo</h2>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título</p>
                                        <p className="font-bold text-slate-800">{service.service_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</p>
                                        <p className="font-bold text-slate-800">{formatDateLong(service.payment_date)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</p>
                                        <p className="font-medium text-sm text-slate-600">
                                            {service.notes || "Serviço padrão. Nenhuma anotação adicional registrada para o trabalho descrito."}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</p>
                                        <p className="font-bold text-slate-800">{profile?.name || "Equipe de Atendimento"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Itens */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase ml-1">Itens e Serviços</h2>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[16rem] flex flex-col justify-between overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {/* Table Header - Desktop Only */}
                                    <div className="hidden sm:grid grid-cols-12 gap-4 p-6 bg-slate-50/50">
                                        <div className="col-span-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</div>
                                        <div className="col-span-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">QTD</div>
                                        <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Unitário</div>
                                        <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</div>
                                    </div>

                                    {/* Main Item Card/Row */}
                                    <div className="p-6">
                                        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:items-center">
                                            <div className="sm:col-span-6">
                                                <p className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descrição</p>
                                                <p className="font-bold text-slate-800 text-lg sm:text-sm">{service.service_type}</p>
                                            </div>
                                            <div className="flex justify-between sm:contents border-t border-slate-50 pt-3 sm:pt-0">
                                                <div className="sm:col-span-2 text-left sm:text-center">
                                                    <p className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">QTD</p>
                                                    <p className="text-slate-600 font-medium sm:text-sm">1</p>
                                                </div>
                                                <div className="sm:col-span-2 text-right">
                                                    <p className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unitário</p>
                                                    <p className="text-slate-600 font-medium sm:text-sm">{formatCurrency(service.value)}</p>
                                                </div>
                                                <div className="sm:col-span-2 text-right">
                                                    <p className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                                    <p className="font-black text-slate-800 text-lg sm:text-sm">{formatCurrency(service.value)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional Notes Sub-item */}
                                    {service.notes && service.notes.length > 5 && (
                                        <div className="p-6 bg-slate-50/30">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Anotações Adicionais</p>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">
                                                {service.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Totals */}
                                <div className="flex justify-end p-6 border-t border-slate-200 bg-slate-50/50">
                                    <div className="flex items-center gap-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Geral</p>
                                        <p className="text-3xl font-black text-slate-900">{formatCurrency(service.value)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom line */}
                        {!canUseWhiteLabel ? (
                            <div className="pt-8 text-center border-t border-slate-200 mt-8 opacity-60">
                                <p className="text-xs text-slate-500 font-medium">
                                    Gerado através do WORKLY - Automação Ágil
                                </p>
                            </div>
                        ) : (
                            <div className="pt-8 text-center border-t border-slate-200 mt-8 opacity-60">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest block">
                                    {profile?.name} - Prestação de Serviços
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <div className="fixed bottom-[calc(var(--menu-height)+32px)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-auto md:min-w-[400px] flex gap-3 z-50 animate-in slide-in-from-bottom-5 duration-500">
                <Button className="flex-1 h-14 bg-success hover:bg-success/90 text-success-foreground shadow-2xl rounded-2xl text-lg font-bold gap-3 transition-all" onClick={shareOS}>
                    <Share2 className="h-6 w-6" />
                    WhatsApp
                </Button>
            </div>

        </div>
    );
}
