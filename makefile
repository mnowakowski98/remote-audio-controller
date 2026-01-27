all: server/dist/remote-audio-controller-server ui/dist/*
	./dist.sh
	
ui-archive: ui/dist/*
	cd ui && npm run build
	cd ui/dist && tar -cvf remote-audio-controller-ui * && gzip -S .tgz remote-audio-controller-ui

ui/dist/*: ui/src/*
	cd ui && npm run build

server-archive: server/dist/server.js
	cd server && npm run build
	cd server/dist && tar -cvf remote-audio-controller-server server.js* && gzip -S .tgz remote-audio-controller-server

server/dist/remote-audio-controller-server: server/dist/server.js
	cd server && npm run build-exec

server/dist/server.js: server/src/*
	cd server && npm run build

clean:
	rm -r -f dist/
	rm -r -f ui/dist
	rm -r -f server/dist