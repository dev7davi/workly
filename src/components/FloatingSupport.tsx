import { useState } from "react";
import { HelpCircle, MessageCircle, BookOpen, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function FloatingSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const WHATSAPP_NUMBER = "5517992030665"; 
    const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de suporte no ${APP_NAME}.`;

    const handleHelp = () => {
        setIsOpen(false);
        navigate("/help");
    };

    return (
        <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end gap-3 pointer-events-none">
            {/* Menu */}
            {isOpen && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200 pointer-events-auto">
                    <button
                        onClick={() => window.open(WHATSAPP_URL, "_blank")}
                        className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-border rounded-2xl p-3 shadow-xl hover:scale-105 active:scale-95 transition-all text-emerald-600"
                    >
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div className="text-left pr-4">
                            <p className="text-xs font-black uppercase tracking-tight">Suporte WhatsApp</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Falar com humanos</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                    </button>

                    <button
                        onClick={handleHelp}
                        className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-border rounded-2xl p-3 shadow-xl hover:scale-105 active:scale-95 transition-all text-primary"
                    >
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="text-left pr-4">
                            <p className="text-xs font-black uppercase tracking-tight">Central de Ajuda</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Tutoriais e Manuais</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                    </button>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110 active:scale-90",
                    isOpen 
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rotate-90" 
                        : "bg-primary text-white"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <HelpCircle className="h-7 w-7" />}
            </button>
        </div>
    );
}
