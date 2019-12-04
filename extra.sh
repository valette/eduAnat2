cp icon.* compiled/build
cp splash.* compiled/build
cp script.js compiled/build
cp package.json compiled/build
cp buildDate.txt compiled/build
cd compiled/build
npm install --production
cd ../..
