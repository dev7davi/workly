import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { User, Mail, Phone, FileText, Calendar, LogOut, Loader2, Check, Crown, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateLong } from "@/lib/format";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
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
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações</p>
      </header>

      <Card className="bg-gradient-hero text-primary-foreground">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl font-bold">
            {profile?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold">{profile?.name || "Usuário"}</p>
            <p className="text-sm opacity-90">{profile?.email}</p>
          </div>
          <Badge className="bg-primary-foreground/20 text-primary-foreground">
            <Crown className="mr-1 h-3 w-3" />
            {profile?.plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Informações</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>Editar</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button className="flex-1 bg-gradient-hero" onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-2 h-4 w-4" />Salvar</>}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{profile?.name}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">E-mail</p><p className="font-medium">{profile?.email}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{profile?.phone || "Não informado"}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">CPF/CNPJ</p><p className="font-medium">{profile?.document || "Não informado"}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">Membro desde</p><p className="font-medium">{profile?.created_at ? formatDateLong(profile.created_at) : "-"}</p></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="font-medium">Modo escuro</p>
                <p className="text-sm text-muted-foreground">Alterar aparência do app</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Total de serviços</p>
              <p className="text-sm text-muted-foreground">Cadastrados na sua conta</p>
            </div>
            <p className="text-2xl font-bold text-primary">{profile?.services_count || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />Sair da conta
      </Button>
    </div>
  );
}
