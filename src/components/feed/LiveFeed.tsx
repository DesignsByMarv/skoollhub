'use client';

import { useState } from 'react';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  timestamp: string;
  location?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
}

const storiesData = [
  { id: '1', name: 'Your Story', avatar: '🎓', hasUnseen: false },
  { id: '2', name: 'oau_vibe', avatar: '🔥', hasUnseen: true },
  { id: '3', name: 'unilorin_hub', avatar: '📚', hasUnseen: true },
  { id: '4', name: 'hostel_plug', avatar: '🏠', hasUnseen: true },
  { id: '5', name: 'tech_campus', avatar: '💻', hasUnseen: true },
  { id: '6', name: 'food_vendor', avatar: '🍔', hasUnseen: false },
];

export function CreatePostModal({
  isOpen,
  onClose,
  onAddPost,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: Post) => void;
}) {
  const [newText, setNewText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() && !mediaUrl.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'You',
      handle: 'your_account',
      avatar: '🎓',
      location: 'Campus Main',
      timestamp: 'Just now',
      content: newText,
      mediaUrl: mediaUrl.trim() ? mediaUrl : undefined,
      mediaType: 'image',
      likesCount: 0,
      isLiked: false,
      isBookmarked: false,
      comments: [],
    };

    onAddPost(newPost);
    setNewText('');
    setMediaUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Create New Post
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What's happening on campus?"
            rows={4}
            className="w-full text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 outline-none resize-none border border-transparent focus:border-blue-500"
          />

          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Image or Video URL (optional)..."
            className="w-full text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 outline-none border border-transparent focus:border-blue-500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
            >
              Share Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LiveFeed({
  posts,
  setPosts,
}: {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}) {
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const handleToggleLike = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: !p.isLiked ? p.likesCount + 1 : p.likesCount - 1 }
          : p
      )
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: Date.now().toString(), author: 'you', text: text.trim(), timestamp: 'Just now' },
              ],
            }
          : p
      )
    );

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <div className="w-full max-w-[470px] mx-auto space-y-6">
      {/* ---------------- STORIES TRAY ---------------- */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200 dark:border-gray-800">
        {storiesData.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
            <div
              className={`p-[2px] rounded-full ${
                story.hasUnseen
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-white dark:bg-black p-0.5 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-xl">
                  {story.avatar}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-gray-700 dark:text-gray-300 font-normal truncate w-16 text-center">
              {story.name}
            </span>
          </div>
        ))}
      </div>

      {/* ---------------- INSTAGRAM POST FEED ---------------- */}
      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full bg-white dark:bg-black rounded-full flex items-center justify-center text-sm">
                    {post.avatar}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                    {post.handle}
                  </h4>
                  {post.location && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {post.location}
                    </span>
                  )}
                </div>
              </div>
              <button className="text-gray-500 dark:text-gray-400 text-sm font-bold">•••</button>
            </div>

            {/* Media */}
            {post.mediaUrl && (
              <div className="w-full bg-black aspect-square flex items-center justify-center overflow-hidden">
                <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Actions */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id)}
                    className="text-xl transition-transform active:scale-125"
                  >
                    {post.isLiked ? '❤️' : '🤍'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="text-xl"
                  >
                    💬
                  </button>
                  <button type="button" className="text-xl">
                    🚀
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleBookmark(post.id)}
                  className="text-xl"
                >
                  {post.isBookmarked ? '🔖' : '📑'}
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                {post.likesCount} likes
              </div>

              <div className="text-xs text-gray-900 dark:text-white leading-normal">
                <span className="font-semibold mr-1.5">{post.handle}</span>
                {post.content}
              </div>

              {post.comments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  className="text-xs text-gray-500 dark:text-gray-400 block pt-0.5"
                >
                  View all {post.comments.length} comments
                </button>
              )}

              {activeCommentPostId === post.id && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-900">
                  {post.comments.map((c) => (
                    <div key={c.id} className="text-xs text-gray-800 dark:text-gray-200">
                      <span className="font-semibold mr-1.5">{c.author}</span>
                      {c.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-900">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  placeholder="Add a comment..."
                  className="w-full text-xs bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(post.id)}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  Post
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}