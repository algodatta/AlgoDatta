#!/usr/bin/env bash
set -e
export PYTHONPATH=.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
