all: server/dist/* ui/dist/*
	rm -r -f dist/
	mkdir dist/
	cp server/dist/remote-audio-controller-server dist/remote-audio-controller-server
	cp server/dist/server.js.LICENSE.txt dist/server-license.txt
	mkdir dist/public/
	cp -r ui/dist/ dist/public/
	cd dist && tar -cvf remote-audio-controller * && gzip -S .tgz remote-audio-controller
	
ui-archive: ui/dist/*
	cd ui && npm run build
	cd ui/dist && tar -cvf remote-audio-controller-ui * && gzip -S .tgz remote-audio-controller-ui

ui/dist/*: ui/src/*
	cd ui && npm run build

server-archive: server/dist/*
	cd server && npm run build
	cd server/dist && tar -cvf remote-audio-controller-server server.js* && gzip -S .tgz remote-audio-controller-server

server/dist/*: server/src/*
	cd server && npm run build-exec

clean:
	rm -r -f dist/
	rm -r -f ui/dist
	rm -r -f server/dist