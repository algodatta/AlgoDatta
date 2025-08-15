# Convenience commands
.PHONY: up down init migrate seed dev smoke

up:
	docker compose up -d --build

down:
	docker compose down -v

init:
	pip install -r requirements.txt

migrate:
	python scripts/init_db.py --migrate-only

seed:
	python scripts/init_db.py --seed-only

dev:
	./run.sh

smoke:
	python scripts/smoke_http.py
