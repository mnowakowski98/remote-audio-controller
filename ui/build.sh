if [ -e src/models/ ]
then rm -r src/models/
fi
mkdir src/models/
cp -r ../server/src/models/ src/models/

tsc -b && vite build