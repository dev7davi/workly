import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, ServiceStatus } from "@/hooks/useServices";
import { ServiceCard } from "@/components/services/ServiceCard";
import { toast } from "sonner";

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const { services, loading, duplicateService } = useServices();

  const handleDuplicate = async (service: any) => {
    await duplicateService(service);
    toast.success("Serviço duplicado!", { description: "Uma cópia foi criada como pendente." });
  };

  const statusFilter =
    (searchParams.get("status") as ServiceStatus | "all") || "all";

  const filteredServices = services.filter((service) => {
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;

    const matchesSearch =
      service.client_name.toLowerCase().includes(search.toLowerCase()) ||
      service.service_type.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    setSearchParams(params);
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {services.length} serviço{services.length !== 1 ? "s" : ""} registrado{services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/services/new">
          <Button className="rounded-2xl h-12 px-6 font-black bg-primary shadow-lg shadow-primary/20 shrink-0">
            <Plus className="mr-2 h-5 w-5" />
            Novo
          </Button>
        </Link>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-2xl bg-muted/40 border-none focus-visible:ring-primary"
        />
      </div>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <Tabs value={statusFilter} onValueChange={handleStatusChange} className="min-w-max w-full">
          <TabsList className="w-full h-12 rounded-2xl bg-muted/50 p-1 flex">
            <TabsTrigger value="all" className="flex-1 rounded-xl font-bold text-xs uppercase px-6">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 rounded-xl font-bold text-xs uppercase px-6">Pendentes</TabsTrigger>
            <TabsTrigger value="paid" className="flex-1 rounded-xl font-bold text-xs uppercase px-6">Pagos</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 rounded-xl font-bold text-xs uppercase px-6">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onDuplicate={handleDuplicate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center">
            <Filter className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-black text-foreground uppercase tracking-tight text-lg">
              Nenhum resultado
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              {search
                ? "Tente outro termo de busca"
                : "Cadastre seu primeiro serviço"}
            </p>
          </div>
          {!search && (
            <Link to="/services/new">
              <Button className="rounded-2xl h-12 px-8 font-black bg-primary shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" />
                Novo Serviço
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
