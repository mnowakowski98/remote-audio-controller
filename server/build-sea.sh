# Currently only builds executable on/for mac
if [ -e dist ]
then rm -r dist/*
fi
mkdir dist
npx webpack -c webpack.config.js
cd dist

node --experimental-sea-config ../sea-config.json
cp $(command -v node) remote-audio-controller-server-sea
codesign --remove-signature remote-audio-controller-server-sea
npx postject remote-audio-controller-server-sea NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA
codesign --sign - remote-audio-controller-server-sea