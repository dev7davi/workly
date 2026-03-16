import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, X, Play, Pause, Trash2, Loader2, Volume2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
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

interface AudioAttachment {
  id: string;
  audio_url: string;
  filename: string;
  created_at: string;
}

interface AudioRecorderProps {
  serviceId: string;
}

export function AudioRecorder({ serviceId }: AudioRecorderProps) {
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording, error } =
    useAudioRecorder();

  const [attachments, setAttachments] = useState<AudioAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchAttachments();
    return () => {
        if (audioElement) {
            audioElement.pause();
            audioElement.src = "";
        }
    };
  }, [serviceId]);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('service_audio_attachments')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });

    if (data) setAttachments(data);
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast.info('Gravando áudio...');
    } catch (err) {
      toast.error('Erro ao acessar microfone');
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      if (!audioBlob) return;

      setIsUploading(true);
      const timestamp = new Date().getTime();
      const filename = `${serviceId}/${timestamp}.webm`;

      // 1. Upload to Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('service_audio')
        .upload(filename, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service_audio')
        .getPublicUrl(filename);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('service_audio_attachments')
        .insert({
          service_id: serviceId,
          audio_url: publicUrl,
          filename: `${timestamp}.webm`,
          duration_seconds: recordingTime
        });

      if (dbError) throw dbError;

      toast.success('Áudio salvo com sucesso!');
      fetchAttachments();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar áudio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    try {
      const fullPath = `${serviceId}/${filename}`;
      
      // Delete from Storage
      await supabase.storage.from('service_audio').remove([fullPath]);
      
      // Delete from Database
      await supabase.from('service_audio_attachments').delete().eq('id', id);

      toast.success('Áudio removido');
      fetchAttachments();
    } catch (err) {
      toast.error('Erro ao remover áudio');
    }
  };

  const togglePlay = (attachment: AudioAttachment) => {
    if (playingId === attachment.id) {
      audioElement?.pause();
      setPlayingId(null);
    } else {
      if (audioElement) {
          audioElement.pause();
      }
      const newAudio = new Audio(attachment.audio_url);
      newAudio.onended = () => setPlayingId(null);
      newAudio.play();
      setAudioElement(newAudio);
      setPlayingId(attachment.id);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-3xl p-6 border-2 border-dashed border-muted flex flex-col items-center justify-center gap-4 transition-all">
        {isRecording ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-3 bg-destructive/10 text-destructive px-6 py-3 rounded-2xl animate-pulse border border-destructive/20">
              <div className="h-3 w-3 bg-destructive rounded-full" />
              <span className="font-mono text-xl font-black">{formatTime(recordingTime)}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={handleStopRecording}
                className="rounded-2xl h-14 px-8 font-black gap-2 shadow-xl shadow-destructive/20"
              >
                <Square className="h-5 w-5 fill-current" />
                PARAR E SALVAR
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={cancelRecording}
                className="rounded-2xl h-14 w-14 border-muted-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <Mic className="h-8 w-8" />
            </div>
            <div className="text-center">
                <p className="font-black text-lg uppercase tracking-tight">Observações de Voz</p>
                <p className="text-xs font-medium text-muted-foreground">Grave áudios rápidos sobre o serviço</p>
            </div>
            <Button 
              onClick={handleStartRecording} 
              disabled={isUploading}
              className="mt-2 rounded-2xl h-14 px-10 font-black bg-primary shadow-xl shadow-primary/20 gap-2"
            >
              <Mic className="h-5 w-5" />
              INICIAR GRAVAÇÃO
            </Button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="flex items-center justify-center gap-2 py-4 text-primary animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">Enviando áudio...</span>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Gravações Anexadas</p>
          <div className="grid gap-2">
            {attachments.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                    playingId === item.id ? "bg-primary/5 border-primary/20" : "bg-card border-slate-100"
                )}
              >
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => togglePlay(item)}
                    className={cn(
                        "rounded-xl h-10 w-10 shrink-0",
                        playingId === item.id ? "bg-primary text-white" : "bg-muted"
                    )}
                >
                  {playingId === item.id ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black truncate uppercase">Áudio #{item.filename.split('.')[0]}</p>
                    <Volume2 className={cn("h-3 w-3 text-primary shrink-0", playingId !== item.id && "hidden")} />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-black">Excluir áudio?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta gravação será removida permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg font-bold">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => handleDelete(item.id, item.filename)}
                                className="rounded-lg font-bold bg-destructive"
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
