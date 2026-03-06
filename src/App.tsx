import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import NewService from "./pages/NewService";
import EditService from "./pages/EditService";
import Financial from "./pages/Financial";
import Profile from "./pages/Profile";
import Receipt from "./pages/Receipt";
import Statistics from "./pages/Statistics";
import ClientDetails from "./pages/ClientDetails";
import Clients from "./pages/Clients";
import ClientForm from "./pages/ClientForm";
import Plans from "./pages/Plans";
import Catalog from "./pages/Catalog";
import Agenda from "./pages/Agenda";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

            {/* Rotas protegidas */}
            <Route path="/dashboard" element={<P><Dashboard /></P>} />

            {/* Serviços */}
            <Route path="/services" element={<P><Services /></P>} />
            <Route path="/services/new" element={<P><NewService /></P>} />
            <Route path="/services/:id/edit" element={<P><EditService /></P>} />
            <Route path="/services/:id/receipt" element={<P><Receipt /></P>} />

            {/* Clientes */}
            <Route path="/clients" element={<P><Clients /></P>} />
            <Route path="/clients/new" element={<P><ClientForm /></P>} />
            <Route path="/clients/:id/edit" element={<P><ClientForm /></P>} />
            <Route path="/clients/:clientName" element={<P><ClientDetails /></P>} />

            {/* Catálogo */}
            <Route path="/catalog" element={<P><Catalog /></P>} />

            {/* Agenda */}
            <Route path="/agenda" element={<P><Agenda /></P>} />

            {/* Resto */}
            <Route path="/financial" element={<P><Financial /></P>} />
            <Route path="/statistics" element={<P><Statistics /></P>} />
            <Route path="/profile" element={<P><Profile /></P>} />
            <Route path="/plans" element={<P><Plans /></P>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
