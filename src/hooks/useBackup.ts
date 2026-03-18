import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./use-toast";

export function useBackup() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const exportData = async () => {
        if (!user) return;
        setIsExporting(true);
        toast({ title: "Iniciando backup...", description: "Coletando seus dados e arquivos. Isso pode demorar um pouco." });

        try {
            const zip = new JSZip();

            // 1. Fetch text data
            const [
                { data: clients },
                { data: services },
                { data: calendar },
                { data: costs },
                { data: profile }
            ] = await Promise.all([
                supabase.from("clients").select("*").eq("user_id", user.id),
                supabase.from("services").select("*").eq("user_id", user.id),
                supabase.from("calendar_events").select("*").eq("user_id", user.id),
                supabase.from("service_costs").select("*").eq("user_id", user.id),
                supabase.from("profiles").select("*").eq("id", user.id).single()
            ]);

            const dataFolder = zip.folder("data");
            if (dataFolder) {
                dataFolder.file("clientes.json", JSON.stringify(clients || [], null, 2));
                dataFolder.file("servicos.json", JSON.stringify(services || [], null, 2));
                dataFolder.file("agenda.json", JSON.stringify(calendar || [], null, 2));
                dataFolder.file("custos.json", JSON.stringify(costs || [], null, 2));
                dataFolder.file("perfil.json", JSON.stringify(profile || {}, null, 2));
            }

            // 2. Fetch all media from Storage bucket 'workly_media'
            const servicesMediaFolder = zip.folder("services_media");
            const { data: buckets } = await supabase.storage.from("workly_media").list(`${user.id}/services`, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

            // Basic recursive folder scan is hard with supabase native list API without nested calls.
            // Doing a simple fetch: Since we don't have deep traversal easily, we'll fetch known services' images/audios.
            if (services && servicesMediaFolder) {
                for (const s of services) {
                    for (const t of ['images', 'audios']) {
                        const path = `${user.id}/services/${s.id}/${t}`;
                        const { data: mediaFiles } = await supabase.storage.from("workly_media").list(path);
                        if (mediaFiles && mediaFiles.length > 0) {
                            for (const f of mediaFiles) {
                                if (f.name === ".emptyFolderPlaceholder") continue;
                                const { data: blob, error: dlErr } = await supabase.storage.from("workly_media").download(`${path}/${f.name}`);
                                if (blob && !dlErr) {
                                    servicesMediaFolder.file(`${s.id}/${t}/${f.name}`, blob);
                                }
                            }
                        }
                    }
                }
            }

            // 3. Generate and download
            const content = await zip.generateAsync({ type: "blob" });
            const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
            saveAs(content, `backup_worklly_${user.id}_${dateStr}.zip`);

            toast({ title: "Backup concluído", description: "Seu arquivo foi gerado com sucesso." });
        } catch (err) {
            console.error(err);
            toast({ title: "Erro no backup", description: "Ocorreu um problema ao gerar seu arquivo.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    return { exportData, isExporting };
}
