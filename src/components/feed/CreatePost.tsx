'use client';

import { useState } from 'react';

interface CreatePostProps {
  onAddPost: (content: string, category: string) => void;
}

export default function CreatePost({ onAddPost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddPost(content, category);
    setContent('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening on campus? Share updates, ask questions, or post news..."
        rows={3}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
      />

      <div className="flex items-center justify-between gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs focus:outline-none"
        >
          <option value="General">General</option>
          <option value="Academic">Academic</option>
          <option value="Housing">Housing</option>
          <option value="Events">Events</option>
          <option value="Marketplace">Marketplace</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          Post Update 🚀
        </button>
      </div>
    </form>
  );
}