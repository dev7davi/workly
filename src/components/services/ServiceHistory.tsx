import { useState, useEffect } from "react";
import { useServices, ServiceAuditLog } from "@/hooks/useServices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  History, 
  User, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Plus, 
  Edit3, 
  Trash2,
  FileJson,
  Calendar,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

interface ServiceHistoryProps {
  serviceId: string;
}

export function ServiceHistory({ serviceId }: ServiceHistoryProps) {
  const { fetchServiceHistory, restoreVersion } = useServices();
  const [history, setHistory] = useState<ServiceAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      const data = await fetchServiceHistory(serviceId);
      setHistory(data);
      setLoading(false);
    }
    loadHistory();
  }, [serviceId]);

  const handleRestore = async (log: ServiceAuditLog) => {
    try {
      await restoreVersion(serviceId, log.snapshot_posterior || log.snapshot_anterior);
      toast.success("Versão restaurada!", { 
        description: `O serviço voltou ao estado da Versão ${log.versao}.` 
      });
      // Recarrega o histórico para mostrar a nova entrada de alteração
      const data = await fetchServiceHistory(serviceId);
      setHistory(data);
    } catch (error) {
      toast.error("Erro ao restaurar versão");
    }
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case "criado": return <Plus className="h-4 w-4" />;
      case "atualizado": return <Edit3 className="h-4 w-4" />;
      case "excluido": return <Trash2 className="h-4 w-4" />;
      case "restaurado": return <RotateCcw className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAcaoLabel = (acao: string) => {
    switch (acao) {
      case "criado": return "Criação Inicial";
      case "atualizado": return "Atualização de Dados";
      case "restaurado": return "Versão Restaurada";
      default: return acao.charAt(0).toUpperCase() + acao.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-8 items-center justify-center text-muted-foreground">
        <History className="h-8 w-8 animate-spin" />
        <p className="font-bold text-xs uppercase tracking-widest">Carregando histórico...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-12 items-center justify-center text-center">
        <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center">
          <History className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div>
          <p className="font-black uppercase tracking-tight">Sem histórico</p>
          <p className="text-xs font-medium text-muted-foreground">Nenhuma alteração foi registrada ainda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-primary/20 before:via-muted before:to-transparent">
      {history.map((log, index) => {
        const isExpanded = expandedId === log.id;
        const date = new Date(log.timestamp);
        
        return (
          <div key={log.id} className="relative pl-12 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 50}ms` }}>
            {/* Timeline Dot */}
            <div className={cn(
              "absolute left-0 mt-1.5 h-10 w-10 rounded-2xl flex items-center justify-center border-4 border-background transition-all shadow-sm z-10",
              log.acao === 'criado' ? "bg-emerald-500 text-white" : "bg-primary text-white"
            )}>
              {getAcaoIcon(log.acao)}
            </div>

            <Card className={cn(
              "border-none shadow-sm transition-all hover:shadow-md",
              isExpanded ? "ring-2 ring-primary/20 bg-card" : "bg-card/40"
            )}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm uppercase tracking-tight">
                        {getAcaoLabel(log.acao)}
                      </h4>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase rounded-lg py-0">
                        v{log.versao}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.profiles?.name || "Usuário Sistema"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {index !== 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(log)}
                        className="h-8 rounded-xl font-black text-[10px] uppercase gap-1.5 hover:bg-primary/10 hover:text-primary"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restaurar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="h-8 w-8 rounded-xl"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Diff Area */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-muted animate-in fade-in zoom-in-95 duration-200">
                    {log.campos_afetados && log.campos_afetados.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <Activity className="h-3 w-3" /> Alterações Realizadas
                        </p>
                        <div className="grid gap-2">
                          {log.campos_afetados.map((diff: any, idx: number) => (
                            <div key={idx} className="bg-muted/30 p-3 rounded-xl space-y-2">
                              <p className="text-[10px] font-black text-primary uppercase">{diff.campo.replace('_', ' ')}</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex-1 line-through text-muted-foreground bg-destructive/5 px-2 py-1 rounded-lg">
                                  {diff.valor_anterior === null ? "—" : String(diff.valor_anterior)}
                                </span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <span className="flex-1 font-bold text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-lg">
                                  {diff.valor_novo === null ? "—" : String(diff.valor_novo)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : log.acao === 'criado' ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <Plus className="h-3 w-3" /> Snapshot Inicial
                        </p>
                        <div className="bg-muted/30 p-4 rounded-2xl grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground">Cliente</p>
                            <p className="text-sm font-bold">{log.snapshot_posterior.client_name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground">Serviço</p>
                            <p className="text-sm font-bold">{log.snapshot_posterior.service_type}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground">Valor</p>
                            <p className="text-sm font-black text-primary">{formatCurrency(log.snapshot_posterior.value)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-muted-foreground">Data</p>
                            <p className="text-sm font-bold">{format(new Date(log.snapshot_posterior.service_date), "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                       <p className="text-xs font-medium text-muted-foreground italic">Nenhuma mudança de campo detectada.</p>
                    )}
                    
                    {log.motivo && (
                      <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-[9px] font-black uppercase text-primary/60 mb-1">Motivo Informado</p>
                        <p className="text-xs font-medium italic">"{log.motivo}"</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
