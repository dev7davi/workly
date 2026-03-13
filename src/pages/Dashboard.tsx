import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Clock, TrendingUp, Briefcase, AlertCircle,
  CalendarDays, Users, ArrowRight, Zap, AlertTriangle,
  CheckCircle2, CircleDollarSign, BarChart3, ChevronRight,
  Flame, Timer, Phone, MessageCircle, FileText,
  DollarSign, Wrench, Star, Target, Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { useServices } from "@/hooks/useServices";
import { useAppointments } from "@/hooks/useAppointments";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useClients } from "@/hooks/useClients";
import { usePlan } from "@/hooks/usePlan";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { format, isToday, isTomorrow, isPast, parseISO, isThisWeek, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Constants ────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dateLabel(dateStr: string) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return { text: "Hoje", urgent: true };
    if (isTomorrow(d)) return { text: "Amanhã", urgent: false };
    if (isPast(d)) return { text: "Vencido", urgent: true };
    if (isThisWeek(d, { weekStartsOn: 1 })) return { text: format(d, "EEEE", { locale: ptBR }), urgent: false };
    return { text: format(d, "dd/MM", { locale: ptBR }), urgent: false };
  } catch {
    return { text: dateStr, urgent: false };
  }
}

function greetingText() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, to, iconColor = "text-muted-foreground" }: {
  icon: any; label: string; to?: string; iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
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

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, color, bg, onClick }: {
  icon: any; label: string; color: string; bg: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95",
        bg
      )}
    >
      <Icon className={cn("h-5 w-5", color)} />
      <span className="text-[9px] font-black uppercase tracking-tight text-muted-foreground text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── Service Row (today) ─────────────────────────────────────────────────────
