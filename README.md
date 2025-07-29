# Algo Trading Platform (Docker + Lightsail Ready)

A full-stack algorithmic trading platform using FastAPI (backend), React (frontend), and PostgreSQL.

## 🚀 Deployment (AWS Lightsail or any VPS)

### 1. Clone this Repo
```bash
git clone https://github.com/openai-sample/algo-trading-platform.git
cd algo-trading-platform
```

### 2. Set FERNET Secret Key
```bash
cd backend
cp .env.example .env
# Edit .env and set FERNET_SECRET_KEY
```

Generate key:
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 3. Run the app
```bash
docker-compose pull
docker-compose up -d
```

### 4. Access in browser
- Frontend: http://<your-server-ip>:3000
- Backend: http://<your-server-ip>:8000

---

✅ Uses pre-built DockerHub images: `algobot/backend` and `algobot/frontend`
