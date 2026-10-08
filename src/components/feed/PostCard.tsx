'use client';

import { useState } from 'react';

interface PostProps {
  post: {
    id: string;
    author: string;
    department: string;
    timestamp: string;
    category: string;
    content: string;
    likes: number;
    commentsCount: number;
  };
}

export default function PostCard({ post }: PostProps) {
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
            {post.author
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {post.author}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {post.department} • {post.timestamp}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
          {post.category}
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
        {post.content}
      </p>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 font-medium transition-colors ${
            hasLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'
          }`}
        >
          <span>{hasLiked ? '❤️' : '🤍'}</span>
          <span>{likes}</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 font-medium hover:text-blue-500 transition-colors"
        >
          <span>💬</span>
          <span>{post.commentsCount} Comments</span>
        </button>
      </div>
    </div>
  );
}