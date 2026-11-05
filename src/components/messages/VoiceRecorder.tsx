'use client';

import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onSendAudio: (blob: Blob) => void;
}

export function VoiceRecorder({ onSendAudio }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        
        // Stop all microphone audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size > 0) {
          onSendAudio(audioBlob);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access failed:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? 'Stop and send voice note' : 'Record voice note'}
      aria-label={isRecording ? 'Stop and send voice note' : 'Record voice note'}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
        isRecording
          ? 'animate-pulse bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
          : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-zinc-800'
      }`}
    >
      {isRecording ? <Square size={19} fill="currentColor" /> : <Mic size={19} />}
    </button>
  );
}