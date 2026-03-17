import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Service } from "@/hooks/useServices";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  paid: { label: "Pago", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Cancelado", icon: AlertCircle, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[service.status];
  const StatusIcon = status.icon;

  const handleCardClick = () => {
    navigate(`/services/${service.id}/edit`);
  };

  const handleClientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clients/${encodeURIComponent(service.client_name)}`);
  };


  return (
    <Card
      className="group cursor-pointer border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-card"
      onClick={handleCardClick}
    >
      <CardContent className={cn("flex items-center justify-between relative", compact ? "p-3" : "p-4")}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Status Icon Indicator */}
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
            compact ? "h-10 w-10" : "h-14 w-14",
            service.status === "pending" && "bg-amber-500/10 text-amber-600",
            service.status === "paid" && "bg-emerald-500/10 text-emerald-600",
            service.status === "cancelled" && "bg-slate-500/10 text-slate-500"
          )}>
            <StatusIcon className={compact ? "h-5 w-5" : "h-7 w-7"} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <button
                onClick={handleClientClick}
                className="truncate font-black text-foreground hover:text-primary transition-colors text-base"
              >
                {service.client_name}
              </button>
            </div>

            <p className="truncate text-sm font-medium text-muted-foreground">{service.service_type}</p>

            {!compact && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold px-1.5 py-0", status.color)}>
                  {status.label}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                  {formatDate(service.payment_date)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <div className="text-right">
            <p className={cn(
              "text-lg font-black tracking-tighter",
              service.status === "pending" && "text-amber-600",
              service.status === "paid" && "text-emerald-600",
              service.status === "cancelled" && "text-muted-foreground/40 line-through"
            )}>
              {formatCurrency(Number(service.value))}
            </p>
          </div>


          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardContent>
    </Card>
  );
}
