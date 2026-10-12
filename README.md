This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication email setup

New sign-ups enter a six-digit email verification code in the app. In Supabase:

1. Enable email sign-ups and email confirmation under **Authentication →
   Providers → Email**.
2. Under **Authentication → Email Templates → Confirm signup**, include
   `{{ .Token }}` in the email body so users receive the six-digit code. Do not
   use only `{{ .ConfirmationURL }}`; that sends a link instead of a code.
3. Configure a custom SMTP provider under **Authentication → SMTP Settings**
   to send verification emails to users outside your Supabase organization.

Supabase's default email sender is for testing: it only sends to pre-authorized
team addresses and has a low sending limit. A resend button is available after
sign-up; repeated attempts are still subject to Supabase's email rate limits.
The `/auth/confirm` route remains available for any existing confirmation links.

## Campus feed, profiles, and messaging

The app's **Home** navigation opens `/feed`; selecting Home while already on
the feed reloads it. `/dashboard` redirects to the same feed. Housing,
roommate matching, classes/timetable, and the AI assistant currently show an
"not available right now" notice.

The feed supports posts, likes, comments, bookmarks, image/video uploads, and
optional location sharing. Comment authors link to their public profiles.
Profiles show a post grid, follower/following counts, and follow/message
actions. Feed suggestions let students discover and follow other students.

Direct chats persist text and file messages in Supabase and use Supabase
Realtime for incoming messages. Chats also support recorded voice notes and
one-to-one voice calls. Voice calls require HTTPS, microphone permission,
Supabase Realtime, and (for reliable calls across networks) a TURN provider.
Apply all migrations in `supabase/migrations`, including
`20261012000000_social_chat_realtime.sql`,
`20261012190000_signup_messaging_location.sql`, and
`20261012200000_call_signal_retention.sql`, before using follows, signup
metadata, unread-message updates, location-aware discovery, or calls in
production.

Registration collects country, phone, school, course/department, username,
and academic level. The school and course directories are curated starter
lists, not exhaustive national directories. Settings include account
discoverability, in-app message alerts, appearance, and opt-in approximate
location sharing. Location-based recommendations are only enabled after the
student explicitly opts in; stored coordinates are rounded to approximately
1 km. Nearby-place cards use a limited static campus-city directory.

For reliable cross-network voice calls, set `TURN_SERVER_URLS` (comma-separated
`turn:`/`turns:` URLs) and `TURN_SHARED_SECRET` to the TURN provider's REST
shared-secret values in Netlify's private environment variables, then
redeploy. Do not prefix the secret with `NEXT_PUBLIC_`. The app issues
temporary one-hour credentials through an authenticated server endpoint.

## AI provider setup

The AI page is temporarily unavailable in the app. The `/api/ai` endpoint is
still present; it requires `GEMINI_API_KEY` to run. `GEMINI_MODEL` is optional
and defaults to `gemini-2.5-flash`. `TAVILY_API_KEY` is only needed by the
endpoint's web-search modes.

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for your
   Supabase project.
3. Set `GEMINI_API_KEY` to a server-side Gemini API key. `GEMINI_MODEL` is
   optional and defaults to `gemini-2.5-flash`.
4. Set `TAVILY_API_KEY` to enable the live-search modes. General chat does not
   require Tavily.
5. Apply the SQL files in `supabase/migrations/` to the same Supabase project,
   in filename order.
6. Optionally set `TURN_SERVER_URLS` and `TURN_SHARED_SECRET` to enable
   reliable cross-network one-to-one voice calls.

Keep `GEMINI_API_KEY`, `TAVILY_API_KEY`, and `TURN_SHARED_SECRET` private: do
not prefix them with `NEXT_PUBLIC_` or expose them in client-side code. Add the
required values to the Netlify site's environment variables before deploying.
AI chat requires a signed-in, email-confirmed account.