function TodayServiceRow({ service, clientPhone }: { service: any; clientPhone?: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border group hover:shadow-md transition-all">
      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
        <Wrench className="h-4 w-4 text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/services/${service.id}/edit`)}>
        <p className="font-black text-sm truncate">{service.client_name}</p>
        <p className="text-[10px] font-bold text-muted-foreground truncate">{service.service_type}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-black text-emerald-600">{formatCurrency(Number(service.value))}</span>
        {clientPhone && (
          <>
            <a
              href={`tel:${clientPhone}`}
              onClick={e => e.stopPropagation()}
              className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500/20"
              title="Ligar"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
            <a
              href={`https://wa.me/${clientPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20"
              title="WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { services, loading: servicesLoading } = useServices();
  const { appointments, isLoading: apptLoading } = useAppointments();
  const { events, isLoading: eventsLoading } = useCalendarEvents();
  const { clients } = useClients();
  const { planConfig, usage, isMaster } = usePlan();

  const isLoading = profileLoading || servicesLoading || apptLoading || eventsLoading;

  const data = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // ── Services ──
    const pending = services.filter(s => s.status === "pending");
    const paid = services.filter(s => s.status === "paid");

    // Today's services (execution date = today)
    const todayServices = services.filter(s => s.service_date === TODAY);
    // Today's payments due
    const todayPayments = pending.filter(s => s.payment_date === TODAY);
    // Overdue
    const overdueServices = pending
      .filter(s => s.payment_date < TODAY)
      .sort((a, b) => a.payment_date.localeCompare(b.payment_date));
    // Due this week
    const dueThisWeek = pending.filter(s => {
      const d = parseISO(s.payment_date);
      return isThisWeek(d, { weekStartsOn: 1 }) && s.payment_date >= TODAY;
    });
    // Paid this month
    const paidThisMonth = paid.filter(s => {
      const d = parseISO(s.payment_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    // Next 3 pending
    const nextPending = pending
      .filter(s => s.payment_date >= TODAY)
      .sort((a, b) => a.payment_date.localeCompare(b.payment_date))
      .slice(0, 3);

    const totalPending = pending.reduce((a, s) => a + Number(s.value), 0);
    const totalPaidMonth = paidThisMonth.reduce((a, s) => a + Number(s.value), 0);
    const totalServicesMonth = services.filter(s => {
      const d = parseISO(s.service_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // ── Appointments (legacy) ──
    const todayAppts = appointments
      .filter(a => a.status === "scheduled" && a.date === TODAY)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    const upcomingAppts = appointments
      .filter(a => a.status === "scheduled" && a.date > TODAY)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);

    // ── Calendar Events ──
    const todayEvents = events
      .filter(e => e.data_inicio === TODAY && e.status !== "cancelado" && e.status !== "concluido")
      .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
    const nextEvents = events
      .filter(e => e.data_inicio > TODAY && e.status !== "cancelado" && e.status !== "concluido")
      .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))
      .slice(0, 3);

    // ── Next appointment (combined: first of today's events/appts sorted by time) ──
    const allTodayScheduled: { title: string; time?: string; type: string }[] = [
      ...todayAppts.map(a => ({ title: a.title, time: a.time || undefined, type: "compromisso" })),
      ...todayEvents.map(e => ({ title: e.titulo, time: e.hora_inicio || undefined, type: e.tipo_evento })),
    ].sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

    const nextAppointment = allTodayScheduled[0];

    // ── Client phone lookup ──
    const clientPhoneMap: Record<string, string | undefined> = {};
    clients.forEach(c => { clientPhoneMap[c.name.toLowerCase().trim()] = c.phone || undefined; });

    return {
      pending, paid, overdueServices, todayPayments,
      todayServices, dueThisWeek, paidThisMonth, nextPending,
      totalPending, totalPaidMonth, totalServicesMonth,
      todayAppts, upcomingAppts,
      todayEvents, nextEvents,
      allTodayScheduled, nextAppointment,
      clientPhoneMap,
    };
  }, [services, appointments, events, clients]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-5 animate-pulse max-w-7xl mx-auto w-full">
        <Skeleton className="h-14 w-64 rounded-xl" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] || "Usuário";
  const hasAlerts = data.overdueServices.length > 0 || data.todayPayments.length > 0;
  const todayTotal = data.todayPayments.reduce((a, s) => a + Number(s.value), 0);

  return (
    <div className="flex flex-col gap-5 p-5 pb-28 max-w-7xl mx-auto w-full animate-in fade-in duration-300">

      {/* ── Header ── */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            {greetingText()}, <span className="text-primary">{firstName}</span>! 👋
          </h1>
        </div>
        <button
          onClick={() => navigate("/services/new")}
          className="h-12 w-12 flex items-center justify-center bg-primary rounded-2xl shadow-lg shadow-primary/30 text-white hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </header>

      {/* ── Plan Usage ── */}
      {planConfig.maxServices && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Zap className={cn("h-4 w-4", usage.servicesMonth >= (planConfig.maxServices * 0.8) ? "text-amber-500" : "text-primary")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uso do Plano {planConfig.label}</span>
            </div>
            <Link to="/plans" className="text-[10px] font-black uppercase text-primary hover:underline">Upgrade</Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span>Serviços (este mês)</span>
                <span>{usage.servicesMonth} / {planConfig.maxServices}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    usage.servicesMonth >= planConfig.maxServices ? "bg-destructive" : usage.servicesMonth >= (planConfig.maxServices * 0.8) ? "bg-amber-500" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(100, (usage.servicesMonth / planConfig.maxServices) * 100)}%` }}
                />
              </div>
            </div>

            {planConfig.maxClients && (
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Clientes Ativos</span>
                  <span>{usage.clientsTotal} / {planConfig.maxClients}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      usage.clientsTotal >= planConfig.maxClients ? "bg-destructive" : usage.clientsTotal >= (planConfig.maxClients * 0.8) ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(100, (usage.clientsTotal / planConfig.maxClients) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Próximo compromisso do dia ── */}
      {data.nextAppointment && (
        <Link to="/agenda">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 via-blue-500/5 to-indigo-500/5 border border-primary/20 rounded-2xl hover:border-primary/40 transition-all">
            <div className="h-11 w-11 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Próximo hoje</p>
              <p className="font-black text-base truncate">{data.nextAppointment.title}</p>
              <p className="text-[10px] font-bold text-muted-foreground">
                {data.nextAppointment.time ? `às ${data.nextAppointment.time}` : "Sem horário definido"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary/40 shrink-0" />
          </div>
        </Link>
      )}

      {/* ── Alertas urgentes ── */}
      {hasAlerts && (
        <div className="space-y-2">
          {data.overdueServices.length > 0 && (
            <AlertCard
              variant="danger"
              title={`${data.overdueServices.length} serviço${data.overdueServices.length > 1 ? "s" : ""} em atraso!`}
              description={`${formatCurrency(data.overdueServices.reduce((a, s) => a + Number(s.value), 0))} não recebidos · mais antigo: ${data.overdueServices[0]?.payment_date}`}
              href="/financial"
            />
          )}
          {data.todayPayments.length > 0 && (
            <AlertCard
              variant="warning"
              title={`${data.todayPayments.length} pagamento${data.todayPayments.length > 1 ? "s" : ""} vencem hoje`}
              description={`${formatCurrency(todayTotal)} a receber · clique para cobrar`}
              href="/financial"
            />
          )}
        </div>
      )}

      {/* ── Resumo do dia em 3 pills ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: CalendarDays,
            val: data.allTodayScheduled.length,
            label: "na agenda hoje",
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            to: "/agenda",
          },
          {
            icon: Wrench,
            val: data.todayServices.length,
            label: "serviços hoje",
            color: "text-indigo-600",
            bg: "bg-indigo-500/10",
            to: "/services",
          },
          {
            icon: Timer,
            val: data.overdueServices.length,
            label: "em atraso",
            color: data.overdueServices.length > 0 ? "text-destructive" : "text-emerald-600",
            bg: data.overdueServices.length > 0 ? "bg-destructive/10" : "bg-emerald-500/10",
            to: "/financial",
          },
        ].map(({ icon: Icon, val, label, color, bg, to }) => (
          <Link key={label} to={to}>
            <div className={cn(
              "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-transparent hover:border-border transition-all",
              bg
            )}>
              <Icon className={cn("h-5 w-5", color)} />
              <span className={cn("text-2xl font-black leading-none", val > 0 && label.includes("atraso") ? "text-destructive" : "")}>{val}</span>
              <span className="text-[9px] font-black uppercase tracking-tight text-muted-foreground text-center leading-tight">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Serviços de hoje ── */}
      {data.todayServices.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={Wrench} label="Serviços de Hoje" to="/services" iconColor="text-indigo-500" />
          <div className="space-y-2">
            {data.todayServices.map(s => {
              const phone = data.clientPhoneMap[s.client_name.toLowerCase().trim()];
              return <TodayServiceRow key={s.id} service={s} clientPhone={phone} />;
            })}
          </div>
        </div>
      )}

      {/* ── Agenda de hoje (eventos calendar + compromissos legacy) ── */}
      {data.allTodayScheduled.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={CalendarDays} label="Agenda de Hoje" to="/agenda" iconColor="text-blue-500" />
          <div className="space-y-2">
            {data.allTodayScheduled.map((item, idx) => (
              <Link key={idx} to="/agenda">
                <div className="flex items-center gap-3 p-3.5 bg-blue-500/5 border border-blue-500/15 rounded-2xl hover:border-blue-500/40 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{item.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {item.time ? `às ${item.time}` : "Sem horário"} · {item.type}
                    </p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase shrink-0">Hoje</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Recebimentos do dia ── */}
      {data.todayPayments.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={DollarSign} label="Recebimentos de Hoje" to="/financial" iconColor="text-emerald-500" />
          <div className="space-y-2">
            {data.todayPayments.map(s => {
              const phone = data.clientPhoneMap[s.client_name.toLowerCase().trim()];
              return (
                <div key={s.id} className="flex items-center gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl group">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <Link to={`/services/${s.id}/edit`} className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{s.client_name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground truncate">{s.service_type}</p>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-black text-emerald-600">{formatCurrency(Number(s.value))}</span>
                    {phone && (
                      <a
                        href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20"
                        title="Cobrar via WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── KPIs financeiros ── */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          icon={Clock}
          value={formatCurrency(data.totalPending)}
          label="Total em aberto"
          sub={`${data.pending.length} serviços pendentes`}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          to="/financial"
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
          icon={Activity}
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
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" /> Ações Rápidas
        </p>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction
            icon={Plus}
            label="Novo Serviço"
            color="text-primary"
            bg="bg-primary/10 hover:bg-primary/20"
            onClick={() => navigate("/services/new")}
          />
          <QuickAction
            icon={CalendarDays}
            label="Novo Evento"
            color="text-blue-600"
            bg="bg-blue-500/10 hover:bg-blue-500/20"
            onClick={() => navigate("/agenda")}
          />
          <QuickAction
            icon={DollarSign}
            label="Financeiro"
            color="text-emerald-600"
            bg="bg-emerald-500/10 hover:bg-emerald-500/20"
            onClick={() => navigate("/financial")}
          />
          <QuickAction
            icon={BarChart3}
            label="Relatórios"
            color="text-purple-600"
            bg="bg-purple-500/10 hover:bg-purple-500/20"
            onClick={() => navigate("/statistics")}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction
            icon={Users}
            label="Clientes"
            color="text-indigo-600"
            bg="bg-indigo-500/10 hover:bg-indigo-500/20"
            onClick={() => navigate("/clients")}
          />
          <QuickAction
            icon={FileText}
            label="Serviços"
            color="text-slate-600"
            bg="bg-slate-500/10 hover:bg-slate-500/20"
            onClick={() => navigate("/services")}
          />
          <QuickAction
            icon={Target}
            label="Agenda"
            color="text-cyan-600"
            bg="bg-cyan-500/10 hover:bg-cyan-500/20"
            onClick={() => navigate("/agenda")}
          />
          <QuickAction
            icon={Star}
            label="Perfil"
            color="text-amber-600"
            bg="bg-amber-500/10 hover:bg-amber-500/20"
            onClick={() => navigate("/profile")}
          />
        </div>
      </div>

      {/* ── Próximos eventos da agenda ── */}
      {(data.nextEvents.length > 0 || data.upcomingAppts.length > 0) && (
        <div className="space-y-2.5">
          <SectionHeader icon={CalendarDays} label="Próximos na Agenda" to="/agenda" iconColor="text-blue-400" />
          <div className="space-y-2">
            {/* Calendar events */}
            {data.nextEvents.map(evt => {
              const daysUntil = differenceInDays(parseISO(evt.data_inicio), new Date());
              return (
                <Link key={evt.id} to="/agenda">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-border transition-colors">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-center"
                      style={{ background: (evt.cor || "#6366f1") + "20" }}>
                      <div>
                        <p className="text-[8px] font-black uppercase leading-none" style={{ color: evt.cor || "#6366f1" }}>
                          {format(parseISO(evt.data_inicio), "MMM", { locale: ptBR })}
                        </p>
                        <p className="text-sm font-black leading-none">
                          {format(parseISO(evt.data_inicio), "dd")}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{evt.titulo}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        {evt.hora_inicio ? `às ${evt.hora_inicio}` : ""} {daysUntil === 0 ? "· Hoje" : daysUntil === 1 ? "· Amanhã" : `· em ${daysUntil} dias`}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </div>
                </Link>
              );
            })}
            {/* Legacy appointments */}
            {data.upcomingAppts.map(appt => {
              const dl = dateLabel(appt.date);
              return (
                <Link key={appt.id} to="/agenda">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-border transition-colors">
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
                        {dl.text}{appt.time ? ` · às ${appt.time}` : ""}
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
      {data.nextPending.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={AlertCircle} label="A receber em breve" to="/financial" iconColor="text-amber-500" />
          <div className="space-y-2">
            {data.nextPending.map(s => {
              const dl = dateLabel(s.payment_date);
              const phone = data.clientPhoneMap[s.client_name.toLowerCase().trim()];
              return (
                <div key={s.id} className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border transition-all group",
                  dl.urgent
                    ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                    : "bg-card border-border hover:border-primary/30"
                )}>
                  <Link to={`/services/${s.id}/edit`} className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: dl.urgent ? "rgb(245 158 11 / 0.1)" : "hsl(var(--muted))" }}>
                    <Clock className={cn("h-4 w-4", dl.urgent ? "text-amber-500" : "text-muted-foreground")} />
                  </Link>
                  <Link to={`/services/${s.id}/edit`} className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{s.client_name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground truncate">{s.service_type}</p>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="text-right">
                      <p className="font-black text-sm text-emerald-600">{formatCurrency(Number(s.value))}</p>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase",
                        dl.urgent ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                      )}>
                        {dl.text}
                      </Badge>
                    </div>
                    {phone && (
                      <a
                        href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 shrink-0"
                        title="Cobrar via WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Serviços em atraso ── */}
      {data.overdueServices.length > 0 && (
        <div className="space-y-2.5">
          <SectionHeader icon={AlertTriangle} label="Em Atraso — Ação necessária" to="/financial" iconColor="text-destructive" />
          <div className="space-y-2">
            {data.overdueServices.slice(0, 3).map(s => {
              const phone = data.clientPhoneMap[s.client_name.toLowerCase().trim()];
              const daysLate = differenceInDays(new Date(), parseISO(s.payment_date));
              return (
                <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-all">
                  <Link to={`/services/${s.id}/edit`} className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </Link>
                  <Link to={`/services/${s.id}/edit`} className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate text-destructive">{s.client_name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground truncate">{s.service_type} · {daysLate}d atraso</p>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <p className="font-black text-sm text-destructive">{formatCurrency(Number(s.value))}</p>
                    {phone && (
                      <>
                        <a href={`tel:${phone}`} className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500/20" title="Ligar">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20" title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {data.overdueServices.length > 3 && (
              <Link to="/financial">
                <div className="text-center p-2 text-xs font-black text-destructive/60 hover:text-destructive transition-colors">
                  +{data.overdueServices.length - 3} serviços em atraso
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Estado vazio: tudo em dia ── */}
      {data.pending.length === 0 && data.allTodayScheduled.length === 0 && (
        <Link to="/services/new">
          <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-muted rounded-2xl text-center hover:border-primary/30 hover:bg-primary/5 transition-all group">
            <div className="h-14 w-14 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="font-black uppercase tracking-tight">Tudo em dia! 🎉</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Cadastre um novo serviço para começar</p>
            </div>
          </div>
        </Link>
      )}

    </div>
  );
}
