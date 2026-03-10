import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { User, Mail, Phone, FileText, Calendar, LogOut, Loader2, Check, Crown, Sun, Moon, Settings, ShieldCheck, ChevronRight, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useBackup } from "@/hooks/useBackup";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { exportData, isExporting } = useBackup();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
    setDocument(profile?.document || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ name, phone, document });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Meu Perfil</h1>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gestão de conta e preferências</p>
      </header>

      {/* User Hero Card */}
      <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white">
        <CardContent className="flex items-center gap-6 p-8 relative z-10">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 text-3xl font-black shadow-inner">
            {profile?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-2xl font-black truncate">{profile?.name || "Usuário"}</p>
              {profile?.plan === "pro" && (
                <div className="p-1 bg-white/20 rounded-lg backdrop-blur-md">
                  <Crown className="h-3 w-3 text-amber-300" />
                </div>
              )}
            </div>
            <p className="text-sm font-medium opacity-80 truncate uppercase tracking-tighter">{profile?.email}</p>
          </div>
        </CardContent>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-indigo-500/20 rounded-full blur-3xl" />
      </Card>

      {/* Personal Info Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Dados Pessoais
          </h2>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-[10px] font-black uppercase opacity-60 hover:opacity-100">
              Editar Dados
            </Button>
          )}
        </div>

        <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-card/50">
          <CardContent className="p-6 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground">Nome completo</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-none transition-all focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground">Telefone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="h-12 rounded-xl bg-muted/30 border-none transition-all focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground">CPF/CNPJ</Label>
                  <Input
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="h-12 rounded-xl bg-muted/30 border-none transition-all focus-visible:ring-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button className="flex-1 rounded-xl h-12 font-black bg-primary" onClick={handleSave} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-2 h-4 w-4" />Salvar</>}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {[
                  { icon: Mail, label: "E-mail", value: profile?.email },
                  { icon: Phone, label: "Contato", value: profile?.phone || "Não informado" },
                  { icon: ShieldCheck, label: "Documento", value: profile?.document || "Não informado" },
                  { icon: Calendar, label: "Membro desde", value: profile?.created_at ? formatDateLong(profile.created_at) : "-" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-muted/50 rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1">{item.label}</p>
                      <p className="font-bold truncate text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-2">
          <Settings className="h-4 w-4" /> Navegação Rápida
        </h2>

        <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-card/50">
          <CardContent className="p-4 grid gap-1">
            {[
              { icon: FileText, label: "Atividade Total", sub: `${profile?.services_count || 0} serviços registrados`, href: "/services", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: User, label: "Clientes", sub: "Gerenciar seus clientes", href: "/clients", color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { icon: Calendar, label: "Agenda", sub: "Compromissos e visitas", href: "/agenda", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Settings, label: "Catálogo", sub: "Serviços e materiais padrão", href: "/catalog", color: "text-primary", bg: "bg-primary/10" },
              { icon: FileText, label: "Relatórios", sub: "Financeiro, previsões e análises", href: "/statistics", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Crown, label: "Planos & Assinatura", sub: "Veja os planos disponíveis", href: "/plans", color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map(item => (
              <div
                key={item.href}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/30 transition-colors group cursor-pointer"
                onClick={() => navigate(item.href)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 flex items-center justify-center ${item.bg} rounded-xl ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">{item.label}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/30 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-slate-500/10 rounded-xl text-slate-500">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-black">Aparência</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{theme === "dark" ? "Modo Escuro" : "Modo Claro"}</p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-full h-14 rounded-2xl text-primary font-black uppercase text-xs border-primary/20 hover:bg-primary/5 transition-all"
          onClick={exportData}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
          {isExporting ? "Gerando Backup..." : "Exportar Backup Completo (.ZIP)"}
        </Button>

        <Button
          variant="outline"
          className="w-full h-14 rounded-2xl text-destructive font-black uppercase text-xs border-destructive/20 hover:bg-destructive/5 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
        </Button>

        <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
          WORKLY VERSION 1.0.0
        </p>
      </div>
    </div>
  );
}
