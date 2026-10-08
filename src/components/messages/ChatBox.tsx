'use client';

import { useState } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface ChatBoxProps {
  activeChat: {
    name: string;
    avatar: string;
    role: string;
  };
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatBox({ activeChat, messages, onSendMessage }: ChatBoxProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/40">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
          {activeChat.avatar}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {activeChat.name}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {activeChat.role}
          </p>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1 ${
                    isMe ? 'text-blue-100 text-right' : 'text-gray-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${activeChat.name}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs rounded-xl hover:bg-blue-700 transition-colors"
        >
          Send 💬
        </button>
      </form>
    </div>
  );
}