# Auth additions

- `middleware.ts` redirects unauthenticated users to `/login` (looks for `token` cookie).
- `app/login/page.tsx` performs login against `/api/login` and sets both cookie + localStorage.
- `app/signup/page.tsx` registers then logs in automatically.
- `lib/withAuth.tsx` exposes `withAuth(Component)` HOC to guard client components.
- `components/Protected.tsx` wrapper to guard children.

Middleware protects server navigation; HOC/Protected add client-side safety when rendering nested components.
