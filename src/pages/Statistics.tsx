import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle,
  Users, Star, ChevronRight, Crown, Zap, Target, Calendar,
  ArrowUpRight, ArrowDownRight, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/format";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  paid: "#10b981",
  pending: "#f59e0b",
  cancelled: "#94a3b8",
};

type Period = "3m" | "6m" | "12m";

const PERIOD_LABELS: Record<Period, string> = {
  "3m": "3 Meses",
  "6m": "6 Meses",
  "12m": "1 Ano",
};

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-2xl p-4 shadow-2xl text-sm">
      <p className="font-black uppercase text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Statistics() {
  const { services, loading } = useServices();
  const { plan, isPro } = usePlan();
  const [period, setPeriod] = useState<Period>("6m");
  const [activeTab, setActiveTab] = useState("financeiro");

  const stats = useMemo(() => {
    const now = new Date();
    const months = parseInt(period.replace("m", ""));

    // Build monthly data for the selected period
    const monthlyData = Array.from({ length: months }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = `${MONTHS_PT[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;

      const monthPaid = services.filter(s => {
        const d = new Date(s.payment_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return s.status === "paid" && key === monthKey;
      });

      const monthPending = services.filter(s => {
        const d = new Date(s.service_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return s.status === "pending" && key === monthKey;
      });

      return {
        month: label,
        receita: monthPaid.reduce((acc, s) => acc + s.value, 0),
        pendente: monthPending.reduce((acc, s) => acc + s.value, 0),
        countPaid: monthPaid.length,
        countPending: monthPending.length,
      };
    });

    // Status distribution
    const paid = services.filter(s => s.status === "paid");
    const pending = services.filter(s => s.status === "pending");
    const cancelled = services.filter(s => s.status === "cancelled");

    const totalRevenue = paid.reduce((acc, s) => acc + s.value, 0);
    const totalPending = pending.reduce((acc, s) => acc + s.value, 0);

    // Ticket médio
    const avgTicket = paid.length > 0 ? totalRevenue / paid.length : 0;

    // Current month
    const thisMonth = new Date();
    const paidThisMonth = paid.filter(s => {
      const d = new Date(s.payment_date);
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    });
    const lastMonthDate = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const paidLastMonth = paid.filter(s => {
      const d = new Date(s.payment_date);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    });

    const revenueThisMonth = paidThisMonth.reduce((acc, s) => acc + s.value, 0);
    const revenueLastMonth = paidLastMonth.reduce((acc, s) => acc + s.value, 0);
    const monthGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 0;

    // Top clients
    const clientRevenue = paid.reduce((acc, s) => {
      if (!acc[s.client_name]) acc[s.client_name] = { revenue: 0, count: 0 };
      acc[s.client_name].revenue += s.value;
      acc[s.client_name].count += 1;
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    const topClients = Object.entries(clientRevenue)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top services
    const serviceRevenue = paid.reduce((acc, s) => {
      if (!acc[s.service_type]) acc[s.service_type] = { revenue: 0, count: 0 };
      acc[s.service_type].revenue += s.value;
      acc[s.service_type].count += 1;
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    const topServices = Object.entries(serviceRevenue)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5);

    // Predictions — project the monthly average forward 12 months
    const avgMonthlyRevenue = monthlyData.length > 0
      ? monthlyData.reduce((acc, m) => acc + m.receita, 0) / monthlyData.filter(m => m.receita > 0).length || 0
      : 0;

    const predictionData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      // Add slight growth trend of ~5% per month
      const growthFactor = 1 + (0.03 * i);
      return {
        month: `${MONTHS_PT[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`,
        projecao: Math.round(avgMonthlyRevenue * growthFactor),
        otimista: Math.round(avgMonthlyRevenue * growthFactor * 1.3),
      };
    });

    const projectedYear = predictionData.reduce((acc, m) => acc + m.projecao, 0);

    return {
      monthlyData,
      statusData: [
        { name: "Pago", value: paid.length, color: STATUS_COLORS.paid },
        { name: "Pendente", value: pending.length, color: STATUS_COLORS.pending },
        { name: "Cancelado", value: cancelled.length, color: STATUS_COLORS.cancelled },
      ].filter(s => s.value > 0),
      totalRevenue,
      totalPending,
      avgTicket,
      revenueThisMonth,
      revenueLastMonth,
      monthGrowth,
      topClients,
      topServices,
      totalServices: services.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      predictionData,
      projectedYear,
      avgMonthlyRevenue,
    };
  }, [services, period]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Relatórios</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Análise do seu negócio
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="h-10 rounded-2xl bg-muted/50">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <TabsTrigger key={p} value={p} className="text-[10px] font-black uppercase rounded-xl px-3">
                {PERIOD_LABELS[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {/* Section Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-12 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="financeiro" className="flex-1 rounded-xl font-black text-[10px] uppercase">
            💰 Financeiro
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex-1 rounded-xl font-black text-[10px] uppercase">
            👥 Clientes
          </TabsTrigger>
          <TabsTrigger value="operacional" className="flex-1 rounded-xl font-black text-[10px] uppercase">
            ⚡ Operacional
          </TabsTrigger>
          <TabsTrigger value="previsao" className="flex-1 rounded-xl font-black text-[10px] uppercase">
            🔮 Previsão
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ======= FINANCEIRO TAB ======= */}
      {activeTab === "financeiro" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-xl rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-white/20 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
                  <div className="flex items-center gap-1 text-white/80">
                    {stats.monthGrowth >= 0
                      ? <ArrowUpRight className="h-4 w-4 text-white" />
                      : <ArrowDownRight className="h-4 w-4 text-red-300" />}
                    <span className="text-[10px] font-black">{Math.abs(stats.monthGrowth).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-2xl font-black tracking-tighter">{formatCurrency(stats.revenueThisMonth)}</p>
                <p className="text-[10px] font-black opacity-70 uppercase">Recebido este mês</p>
              </CardContent>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </Card>

            <Card className="border-none shadow-xl rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-white/20 rounded-xl"><Clock className="h-5 w-5" /></div>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-full">
                    {stats.pendingCount} serv.
                  </span>
                </div>
                <p className="text-2xl font-black tracking-tighter">{formatCurrency(stats.totalPending)}</p>
                <p className="text-[10px] font-black opacity-70 uppercase">A Receber</p>
              </CardContent>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </Card>

            <Card className="border-none shadow-lg rounded-3xl bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Ticket Médio</p>
                </div>
                <p className="text-xl font-black tracking-tighter">{formatCurrency(stats.avgTicket)}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{stats.paidCount} serviços pagos</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-3xl bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Total Recebido</p>
                </div>
                <p className="text-xl font-black tracking-tighter">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-[10px] font-medium text-muted-foreground">desde o início</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Area Chart */}
          <Card className="border-none shadow-xl rounded-3xl bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">
                    Evolução de Ganhos
                  </h3>
                  <p className="text-lg font-black mt-1">{PERIOD_LABELS[period]}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground/40" />
              </div>
              {stats.monthlyData.some(m => m.receita > 0 || m.pendente > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.monthlyData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPendente" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700 }} width={60}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="receita" name="Recebido" stroke="#10b981"
                      strokeWidth={3} fill="url(#colorReceita)" />
                    <Area type="monotone" dataKey="pendente" name="Pendente" stroke="#f59e0b"
                      strokeWidth={2} fill="url(#colorPendente)" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/20 mb-3" />
                  <p className="font-black text-muted-foreground uppercase text-xs">Sem dados no período</p>
                  <p className="text-xs text-muted-foreground/60">Cadastre serviços pagos para ver o gráfico</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          {stats.statusData.length > 0 && (
            <Card className="border-none shadow-xl rounded-3xl bg-card">
              <CardContent className="p-6">
                <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground mb-6">
                  Distribuição por Status
                </h3>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                        paddingAngle={3} dataKey="value">
                        {stats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {stats.statusData.map(entry => (
                      <div key={entry.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm font-bold">{entry.name}</span>
                        </div>
                        <span className="font-black text-sm">{entry.value}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-muted-foreground">Total</span>
                        <span className="font-black">{stats.totalServices}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ======= CLIENTES TAB ======= */}
      {activeTab === "clientes" && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-5">
                <Users className="h-6 w-6 mb-3 opacity-80" />
                <p className="text-2xl font-black">{stats.topClients.length}</p>
                <p className="text-[10px] font-black opacity-70 uppercase">Clientes Ativos</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <CardContent className="p-5">
                <Star className="h-6 w-6 mb-3 opacity-80" />
                <p className="text-2xl font-black">{stats.topServices.length}</p>
                <p className="text-[10px] font-black opacity-70 uppercase">Tipos de Serviço</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Clients */}
          {stats.topClients.length > 0 ? (
            <Card className="border-none shadow-xl rounded-3xl bg-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">
                  🏆 Clientes Mais Rentáveis
                </h3>
                {stats.topClients.map(([name, data], idx) => {
                  const percentage = stats.totalRevenue > 0 ? (data.revenue / stats.totalRevenue) * 100 : 0;
                  return (
                    <Link key={name} to={`/clients/${encodeURIComponent(name)}`}>
                      <div className="flex items-center gap-4 group">
                        <div className={cn(
                          "h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl text-sm font-black",
                          idx === 0 ? "bg-amber-500/20 text-amber-600" :
                            idx === 1 ? "bg-slate-400/20 text-slate-500" :
                              idx === 2 ? "bg-amber-700/20 text-amber-800" :
                                "bg-muted/50 text-muted-foreground"
                        )}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-black text-sm truncate group-hover:text-primary transition-colors">{name}</p>
                            <p className="font-black text-sm shrink-0 ml-2">{formatCurrency(data.revenue)}</p>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1">
                            {data.count} serviço{data.count !== 1 ? "s" : ""} · {percentage.toFixed(0)}% da receita
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-muted rounded-3xl bg-transparent">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/20" />
                <p className="font-black uppercase text-xs text-muted-foreground">Sem dados de clientes ainda</p>
              </CardContent>
            </Card>
          )}

          {/* Top Services */}
          {stats.topServices.length > 0 && (
            <Card className="border-none shadow-xl rounded-3xl bg-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">
                  🔧 Serviços Mais Demandados
                </h3>
                {stats.topServices.map(([type, data], idx) => (
                  <div key={type} className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-sm truncate">{type}</p>
                        <p className="text-xs font-bold text-muted-foreground ml-2">{data.count}x</p>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{formatCurrency(data.revenue)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ======= OPERACIONAL TAB ======= */}
      {activeTab === "operacional" && (() => {
        const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const byDay = Array(7).fill(0) as number[];
        services.forEach(s => { const d = new Date(s.service_date); byDay[d.getDay()]++; });
        const dayData = DIAS.map((name, i) => ({ name, total: byDay[i] }));

        // Service type ranking: most done + avg value
        const typeMap = services.reduce((acc, s) => {
          if (!acc[s.service_type]) acc[s.service_type] = { count: 0, total: 0 };
          acc[s.service_type].count++;
          acc[s.service_type].total += Number(s.value);
          return acc;
        }, {} as Record<string, { count: number; total: number }>);
        const typeRanking = Object.entries(typeMap)
          .sort(([, a], [, b]) => b.count - a.count).slice(0, 6);

        // Client loyalty: most services (regardless of status)
        const clientMap = services.reduce((acc, s) => {
          if (!acc[s.client_name]) acc[s.client_name] = { count: 0, total: 0 };
          acc[s.client_name].count++;
          acc[s.client_name].total += Number(s.value);
          return acc;
        }, {} as Record<string, { count: number; total: number }>);
        const clientRanking = Object.entries(clientMap)
          .sort(([, a], [, b]) => b.count - a.count).slice(0, 5);

        const now = new Date();
        const thisMonthCount = services.filter(s => {
          const d = new Date(s.service_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const avgPerMonth = stats.monthlyData.length > 0
          ? stats.monthlyData.reduce((a, m) => a + m.countPaid, 0) / stats.monthlyData.filter(m => m.countPaid > 0).length || 0
          : 0;

        return (
          <div className="space-y-6">
            {/* Productivity overview */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Este mês", val: thisMonthCount, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
                { label: "Média/mês", val: avgPerMonth.toFixed(1), icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { label: "Total", val: stats.totalServices, icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              ].map(({ label, val, icon: Icon, color, bg }) => (
                <Card key={label} className="border-none shadow-md rounded-3xl bg-card">
                  <CardContent className="p-4 text-center">
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center mx-auto mb-2", bg)}>
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <p className="text-xl font-black leading-none">{val}</p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground mt-1">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Day of week chart */}
            <Card className="border-none shadow-xl rounded-3xl bg-card">
              <CardContent className="p-6">
                <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground mb-5">📅 Dia da Semana Mais Produtivo</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={dayData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip formatter={(v: any) => [`${v} serviço${v !== 1 ? "s" : ""}`, "Serviços"]} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {dayData.map((entry, i) => (
                        <Cell key={i} fill={entry.total === Math.max(...dayData.map(d => d.total)) ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service type ranking */}
            {typeRanking.length > 0 && (
              <Card className="border-none shadow-xl rounded-3xl bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">🔧 Serviços Mais Executados</h3>
                  {typeRanking.map(([type, d], idx) => {
                    const max = typeRanking[0][1].count;
                    const pct = max > 0 ? (d.count / max) * 100 : 0;
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-xs">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-black text-sm truncate">{type}</p>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className="text-[10px] font-black text-muted-foreground">{d.count}x</span>
                              <span className="text-[10px] font-black text-emerald-600">{formatCurrency(d.total / d.count)} avg</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Client loyalty */}
            {clientRanking.length > 0 && (
              <Card className="border-none shadow-xl rounded-3xl bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">👥 Clientes Mais Fiéis</h3>
                  {clientRanking.map(([name, d], idx) => (
                    <Link key={name} to="/clients">
                      <div className="flex items-center gap-3 group">
                        <div className={cn(
                          "h-9 w-9 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black",
                          idx === 0 ? "bg-amber-500/15 text-amber-600" :
                            idx === 1 ? "bg-slate-400/15 text-slate-500" :
                              idx === 2 ? "bg-amber-700/15 text-amber-700" : "bg-muted/50 text-muted-foreground"
                        )}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate group-hover:text-primary transition-colors">{name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {d.count} serviço{d.count !== 1 ? "s" : ""} · {formatCurrency(d.total)} total
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary shrink-0" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}

      {/* ======= PREVISÃO TAB ======= */}
      {activeTab === "previsao" && (
        <div className="space-y-6">
          {stats.avgMonthlyRevenue > 0 ? (
            <>
              {/* Yearly projection highlight */}
              <Card className="border-none shadow-2xl rounded-3xl bg-gradient-to-br from-indigo-600 via-primary to-blue-700 text-white relative overflow-hidden">
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Target className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Projeção Anual</p>
                      <p className="text-lg font-black">Se mantiver o ritmo atual</p>
                    </div>
                  </div>
                  <p className="text-4xl font-black tracking-tighter mb-2">{formatCurrency(stats.projectedYear)}</p>
                  <p className="text-sm font-bold opacity-70">estimativa para os próximos 12 meses</p>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase opacity-70">Média Mensal</p>
                      <p className="text-xl font-black">{formatCurrency(stats.avgMonthlyRevenue)}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase opacity-70">Com 30% Crescimento</p>
                      <p className="text-xl font-black">{formatCurrency(stats.avgMonthlyRevenue * 1.3 * 12)}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-indigo-500/20 rounded-full blur-3xl" />
              </Card>

              {/* 12-month projection chart */}
              <Card className="border-none shadow-xl rounded-3xl bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">
                      Projeção — Próximos 12 Meses
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground mt-1">
                      Baseado na sua média histórica com crescimento gradual de 3%/mês
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={stats.predictionData}>
                      <defs>
                        <linearGradient id="colorProjecao" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOtimista" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis tick={{ fontSize: 10, fontWeight: 700 }} width={65}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="otimista" name="Cenário Otimista (+30%)"
                        stroke="#10b981" strokeWidth={2} fill="url(#colorOtimista)" strokeDasharray="5 5" />
                      <Area type="monotone" dataKey="projecao" name="Projeção Base"
                        stroke="#6366f1" strokeWidth={3} fill="url(#colorProjecao)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card className="border-none shadow-xl rounded-3xl bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground">
                    🎯 Metas Sugeridas
                  </h3>
                  {[
                    { label: "Meta Conservadora", value: stats.avgMonthlyRevenue * 12 * 0.8, icon: "🎯", color: "text-slate-500" },
                    { label: "Meta Realista", value: stats.projectedYear, icon: "📈", color: "text-primary" },
                    { label: "Meta Arrojada", value: stats.avgMonthlyRevenue * 1.5 * 12, icon: "🚀", color: "text-emerald-500" },
                  ].map(goal => (
                    <div key={goal.label} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <p className={cn("text-xs font-black uppercase", goal.color)}>{goal.label}</p>
                          <p className="text-xs font-bold text-muted-foreground">para os próximos 12 meses</p>
                        </div>
                      </div>
                      <p className="text-lg font-black">{formatCurrency(goal.value)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-2 border-dashed border-muted rounded-3xl bg-transparent">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center">
                  <Target className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="font-black text-lg uppercase tracking-tight">Sem dados para prever</p>
                  <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto">
                    Registre pelo menos 1 serviço <strong>pago</strong> para ver suas projeções de receita.
                  </p>
                </div>
                <Link to="/services/new">
                  <Button className="rounded-2xl h-12 px-8 font-black bg-primary">
                    Cadastrar Serviço
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
