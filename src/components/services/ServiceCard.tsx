import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Service } from "@/hooks/useServices";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-warning text-warning-foreground" },
  paid: { label: "Pago", icon: CheckCircle, color: "bg-success text-success-foreground" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-destructive text-destructive-foreground" },
};

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const status = statusConfig[service.status];
  const StatusIcon = status.icon;

  return (
    <Link to={`/services/${service.id}/edit`}>
      <Card className="cursor-pointer transition-all hover:shadow-md">
        <CardContent className={cn("flex items-center justify-between", compact ? "p-3" : "p-4")}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn(
              "flex shrink-0 items-center justify-center rounded-full",
              compact ? "h-10 w-10" : "h-12 w-12",
              service.status === "pending" && "bg-warning/10",
              service.status === "paid" && "bg-success/10",
              service.status === "cancelled" && "bg-destructive/10"
            )}>
              <StatusIcon className={cn(
                compact ? "h-5 w-5" : "h-6 w-6",
                service.status === "pending" && "text-warning",
                service.status === "paid" && "text-success",
                service.status === "cancelled" && "text-destructive"
              )} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{service.client_name}</p>
              <p className="truncate text-sm text-muted-foreground">{service.service_type}</p>
              {!compact && (
                <p className="text-xs text-muted-foreground">
                  Pagamento: {formatDate(service.payment_date)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className={cn(
                "font-semibold",
                service.status === "pending" && "text-warning",
                service.status === "paid" && "text-success",
                service.status === "cancelled" && "text-muted-foreground line-through"
              )}>
                {formatCurrency(Number(service.value))}
              </p>
              {compact && (
                <Badge variant="secondary" className={cn("text-xs", status.color)}>
                  {status.label}
                </Badge>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
