import { useEffect, useState } from "react"

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      // Previne que o navegador mostre o prompt padrão
      e.preventDefault()
      // Armazena o evento para ser disparado depois
      setDeferredPrompt(e)
      // Indica que o PWA é instalável
      setIsInstallable(true)
    }

    // Adiciona o listener para o evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", handler)

    // Verifica se o PWA já está instalado (modo standalone)
    if (window.matchMedia("(display-mode: standalone)").matches || (document as any).standalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return

    // Dispara o prompt de instalação
    deferredPrompt.prompt()
    // Espera pela escolha do usuário
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === "accepted") {
      console.log("PWA instalado com sucesso!")
    } else {
      console.log("Instalação do PWA cancelada.")
    }
    // Reseta o estado após a tentativa de instalação
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return { install, isInstallable }
}
