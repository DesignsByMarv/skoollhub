'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Bookmark,
  MapPin,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  LocateFixed,
  LoaderCircle,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Category = 'Academic' | 'Housing' | 'Events' | 'Marketplace';
type Comment = { id: string; author: string; handle: string; text: string; timestamp: string };
type Post = {
  id: string;
  isOwnPost: boolean;
  author: string;
  handle: string;
  department: string;
  avatarUrl: string | null;
  timestamp: string;
  category: Category | null;
  content: string;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  locationLat: number | null;
  locationLng: number | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
};

const categories: ('All' | Category)[] = ['All', 'Academic', 'Housing', 'Events', 'Marketplace'];
const maxMediaSize = 25 * 1024 * 1024;

async function getError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || 'Something went wrong. Please try again.';
}

function relativeTime(timestamp: string) {
  const elapsed = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(timestamp).toLocaleDateString();
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';
}

export default function CampusFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | Category>('All');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [newPostCategory, setNewPostCategory] = useState<Category | ''>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const mediaPreview = useMemo(
    () => mediaFile ? URL.createObjectURL(mediaFile) : null,
    [mediaFile]
  );

  useEffect(() => () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
  }, [mediaPreview]);

  const loadPosts = useCallback(async (category: 'All' | Category) => {
    try {
      const response = await fetch(`/api/feed?category=${encodeURIComponent(category)}`);
      if (!response.ok) throw new Error(await getError(response));
      const data = await response.json() as { posts: Post[] };
      setPosts(data.posts);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the campus feed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/feed?category=${encodeURIComponent(activeCategory)}`);
        if (!response.ok) throw new Error(await getError(response));
        const data = await response.json() as { posts: Post[] };
        if (active) {
          setPosts(data.posts);
          setError('');
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load the campus feed.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void fetchPosts();
    return () => {
      active = false;
    };
  }, [activeCategory]);

  const refreshPosts = () => loadPosts(activeCategory);

  const postAction = async (payload: Record<string, unknown>, postId?: string) => {
    setError('');
    if (postId) setBusyPostId(postId);
    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await getError(response));
      await refreshPosts();
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not update the feed.');
      return false;
    } finally {
      setBusyPostId(null);
    }
  };

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || isPosting) return;
    setIsPosting(true);
    setError('');
    let uploadedPath: string | null = null;
    let posted = false;
    try {
      if (mediaFile) {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Please sign in again before uploading media.');
        const extensionByType: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'video/mp4': 'mp4',
          'video/webm': 'webm',
          'video/quicktime': 'mov',
        };
        const extension = extensionByType[mediaFile.type];
        if (!extension || mediaFile.size > maxMediaSize) {
          throw new Error('Choose a supported image or video up to 25 MB.');
        }
        uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(uploadedPath, mediaFile, { contentType: mediaFile.type, upsert: false });
        if (uploadError) {
          if (uploadError.message.toLowerCase().includes('bucket not found')) {
            throw new Error('Post media storage is not set up yet. Apply the latest Supabase migrations, including 20261009020000_feed_media_location.sql, then try again.');
          }
          throw new Error(`Could not upload your media: ${uploadError.message}`);
        }
      }

      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          content,
          category: newPostCategory || null,
          mediaPath: uploadedPath,
          locationLat: location?.latitude ?? null,
          locationLng: location?.longitude ?? null,
        }),
      });
      if (!response.ok) throw new Error(await getError(response));
      posted = true;
      await refreshPosts();
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Could not publish your post.');
    } finally {
      if (!posted && uploadedPath) {
        const supabase = createClient();
        const { error: cleanupError } = await supabase.storage.from('post-media').remove([uploadedPath]);
        if (cleanupError) console.error('Failed to remove unused post media:', cleanupError.message);
      }
    }
    if (posted) {
      setContent('');
      setMediaFile(null);
      setNewPostCategory('');
      setLocation(null);
    }
    setIsPosting(false);
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError('Location sharing is not supported by this browser.');
      return;
    }
    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setIsLocating(false);
      },
      (locationError) => {
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? 'Allow location access in your browser to attach your current location.'
          : 'Could not get your location. Please try again.');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  const handleLoadComments = async (post: Post) => {
    const isExpanded = !expandedComments[post.id];
    setExpandedComments((current) => ({ ...current, [post.id]: isExpanded }));
    if (!isExpanded || post.comments.length) return;

    setBusyPostId(post.id);
    setError('');
    try {
      const response = await fetch(`/api/feed?postId=${encodeURIComponent(post.id)}`);
      if (!response.ok) throw new Error(await getError(response));
      const data = await response.json() as { comments: Comment[] };
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: data.comments } : item));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load comments.');
      setExpandedComments((current) => ({ ...current, [post.id]: false }));
    } finally {
      setBusyPostId(null);
    }
  };

  const handleComment = async (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault();
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    const posted = await postAction({ action: 'comment', postId, content: text }, postId);
    if (posted) {
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
      setExpandedComments((current) => ({ ...current, [postId]: true }));
      try {
        const response = await fetch(`/api/feed?postId=${encodeURIComponent(postId)}`);
        if (!response.ok) throw new Error(await getError(response));
        const data = await response.json() as { comments: Comment[] };
        setPosts((current) => current.map((item) => item.id === postId ? { ...item, comments: data.comments } : item));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Your comment was posted, but comments could not be refreshed.');
      }
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 select-text">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Share with your campus</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Post an update, ask a question, or share something useful.</p>
        </div>
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={5000}
            rows={3}
            placeholder="What’s happening on campus?"
            aria-label="Write a campus post"
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-indigo-950"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800">
              {mediaFile?.type.startsWith('video/') ? <Video size={15} /> : <ImagePlus size={15} />}
              {mediaFile ? 'Change media' : 'Add photo or video'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file && (!file.type.startsWith('image/') && !file.type.startsWith('video/'))) {
                    setError('Choose an image or video file.');
                    event.target.value = '';
                    return;
                  }
                  if (file && file.size > maxMediaSize) {
                    setError('Media files must be 25 MB or smaller.');
                    event.target.value = '';
                    return;
                  }
                  setError('');
                  setMediaFile(file);
                }}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleLocation}
              disabled={isLocating}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${location ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800'}`}
            >
              {isLocating ? <LoaderCircle size={15} className="animate-spin" /> : <LocateFixed size={15} />}
              {location ? 'Location attached' : 'Add current location'}
            </button>
            <select
              value={newPostCategory}
              onChange={(event) => setNewPostCategory(event.target.value as Category | '')}
              aria-label="Post category (optional)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="">No category</option>
              {categories.filter((category) => category !== 'All').map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!content.trim() || isPosting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPosting ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}
              Share post
            </button>
          </div>
          {(mediaPreview || location) && (
            <div className="flex flex-wrap items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-950">
              {mediaPreview && (
                <div className="relative">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} controls className="h-24 max-w-40 rounded-lg object-cover" />
                  ) : (
                    <img src={mediaPreview} alt="Selected post media preview" className="h-24 max-w-40 rounded-lg object-cover" />
                  )}
                  <button type="button" onClick={() => setMediaFile(null)} aria-label="Remove selected media" className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white">
                    <X size={12} />
                  </button>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <MapPin size={15} />
                  Current location will be visible on this post
                  <button type="button" onClick={() => setLocation(null)} aria-label="Remove location" className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900">
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter feed by category">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            aria-pressed={activeCategory === category}
            onClick={() => {
              setIsLoading(true);
              setActiveCategory(category);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${activeCategory === category ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-12 text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900">
          <LoaderCircle size={18} className="mr-2 animate-spin" />
          Loading campus posts…
        </div>
      ) : posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3 p-4">
                {post.avatarUrl ? (
                  <img src={post.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {initials(post.author)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{post.author}</span>
                    <span className="truncate text-xs text-slate-400">@{post.handle}</span>
                    <span className="text-xs text-slate-400">· {relativeTime(post.timestamp)}</span>
                  </div>
                  {post.department && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">{post.department}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {post.category && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{post.category}</span>}
                  {busyPostId === post.id && <LoaderCircle size={15} className="animate-spin text-slate-400" />}
                  {post.isOwnPost && (
                    <button
                      type="button"
                      aria-label="Delete post"
                      onClick={() => {
                        if (window.confirm('Delete this post? This cannot be undone.')) {
                          void postAction({ action: 'delete', postId: post.id }, post.id);
                        }
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <p className="whitespace-pre-wrap px-4 pb-4 text-sm leading-6 text-slate-800 dark:text-zinc-200">{post.content}</p>

              {post.locationLat !== null && post.locationLng !== null && (
                <a
                  href={`https://www.google.com/maps?q=${post.locationLat},${post.locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-4 mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  <MapPin size={14} />
                  View post location
                </a>
              )}

              {post.mediaUrl && (
                <div className="overflow-hidden border-y border-slate-100 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950">
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} controls className="max-h-[520px] w-full object-contain" />
                  ) : (
                    <img src={post.mediaUrl} alt="Post attachment" className="max-h-[520px] w-full object-contain" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-zinc-800">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => void postAction({ action: 'like', postId: post.id, isLiked: !post.isLiked }, post.id)}
                    aria-pressed={post.isLiked}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition ${post.isLiked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-rose-600 dark:text-zinc-400'}`}
                  >
                    <Heart size={17} fill={post.isLiked ? 'currentColor' : 'none'} />
                    {post.likesCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLoadComments(post)}
                    aria-expanded={!!expandedComments[post.id]}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300"
                  >
                    <MessageCircle size={17} />
                    {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void postAction({ action: 'bookmark', postId: post.id, isBookmarked: !post.isBookmarked }, post.id)}
                  aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
                  aria-pressed={post.isBookmarked}
                  className={`rounded-lg p-1.5 transition ${post.isBookmarked ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-zinc-800'}`}
                >
                  <Bookmark size={17} fill={post.isBookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {expandedComments[post.id] && (
                <div className="border-t border-slate-100 px-4 py-3 dark:border-zinc-800">
                  {post.comments.length > 0 ? (
                    <div className="mb-3 max-h-52 space-y-3 overflow-y-auto">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="text-xs leading-5">
                          <span className="mr-1.5 font-semibold text-slate-800 dark:text-zinc-100">{comment.author}</span>
                          <span className="text-slate-600 dark:text-zinc-300">{comment.text}</span>
                          <span className="ml-2 text-[10px] text-slate-400">{relativeTime(comment.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-3 text-xs text-slate-400">No comments yet. Start the conversation.</p>
                  )}
                  <form onSubmit={(event) => void handleComment(event, post.id)} className="flex items-center gap-2">
                    <input
                      value={commentDrafts[post.id] ?? ''}
                      onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                      maxLength={1000}
                      placeholder="Write a comment…"
                      aria-label={`Comment on ${post.author}'s post`}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <button
                      type="submit"
                      disabled={!commentDrafts[post.id]?.trim() || busyPostId === post.id}
                      className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                      aria-label="Post comment"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
            <ImageIcon size={21} />
          </span>
          <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">No posts here yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Be the first to share something with your campus.</p>
        </div>
      )}
    </section>
  );
}
