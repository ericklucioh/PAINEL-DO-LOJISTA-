SHELL := /bin/bash

COMPOSE ?= docker compose
BACKEND_DIR := back-painel
FRONTEND_DIR := front-painel

.PHONY: run-dev down-dev

run-dev:
	@set -e; \
	$(COMPOSE) up -d; \
	trap 'kill $$BACKEND_PID $$FRONTEND_PID 2>/dev/null || true' INT TERM EXIT; \
	( cd $(BACKEND_DIR) && npm run dev ) & BACKEND_PID=$$!; \
	( cd $(FRONTEND_DIR) && npm run dev ) & FRONTEND_PID=$$!; \
	wait -n; \
	STATUS=$$?; \
	kill $$BACKEND_PID $$FRONTEND_PID 2>/dev/null || true; \
	wait $$BACKEND_PID $$FRONTEND_PID 2>/dev/null || true; \
	exit $$STATUS

down-dev:
	@$(COMPOSE) down
