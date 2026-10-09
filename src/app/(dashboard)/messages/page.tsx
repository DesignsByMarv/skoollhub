'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  MessageCircle,
  Phone,
  Video,
  Paperclip,
  Send,
  Search,
  MoreVertical,
  Smile,
  Plus,
  File,
  Image as ImageIcon,
  Music,
  X,
  LoaderCircle,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  image?: string;
  video?: string;
  document?: { name: string; url: string };
  call?: { type: 'voice' | 'video'; duration: number };
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Hostel Plug OAU',
      avatar: '🏠',
      status: 'online',
      lastMessage: 'The self-contain near Asherifa is available',
      lastMessageTime: '10:42 AM',
      unreadCount: 2,
      messages: [
        { id: 'm1', sender: 'them', text: 'Hello! Are you looking for accommodation?', timestamp: '10:40 AM' },
        { id: 'm2', sender: 'me', text: 'Yes! Is it still available?', timestamp: '10:41 AM' },
        { id: 'm3', sender: 'them', text: 'The self-contain near Asherifa is available', timestamp: '10:42 AM' },
      ],
    },
    {
      id: '2',
      name: 'Tobi (Roommate)',
      avatar: '👨‍🎓',
      status: 'online',
      lastMessage: 'Lets link up! Same course.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      messages: [
        { id: 'm10', sender: 'me', text: 'Hey Tobi! Saw your profile.', timestamp: 'Yesterday' },
        { id: 'm11', sender: 'them', text: 'Lets link up! Same course.', timestamp: 'Yesterday' },
      ],
    },
  ]);

  const [selectedContactId, setSelectedContactId] = useState<string>('1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [ongoingCall, setOngoingCall] = useState<{ type: 'voice' | 'video'; with: string; duration: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContact?.messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedContact) return;

    setContacts(contacts.map(c => {
      if (c.id === selectedContactId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: `m${Date.now()}`,
              sender: 'me',
              text: text.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          lastMessage: text.trim(),
          lastMessageTime: 'now',
        };
      }
      return c;
    }));

    setMessageText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json() as { url: string };

        setContacts(contacts.map(c => {
          if (c.id === selectedContactId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m${Date.now()}`,
                  sender: 'me',
                  image: data.url,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json() as { url: string };

        setContacts(contacts.map(c => {
          if (c.id === selectedContactId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m${Date.now()}`,
                  sender: 'me',
                  video: data.url,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error('Video upload failed:', error);
    } finally {
      setIsUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json() as { url: string; filename: string };

        setContacts(contacts.map(c => {
          if (c.id === selectedContactId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m${Date.now()}`,
                  sender: 'me',
                  document: { name: data.filename, url: data.url },
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error('Document upload failed:', error);
    } finally {
      setIsUploading(false);
      if (documentInputRef.current) documentInputRef.current.value = '';
    }
  };

  const startCall = (type: 'voice' | 'video') => {
    if (!selectedContact) return;
    setOngoingCall({ type, with: selectedContact.name, duration: 0 });

    // Simulate call duration
    const interval = setInterval(() => {
      setOngoingCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
    }, 1000);

    // Auto-end call after 30 seconds for demo
    setTimeout(() => {
      clearInterval(interval);
      if (selectedContact) {
        setContacts(contacts.map(c => {
          if (c.id === selectedContactId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m${Date.now()}`,
                  sender: 'me',
                  call: { type, duration: 30 },
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          }
          return c;
        }));
      }
      setOngoingCall(null);
    }, 30000);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emojis = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😍', '🙏', '😢', '😡'];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <div className="w-full sm:w-80 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Messages</h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-zinc-400">
              <MessageCircle size={40} className="mb-2 opacity-30" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`w-full p-3 border-b border-slate-100 text-left transition dark:border-zinc-800 ${
                  selectedContactId === contact.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                    contact.status === 'online'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-slate-100 dark:bg-zinc-800'
                  }`}>
                    {contact.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{contact.name}</h3>
                      {contact.unreadCount > 0 && (
                        <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-1">{contact.lastMessage}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{contact.lastMessageTime}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="hidden sm:flex flex-col flex-1">
          {/* Chat Header */}
          <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-indigo-100 dark:bg-indigo-900/30">
                {selectedContact.avatar}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{selectedContact.name}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {selectedContact.status === 'online' ? '🟢 Online' : '⚪ Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startCall('voice')}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                title="Start voice call"
              >
                <Phone size={20} className="text-slate-600 dark:text-zinc-300" />
              </button>
              <button
                onClick={() => startCall('video')}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                title="Start video call"
              >
                <Video size={20} className="text-slate-600 dark:text-zinc-300" />
              </button>
              <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition">
                <MoreVertical size={20} className="text-slate-600 dark:text-zinc-300" />
              </button>
            </div>
          </div>

          {/* Call Overlay */}
          {ongoingCall && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">
                  {ongoingCall.type === 'video' ? '📹' : '📞'}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {ongoingCall.type === 'video' ? 'Video Call' : 'Voice Call'}
                </h3>
                <p className="text-slate-600 dark:text-zinc-300 mb-4">{ongoingCall.with}</p>
                <div className="text-3xl font-mono text-indigo-600 dark:text-indigo-400 mb-6">
                  {Math.floor(ongoingCall.duration / 60).toString().padStart(2, '0')}:
                  {(ongoingCall.duration % 60).toString().padStart(2, '0')}
                </div>
                <button
                  onClick={() => setOngoingCall(null)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  End Call
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedContact.messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white'
                  }`}
                >
                  {message.text && <p className="break-words">{message.text}</p>}

                  {message.image && (
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden mt-2">
                      <Image
                        src={message.image}
                        alt="Shared image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {message.video && (
                    <video
                      src={message.video}
                      controls
                      className="w-48 h-auto rounded-lg mt-2"
                    />
                  )}

                  {message.document && (
                    <a
                      href={message.document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-indigo-700 hover:bg-indigo-800'
                          : 'bg-white hover:bg-slate-50 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                      }`}
                    >
                      <File size={18} />
                      <span className="text-sm truncate">{message.document.name}</span>
                    </a>
                  )}

                  {message.call && (
                    <div className="flex items-center gap-2">
                      {message.call.type === 'video' ? (
                        <Video size={16} />
                      ) : (
                        <Phone size={16} />
                      )}
                      <span className="text-sm">
                        {message.call.type === 'video' ? 'Video' : 'Voice'} call • {Math.floor(message.call.duration / 60)}m
                        {message.call.duration % 60}s
                      </span>
                    </div>
                  )}

                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'me' ? 'text-indigo-100' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4">
            <div className="flex items-end gap-2">
              {/* Media Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMediaMenu(!showMediaMenu)}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <Plus size={20} className="text-slate-600 dark:text-zinc-300" />
                </button>

                {showMediaMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700">
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowMediaMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-sm"
                    >
                      <ImageIcon size={18} />
                      Image
                    </button>
                    <button
                      onClick={() => {
                        videoInputRef.current?.click();
                        setShowMediaMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-sm border-t border-slate-200 dark:border-zinc-700"
                    >
                      <Video size={18} />
                      Video
                    </button>
                    <button
                      onClick={() => {
                        documentInputRef.current?.click();
                        setShowMediaMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-sm border-t border-slate-200 dark:border-zinc-700"
                    >
                      <File size={18} />
                      Document
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <input
                  ref={documentInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocumentUpload}
                />
              </div>

              {/* Message Input */}
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(messageText)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />

              {/* Emoji Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <Smile size={20} className="text-slate-600 dark:text-zinc-300" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 border border-slate-200 dark:border-zinc-700">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageText(messageText + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage(messageText)}
                disabled={!messageText.trim() || isUploading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition"
              >
                {isUploading ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-slate-500 dark:text-zinc-400">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p>Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
