# SkoollHub feature status

## Available now

- Home opens the campus feed; clicking Home while already on the feed reloads
  it, and `/dashboard` redirects to `/feed`.
- Students can create feed posts, like and bookmark posts, comment, and share
  images, videos, and optional location.
- Comment authors link to public student profiles.
- Profiles display a post grid, student details, follower/following totals,
  follow controls, and a message action.
- Follow suggestions are shown alongside the campus feed.
- Direct chats use the `chats`, `chat_participants`, and `messages` database
  tables. Text and uploaded file messages are persisted, and new messages are
  delivered with Supabase Realtime.

## Temporarily unavailable

The app currently displays an availability notice for AI assistance, housing,
roommate matching, and classes/timetable.

## Supabase setup

Apply every SQL migration in `supabase/migrations` to the production Supabase
project. The migration `20261012000000_social_chat_realtime.sql` adds the
follow graph, participant-protected chat access, the direct-chat RPC, message
attachment metadata, and the Realtime publication for messages. Without it,
follow and chat features will report setup errors.

The existing `media` Storage bucket must be configured for authenticated
uploads. Message attachments are stored there and referenced from the message
row.

## Current limitations

- Voice and video calls are not implemented.
- Read receipts, typing indicators, presence/online status, and message
  deletion/editing are not implemented.
- AI, housing, roommate matching, and classes/timetable are unavailable in the
  UI for now.
