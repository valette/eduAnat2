
cp icon.* compiled/build
cp splash.* compiled/build
cp script.js compiled/build
cp package.json compiled/build

cd compiled/build
npm install --production
cd ..
