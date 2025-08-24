FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# If you truly need compilers for native builds, keep this; otherwise remove it.
# RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*

ARG CACHEBUST=0

COPY requirements.txt ./
# Single install step; cache-busted by the build arg you pass at build time
RUN echo "Cache bust=$CACHEBUST" && pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
