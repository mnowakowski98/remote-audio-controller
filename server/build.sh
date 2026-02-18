if [ -e dist ]
then rm -r dist/
fi

npx tsc
cp package.json package-lock.json dist/