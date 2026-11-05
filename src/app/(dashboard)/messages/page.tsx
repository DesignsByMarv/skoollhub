'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, FileText, ImagePlus, LoaderCircle, MessageCircle, Paperclip, 
  Plus, Search, Send, UserRoundPlus, Video, X, UserPlus, FileUp, Mail,
  Phone, Radio, Users, Archive, Settings, Lock, Check, Pin, PinOff,
  Camera, Type, Image as ImageIcon, Sparkles, Users2, ArchiveX, Palette,
  Monitor, Shield, Bell, HelpCircle, SlidersHorizontal, ChevronDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import VoiceCallButton from '@/components/messages/VoiceCallButton';
import { MessageStatus, UserAvatar } from '@/components/messages/MessageStatus';
import { VoiceRecorder } from '@/components/messages/VoiceRecorder';

type Contact = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  department?: string | null;
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
  is_sent?: boolean;
  is_read?: boolean;
};

type Conversation = {
  id: string;
  contact: Contact;
  last_message: Message | null;
  unread_count: number;
  is_archived?: boolean;
  is_pinned?: boolean;
};

type CallLog = {
  id: string;
  contact: Contact;
  type: 'voice' | 'video';
  timestamp: string;
  duration?: string;
  incoming: boolean;
};

type StatusItem = {
  id: string;
  contact: Contact;
  timestamp: string;
  hasUnviewed: boolean;
  media_url?: string;
  text?: string;
};

type ActiveView = 'chats' | 'calls' | 'status' | 'communities' | 'archived' | 'settings';
type SettingsTab = 'general' | 'privacy' | 'chats' | 'notifications' | 'help';
type ThemeColor = 'indigo' | 'emerald' | 'violet' | 'rose' | 'amber' | 'coral' | 'cyan' | 'gold' | 'neon';
type ChatBackground = 'zinc-950' | 'slate-900' | 'stone-950' | 'midnight-blue' | 'emerald-forest' | 'deep-purple' | 'sakura-dark' | 'slate-50';

