import { TrendingUp, Clock, CheckCircle, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/ServiceCard";
import { formatCurrency } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { generateMonthlyReport } from "@/lib/generateReport";
import { useProfile } from "@/hooks/useProfile";
import { useServices } from "@/hooks/useServices";

const chartConfig = {
  value: {
    label: "Recebido",
    color: "hsl(var(--primary))",
  },
};

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function Financial() {
  const { services, loading } = useServices();
  const { data: profile } = useProfile();

  const pendingServices = services.filter(
    (s) => s.status === "pending"
  );

  const paidServices = services.filter(
    (s) => s.status === "paid"
  );

  const totalPending = pendingServices.reduce(
    (acc, s) => acc + s.value,
    0
  );

  const now = new Date();

  const totalPaidThisMonth = paidServices
    .filter((s) => {
      const d = new Date(s.payment_date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((acc, s) => acc + s.value, 0);

  // Últimos 6 meses
  const monthlyEarnings = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = monthNames[date.getMonth()];

    const value = paidServices
      .filter((s) => {
        const d = new Date(s.payment_date);
        return (
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      })
      .reduce((acc, s) => acc + s.value, 0);

    return { month, value };
  });

  const hasChartData = monthlyEarnings.some((d) => d.value > 0);

  const handleExportPDF = () => {
    const currentMonthServices = services.filter((s) => {
      const d = new Date(s.service_date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    generateMonthlyReport({
      services:
        currentMonthServices.length > 0
          ? currentMonthServices
          : services,
      userName: profile?.name || "Usuário",
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Financeiro
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus recebimentos
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={services.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </header>

      <div className="grid gap-4">
        <Card className="bg-gradient-hero text-primary-foreground">
          <CardContent className="flex items-center gap-4 p-4">
            <TrendingUp className="h-7 w-7" />
            <div>
              <p className="text-sm opacity-90">A receber</p>
              {loading ? (
                <Skeleton className="h-8 w-32 bg-primary-foreground/20" />
              ) : (
                <p className="text-3xl font-bold">
                  {formatCurrency(totalPending)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="h-7 w-7 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">
                Recebido este mês
              </p>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(totalPaidThisMonth)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Evolução Mensal (últimos 6 meses)
          </h3>

          {loading ? (
            <Skeleton className="h-[180px] w-full" />
          ) : hasChartData ? (
            <ChartContainer
              config={chartConfig}
              className="h-[180px] w-full"
            >
              <AreaChart data={monthlyEarnings}>
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(v) =>
                    `R$${v >= 1000 ? `${v / 1000}k` : v}`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) =>
                        formatCurrency(Number(v))
                      }
                    />
                  }
                />
                <Area
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/0.2)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum serviço pago ainda.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="pending">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            A Receber ({pendingServices.length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex-1 gap-2">
            <CheckCircle className="h-4 w-4" />
            Recebidos ({paidServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingServices.length > 0 ? (
            pendingServices.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum serviço pendente
            </p>
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-4 space-y-3">
          {paidServices.length > 0 ? (
            paidServices.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum serviço pago ainda
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
