if [ -e src/models/ ]
then rm -r src/models/*
fi
mkdir src/models/
cp -r ../server/src/models/ src/models/

if [ -e dist ]
then rm -r dist/*
fi

tsc -b && vite build