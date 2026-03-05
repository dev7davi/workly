import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, ServiceStatus } from "@/hooks/useServices";
import { ServiceCard } from "@/components/services/ServiceCard";

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const { services, loading } = useServices();

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
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
        <Link to="/services/new">
          <Button className="bg-gradient-hero">
            <Plus className="mr-2 h-4 w-4" />
            Novo
          </Button>
        </Link>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={statusFilter} onValueChange={handleStatusChange}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            Todos
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex-1">
            Pagos
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            Cancelados
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">
              Nenhum serviço encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Tente outro termo de busca"
                : "Cadastre seu primeiro serviço"}
            </p>
          </div>
          {!search && (
            <Link to="/services/new">
              <Button className="bg-gradient-hero">
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