async function responseError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error || 'Something went wrong. Please try again.';
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950 text-slate-900 dark:text-white"><LoaderCircle className="animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const requestedUserId = searchParams.get('user');
  
  const [activeView, setActiveView] = useState<ActiveView>('chats');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Customization Settings
  const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');
  const [chatBg, setChatBg] = useState<ChatBackground>('zinc-950');
  const [startAtLogin, setStartAtLogin] = useState(false);
  const [minimiseToTray, setMinimiseToTray] = useState(true);
  const [fontSize, setFontSize] = useState('14px');

  // Modals & Popovers
  const [showNewChat, setShowNewChat] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedCallLog, setSelectedCallLog] = useState<CallLog | null>(null);
  const [selectedStatusView, setSelectedStatusView] = useState<StatusItem | null>(null);
  const [showTextStatusModal, setShowTextStatusModal] = useState(false);
  const [statusText, setStatusText] = useState('');

  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<Contact[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [creatingChatFor, setCreatingChatFor] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('User');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  // Dynamic Empty States
  const [callLogs] = useState<CallLog[]>([]);
  const [recentStatuses] = useState<StatusItem[]>([]);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const statusPhotoInputRef = useRef<HTMLInputElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const createdForUserRef = useRef('');
  const typingTimeoutRef = useRef<number | null>(null);
  const typingChannelRef = useRef<any>(null);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const visibleMessages = messages.filter((message) => message.chat_id === selectedId);

  // Expanded Theme color mapping classes
  const themeClasses = {
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', hover: 'hover:bg-indigo-700', lightBg: 'bg-indigo-50 dark:bg-indigo-950/40', ring: 'ring-indigo-600' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', hover: 'hover:bg-emerald-700', lightBg: 'bg-emerald-50 dark:bg-emerald-950/40', ring: 'ring-emerald-600' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-600', hover: 'hover:bg-violet-700', lightBg: 'bg-violet-50 dark:bg-violet-950/40', ring: 'ring-violet-600' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-600', hover: 'hover:bg-rose-700', lightBg: 'bg-rose-50 dark:bg-rose-950/40', ring: 'ring-rose-600' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', hover: 'hover:bg-amber-700', lightBg: 'bg-amber-50 dark:bg-amber-950/40', ring: 'ring-amber-600' },
    coral: { bg: 'bg-gradient-to-r from-rose-500 to-orange-500', text: 'text-orange-500', hover: 'hover:opacity-90', lightBg: 'bg-orange-50 dark:bg-orange-950/40', ring: 'ring-orange-500' },
    cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', hover: 'hover:bg-cyan-700', lightBg: 'bg-cyan-50 dark:bg-cyan-950/40', ring: 'ring-cyan-600' },
    gold: { bg: 'bg-amber-500', text: 'text-amber-500', hover: 'hover:bg-amber-600', lightBg: 'bg-amber-50 dark:bg-amber-950/40', ring: 'ring-amber-500' },
    neon: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-500', hover: 'hover:bg-fuchsia-700', lightBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', ring: 'ring-fuchsia-500' },
  }[themeColor];

  // Expanded Background Wallpapers
  const bgClasses = {
    'zinc-950': 'bg-zinc-950 text-zinc-100',
    'slate-900': 'bg-slate-900 text-slate-100',
    'stone-950': 'bg-stone-950 text-stone-100',
    'midnight-blue': 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-slate-100',
    'emerald-forest': 'bg-gradient-to-br from-zinc-950 via-emerald-950 to-teal-950 text-emerald-50',
    'deep-purple': 'bg-gradient-to-br from-slate-950 via-purple-950 to-zinc-900 text-purple-50',
    'sakura-dark': 'bg-gradient-to-br from-zinc-950 via-rose-950/50 to-zinc-900 text-rose-50',
    'slate-50': 'bg-slate-50 text-slate-900',
  }[chatBg];

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        void Notification.requestPermission();
      }
    }
  }, []);

  // Presence & network connectivity
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: currentUserId } },
    });

    const updatePresence = async () => {
      if (navigator.onLine) {
        await presenceChannel.track({ online_at: new Date().toISOString() });
      } else {
        await presenceChannel.untrack();
      }
    };

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updatePresence();
        }
      });

    const handleOnline = () => { void updatePresence(); };
    const handleOffline = () => { void presenceChannel.untrack(); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      void supabase.removeChannel(presenceChannel);
    };
  }, [currentUserId]);

  // Typing Broadcast setup
  useEffect(() => {
    if (!selectedId || !currentUserId) return;
    const supabase = createClient();

    setIsRecipientTyping(false);
    const channel = supabase.channel(`chat-typing:${selectedId}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'typing' }, (payload: { payload: { userId: string; isTyping: boolean } }) => {
        if (payload.payload.userId !== currentUserId) {
          setIsRecipientTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    typingChannelRef.current = channel;

    return () => {
      setIsRecipientTyping(false);
      void supabase.removeChannel(channel);
    };
  }, [selectedId, currentUserId]);

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (!typingChannelRef.current || !currentUserId) return;

    void typingChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, isTyping: true },
    });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      if (typingChannelRef.current && currentUserId) {
        void typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUserId, isTyping: false },
        });
      }
    }, 1500);
  };

  const loadConversations = useCallback(async () => {
    const response = await fetch('/api/messages/conversations', { cache: 'no-store' });
    if (!response.ok) throw new Error(await responseError(response));
    const data = (await response.json()) as { conversations: Conversation[] };
    setConversations(data.conversations);
    return data.conversations;
  }, []);

  const markConversationRead = useCallback(async (chatId: string) => {
    const response = await fetch('/api/messages/conversations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    });
    if (!response.ok) throw new Error(await responseError(response));

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === chatId ? { ...conversation, unread_count: 0 } : conversation
      )
    );

    setMessages((current) =>
      current.map((msg) => (msg.chat_id === chatId ? { ...msg, is_read: true } : msg))
    );
  }, []);

  const openConversation = (chatId: string) => {
    setSelectedId(chatId);
    void markConversationRead(chatId).catch((readError) => {
      setError(readError instanceof Error ? readError.message : 'Could not mark conversation as read.');
    });
  };

  // Pin / Unpin Chat (max 4 pinned)
  const togglePinChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((current) => {
      const target = current.find((c) => c.id === chatId);
      if (!target) return current;

      const currentlyPinnedCount = current.filter((c) => c.is_pinned).length;
      if (!target.is_pinned && currentlyPinnedCount >= 4) {
        alert('You can only pin up to 4 chats.');
        return current;
      }

      return current.map((c) => c.id === chatId ? { ...c, is_pinned: !c.is_pinned } : c);
    });
  };

  // Archive / Unarchive Chat
  const toggleArchiveChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((current) =>
      current.map((c) => c.id === chatId ? { ...c, is_archived: !c.is_archived, is_pinned: false } : c)
    );
    if (selectedId === chatId) {
      setSelectedId('');
    }
  };

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
        const data = (await response.json()) as { conversations: Conversation[] };
        if (!active) return;
        setCurrentUserId(user?.id ?? '');
        if (user?.email) {
          const namePart = user.email.split('@')[0];
          setCurrentUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
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
          const created = (await createResponse.json()) as { conversation: { id: string } };
          if (active) {
            await loadConversations();
            setSelectedId(created.conversation.id);
          }
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
    async function loadMessages() {
      try {
        const response = await fetch(`/api/messages?chat_id=${encodeURIComponent(selectedId)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(await responseError(response));
        const data = (await response.json()) as { messages: Message[] };
        if (active) {
          setMessages(data.messages);
          await markConversationRead(selectedId);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load message history.');
      }
    }
    void loadMessages();
    return () => {
      active = false;
    };
  }, [markConversationRead, selectedId]);

  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    const channel = supabase
      .channel('global-messages-feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const incoming = payload.new as Message;
          if (incoming.sender_id === currentUserId) return;

          const isCurrentChat = incoming.chat_id === selectedId;

          if (isCurrentChat) {
            setMessages((current) => current.some((msg) => msg.id === incoming.id) ? current : [...current, incoming]);
            void markConversationRead(incoming.chat_id);
          } else {
            setConversations((current) =>
              current.map((conv) => {
                if (conv.id === incoming.chat_id) {
                  return {
                    ...conv,
                    unread_count: (conv.unread_count || 0) + 1,
                    last_message: incoming,
                  };
                }
                return conv;
              })
            );
          }

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const senderName = conversations.find((c) => c.id === incoming.chat_id)?.contact.full_name || 'New Message';
            new Notification(senderName, {
              body: incoming.content || (incoming.message_type === 'audio' ? '🎙 Voice note' : 'Sent an attachment'),
              icon: '/favicon.ico',
            });
          }

          void loadConversations().catch(() => {});
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Message;
          setMessages((current) =>
            current.map((msg) => (msg.id === updated.id ? { ...msg, ...updated } : msg))
          );
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedId, conversations, markConversationRead, loadConversations]);

  useEffect(() => {
    if (!showNewChat && !showAddContact) return;
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const query = studentSearch.trim();
        const endpoint = query
          ? `/api/social?search=${encodeURIComponent(query)}`
          : '/api/social';
        const response = await fetch(endpoint, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(await responseError(response));
        const data = (await response.json()) as { suggestions: Contact[] };
        if (active) setStudents(data.suggestions);
      } catch (searchError) {
        if (active && !(searchError instanceof DOMException && searchError.name === 'AbortError')) {
          setError(searchError instanceof Error ? searchError.message : 'Could not find students.');
        }
      } finally {
        if (active) setSearchingStudents(false);
      }
    }, studentSearch.trim() ? 250 : 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [showNewChat, showAddContact, studentSearch]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedId]);

  const handleInviteFriend = () => {
    const inviteLink = `${window.location.origin}/register?ref=${currentUserId || 'skoollhub'}`;
    void navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 3000);
  };

  const handleInitiateCall = (contact: Contact, type: 'voice' | 'video') => {
    setSelectedCallLog(null);
    const existing = conversations.find((c) => c.contact.id === contact.id);
    if (existing) {
      setSelectedId(existing.id);
      setActiveView('chats');
    }
  };

  const sendMessage = async (payload: { content?: string; media_url?: string; message_type?: Message['message_type']; document_name?: string }) => {
    if (!selectedId || sending) return;
    setSending(true);
    setError('');
    try {
      if (typingChannelRef.current && currentUserId) {
        void typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUserId, isTyping: false },
        });
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selectedId, ...payload }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const data = (await response.json()) as { message: Message };
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

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!selectedId || uploading) return;
    setUploading(true);
    setError('');
    try {
      const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
      const file = new File([audioBlob], `voice-note-${Date.now()}.${ext}`, { type: audioBlob.type });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');

      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));

      const upload = (await uploadResponse.json()) as { url: string };

      await sendMessage({
        media_url: upload.url,
        message_type: 'audio',
        content: '🎙 Voice note',
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload voice note.');
    } finally {
      setUploading(false);
    }
  };

  const startConversation = async (student: Contact) => {
    if (creatingChatFor) return;
    setCreatingChatFor(student.id);
    setError('');
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_ids: [student.id] }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const data = (await response.json()) as { conversation: { id: string } };
      await loadConversations();
      setSelectedId(data.conversation.id);
      setShowNewChat(false);
      setShowAddContact(false);
      setStudentSearch('');
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : 'Could not start this conversation.');
    } finally {
      setCreatingChatFor('');
    }
  };

  const handleFile = async (file: File | undefined, forceDocument = false) => {
    if (!file || !selectedId) return;
    if (file.size > 50 * 1024 * 1024) {
      setError('Choose a file smaller than 50 MB.');
      return;
    }

    const messageType: Message['message_type'] = forceDocument 
      ? 'document'
      : file.type.startsWith('image/')
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
      const upload = (await uploadResponse.json()) as { url: string; filename: string };
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

  // Filter conversations & sort pinned chats to top (max 4)
  const filteredConversations = conversations
    .filter((conversation) => 
      activeView === 'archived' ? conversation.is_archived : !conversation.is_archived
    )
    .filter((conversation) =>
      `${conversation.contact.full_name} ${conversation.contact.username}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter((conversation) => (filter === 'unread' ? conversation.unread_count > 0 : true))
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });

  const totalUnread = conversations.filter(c => !c.is_archived).reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <>
      <input
        ref={documentInputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        onChange={(event) => {
          void handleFile(event.target.files?.[0], true);
          event.target.value = '';
        }}
      />

      <input
        ref={statusPhotoInputRef}
        type="file"
        className="sr-only"
        accept="image/*,video/*"
        onChange={() => { setShowStatusMenu(false); }}
      />

      <section className="mx-auto flex h-[calc(100vh-4rem)] min-h-[32rem] max-w-7xl overflow-hidden bg-white dark:bg-zinc-950 sm:m-4 sm:h-[calc(100vh-6rem)] sm:rounded-2xl sm:border sm:border-slate-200 sm:dark:border-zinc-800">
        
        {/* 1. Icon-Only Left Sidebar Navigation */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-slate-50 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              title="Chats"
              onClick={() => { setActiveView('chats'); setSelectedId(''); }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeView === 'chats'
                  ? `${themeClasses.lightBg} ${themeClasses.text}`
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <MessageCircle size={22} />
              {totalUnread > 0 && (
                <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full ${themeClasses.bg} px-1 text-[9px] font-bold text-white`}>
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>

            <button
              type="button"
              title="Call Logs"
              onClick={() => { setActiveView('calls'); setSelectedId(''); }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeView === 'calls'
                  ? `${themeClasses.lightBg} ${themeClasses.text}`
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Phone size={20} />
            </button>

            <button
              type="button"
              title="Status Updates"
              onClick={() => { setActiveView('status'); setSelectedId(''); }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeView === 'status'
                  ? `${themeClasses.lightBg} ${themeClasses.text}`
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Radio size={20} />
            </button>

            <button
              type="button"
              title="Campus Communities"
              onClick={() => { setActiveView('communities'); setSelectedId(''); }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeView === 'communities'
                  ? `${themeClasses.lightBg} ${themeClasses.text}`
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Users size={20} />
            </button>

            <button
              type="button"
              title="Archived Chats"
              onClick={() => { setActiveView('archived'); setSelectedId(''); }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeView === 'archived'
                  ? `${themeClasses.lightBg} ${themeClasses.text}`
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Archive size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              title="Settings"
              onClick={() => { setActiveView('settings'); setSelectedId(''); }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeView === 'settings'
                  ? `${themeClasses.lightBg} ${themeClasses.text}`
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Settings size={20} />
            </button>

            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${themeClasses.bg} text-xs font-semibold text-white`}>
              {currentUserName.charAt(0)}
            </div>
          </div>
        </div>

        {/* 2. Secondary List Panel */}
        <aside className={`w-full shrink-0 flex-col border-r border-slate-200 dark:border-zinc-800 sm:flex sm:w-80 ${selectedConversation ? 'hidden' : 'flex'}`}>
          <div className="p-3 space-y-3 border-b border-slate-100 dark:border-zinc-900">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {activeView === 'chats' ? 'Chats' : activeView === 'calls' ? 'Calls' : activeView === 'status' ? 'Status' : activeView === 'communities' ? 'Communities' : activeView === 'archived' ? 'Archived' : 'Settings'}
              </h1>
              {activeView === 'chats' && (
                <button
                  type="button"
                  onClick={() => { setError(''); setShowNewChat(true); }}
                  title="New chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>

            {/* Search Field */}
            {activeView !== 'status' && activeView !== 'settings' && (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            )}

            {/* Filter Pills for Chats */}
            {activeView === 'chats' && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`rounded-full px-3 py-1 font-medium transition ${filter === 'all' ? `${themeClasses.lightBg} ${themeClasses.text}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`rounded-full px-3 py-1 font-medium transition ${filter === 'unread' ? `${themeClasses.lightBg} ${themeClasses.text}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'}`}
                >
                  Unread {totalUnread > 0 ? totalUnread : ''}
                </button>
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto">
            {activeView === 'calls' ? (
              callLogs.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 dark:text-zinc-500">
                  <Phone size={28} className="mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                  <p className="font-medium text-slate-600 dark:text-zinc-400">No call logs yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Your incoming and outgoing calls will show here.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {callLogs.map((log) => (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => setSelectedCallLog(log)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-zinc-900"
                    >
                      <UserAvatar name={log.contact.full_name} src={log.contact.avatar_url || undefined} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{log.contact.full_name}</p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {log.type === 'video' ? <Video size={13} className={themeClasses.text} /> : <Phone size={13} className="text-emerald-500" />}
                          <span>{log.timestamp}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : activeView === 'status' ? (
              <div className="p-2 space-y-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStatusMenu((prev) => !prev)}
                    className="flex w-full items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition text-left"
                  >
                    <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${themeClasses.bg} text-white font-bold`}>
                      S
                      <span className={`absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full ${themeClasses.bg} border-2 border-white dark:border-zinc-950 text-[10px] font-extrabold`}>+</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">My status</p>
                      <p className={`text-xs ${themeClasses.text}`}>Click to add status update</p>
                    </div>
                  </button>

                  {showStatusMenu && (
                    <div className="absolute left-12 top-14 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={() => statusPhotoInputRef.current?.click()}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <ImageIcon size={16} className={themeClasses.text} />
                        Photos & videos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowStatusMenu(false);
                          setShowTextStatusModal(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <Type size={16} className="text-emerald-500" />
                        Text
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-zinc-500">Recent</p>
                  {recentStatuses.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-slate-400 dark:text-zinc-500">No recent updates</p>
                  ) : (
                    <div className="space-y-0.5">
                      {recentStatuses.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStatusView(st)}
                          className="flex w-full items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition text-left"
                        >
                          <div className="relative p-0.5 rounded-full ring-2 ring-emerald-500">
                            <UserAvatar name={st.contact.full_name} src={st.contact.avatar_url || undefined} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{st.contact.full_name}</p>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{st.timestamp}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : activeView === 'settings' ? (
              <div className="p-2 space-y-1">
                {[
                  { id: 'general', name: 'General', desc: 'Startup and close', icon: Monitor },
                  { id: 'privacy', name: 'Privacy', desc: 'Blocked contacts, disappearing messages', icon: Lock },
                  { id: 'chats', name: 'Chats', desc: 'Theme, wallpaper, chat settings', icon: MessageCircle },
                  { id: 'notifications', name: 'Notifications', desc: 'Messages, groups, sounds', icon: Bell },
                  { id: 'help', name: 'Help and feedback', desc: 'Help centre, contact us, privacy policy', icon: HelpCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = settingsTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSettingsTab(item.id as SettingsTab)}
                      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${isActive ? themeClasses.lightBg : 'hover:bg-slate-50 dark:hover:bg-zinc-900'}`}
                    >
                      <Icon size={18} className={`mt-0.5 shrink-0 ${isActive ? themeClasses.text : 'text-slate-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold ${isActive ? themeClasses.text : 'text-slate-900 dark:text-white'}`}>{item.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : activeView === 'communities' ? (
              <div className="p-6 text-center text-slate-400 dark:text-zinc-500">
                <Users2 size={32} className="mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">No communities joined</p>
              </div>
            ) : (
              loadingConversations ? (
                <div className="flex justify-center py-10 text-slate-500"><LoaderCircle size={18} className="animate-spin" /></div>
              ) : filteredConversations.length ? filteredConversations.map((conversation) => {
                const isOnline = onlineUsers.has(conversation.contact.id);
                const isSelected = conversation.id === selectedId;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => openConversation(conversation.id)}
                    className={`group relative flex w-full items-center gap-3 px-4 py-3 text-left transition border-b border-slate-100 dark:border-zinc-900 cursor-pointer ${isSelected ? themeClasses.lightBg : 'hover:bg-slate-50 dark:hover:bg-zinc-900'}`}
                  >
                    <UserAvatar
                      src={conversation.contact.avatar_url || undefined}
                      name={conversation.contact.full_name}
                      isOnline={isOnline}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {conversation.is_pinned && <Pin size={12} className={themeClasses.text} />}
                          {conversation.contact.full_name}
                        </span>
                        {conversation.last_message && (
                          <span className="text-[11px] text-slate-400">{formatTime(conversation.last_message.created_at)}</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span className="truncate text-xs text-slate-500 dark:text-zinc-400">
                          {conversation.last_message?.content || (conversation.last_message?.message_type !== 'text' ? 'Attachment' : 'Start a conversation')}
                        </span>
                        {conversation.unread_count > 0 && (
                          <span className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full ${themeClasses.bg} px-1 text-[10px] font-bold text-white`}>
                            {conversation.unread_count > 999 ? '999+' : conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Hover Action Buttons */}
                    <div className="absolute right-3 top-3 hidden items-center gap-1 group-hover:flex bg-white/90 dark:bg-zinc-900/90 px-1 py-0.5 rounded-lg shadow-sm">
                      <button
                        type="button"
                        title={conversation.is_pinned ? 'Unpin chat' : 'Pin chat (max 4)'}
                        onClick={(e) => togglePinChat(conversation.id, e)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        {conversation.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      <button
                        type="button"
                        title={conversation.is_archived ? 'Unarchive chat' : 'Archive chat'}
                        onClick={(e) => toggleArchiveChat(conversation.id, e)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-12 text-center text-xs text-slate-500">No items found.</div>
              )
            )}
          </div>
        </aside>

        {/* 3. Main Display Area */}
        {selectedConversation ? (
          <div className={`min-w-0 flex-1 flex flex-col ${bgClasses}`}>
            <header className="flex items-center gap-3 border-b border-slate-200/20 bg-white/10 backdrop-blur-md px-4 py-3 dark:border-zinc-800/40 dark:bg-zinc-900/40">
              <button type="button" onClick={() => setSelectedId('')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 sm:hidden" aria-label="Back"><ArrowLeft size={19} /></button>
              <UserAvatar src={selectedConversation.contact.avatar_url || undefined} name={selectedConversation.contact.full_name} isOnline={onlineUsers.has(selectedConversation.contact.id)} />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{selectedConversation.contact.full_name}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {isRecipientTyping ? (
                    <span className={`font-semibold ${themeClasses.text} animate-pulse`}>typing...</span>
                  ) : onlineUsers.has(selectedConversation.contact.id) ? (
                    <span className="font-semibold text-emerald-600">online</span>
                  ) : (
                    `@${selectedConversation.contact.username}`
                  )}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <VoiceCallButton
                  chatId={selectedConversation.id}
                  currentUserId={currentUserId}
                  recipientId={selectedConversation.contact.id}
                  recipientName={selectedConversation.contact.full_name}
                />
              </div>
            </header>

            {error && <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

            <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ fontSize }}>
              {visibleMessages.length ? visibleMessages.map((message) => {
                const isMine = message.sender_id === currentUserId;
                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <article className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[70%] ${isMine ? `rounded-br-md ${themeClasses.bg} text-white shadow-md` : 'rounded-bl-md border border-slate-200/30 bg-white/80 backdrop-blur-sm text-slate-800 dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:text-zinc-100'}`}>
                      {message.message_type === 'image' && message.media_url && <a href={message.media_url} target="_blank" rel="noreferrer"><img src={message.media_url} alt="Shared image" className="mb-2 max-h-72 rounded-lg object-contain" /></a>}
                      {message.message_type === 'video' && message.media_url && <video src={message.media_url} controls className="mb-2 max-h-72 rounded-lg" />}
                      {message.message_type === 'audio' && message.media_url && <audio src={message.media_url} controls className="mb-2 max-w-full" />}
                      {message.message_type === 'document' && message.media_url && (
                        <a href={message.media_url} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 underline">
                          <FileText size={17} />{message.document_name || 'Open document'}
                        </a>
                      )}
                      {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px]">
                        <span className={isMine ? 'text-white/80' : 'text-slate-400'}>{formatTime(message.created_at)}</span>
                        {isMine && <MessageStatus isSent={message.is_sent ?? true} isRead={message.is_read ?? false} />}
                      </div>
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

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200/20 bg-white/80 backdrop-blur-md p-3 dark:border-zinc-800/40 dark:bg-zinc-900/80">
              <VoiceRecorder onSendAudio={handleSendAudio} />

              <label className={`cursor-pointer rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:${themeClasses.text} dark:hover:bg-zinc-800`} title="Attach file">
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

              <input
                value={messageText}
                onChange={handleTypingChange}
                maxLength={5000}
                placeholder="Write a message…"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />

              <button type="submit" disabled={!messageText.trim() || sending || uploading} className={`rounded-xl ${themeClasses.bg} p-3 text-white transition shadow-md ${themeClasses.hover} disabled:opacity-50`}>
                {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        ) : activeView === 'archived' ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50/70 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${themeClasses.lightBg} ${themeClasses.text} mb-6 shadow-sm`}>
              <ArchiveX size={40} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Archive chats</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 max-w-md leading-relaxed">
              Keep your primary chat view organized by moving inactive conversations to archive.
            </p>

            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className={`mt-6 inline-flex items-center gap-2 rounded-xl ${themeClasses.bg} px-5 py-3 text-sm font-semibold text-white shadow-sm ${themeClasses.hover} transition`}
            >
              <Plus size={18} /> Add chat to archive
            </button>

            <p className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 mt-16">
              <Lock size={13} /> Archived chats remain end-to-end encrypted
            </p>
          </div>
        ) : activeView === 'status' ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50/70 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${themeClasses.lightBg} ${themeClasses.text} mb-6 shadow-sm`}>
              <Sparkles size={38} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Share statuses</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 max-w-md leading-relaxed">
              Share photos, videos and text that disappear after 24 hours.
            </p>

            <p className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 mt-16">
              <Lock size={13} /> Your personal status updates are end-to-end encrypted
            </p>
          </div>
        ) : activeView === 'settings' ? (
          <div className="flex flex-1 flex-col p-8 bg-slate-50/70 dark:bg-zinc-950 overflow-y-auto">
            <div className="max-w-xl space-y-6">
              {settingsTab === 'general' ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Monitor className={themeClasses.text} /> General Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Configure startup preferences and display layout.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Startup and close</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Start SkoollHub at login</p>
                          <p className="text-xs text-slate-500">Automatically open SkoollHub when you turn on your computer</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStartAtLogin(!startAtLogin)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${startAtLogin ? themeClasses.bg : 'bg-slate-200 dark:bg-zinc-700'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${startAtLogin ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Minimise to system tray</p>
                          <p className="text-xs text-slate-500">Keep SkoollHub running after closing the application window</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMinimiseToTray(!minimiseToTray)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${minimiseToTray ? themeClasses.bg : 'bg-slate-200 dark:bg-zinc-700'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${minimiseToTray ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <hr className="border-slate-100 dark:border-zinc-800" />

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Font size</h3>
                      <div className="relative">
                        <select 
                          value={fontSize} 
                          onChange={(e) => setFontSize(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white appearance-none cursor-pointer"
                        >
                          <option value="12px">70% (Small)</option>
                          <option value="14px">80% (Normal)</option>
                          <option value="16px">90% (Large)</option>
                          <option value="18px">100% (Extra Large)</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-slate-400">Use Ctrl + / - to increase or decrease text size</p>
                    </div>
                  </div>
                </>
              ) : settingsTab === 'chats' ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette className={themeClasses.text} /> Chat Settings & Customization
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Personalize your chat accent theme and background wallpaper.
                    </p>
                  </div>

                  {/* Expanded Theme Color Palette */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Theme Color Palette</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {[
                        { id: 'indigo', name: 'Indigo', color: 'bg-indigo-600' },
                        { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600' },
                        { id: 'violet', name: 'Violet', color: 'bg-violet-600' },
                        { id: 'rose', name: 'Rose', color: 'bg-rose-600' },
                        { id: 'amber', name: 'Amber', color: 'bg-amber-600' },
                        { id: 'coral', name: 'Sunset Coral', color: 'bg-gradient-to-r from-rose-500 to-orange-500' },
                        { id: 'cyan', name: 'Ocean Cyan', color: 'bg-cyan-600' },
                        { id: 'gold', name: 'Royal Gold', color: 'bg-amber-500' },
                        { id: 'neon', name: 'Cyber Neon', color: 'bg-fuchsia-600' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setThemeColor(item.id as ThemeColor)}
                          className={`flex flex-col items-center gap-2 rounded-xl p-3 border transition ${themeColor === item.id ? 'border-slate-900 dark:border-white shadow-md' : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                        >
                          <span className={`h-8 w-8 rounded-full ${item.color}`} />
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Chat Background Wallpaper */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chat Background Wallpaper</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'zinc-950', name: 'Midnight Dark', sample: 'bg-zinc-950 border-zinc-800' },
                        { id: 'slate-900', name: 'Slate Gray', sample: 'bg-slate-900 border-slate-700' },
                        { id: 'stone-950', name: 'Warm Charcoal', sample: 'bg-stone-950 border-stone-800' },
                        { id: 'midnight-blue', name: 'Deep Space', sample: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border-blue-900' },
                        { id: 'emerald-forest', name: 'Emerald Forest', sample: 'bg-gradient-to-br from-zinc-950 via-emerald-950 to-teal-950 border-emerald-900' },
                        { id: 'deep-purple', name: 'Aurora Purple', sample: 'bg-gradient-to-br from-slate-950 via-purple-950 to-zinc-900 border-purple-900' },
                        { id: 'sakura-dark', name: 'Sakura Night', sample: 'bg-gradient-to-br from-zinc-950 via-rose-950/50 to-zinc-900 border-rose-900' },
                        { id: 'slate-50', name: 'Clean Light', sample: 'bg-slate-50 border-slate-300 text-slate-900' },
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setChatBg(bg.id as ChatBackground)}
                          className={`flex flex-col items-center gap-2 rounded-xl p-3 border transition ${chatBg === bg.id ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                        >
                          <span className={`h-10 w-full rounded-lg ${bg.sample} border`} />
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-3">
                  <Settings size={36} className={`mx-auto ${themeClasses.text}`} />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{settingsTab} Settings</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Manage your {settingsTab} preferences and configuration parameters here.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 bg-slate-50/70 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400">
            {copiedInvite && (
              <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ✓ Registration link copied to clipboard!
              </div>
            )}

            <div className="flex items-center gap-8 mb-8">
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="flex flex-col items-center gap-2 group"
                title="Send document files only (.pdf, .doc, .xlsx, .pptx)"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-sm group-hover:${themeClasses.lightBg} group-hover:${themeClasses.text} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 transition`}>
                  <FileUp size={20} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Send document</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddContact(true)}
                className="flex flex-col items-center gap-2 group"
                title="Add contact from phone or nearby campus followers"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-sm group-hover:${themeClasses.lightBg} group-hover:${themeClasses.text} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 transition`}>
                  <UserPlus size={20} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Add contact</span>
              </button>

              <button
                type="button"
                onClick={handleInviteFriend}
                className="flex flex-col items-center gap-2 group"
                title="Copy shareable link for friends to register on SkoollHub"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-sm group-hover:${themeClasses.lightBg} group-hover:${themeClasses.text} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 transition`}>
                  {copiedInvite ? <Check size={20} className="text-emerald-500" /> : <Mail size={20} />}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  {copiedInvite ? 'Link Copied!' : 'Invite a friend'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 mt-12">
              <Lock size={13} /> Your personal messages are end-to-end encrypted
            </p>
          </div>
        )}
      </section>

      {/* CALL LOG MODAL */}
      {selectedCallLog && (
        <div role="presentation" onClick={() => setSelectedCallLog(null)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-center">
            <UserAvatar name={selectedCallLog.contact.full_name} src={selectedCallLog.contact.avatar_url || undefined} />
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{selectedCallLog.contact.full_name}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Select call option</p>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleInitiateCall(selectedCallLog.contact, 'voice')}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition">
                  <Phone size={20} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Voice Call</span>
              </button>

              <button
                type="button"
                onClick={() => handleInitiateCall(selectedCallLog.contact, 'video')}
                className="flex flex-col items-center gap-2"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${themeClasses.bg} text-white shadow-md ${themeClasses.hover} transition`}>
                  <Video size={20} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Video Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEXT STATUS MODAL */}
      {showTextStatusModal && (
        <div role="presentation" onClick={() => setShowTextStatusModal(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Compose Text Status</h3>
            <textarea
              rows={4}
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Type a status update..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTextStatusModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!statusText.trim()}
                onClick={() => {
                  setStatusText('');
                  setShowTextStatusModal(false);
                }}
                className={`rounded-xl ${themeClasses.bg} px-4 py-2 text-xs font-semibold text-white ${themeClasses.hover} disabled:opacity-50`}
              >
                Post Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STATUS OVERLAY */}
      {selectedStatusView && (
        <div role="presentation" onClick={() => setSelectedStatusView(null)} className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-zinc-950 p-4 text-white">
          <button type="button" onClick={() => setSelectedStatusView(null)} className="absolute top-4 right-4 rounded-full p-2 bg-zinc-800 hover:bg-zinc-700"><X size={20} /></button>
          <div className="flex items-center gap-3 mb-6">
            <UserAvatar name={selectedStatusView.contact.full_name} src={selectedStatusView.contact.avatar_url || undefined} />
            <div>
              <p className="font-bold text-sm">{selectedStatusView.contact.full_name}</p>
              <p className="text-xs text-zinc-400">{selectedStatusView.timestamp}</p>
            </div>
          </div>
          <p className="text-xl font-medium text-center max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
            "{selectedStatusView.text}"
          </p>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContact && (
        <div role="presentation" onClick={() => setShowAddContact(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[min(640px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Contact</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Import phone contacts or add nearby campus students.</p>
              </div>
              <button type="button" onClick={() => setShowAddContact(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </header>

            <label className="mx-4 mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-zinc-800">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                autoFocus
                type="search"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Search followers or nearby students"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>

            <div className="min-h-48 flex-1 overflow-y-auto p-2">
              {searchingStudents ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500"><LoaderCircle size={16} className="animate-spin" />Finding contacts</div>
              ) : students.length ? students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  disabled={Boolean(creatingChatFor)}
                  onClick={() => void startConversation(student)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-zinc-800"
                >
                  <UserAvatar src={student.avatar_url || undefined} name={student.full_name} isOnline={onlineUsers.has(student.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{student.full_name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-zinc-400">@{student.username}{student.department ? ` · ${student.department}` : ''}</span>
                  </span>
                  {creatingChatFor === student.id ? <LoaderCircle size={16} className={`animate-spin ${themeClasses.text}`} /> : <UserRoundPlus size={16} className="text-slate-400" />}
                </button>
              )) : (
                <div className="py-12 text-center text-xs text-slate-500">No campus contacts found.</div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* NEW MESSAGE MODAL */}
      {showNewChat && (
        <div role="presentation" onClick={() => setShowNewChat(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[min(640px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">New message</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Find a student to start a conversation.</p>
              </div>
              <button type="button" onClick={() => setShowNewChat(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </header>

            <label className="mx-4 mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-zinc-800">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                autoFocus
                type="search"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Search name or username"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>

            {error && <p role="alert" className="mx-4 mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

            <div className="min-h-48 flex-1 overflow-y-auto p-2">
              {searchingStudents ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500"><LoaderCircle size={16} className="animate-spin" />Finding students</div>
              ) : students.length ? students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  disabled={Boolean(creatingChatFor)}
                  onClick={() => void startConversation(student)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-zinc-800"
                >
                  <UserAvatar src={student.avatar_url || undefined} name={student.full_name} isOnline={onlineUsers.has(student.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{student.full_name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-zinc-400">@{student.username}{student.department ? ` · ${student.department}` : ''}</span>
                  </span>
                  {creatingChatFor === student.id ? <LoaderCircle size={16} className={`animate-spin ${themeClasses.text}`} /> : <UserRoundPlus size={16} className="text-slate-400" />}
                </button>
              )) : (
                <div className="py-12 text-center text-xs text-slate-500">No students found.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}