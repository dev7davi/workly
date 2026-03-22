import { useState, useEffect, useRef } from "react";
import { Image, Mic, Paperclip, X, Loader2, Play, Expand, Trash2, FileText, File, FileType, FileWarning, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useServiceMedia, MediaFile } from "@/hooks/useServiceMedia";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ServiceMediaSectionProps {
    serviceId: string;
}

export function ServiceMediaSection({ serviceId }: ServiceMediaSectionProps) {
    const { fetchMedia: fetchImages, mediaList: images, uploadMedia: uploadImage, deleteMedia: deleteImage, isUploading: isUploadingImage } = useServiceMedia(serviceId, "images");
    const { fetchMedia: fetchAudios, mediaList: audios, uploadMedia: uploadAudio, deleteMedia: deleteAudio, isUploading: isUploadingAudio } = useServiceMedia(serviceId, "audios");
    const { fetchMedia: fetchDocuments, mediaList: documents, uploadMedia: uploadDocument, deleteMedia: deleteDocument, isUploading: isUploadingDocument } = useServiceMedia(serviceId, "documents");

    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);   // Enviar arquivo existente
    const audioCaptureRef = useRef<HTMLInputElement>(null); // Gravar via microfone (iOS-safe)
    const documentInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImages("images");
        fetchAudios("audios");
        fetchDocuments("documents");
    }, [fetchImages, fetchAudios, fetchDocuments]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (images.length >= 5) {
            alert("Máximo de 5 imagens atingido.");
            return;
        }
        await uploadImage(file, "images", 10, ['jpg', 'jpeg', 'png', 'webp', 'image/jpeg', 'image/png', 'image/webp']);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (audios.length >= 3) {
            alert("Máximo de 3 áudios atingido.");
            return;
        }
        await uploadAudio(file, "audios", 10, [
            'mp3', 'wav', 'ogg', 'm4a', 'aac',
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/x-m4a'
        ]);
        // Reset both inputs
        if (audioInputRef.current) audioInputRef.current.value = "";
        if (audioCaptureRef.current) audioCaptureRef.current.value = "";
    };

    const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (documents.length >= 5) {
            alert("Máximo de 5 documentos atingido.");
            return;
        }
        await uploadDocument(file, "documents", 5, [
            'pdf', 'txt', 'doc', 'docx',
            'application/pdf', 'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]);
        if (documentInputRef.current) documentInputRef.current.value = "";
    };

    const getDocumentIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "pdf": return <FileText className="h-6 w-6 text-red-500" />;
            case "txt": return <File className="h-6 w-6 text-gray-500" />;
            case "doc":
            case "docx": return <FileType className="h-6 w-6 text-blue-500" />;
            default: return <FileWarning className="h-6 w-6 text-yellow-500" />;
        }
    };

    return (
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden mt-6 bg-muted/20">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Paperclip className="h-4 w-4" /> Anexos do Serviço
                </div>

                {/* ── IMAGENS ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="font-bold text-sm">Câmera e Fotos</Label>
                        <span className="text-[10px] uppercase text-muted-foreground">{images.length}/5 MÁX</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {images.map((img) => (
                            <Dialog key={img.path}>
                                <DialogTrigger asChild>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center cursor-pointer group shadow-sm border border-border">
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Expand className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="p-1 items-center justify-center bg-black/90 max-w-sm rounded-[2rem] border-none overflow-hidden h-[80vh] flex flex-col">
                                    <div className="flex w-full items-center justify-between p-4 z-10 absolute top-0 text-white">
                                        <p className="font-bold text-xs opacity-70 truncate max-w-[200px]">{img.name}</p>
                                         <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                                 <button className="h-8 w-8 bg-destructive/80 text-white rounded-full flex items-center justify-center active:scale-95 transition-all">
                                                     <Trash2 className="h-4 w-4" />
                                                 </button>
                                             </AlertDialogTrigger>
                                             <AlertDialogContent className="rounded-2xl">
                                                 <AlertDialogHeader>
                                                     <AlertDialogTitle className="font-black">Excluir foto?</AlertDialogTitle>
                                                     <AlertDialogDescription>
                                                         Esta imagem será permanentemente removida.
                                                     </AlertDialogDescription>
                                                 </AlertDialogHeader>
                                                 <AlertDialogFooter>
                                                     <AlertDialogCancel className="rounded-lg font-bold">Cancelar</AlertDialogCancel>
                                                     <AlertDialogAction
                                                         onClick={() => deleteImage(img.path, "images")}
                                                         className="rounded-lg font-bold bg-destructive text-white"
                                                     >
                                                         Excluir
                                                     </AlertDialogAction>
                                                 </AlertDialogFooter>
                                             </AlertDialogContent>
                                         </AlertDialog>
                                    </div>
                                    <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
                                </DialogContent>
                            </Dialog>
                        ))}

                        {images.length < 5 && (
                            <label className="relative aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer group hover:bg-muted/50 transition-all hover:border-primary/50 text-muted-foreground hover:text-primary">
                                {isUploadingImage ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <Image className="h-6 w-6 mb-2" />
                                        <span className="text-[10px] font-black uppercase text-centerpx-2">Adicionar</span>
                                    </>
                                )}
                                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploadingImage} />
                            </label>
                        )}
                    </div>
                </div>

                {/* ── ÁUDIOS ── */}
                <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <Label className="font-bold text-sm">Arquivos de Áudio</Label>
                        <span className="text-[10px] uppercase text-muted-foreground">{audios.length}/3 MÁX</span>
                    </div>

                    <div className="space-y-2">
                        {audios.map((audio) => (
                            <div key={audio.path} className="flex items-center gap-3 p-3 bg-background rounded-2xl border border-border shadow-sm">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Play className="h-5 w-5 text-primary ml-1" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-xs font-bold truncate">{audio.name}</p>
                                    <audio src={audio.url} controls className="w-full h-8 mt-1 rounded scale-90 origin-left" />
                                </div>
                                 <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                         <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl">
                                             <Trash2 className="h-4 w-4" />
                                         </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent className="rounded-2xl">
                                         <AlertDialogHeader>
                                             <AlertDialogTitle className="font-black">Excluir áudio?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                 O registro de áudio será permanentemente removido.
                                             </AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                             <AlertDialogCancel className="rounded-lg font-bold">Cancelar</AlertDialogCancel>
                                             <AlertDialogAction
                                                 onClick={() => deleteAudio(audio.path, "audios")}
                                                 className="rounded-lg font-bold bg-destructive text-white"
                                             >
                                                 Excluir
                                             </AlertDialogAction>
                                         </AlertDialogFooter>
                                     </AlertDialogContent>
                                 </AlertDialog>
                            </div>
                        ))}

                        {audios.length < 3 && (
                            <div className="pt-1 grid grid-cols-2 gap-2">
                                {/* Botão A: Gravar Áudio (capture=microphone para iOS) */}
                                <input ref={audioCaptureRef} type="file" accept="audio/*" capture="microphone" className="hidden" onChange={handleAudioChange} disabled={isUploadingAudio} />
                                <Button type="button" variant="outline" className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2" onClick={() => audioCaptureRef.current?.click()} disabled={isUploadingAudio}>
                                    {isUploadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                                    Gravar Áudio
                                </Button>

                                {/* Botão B: Enviar Arquivo existente (sem capture) */}
                                <input ref={audioInputRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.aac,audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/aac" className="hidden" onChange={handleAudioChange} disabled={isUploadingAudio} />
                                <Button type="button" variant="outline" className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2" onClick={() => audioInputRef.current?.click()} disabled={isUploadingAudio}>
                                    {isUploadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Enviar Arquivo
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── DOCUMENTOS ── */}
                <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <Label className="font-bold text-sm">Documentos (PDF, TXT, Word)</Label>
                        <span className="text-[10px] uppercase text-muted-foreground">{documents.length}/5 MÁX</span>
                    </div>

                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div key={doc.path} className="flex items-center gap-3 p-3 bg-background rounded-2xl border border-border shadow-sm">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    {getDocumentIcon(doc.name)}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold truncate block hover:underline text-foreground">
                                        {doc.name}
                                    </a>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-black">Excluir documento?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                O documento será permanentemente removido.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg font-bold">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteDocument(doc.path, "documents")}
                                                className="rounded-lg font-bold bg-destructive text-white"
                                            >
                                                Excluir
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}

                        {documents.length < 5 && (
                            <div className="pt-1">
                                <input
                                    ref={documentInputRef}
                                    type="file"
                                    accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    onChange={handleDocumentChange}
                                    disabled={isUploadingDocument}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2"
                                    onClick={() => documentInputRef.current?.click()}
                                    disabled={isUploadingDocument}
                                >
                                    {isUploadingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                    Anexar Documento
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
