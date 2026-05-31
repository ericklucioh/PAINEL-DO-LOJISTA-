SHELL := /bin/bash

COMPOSE ?= docker compose
BACKEND_DIR := back-painel
FRONTEND_DIR := front-painel

.PHONY: run-dev down-dev format format-check test

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

format:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run format ); \
	( cd $(FRONTEND_DIR) && npm run format )

format-check:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run format:check ); \
	( cd $(FRONTEND_DIR) && npm run format:check )

test:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run test:run )
