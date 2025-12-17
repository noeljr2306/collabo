# Collabo

**Collabo** is a real-time code collaboration platform designed for developers. It enables seamless pair programming, team collaboration, and instant code sharing without the hassle of merge conflicts or complex setups.

**Note:** This project is currently under development. Features may be incomplete, and breaking changes are expected.

## Features

- **Live Code Collaboration**: Watch teammates code line-by-line in real-time, just like pair programming.
- **Real-Time Chat**: Integrated chat system for discussing, debugging, and brainstorming.
- **Secure Authentication**: Create or join rooms safely with a robust authentication system.
- **Join or Create Rooms**: Jump into existing sessions or start your own coding room with a simple room code.
- **Multi-Language Support**: Supports popular programming languages like JavaScript, Python, and more—no setup required.
- **Auto-Save & Sync**: Never lose progress; code syncs across devices in real-time.

## Getting Started

First, run the development server:

````bash
**Collabo** — collaborative, real-time code rooms built with Next.js and Convex

**Description:**
- Collabo is a live collaborative coding environment that provides shared code editing, chat, and session-based rooms. It uses Next.js (App Router) for the frontend UI and Convex for realtime backend functions and data sync. Auth is handled by Clerk (webhooks are wired into Convex).

**Tech stack:**
- **Frontend:** `Next.js 16` + React 19 (App Router)
- **Realtime / Database / Serverless functions:** `Convex`
- **Authentication:** `Clerk` (`@clerk/nextjs`)
- **Editor & runtime:** `Monaco`, `@webcontainer/api` (in repo as `lib/webcontainer.ts`)
- **State & utilities:** `zustand`, `react-hot-toast`, `sonner`, `xterm` for terminal panel

**Key features (in this repo):**
- Shared room pages under `app/room/[id]/` — room UI, presence, and messaging wired to Convex.
- Code editor component: `components/code-editor.tsx` (Monaco + Convex sync hooks).
- Chat & terminal panels: `components/chat-panel.tsx`, `components/terminal-panel.tsx`, `components/OutputPanel.tsx`.
- Convex functions and schemas in the `convex/` directory. Convex server-side webhook for Clerk is implemented in `convex/http.ts`.

**Quick setup (local)**
1. Install dependencies:

```bash
npm install
````

2. Required environment variables (create a `.env.local` at project root):

- `CLERK_FRONTEND_API` (Clerk config for Next.js)
- `CLERK_JWT_ISSUER_DOMAIN` or set up Clerk issuer domain in `convex/auth.config.ts` for Convex auth
- `CLERK_WEBHOOK_SECRET` (used by `convex/http.ts` to verify Clerk webhook requests)
- Convex does not require a manual env var for local dev (Convex CLI uses its own config), but when deploying you will use your Convex deployment URL as recommended by Convex.

Example `.env.local` (replace values):

```env
CLERK_FRONTEND_API=your-clerk-frontend-api
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-issuer.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...
```

3. Start the Next.js dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

**Convex**

- The project's Convex functions, schema, and generated client are under the `convex/` folder. Use the Convex CLI to push functions and manage deployments:

```bash
# run from project root
npx convex dev     # run local Convex dev server (if configured)
npx convex deploy  # push functions & schema to a Convex deployment
```

The repo includes a Clerk webhook handler in `convex/http.ts` that verifies Svix signatures and calls a Convex mutation `api.users.syncUser` when a user is created.

**Development notes**

- Routes & pages: see `app/` for the Next.js App Router implementation.
- UI components live in `components/` and UI primitives in `ui/`.
- Shared data and realtime hooks use the Convex React client (`convex/react` and `convex/_generated/api`).
- Editor state has a small local store at `store/useCodeEditorStore.ts` which is intended to plug into Convex mutations for persistence.

**Testing & linting**

- Lint: `npm run lint` (uses `eslint` / `eslint-config-next`).

**Deploy**

- Deploy the Next.js app and Convex functions separately (Convex has its own deployment). On Vercel, configure the Clerk and Convex environment variables in the Vercel dashboard.

**Where to look next**

- `app/room/[id]/page.tsx` — room mounting and Convex queries/mutations for a room.
- `convex/` — server functions, webhook, and schema.
- `components/code-editor.tsx` — Monaco integration and Convex sync hooks.

**Contributing**

- This project is in active development. If you contribute, please run the app locally and test room flows (create/join room, chat, code sync).

If you'd like, I can:

- Add a step-by-step `.env.local.example` file.
- Add a small CONTRIBUTING.md with recommended dev flow.

-- Project generated and maintained by the Collabo team
