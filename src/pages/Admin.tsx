import React, { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Search,
    Eye,
    ShieldCheck,
    ExternalLink,
    Mail,
    Calendar,
    UserCheck,
    Zap,
    Star,
    Crown,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";

interface AdminUser {
    id: string;
    email: string;
    name: string;
    created_at: string;
    phone: string | null;
    document: string | null;
    plan: string;
}

const planIcons: Record<string, any> = {
    free: Star,
    start: Zap,
    pro: Crown,
    pro_plus: Sparkles,
};

const planColors: Record<string, string> = {
    free: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    start: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    pro: "bg-primary/10 text-primary border-primary/20",
    pro_plus: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const Admin = () => {
    const { isMaster, setViewingUser, viewingUserId } = useAdmin();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isMaster) {
            navigate("/");
            return;
        }
        fetchUsers();
    }, [isMaster]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.rpc as any)("admin_list_users");
            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Erro ao carregar usuários:", error);
            toast.error("Erro ao carregar painel admin");
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = (user: AdminUser) => {
        setViewingUser(user.id, user.email);
        toast.success(`Visualizando como ${user.name || user.email}`, {
            description: "Você agora vê os dados deste usuário.",
        });
        navigate("/dashboard");
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isMaster) return null;

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
                    <p className="text-muted-foreground">
                        Gerenciamento centralizado de usuários e suporte técnico.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 flex gap-2 items-center">
                        <ShieldCheck className="h-4 w-4" />
                        Acesso Master Ativo
                    </Badge>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Base de clientes {APP_NAME}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Base de Clientes</CardTitle>
                            <CardDescription>Consulte e acesse perfis para suporte.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                className="pl-9 bg-background/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Usuário</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Cadastro</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" />
                                        </TableRow>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            Nenhum usuário encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const PlanIcon = planIcons[user.plan] || Star;
                                        return (
                                            <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {user.name?.substring(0, 2).toUpperCase() || "??"}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.name || "N/A"}</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" /> {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`flex gap-1 items-center w-fit ${planColors[user.plan]}`}>
                                                        <PlanIcon className="h-3 w-3" />
                                                        {user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">
                                                    {user.document || "Não inf."}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="hover:bg-primary/10 hover:text-primary transition-all flex gap-2 items-center ml-auto"
                                                        onClick={() => handleImpersonate(user)}
                                                        disabled={user.id === viewingUserId}
                                                    >
                                                        {user.id === viewingUserId ? (
                                                            <>
                                                                <UserCheck className="h-4 w-4" />
                                                                Acessado
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4" />
                                                                Visualizar como
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold">Modo de Impersonation (View Mode)</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Diferente de uma troca de senha, o modo de visualização utiliza a sua permissão Master para ler apenas os dados do usuário selecionado. Suas ações de auditoria são registradas para conformidade.
                    </p>
                </div>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                    Ver Logs de Auditoria
                </Button>
            </div>
        </div>
    );
};

export default Admin;
