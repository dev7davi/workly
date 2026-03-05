import { useServices } from "@/hooks/useServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Users, Briefcase, Clock } from "lucide-react";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function Statistics() {
  const { services, loading } = useServices();

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const paidValue = services
    .filter((s) => s.status === "paid")
    .reduce((acc, s) => acc + s.value, 0);
  const pendingValue = services
    .filter((s) => s.status === "pending")
    .reduce((acc, s) => acc + s.value, 0);
  
  const uniqueClients = new Set(services.map((s) => s.client_name)).size;

  const statusData = [
    { name: "Pagos", value: services.filter((s) => s.status === "paid").length },
    { name: "Pendentes", value: services.filter((s) => s.status === "pending").length },
    { name: "Cancelados", value: services.filter((s) => s.status === "cancelled").length },
  ].filter(d => d.value > 0);

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString("pt-BR", { month: "short" }),
      monthIdx: d.getMonth(),
      year: d.getFullYear(),
      total: 0,
    };
  });

  last6Months.forEach((m) => {
    m.total = services
      .filter((s) => {
        const sDate = new Date(s.service_date);
        return sDate.getMonth() === m.monthIdx && sDate.getFullYear() === m.year && s.status === "paid";
      })
      .reduce((acc, s) => acc + s.value, 0);
  });

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Estatísticas</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Total Pago</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(paidValue)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Pendente</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(pendingValue)}</p>
          </CardContent>
        </Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="h-4 w-4" /><span className="text-xs font-medium uppercase">Clientes</span></div><p className="text-lg font-bold text-foreground">{uniqueClients}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground mb-1"><Briefcase className="h-4 w-4" /><span className="text-xs font-medium uppercase">Serviços</span></div><p className="text-lg font-bold text-foreground">{services.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Receita Mensal (Pagos)</CardTitle></CardHeader>
        <CardContent className="h-[250px] w-full pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (<div className="rounded-lg border bg-background p-2 shadow-sm"><p className="text-xs font-medium">{payload[0].payload.month}</p><p className="text-sm font-bold text-primary">{formatCurrency(Number(payload[0].value))}</p></div>);
                }
                return null;
              }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
