import React from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { X, ShieldAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ImpersonationBanner = () => {
    const { isMaster, viewingUserId, viewingUserEmail, setViewingUser } = useAdmin();

    if (!isMaster || !viewingUserId) return null;

    return (
        <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300 sticky top-0 z-[60]">
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <div className="flex-shrink-0 bg-white/20 p-1.5 rounded-md hidden sm:block">
                    <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 overflow-hidden">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90 whitespace-nowrap">Modo Admin</span>
                    <div className="flex items-center gap-1 overflow-hidden">
                        <Users className="h-4 w-4 opacity-70 flex-shrink-0" />
                        <span className="text-sm font-medium truncate italic">
                            Visualizando como: <span className="underline decoration-white/30">{viewingUserEmail}</span>
                        </span>
                    </div>
                </div>
            </div>

            <Button
                variant="secondary"
                size="sm"
                className="h-8 gap-2 bg-white text-primary hover:bg-white/90"
                onClick={() => setViewingUser(null, null)}
            >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Sair do Modo View</span>
                <span className="sm:hidden text-xs">Sair</span>
            </Button>
        </div>
    );
};
