rm -r -f src/models/
mkdir src/models/
cp ../server/src/models/* src/models/
tsc -b && vite build