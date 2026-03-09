import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Clock, TrendingUp, Briefcase, AlertCircle,
  CalendarDays, Users, ArrowRight, Zap, AlertTriangle,
  CheckCircle2, CircleDollarSign, BarChart3, ChevronRight,
  Flame, Timer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { useServices } from "@/hooks/useServices";
import { useAppointments } from "@/hooks/useAppointments";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { format, isToday, isTomorrow, isPast, parseISO, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

// ----------------------------
// Helpers
// ----------------------------
const TODAY = new Date().toISOString().slice(0, 10);

function dateLabel(dateStr: string) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return { text: "Hoje", urgent: true };
    if (isTomorrow(d)) return { text: "Amanhã", urgent: false };
    if (isPast(d)) return { text: "Vencido", urgent: true };
    if (isThisWeek(d)) return { text: format(d, "EEEE", { locale: ptBR }), urgent: false };
    return { text: format(d, "dd/MM", { locale: ptBR }), urgent: false };
  } catch {
    return { text: dateStr, urgent: false };
  }
}

// ----------------------------
// Sub-components
// ----------------------------
function SectionHeader({ icon: Icon, label, to, iconColor = "text-muted-foreground" }: {
  icon: any; label: string; to?: string; iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className={cn("text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2")}>
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        {label}
      </h2>
      {to && (
        <Link to={to}>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-tighter hover:bg-muted/50">
            Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function KpiCard({ value, label, sub, color, icon: Icon, to }: {
  value: string; label: string; sub: string; color: string; icon: any; to: string;
}) {
  return (
    <Link to={to}>
      <Card className={cn(
        "relative overflow-hidden border-none shadow-xl text-white cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        color
      )}>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-2xl font-black tracking-tighter mb-0.5">{value}</h3>
          <p className="text-[10px] font-black uppercase opacity-80 tracking-wider">{label}</p>
          <p className="text-[10px] font-bold opacity-60 mt-0.5">{sub}</p>
        </CardContent>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      </Card>
    </Link>
  );
}

function AlertCard({ title, description, href, variant = "warning" }: {
  title: string; description: string; href: string; variant?: "warning" | "danger";
}) {
  return (
    <Link to={href}>
      <div className={cn(
        "flex items-center gap-3 p-3.5 rounded-2xl border transition-all hover:shadow-md group",
        variant === "danger"
          ? "bg-destructive/5 border-destructive/20 hover:border-destructive/40"
          : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
      )}>
        <div className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
          variant === "danger" ? "bg-destructive/10" : "bg-amber-500/10"
        )}>
          <AlertTriangle className={cn(
            "h-4 w-4",
            variant === "danger" ? "text-destructive" : "text-amber-500"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-black",
            variant === "danger" ? "text-destructive" : "text-amber-600 dark:text-amber-400"
          )}>{title}</p>
          <p className="text-[10px] font-bold text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// ----------------------------
// Main Dashboard
// ----------------------------
export default function Dashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { services, loading } = useServices();
  const { appointments } = useAppointments();

  const isLoading = profileLoading || loading;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Services
    const pending = services.filter(s => s.status === "pending");
    const paid = services.filter(s => s.status === "paid");

    const overdueServices = pending.filter(s => s.payment_date < TODAY)
      .sort((a, b) => a.payment_date.localeCompare(b.payment_date));

    const dueTodayServices = pending.filter(s => s.payment_date === TODAY);

    const dueThisWeek = pending.filter(s => {
      const d = parseISO(s.payment_date);
      return isThisWeek(d, { weekStartsOn: 1 }) && s.payment_date >= TODAY;
    });

    const paidThisMonth = paid.filter(s => {
      const d = parseISO(s.payment_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const totalPending = pending.reduce((a, s) => a + Number(s.value), 0);
    const totalPaidMonth = paidThisMonth.reduce((a, s) => a + Number(s.value), 0);
    const totalServicesMonth = services.filter(s => {
      const d = parseISO(s.service_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Appointments
    const todayAppts = appointments.filter(a => a.status === "scheduled" && a.date === TODAY);
    const upcomingAppts = appointments
      .filter(a => a.status === "scheduled" && a.date >= TODAY)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);

    // Next pending services (sorted by payment_date asc)
    const nextPending = pending
      .filter(s => s.payment_date >= TODAY)
      .sort((a, b) => a.payment_date.localeCompare(b.payment_date))
      .slice(0, 3);

    return {
      pending, paid,
      overdueServices, dueTodayServices, dueThisWeek,
      paidThisMonth, totalPending, totalPaidMonth,
      totalServicesMonth,
      todayAppts, upcomingAppts, nextPending,
    };
  }, [services, appointments]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse max-w-lg mx-auto">
        <Skeleton className="h-12 w-56 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
        </div>
        {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] || "Usuário";
  const hasAlerts = data.overdueServices.length > 0 || data.dueTodayServices.length > 0;

  return (
    <div className="flex flex-col gap-6 p-5 pb-28 max-w-lg mx-auto lg:max-w-2xl">

      {/* ── Header ── */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-0.5">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            {greeting}, <span className="text-primary">{firstName}</span>! 👋
          </h1>
        </div>
        <button
          onClick={() => navigate("/services/new")}
          className="h-12 w-12 flex items-center justify-center bg-primary rounded-2xl shadow-lg shadow-primary/30 text-white hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </header>

      {/* ── Alertas do dia ── */}
      {hasAlerts && (
        <div className="space-y-2">
          {data.overdueServices.length > 0 && (
            <AlertCard
              variant="danger"
              title={`${data.overdueServices.length} serviço${data.overdueServices.length > 1 ? "s" : ""} em atraso!`}
              description={`${formatCurrency(data.overdueServices.reduce((a, s) => a + Number(s.value), 0))} não recebidos · mais antigo: ${data.overdueServices[0]?.payment_date}`}
              href="/services?status=pending"
            />
          )}
          {data.dueTodayServices.length > 0 && (
            <AlertCard
              variant="warning"
              title={`${data.dueTodayServices.length} pagamento${data.dueTodayServices.length > 1 ? "s" : ""} vencem hoje`}
              description={`${formatCurrency(data.dueTodayServices.reduce((a, s) => a + Number(s.value), 0))} a receber · clique para ver`}
              href="/services?status=pending"
            />
          )}
        </div>
      )}

      {/* ── Hoje em resumo (3 pills) ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: CalendarDays,
            val: data.todayAppts.length,
            label: "hoje na agenda",
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            to: "/agenda",
          },
          {
            icon: Flame,
            val: data.dueThisWeek.length,
            label: "vencem semana",
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            to: "/services?status=pending",
          },
          {
            icon: Timer,
            val: data.overdueServices.length,
            label: "em atraso",
            color: data.overdueServices.length > 0 ? "text-destructive" : "text-emerald-600",
            bg: data.overdueServices.length > 0 ? "bg-destructive/10" : "bg-emerald-500/10",
            to: "/services?status=pending",
          },
        ].map(({ icon: Icon, val, label, color, bg, to }) => (
          <Link key={label} to={to}>
            <div className={cn(
              "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-transparent hover:border-border transition-all",
              bg
            )}>
              <Icon className={cn("h-5 w-5", color)} />
              <span className={cn("text-2xl font-black leading-none", val > 0 && label.includes("atraso") ? "text-destructive" : "")}>{val}</span>
              <span className="text-[9px] font-black uppercase tracking-tight text-muted-foreground text-center">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── KPIs financeiros ── */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          icon={Clock}
          value={formatCurrency(data.totalPending)}
          label="Total em aberto"
          sub={`${data.pending.length} serviços pendentes`}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          to="/services?status=pending"
        />
        <KpiCard
          icon={TrendingUp}
          value={formatCurrency(data.totalPaidMonth)}
          label="Recebido no mês"
          sub={`${data.paidThisMonth.length} serviços pagos`}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          to="/financial"
        />
        <KpiCard
          icon={CircleDollarSign}
          value={`${data.totalServicesMonth}`}
          label="Serviços no mês"
          sub="Todos os status"
          color="bg-gradient-to-br from-indigo-500 to-purple-600"
          to="/services"
        />
        <KpiCard
          icon={BarChart3}
          value={data.pending.length > 0 ? formatCurrency(data.totalPending / data.pending.length) : "—"}
          label="Ticket médio"
          sub="Serviços pendentes"
          color="bg-gradient-to-br from-slate-600 to-slate-800"
          to="/statistics"
        />
      </div>

      {/* ── Ações rápidas ── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Plus, label: "Serviço", to: "/services/new", color: "text-primary", bg: "bg-primary/10" },
          { icon: Users, label: "Clientes", to: "/clients", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { icon: CalendarDays, label: "Agenda", to: "/agenda", color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: BarChart3, label: "Relatório", to: "/statistics", color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map(({ icon: Icon, label, to, color, bg }) => (
          <Link key={to} to={to}>
            <div className={cn("flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:opacity-80 active:scale-95 transition-all", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
              <span className="text-[9px] font-black uppercase tracking-tight text-muted-foreground">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Compromissos de hoje ── */}
      {data.todayAppts.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={CalendarDays} label="Hoje na Agenda" to="/agenda" iconColor="text-blue-500" />
          <div className="space-y-2">
            {data.todayAppts.map(appt => (
              <Link key={appt.id} to="/agenda">
                <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl hover:border-blue-500/40 transition-colors group">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{appt.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {appt.time ? `às ${appt.time}` : "Sem horário"}
                      {appt.location ? ` · ${appt.location}` : ""}
                    </p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase">Hoje</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Próximos compromissos ── */}
      {data.upcomingAppts.filter(a => a.date !== TODAY).length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={CalendarDays} label="Próximos Compromissos" to="/agenda" iconColor="text-blue-400" />
          <div className="space-y-2">
            {data.upcomingAppts.filter(a => a.date !== TODAY).map(appt => {
              const dl = dateLabel(appt.date);
              return (
                <Link key={appt.id} to="/agenda">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-border transition-colors group">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-center">
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">
                          {format(parseISO(appt.date), "MMM", { locale: ptBR })}
                        </p>
                        <p className="text-sm font-black leading-none">
                          {format(parseISO(appt.date), "dd")}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{appt.title}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        {dl.text}{appt.time ? ` · ${appt.time}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── A receber em breve ── */}
      <div className="space-y-2.5">
        <SectionHeader
          icon={AlertCircle}
          label={data.nextPending.length > 0 ? "A receber em breve" : "Sem pendências"}
          to="/services?status=pending"
          iconColor="text-amber-500"
        />
        {data.nextPending.length > 0 ? (
          <div className="space-y-2">
            {data.nextPending.map(s => {
              const dl = dateLabel(s.payment_date);
              return (
                <Link key={s.id} to={`/services/${s.id}/edit`}>
                  <div className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl border transition-all hover:shadow-md group",
                    dl.urgent
                      ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                      : "bg-card border-border hover:border-primary/30"
                  )}>
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                      dl.urgent ? "bg-amber-500/10" : "bg-muted"
                    )}>
                      <Clock className={cn("h-4 w-4", dl.urgent ? "text-amber-500" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{s.client_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground truncate">{s.service_type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm text-emerald-600">{formatCurrency(Number(s.value))}</p>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase",
                        dl.urgent
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {dl.text}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Link to="/services/new">
            <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-muted rounded-2xl text-center hover:border-primary/30 hover:bg-primary/5 transition-all group">
              <div className="h-14 w-14 bg-muted/30 rounded-full flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tight">Tudo em dia! 🎉</p>
                <p className="text-xs text-muted-foreground font-medium">Cadastre um novo serviço</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* ── Serviços em atraso (destaque) ── */}
      {data.overdueServices.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={AlertTriangle} label="Serviços em Atraso" to="/services?status=pending" iconColor="text-destructive" />
          <div className="space-y-2">
            {data.overdueServices.slice(0, 3).map(s => (
              <Link key={s.id} to={`/services/${s.id}/edit`}>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-all group">
                  <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate text-destructive">{s.client_name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground truncate">{s.service_type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm text-destructive">{formatCurrency(Number(s.value))}</p>
                    <p className="text-[9px] font-black text-destructive/60 uppercase">{s.payment_date}</p>
                  </div>
                </div>
              </Link>
            ))}
            {data.overdueServices.length > 3 && (
              <Link to="/services?status=pending">
                <div className="text-center p-2 text-xs font-black text-destructive/60 hover:text-destructive transition-colors">
                  +{data.overdueServices.length - 3} serviços em atraso
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
