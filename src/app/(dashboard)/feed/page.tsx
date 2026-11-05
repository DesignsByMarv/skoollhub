'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, Compass, MessageCircle, Heart, PlusSquare, User,
  MoreHorizontal, Bookmark, Send, Smile, Sparkles, CheckCircle2
} from 'lucide-react';

const STORIES = [
  { id: 1, username: 'chchoitoi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', hasStory: true },
  { id: 2, username: 'gwangurl77', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', hasStory: true },
  { id: 3, username: 'mishka_so..', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', hasStory: true },
  { id: 4, username: 'clubsodab..', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', hasStory: true },
  { id: 5, username: 'vasudaydr..', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150', hasStory: true },
  { id: 6, username: 'hi_kik', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150', hasStory: true },
];

const SUGGESTIONS = [
  { id: 1, username: 'alex_anyways18', subtext: 'Suggested for you', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { id: 2, username: 'chantouflowergirl', subtext: 'Follows you', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { id: 3, username: 'gwangurl77', subtext: 'Followed by chantouflowergirl', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
  { id: 4, username: 'mishka_songs', subtext: 'Follows you', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 5, username: 'pierre_thecomet', subtext: 'Followed by mishka_songs + 6 more', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150' },
];

const POSTS = [
  {
    id: 'post-1',
    author: {
      username: 'tartinebakery',
      location: 'San Francisco, California',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    },
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    likes: 1248,
    caption: 'Freshly baked pies ready for the weekend study marathon at the central library! 🥧✨',
    commentsCount: 34,
    timeAgo: '2 HOURS AGO',
  },
  {
    id: 'post-2',
    author: {
      username: 'campus_life_oau',
      location: 'Obafemi Awolowo University, Ile-Ife',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    },
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    likes: 3410,
    caption: 'Group study session setup at the faculty library. Housing listings updated on SkoollHub today!',
    commentsCount: 89,
    timeAgo: '5 HOURS AGO',
  },
];

export default function HomePage() {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 hidden md:flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg shadow-sm">
              S
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">SkoollHub</span>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1 text-sm font-semibold">
            <Link href="/home" className="flex items-center gap-4 rounded-xl bg-indigo-50 px-3 py-3 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Home size={22} />
              <span>Home</span>
            </Link>

            <Link href="/explore" className="flex items-center gap-4 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
              <Compass size={22} />
              <span>Explore</span>
            </Link>

            <Link href="/messages" className="flex items-center gap-4 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
              <MessageCircle size={22} />
              <span>Messages</span>
            </Link>

            <Link href="/notifications" className="flex items-center gap-4 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
              <Heart size={22} />
              <span>Notifications</span>
            </Link>

            <button type="button" className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
              <PlusSquare size={22} />
              <span>Create</span>
            </button>

            <Link href="/profile" className="flex items-center gap-4 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
              <User size={22} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        {/* User Footer */}
        <div className="border-t border-slate-100 pt-4 dark:border-zinc-800 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-xs">
            S
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">azevedo_drdr</p>
            <p className="truncate text-[10px] text-slate-400 dark:text-zinc-500">Student Account</p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex justify-center py-8 px-4 sm:px-8">
        <div className="flex w-full max-w-[935px] gap-12">
          
          {/* Main Feed Column */}
          <div className="w-full max-w-[470px] space-y-6 mx-auto lg:mx-0">
            
            {/* Top Stories Bar */}
            <div className="flex gap-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 no-scrollbar">
              {STORIES.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                  <div className="p-0.5 rounded-full ring-2 ring-indigo-600">
                    <img
                      src={story.avatar}
                      alt={story.username}
                      className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 w-16 truncate text-center">
                    {story.username}
                  </span>
                </div>
              ))}
            </div>

            {/* Posts Feed */}
            {POSTS.map((post) => {
              const isLiked = likedPosts[post.id];
              return (
                <article key={post.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                  
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-0.5 rounded-full ring-2 ring-indigo-600/40">
                        <img
                          src={post.author.avatar}
                          alt={post.author.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          {post.author.username}
                          <CheckCircle2 size={12} className="text-indigo-600 fill-indigo-600/20" />
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">{post.author.location}</p>
                      </div>
                    </div>
                    <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Post Image */}
                  <div className="relative aspect-square w-full bg-slate-100 dark:bg-zinc-950">
                    <img
                      src={post.image}
                      alt="Post attachment"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-slate-700 dark:text-zinc-200">
                        <button
                          type="button"
                          onClick={() => toggleLike(post.id)}
                          className={`transition ${isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-indigo-600'}`}
                        >
                          <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button" className="hover:text-indigo-600">
                          <MessageCircle size={22} />
                        </button>
                        <button type="button" className="hover:text-indigo-600">
                          <Send size={22} />
                        </button>
                      </div>
                      <button type="button" className="text-slate-700 dark:text-zinc-200 hover:text-indigo-600">
                        <Bookmark size={22} />
                      </button>
                    </div>

                    {/* Likes Count */}
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {(post.likes + (isLiked ? 1 : 0)).toLocaleString()} likes
                    </p>

                    {/* Caption */}
                    <div className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white mr-1.5">{post.author.username}</span>
                      {post.caption}
                    </div>

                    {/* Comments */}
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 cursor-pointer">
                      View all {post.commentsCount} comments
                    </p>

                    <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 pt-1">
                      {post.timeAgo}
                    </p>
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex items-center border-t border-slate-100 px-3.5 py-2.5 dark:border-zinc-800">
                    <Smile size={18} className="text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                    <button type="button" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                      Post
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Sidebar Suggestions */}
          <aside className="w-80 hidden lg:block shrink-0 space-y-4">
            
            {/* Current User Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-sm shadow-sm">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">azevedo_drdr</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Azevedo</p>
                </div>
              </div>
              <button type="button" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Switch
              </button>
            </div>

            {/* Suggestions Box */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Suggestions For You</span>
                <button type="button" className="text-xs font-bold text-slate-900 dark:text-white hover:underline">
                  See All
                </button>
              </div>

              <div className="space-y-3">
                {SUGGESTIONS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="min-w-0 w-36">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.username}</p>
                        <p className="truncate text-[10px] text-slate-400 dark:text-zinc-500">{item.subtext}</p>
                      </div>
                    </div>
                    <button type="button" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Footer */}
            <div className="pt-6 text-[10px] text-slate-400 dark:text-zinc-600 space-y-2">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">Press</a>
                <a href="#" className="hover:underline">API</a>
                <a href="#" className="hover:underline">Jobs</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Locations</a>
              </div>
              <p>© 2026 SKOOLLHUB FROM MARV</p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}