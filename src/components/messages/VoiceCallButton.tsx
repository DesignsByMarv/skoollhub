'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type CallSignalType = 'offer' | 'answer' | 'ice-candidate' | 'reject' | 'hangup';
type CallPayload = {
  call_id?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};
type CallSignal = {
  id: string;
  chat_id: string;
  sender_id: string;
  recipient_id: string;
  signal_type: CallSignalType;
  payload: CallPayload | null;
  created_at: string;
};
type CallStatus = 'idle' | 'calling' | 'incoming' | 'connecting' | 'active';

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || 'Could not start the voice call.';
}

export default function VoiceCallButton({
  chatId,
  currentUserId,
  recipientId,
  recipientName,
}: {
  chatId: string;
  currentUserId: string;
  recipientId: string;
  recipientName: string;
}) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [relayConfigured, setRelayConfigured] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingSignal, setIncomingSignal] = useState<CallSignal | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const currentCallIdRef = useRef('');
  const remoteUserIdRef = useRef('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const statusRef = useRef<CallStatus>('idle');
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const sendSignal = useCallback(async (
    recipient: string,
    type: CallSignalType,
    payload: CallPayload
  ) => {
    const response = await fetch('/api/messages/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        recipient_id: recipient,
        signal_type: type,
        payload,
      }),
    });
    if (!response.ok) throw new Error(await responseError(response));
  }, [chatId]);

  const closeConnection = useCallback(() => {
    connectionRef.current?.close();
    connectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingCandidatesRef.current = [];
    setRemoteStream(null);
    setIncomingSignal(null);
    setMuted(false);
    setElapsedSeconds(0);
    currentCallIdRef.current = '';
    remoteUserIdRef.current = '';
    setStatus('idle');
  }, []);

  const createConnection = useCallback(async (
    stream: MediaStream,
    callId: string,
    remoteUserId: string
  ) => {
    const configurationResponse = await fetch('/api/messages/calls/config', { cache: 'no-store' });
    if (!configurationResponse.ok) throw new Error(await responseError(configurationResponse));
    const configuration = await configurationResponse.json() as { iceServers: RTCIceServer[]; relayConfigured: boolean };
    setRelayConfigured(configuration.relayConfigured);

    const connection = new RTCPeerConnection({ iceServers: configuration.iceServers });
    connectionRef.current = connection;
    stream.getTracks().forEach((track) => connection.addTrack(track, stream));
    connection.ontrack = (event) => setRemoteStream(event.streams[0] ?? null);
    connection.onicecandidate = (event) => {
      if (!event.candidate) return;
      void sendSignal(remoteUserId, 'ice-candidate', {
        call_id: callId,
        candidate: event.candidate.toJSON(),
      }).catch((signalError) => {
        setError(signalError instanceof Error ? signalError.message : 'Could not send network information for this call.');
      });
    };
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'connected') {
        setStatus('active');
        setError('');
      } else if (connection.connectionState === 'failed') {
        setError('Could not connect this call. Check your connection or configure TURN servers for cross-network calls.');
        closeConnection();
      } else if (connection.connectionState === 'disconnected') {
        setError('The call connection was interrupted.');
      }
    };
    return connection;
  }, [closeConnection, sendSignal]);

  const acceptOffer = useCallback(async (signal: CallSignal) => {
    const callId = signal.payload?.call_id;
    const offer = signal.payload?.sdp;
    if (!callId || !offer) throw new Error('This voice call invitation is invalid.');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    currentCallIdRef.current = callId;
    remoteUserIdRef.current = signal.sender_id;
    const connection = await createConnection(stream, callId, signal.sender_id);
    await connection.setRemoteDescription(new RTCSessionDescription(offer));
    for (const candidate of pendingCandidatesRef.current.splice(0)) {
      await connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    await sendSignal(signal.sender_id, 'answer', {
      call_id: callId,
      sdp: connection.localDescription?.toJSON(),
    });
    setIncomingSignal(null);
    setStatus('connecting');
  }, [createConnection, sendSignal]);

  const receiveSignal = useCallback(async (signal: CallSignal) => {
    if (signal.sender_id === currentUserId) return;
    const callId = signal.payload?.call_id;
    if (signal.signal_type === 'offer' && signal.recipient_id === currentUserId && callId && statusRef.current === 'idle') {
      setIncomingSignal(signal);
      remoteUserIdRef.current = signal.sender_id;
      currentCallIdRef.current = callId;
      setStatus('incoming');
      return;
    }
    if (!callId || callId !== currentCallIdRef.current) return;

    if (signal.signal_type === 'answer' && signal.payload?.sdp && connectionRef.current) {
      await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload.sdp));
      for (const candidate of pendingCandidatesRef.current.splice(0)) {
        await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } else if (signal.signal_type === 'ice-candidate' && signal.payload?.candidate) {
      if (connectionRef.current?.remoteDescription) {
        await connectionRef.current.addIceCandidate(new RTCIceCandidate(signal.payload.candidate));
      } else {
        pendingCandidatesRef.current.push(signal.payload.candidate);
      }
    } else if (signal.signal_type === 'reject') {
      setError(`${recipientName} declined the call.`);
      closeConnection();
    } else if (signal.signal_type === 'hangup') {
      closeConnection();
    }
  }, [closeConnection, currentUserId, recipientName]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const channel = supabase
      .channel(`voice-call:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        void receiveSignal(payload.new as CallSignal).catch((signalError) => {
          setError(signalError instanceof Error ? signalError.message : 'Could not process the call signal.');
        });
      })
      .subscribe((channelStatus) => {
        if (channelStatus === 'CHANNEL_ERROR' || channelStatus === 'TIMED_OUT') {
          setError('Live call invitations are unavailable. Check your Supabase Realtime configuration.');
        }
      });

    void fetch(`/api/messages/calls?chat_id=${encodeURIComponent(chatId)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseError(response));
        const data = await response.json() as { signals: CallSignal[] };
        const activeOffer = [...data.signals].reverse().find((signal) =>
          signal.signal_type === 'offer'
          && signal.recipient_id === currentUserId
          && Date.now() - new Date(signal.created_at).getTime() < 60_000
          && !data.signals.some((endingSignal) =>
            endingSignal.payload?.call_id === signal.payload?.call_id
            && ['answer', 'reject', 'hangup'].includes(endingSignal.signal_type)
          )
        );
        if (active && activeOffer && statusRef.current === 'idle') {
          setIncomingSignal(activeOffer);
          setStatus('incoming');
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not check for incoming calls.');
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
      closeConnection();
    };
  }, [chatId, closeConnection, currentUserId, receiveSignal]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (status !== 'active') return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const startCall = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Voice calls require microphone access in a secure browser connection (HTTPS).');
      return;
    }
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      const callId = crypto.randomUUID();
      currentCallIdRef.current = callId;
      remoteUserIdRef.current = recipientId;
      const connection = await createConnection(stream, callId, recipientId);
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await sendSignal(recipientId, 'offer', {
        call_id: callId,
        sdp: connection.localDescription?.toJSON(),
      });
      setStatus('calling');
    } catch (callError) {
      closeConnection();
      setError(callError instanceof Error ? callError.message : 'Could not start this voice call.');
    }
  };

  const answerCall = async () => {
    if (!incomingSignal) return;
    setError('');
    try {
      await acceptOffer(incomingSignal);
    } catch (callError) {
      closeConnection();
      setError(callError instanceof Error ? callError.message : 'Could not answer this call.');
    }
  };

  const endCall = async (signalType: 'hangup' | 'reject' = 'hangup') => {
    const remoteUserId = remoteUserIdRef.current || incomingSignal?.sender_id;
    const callId = currentCallIdRef.current || incomingSignal?.payload?.call_id;
    if (remoteUserId && callId) {
      try {
        await sendSignal(remoteUserId, signalType, { call_id: callId });
      } catch (callError) {
        setError(callError instanceof Error ? callError.message : 'Could not send the call status.');
      }
    }
    closeConnection();
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  };

  const formatDuration = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <button
        type="button"
        onClick={() => void startCall()}
        disabled={status !== 'idle'}
        aria-label={`Call ${recipientName}`}
        title="Start voice call"
        className="rounded-full p-2 text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-40 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
      >
        <Phone size={19} />
      </button>
      {error && status === 'idle' && <p role="alert" className="absolute right-4 top-20 z-40 max-w-sm rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 shadow-lg dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">{error}</p>}
      {status !== 'idle' && (
        <div role="presentation" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-4">
          <section role="dialog" aria-modal="true" aria-label="Voice call" className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"><Phone size={30} /></span>
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{recipientName}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              {status === 'incoming' ? 'Incoming voice call' : status === 'calling' ? 'Calling…' : status === 'connecting' ? 'Connecting…' : `Connected · ${formatDuration}`}
            </p>
            {status !== 'active' && status !== 'incoming' && <LoaderCircle size={18} className="mx-auto mt-4 animate-spin text-indigo-600" />}
            {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
            {!relayConfigured && (
              <p className="mt-4 text-[11px] leading-5 text-slate-400">
                Calls on different networks may need a relay service configured for reliable connection.
              </p>
            )}
            <audio ref={audioRef} autoPlay />
            <div className="mt-6 flex items-center justify-center gap-4">
              {status === 'incoming' ? (
                <>
                  <button type="button" onClick={() => void endCall('reject')} className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700" aria-label="Decline call"><PhoneOff size={19} /></button>
                  <button type="button" onClick={() => void answerCall()} className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700" aria-label="Answer call"><Phone size={19} /></button>
                </>
              ) : (
                <>
                  {status === 'active' && <button type="button" onClick={toggleMute} className={`flex h-12 w-12 items-center justify-center rounded-full ${muted ? 'bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-white' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200'}`} aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}>{muted ? <MicOff size={19} /> : <Mic size={19} />}</button>}
                  <button type="button" onClick={() => void endCall()} className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700" aria-label="End call"><PhoneOff size={19} /></button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
