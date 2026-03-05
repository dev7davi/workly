import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Download, Smartphone, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">WORKLY</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-hero">
          <Smartphone className="h-10 w-10 text-primary-foreground" />
        </div>

        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Instalar WORKLY</h1>
          <p className="text-muted-foreground">Tenha acesso rápido direto da tela inicial</p>
        </div>

        {isInstalled ? (
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-semibold">App instalado!</p>
                <p className="text-sm text-muted-foreground">Abra pela tela inicial</p>
              </div>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <p className="font-semibold">No iPhone/iPad:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta)</li>
                <li>2. Role e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                <li>3. Toque em <strong>Adicionar</strong></li>
              </ol>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button className="w-full max-w-md bg-gradient-hero py-6" onClick={handleInstall}>
            <Download className="mr-2 h-5 w-5" />Instalar agora
          </Button>
        ) : (
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <p className="font-semibold">No seu navegador:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Toque no menu (três pontinhos)</li>
                <li>2. Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
              </ol>
            </CardContent>
          </Card>
        )}

        <Link to="/auth" className="text-sm text-primary hover:underline">
          Continuar no navegador
        </Link>
      </main>
    </div>
  );
}
