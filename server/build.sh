npx webpack -c webpack.config.js
node --experimental-sea-config sea-config.json
cp $(command -v node) dist/remote-audio-controller-server
codesign --remove-signature dist/remote-audio-controller-server
npx postject dist/remote-audio-controller-server NODE_SEA_BLOB dist/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA
codesign --sign - dist/remote-audio-controller-server