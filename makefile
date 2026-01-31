combined-archive: ui/dist/* server/dist/*
	./make-combined-archive.sh

ui-archive: ui/dist/*
	cd ui && npm run build
	cd ui/dist/ && tar -cvf remote-audio-controller-ui * && gzip -S .tgz remote-audio-controller-ui

server-archive: server/dist/server.js
	cd server && npm run build
	cd server/dist/ && tar -cvf remote-audio-controller-server * && gzip -S .tgz remote-audio-controller-server

server-sea: server/src/*
	cd server && npm run build-sea

ui/dist/*: ui/src/* server/dist/*
	cd ui && npm run build

server/dist/*: server/src/*
	cd server && npm run build
	
clean:
	rm -r -f dist/
	rm -r -f ui/dist/
	rm -r -f server/dist/