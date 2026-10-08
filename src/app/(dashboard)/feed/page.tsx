'use client';

import { useState } from 'react';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';

const initialPosts = [
  {
    id: '1',
    author: 'Blessing Okon',
    department: 'Mass Communication',
    timestamp: '20 mins ago',
    category: 'Events',
    content: 'Is anyone attending the Annual Tech & Innovation Summit happening at the Main Auditorium tomorrow? Registration starts at 9 AM!',
    likes: 18,
    commentsCount: 4,
  },
  {
    id: '2',
    author: 'Farouk Hassan',
    department: 'Computer Science',
    timestamp: '2 hours ago',
    category: 'Academic',
    content: 'Just a quick heads up for 100L Science students: PHY 101 tutorial classes have been rescheduled to Thursday 4 PM at LT2.',
    likes: 34,
    commentsCount: 9,
  },
  {
    id: '3',
    author: 'Chidinma Egwu',
    department: 'Biochemistry',
    timestamp: '5 hours ago',
    category: 'Housing',
    content: 'Looking for a female roommate to inspect a 2-bedroom apartment at Tanke Junction tomorrow afternoon. Rent is ₦140,000/year each. DM if interested!',
    likes: 12,
    commentsCount: 6,
  },
];

const categories = ['All', 'General', 'Academic', 'Housing', 'Events', 'Marketplace'];

export default function FeedPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleAddPost = (content: string, category: string) => {
    const newPost = {
      id: Date.now().toString(),
      author: 'You (Current Student)',
      department: 'Your Department',
      timestamp: 'Just now',
      category: category,
      content: content,
      likes: 0,
      commentsCount: 0,
    };
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(
    (post) => activeCategory === 'All' || post.category === activeCategory
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Campus Feed & Community 📱
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Stay informed on campus updates, academic news, housing, and student posts.
        </p>
      </div>

      {/* Post Creation Box */}
      <CreatePost onAddPost={handleAddPost} />

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}