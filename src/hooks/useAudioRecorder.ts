import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Detectar tipos suportados (Safari usa mp4, Chrome webm)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        setError(`Erro na gravação: ${event.error}`);
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao acessar microfone';
      setError(errorMessage);
      console.error('Erro ao iniciar gravação:', err);
    }
  }, []);

  const stopRecording = useCallback(
    (): Promise<Blob | null> => {
      return new Promise((resolve) => {
        if (!mediaRecorderRef.current || !isRecording) {
          resolve(null);
          return;
        }

        const mediaRecorder = mediaRecorderRef.current;

        mediaRecorder.onstop = () => {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }

          const audioBlob = new Blob(chunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          setIsRecording(false);
          resolve(audioBlob);
        };

        mediaRecorder.stop();
      });
    },
    [isRecording]
  );

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    chunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
    setError(null);
  }, [isRecording]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };
}
