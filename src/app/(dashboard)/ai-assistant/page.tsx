'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Bot,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

type Mode = 'chat' | 'web' | 'social' | 'research';
type Source = { title: string; url: string };
type Message = {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: Source[];
};
type Conversation = { id: string; title: string; created_at: string };

const modes: { id: Mode; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'web', label: 'Web search', icon: Search },
  { id: 'social', label: 'Campus & social', icon: Sparkles },
  { id: 'research', label: 'Research', icon: BookOpen },
];

const welcomeMessage: Message = {
  id: 'welcome',
  sender: 'assistant',
  content: 'Hi! I’m SkoollHub AI, here to help with studying, campus life, and finding useful information. What can I help you with?',
  created_at: new Date().toISOString(),
};

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

async function readError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || 'Something went wrong. Please try again.';
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<Mode>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/ai?conversationId=${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json() as { conversation: Conversation; messages: Message[] };
      setConversationId(data.conversation.id);
      setMessages(data.messages.length ? data.messages : [welcomeMessage]);
      setIsHistoryOpen(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load this conversation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const response = await fetch('/api/ai');
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json() as { conversations: Conversation[] };
        if (!isMounted) return;
        setConversations(data.conversations);
        if (data.conversations.length) {
          await loadConversation(data.conversations[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Could not load your AI chats.');
        setIsLoading(false);
      }
    }
    void loadHistory();
    return () => {
      isMounted = false;
    };
  }, [loadConversation]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const startNewChat = () => {
    setConversationId(null);
    setMessages([welcomeMessage]);
    setError('');
    setIsHistoryOpen(false);
    setActiveMode('chat');
    inputRef.current?.focus();
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputQuery.trim();
    if (!query || isThinking) return;

    const temporaryMessage: Message = {
      id: `pending-${Date.now()}`,
      sender: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, temporaryMessage]);
    setInputQuery('');
    setError('');
    setIsThinking(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: activeMode, conversationId }),
      });
      if (!response.ok) throw new Error(await readError(response));

      const data = await response.json() as {
        reply: string;
        sources: Source[];
        conversation: Conversation;
      };
      const reply: Message = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        content: data.reply,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };
      setConversationId(data.conversation.id);
      setConversations((current) => [
        data.conversation,
        ...current.filter((item) => item.id !== data.conversation.id),
      ]);
      setMessages((current) => [...current, reply]);
    } catch (sendError) {
      setMessages((current) => current.filter((message) => message.id !== temporaryMessage.id));
      setInputQuery(query);
      setError(sendError instanceof Error ? sendError.message : 'Could not send your message.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      {isHistoryOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:z-auto lg:translate-x-0 ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={17} />
            </span>
            SkoollHub
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 lg:hidden"
            aria-label="Close chat history"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            New chat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Recent chats
          </p>
          {conversations.length ? (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  onClick={() => void loadConversation(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${conversation.id === conversationId ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
                >
                  <MessageSquare size={16} className="shrink-0 text-slate-400" />
                  <span className="truncate">{conversation.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-xs leading-5 text-slate-400">Your saved conversations will show here.</p>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft size={16} />
            Back to campus
          </button>
          <p className="px-3 pt-3 text-[11px] text-slate-400">AI responses can be inaccurate. Verify important details.</p>
        </div>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="Open chat history"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold sm:text-base">SkoollHub AI</h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Your study and campus companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Gemini AI
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-5 pt-6 sm:px-6">
          <section className="flex-1 space-y-5 overflow-y-auto pb-6" aria-live="polite">
            {isLoading ? (
              <div className="flex min-h-[45vh] items-center justify-center text-sm text-slate-500">
                <LoaderCircle size={18} className="mr-2 animate-spin" />
                Loading your conversations…
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.sender === 'user';
                return (
                  <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Bot size={17} />
                      </div>
                    )}
                    <div className={`max-w-[88%] sm:max-w-[78%] ${isUser ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-zinc-700">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Sources</p>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source) => (
                                <a
                                  key={source.url}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950"
                                >
                                  <span className="truncate">{source.title}</span>
                                  <ExternalLink size={12} className="shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className={`mt-1 text-[10px] text-slate-400 ${isUser ? 'text-right' : ''}`}>{formatTime(message.created_at)}</p>
                    </div>
                    {isUser && (
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                        <span className="sr-only">You</span>
                        <ChevronRight size={17} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isThinking && (
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white"><Bot size={17} /></span>
                <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <LoaderCircle size={15} className="animate-spin" />
                  Thinking…
                </span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </section>

          <div className="pt-3">
            {error && (
              <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
                {error.toLowerCase().includes('sign in') && (
                  <button type="button" onClick={() => router.push('/login')} className="ml-2 font-semibold underline">
                    Sign in
                  </button>
                )}
              </div>
            )}

            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {modes.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  aria-pressed={activeMode === id}
                  onClick={() => setActiveMode(id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${activeMode === id ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'}`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:ring-indigo-950">
              <textarea
                ref={inputRef}
                rows={2}
                maxLength={4000}
                value={inputQuery}
                onChange={(event) => setInputQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                disabled={isThinking || isLoading}
                aria-label="Message SkoollHub AI"
                placeholder={activeMode === 'web' ? 'Search the web for campus updates, study topics, and more…' : activeMode === 'social' ? 'Search public campus and social web discussions…' : activeMode === 'research' ? 'Ask a research question for a sourced synthesis…' : 'Ask about studying, campus life, or anything else…'}
                className="max-h-40 min-h-[52px] w-full resize-y bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-zinc-100"
              />
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line</span>
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isThinking || isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                  <Send size={14} />
                </button>
              </div>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              {activeMode === 'chat' ? 'AI responses may be inaccurate; verify important information.' : 'Search results come from public web sources and may be incomplete.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
