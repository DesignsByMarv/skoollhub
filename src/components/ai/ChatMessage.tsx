'use client';

interface MessageProps {
  message: {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  };
}

export default function ChatMessage({ message }: MessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          🤖
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <span
          className={`block text-[10px] mt-1.5 ${
            isUser ? 'text-blue-100 text-right' : 'text-gray-400'
          }`}
        >
          {message.timestamp}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs shrink-0">
          👤
        </div>
      )}
    </div>
  );
}