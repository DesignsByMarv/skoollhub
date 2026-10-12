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
- Sign-up collects country and phone, school, course/department, username, and
  academic level. Phone numbers are validated and saved in international
  format.
- Settings include profile/security controls, appearance, in-app message
  alerts, profile discoverability, and optional approximate-location sharing.
- Students can opt in to location-based suggestions. GPS coordinates are
  rounded to roughly 1 km before storage; map links do not include GPS
  coordinates. Nearby-place cards use a small, curated campus-city directory,
  not a live or nationwide places service.
- Chats support recorded voice notes and one-to-one voice calls. Calls use
  browser microphone access and Supabase Realtime signaling.

## Temporarily unavailable

The app currently displays an availability notice for AI assistance, housing,
roommate matching, and classes/timetable.

## Supabase setup

Apply every SQL migration in `supabase/migrations` to the production Supabase
project. The migration `20261012000000_social_chat_realtime.sql` adds the
follow graph, participant-protected chat access, the direct-chat RPC, message
attachment metadata, and the Realtime publication for messages. Without it,
follow and chat features will report setup errors.

The migration `20261012190000_signup_messaging_location.sql` adds the signup
profile fields, curated school directory, unread-message tracking, location
and discovery preferences, and call signaling. The subsequent
`20261012200000_call_signal_retention.sql` allows expired call signals to be
removed; call signaling rows older than 24 hours are cleaned up during call
requests. Apply migrations in filename order.

The existing `media` Storage bucket must be configured for authenticated
uploads. Message attachments and voice notes are stored there and referenced
from the message row. Enable the `call_signals` table in the Supabase Realtime
publication (the migration does this).

For reliable calls across different networks, configure your TURN provider's
REST/shared-secret credentials as **private server environment variables**:

- `TURN_SERVER_URLS`: comma-separated `turn:` or `turns:` server URLs.
- `TURN_SHARED_SECRET`: the provider's shared secret used to generate
  temporary one-hour credentials.

Add both in Netlify's site environment variables and redeploy. Never expose
the shared secret with a `NEXT_PUBLIC_` prefix. Calls need HTTPS, microphone
permission, working Supabase Realtime, and a TURN service for reliable
cross-network connectivity. Without TURN, direct connections may work on some
networks but are not guaranteed.

The signup school directory is a curated starter list, not a complete list of
all Nigerian tertiary institutions. Course/department choices are also a
starter list with an “Other” option.

## Current limitations

- Only one-to-one voice calls are implemented; video calls, typing indicators,
  presence/online status, and message deletion/editing are not implemented.
- Nearby places are curated static entries for a limited set of campus cities,
  not a live places database.
- AI, housing, roommate matching, and classes/timetable are unavailable in the
  UI for now.
