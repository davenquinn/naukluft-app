all:
	npm --prefix frontend install --legacy-peer-deps
	make database && npm --prefix frontend run start

# Create and run the database
database:
	docker compose up --build -d
	docker compose logs -f

# Load data from local database that still is main
# into the Docker-managed version
load-data:
	scripts/load-data

.PHONY: database load-data