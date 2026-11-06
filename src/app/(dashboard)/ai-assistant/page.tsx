'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  User,
  Search,
  BookOpenCheck,
  CalendarDays,
  Copy,
  Check,
  RotateCcw,
  GraduationCap,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Sliders,
  Zap,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
  timestamp: string;
}

type AIMode = 'copilot' | 'pastquestions' | 'timetable' | 'research';

const promptPresets: Record<AIMode, { title: string; prompt: string }[]> = {
  copilot: [
    { title: 'Explain Backpropagation', prompt: 'Can you explain how backpropagation works in Neural Networks using a simple real-life analogy?' },
    { title: 'Nigerian Constitutional Law', prompt: 'Summarize the 3 core pillars of the 1999 Constitution of Nigeria for Law 201.' },
    { title: 'Accounting Balance Sheet', prompt: 'Explain the difference between Current Assets and Non-Current Assets with 4 examples each.' },
    { title: 'Draft Email to Lecturer', prompt: 'Draft a polite and professional email requesting an extension for an assignment submission due to illness.' },
  ],
  pastquestions: [
    { title: 'GST 101 Use of English Drill', prompt: 'Generate 5 multiple-choice questions on English concord and grammatical rules with answer explanations.' },
    { title: 'CSC 301 Data Structures Quiz', prompt: 'Quiz me on QuickSort vs MergeSort: time complexities, worst-case scenarios, and stability.' },
    { title: 'Basic Economics Quiz', prompt: 'Give me 3 practice scenario questions testing elasticity of demand and consumer surplus.' },
  ],
  timetable: [
    { title: '2-Week Exam Revision Plan', prompt: 'Create a balanced 14-day study schedule for 5 courses with morning and evening sessions.' },
    { title: 'Daily 4-Hour Focus Routine', prompt: 'Break down a 4-hour evening study session using the Pomodoro technique for engineering maths.' },
    { title: 'Weekend Cramming Strategy', prompt: 'How do I review 8 weeks of lecture slides efficiently over Saturday and Sunday without burnout?' },
  ],
  research: [
    { title: 'Postgraduate Scholarships', prompt: 'What are the top master’s scholarships open to Nigerian graduates in the UK and Canada?' },
    { title: 'Tech Internships in Lagos', prompt: 'What skills should a 300L computer science student in Nigeria build to secure a tech internship?' },
    { title: 'Student Budgeting Guide', prompt: 'Give me a realistic monthly budget breakdown for a student living in an off-campus hostel in Nigeria.' },
  ],
};

const defaultGreetings: Record<AIMode, string> = {
  copilot: "Hello! I'm your SkoollHub AI Copilot powered by Gemini. Ask me anything about your lecture notes, course concepts, or general campus life!",
  pastquestions: "Welcome to Exam Drill mode! Tell me your course code or topic, and I'll generate mock questions, test your knowledge, and explain the right answers.",
  timetable: "Need a custom study plan? Tell me which courses you're taking and when your exams or tests are, and I'll construct a high-yield study schedule.",
  research: "Live Research mode active! I can search current student resources, scholarship deadlines, internship advice, and verified academic references.",
};

