# HOTFIX v2 (conflict-safe)

1) Remove conflicting containers & start:
```bash
chmod +x scripts/*.sh
./scripts/up.sh
```

2) Verify:
```bash
curl -sS http://127.0.0.1:8000/api/healthz
```
