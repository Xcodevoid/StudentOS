# StudentOS

The free, all-in-one productivity platform for ambitious high school students. Grades, exams, projects, and college prep — in one place.

## Features

- **Dashboard** — today's tasks, upcoming exams, progress overview, weekly goals, streaks, and badges
- **Academic Tracker** — classes, grades, a weighted/unweighted GPA calculator, and an assignment tracker
- **Exam Planner** — exam countdowns, study checklists, and a focus timer for AP, IB, A-Level, or any other exam track
- **Calendar** — assignments, exams, and deadlines on one month view
- **Project Portfolio** — log projects, achievements, competitions, research, and websites; get an auto-generated, printable portfolio page
- **College Prep Timeline** — activities, volunteering, internships, and application deadlines
- **Accounts** — sign in with email, Apple, or Google to sync progress across devices, or skip sign-in entirely and stay fully local

## Tech

- React + Vite + Tailwind CSS v4
- **Supabase** (Postgres + Auth) for accounts and cloud sync — entirely optional. Without it configured, the app runs exactly as a local-only, no-signup tool (`localStorage`, nothing ever leaves the browser).

## Getting started

```bash
npm install
npm run dev
```

Runs fully local with no setup — click "Continue without an account" and go. Everything below is only needed if you want real accounts and cross-device sync.

---

## Setting up accounts & cloud sync (optional)

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (pick a region close to most of your users).
2. In the dashboard, go to **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates every table, locks each one down with Row Level Security so a student can only ever read/write their own rows, and sets up a trigger that auto-creates a profile the moment someone signs up.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env` and fill in those two values:
   ```bash
   cp .env.example .env
   ```
5. Restart `npm run dev`. You should now see a sign-in screen instead of going straight into guest mode.

### 2. Turn on email sign-in

Email/password works out of the box once step 1 is done — nothing else to configure. By default Supabase requires email confirmation; you can turn that off for testing under **Authentication → Providers → Email → Confirm email**.

### 3. Turn on "Sign in with Apple"

Requires a paid Apple Developer account ($99/year).

1. In the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list), create an **App ID** (if you don't have one) with "Sign In with Apple" enabled, then create a **Services ID** — this is the identifier you'll give to web sign-in.
2. Configure the Services ID's "Sign In with Apple" settings with your domain and a return URL of `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Create a **Sign in with Apple private key** under Keys, and note your Team ID, Key ID, and the Services ID.
4. In Supabase: **Authentication → Providers → Apple**, enable it, and fill in the Services ID, Team ID, Key ID, and private key.

### 4. Turn on "Sign in with Google"

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Client ID (type: Web application).
2. Add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
3. In Supabase: **Authentication → Providers → Google**, enable it, and paste the Client ID and Client Secret.
4. **Heads up:** Google sign-in will not work for anyone browsing from mainland China without a VPN — `accounts.google.com` is blocked there regardless of where StudentOS itself is hosted. Email/password and Apple both work fine in China, so they're the ones to point Chinese students toward.

### 5. Add your production URL

Once deployed (see below), add your live URL under **Authentication → URL Configuration → Redirect URLs** in Supabase, or OAuth sign-in will fail on the deployed site even though it works on `localhost`.

---

## Deploying

### Cloudflare Pages (recommended — best real-world reachability from mainland China)

No hosting option is *guaranteed* accessible in China without China-based, ICP-licensed hosting (a legal filing tied to a Chinese business entity, not something scriptable here). Of the mainstream free options, Cloudflare tends to be the most reliably reachable in practice, so it's the default recommendation.

1. Push this repo to GitHub.
2. In the [Cloudflare Pages dashboard](https://dash.cloudflare.com), create a project connected to the repo.
3. Build command: `npm run build`. Output directory: `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Pages project settings (skip these if you're not using accounts).
5. Deploy. Add the resulting `*.pages.dev` URL (or your custom domain) to Supabase's redirect URL allowlist (step 5 above).

### Vercel

Import the repo at [vercel.com/new](https://vercel.com/new) — it auto-detects Vite. Build command `npm run build`, output directory `dist`. Add the same two environment variables. Generally works well globally but is less consistently reachable from mainland China than Cloudflare.

### GitHub Pages

1. `npm run build`
2. Deploy the `dist/` folder, e.g. with [`gh-pages`](https://www.npmjs.com/package/gh-pages):
   ```bash
   npm install -D gh-pages
   npx gh-pages -d dist
   ```
3. Enable Pages in your repo settings, pointing at the `gh-pages` branch. For env vars, since GitHub Pages has no server-side config, bake them in at build time via repo secrets + a GitHub Actions build step, or build locally with a `.env` file present before running `gh-pages`.

GitHub itself is intermittently throttled/blocked in mainland China, so this is the least reliable of the three for that audience — Cloudflare Pages is the better default if China reach matters.

The app uses hash-based routing and relative asset paths, so it works out of the box on any of the above with no extra routing config.

### For guaranteed China access

The only way to *guarantee* reachability in mainland China is hosting on a China-based cloud (Alibaba Cloud / Tencent Cloud) with an ICP license, which requires a Chinese business entity or ID-holder to file for. That's a legal/business process outside the scope of this codebase — worth pursuing separately if China reach becomes critical, but the Cloudflare Pages setup above is the practical starting point.
