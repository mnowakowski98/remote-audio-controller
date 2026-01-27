if [ -e dist ]
then rm -r dist/
fi
mkdir dist

cp server/dist/remote-audio-controller-server dist/remote-audio-controller-server
cp server/dist/server.js dist/
cp server/dist/server.js.LICENSE.txt dist/server-license.txt
mkdir dist/public/
cp -r ui/dist/ dist/public/
cd dist
ls -l
tar -cvf remote-audio-controller * && gzip -S .tgz remote-audio-controller