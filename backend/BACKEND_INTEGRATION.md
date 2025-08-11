# Backend integration (SES + SNS + Suppressions)

Add these imports to your FastAPI entrypoint (e.g., `app/main.py`):
```python
from app.routes.sns_webhook import router as sns_router
from app.routes.admin_suppressions import router as admin_suppressions_router
from app.db.suppressions import init_tables

app = FastAPI()

@app.on_event("startup")
def _startup():
    init_tables()

app.include_router(sns_router)
app.include_router(admin_suppressions_router)
```

**requirements.txt** additions (compatible with FastAPI on pydantic v1 or v2):
```
httpx>=0.24.0
sqlalchemy>=2.0.0
pydantic>=1.10
sns-message-validator>=1.0.6  # optional
```

**ENV**:
```
DATABASE_URL=sqlite:///./algodatta.db   # or your Postgres URL
ADMIN_API_KEY=<strong-random-token>
ALLOWED_SNS_TOPICS=arn:aws:sns:ap-south-1:<ACCOUNT_ID>:algodatta-config-bounces,arn:aws:sns:ap-south-1:<ACCOUNT_ID>:algodatta-config-complaints
AWS_REGION=ap-south-1
SES_FROM_EMAIL=no-reply@algodatta.com
SES_CONFIG_SET_NAME=algodatta-config
```
