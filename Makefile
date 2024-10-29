all:
	docker build -t ghcr.io/davenquinn/naukluft-app/server:latest .
	#docker push ghcr.io/davenquinn/naukluft-app/server:latest

.PHONY: all
