import { useNavigate, useParams } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ArrowLeft, User, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetails() {
    const { clientName } = useParams<{ clientName: string }>();
    const navigate = useNavigate();
    const { services, loading } = useServices();

    const decodedName = decodeURIComponent(clientName || "");

    const clientServices = services.filter(
        (s) => s.client_name.toLowerCase() === decodedName.toLowerCase()
    );

    const totalPaid = clientServices
        .filter((s) => s.status === "paid")
        .reduce((acc, s) => acc + s.value, 0);

    const totalPending = clientServices
        .filter((s) => s.status === "pending")
        .reduce((acc, s) => acc + s.value, 0);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-6 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
            <header className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-black truncate max-w-[200px]">{decodedName}</h1>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Histórico de Cliente</p>
                </div>
            </header>

            {/* Client Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-lg bg-emerald-500 text-white">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start opacity-80 mb-1">
                            <span className="text-[10px] font-bold uppercase">Já Pagou</span>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <p className="text-lg font-black">{formatCurrency(totalPaid)}</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-amber-500 text-white">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start opacity-80 mb-1">
                            <span className="text-[10px] font-bold uppercase">Pendente</span>
                            <Clock className="h-4 w-4" />
                        </div>
                        <p className="text-lg font-black">{formatCurrency(totalPending)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Todos os Serviços ({clientServices.length})
                </h2>

                {clientServices.length > 0 ? (
                    <div className="space-y-3">
                        {clientServices
                            .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
                            .map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                    </div>
                ) : (
                    <p className="text-center py-12 text-muted-foreground">Nenhum serviço registrado.</p>
                )}
            </div>
        </div>
    );
}
