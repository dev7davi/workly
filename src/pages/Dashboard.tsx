import { Link } from "react-router-dom";
import {
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertCircle,
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
import { useMemo } from "react";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { services, loading } = useServices();

  const isLoading = profileLoading || loading;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const stats = useMemo(() => {
    const pending = services.filter((s) => s.status === "pending");
    const paid = services.filter((s) => s.status === "paid");

    // Paid this month calculation
    const now = new Date();
    const paidThisMonth = paid.filter((s) => {
      const pDate = new Date(s.payment_date);
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    });

    return {
      pending,
      totalPending: pending.reduce((acc, s) => acc + s.value, 0),
      totalPaidThisMonth: paidThisMonth.reduce((acc, s) => acc + s.value, 0),
      paidCount: paidThisMonth.length,
    };
  }, [services]);

  const recentPending = stats.pending.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 p-6 animate-pulse">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 pb-24 max-w-lg mx-auto lg:max-w-4xl">
      {/* Header with Greeting */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {greeting}, <span className="text-primary">{profile?.name?.split(" ")[0] || "Usuário"}</span>! 👋
          </h1>
          <p className="text-muted-foreground font-medium">
            Você tem {stats.pending.length} serviços para receber hoje.
          </p>
        </div>
        <div className="hidden lg:block">
          <Link to="/services/new">
            <Button className="rounded-2xl h-14 px-8 font-black bg-primary shadow-xl shadow-primary/20">
              NOVO SERVIÇO
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Total a Receber */}
        <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white group translate-y-0 hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Total em Aberto</p>
                <div className="h-1 w-12 bg-white/30 rounded-full ml-auto" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter mb-1">
                {formatCurrency(stats.totalPending)}
              </h3>
              <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">
                {stats.pending.length} serviços pendentes
              </p>
            </div>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </Card>

        {/* Recebido no Mês */}
        <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white group translate-y-0 hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Recebido no Mês</p>
                <div className="h-1 w-12 bg-white/30 rounded-full ml-auto" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter mb-1">
                {formatCurrency(stats.totalPaidThisMonth)}
              </h3>
              <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">
                {stats.paidCount} serviços pagos
              </p>
            </div>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </Card>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/services/new" className="group">
          <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border border-transparent group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-xl text-primary font-bold">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">Novo Serviço</span>
          </div>
        </Link>
        <Link to="/statistics" className="group">
          <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border border-transparent group-hover:border-indigo-500/20 group-hover:bg-indigo-500/5 transition-all">
            <div className="h-10 w-10 flex items-center justify-center bg-indigo-500/10 rounded-xl text-indigo-500 font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-tighter text-muted-foreground group-hover:text-indigo-500 transition-colors">Relatórios</span>
          </div>
        </Link>
      </div>

      {/* Upcoming Payments Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Próximos a Receber
          </h2>
          <Link to="/services?status=pending">
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-tighter hover:bg-muted/50">
              Ver Tudo
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        {recentPending.length > 0 ? (
          <div className="grid gap-3">
            {recentPending.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                compact
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted rounded-[2rem] bg-transparent">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-black text-foreground uppercase tracking-tight">Tudo em dia!</p>
                <p className="text-xs text-muted-foreground font-medium px-8">Você não tem serviços pendentes no momento.</p>
              </div>
              <Link to="/services/new">
                <Button className="rounded-xl font-black bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                  CADASTRAR SERVIÇO
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
