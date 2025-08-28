# AlgoDatta — Stabilization Patch (2025-08-28)

Apply:
```bash
unzip algodatta_stabilization_20250828.zip -d /tmp/algodatta_stable
rsync -av /tmp/algodatta_stable/frontend/app/ ./frontend/app/
rsync -av /tmp/algodatta_stable/frontend/components/UserMenu.tsx ./frontend/components/UserMenu.tsx

git add frontend/app frontend/components/UserMenu.tsx
git commit -m "chore(stable): add Suspense wrappers, fix ProfileClient dup var, add UserMenu fallback"
git push
```

Ensure env in frontend runtime:
- NEXT_PUBLIC_API_BASE
- NEXT_PUBLIC_BROKER_API_BASE

Rebuild:
```bash
docker compose -f docker-compose.yml -f /etc/algodatta/docker-compose.prod.yml up -d --build --remove-orphans
```
