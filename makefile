all: server/dist/* ui/dist/*
	rm -r -f dist/
	mkdir dist/
	cp server/dist/remote-audio-controller-server dist/remote-audio-controller-server
	cp server/dist/server.js.LICENSE.txt dist/server-license.txt
	mkdir dist/public/
	cp -r ui/dist/ dist/public/
	cd dist && tar -cvf remote-audio-controller * && gzip -S .tgz remote-audio-controller

ui/dist/*:
	cd ui && npm run build

server/dist/*:
	cd server && npm run build

clean:
	rm -r -f dist/
	rm -r -f ui/dist
	rm -r -f server/dist