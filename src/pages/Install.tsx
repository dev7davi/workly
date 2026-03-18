import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Download, Smartphone, Check, ArrowLeft, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      <header className="flex items-center gap-4 mb-8">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <span className="text-xl font-black tracking-tighter uppercase">{APP_NAME}</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 max-w-md mx-auto">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 shadow-2xl shadow-primary/40 relative z-10">
            <Smartphone className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Instalar {APP_NAME.toUpperCase()}</h1>
          <p className="text-muted-foreground font-medium">Use como um aplicativo real, direto da sua tela inicial e sem ocupar espaço.</p>
        </div>

        <div className="w-full space-y-4">
          {isInstalled ? (
            <Card className="border-none shadow-xl rounded-[2rem] bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-emerald-600 uppercase text-xs">Sucesso!</p>
                  <p className="font-bold">App instalado com sucesso.</p>
                </div>
              </CardContent>
            </Card>
          ) : isIOS ? (
            <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Instruções para iPhone:</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-xl">
                      <Share className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold">1. Toque no ícone de <span className="text-primary font-black">Compartilhar</span> na barra do navegador.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-xl">
                      <PlusSquare className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold">2. Procure pela opção <span className="text-primary font-black">"Adicionar à Tela de Início"</span>.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : deferredPrompt ? (
            <Button
              className="w-full h-16 rounded-2xl text-lg font-black bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
              onClick={handleInstall}
            >
              <Download className="mr-2 h-6 w-6" /> INSTALAR AGORA
            </Button>
          ) : (
            <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden">
              <CardContent className="p-6 space-y-6 text-center">
                <p className="text-sm font-bold text-muted-foreground">Seu navegador não suporta instalação automática, mas você pode adicionar manualmente pelo menu do navegador.</p>
                <div className="p-4 bg-muted/40 rounded-2xl">
                  <p className="text-xs font-black uppercase text-primary">Menu {">"} Adicionar à tela inicial</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center pt-4">
            <Link to="/auth" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Continuar no navegador
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
