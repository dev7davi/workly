import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    TrendingDown, TrendingUp, DollarSign, PieChart as PieChartIcon,
    Activity, ArrowDownRight, ArrowUpRight, ChevronRight, Package,
    Wrench, Target, Percent
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAllServiceCosts } from "@/hooks/useAllServiceCosts";
import { useServices } from "@/hooks/useServices";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { parseISO, format, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORES_CATEGORIA: Record<string, string> = {
    material: "#3b82f6",
    deslocamento: "#f59e0b",
    terceirizado: "#8b5cf6",
    alimentacao: "#ec4899",
    taxa: "#ef4444",
    outro: "#64748b",
};

export default function Costs() {
    const { costs, isLoading: costsLoading } = useAllServiceCosts();
    const { services, loading: servicesLoading } = useServices();

    const isLoading = costsLoading || servicesLoading;

    const data = useMemo(() => {
        const now = new Date();
        const paidServices = services.filter(s => s.status === "paid" || s.status === "pending" || s.status === "concluido");

        // Total Bruto de todos os serviços
        const totalRevenue = paidServices.reduce((acc, s) => acc + Number(s.value), 0);

        // Todos os custos (que o provedor paga ou embutido)
        const providerCosts = costs.filter(c => c.paid_by === "provider" || !c.paid_by);
        const totalCost = providerCosts.reduce((acc, c) => acc + Number(c.total_price), 0);

        const netProfit = totalRevenue - totalCost;
        const avgMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        // Custos do mês atual
        const monthlyCosts = providerCosts.filter(c => {
            const d = parseISO(c.created_at || c.service?.service_date || now.toISOString());
            return isThisMonth(d);
        });
        const monthlyCostTotal = monthlyCosts.reduce((acc, c) => acc + Number(c.total_price), 0);

        // Distribuição por Categoria
        const costByCategory = providerCosts.reduce((acc, c) => {
            const cat = c.category || "outro";
            acc[cat] = (acc[cat] || 0) + Number(c.total_price);
            return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(costByCategory).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: COLORES_CATEGORIA[name] || COLORES_CATEGORIA.outro
        })).sort((a, b) => b.value - a.value);

        // Serviços mais lucrativos
        // Pra cada serviço: preco - custo associado
        const serviceProfitMap = new Map<string, { id: string; name: string; type: string; rev: number; cost: number; profit: number; margin: number }>();

        paidServices.forEach(s => {
            serviceProfitMap.set(s.id, {
                id: s.id,
                name: s.client_name,
                type: s.service_type,
                rev: Number(s.value),
                cost: 0,
                profit: Number(s.value),
                margin: 100
            });
        });

        providerCosts.forEach(c => {
            if (c.service_id && serviceProfitMap.has(c.service_id)) {
                const item = serviceProfitMap.get(c.service_id)!;
                item.cost += Number(c.total_price);
                item.profit = item.rev - item.cost;
                item.margin = item.rev > 0 ? (item.profit / item.rev) * 100 : 0;
            }
        });

        const profitRanking = Array.from(serviceProfitMap.values())
            .filter(s => s.rev > 0)
            .sort((a, b) => b.profit - a.profit);

        // Comparação de Barras (Recebido vs Custo) dos últimos meses (Simples aglomeração de meses que existem custos/servicos)
        // Para simplificar, vou extrair todos os meses presentes nos serviços
        const monthStatsMap = new Map<string, { month: string; recebido: number; custo: number }>();

        [...paidServices, ...providerCosts].forEach(item => {
            let dStr = "";
            if ('service_date' in item && typeof item.service_date === 'string') {
                dStr = item.service_date;
            } else if ('created_at' in item) {
                dStr = (item as any).created_at;
            }

            if (!dStr) return;
            try {
                const date = parseISO(dStr);
                if (isNaN(date.getTime())) return;

                const mKey = format(date, "MM/yyyy");
                const monthLabel = format(date, "MM/yy", { locale: ptBR });

                if (!monthStatsMap.has(mKey)) {
                    monthStatsMap.set(mKey, { month: monthLabel, recebido: 0, custo: 0 });
                }

                if ('service_date' in item) {
                    monthStatsMap.get(mKey)!.recebido += Number((item as any).value || 0);
                } else {
                    monthStatsMap.get(mKey)!.custo += Number((item as any).total_price || 0);
                }
            } catch (e) { }
        });

        // Ordenar os meses extraídos - muito grosseiramente se a lista for grande, mas ok para demonstração
        const chartBars = Array.from(monthStatsMap.entries())
            .sort((a, b) => {
                const [ma, ya] = a[0].split('/');
                const [mb, yb] = b[0].split('/');
                return new Date(Number(ya), Number(ma) - 1).getTime() - new Date(Number(yb), Number(mb) - 1).getTime();
            })
            .map(entry => entry[1])
            .slice(-6); // Ultimos 6 meses no grafico

        return {
            totalRevenue, totalCost, netProfit, avgMargin,
            monthlyCostTotal, pieData, profitRanking,
            chartBars
        };
    }, [costs, services]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-6 animate-pulse max-w-lg mx-auto">
                <Skeleton className="h-12 w-56 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
                </div>
                <Skeleton className="h-48 rounded-3xl" />
            </div>
        );
    }

    const { profitRanking } = data;
    const topProfitable = profitRanking.slice(0, 3);
    const leastProfitable = [...profitRanking].sort((a, b) => a.profit - b.profit).slice(0, 3);

    return (
        <div className="flex flex-col gap-5 p-5 pb-28 max-w-lg mx-auto">
            {/* ── Header ── */}
            <header className="flex items-center justify-between pt-2">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                        DRE Inteligente
                    </p>
                    <h1 className="text-2xl font-black tracking-tight">Custos & Lucro</h1>
                </div>
            </header>

            {/* ── Indicadores Macro ── */}
            <div className="grid grid-cols-2 gap-3">
                {/* Lucro Liquido */}
                <Card className="border-none shadow-xl rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white col-span-2">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Margem Média</p>
                                <Badge className="bg-white/20 text-white border-transparent text-xs font-black">
                                    {data.avgMargin.toFixed(1)}%
                                </Badge>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter mb-1">{formatCurrency(data.netProfit)}</h3>
                        <p className="text-xs font-bold opacity-80 uppercase">Lucro Líquido Realizado</p>
                    </CardContent>
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-3xl" />
                </Card>

                {/* Receita Total */}
                <Card className="border-none shadow-md rounded-3xl bg-card">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="text-xl font-black tracking-tighter">{formatCurrency(data.totalRevenue)}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">Receita Total</p>
                    </CardContent>
                </Card>

                {/* Custo Total */}
                <Card className="border-none shadow-md rounded-3xl bg-card">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-destructive" />
                        </div>
                        <p className="text-xl font-black tracking-tighter text-destructive">{formatCurrency(data.totalCost)}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">Custo Total</p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Comparação barras Receita x Custo ── */}
            {data.chartBars.length > 0 && (
                <Card className="border-none shadow-xl rounded-3xl bg-card">
                    <CardContent className="p-6">
                        <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" /> Balanço últimos 6 meses
                        </h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={data.chartBars} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-20" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="recebido" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="custo" name="Custo" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* ── Custos por Categoria - Pizza ── */}
            {data.pieData.length > 0 && (
                <Card className="border-none shadow-xl rounded-3xl bg-card">
                    <CardContent className="p-6">
                        <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-amber-500" /> Custo por Categoria
                        </h3>
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={120} height={120}>
                                <PieChart>
                                    <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                                        {data.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2.5">
                                {data.pieData.map(entry => (
                                    <div key={entry.name} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                                            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                                            {entry.name}
                                        </div>
                                        <span className="font-black">{formatCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Ranking: Mais lucrativos ── */}
            {topProfitable.length > 0 && (
                <Card className="border-none shadow-xl rounded-3xl bg-card overflow-hidden">
                    <div className="p-5 bg-emerald-500/10 border-b border-emerald-500/20">
                        <h3 className="font-black uppercase text-xs tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4" /> Serviços Mais Lucrativos
                        </h3>
                    </div>
                    <CardContent className="p-0">
                        {topProfitable.map((srv, idx) => (
                            <Link key={srv.id} to={`/services/${srv.id}/edit`}>
                                <div className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0 group">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground shrink-0">{idx + 1}º</span>
                                            <p className="font-black text-sm truncate">{srv.name}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground truncate">{srv.type}</p>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                        <span className="font-black text-sm text-emerald-600">Lucro: {formatCurrency(srv.profit)}</span>
                                        <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black px-1.5 border-transparent pointer-events-none">
                                            Margem: {srv.margin.toFixed(0)}%
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* ── Ranking: Menos lucrativos / Margens de Risco ── */}
            {leastProfitable.length > 0 && leastProfitable.some(s => s.margin < 30) && (
                <Card className="border-none shadow-xl rounded-3xl bg-card overflow-hidden mt-2 border border-destructive/20">
                    <div className="p-5 bg-destructive/5 border-b border-destructive/10">
                        <h3 className="font-black uppercase text-xs tracking-widest text-destructive flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4" /> Alerta de Baixa Margem (ou Prejuízo)
                        </h3>
                    </div>
                    <CardContent className="p-0">
                        {leastProfitable.filter(s => s.margin < 30).map((srv) => (
                            <Link key={srv.id} to={`/services/${srv.id}/edit`}>
                                <div className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0 group">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm truncate">{srv.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground truncate">{srv.type}</p>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                        <span className={cn("font-black text-sm", srv.profit < 0 ? "text-destructive" : "text-amber-500")}>
                                            {srv.profit < 0 ? `Prejuízo: ${formatCurrency(Math.abs(srv.profit))}` : `Lucro: ${formatCurrency(srv.profit)}`}
                                        </span>
                                        <Badge className={cn("text-[9px] font-black px-1.5 border-transparent", srv.profit < 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600")}>
                                            Margem: {srv.margin.toFixed(0)}%
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* ── Tabela Analítica de Serviços ── */}
            {profitRanking.length > 0 && (
                <div className="space-y-3 mt-4">
                    <h3 className="font-black uppercase text-xs tracking-widest text-muted-foreground flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" /> Lista Analítica de Custos
                    </h3>
                    <div className="space-y-2">
                        {profitRanking.map(srv => (
                            <div key={srv.id} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                                <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-4">
                                    <p className="font-black text-sm truncate">{srv.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground truncate">{srv.type}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-right shrink-0 min-w-[140px]">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-muted-foreground">Valor</span>
                                        <span className="text-xs font-bold">{formatCurrency(srv.rev)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-muted-foreground">Custo</span>
                                        <span className="text-xs font-bold text-destructive">-{formatCurrency(srv.cost)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-muted-foreground">Margem</span>
                                        <span className={cn("text-xs font-black", srv.margin < 30 ? "text-destructive" : "text-emerald-600")}>
                                            {srv.margin.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
