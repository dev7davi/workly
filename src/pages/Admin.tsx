import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, ArrowLeft, Search, Loader2, LogIn, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    created_at: string;
    phone: string;
    document: string;
}

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filtered, setFiltered] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Verificação Mestra
    const isMaster = user?.email === "masterworkly@workly.com";

    useEffect(() => {
        if (user && !isMaster) {
            navigate("/");
        } else if (user && isMaster) {
            fetchUsers();
        }
    }, [user, isMaster, navigate]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.rpc("admin_list_users");
            if (error) throw error;
            setUsers(data || []);
            setFiltered(data || []);
        } catch (err: any) {
            console.error(err);
            toast({ title: "Erro ao buscar", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (search.trim() === "") {
            setFiltered(users);
        } else {
            const lower = search.toLowerCase();
            setFiltered(users.filter(u =>
                (u.name && u.name.toLowerCase().includes(lower)) ||
                (u.email && u.email.toLowerCase().includes(lower))
            ));
        }
    }, [search, users]);

    const handleImpersonate = async (targetUser: AdminUser) => {
        toast({ title: "Iniciando sessão", description: `Acessando conta de ${targetUser.name || targetUser.email}` });

        // Log Audit
        await supabase.from("admin_audit_logs").insert({
            admin_id: user?.id,
            target_user_id: targetUser.id,
            action: "impersonate_user",
            description: `Admin logou como ${targetUser.email}`
        });

        // Impersonate behavior via local storage (mock for frontend if we were fully bypassing)
        // REAL IMPERSONATION requires JWT or password reset.
        // For this demonstration, we store target ID, and App logic would need to adapt.
        // However, Supabase blocks pure frontend impersonation. 
        // Emulação:
        localStorage.setItem("impersonate_user_id", targetUser.id);
        window.location.href = "/";
    };

    const handleBackupUser = (targetUser: AdminUser) => {
        toast({ title: "Gerando Banco", description: "Iniciando dump do usuário (Fictício para este escopo)" });
    };

    if (!isMaster) return null;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black/90 pb-20 p-6 max-w-5xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Link to="/profile">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border-none shadow-sm">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        Admin Master
                    </h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Workly Global Dashboard</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-none shadow-xl rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                    <CardContent className="p-6">
                        <h2 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Total Usuários</h2>
                        <p className="text-5xl font-black tracking-tighter mb-4">{users.length}</p>
                        <div className="pt-4 border-t border-white/20">
                            <p className="text-xs font-bold opacity-90"><Database className="h-4 w-4 inline mr-1" /> Banco Saudável</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-lg rounded-2xl">
                    <CardHeader>
                        <CardTitle>Pesquisar Contas</CardTitle>
                        <CardDescription>Busque usuários por nome ou e-mail na base de dados.</CardDescription>
                        <div className="relative mt-2">
                            <Search className="h-5 w-5 absolute left-3 top-3 text-muted-foreground" />
                            <Input
                                placeholder="Buscar usuário..."
                                className="pl-10 h-12 rounded-xl bg-muted/30 border-none"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map(u => (
                                    <div key={u.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
                                        <div className="h-12 w-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-black text-xl shrink-0">
                                            {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black truncate">{u.name || "Sem nome"}</p>
                                            <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="secondary" className="text-[10px] font-bold">Criado em {formatDate(u.created_at)}</Badge>
                                                {u.phone && <Badge variant="outline" className="text-[10px]">{u.phone}</Badge>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button variant="secondary" size="sm" onClick={() => handleBackupUser(u)} className="h-10 rounded-xl font-bold">
                                                <Database className="h-4 w-4 mr-2" /> Backup
                                            </Button>
                                            <Button variant="default" size="sm" onClick={() => handleImpersonate(u)} className="h-10 rounded-xl font-black bg-purple-600 hover:bg-purple-700">
                                                <LogIn className="h-4 w-4 mr-2" /> Entrar como
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="text-center p-8 text-muted-foreground font-bold">Nenhum usuário encontrado.</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
