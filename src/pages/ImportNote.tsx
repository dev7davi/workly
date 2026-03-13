import { useState, useRef } from "react";
import { ArrowLeft, Loader2, Image as ImageIcon, FileText, Check, ScanText, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useEffect } from "react";

interface ParsedData {
    client: string;
    phone: string;
    service: string;
    value: string;
    date: string;
}

export default function ImportNote() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [step, setStep] = useState<"input" | "processing" | "confirm">("input");
    const [textMode, setTextMode] = useState(false);
    const [inputText, setInputText] = useState("");
    const [parsed, setParsed] = useState<ParsedData>({ client: "", phone: "", service: "", value: "", date: "" });
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { canUseOCR } = usePlan();

    useEffect(() => {
        if (!canUseOCR) {
            setShowUpgradeModal(true);
        }
    }, [canUseOCR]);

    const processText = (text: string) => {
        // Simple heuristic parser
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const result: ParsedData = { client: "", phone: "", service: "", value: "", date: "" };

        for (const line of lines) {
            const lower = line.toLowerCase();
            if (lower.includes("cliente") || lower.includes("nome:")) {
                result.client = line.replace(/.*cliente|.*nome/i, "").replace(/[:]/, "").trim();
            } else if (lower.includes("tel") || lower.includes("celular") || lower.includes("telefone")) {
                result.phone = line.replace(/.*tel.*|.*celular.*|.*telefone.*/i, "").replace(/[:]/, "").trim();
            } else if (line.match(/(?:\(?0?\d{2}\)?\s*)?\b9?\d{4}[-.\s]?\d{4}\b/)) {
                const numbersOnly = line.replace(/[^\d]/g, "");
                if (numbersOnly.length >= 10 && numbersOnly.length <= 11) {
                    result.phone = numbersOnly;
                }
            } else if (lower.includes("serviço") || lower.includes("servico") || lower.includes("trabalho")) {
                result.service = line.replace(/.*serviço|.*servico|.*trabalho/i, "").replace(/[:]/, "").trim();
            } else if (lower.includes("valor") || line.includes("R$")) {
                result.value = line.replace(/.*valor/i, "").replace(/[:R$]/g, "").trim();
            } else if (lower.includes("data") || line.match(/\d{2}\/\d{2}\/\d{2,4}/)) {
                result.date = line.replace(/.*data/i, "").replace(/[:]/, "").trim();
                // Basic date extraction
                const dm = line.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})/);
                if (dm) {
                    const yyyy = dm[3].length === 2 ? `20${dm[3]}` : dm[3];
                    result.date = `${yyyy}-${dm[2]}-${dm[1]}`;
                }
            }
        }
        setParsed(result);
        setStep("confirm");
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep("processing");
        try {
            toast({ title: "Iniciando OCR...", description: "Lendo a imagem, aguarde um instante." });

            const worker = await Tesseract.createWorker('por');
            const ret = await worker.recognize(file);
            await worker.terminate();

            // Descartar arquivo (já descartado por não ser salvo no db nem bucket)
            processText(ret.data.text);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error(err);
            toast({ title: "Erro na leitura", description: "Não foi possível ler a imagem. Tente enviar como texto.", variant: "destructive" });
            setStep("input");
        }
    };

    const handleTextSubmit = () => {
        if (!inputText.trim()) return;
        setStep("processing");
        setTimeout(() => {
            processText(inputText);
        }, 500);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            // 1. Procurar ou Criar Cliente
            let clientId = null;
            let clientName = parsed.client || "Cliente Importado API";

            const { data: existingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", user.id)
                .ilike("name", `%${clientName}%`)
                .limit(1)
                .maybeSingle();

            if (existingClient?.id) {
                clientId = existingClient.id;
            } else {
                const { data: newClient, error: clientErr } = await supabase
                    .from("clients")
                    .insert({
                        user_id: user.id,
                        name: clientName,
                        phone: parsed.phone || null,
                    })
                    .select("id")
                    .single();

                if (clientErr) throw clientErr;
                clientId = newClient.id;
            }

            // 2. Criar Serviço
            let safeDate = parsed.date;
            if (!safeDate || !safeDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                safeDate = new Date().toISOString().split('T')[0];
            }

            const safeValue = parseFloat(parsed.value.replace(",", ".").replace(/[^0-9.]/g, "")) || 0;

            const { error: servErr } = await supabase
                .from("services")
                .insert({
                    user_id: user.id,
                    client_id: clientId,
                    client_name: clientName,
                    service_type: parsed.service || "Serviço Importado",
                    value: safeValue,
                    service_date: safeDate,
                    payment_date: safeDate,
                    status: "pending"
                });

            if (servErr) throw servErr;

            toast({ title: "Sucesso!", description: "Dados importados e salvos." });
            navigate("/services");
        } catch (error: any) {
            console.error(error);
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 pb-28 max-w-7xl mx-auto w-full min-h-screen animate-in fade-in zoom-in duration-300">
            {showUpgradeModal && <UpgradeModal onClose={() => { setShowUpgradeModal(false); navigate(-1) }} />}

            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Importar Anotação</h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-80">Processamento Automático OCR</p>
                </div>
            </header>

            {step === "input" && (
                <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden">
                    <CardContent className="p-6 space-y-6 flex flex-col items-center">

                        {!textMode ? (
                            <div className="w-full flex justify-center py-6">
                                <label className="relative w-full aspect-video max-w-sm rounded-[2rem] border-4 border-dashed border-primary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors group">
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="h-10 w-10 text-primary" />
                                    </div>
                                    <p className="font-black text-lg">Subir Imagem</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">.JPG .PNG .WEBP (Com texto)</p>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="w-full space-y-3">
                                <Label className="font-black uppercase text-[10px] text-muted-foreground tracking-widest">Colar Anotação Texto</Label>
                                <Textarea
                                    className="h-40 rounded-2xl bg-muted/40 border-none font-medium"
                                    placeholder={`Cliente: João Silva\nTelefone: 11 99999-9999\nServiço: Troca de válvula\nValor: R$ 150,00\nData: 10/04/2026`}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                />
                                <Button className="w-full h-14 rounded-xl font-black shadow-lg" onClick={handleTextSubmit}>
                                    <ScanText className="mr-2 h-5 w-5" /> Processar Texto Livre
                                </Button>
                            </div>
                        )}

                        <div className="w-full pt-4 border-t border-border flex items-center justify-center">
                            <Button variant="ghost" onClick={() => setTextMode(!textMode)} className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground">
                                {textMode ? "Ou voltar para upload de Imagem" : "Ou digitar/colar o texto manualmente"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === "processing" && (
                <div className="flex flex-col items-center justify-center p-12 text-center h-64 gap-6 animate-pulse">
                    <div className="relative">
                        <div className="h-24 w-24 border-8 border-primary rounded-full animate-spin border-t-transparent" />
                        <ScanText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">Processando...</h2>
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Extraindo dados e OCR</p>
                    </div>
                </div>
            )}

            {step === "confirm" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8">
                    <Card className="border-none shadow-2xl rounded-[2rem] bg-gradient-to-br from-card to-muted/20">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center bg-primary/10 text-primary p-3 rounded-xl mb-4">
                                <p className="text-xs font-black uppercase tracking-widest"><Check className="inline h-4 w-4 mr-1" /> Dados Lidos</p>
                            </div>

                            {[
                                { k: 'client', l: 'Nome do Cliente' },
                                { k: 'phone', l: 'Telefone' },
                                { k: 'service', l: 'Serviço Prestado' },
                                { k: 'value', l: 'Valor R$' },
                                { k: 'date', l: 'Data do Serviço' },
                            ].map((f) => (
                                <div key={f.k} className="space-y-1">
                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">{f.l}</Label>
                                    <Input
                                        value={parsed[f.k as keyof ParsedData]}
                                        onChange={e => setParsed({ ...parsed, [f.k]: e.target.value })}
                                        className="h-12 rounded-xl bg-background border-none shadow-sm focus-visible:ring-primary font-bold"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-xs" onClick={() => setStep("input")}>
                            Cancelar
                        </Button>
                        <Button className="flex-1 h-16 rounded-2xl font-black uppercase text-xs" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5 mr-2" /> Confirmar e Salvar</>}
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}
