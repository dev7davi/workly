import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Upload, Loader2, Image as ImageIcon, Check, X } from "lucide-react";
import { useProfile, useUpdateProfile, Profile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";

interface BrandingSectionProps {
  profile: Profile | null;
}

export function BrandingSection({ profile }: BrandingSectionProps) {
  const updateProfile = useUpdateProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [primaryColor, setPrimaryColor] = useState(profile?.company_primary_color || "#10b981");
  const [logoUrl, setLogoUrl] = useState(profile?.company_logo_url || "");

  const { canUseWhiteLabel: isPro } = usePlan();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo muito grande. Máximo de 2MB.");
      return;
    }

    setIsUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.user_id}/branding/logo_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("workly_media")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("workly_media")
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
    } catch (err: any) {
      toast.error("Erro ao subir logo: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const saveBranding = async () => {
    if (!isPro) return;
    setIsUpdating(true);
    try {
      await updateProfile.mutateAsync({
        company_name: companyName,
        company_primary_color: primaryColor,
        company_logo_url: logoUrl
      });
      toast.success("Identidade Visual atualizada!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <ImageIcon className="h-4 w-4" /> Identidade Visual
        </h2>
        {!isPro && (
          <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase flex items-center gap-1">
            <Crown className="h-2.5 w-2.5" /> Recurso Pro
          </Badge>
        )}
      </div>

      <Card className={cn(
        "border-none shadow-lg rounded-[2rem] overflow-hidden bg-card/50 relative",
        !isPro && "opacity-80 grayscale-[0.5]"
      )}>
        {!isPro && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] rounded-[2rem]">
             <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-3xl shadow-2xl text-center max-w-[200px]">
                <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-black mb-1">Assine o Pro</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase leading-tight">Libere sua logo e cores customizadas nos PDFs.</p>
             </div>
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          {/* Logo Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-3xl p-4 w-full aspect-video flex flex-col items-center justify-center bg-muted/20 group hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
               {logoUrl ? (
                 <>
                   <img src={logoUrl} alt="Logo" className="max-h-full object-contain" />
                   {isPro && (
                     <button 
                       onClick={() => setLogoUrl("")}
                       className="absolute top-2 right-2 p-1.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all"
                     >
                       <X className="h-4 w-4" />
                     </button>
                   )}
                 </>
               ) : (
                 <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Sua Logo (2MB max)</p>
                 </div>
               )}
               {isPro && (
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleLogoUpload}
                   className="absolute inset-0 opacity-0 cursor-pointer" 
                 />
               )}
            </div>
            {isUpdating && <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse"><Loader2 className="h-3 w-3 animate-spin"/> Atualizando...</div>}
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-muted-foreground">Nome da Empresa</Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ex: Workly Soluções"
                disabled={!isPro}
                className="h-12 rounded-xl bg-muted/30 border-none transition-all focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-muted-foreground">Cor Principal da Marca</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  disabled={!isPro}
                  className="h-12 w-12 rounded-xl border-none p-1 cursor-pointer bg-muted/30"
                />
                <Input
                  value={primaryColor.toUpperCase()}
                  onChange={e => setPrimaryColor(e.target.value)}
                  disabled={!isPro}
                  className="h-12 flex-1 rounded-xl bg-muted/30 border-none font-mono"
                />
              </div>
            </div>
          </div>

          {isPro && (
             <Button 
               className="w-full h-12 rounded-2xl font-black bg-primary"
               onClick={saveBranding}
               disabled={isUpdating}
             >
               {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-2 h-4 w-4" /> Salvar Identidade</>}
             </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
