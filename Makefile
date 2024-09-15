all:
	npm --prefix frontend install --legacy-peer-deps
	make database && PROJECT_DIR=/Users/Daven/Projects/Naukluft npm --prefix frontend run watch:web

# Create and run the database
database:
	docker-compose up --build -d

# Load data from local database that still is main
# into the Docker-managed version
load-data:
	scripts/load-data

api:
	docker build -t ghcr.io/davenquinn/naukluft-app/server:latest .
	docker push ghcr.io/davenquinn/naukluft-app/server:latest

.PHONY: database load-data api
