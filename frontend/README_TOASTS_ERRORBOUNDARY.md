
# Toasts + Error Boundary (No external deps)

This app now uses a built‑in Toast system and hardened Error Boundaries that work in the Next.js App Router without external packages.

## What changed
- Removed `sonner` (client‑only) to avoid server import/runtime errors.
- `components/system/Toasts.tsx` now renders a local `<ToastProvider />`.
- `components/system/toast/ToastProvider.tsx` implements a minimal toast UI and `useToast()` hook.
- `components/system/ErrorEventsBridge.tsx` uses `useToast()` for unhandled rejections and `console.error` UX.
- `app/error.tsx` and `app/global-error.tsx` are client components and use `useToast()` where applicable.
- `package.json` no longer depends on `sonner`.

## How to use
```tsx
"use client";
import { useToast } from "@/components/system/Toasts";

export default function Demo() {
  const toast = useToast();
  return <button onClick={() => toast.success("It works!")}>Toast me</button>;
}
```

## Run
```
cd frontend
npm install
npm run dev
# or
npm run build && npm run start
```
