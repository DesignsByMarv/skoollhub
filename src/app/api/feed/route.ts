import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const categories = ['Academic', 'Housing', 'Events', 'Marketplace'] as const;
type Category = (typeof categories)[number];

type Profile = {
  id: string;
  full_name: string;
  username: string;
  department: string | null;
  avatar_url: string | null;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getSignedInUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  return { supabase, user };
}

async function loadProfiles(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userIds: string[]
) {
  const distinctIds = [...new Set(userIds)];
  if (distinctIds.length === 0) return new Map<string, Profile>();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, department, avatar_url')
    .in('id', distinctIds);
  if (error) throw new Error(`Could not load student profiles: ${error.message}`);
  return new Map((data ?? []).map((profile) => [profile.id, profile as Profile]));
}

type NewNotification = {
  user_id: string;
  actor_id: string;
  post_id: string;
  comment_id?: string;
  title: string;
  body: string;
  type: 'like' | 'comment' | 'mention';
};

async function createNotifications(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  notifications: NewNotification[]
) {
  if (!notifications.length) return;
  const { error } = await supabase.from('notifications').insert(notifications);
  if (error) {
    console.error('Social notification insert failed:', error.message);
    throw new Error('Your feed action succeeded, but its notification could not be saved. Apply the latest Supabase migration and try again.');
  }
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getSignedInUser();
    if (!user || !user.email_confirmed_at) {
      return errorResponse('Please sign in with a confirmed email to view the campus feed.', 401);
    }

    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    if (postId) {
      if (!isUuid(postId)) return errorResponse('Invalid post id.', 400);
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('id, post_id, author_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) {
        console.error('Feed comments query failed:', error.message);
        return errorResponse('Could not load comments for this post.', 500);
      }

      const profiles = await loadProfiles(supabase, (comments ?? []).map((comment) => comment.author_id));
      return NextResponse.json({
        comments: (comments ?? []).map((comment) => {
          const profile = profiles.get(comment.author_id);
          return {
            id: comment.id,
            authorId: comment.author_id,
            author: profile?.full_name ?? 'Student',
            handle: profile?.username ?? 'student',
            text: comment.content,
            timestamp: comment.created_at,
          };
        }),
      });
    }

    const category = url.searchParams.get('category');
    if (category && category !== 'All' && !categories.includes(category as Category)) {
      return errorResponse('Choose a valid feed category.', 400);
    }

    let postsQuery = supabase
      .from('posts')
      .select('id, author_id, content, category, media_urls, media_type, location_lat, location_lng, likes_count, comments_count, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (category && category !== 'All') postsQuery = postsQuery.eq('category', category);

    const { data: posts, error: postsError } = await postsQuery;
    if (postsError) {
      console.error('Feed posts query failed:', postsError.message);
      return errorResponse('Could not load the campus feed.', 500);
    }

    const postIds = (posts ?? []).map((post) => post.id);
    const authorIds = (posts ?? []).map((post) => post.author_id);
    const [profiles, likesResult, bookmarksResult] = await Promise.all([
      loadProfiles(supabase, authorIds),
      postIds.length
        ? supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
        : Promise.resolve({ data: [], error: null }),
      postIds.length
        ? supabase.from('favourites').select('entity_id').eq('user_id', user.id).eq('entity_type', 'post').in('entity_id', postIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (likesResult.error || bookmarksResult.error) {
      console.error('Feed interaction state query failed:', likesResult.error?.message ?? bookmarksResult.error?.message);
      return errorResponse('Could not load your feed interactions.', 500);
    }

    const likedPostIds = new Set((likesResult.data ?? []).map((like) => like.post_id));
    const bookmarkedPostIds = new Set((bookmarksResult.data ?? []).map((bookmark) => bookmark.entity_id));

    return NextResponse.json({
      posts: (posts ?? []).map((post) => {
        const profile = profiles.get(post.author_id);
        return {
          id: post.id,
          isOwnPost: post.author_id === user.id,
          author: profile?.full_name ?? 'Student',
          handle: profile?.username ?? 'student',
          department: profile?.department ?? '',
          avatarUrl: profile?.avatar_url ?? null,
          timestamp: post.created_at,
          category: post.category,
          content: post.content,
          mediaUrl: post.media_urls?.[0] ?? null,
          mediaType: post.media_type === 'video' ? 'video' : post.media_type === 'image' ? 'image' : null,
          locationLat: post.location_lat,
          locationLng: post.location_lng,
          likesCount: post.likes_count ?? 0,
          commentsCount: post.comments_count ?? 0,
          isLiked: likedPostIds.has(post.id),
          isBookmarked: bookmarkedPostIds.has(post.id),
          comments: [],
        };
      }),
    });
  } catch (error) {
    console.error('Feed request failed:', error);
    return errorResponse('Could not process your feed request.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getSignedInUser();
    if (!user || !user.email_confirmed_at) {
      return errorResponse('Please sign in with a confirmed email to interact with the campus feed.', 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    if (!body || typeof body !== 'object') return errorResponse('Invalid request body.', 400);
    const payload = body as Record<string, unknown>;

    if (payload.action === 'create') {
      const content = typeof payload.content === 'string' ? payload.content.trim() : '';
      const category = payload.category;
      const mediaPath = typeof payload.mediaPath === 'string' ? payload.mediaPath : '';
      const locationLat = payload.locationLat;
      const locationLng = payload.locationLng;
      if (!content) return errorResponse('Write something before sharing your post.', 400);
      if (content.length > 5000) return errorResponse('Posts must be 5,000 characters or fewer.', 400);
      if (category !== null && (typeof category !== 'string' || !categories.includes(category as Category))) {
        return errorResponse('Choose a valid post category or leave it blank.', 400);
      }

      let mediaUrls: string[] = [];
      let mediaType: 'image' | 'video' | 'none' = 'none';
      if (mediaPath) {
        const expectedPath = new RegExp(
          `^${user.id}/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|png|gif|webp|mp4|webm|mov)$`,
          'i'
        );
        if (!expectedPath.test(mediaPath)) {
          return errorResponse('Upload media using the post composer before attaching it.', 400);
        }
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (!supabaseUrl) throw new Error('Supabase is not configured');
          const parsedUrl = new URL(supabaseUrl);
          mediaUrls = [`${parsedUrl.origin}/storage/v1/object/public/post-media/${mediaPath}`];
          mediaType = /\.(mp4|webm|mov)$/i.test(mediaPath) ? 'video' : 'image';
        } catch {
          return errorResponse('Could not attach the uploaded media.', 500);
        }
      }

      const validLatitude = locationLat === null
        ? null
        : typeof locationLat === 'number' && Number.isFinite(locationLat) ? locationLat : undefined;
      const validLongitude = locationLng === null
        ? null
        : typeof locationLng === 'number' && Number.isFinite(locationLng) ? locationLng : undefined;
      if (validLatitude === undefined || validLongitude === undefined) {
        return errorResponse('Location coordinates must be valid numbers.', 400);
      }
      if ((validLatitude === null) !== (validLongitude === null)) {
        return errorResponse('A location needs both latitude and longitude.', 400);
      }
      if (validLatitude !== null && validLongitude !== null && (
        validLatitude < -90 || validLatitude > 90 || validLongitude < -180 || validLongitude > 180
      )) {
        return errorResponse('Location coordinates are out of range.', 400);
      }

      const { data: createdPost, error } = await supabase.from('posts').insert({
        author_id: user.id,
        content,
        category,
        media_urls: mediaUrls,
        media_type: mediaType,
        location_lat: validLatitude,
        location_lng: validLongitude,
      }).select('id').single();
      if (error) {
        console.error('Feed post creation failed:', error.message);
        return errorResponse('Could not publish your post. Please try again.', 500);
      }
      const usernames = [...new Set([...content.matchAll(/@([a-z0-9_]{3,24})/gi)].map((match) => match[1].toLowerCase()))];
      if (usernames.length) {
        const { data: mentionedProfiles, error: mentionLookupError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('username', usernames);
        if (mentionLookupError) {
          console.error('Post mention lookup failed:', mentionLookupError.message);
          return errorResponse('Your post was published, but mentions could not be resolved.', 500);
        }
        try {
          await createNotifications(supabase, (mentionedProfiles ?? [])
            .filter((profile) => profile.id !== user.id)
            .map((profile) => ({
              user_id: profile.id,
              actor_id: user.id,
              post_id: createdPost.id,
              title: 'You were mentioned',
              body: 'Someone mentioned you in a post.',
              type: 'mention' as const,
            })));
        } catch (notificationError) {
          return errorResponse(notificationError instanceof Error ? notificationError.message : 'Could not save post mention notifications.', 500);
        }
      }
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (!isUuid(payload.postId)) return errorResponse('Invalid post id.', 400);
    const postId = payload.postId;

    if (payload.action === 'like') {
      if (typeof payload.isLiked !== 'boolean') return errorResponse('A like state is required.', 400);
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .maybeSingle();
      if (postError) {
        console.error('Feed like post lookup failed:', postError.message);
        return errorResponse('Could not update your like. Please try again.', 500);
      }
      if (!post) return errorResponse('This post is no longer available.', 404);

      const { data: priorLike, error: priorLikeError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (priorLikeError) {
        console.error('Feed like state query failed:', priorLikeError.message);
        return errorResponse('Could not update your like. Please try again.', 500);
      }
      const result = payload.isLiked
        ? await supabase.from('post_likes').upsert(
            { post_id: postId, user_id: user.id },
            { onConflict: 'post_id,user_id', ignoreDuplicates: true }
          )
        : await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      if (result.error) {
        console.error('Feed like update failed:', result.error.message);
        return errorResponse('Could not update your like. Please try again.', 500);
      }
      if (payload.isLiked && !priorLike && post.author_id !== user.id) {
        try {
          await createNotifications(supabase, [{
            user_id: post.author_id,
            actor_id: user.id,
            post_id: postId,
            title: 'New like',
            body: 'Someone liked your post.',
            type: 'like',
          }]);
        } catch (notificationError) {
          return errorResponse(notificationError instanceof Error ? notificationError.message : 'Could not save the like notification.', 500);
        }
      }
      return NextResponse.json({ success: true });
    }

    if (payload.action === 'bookmark') {
      if (typeof payload.isBookmarked !== 'boolean') return errorResponse('A bookmark state is required.', 400);
      const result = payload.isBookmarked
        ? await supabase.from('favourites').upsert(
            { user_id: user.id, entity_type: 'post', entity_id: postId },
            { onConflict: 'user_id,entity_type,entity_id', ignoreDuplicates: true }
          )
        : await supabase.from('favourites').delete()
            .eq('user_id', user.id)
            .eq('entity_type', 'post')
            .eq('entity_id', postId);
      if (result.error) {
        console.error('Feed bookmark update failed:', result.error.message);
        return errorResponse('Could not update your bookmark. Please try again.', 500);
      }
      return NextResponse.json({ success: true });
    }

    if (payload.action === 'comment') {
      const content = typeof payload.content === 'string' ? payload.content.trim() : '';
      if (!content) return errorResponse('Write a comment before posting it.', 400);
      if (content.length > 1000) return errorResponse('Comments must be 1,000 characters or fewer.', 400);
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .maybeSingle();
      if (postError) {
        console.error('Feed comment post lookup failed:', postError.message);
        return errorResponse('Could not publish your comment. Please try again.', 500);
      }
      if (!post) return errorResponse('This post is no longer available.', 404);

      const { data: comment, error } = await supabase.from('post_comments').insert({
        post_id: postId,
        author_id: user.id,
        content,
      }).select('id').single();
      if (error) {
        console.error('Feed comment creation failed:', error.message);
        return errorResponse('Could not publish your comment. Please try again.', 500);
      }
      const usernames = [...new Set([...content.matchAll(/@([a-z0-9_]{3,24})/gi)].map((match) => match[1].toLowerCase()))];
      const { data: mentionedProfiles, error: mentionLookupError } = usernames.length
        ? await supabase.from('profiles').select('id, username').in('username', usernames)
        : { data: [], error: null };
      if (mentionLookupError) {
        console.error('Comment mention lookup failed:', mentionLookupError.message);
        return errorResponse('Your comment was posted, but mentions could not be resolved.', 500);
      }

      const notificationByUser = new Map<string, NewNotification>();
      if (post.author_id !== user.id) {
        notificationByUser.set(post.author_id, {
          user_id: post.author_id,
          actor_id: user.id,
          post_id: postId,
          comment_id: comment.id,
          title: 'New comment',
          body: content.slice(0, 160),
          type: 'comment',
        });
      }
      for (const mentionedProfile of mentionedProfiles ?? []) {
        if (mentionedProfile.id === user.id) continue;
        notificationByUser.set(mentionedProfile.id, {
          user_id: mentionedProfile.id,
          actor_id: user.id,
          post_id: postId,
          comment_id: comment.id,
          title: 'You were mentioned',
          body: `Someone mentioned @${mentionedProfile.username} in a comment.`,
          type: 'mention',
        });
      }
      try {
        await createNotifications(supabase, [...notificationByUser.values()]);
      } catch (notificationError) {
        return errorResponse(notificationError instanceof Error ? notificationError.message : 'Could not save comment notifications.', 500);
      }
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (payload.action === 'delete') {
      const { error, count } = await supabase
        .from('posts')
        .delete({ count: 'exact' })
        .eq('id', postId)
        .eq('author_id', user.id);
      if (error) {
        console.error('Feed post deletion failed:', error.message);
        return errorResponse('Could not delete your post. Please try again.', 500);
      }
      if (!count) return errorResponse('Post not found or you do not have permission to delete it.', 404);
      return NextResponse.json({ success: true });
    }

    return errorResponse('Choose a valid feed action.', 400);
  } catch (error) {
    console.error('Feed update failed:', error);
    return errorResponse('Could not process your feed update.', 500);
  }
}
