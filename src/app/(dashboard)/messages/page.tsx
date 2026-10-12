'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText, ImagePlus, LoaderCircle, MessageCircle, Paperclip, Send, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Contact = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
};
type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  document_name: string | null;
  created_at: string;
};
type Conversation = {
  id: string;
  contact: Contact;
  last_message: Message | null;
};

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || 'Something went wrong. Please try again.';
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><LoaderCircle className="animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const requestedUserId = searchParams.get('user');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const createdForUserRef = useRef('');

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const visibleMessages = messages.filter((message) => message.chat_id === selectedId);

  const loadConversations = useCallback(async () => {
    const response = await fetch('/api/messages/conversations', { cache: 'no-store' });
    if (!response.ok) throw new Error(await responseError(response));
    const data = await response.json() as { conversations: Conversation[] };
    setConversations(data.conversations);
    return data.conversations;
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function initialize() {
      try {
        const [{ data: { user } }, response] = await Promise.all([
          supabase.auth.getUser(),
          fetch('/api/messages/conversations', { cache: 'no-store' }),
        ]);
        if (!response.ok) throw new Error(await responseError(response));
        const data = await response.json() as { conversations: Conversation[] };
        if (!active) return;
        setCurrentUserId(user?.id ?? '');
        setConversations(data.conversations);
        const existing = requestedUserId
          ? data.conversations.find((conversation) => conversation.contact.id === requestedUserId)
          : null;
        if (existing) {
          setSelectedId(existing.id);
        } else if (requestedUserId && requestedUserId !== user?.id && createdForUserRef.current !== requestedUserId) {
          createdForUserRef.current = requestedUserId;
          const createResponse = await fetch('/api/messages/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participant_ids: [requestedUserId] }),
          });
          if (!createResponse.ok) throw new Error(await responseError(createResponse));
          const created = await createResponse.json() as { conversation: { id: string } };
          if (active) {
            await loadConversations();
            setSelectedId(created.conversation.id);
          }
        } else if (data.conversations[0]) {
          setSelectedId(data.conversations[0].id);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load messages.');
      } finally {
        if (active) setLoadingConversations(false);
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [loadConversations, requestedUserId]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setLoadingMessages(true);
    async function loadMessages() {
      try {
        const response = await fetch(`/api/messages?chat_id=${encodeURIComponent(selectedId)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(await responseError(response));
        const data = await response.json() as { messages: Message[] };
        if (active) setMessages(data.messages);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load message history.');
      } finally {
        if (active) setLoadingMessages(false);
      }
    }
    void loadMessages();
    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${selectedId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${selectedId}`,
      }, (payload) => {
        const incoming = payload.new as Message;
        setMessages((current) => current.some((message) => message.id === incoming.id)
          ? current
          : [...current, incoming]);
        void loadConversations().catch((loadError) => {
          setError(loadError instanceof Error ? loadError.message : 'Could not refresh conversations.');
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('Live message updates are unavailable. Refresh the page to check for new messages.');
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadConversations, selectedId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedId]);

  const sendMessage = async (payload: { content?: string; media_url?: string; message_type?: Message['message_type']; document_name?: string }) => {
    if (!selectedId || sending) return;
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selectedId, ...payload }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const data = await response.json() as { message: Message };
      setMessages((current) => current.some((message) => message.id === data.message.id)
        ? current
        : [...current, data.message]);
      setMessageText('');
      await loadConversations();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = messageText.trim();
    if (content) await sendMessage({ content, message_type: 'text' });
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !selectedId) return;
    if (file.size > 50 * 1024 * 1024) {
      setError('Choose a file smaller than 50 MB.');
      return;
    }
    const messageType: Message['message_type'] = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
          ? 'audio'
          : 'document';
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));
      const upload = await uploadResponse.json() as { url: string; filename: string };
      await sendMessage({
        media_url: upload.url,
        message_type: messageType,
        document_name: messageType === 'document' ? upload.filename : undefined,
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload this file.');
    } finally {
      setUploading(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.contact.full_name} ${conversation.contact.username}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="mx-auto flex h-[calc(100vh-4rem)] min-h-[32rem] max-w-7xl overflow-hidden bg-white dark:bg-zinc-950 sm:m-4 sm:h-[calc(100vh-6rem)] sm:rounded-2xl sm:border sm:border-slate-200 sm:dark:border-zinc-800">
      <aside className={`w-full shrink-0 flex-col border-r border-slate-200 dark:border-zinc-800 sm:flex sm:w-80 ${selectedConversation ? 'hidden' : 'flex'}`}>
        <div className="border-b border-slate-200 p-4 dark:border-zinc-800">
          <h1 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><LoaderCircle size={17} className="animate-spin" />Loading conversations</div>
          ) : filteredConversations.length ? filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition dark:border-zinc-900 ${conversation.id === selectedId ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-zinc-900'}`}
            >
              {conversation.contact.avatar_url
                ? <img src={conversation.contact.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{initials(conversation.contact.full_name)}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{conversation.contact.full_name}</span>
                <span className="mt-1 block truncate text-xs text-slate-500 dark:text-zinc-400">
                  {conversation.last_message?.content || (conversation.last_message?.message_type !== 'text' ? 'Attachment' : 'Start a conversation')}
                </span>
              </span>
              {conversation.last_message && <time className="self-start pt-1 text-[10px] text-slate-400">{formatTime(conversation.last_message.created_at)}</time>}
            </button>
          )) : (
            <div className="px-6 py-12 text-center">
              <MessageCircle size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">No conversations yet</p>
              <p className="mt-1 text-xs text-slate-500">Open a student profile and tap Message to start chatting.</p>
            </div>
          )}
        </div>
      </aside>

      {selectedConversation ? (
        <div className={`min-w-0 flex-1 flex-col ${selectedConversation ? 'flex' : 'hidden'}`}>
          <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
            <button type="button" onClick={() => setSelectedId('')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 sm:hidden" aria-label="Back to conversations"><ArrowLeft size={19} /></button>
            {selectedConversation.contact.avatar_url
              ? <img src={selectedConversation.contact.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{initials(selectedConversation.contact.full_name)}</span>}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{selectedConversation.contact.full_name}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">@{selectedConversation.contact.username}</p>
            </div>
          </header>

          {error && <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 dark:bg-zinc-950">
            {loadingMessages ? (
              <div className="flex justify-center py-8 text-sm text-slate-500"><LoaderCircle size={17} className="animate-spin" /></div>
            ) : visibleMessages.length ? visibleMessages.map((message) => {
              const isMine = message.sender_id === currentUserId;
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <article className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[70%] ${isMine ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'}`}>
                    {message.message_type === 'image' && message.media_url && <a href={message.media_url} target="_blank" rel="noreferrer"><img src={message.media_url} alt="Shared image" className="mb-2 max-h-72 rounded-lg object-contain" /></a>}
                    {message.message_type === 'video' && message.media_url && <video src={message.media_url} controls className="mb-2 max-h-72 rounded-lg" />}
                    {message.message_type === 'audio' && message.media_url && <audio src={message.media_url} controls className="mb-2 max-w-full" />}
                    {message.message_type === 'document' && message.media_url && (
                      <a href={message.media_url} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 underline">
                        <FileText size={17} />{message.document_name || 'Open document'}
                      </a>
                    )}
                    {message.content && <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>}
                    <time className={`mt-1 block text-right text-[10px] ${isMine ? 'text-indigo-100' : 'text-slate-400'}`}>{formatTime(message.created_at)}</time>
                  </article>
                </div>
              );
            }) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <MessageCircle size={32} />
                <p className="mt-3 text-sm">Send a message to start this chat.</p>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <label className="cursor-pointer rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-zinc-800" title="Attach photo, video, audio, or document">
              {uploading ? <LoaderCircle size={19} className="animate-spin" /> : <Paperclip size={19} />}
              <input
                type="file"
                className="sr-only"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                disabled={uploading || !selectedConversation}
                onChange={(event) => {
                  void handleFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            <label className="hidden cursor-pointer rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 sm:block" title="Attach photo or video">
              <ImagePlus size={19} />
              <input type="file" className="sr-only" accept="image/*,video/*" disabled={uploading} onChange={(event) => { void handleFile(event.target.files?.[0]); event.target.value = ''; }} />
            </label>
            <label className="hidden cursor-pointer rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 lg:block" title="Attach video">
              <Video size={19} />
              <input type="file" className="sr-only" accept="video/*" disabled={uploading} onChange={(event) => { void handleFile(event.target.files?.[0]); event.target.value = ''; }} />
            </label>
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              maxLength={5000}
              placeholder="Write a message…"
              aria-label="Write a message"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <button type="submit" disabled={!messageText.trim() || sending || uploading} aria-label="Send message" className="rounded-xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center text-center text-slate-400 sm:flex">
          <MessageCircle size={44} />
          <h2 className="mt-4 text-base font-semibold text-slate-700 dark:text-zinc-200">Your messages</h2>
          <p className="mt-1 text-sm">Choose a conversation or open a student profile to start a new chat.</p>
        </div>
      )}
    </section>
  );
}
