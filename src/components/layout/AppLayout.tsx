import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { OfflineOverlay } from "./OfflineOverlay";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { FloatingSupport } from "../FloatingSupport";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background flex-col">
      <ImpersonationBanner />
      <div className="flex flex-1 relative">
        <OfflineOverlay />

        {/* Sidebar para telas grandes (Desktop/Tablet landscape) */}
        <Sidebar className="hidden lg:flex" />

        {/* Main Container - deslocado e cresce no resto da tela */}
        <main 
          className="flex-1 lg:pl-64 flex flex-col lg:pb-0 overflow-x-hidden w-full transition-all"
          style={{ paddingBottom: 'var(--mobile-bottom-safe-area)' }}
        >
          {children}
        </main>

        {/* Nav de Baixo nas Telas Pequenas (Mobile) */}
        <BottomNav className="lg:hidden" />
        <FloatingSupport />
      </div>
    </div>
  );
}
