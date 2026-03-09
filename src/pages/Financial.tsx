import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, Clock, CheckCircle2, Download, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ChevronRight, DollarSign,
  Calendar, Wallet, BarChart3, Target, Flame
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/services/ServiceCard";
import { formatCurrency } from "@/lib/format";
import { generateMonthlyReport } from "@/lib/generateReport";
import { useProfile } from "@/hooks/useProfile";
import { useServices } from "@/hooks/useServices";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format, parseISO, isThisMonth, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

const TODAY = new Date().toISOString().slice(0, 10);
const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type ViewTab = "resumo" | "areceber" | "recebidos" | "atrasados";

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-xl text-xs">
      <p className="font-black text-muted-foreground uppercase mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Financial() {
  const navigate = useNavigate();
  const { services, loading } = useServices();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState<ViewTab>("resumo");
  const [chartPeriod, setChartPeriod] = useState<6 | 12>(6);

  const data = useMemo(() => {
    const now = new Date();
    const pending = services.filter(s => s.status === "pending");
    const paid = services.filter(s => s.status === "paid");
    const cancelled = services.filter(s => s.status === "cancelled");

    // Overdue = pending + payment_date < today
    const overdue = pending.filter(s => s.payment_date < TODAY)
      .sort((a, b) => a.payment_date.localeCompare(b.payment_date));

    // Due today
    const dueToday = pending.filter(s => s.payment_date === TODAY);

    // Paid this month
    const paidThisMonth = paid.filter(s => isThisMonth(parseISO(s.payment_date)));
    // Paid last month
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const paidLastMonth = paid.filter(s => {
      const d = parseISO(s.payment_date);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    });

    const totalPending = pending.reduce((a, s) => a + Number(s.value), 0);
    const totalPaidMonth = paidThisMonth.reduce((a, s) => a + Number(s.value), 0);
    const totalPaidLastMonth = paidLastMonth.reduce((a, s) => a + Number(s.value), 0);
    const totalOverdue = overdue.reduce((a, s) => a + Number(s.value), 0);
    const totalAllTime = paid.reduce((a, s) => a + Number(s.value), 0);
    const avgTicket = paid.length > 0 ? totalAllTime / paid.length : 0;

    const monthGrowth = totalPaidLastMonth > 0
      ? ((totalPaidMonth - totalPaidLastMonth) / totalPaidLastMonth) * 100
      : null;

    // Monthly chart data
    const months = chartPeriod;
    const monthlyData = Array.from({ length: months }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const mk = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = `${MONTHS_PT[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
      const monthPaid = paid.filter(s => s.payment_date.startsWith(mk));
      const monthPending = pending.filter(s => s.service_date.startsWith(mk));
      return {
        month: label,
        recebido: monthPaid.reduce((a, s) => a + Number(s.value), 0),
        pendente: monthPending.reduce((a, s) => a + Number(s.value), 0),
      };
    });

    return {
      pending, paid, overdue, dueToday, cancelled,
      totalPending, totalPaidMonth, totalPaidLastMonth,
      totalOverdue, totalAllTime, avgTicket, monthGrowth,
      paidThisMonth, monthlyData,
    };
  }, [services, chartPeriod]);

  const handleExportPDF = () => {
    const now = new Date();
    const thisMonthServices = services.filter(s => isThisMonth(parseISO(s.service_date)));
    generateMonthlyReport({
      services: thisMonthServices.length > 0 ? thisMonthServices : services,
      userName: profile?.name || "Usuário",
      month: MONTHS_PT[now.getMonth()],
      year: now.getFullYear(),
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse max-w-lg mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  const tabs: { value: ViewTab; label: string; count?: number }[] = [
    { value: "resumo", label: "📊 Resumo" },
    { value: "areceber", label: "⏳ A Receber", count: data.pending.length },
    { value: "recebidos", label: "✅ Recebidos", count: data.paidThisMonth.length },
    { value: "atrasados", label: "🔴 Atrasados", count: data.overdue.length },
  ];

  return (
    <div className="flex flex-col gap-6 p-5 pb-28 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Financeiro</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="rounded-xl font-bold gap-1.5">
          <Download className="h-4 w-4" /> PDF
        </Button>
      </header>

      {/* Alertas urgentes */}
      {data.overdue.length > 0 && (
        <button
          onClick={() => setActiveTab("atrasados")}
          className="w-full flex items-center gap-3 p-3.5 bg-destructive/8 border border-destructive/25 rounded-2xl text-left hover:border-destructive/50 transition-colors"
        >
          <div className="h-9 w-9 bg-destructive/15 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-destructive">
              {data.overdue.length} pagamento{data.overdue.length > 1 ? "s" : ""} em atraso
            </p>
            <p className="text-[10px] font-bold text-muted-foreground">
              {formatCurrency(data.totalOverdue)} não recebidos · clique para ver
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-destructive/50 shrink-0" />
        </button>
      )}

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all whitespace-nowrap",
                activeTab === t.value
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className={cn(
                  "h-4 min-w-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center",
                  activeTab === t.value ? "bg-white/20 text-white" : "bg-muted-foreground/20"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESUMO ── */}
      {activeTab === "resumo" && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {/* Recebido mês */}
            <Link to="#" onClick={() => setActiveTab("recebidos")}>
              <Card className="border-none shadow-xl rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white cursor-pointer hover:-translate-y-0.5 transition-all group overflow-hidden relative">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    {data.monthGrowth !== null && (
                      <div className="flex items-center gap-0.5">
                        {data.monthGrowth >= 0
                          ? <ArrowUpRight className="h-3.5 w-3.5 text-white/80" />
                          : <ArrowDownRight className="h-3.5 w-3.5 text-red-200" />}
                        <span className="text-[10px] font-black text-white/80">
                          {Math.abs(data.monthGrowth).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-black tracking-tighter leading-none mb-1">
                    {formatCurrency(data.totalPaidMonth)}
                  </p>
                  <p className="text-[10px] font-black opacity-70 uppercase">Recebido no mês</p>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-white/10 rounded-full blur-xl" />
              </Card>
            </Link>

            {/* A receber */}
            <button onClick={() => setActiveTab("areceber")}>
              <Card className="border-none shadow-xl rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white cursor-pointer hover:-translate-y-0.5 transition-all group overflow-hidden relative w-full">
                <CardContent className="p-5">
                  <div className="p-2 bg-white/20 rounded-xl w-fit mb-3">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-black tracking-tighter leading-none mb-1">
                    {formatCurrency(data.totalPending)}
                  </p>
                  <p className="text-[10px] font-black opacity-70 uppercase">Total em aberto</p>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-white/10 rounded-full blur-xl" />
              </Card>
            </button>

            {/* Ticket médio */}
            <Link to="/statistics">
              <Card className="border-none shadow-md rounded-3xl bg-card cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-xl">
                      <Target className="h-4 w-4 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Ticket médio</p>
                  </div>
                  <p className="text-xl font-black tracking-tighter">{formatCurrency(data.avgTicket)}</p>
                </CardContent>
              </Card>
            </Link>

            {/* Total all time */}
            <Link to="/statistics">
              <Card className="border-none shadow-md rounded-3xl bg-card cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-xl">
                      <Wallet className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Receita total</p>
                  </div>
                  <p className="text-xl font-black tracking-tighter">{formatCurrency(data.totalAllTime)}</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Chart period toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Evolução de Receita
            </p>
            <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
              {([6, 12] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                    chartPeriod === p ? "bg-primary text-white" : "text-muted-foreground"
                  )}
                >
                  {p}m
                </button>
              ))}
            </div>
          </div>

          {/* Area chart */}
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-4">
              {data.monthlyData.some(m => m.recebido > 0 || m.pendente > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data.monthlyData} margin={{ left: -20, right: 8 }}>
                    <defs>
                      <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="recebido" name="Recebido" stroke="#10b981" strokeWidth={2} fill="url(#gRec)" />
                    <Area type="monotone" dataKey="pendente" name="Pendente" stroke="#f59e0b" strokeWidth={2} fill="url(#gPend)" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground font-medium">Ainda sem dados para o gráfico</p>
                </div>
              )}
              <div className="flex gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5"><div className="h-2 w-4 bg-emerald-500 rounded-full" /><span className="text-[10px] font-bold text-muted-foreground">Recebido</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-4 border-t-2 border-dashed border-amber-500" /><span className="text-[10px] font-bold text-muted-foreground">Pendente</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos vencimentos */}
          {data.pending.filter(s => s.payment_date >= TODAY).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" /> Próximos vencimentos
                </p>
                <button onClick={() => setActiveTab("areceber")} className="text-[10px] font-black text-primary uppercase">Ver todos</button>
              </div>
              {data.pending
                .filter(s => s.payment_date >= TODAY)
                .sort((a, b) => a.payment_date.localeCompare(b.payment_date))
                .slice(0, 3)
                .map(s => {
                  const dueDate = parseISO(s.payment_date);
                  const isdue = isToday(dueDate);
                  return (
                    <Link key={s.id} to={`/services/${s.id}/edit`}>
                      <div className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl border transition-all hover:shadow-md",
                        isdue ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border"
                      )}>
                        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", isdue ? "bg-amber-500/15" : "bg-muted")}>
                          <Clock className={cn("h-4 w-4", isdue ? "text-amber-600" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">{s.client_name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground truncate">{s.service_type}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-sm text-emerald-600">{formatCurrency(Number(s.value))}</p>
                          <Badge className={cn("text-[9px] font-black uppercase", isdue ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground")}>
                            {isdue ? "Hoje" : format(dueDate, "dd/MM")}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── A RECEBER ── */}
      {activeTab === "areceber" && (
        <div className="space-y-3">
          {data.pending.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-black uppercase text-muted-foreground">{data.pending.length} pendentes · {formatCurrency(data.totalPending)}</p>
              </div>
              {data.pending
                .sort((a, b) => a.payment_date.localeCompare(b.payment_date))
                .map(s => <ServiceCard key={s.id} service={s} />)}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500/30" />
              <p className="font-black uppercase">Tudo recebido! 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* ── RECEBIDOS ── */}
      {activeTab === "recebidos" && (
        <div className="space-y-3">
          {data.paid.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-black uppercase text-muted-foreground">
                  {data.paidThisMonth.length} este mês · {data.paid.length} total
                </p>
              </div>
              {data.paid
                .sort((a, b) => b.payment_date.localeCompare(a.payment_date))
                .map(s => <ServiceCard key={s.id} service={s} />)}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground/20" />
              <p className="font-black uppercase">Nenhum recebimento ainda</p>
            </div>
          )}
        </div>
      )}

      {/* ── ATRASADOS ── */}
      {activeTab === "atrasados" && (
        <div className="space-y-3">
          {data.overdue.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-black uppercase text-destructive">
                  {data.overdue.length} em atraso · {formatCurrency(data.totalOverdue)}
                </p>
              </div>
              {data.overdue.map(s => (
                <Link key={s.id} to={`/services/${s.id}/edit`}>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-all">
                    <div className="h-10 w-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <Flame className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate text-destructive">{s.client_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{s.service_type}</p>
                      <p className="text-[10px] font-black text-destructive/70 uppercase mt-0.5">
                        Venceu em {format(parseISO(s.payment_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm text-destructive">{formatCurrency(Number(s.value))}</p>
                      <Badge className="bg-destructive/10 text-destructive text-[9px] font-black uppercase">Atrasado</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500/30" />
              <p className="font-black uppercase">Nenhum pagamento em atraso! 🎉</p>
              <p className="text-sm text-muted-foreground">Continue assim.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
