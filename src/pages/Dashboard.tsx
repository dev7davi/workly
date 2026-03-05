import { Link } from "react-router-dom";
import {
  Plus,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { useServices } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/format";
import { ServiceCard } from "@/components/services/ServiceCard";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { services, loading } = useServices();

  const isLoading = profileLoading || loading;

  const pendingServices = services.filter(
    (s) => s.status === "pending"
  );

  const paidThisMonth = services.filter((s) => {
    if (s.status !== "paid") return false;
    const paidDate = new Date(s.payment_date);
    const now = new Date();
    return (
      paidDate.getMonth() === now.getMonth() &&
      paidDate.getFullYear() === now.getFullYear()
    );
  });

  const pendingCount = pendingServices.length;
  const paidThisMonthCount = paidThisMonth.length;

  const totalPending = pendingServices.reduce(
    (acc, s) => acc + s.value,
    0
  );

  const totalPaidThisMonth = paidThisMonth.reduce(
    (acc, s) => acc + s.value,
    0
  );

  const recentPending = pendingServices.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Olá, {profile?.name?.split(" ")[0] || "Usuário"}! 👋
              </h1>
              <p className="text-muted-foreground">
                Seu trabalho, organizado.
              </p>
            </>
          )}
        </div>

        <Link to="/services/new">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-hero shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="grid gap-4">
        {/* Pendentes */}
        <Card className="border-l-4 border-l-warning">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Serviços em aberto
                </p>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {pendingCount}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">A receber</p>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <p className="text-lg font-semibold text-warning">
                  {formatCurrency(totalPending)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagos no mês */}
        <Card className="border-l-4 border-l-success">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Pagos este mês
                </p>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {paidThisMonthCount}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Total recebido
              </p>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <p className="text-lg font-semibold text-success">
                  {formatCurrency(totalPaidThisMonth)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/services/new">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4">
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Novo Serviço</span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/financial">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4">
              <DollarSign className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">Ver Financeiro</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Próximos a receber */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Próximos a Receber
          </h2>
          <Link to="/services?status=pending">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : recentPending.length > 0 ? (
          <div className="space-y-3">
            {recentPending.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                compact
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">
                Nenhum serviço pendente
              </p>
              <Link to="/services/new">
                <Button className="bg-gradient-hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Serviço
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
