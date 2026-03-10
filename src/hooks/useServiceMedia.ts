import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./use-toast";

type MediaType = "images" | "audios";

export interface MediaFile {
    name: string;
    url: string;
    path: string;
}

export function useServiceMedia(serviceId: string, initialType: MediaType = "images") {
    const { user } = useAuth();
    const { toast } = useToast();
    const [mediaList, setMediaList] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMedia = useCallback(async (type: MediaType) => {
        if (!user || !serviceId) return;
        setIsLoading(true);
        try {
            const folderPath = `${user.id}/services/${serviceId}/${type}`;
            const { data, error } = await supabase.storage.from("workly_media").list(folderPath);

            if (error) throw error;

            if (data) {
                // get signed urls
                const files: MediaFile[] = [];
                for (const file of data) {
                    if (file.name === ".emptyFolderPlaceholder") continue;
                    const filePath = `${folderPath}/${file.name}`;
                    const { data: urlData, error: urlError } = await supabase.storage.from("workly_media").createSignedUrl(filePath, 60 * 60);
                    if (!urlError && urlData) {
                        files.push({
                            name: file.name,
                            path: filePath,
                            url: urlData.signedUrl
                        });
                    }
                }
                setMediaList(files);
            }
        } catch (err: any) {
            console.error("Error fetching media:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, serviceId]);

    const uploadMedia = async (file: File, type: MediaType, maxSizeMB: number, allowedFormats: string[]) => {
        if (!user || !serviceId) return null;

        // Validation
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedFormats.includes(ext) && !allowedFormats.includes(file.type)) {
            toast({ title: "Formato inválido", variant: "destructive", description: `Envie apenas: ${allowedFormats.join(', ')}` });
            return null;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast({ title: "Arquivo muito grande", variant: "destructive", description: `Máximo de ${maxSizeMB}MB` });
            return null;
        }

        setIsUploading(true);
        try {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const filePath = `${user.id}/services/${serviceId}/${type}/${fileName}`;

            const { error } = await supabase.storage.from("workly_media").upload(filePath, file);
            if (error) throw error;

            toast({ title: "Arquivo anexado com sucesso!" });
            await fetchMedia(type); // reload
            return filePath;
        } catch (err: any) {
            console.error("Error uploading:", err);
            toast({ title: "Erro ao anexar arquivo", variant: "destructive" });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteMedia = async (path: string, type: MediaType) => {
        try {
            const { error } = await supabase.storage.from("workly_media").remove([path]);
            if (error) throw error;
            toast({ title: "Arquivo removido", description: "O anexo foi excluído." });
            setMediaList(prev => prev.filter(f => f.path !== path));
        } catch (err: any) {
            console.error("Error deleting:", err);
            toast({ title: "Falha ao remover arquivo", variant: "destructive" });
        }
    };

    return { mediaList, fetchMedia, uploadMedia, deleteMedia, isLoading, isUploading };
}