export default function AIAssistantPage() {
  const [mode, setMode] = useState<AIMode>('copilot');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: defaultGreetings.copilot,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const switchMode = (newMode: AIMode) => {
    setMode(newMode);
    setMessages([
      {
        id: `greeting-${newMode}`,
        role: 'assistant',
        content: defaultGreetings[newMode],
        timestamp: 'Just now',
      },
    ]);
    setInput('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiMode = mode === 'research' ? 'web' : 'chat';
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: apiMode, conversationId }),
      });

      const data = await res.json().catch(() => null) as {
        reply?: string;
        error?: string;
        conversation?: { id: string };
        sources?: { title: string; url: string }[];
      } | null;

      if (res.ok && data?.reply) {
        if (data.conversation?.id) {
          setConversationId(data.conversation.id);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.reply!,
            sources: data.sources,
            timestamp: 'Just now',
          },
        ]);
      } else {
        // Fallback intelligent response for demonstration if Gemini API key is missing or errored
        const fallbackReply = generateFallbackResponse(query, mode);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: fallbackReply,
            timestamp: 'Just now',
          },
        ]);
      }
    } catch {
      const fallbackReply = generateFallbackResponse(query, mode);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `greeting-${mode}-${Date.now()}`,
        role: 'assistant',
        content: defaultGreetings[mode],
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 md:py-6 space-y-6">
      {/* Top Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-indigo-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Powered by Google Gemini 2.5
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              SkoollHub AI Study Copilot
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
              Your 24/7 personalized academic assistant for understanding complex course concepts, drilling past exam questions, and generating smart revision schedules.
            </p>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-2">
          {[
            { id: 'copilot', label: 'General Study Copilot', icon: Bot },
            { id: 'pastquestions', label: 'Past Questions & Drill', icon: BookOpenCheck },
            { id: 'timetable', label: 'Study Timetable Generator', icon: CalendarDays },
            { id: 'research', label: 'Live Campus Research', icon: Search },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchMode(item.id as AIMode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-md scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid: Prompts + Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Preset Prompts & Quick Suggestions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Suggested Prompts
            </h3>

            <div className="space-y-2">
              {promptPresets[mode].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(preset.prompt)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {preset.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Academic Success Tip Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 p-4 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30 text-xs">
            <p className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Pro Tip for A+ Grades
            </p>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Paste your specific syllabus topics or assignment prompts for customized step-by-step guidance.
            </p>
          </div>
        </div>

        {/* Right Column: Chat History & Input */}
        <div className="lg:col-span-3 rounded-3xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Chat Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-200'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Sources (if web search mode returned any) */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Cited Sources:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:text-indigo-600"
                            >
                              <span>{src.title || 'Source'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer bar with timestamp & copy button */}
                    {isAssistant && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>SkoollHub Gemini AI</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy response</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 p-4 text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>Skooll AI is analyzing and synthesizing your answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'copilot'
                    ? 'Ask any question about your courses, assignments, or campus...'
                    : mode === 'pastquestions'
                    ? 'Enter course code (e.g. MTH 101, GST 201) to start quiz...'
                    : mode === 'timetable'
                    ? 'List your courses and upcoming test dates...'
                    : 'Search campus news, cut-off marks, scholarship opportunities...'
                }
                disabled={loading}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-white dark:focus:bg-zinc-800 dark:focus:ring-indigo-900/40"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback intelligent simulator for local/offline testing
function generateFallbackResponse(query: string, mode: AIMode): string {
  const lower = query.toLowerCase();

  if (mode === 'pastquestions') {
    return `📝 Practice Quiz for: "${query}"\n\nQuestion 1: Which of the following is essential for establishing validity in empirical study design?\nA) Large font presentation\nB) Random sampling & control of extraneous variables\nC) Subjective opinion survey only\nD) Uncalibrated apparatus\n\n✅ Correct Answer: B (Random sampling & control)\n\nExplanation: In research methodology, random sampling prevents selection bias while control variables ensure that differences in the dependent variable are solely attributable to the independent variable.`;
  }

  if (mode === 'timetable') {
    return `📅 High-Yield Revision Schedule Generated:\n\n• 🌅 Morning (08:00 AM - 11:00 AM): High-Cognitive Problem Solving\n  - Focus on mathematical derivations, circuit analysis, or code implementation.\n\n• ☀️ Afternoon (01:00 PM - 03:30 PM): Concept Breakdown & Flashcards\n  - Active recall of definitions, case laws, and formulas.\n\n• 🌙 Evening (07:00 PM - 09:30 PM): Past Questions Simulation Drill\n  - Time yourself against past 5-year exam papers.\n\n💡 Remember to take a 10-minute break every 50 minutes!`;
  }

  if (lower.includes('backprop') || lower.includes('neural')) {
    return `🧠 Backpropagation Simplified:\n\n1. Forward Pass: The neural network makes a guess on input data (e.g., identifying a dog photo).\n2. Calculate Error: We measure how far off the guess was from reality using a Loss Function.\n3. Backward Pass: Using the calculus Chain Rule, gradients travel backward from output to input, updating each neuron's weights to minimize future error.\n\nAnalogy: Like calibrating a dart throw — if you hit 2 inches high, you adjust your elbow lower next throw.`;
  }

  if (lower.includes('constitution') || lower.includes('law')) {
    return `⚖️ Key Highlights of the 1999 Constitution of Nigeria:\n\n1. Section 1 (Supremacy): The Constitution is supreme and binding on all authorities throughout Nigeria. Any law inconsistent with its provisions is void to the extent of the inconsistency.\n2. Chapter IV (Fundamental Human Rights): Right to life, dignity of human person, personal liberty, fair hearing, and freedom of expression.\n3. Separation of Powers: Executive (Section 5), Legislature (Section 4), and Judiciary (Section 6).`;
  }

  return `Here is a structured academic breakdown regarding "${query}":\n\n1. Fundamental Concept:\nThis topic relates directly to core curriculum competencies. The primary principle rests upon systematic application and testing against empirical evidence.\n\n2. Key Takeaways to Remember for Exams:\n• Understand the core definition and historical context.\n• Be able to outline at least 3 distinct real-world applications.\n• Memorize the standard formulas or case law citations associated with it.\n\n3. Next Steps:\nWould you like me to generate 3 practice multiple-choice questions on this topic to test your retention?`;
}
