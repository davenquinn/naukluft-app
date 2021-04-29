all:
	npm --prefix frontend install --legacy-peer-deps
	make database && npm --prefix frontend run start

database:
	docker compose up --build -d
	docker compose logs -f

load-data:
	scripts/load-data

.PHONY: database load-data