'use client';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
}

export default function ChatList({ chats, activeChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="w-full md:w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Direct chats & roommate inquiries</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                isActive
                  ? 'bg-blue-50/60 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm shrink-0">
                {chat.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {chat.name}
                  </h4>
                  <span className="text-[10px] text-gray-400">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {chat.lastMessage}
                </p>
              </div>

              {chat.unread > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                  {chat.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}