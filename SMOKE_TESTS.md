# Smoke Tests

### 1) Health
```bash
curl http://localhost:8000/api/health
```

### 2) Register (will email a verification link if SendGrid configured)
```bash
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d '{"email":"u1@example.com","password":"Pass@1234"}'
```

### 3) Verify (replace TOKEN)
```bash
curl "http://localhost:8000/api/auth/verify?token=TOKEN"
```

### 4) Login
```bash
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"u1@example.com","password":"Pass@1234"}'
```

### 5) Create Strategy (replace TOKEN)
```bash
curl -X POST http://localhost:8000/api/strategies -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"name":"NG Breakout","symbol":"NATURALGAS","timeframe":"5m","qty":1,"mode":"paper"}'
```

### 6) Deploy Strategy (replace TOKEN)
```bash
curl -X POST http://localhost:8000/api/strategies/1/deploy -H "Authorization: Bearer TOKEN"
```

### 7) Fire Webhook (replace SECRET)
```bash
curl -X POST http://localhost:8000/api/webhook/tradingview -H "Content-Type: application/json" -d '{"secret":"SECRET","strategy_id":1,"side":"BUY","qty":1,"idempotency_key":"1-TEST-123"}'
```

### 8) List Executions (replace TOKEN)
```bash
curl http://localhost:8000/api/executions -H "Authorization: Bearer TOKEN"
```
