if [ -e dist ]
then rm -r dist/
fi
mkdir dist

cp server/dist/* dist/
mkdir dist/public/
cp -r ui/dist/ dist/public/
cd dist
tar -cvf remote-audio-controller * && gzip -S .tgz remote-audio-controller