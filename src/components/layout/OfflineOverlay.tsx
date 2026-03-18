import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function OfflineOverlay() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-2">Sem conexão com a internet</h1>
            <p className="text-muted-foreground font-medium max-w-sm">
                Verifique sua conexão para continuar utilizando o {APP_NAME}. Ele requer internet ativa para operar.
            </p>
        </div>
    );
}
