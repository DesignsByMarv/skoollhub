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

Sign-up confirmation links return to `/auth/confirm`, which establishes the
Supabase session before sending the user to the dashboard. In Supabase:

1. Enable email sign-ups and email confirmation under **Authentication →
   Providers → Email**.
2. Set the project **Site URL** to `https://skoollhub.netlify.app` and allow
   `https://skoollhub.netlify.app/auth/confirm` under **Authentication → URL
   Configuration → Redirect URLs**. Add `http://localhost:3000/auth/confirm`
   for local development.
3. Configure a custom SMTP provider under **Authentication → SMTP Settings**
   to send verification emails to users outside your Supabase organization.

Supabase's default email sender is for testing: it only sends to pre-authorized
team addresses and has a low sending limit. A resend button is available after
sign-up; repeated attempts are still subject to Supabase's email rate limits.

## AI assistant setup

The `/ai-assistant` page uses Gemini for chat and the existing Supabase
authentication/database for private, saved conversation history. Web search,
campus/social search, and research modes use Tavily to gather public sources
before Gemini responds.

The dashboard and `/feed` share the same Supabase-backed campus feed, including
category filters, posts, likes, comments, bookmarks, direct image/video
uploads, and opt-in device location sharing. The campus feed migrations also
create missing student profiles for existing email accounts and new signups
so they can publish posts and comments.

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for your
   Supabase project.
3. Set `GEMINI_API_KEY` to a server-side Gemini API key. `GEMINI_MODEL` is
   optional and defaults to `gemini-2.5-flash`.
4. Set `TAVILY_API_KEY` to enable the live-search modes. General chat does not
   require Tavily.
5. Apply the SQL files in `supabase/migrations/` to the same Supabase project,
   in filename order.

Keep `GEMINI_API_KEY` and `TAVILY_API_KEY` private: do not prefix them with
`NEXT_PUBLIC_` or expose them in client-side code. Add all four values to the
Netlify site's environment variables before deploying. AI chat requires a
signed-in, email-confirmed account.
