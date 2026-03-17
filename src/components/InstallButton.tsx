import React from 'react';
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

export function InstallButton() {
  const { install, isInstallable } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(true);

  // Detecta se é iOS (iPhone/iPad/iPod)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  // Verifica se o aplicativo já está rodando em modo standalone
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (document as any).standalone;

  // Persistir fechamento do banner na sessão
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) setShowBanner(false);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner || isStandalone) {
    return null;
  }

  // Banner para iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xl max-w-md mx-auto relative overflow-hidden">
          <button 
            onClick={dismiss}
            className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Instalar o Workly</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Acesse como um aplicativo nativo para uma experiência mais rápida.
              </p>
              
              <div className="mt-4 space-y-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">1</span>
                  Toque no ícone de <Share className="w-3 h-3 inline text-blue-500" /> (Compartilhar) no Safari.
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">2</span>
                  Selecione <PlusSquare className="w-3 h-3 inline" /> <span className="font-bold">"Adicionar à Tela de Início"</span>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner para Android/Chrome
  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-primary p-4 rounded-2xl shadow-xl max-w-md mx-auto flex items-center justify-between gap-4 border border-primary/20">
        <div className="flex items-center gap-3 text-white">
          <div className="bg-white/20 p-2 rounded-xl">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">Workly no seu Celular</p>
            <p className="text-[10px] opacity-90 leading-tight">Instale para acesso instantâneo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={install}
            className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-zinc-100 transition-colors whitespace-nowrap"
          >
            📲 Instalar
          </button>
          <button 
            onClick={dismiss}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
