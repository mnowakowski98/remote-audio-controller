combined-archive: ui/dist/* server/dist/*
	./make-combined-archive.sh

ui-archive: ui/dist/*
	cd ui/dist/ && tar -cvf remote-audio-controller-ui * && gzip -S .tgz remote-audio-controller-ui

server-archive: server/dist/*
	cd server/dist/ && tar -cvf remote-audio-controller-server * && gzip -S .tgz remote-audio-controller-server

server-sea: server/src/*
	cd server && npm run build-sea

ui/dist/*: ui/node_modules/ ui/src/* server/dist/*
	cd ui && npm run build

server/dist/*: server/node_modules/ server/src/*
	cd server && npm run build

ui/node_modules/:
	cd ui && npm install

server/node_modules/:
	cd server && npm install
	
clean:
	rm -r -f dist/
	rm -r -f ui/dist/
	rm -r -f server/dist/