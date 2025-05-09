PROJECT_NAME=medcol_stack
DOCKER_COMPOSE=docker-compose
DOMAIN=docs.saludmedcol.com

.PHONY: up down restart logs check certs

up:
	$(DOCKER_COMPOSE) up --build -d
	@echo "🟢 Proyecto $(PROJECT_NAME) desplegado."

down:
	$(DOCKER_COMPOSE) down
	@echo "🔴 Proyecto detenido."

restart: down up

logs:
	$(DOCKER_COMPOSE) logs -f

check:
	curl -I https://$(DOMAIN)

certs:
	docker exec nginx-certbot certbot renew --dry-run
